import Fuse from "fuse.js";
import { default as jsonSources } from "./sourcesIndex.json";

export type Source = {
  id: string;
  name: string;
  url: string;
};

export const isSource = (obj: any): obj is Source =>
  typeof obj.id === "string" &&
  typeof obj.name === "string" &&
  typeof obj.url === "string";

export const sources: Source[] =
  (Array.isArray(jsonSources) &&
    jsonSources.every(isSource) &&
    jsonSources.sort((a, b) => a.name.localeCompare(b.name))) ||
  [];

const fuse = new Fuse(sources, {
  includeScore: true,
  threshold: 0.4,
  keys: ["name"],
});

export const search = (query: string) => fuse.search(query).map((r) => r.item);
