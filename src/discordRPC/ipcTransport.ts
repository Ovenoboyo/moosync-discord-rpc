import EventEmitter from 'events'
import net from 'net'
import { uuid4122 } from './utils'

const OPCodes = {
  HANDSHAKE: 0,
  FRAME: 1,
  CLOSE: 2,
  PING: 3,
  PONG: 4
}

type workingDecode = {
  full: string
  op: any
}

export class IPCTransport {
  private clientID: string
  private socket: net.Socket
  private eventHandler = new EventEmitter()

  constructor(clientID: string) {
    this.clientID = clientID
  }

  private getIPCPath(id) {
    if (process.platform === 'win32') {
      return `\\\\?\\pipe\\discord-ipc-${id}`
    }
    const {
      env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP }
    } = process

    const prefix = `${XDG_RUNTIME_DIR}/app/com.discordapp.Discord` || XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || '/tmp'
    return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`
  }

  private getIPC(id = 0): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      const path = this.getIPCPath(id)
      const onerror = () => {
        if (id < 10) {
          resolve(this.getIPC(id + 1))
        } else {
          reject(new Error('Could not connect'))
        }
      }
      const sock = net.createConnection(path, () => {
        sock.removeListener('error', onerror)
        resolve(sock)
      })
      sock.once('error', onerror)
    })
  }

  private onClose(e) {
    this.eventHandler.emit('close', e)
  }

  private async findEndpoint(tries = 0) {
    if (tries > 30) {
      throw new Error('Could not find endpoint')
    }
    const endpoint = `http://127.0.0.1:${6463 + (tries % 10)}`
    try {
      const r = await fetch(endpoint)
      if (r.status === 404) {
        return endpoint
      }
      return this.findEndpoint(tries + 1)
    } catch (e) {
      return this.findEndpoint(tries + 1)
    }
  }

  private encode(op, data) {
    data = JSON.stringify(data)
    const len = Buffer.byteLength(data)
    const packet = Buffer.alloc(8 + len)
    packet.writeInt32LE(op, 0)
    packet.writeInt32LE(len, 4)
    packet.write(data, 8, len)
    return packet
  }

  private decode(socket: net.Socket, working: workingDecode = { full: '', op: undefined }) {
    const packet = socket.read()
    if (!packet) {
      return
    }

    let raw: any
    if (working && working.full === '') {
      working.op = packet.readInt32LE(0)
      const len = packet.readInt32LE(4)
      raw = packet.slice(8, len + 8)
    } else {
      raw = packet.toString()
    }

    try {
      const data = JSON.parse(working.full + raw)
      return { data, op: working ? working.op : OPCodes.CLOSE }
    } catch (err) {
      working.full += raw
    }

    return this.decode(socket, working)
  }

  private handlePingCall(data: any) {
    this.send(data, OPCodes.PONG)
  }

  private async handleFrameCall(data: any) {
    if (!data) {
      return
    }
    if (data.cmd === 'AUTHORIZE' && data.evt !== 'ERROR') {
      try {
        const endpoint = await this.findEndpoint()
        this.eventHandler.emit('gotEndpoint', endpoint)
      } catch (e) {
        this.eventHandler.emit('error', e)
      }
    }
    this.eventHandler.emit('message', data)
  }

  private handleCloseCall(data?: any) {
    this.eventHandler.emit('close', data)
  }

  private async onReadable(d: { op: number; data: any }) {
    if (d) {
      if (d.op === OPCodes.PING) {
        return this.handlePingCall(d.data)
      }

      if (d.op === OPCodes.FRAME) {
        return this.handleFrameCall(d.data)
      }

      if (d.op === OPCodes.CLOSE) {
        return this.handleCloseCall(d.data)
      }
    }
    return this.handleCloseCall()
  }

  public async connect() {
    this.socket = await this.getIPC()
    this.socket.on('close', this.onClose.bind(this))
    this.socket.on('error', this.onClose.bind(this))
    this.eventHandler.emit('open')
    this.socket.write(
      this.encode(OPCodes.HANDSHAKE, {
        v: 1,
        client_id: this.clientID
      })
    )
    this.socket.pause()
    this.socket.on('readable', async () => {
      const data = await this.decode(this.socket)
      await this.onReadable(data)
    })
  }

  public send(data: any, op = OPCodes.FRAME) {
    if (this.socket) {
      this.socket.write(this.encode(op, data))
    }
  }

  public async close() {
    return new Promise<void>((r) => {
      this.eventHandler.once('close', r)
      this.send('', OPCodes.CLOSE)
      this.socket.end()
    })
  }

  public ping() {
    this.send(uuid4122(), OPCodes.PING)
  }

  public on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
    return this.eventHandler.on(event, listener)
  }

  public once(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
    return this.eventHandler.once(event, listener)
  }
}
