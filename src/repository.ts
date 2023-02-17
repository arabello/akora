import { KeyBinding, Source, Track } from "./model";
import { default as sources } from "./sources.json";

export interface SourcesRepository {
  getSources: () => Promise<Array<Source>>;
}

export class StaticSourcesRepository implements SourcesRepository {
  public getSources(): Promise<Source[]> {
    return new Promise((res) => res(sources));
  }
}

export interface SessionRepository {
  setKeyBindings: (keyBindings: Array<KeyBinding<string>>) => Promise<void>;
  setTracks: (tracks: Array<Track>) => Promise<void>;
  getKeyBindings: () => Promise<Array<KeyBinding<string>>>;
  getTracks: () => Promise<Array<Track>>;
}

export class LocalStorageSessionRepository implements SessionRepository {
  constructor() {}

  private set(key: string, obj: Object) {
    window.localStorage.setItem(key, JSON.stringify(obj));
  }

  private get<T>(key: string): T | undefined {
    const obj = window.localStorage.getItem(key);
    if (!obj) {
      return undefined;
    }

    try {
      return JSON.parse(obj);
    } catch (_) {
      return undefined;
    }
  }

  public setKeyBindings(keyBindings: Array<KeyBinding<string>>): Promise<void> {
    this.set("keyBindings", keyBindings);
    return Promise.resolve();
  }

  public getKeyBindings(): Promise<Array<KeyBinding<string>>> {
    const keyBindings = this.get<Array<KeyBinding<string>>>("keyBindings");
    return keyBindings ? Promise.resolve(keyBindings) : Promise.reject();
  }

  public setTracks(tracks: Array<Track>): Promise<void> {
    this.set("tracks", tracks);
    return Promise.resolve();
  }

  public getTracks(): Promise<Array<Track>> {
    const tracks = this.get<Array<Track>>("tracks");
    return tracks ? Promise.resolve(tracks) : Promise.reject();
  }
}
