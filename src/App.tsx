import { useEffect, useState } from "react";
import { fetchLibrary, Source } from "./library";
import Mixer, { ChannelInfo } from "./mixer";
import useKeyPress from "./useKeyPress";

const mixer = new Mixer();

const VOLUME_UP_KEYS: Array<string> = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];
const VOLUME_DOWN_KEYS: Array<string> = ['A', 'S', 'D', 'F', 'J', 'K', 'L', ':'];

type Track = Source & ChannelInfo & { volumeKey?: string };

const App = () => {
  /**
   * Library
   */
  const [library, setLibrary] = useState<Array<Source>>([]);
  useEffect(() => {
    fetchLibrary()
      .then((x) => setLibrary(x))
      .catch(console.error);
  }, []);

  /**
   * Tracks
   */
  const [unusedVolumeKeys, setUnusedVolumeKeys] = useState<Array<string>>(VOLUME_UP_KEYS);
  const [tracks, setTracks] = useState<Array<Track>>([]);
  const loadTrack = (source: Source) => {
    const chInfo = mixer.load(source.id, source.url);
    setTracks(
      tracks.concat({
        ...source,
        ...chInfo,
        volumeKey: unusedVolumeKeys[0] // if empty, undefined
      })
    );
    setUnusedVolumeKeys(unusedVolumeKeys.slice(1, unusedVolumeKeys.length));
  };
  const removeTrack = (id: string) => {
    mixer.remove(id);
    const trackKey = tracks.find((t) => t.id == id)?.volumeKey;
    setTracks(tracks.filter((t) => t.id !== id));
    trackKey && setUnusedVolumeKeys(unusedVolumeKeys.concat(trackKey));
  };

  /**
   * Keyboard
   */
  const fadeTrackVolume = (id: string, step: number) => {
    try {
      const updatedVolume = mixer.channel(id).fader(step);
      setTracks(
        tracks.map((t) => (t.id === id ? { ...t, volume: updatedVolume } : t))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const pressedVolumeKey = useKeyPress(VOLUME_UP_KEYS.concat(VOLUME_DOWN_KEYS));

  useEffect(() => {
    if (!pressedVolumeKey) {
      return
    }

    const id = tracks.find(t => t.volumeKey === pressedVolumeKey.toLowerCase())?.id;
    if (!id) {
      return
    }

    const upDown = VOLUME_UP_KEYS.includes(pressedVolumeKey) ? 1 : -1;
    fadeTrackVolume(id, upDown * 0.2);
  }, [pressedVolumeKey])

  return (
    <div>
      <h1>Night Focus</h1>
      <div>
        <ul>
          {library.map((source) => (
            <li key={source.id}>
              {tracks.map((x) => x.id).includes(source.id) ? (
                <span>{source.name}</span>
              ) : (
                <a href="#" onClick={() => loadTrack(source)}>
                  {source.name}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
      <hr />
      <div>
        <ul>
          {tracks.map((track) => (
            <li key={track.id}>
              {track.volumeKey ?? <span>{track.volumeKey}</span>}
              <button onClick={() => fadeTrackVolume(track.id, 0.2)}>+</button>
              {` `}
              <button onClick={() => fadeTrackVolume(track.id, -0.2)}>-</button>
              {` `}
              <button onClick={() => removeTrack(track.id)}>x</button>
              {` `}
              <span>{track.name}</span>
              {` `}
              {track.volume > 0 && <span>|</span>}
              <span>{`-`.repeat(Math.round(track.volume * 10))}</span>
              {track.volume == 1 && <span>|</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
