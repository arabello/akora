export type Source = {
  id: string;
  name: string;
  url: string;
};

export type Track = Source & {
  volume: number;
};
