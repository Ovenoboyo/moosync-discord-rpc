import { MoosyncExtensionTemplate } from "@moosync/moosync-types";
import { PlayerState } from "@moosync/moosync-types/models";
import { rpc, setActivity, login } from './rpcHandler'


export class MyExtension implements MoosyncExtensionTemplate {
    private started = false
    private state: PlayerState = 'PAUSED'
    private song: Song | undefined | null

    onStarted(): void {
        rpc.on('ready', () => {
            this.started = true
        })
        login()
    }

    onSongChanged(song: Song | null) {
        this.song = song
        this.setActivity(0)
    }

    onPlayerStateChanged(state: PlayerState) {
        this.state = state
        this.setActivity()
    }

    private async setActivity(time?: number) {
        if (this.started && this.song) {
            const curTime = Date.now() - (time ?? await api.getTime()) * 1e3
            setActivity(this.song, this.state, curTime)
        }
    }
}