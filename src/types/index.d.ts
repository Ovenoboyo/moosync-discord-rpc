type Song = import("@moosync/moosync-types/models").Song
type SongQueue = import("@moosync/moosync-types/models").SongQueue

interface extensionAPI {
    getAllSongs(): Promise<Song[] | undefined>
    getCurrentSong(): Promise<Song | undefined>
    getVolume(): Promise<number | undefined>
    getTime(): Promise<number | undefined>
    getQueue(): Promise<SongQueue | undefined>
}

declare const api: extensionAPI