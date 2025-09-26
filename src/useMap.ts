import { useState } from "react";

export type Put<K, V> = (key: K, value: V) => void;
export type Delete<K> = (key: K) => void;

const useMap: <K, V>() => [Map<K, V>, Put<K, V>, Delete<K>] = <K, V>() => {
  const [map, setMap] = useState(new Map<K, V>());
  const put = (key: K, value: V) => setMap(new Map(map.set(key, value)));
  const del = (key: K) => setMap(new Map((map.delete(key), map.entries())));
  return [map, put, del];
};

export default useMap;
