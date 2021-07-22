import { MoosyncExtensionTemplate } from "@moosync/moosync-types";
import { PlayerState, Song, SongQueue } from "@moosync/moosync-types/models";
import { logger } from '@moosync/moosync-types'


export class MyExtension implements MoosyncExtensionTemplate {
    private logger: logger

    constructor(logger: logger) {
        this.logger = logger
    }

    onStarted(): void {
        this.logger.info('extension started')
    }

    onSongChanged(song: Song) {
        this.logger.info(song)
    }

    onPlayerStateChanged(state: PlayerState) {
        this.logger.info(state)
    }

    onSongQueueChanged(queue: SongQueue) {
        this.logger.info(queue)
    }

    onVolumeChanged(volume: number) {
        this.logger.info(volume)
    }
}