import { PlayerState } from '@moosync/moosync-types/models';
import { Client as ClientRPC } from './discordRPC/client'

const clientID = '867757838679670784'

let register;
try {
    const { app } = require('electron');
    register = app.setAsDefaultProtocolClient.bind(app);
} catch (err) {
    try {
        register = require('register-scheme');
    } catch (e) { } // eslint-disable-line no-empty
}

if (typeof register !== 'function') {
    register = () => false;
}

register(clientID)

export const rpc = new ClientRPC(clientID, { transport: 'ipc' });

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
