import { PlayerState, Song } from '@moosync/moosync-types/models';
import { Client as ClientRPC } from './discordRPC/client'

const clientID = '867757838679670784'

const rpc = new ClientRPC(clientID, { transport: 'ipc' });

export function listenOnReady(callback: Function) {
    rpc.once('ready', () => {
        callback()
    })
}

export function login() {
    rpc.login({ clientId: clientID }).catch(e => console.log(e))
}

export function close() {
    rpc.clearActivity()
    rpc.destroy()
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
        return;
    }

    try {
        await rpc.setActivity({
            details: `${song.title} ${status === 'PAUSED' ? '(Paused)' : ''}`,
            state: getStateDetails(song),
            largeImageKey: 'default',
            largeImageText: 'Moosync',
            instance: true,
            startTimestamp: (status === 'PLAYING') ? (time ?? Date.now()) : undefined,
        });
    } catch (e) {
        logger.log('error', 'Failed to set RichPresence activity: %j', (e as Error).message)
    }
}
