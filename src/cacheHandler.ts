import path from 'path'
import { promises as fsP } from 'fs'

type Cache = { [key: string]: { expiry: number; data: string } }

export class CacheHandler {
  protected cache: Cache = {}
  private cacheFile: string
  private cacheDir: string
  private tryJson = true

  constructor(cacheFile: string, tryJson = true) {
    this.cacheFile = path.resolve(__dirname, cacheFile)
    this.cacheDir = path.dirname(this.cacheFile)
    this.tryJson = tryJson
    this.readCache()
  }

  protected async dumpCache() {
    this.makeCacheDir()

    try {
      await fsP.writeFile(this.cacheFile, JSON.stringify(this.cache), { encoding: 'utf-8' })
    } catch (e) {
      console.error('Failed to write to cache at', this.cacheFile, e)
    }
  }

  protected async readCache() {
    this.makeCacheDir()

    try {
      const data = await fsP.readFile(this.cacheFile, { encoding: 'utf-8' })
      this.cache = JSON.parse(data)
    } catch (e) {
      console.warn(
        'Cache file',
        this.cacheFile,
        'does not exists (This may happen if the app is run for the first time).'
      )
      await this.dumpCache()
    }
  }

  public async addToCache(url: string, data: string) {
    try {
      if (this.tryJson && JSON.parse(data)) {
        const expiry = Date.now() + 2 * 60 * 60 * 1000
        this.cache[url] = { expiry, data }
        await this.dumpCache()
      }
    } catch (e) {
      console.warn('Data cant be parsed to JSON. Not storing in cache')
    }
  }

  public getCache(url: string): string | undefined {
    const data = this.cache[url]
    if (data && data.expiry > Date.now()) {
      return data.data
    }
  }

  private async makeCacheDir() {
    try {
      await fsP.access(this.cacheDir)
    } catch (_) {
      await fsP.mkdir(this.cacheDir, { recursive: true })
    }
  }

  public async clearCache() {
    this.cache = {}
    await this.dumpCache()
  }
}
