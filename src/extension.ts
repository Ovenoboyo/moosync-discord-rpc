import { MoosyncExtensionTemplate } from "@moosync/moosync-types";
import { PlayerState, Song } from "@moosync/moosync-types/models";
import { listenOnReady, setActivity, login, close } from './rpcHandler'


export class MyExtension implements MoosyncExtensionTemplate {
    private started = false
    private state: PlayerState = 'PAUSED'
    private song: Song | undefined | null

    onStarted(): void {
        listenOnReady(async () => {
            this.started = true
            this.state = await api.getPlayerState()
            this.setActivity()
        })
        login()
    }

    onStopped() {
        close()
    }

    onSongChanged(song: Song | null) {
        this.song = song
        this.setActivity(0)
    }

    onPlayerStateChanged(state: PlayerState) {
        this.state = state
        this.setActivity()
    }

    onSeeked(time: number) {
        this.setActivity(time)
    }

    private async requestSong() {
        this.song = await api.getCurrentSong()
    }

    private async setActivity(time?: number) {
        if (this.started) {
            // Request song from app
            // This can still be null
            if (!this.song) await this.requestSong()

            if (this.song) {
                const curTime = Date.now() - (time ?? await api.getTime()) * 1e3
                setActivity(this.song, this.state, curTime)
            }
        }
    }
}