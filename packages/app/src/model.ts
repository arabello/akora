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
