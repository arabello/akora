export type Source = {
  id: string;
  name: string;
  url: string;
};

export type KeyBinding<T> = {
  key: string;
  code: string;
  target: T;
};

export type Track = Source & {
  volume: number;
};
