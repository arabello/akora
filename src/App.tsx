import { useEffect, useRef, useState } from "react";
import { ItemList } from "./ItemList";
import { SearchSources } from "./search";
import Mixer from "./mixer";
import { Source, Track } from "./model";
import {
  LocalStorageSessionRepository,
  SessionRepository,
  SourcesRepository,
  StaticSourcesRepository,
} from "./repository";
import useKeyBindings from "./useKeyBinding";
import useKeyPress from "./useKeyPress";

const mixer = new Mixer();

const searchSources = new SearchSources([]);
const sessionRepository: SessionRepository =
  new LocalStorageSessionRepository();
const sourcesRepository: SourcesRepository = new StaticSourcesRepository();

const VOLUME_STEP = 0.2;

const App = () => {
  /**
   * Library
   */
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedSource, setDisplayedSources] = useState<Array<Source>>([]);

  useEffect(() => {
    sourcesRepository
      .getSources()
      .then((x) => {
        searchSources.setCollection(x);
        setDisplayedSources(x);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      return setDisplayedSources(searchSources.getCollection());
    }

    searchSources.search(searchQuery).then(setDisplayedSources);
  }, [searchQuery]);

  /**
   * Tracks
   */
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
    setKeyBindings(keyBindings.filter((k) => k.target !== id));
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

  /**
   * Keyboard
   */
  const [keyBindings, setKeyBindings, setKeyBindingTarget] =
    useKeyBindings<string>();
  const keyPress = useKeyPress();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [trackFocusIndex, setTrackFocusIndex] = useState<number>();

  const trackFocus = (action: "next" | "prev") => {
    if (tracks.length == 0) {
      return setTrackFocusIndex(undefined);
    }

    switch (action) {
      case "next":
        return setTrackFocusIndex(
          trackFocusIndex === undefined ||
            trackFocusIndex + 1 > tracks.length - 1
            ? 0
            : trackFocusIndex + 1
        );
      case "prev":
        return setTrackFocusIndex(
          trackFocusIndex === undefined || trackFocusIndex - 1 < 0
            ? tracks.length - 1
            : trackFocusIndex - 1
        );
    }
  };

  useEffect(() => {
    tracks.length === 0 && setTrackFocusIndex(undefined);
  }, [tracks]);

  useEffect(() => {
    if (!keyPress) {
      return;
    }

    switch (keyPress.code) {
      // Global
      case "Escape":
        (document.activeElement as HTMLElement).blur();
        setTrackFocusIndex(undefined);
        return;
      case "KeyK":
        (keyPress.metaKey || keyPress.ctrlKey) &&
          searchInputRef.current?.focus();
        return;
      case "Enter":
        document.activeElement === searchInputRef.current &&
          displayedSource.length > 0 &&
          tracks.find((x) => x.id === displayedSource[0].id) === undefined &&
          loadTrack(displayedSource[0]);
        return;

      // Tracks navigation
      case "ArrowUp":
        return trackFocus("prev");
      case "ArrowDown":
        return trackFocus("next");
      case "ArrowRight":
        trackFocusIndex !== undefined &&
          fadeTrackVolume(tracks[trackFocusIndex].id, VOLUME_STEP);
        return;
      case "ArrowLeft":
        console.log(trackFocusIndex);
        trackFocusIndex !== undefined &&
          fadeTrackVolume(tracks[trackFocusIndex].id, -VOLUME_STEP);
        return;
      case "KeyX":
        trackFocusIndex !== undefined &&
          removeTrack(tracks[trackFocusIndex].id);
        return;

      // Control volume if a key was bounded
      default:
        const id = keyBindings.find((x) => x.code === keyPress.code)?.target;
        id &&
          document.activeElement !== searchInputRef.current &&
          fadeTrackVolume(id, (keyPress.shiftKey ? -1 : 1) * VOLUME_STEP);
        return;
    }
  }, [keyPress]);

  /**
   * Session storage
   */
  useEffect(() => {
    sessionRepository.getTracks().then((x) => {
      x.map((x) => {
        mixer.load(x.id, x.url, x.volume);
      });
      setTracks(x);
    });
    sessionRepository.getKeyBindings().then((x) => setKeyBindings(x));
  }, []);

  useEffect(() => {
    sessionRepository.setTracks(tracks);
  }, [tracks]);

  useEffect(() => {
    sessionRepository.setKeyBindings(keyBindings);
  }, [keyBindings]);

  return (
    <div>
      <h1>Night Focus</h1>
      <div>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          ref={searchInputRef}
        />
        <ItemList
          items={displayedSource.map(({ id, name }) => ({ id, label: name }))}
          isClickable={({ id }) => !tracks.map((x) => x.id).includes(id)}
          onClick={({ id }) => {
            const s = displayedSource.find((s) => s.id === id);
            s && loadTrack(s);
          }}
        />
      </div>
      <hr />
      <div>
        <ul>
          {tracks.map((track, index) => (
            <li
              key={track.id}
              style={
                index == trackFocusIndex ? { background: "lightgray" } : {}
              }
            >
              <span>{keyBindings.find((x) => x.target === track.id)?.key}</span>
              <button onClick={() => fadeTrackVolume(track.id, VOLUME_STEP)}>
                +
              </button>
              {` `}
              <button onClick={() => fadeTrackVolume(track.id, -VOLUME_STEP)}>
                -
              </button>
              {` `}
              <button onClick={() => removeTrack(track.id)}>x</button>
              {` `}
              <button onClick={() => setKeyBindingTarget(track.id)}>
                Bind
              </button>
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
