import { default as sources } from "./sources.json";
import Fuse from "fuse.js";
import { Source } from "./model";

export const fetchLibrary: () => Promise<Array<Source>> = () =>
  new Promise((res) => res(sources));

export class SearchSources {
  private _fuse: Fuse<Source>;
  private _collection: Array<Source>;

  constructor(sources: Array<Source>) {
    this._collection = sources;
    this._fuse = new Fuse(this._collection, {
      includeScore: true,
      threshold: 0.4,
      keys: ['name']
    })
  }

  public setCollection(sources: Array<Source>) {
    this._collection = sources;
    this._fuse.setCollection(this._collection);
  }

  public getCollection(): Array<Source> {
    return this._collection;
  }

  public search(query: string): Promise<Source[]> {
    return new Promise((resolve) => {
      const result = this._fuse.search(query);
      resolve(result.map(r => r.item));
    });
  }
}
