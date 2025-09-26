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
