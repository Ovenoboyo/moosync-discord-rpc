import { PlayerState } from '@moosync/moosync-types/models';
import { Client as ClientRPC, register } from 'discord-rpc'

const clientID = '867757838679670784'

register(clientID)

export const rpc = new ClientRPC({ transport: 'ipc' });

export function login() {
    rpc.login({ clientId: clientID }).catch(e => console.log(e))
}

export async function setActivity(song: Song | undefined, status: PlayerState, time?: number) {
    if (!rpc && !song) {
        return;
    }

    await rpc.setActivity({
        details: `${song.title} ${status === 'PAUSED' ? '(Paused)' : ''}`,
        state: `${song.artists?.join(', ')} ${(song.artists?.length > 0) ? '-' : ''} ${song.album.album_name}`,
        largeImageKey: 'default',
        largeImageText: 'Moosync',
        instance: true,
        startTimestamp: (status === 'PLAYING') ? (time ?? Date.now()) : undefined,
    });
}
