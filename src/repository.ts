import { KeyBinding, Source, Track } from "./model";

export interface Repository {
  getSources: () => Promise<Array<Source>>,
  getKeyBindings: <T>() => Promise<Array<KeyBinding<T>>>
  getTracks: () => Promise<Array<Track>>
}
