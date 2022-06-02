import { PlayerState, Song } from '@moosync/moosync-types/models'
import { readFile } from 'fs/promises'
import { Client as ClientRPC } from './discordRPC/client'
import https from 'https'
import FormData from 'form-data'
import { CacheHandler } from './cacheHandler'

const clientID = '867757838679670784'

let rpc: ClientRPC | undefined

const cacheHandler = new CacheHandler('./upload.cache', true)
let apiKey = ''

export function login(onCloseCallback: () => void) {
  if (rpc) rpc.destroy()
  rpc = new ClientRPC(clientID, { transport: 'ipc' })
  return new Promise<void>((resolve, reject) => {
    rpc.once('ready', resolve)
    rpc.once('close', onCloseCallback)
    rpc.login({ clientId: clientID }).catch(reject)
  })
}

export async function close() {
  try {
    await rpc?.destroy()
  } catch (e) {
    logger.error(e)
  }
}

function getStateDetails(song: Song) {
  let str = ''
  if (song.artists) {
    str += song.artists.map((val) => val.artist_name).join(', ')
    str += ' - '
  }
  if (song.album && song.album.album_name) {
    str += song.album.album_name
  }

  return str
}

function isRemoteURL(url: string) {
  return url.startsWith('http')
}

async function uploadImage(path: string, id: string): Promise<ImgBB.ImgUploadResp | undefined> {
  try {
    const b64 = await readFile(path, { encoding: 'base64' })

    const form = new FormData()
    form.append('image', b64)

    const resp = await new Promise<string>((resolve, reject) => {
      let final = ''
      const req = https.request(
        {
          hostname: 'api.imgbb.com',
          path: `/1/upload?key=${apiKey}&name=${id}&expiration=${2 * 60 * 60 * 1000}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...form.getHeaders()
          }
        },
        (res) => {
          res.on('data', (d) => (final += d))
          res.on('error', reject)
          res.on('end', () => resolve(final))
        }
      )

      form.pipe(req)
      req.end()
    })

    return JSON.parse(resp)
  } catch (e) {
    console.error(e)
  }
}

export async function clearUploadCache() {
  await cacheHandler.clearCache()
}

export function setApiKey(key: string) {
  apiKey = key
}

export async function setActivity(song: Song | undefined, status: PlayerState, time?: number) {
  if (!rpc && !song) {
    return
  }

  const buttons: ActivityButton[] = []
  if (song.type === 'YOUTUBE') {
    song.playbackUrl &&
      buttons.push({ label: 'Show on Youtube', url: `https://www.youtube.com/watch?v=${song.playbackUrl}` })
  }

  if (song.url) {
    if (song.type === 'SPOTIFY') {
      buttons.push({ label: `Show on Spotify`, url: `https://open.spotify.com/track/${song.url}` })
    }
  }

  const url =
    song.song_coverPath_high ??
    song.song_coverPath_low ??
    song.album?.album_coverPath_high ??
    song.album.album_coverPath_low

  let finalURL: string | undefined

  if (url && !isRemoteURL(url)) {
    const data = cacheHandler.getCache(url)
    if (data) {
      finalURL = (JSON.parse(data) as ImgBB.ImgUploadResp).data.url
    } else {
      if (apiKey) {
        try {
          const resp = await uploadImage(url, song._id)
          if (resp.success) {
            cacheHandler.addToCache(url, JSON.stringify(resp))
            finalURL = resp.data.url
          }
        } catch (e) {
          console.error('Failed to upload image', e)
        }
      }
    }
  } else {
    finalURL = url
  }

  try {
    await rpc.setActivity({
      details: `${song.title} ${status === 'PAUSED' ? '(Paused)' : ''}`,
      state: getStateDetails(song),
      largeImageKey: finalURL || 'logo_border',
      largeImageText: song.title,
      smallImageKey: 'logo_circle',
      smallImageText: 'Moosync',
      instance: true,
      buttons,
      startTimestamp: status === 'PLAYING' ? time ?? Date.now() : undefined
    })
  } catch (e) {
    logger.error('error', 'Failed to set RichPresence activity', (e as Error).message)
  }
}
