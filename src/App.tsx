import { useEffect, useState } from "react";
import { fetchLibrary, Source } from "./library";
import Mixer, { ChannelInfo } from "./mixer";

const mixer = new Mixer();

type Track = Source & ChannelInfo;

const App = () => {
  const [library, setLibrary] = useState<Array<Source>>([]);
  useEffect(() => {
    fetchLibrary()
      .then((x) => setLibrary(x))
      .catch(console.error);
  }, []);

  const [tracks, setTracks] = useState<Array<Track>>([]);

  const loadTrack = (source: Source) => {
    const chInfo = mixer.load(source.id, source.url);
    setTracks(
      tracks.concat({
        ...source,
        ...chInfo,
      })
    );
  };

  const removeTrack = (id: string) => {
    mixer.remove(id);
    setTracks(tracks.filter((t) => t.id !== id));
  };

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
