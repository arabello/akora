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
import { useKeyBinding, useKeyPress } from "./useKeyPress";
import { useFocus } from "./useFocus";
import {
  Columns,
  Headline,
  Stack,
  Column,
  ContentBlock,
  SearchBar,
  Focusable,
} from "@night-focus/design-system";
import "@night-focus/design-system/lib/index.css";

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
      setSourceFocus();
      return setDisplayedSources(searchSources.getCollection());
    }

    searchSources
      .search(searchQuery)
      .then(setDisplayedSources)
      .then(() => setSourceFocus(0));
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
  const [keyBindings, setKeyBindings, keyBindingTarget, setKeyBindingTarget] =
    useKeyBinding<string>();
  const keyPress = useKeyPress();
  const searchBarFocusRef = useRef<HTMLDivElement>(null);
  const [trackFocus, setTrackFocus] = useFocus(tracks);
  const [sourceFocus, setSourceFocus] = useFocus(displayedSource);

  useEffect(() => {
    if (!keyPress) {
      return;
    }

    if (keyPress.code === "Escape") {
      setSearchQuery("");
      (document.activeElement as HTMLElement).blur();
      setTrackFocus();
      setSourceFocus();
      return;
    }

    if (document.activeElement == searchBarFocusRef.current) {
      switch (keyPress.code) {
        case "Enter":
          document.activeElement === searchBarFocusRef.current &&
            sourceFocus !== undefined &&
            tracks.find((x) => x.id === displayedSource[sourceFocus].id) ===
              undefined &&
            loadTrack(displayedSource[sourceFocus]);
          return;
        // Sources navigation
        case "ArrowUp":
          return setSourceFocus("prev");
        case "ArrowDown":
          return setSourceFocus("next");
      }
    } else {
      switch (keyPress.code) {
        case "KeyK":
          (keyPress.metaKey || keyPress.ctrlKey) &&
            searchBarFocusRef.current?.focus();
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
    <Columns space={24}>
      <Column width="1/5">
        <Stack space={0}>
          <Headline size="large">Night Focus</Headline>
          <Focusable ref={searchBarFocusRef}>
            <SearchBar
              placeholder="Type here..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </Focusable>
          <ItemList
            items={displayedSource.map(({ id, name }) => ({ id, label: name }))}
            isFocused={(_, index) => index == sourceFocus}
            isClickable={({ id }) => !tracks.map((x) => x.id).includes(id)}
            onClick={({ id }) => {
              const s = displayedSource.find((s) => s.id === id);
              s && loadTrack(s);
            }}
          />
        </Stack>
      </Column>
      <ContentBlock maxWidth={700} alignSelf="center">
        <Stack space={0}>
          <Stack space={4}>
            {tracks.map((track, index) => (
              <li
                key={track.id}
                style={index == trackFocus ? { background: "lightgray" } : {}}
              >
                <span>
                  {keyBindings.find((x) => x.target === track.id)?.key}
                </span>
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
                {keyBindingTarget == track.id ? (
                  <button disabled>Binding...</button>
                ) : (
                  <button onClick={() => setKeyBindingTarget(track.id)}>
                    Bind
                  </button>
                )}
                {` `}
                <span>{track.name}</span>
                {` `}
                {track.volume > 0 && <span>|</span>}
                <span>{`-`.repeat(Math.round(track.volume * 10))}</span>
                {track.volume == 1 && <span>|</span>}
              </li>
            ))}
          </Stack>
        </Stack>
      </ContentBlock>
    </Columns>
  );
};

export default App;
