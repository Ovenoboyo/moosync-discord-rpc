import { PlayerState, Song } from '@moosync/moosync-types/models'
import { Client as ClientRPC } from './discordRPC/client'

const clientID = '867757838679670784'

const rpc = new ClientRPC(clientID, { transport: 'ipc' })

export function login() {
  return new Promise<void>((resolve, reject) => {
    rpc.once('ready', resolve)
    rpc.login({ clientId: clientID }).catch(reject)
  })
}

export async function close() {
  try {
    await rpc.destroy()
  } catch (e) {
    logger.error(e)
  }
}

function getStateDetails(song: Song) {
  let str = ''
  if (song.artists) {
    str += song.artists.join(', ')
    str += ' - '
  }
  if (song.album && song.album.album_name) {
    str += song.album.album_name
  }

  return str
}

export async function setActivity(song: Song | undefined, status: PlayerState, time?: number) {
  if (!rpc && !song) {
    return
  }

  const buttons: ActivityButton[] = []
  if (song.type !== 'LOCAL') {
    song.playbackUrl &&
      buttons.push({ label: 'Show on Youtube', url: `https://www.youtube.com/watch?v=${song.playbackUrl}` })

    if (song.url)
      if (song.type === 'SPOTIFY')
        buttons.push({ label: `Show on Spotify`, url: `https://open.spotify.com/track/${song.url}` })
  }

  try {
    await rpc.setActivity({
      details: `${song.title} ${status === 'PAUSED' ? '(Paused)' : ''}`,
      state: getStateDetails(song),
      largeImageKey: 'logo_border',
      largeImageText: 'Moosync',
      instance: true,
      buttons,
      startTimestamp: status === 'PLAYING' ? time ?? Date.now() : undefined
    })
  } catch (e) {
    logger.error('error', 'Failed to set RichPresence activity', (e as Error).message)
  }
}
