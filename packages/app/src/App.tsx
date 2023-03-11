import { useEffect, useState } from "react";
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
} from "@night-focus/design-system";
import "@night-focus/design-system/lib/index.css";
import { keyBindingFrom, match, KB } from "./keybinding";

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
      // setSourceFocus();
      return setDisplayedSources(searchSources.getCollection());
    }

    searchSources.search(searchQuery).then(setDisplayedSources);
    // .then(() => setSourceFocus(0));
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
  const { currentFocusId, focusFirst, focusNext, focusPrevious, focusClear } =
    useFocus();

  const navigationTarget =
    currentFocusId?.includes("searchbar") || currentFocusId?.includes("source")
      ? "source"
      : "track";
  const doWithFocusedTrack =
    (fn: (trackId: string) => unknown) => (focusId: string) => {
      const trackId = focusId.replace("track-", "");
      const track = tracks.find((t) => t.id === trackId);
      track && fn(track.id);
    };
  const onKeyBindingPress = match({
    [KB.Escape.id]: () => {
      setSearchQuery("");
      focusClear();
    },
    [KB.meta.K.id]: () => focusFirst({ find: (id) => id === "searchbar" }),
    [KB.ArrowUp.id]: () =>
      focusPrevious({
        find: (id) => id.includes(navigationTarget),
        wrap: true,
      }),
    [KB.ArrowDown.id]: () =>
      focusNext({
        find: (id) => id.includes(navigationTarget),
        wrap: true,
      }),
    [KB.X.id]: () =>
      currentFocusId && doWithFocusedTrack(removeTrack)(currentFocusId),
    [KB.ArrowLeft.id]: () =>
      currentFocusId &&
      doWithFocusedTrack((trackId) => fadeTrackVolume(trackId, -VOLUME_STEP))(
        currentFocusId
      ),
    [KB.ArrowRight.id]: () =>
      currentFocusId &&
      doWithFocusedTrack((trackId) => fadeTrackVolume(trackId, VOLUME_STEP))(
        currentFocusId
      ),
  });

  useEffect(() => {
    if (!keyPress) {
      return;
    }

    const keyBinding = keyBindingFrom(keyPress);

    if (!keyBinding) {
      return;
    }

    onKeyBindingPress(keyBinding);

    // TODO: Control volume if a key was bounded
    // const id = keyBindings.find((x) => x.code === keyPress.code)?.target;
    // id && fadeTrackVolume(id, (keyPress.shiftKey ? -1 : 1) * VOLUME_STEP);
    // return;
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
          <SearchBar
            data-focus-id="searchbar"
            placeholder="Type here..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <ItemList
            items={displayedSource.map(({ id, name }) => ({ id, label: name }))}
            // isFocused={(_, index) => index == sourceFocus}
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
            {tracks.map((track) => (
              <li
                tabIndex={0}
                data-focus-id={`track-${track.id}`}
                key={track.id}
              // style={index == trackFocus ? { background: "lightgray" } : {}}
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
