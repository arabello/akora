import { useEffect, useRef, useState } from "react";
import { ItemList } from "./ItemList";
import { SearchSources } from "./search";
import Mixer from "./mixer";
import { isKeyBinding, isTrack, KeyBinding, Source, Track } from "./model";
import {
  LocalStorageSessionRepository,
  SessionRepository,
  SourcesRepository,
  StaticSourcesRepository,
} from "./repository";
import { useKeyBinding, useKeyPress } from "./keybinding";
import { useFocus } from "./useFocus";

const mixer = new Mixer();

const searchSources = new SearchSources([]);
const tracksSessionRepo: SessionRepository<Array<Track>> =
  new LocalStorageSessionRepository<Array<Track>>(
    "tracks",
    (tracks: Array<Track>): tracks is Array<Track> =>
      (tracks as Array<Track>).every(isTrack)
  );
const keybindingsSessionRepo: SessionRepository<Array<KeyBinding<string>>> =
  new LocalStorageSessionRepository(
    "keyBindings",
    (tracks: Array<KeyBinding<string>>): tracks is Array<KeyBinding<string>> =>
      (tracks as Array<KeyBinding<string>>).every(isKeyBinding)
  );
const sourcesRepo: SourcesRepository = new StaticSourcesRepository();

const VOLUME_STEP = 0.1;

const App = () => {
  /**
   * Library
   */
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedSource, setDisplayedSources] = useState<Array<Source>>([]);

  useEffect(() => {
    sourcesRepo
      .fetchSources()
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
    useKeyBinding<string>();
  const keyPress = useKeyPress();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [trackFocus, setTrackFocus] = useFocus(tracks);

  useEffect(() => {
    if (!keyPress) {
      return;
    }

    if (keyPress.code === "Escape") {
      setSearchQuery("");
      (document.activeElement as HTMLElement).blur();
      setTrackFocus();
      return;
    }

    if (document.activeElement == searchInputRef.current) {
      switch (keyPress.code) {
        case "Enter":
          document.activeElement === searchInputRef.current &&
            displayedSource.length > 0 &&
            tracks.find((x) => x.id === displayedSource[0].id) === undefined &&
            loadTrack(displayedSource[0]);
          return;
      }
    } else {
      switch (keyPress.code) {
        case "KeyK":
          (keyPress.metaKey || keyPress.ctrlKey) &&
            searchInputRef.current?.focus();
          return;

        // Tracks navigation
        case "ArrowUp":
          return setTrackFocus("prev");
        case "ArrowDown":
          return setTrackFocus("next");
        case "ArrowRight":
          trackFocus !== undefined &&
            fadeTrackVolume(tracks[trackFocus].id, VOLUME_STEP);
          return;
        case "ArrowLeft":
          trackFocus !== undefined &&
            fadeTrackVolume(tracks[trackFocus].id, -VOLUME_STEP);
          return;
        case "KeyX":
          trackFocus !== undefined && removeTrack(tracks[trackFocus].id);
          return;

        // Control volume if a key was bounded
        default:
          const id = keyBindings.find((x) => x.code === keyPress.code)?.target;
          id && fadeTrackVolume(id, (keyPress.shiftKey ? -1 : 1) * VOLUME_STEP);
          return;
      }
    }
  }, [keyPress]);

  /**
   * Session storage
   */
  useEffect(() => {
    tracksSessionRepo.fetch().then((x) => {
      x.map((x) => {
        mixer.load(x.id, x.url, x.volume);
      });
      setTracks(x);
    });
    keybindingsSessionRepo.fetch().then((x) => setKeyBindings(x));
  }, []);

  useEffect(() => {
    tracksSessionRepo.persist(tracks);
  }, [tracks]);

  useEffect(() => {
    keybindingsSessionRepo.persist(keyBindings);
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
              style={index == trackFocus ? { background: "lightgray" } : {}}
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
