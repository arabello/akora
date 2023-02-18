export type Source = {
  id: string;
  name: string;
  url: string;
};

export type Track = Source & {
  volume: number;
};

export const isTrack = (obj: any): obj is Track =>
  typeof obj.id === "string" &&
  typeof obj.name === "string" &&
  typeof obj.url === "string";

export type KeyBinding<T> = {
  key: string;
  code: string;
  target: T;
};

export const isKeyBinding = <T>(obj: any): obj is KeyBinding<T> =>
  typeof obj.key === "string" &&
  typeof obj.code === "string" &&
  obj.target !== undefined;
