import EventEmitter from 'events'
import { IPCTransport } from './ipcTransport'
import { uuid4122 } from './utils'

export class Client {
  private options: RPCClientOptions
  private eventHandler = new EventEmitter()
  private connectPromise: Promise<Client>

  private clientID: string
  private accessToken: string | null = null
  private transport: IPCTransport

  private expecting = new Map()

  private application: any
  private user: any

  private endpoint: string = 'https://discord.com/api'
  constructor(clientID: string, options?: RPCClientOptions) {
    this.options = options ?? { transport: 'ipc' }
    this.clientID = clientID

    this.setupIPCTransport()
  }

  private setupIPCTransport() {
    if (this.options.transport === 'ipc') {
      this.transport = new IPCTransport(this.clientID)
      this.transport.on('message', this.handleRPCMessage.bind(this))
      this.transport.on('gotEndpoint', (endpoint) => {
        this.endpoint = endpoint
      })
    }
  }

  private handleRPCMessage(data: RPCMessage) {
    if (data.cmd === 'DISPATCH' && data.evt === 'READY') {
      if (data.data.user) {
        this.user = data.data.user
      }
      this.eventHandler.emit('connected')
      return
    }

    if (this.expecting.has(data.nonce)) {
      const { resolve, reject } = this.expecting.get(data.nonce)
      data.evt === 'ERROR' ? reject(new Error(data.data.message)) : resolve(data.data)
      this.expecting.delete(data.nonce)
      return
    }

    this.eventHandler.emit(data.evt, data.data)
  }

  private async fetch(method: FetchMethods, path: string, data?: any) {
    const resp = await fetch(`${this.endpoint}${path}`, {
      method,
      body: data,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    })

    const body = await resp.json()
    if (!resp.ok) {
      throw new Error(`${resp.status}: ${body}`)
    }
    return body
  }

  private request(cmd: RPCCommands, args: any, evt?: Event): Promise<any> {
    return new Promise((resolve, reject) => {
      const nonce = uuid4122()
      this.transport.send({ cmd, args, evt, nonce })
      this.expecting.set(nonce, { resolve, reject })
    })
  }

  private getRejectTimeout(reject: (reason: any) => void) {
    const timeout = setTimeout(() => reject(new Error('RPC_CONNECTION_TIMEOUT')), 10e3)
    return timeout
  }

  private closeAllPromises() {
    this.expecting.forEach((e) => {
      e.reject(new Error('connection closed'))
    })
  }

  private async connect() {
    if (this.connectPromise) {
      return this.connectPromise
    }

    return (this.connectPromise = new Promise((resolve, reject) => {
      const timeout = this.getRejectTimeout(reject)

      this.eventHandler.once('connected', () => {
        clearTimeout(timeout)
        resolve(this)
      })

      this.transport.once('close', () => {
        this.closeAllPromises()
        this.eventHandler.emit('disconnected')
        reject(new Error('connection closed'))
      })
      this.transport.connect().catch(reject)
    }))
  }

  private authenticate(accessToken): Promise<void> {
    return this.request('AUTHENTICATE', { access_token: accessToken }).then(({ application, user }) => {
      this.accessToken = accessToken
      this.application = application
      this.user = user

      this.eventHandler.emit('ready')
    })
  }

  public async login(options: RPCLoginOptions): Promise<void> {
    let { accessToken } = options
    await this.connect()

    if (!options.scopes) {
      this.eventHandler.emit('ready')
      return
    }
    if (!accessToken) {
      this.accessToken = options.accessToken = await this.authorize(options)
    }
    return this.authenticate(accessToken)
  }

  private async authorize(args: RPCLoginOptions) {
    let rpcToken: string
    if (args.clientSecret && args.rpcToken) {
      const body = await this.fetch(
        'POST',
        '/oauth2/token/rpc',
        new URLSearchParams({ client_id: this.clientID, client_secret: args.clientSecret })
      )
      rpcToken = body.rpc_token
    }

    const { code } = await this.request('AUTHORIZE', {
      scopes: args.scopes,
      client_id: this.clientID,
      prompt,
      rpc_token: rpcToken
    })

    const response = await this.fetch(
      'POST',
      '/oauth2/token',
      new URLSearchParams({
        client_id: this.clientID,
        client_secret: args.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: args.tokenEndpoint
      })
    )

    return response.access_token
  }

  private parseDate(date?: Date): number | undefined {
    if (date) {
      const val = Math.round(date.getTime())
      if (val > 2147483647000) throw new RangeError('timestamp must fit into a unix timestamp')
      return val
    }
  }

  public async setActivity(args?: RichPresence, pid = process.pid) {
    args = args ?? {}

    let activity: IPCActivity = {
      state: args.state,
      details: args.details,
      instance: !!args.instance
    }

    if (args.buttons && args.buttons.length > 0) {
      activity.buttons = args.buttons
    }

    if (args.startTimestamp || args.endTimestamp) {
      activity.timestamps = {
        start: args.startTimestamp instanceof Date ? this.parseDate(args.startTimestamp) : args.startTimestamp,
        end: args.endTimestamp instanceof Date ? this.parseDate(args.endTimestamp) : args.endTimestamp
      }
    }

    activity.assets = {
      large_image: args.largeImageKey,
      large_text: args.largeImageText,
      small_image: args.smallImageKey,
      small_text: args.smallImageText
    }

    activity.party = {
      id: args.partyId,
      size: args.partySize && args.partyMax ? [args.partySize, args.partyMax] : undefined
    }

    // activity.secrets = {
    //     match: args.matchSecret,
    //     join: args.joinSecret,
    //     spectate: args.spectateSecret,
    // };

    return this.request('SET_ACTIVITY', {
      pid,
      activity
    })
  }

  public clearActivity(pid = process.pid) {
    return this.setActivity({}, pid)
  }

  public async destroy() {
    await this.setActivity({})
    await this.transport.close()
  }

  public on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
    return this.eventHandler.on(event, listener)
  }

  public once(event: string | symbol, listener: (...args: any[]) => void): EventEmitter {
    return this.eventHandler.once(event, listener)
  }
}
