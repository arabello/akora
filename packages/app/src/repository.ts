import { Source } from "./model";
import { default as sources } from "./sources.json";

export interface SourcesRepository {
  fetchSources: () => Promise<Array<Source>>;
}

export class StaticSourcesRepository implements SourcesRepository {
  public fetchSources(): Promise<Source[]> {
    return new Promise((res) => res(sources));
  }
}

export interface SessionRepository<T> {
  is: (item: T) => item is T;
  persist: (item: T) => Promise<void>;
  fetch: () => Promise<T>;
}

export class LocalStorageSessionRepository<T> implements SessionRepository<T> {
  private _key: string;
  is: (item: T) => item is T;

  constructor(key: string, is: (item: T) => item is T) {
    this._key = key;
    this.is = is;
  }

  public persist(item: T): Promise<void> {
    window.localStorage.setItem(this._key, JSON.stringify(item));
    return Promise.resolve();
  }

  public fetch(): Promise<T> {
    const obj = window.localStorage.getItem(this._key);
    if (!obj) {
      return Promise.reject();
    }

    try {
      const o = JSON.parse(obj);
      return this.is(o) ? Promise.resolve(o) : Promise.reject();
    } catch (_) {
      return Promise.reject();
    }
  }
}
