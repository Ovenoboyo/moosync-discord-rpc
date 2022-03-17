import { MoosyncExtensionTemplate } from '@moosync/moosync-types'
import { PlayerState, Song } from '@moosync/moosync-types/models'
import { setActivity, login, close } from './rpcHandler'

export class MyExtension implements MoosyncExtensionTemplate {
  private started = false
  private state: PlayerState = 'PAUSED'
  private song: Song | undefined | null

  async onStarted() {
    await this.login()
  }

  private async login() {
    logger.debug('Trying to login to discord')

    try {
      await login(() => (this.started = false))
      logger.debug('Logged in successfully')
      this.started = true
      this.state = await api.getPlayerState()
      this.setActivity()
    } catch (e) {
      logger.error('Failed discord login', e)
    }
  }

  async onStopped() {
    logger.debug('Closing discord connection')
    await close()
  }

  async onSongChanged(song: Song | null) {
    if (!this.started) {
      await this.login()
    }

    this.song = song
    this.setActivity(0)
  }

  async onPlayerStateChanged(state: PlayerState) {
    if (!this.started) {
      await this.login()
    }

    this.state = state
    this.setActivity()
  }

  async onSeeked(time: number) {
    if (!this.started) {
      await this.login()
    }

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
        const curTime = Date.now() - (time ?? (await api.getTime())) * 1e3
        setActivity(this.song, this.state, curTime)
      }
    }
  }
}
