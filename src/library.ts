import { default as sources } from "./sources.json";

export type Source = {
  id: string;
  name: string;
  url: string;
};

export const fetchLibrary: () => Promise<Array<Source>> = () =>
  new Promise((res) => res(sources));
