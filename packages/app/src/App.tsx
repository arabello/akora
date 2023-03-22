import { useEffect, useState } from "react";
import { SearchSources } from "./search";
import Mixer from "./mixer";
import { isTrack, Source, Track } from "./model";
import {
  LocalStorageSessionRepository,
  SessionRepository,
  SourcesRepository,
  StaticSourcesRepository,
} from "./repository";
import { useFocus } from "./useFocus";
import {
  Columns,
  Headline,
  Stack,
  Column,
  ContentBlock,
  SearchBar,
  IconButton,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  ProgressBarCard,
  Conceal,
  Box,
  ListItem,
  Chip,
} from "@night-focus/design-system";
import "@night-focus/design-system/lib/index.css";
import { KB, useKeyBinding } from "keybinding";
import "./app.css";

const mixer = new Mixer();

const searchSources = new SearchSources([]);
const tracksSessionRepo: SessionRepository<Array<Track>> =
  new LocalStorageSessionRepository<Array<Track>>(
    "tracks",
    (tracks: Array<Track>): tracks is Array<Track> =>
      (tracks as Array<Track>).every(isTrack)
  );
const sourcesRepo: SourcesRepository = new StaticSourcesRepository();

const VOLUME_STEP = 0.1;


const makeFocusIdConversion = (prefix: string) => (
  {
    prefix,
    to: (id: string) => `${prefix}-${id}`,
    from: (focusId: string) => focusId.replace(`${prefix}-`, "")
  }
)
const FID = {
  track: makeFocusIdConversion('track'),
  source: makeFocusIdConversion('source')
}

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

  const removeTrack = (trackId: string) => {
    mixer.remove(trackId);
    setTracks(tracks.filter((t) => t.id !== trackId));
  };

  const fadeTrackVolume = (trackId: string, step: number) => {
    try {
      const updatedVolume = mixer.channel(trackId).fader(step);
      setTracks(
        tracks.map((t) =>
          t.id === trackId ? { ...t, volume: updatedVolume } : t
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const volumeUp = (trackId: string) => fadeTrackVolume(trackId, VOLUME_STEP);
  const volumeDown = (trackId: string) =>
    fadeTrackVolume(trackId, -VOLUME_STEP);

  /**
   * Keyboard
   */
  const { currentFocusId, focusFirst, focusNext, focusPrevious, focusClear } =
    useFocus();

  const navigationTarget =
    currentFocusId?.includes("searchbar") || currentFocusId?.includes(FID.source.prefix)
      ? FID.source.prefix
      : FID.track.prefix;

  const withFocusedTrackDo = (fn: (trackId: string) => unknown) => {
    if (currentFocusId === undefined) {
      return;
    }
    const track = tracks.find((t) => t.id === FID.track.from(currentFocusId));
    track && fn(track.id);
  };

  const withFocusedSourceDo = (fn: (source: Source) => unknown) => {
    if (currentFocusId === undefined) {
      return;
    }
    const source = displayedSource.find((s) => s.id === FID.source.from(currentFocusId));
    source && fn(source);
  };

  useKeyBinding(
    {
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
      [KB.Enter.id]: () => withFocusedSourceDo(source => {
        loadTrack(source);
        focusNext({
          find: (id) => id.includes(navigationTarget),
          wrap: true,
        })
      }),
      [KB.X.id]: () =>
        withFocusedTrackDo((trackId) => {
          removeTrack(trackId);
          focusNext({
            find: (id) => id.includes(navigationTarget),
            wrap: true,
          })
        }),
      [KB.ArrowLeft.id]: () => withFocusedTrackDo(volumeDown),
      [KB.ArrowRight.id]: () => withFocusedTrackDo(volumeUp),
    },
    [KB.ArrowDown, KB.ArrowUp],
    [navigationTarget, currentFocusId]
  );

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
  }, []);

  useEffect(() => {
    tracksSessionRepo.persist(tracks);
  }, [tracks]);

  const tracksRender = tracks.map((track) => {
    const trackFID = FID.track.to(track.id);
    const isFocused = currentFocusId === trackFID;
    const iconRemove = (
      <Conceal visible={isFocused}>
        <IconButton
          icon={IconClose}
          size={8}
          kind="transparent"
          hierarchy="primary"
          label=""
          onPress={() =>
            withFocusedTrackDo((trackId) => {
              removeTrack(trackId);
              focusClear();
            })
          }
        />
      </Conceal>
    );
    return (
      <Box
        key={`track-container-${track.id}`}
        onMouseEnter={() => focusFirst({ find: (id) => id === trackFID })}
        onMouseLeave={() => focusClear()}
      >
        <Columns space={24} alignY="center">
          <Column width="content">
            <Conceal visible={isFocused}>
              <IconButton
                icon={IconChevronLeft}
                size={8}
                kind="transparent"
                hierarchy="primary"
                label=""
                onPress={() => volumeDown(track.id)}
              />
            </Conceal>
          </Column>
          <ProgressBarCard
            key={track.id}
            tabIndex={0}
            data-focus-id={trackFID}
            title={track.name}
            progress={track.volume}
            status={isFocused ? "focused" : "default"}
            icon={iconRemove}
          />
          <Column width="content">
            <Conceal visible={isFocused}>
              <IconButton
                icon={IconChevronRight}
                size={8}
                kind="transparent"
                hierarchy="primary"
                label=""
                onPress={() => volumeUp(track.id)}
              />
            </Conceal>
          </Column>
        </Columns>
      </Box>
    );
  });

  return (
    <Columns space={24}>
      <Column width="1/5">
        <Stack space={0}>
          <Headline size="large">Night Focus</Headline>
          <SearchBar
            data-focus-id="searchbar"
            aria-label="Search for sources"
            placeholder="Search for sources..."
            value={searchQuery}
            onChange={setSearchQuery}
            rightAccessory={<Chip label="⌘ + K" color="grey" />}
          />
          <Stack space={4} as="ul" dividers={true}>
            {displayedSource.map((s) => {
              const sourceFID = FID.source.to(s.id);
              const isFocused = currentFocusId === sourceFID;
              const isLoaded = tracks.map((x) => x.id).includes(s.id);
              return (
                <ListItem
                  key={s.id}
                  onMouseEnter={() =>
                    focusFirst({ find: (id) => id === sourceFID })
                  }
                  onMouseLeave={() => focusClear()}
                  tabIndex={isLoaded ? undefined : 0}
                  data-focus-id={sourceFID}
                  status={
                    isLoaded ? "disabled" : isFocused ? "focused" : "default"
                  }
                  onClick={() => {
                    loadTrack(s);
                    focusClear();
                  }}
                  rightAccessory={isFocused ? <Chip label="⏎" color="grey" /> : undefined}
                >
                  {s.name}
                </ListItem>
              );
            })}
          </Stack>
        </Stack>
      </Column>
      <ContentBlock maxWidth={700} alignSelf="center">
        <Stack space={0}>
          <Stack space={4}>{tracksRender}</Stack>
        </Stack>
      </ContentBlock>
    </Columns>
  );
};

export default App;
