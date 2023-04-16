import { Source } from "./model";
import { default as sources } from "./sourcesIndex.json";

export const getSources: () => Array<Source> = () => {
  if (
    Array.isArray(sources) &&
    sources.every(
      (s) =>
        typeof s.id === "string" &&
        typeof s.name === "string" &&
        typeof s.url === "string"
    )
  ) {
    return sources.sort((a, b) => a.name.localeCompare(b.name));
  }

  console.error("Invalid sources index");

  return [];
};

export interface SessionRepository<T> {
  is: (item: T) => item is T;
  write: (item: T) => void;
  read: () => T | undefined;
}

export class LocalStorageSessionRepository<T> implements SessionRepository<T> {
  private _key: string;
  is: (item: T) => item is T;

  constructor(key: string, is: (item: T) => item is T) {
    this._key = key;
    this.is = is;
  }

  public write(item: T) {
    window.localStorage.setItem(this._key, JSON.stringify(item));
  }

  public read(): T | undefined {
    const obj = window.localStorage.getItem(this._key);
    if (obj === null) {
      return undefined;
    }

    try {
      const o = JSON.parse(obj);
      return this.is(o) ? o : undefined;
    } catch (_) {
      return undefined;
    }
  }
}
