import { MoosyncExtensionTemplate } from "@moosync/moosync-types";
import { PlayerState, Song, SongQueue } from "@moosync/moosync-types/models";

export class MyExtension implements MoosyncExtensionTemplate {
    onStarted(): void {
        logger.info('Extension started')
    }

    onSongChanged(song: Song) {
        console.log(song)
    }

    onPlayerStateChanged(state: PlayerState) {
        console.log(state)
    }

    onSongQueueChanged(queue: SongQueue) {
        console.log(queue)
    }

    onVolumeChanged(volume: number) {
        console.log(volume)
    }
}