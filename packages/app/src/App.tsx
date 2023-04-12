import { useEffect, useState } from "react";
import { SearchSources } from "./search";
import Mixer from "./mixer";
import { isTrack, Source, Track } from "./model";
import {
  LocalStorageSessionRepository,
  SessionRepository,
  getSources,
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
  Modal,
  Conceal,
  Box,
  ListItem,
  Chip,
  IconSliders,
  Inset,
  Body,
  Inline,
  IconInfo,
  Link,
} from "@night-focus/design-system";
import "@night-focus/design-system/lib/index.css";
import { KB, useKeyBinding } from "keybinding";
import "./app.css";

const mixer = new Mixer();

const searchSources = new SearchSources(getSources());
const tracksSessionRepo: SessionRepository<Array<Track>> =
  new LocalStorageSessionRepository<Array<Track>>(
    "tracks",
    (tracks: Array<Track>): tracks is Array<Track> =>
      (tracks as Array<Track>).every(isTrack)
  );

const VOLUME_STEP = 0.05;
const VOLUME_ADJUST = 0.01;

const makeFocusIdConversion = (prefix: string) => ({
  prefix,
  to: (id: string) => `${prefix}-${id}`,
  from: (focusId: string) => focusId.replace(`${prefix}-`, ""),
});
const FID = {
  track: makeFocusIdConversion("track"),
  source: makeFocusIdConversion("source"),
};

const ACTIONS_INFO: Array<{
  keybinding: string;
  secondaryKeybinding?: string;
  desc: string;
}> = [
    {
      keybinding: "⌘ + K",
      desc: "Search",
    },
    {
      keybinding: "⏎",
      desc: "Load the focused source in tracks pool",
    },
    {
      keybinding: "▲ ▼",
      desc: "Navigate tracks or sources",
    },
    {
      keybinding: "◀ ▶",
      secondaryKeybinding: "⇧ + ◀ ▶",
      desc: "Control or Adjust track volume",
    },
    {
      keybinding: "x",
      desc: "Remove track from pool",
    },
    {
      keybinding: "?",
      desc: "Toggle this dialog",
    },
  ];

const App = () => {
  /**
   * Library
   */
  const [searchQuery, setSearchQuery] = useState<string>("");
  const displayedSource =
    searchQuery === ""
      ? searchSources.getCollection()
      : searchSources.search(searchQuery);

  /**
   * Tracks
   */
  const [tracks, setTracks] = useState<Array<Track>>([]);

  const loadTrack = (source: Source) => {
    const chInfo = mixer.load(source.id, source.url);
    const newTracks = tracks.concat({
      ...source,
      ...chInfo,
    });
    tracksSessionRepo.persist(newTracks);
    setTracks(newTracks);
  };

  const removeTrack = (trackId: string) => {
    mixer.remove(trackId);
    const newTracks = tracks.filter((t) => t.id !== trackId);
    tracksSessionRepo.persist(newTracks);
    setTracks(newTracks);
  };

  const fadeTrackVolume = (trackId: string, step: number) => {
    try {
      const updatedVolume = mixer.channel(trackId).fader(step);
      const newTracks = tracks.map((t) =>
        t.id === trackId ? { ...t, volume: updatedVolume } : t
      );
      tracksSessionRepo.persist(newTracks);
      setTracks(newTracks);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Info dialog
   */
  const [showKeybindingsModal, setShowKeybindingsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  /**
   * Keyboard
   */
  const { currentFocusId, focusFirst, focusNext, focusPrevious, focusClear } =
    useFocus();

  const navigationTarget =
    currentFocusId?.includes("searchbar") ||
      currentFocusId?.includes(FID.source.prefix)
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
    const source = displayedSource.find(
      (s) => s.id === FID.source.from(currentFocusId)
    );
    source && fn(source);
  };

  useKeyBinding(
    {
      [KB.Escape.id]: () => {
        setSearchQuery("");
        focusClear();
        setShowKeybindingsModal(false);
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
      [KB.Enter.id]: () =>
        withFocusedSourceDo((source) => {
          loadTrack(source);
          focusNext({
            find: (id) => id.includes(navigationTarget),
            wrap: true,
          });
        }),
      [KB.X.id]: () =>
        withFocusedTrackDo((trackId) => {
          removeTrack(trackId);
          focusNext({
            find: (id) => id.includes(navigationTarget),
            wrap: true,
          });
        }),
      [KB.ArrowLeft.id]: () =>
        withFocusedTrackDo((tid) => fadeTrackVolume(tid, -VOLUME_STEP)),
      [KB.ArrowRight.id]: () =>
        withFocusedTrackDo((tid) => fadeTrackVolume(tid, VOLUME_STEP)),
      [KB.shift.ArrowLeft.id]: () =>
        withFocusedTrackDo((tid) => fadeTrackVolume(tid, -VOLUME_ADJUST)),
      [KB.shift.ArrowRight.id]: () =>
        withFocusedTrackDo((tid) => fadeTrackVolume(tid, VOLUME_ADJUST)),
      [KB.shift.Slash.id]: () => setShowKeybindingsModal(!showKeybindingsModal),
    },
    [KB.ArrowDown, KB.ArrowUp],
    [navigationTarget, currentFocusId]
  );

  /**
   * Session storage
   */
  useEffect(() => {
    tracksSessionRepo.fetch().then((x) => {
      x.forEach((x) => mixer.load(x.id, x.url, x.volume));
      setTracks(x);
    });
  }, []);

  /**
   * Rendering
   */
  const sourcesRender = displayedSource.map((s) => {
    const sourceFID = FID.source.to(s.id);
    const isFocused = currentFocusId === sourceFID;
    const isLoaded = tracks.map((x) => x.id).includes(s.id);
    return (
      <ListItem
        key={s.id}
        onMouseEnter={() => focusFirst({ find: (id) => id === sourceFID })}
        onMouseLeave={() => focusClear()}
        tabIndex={isLoaded ? undefined : 0}
        data-focus-id={sourceFID}
        status={isLoaded ? "disabled" : isFocused ? "focused" : "default"}
        onClick={() => {
          loadTrack(s);
          focusClear();
        }}
        rightAccessory={isFocused ? <Chip label="⏎" color="grey" /> : undefined}
      >
        {s.name}
      </ListItem>
    );
  });

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
                onPress={() => fadeTrackVolume(track.id, -VOLUME_STEP)}
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
                onPress={() => fadeTrackVolume(track.id, VOLUME_STEP)}
              />
            </Conceal>
          </Column>
        </Columns>
      </Box>
    );
  });

  return (
    <Inset spaceX={16} spaceY={16}>
      <Columns space={0}>
        <Column width="1/5">{ }</Column>
        <Column width="3/5">
          <Columns space={24}>
            <Column width="1/5">
              <Stack space={16}>
                <Box display="flex" alignItems="baseline">
                  <Box flex={1}><Headline size="large">Night Focus</Headline></Box>
                  <IconButton
                    label=""
                    icon={() => <IconInfo size={12} color="default" />}
                    size={12}
                    kind="transparent"

                    hierarchy="primary"
                    onPress={() => setShowInfoModal(!showInfoModal)}
                  />
                  {showInfoModal && (
                    <Modal
                      title="Purpose"
                      onClose={() => setShowInfoModal(false)}
                    >
                      <Stack space={24}>
                        <Body size="large">
                          I built Night Focus mostly for my evening sessions.
                        </Body>
                        <Body size="large">
                          I love to <Body size="large" weight="strong">immerse</Body> myself with
                          ambient sounds while studying, coding and reading.
                          I wanted something <Body size="large" weight="strong">tailored</Body> to
                          my picky user experience that I can fine tune at need.
                          Differently from background music, it hugs my mind just enough
                          to <Body size="large" weight="strong">focus</Body> with no intrusive distracting
                          peaks.
                        </Body>
                        <Body size="large">
                          Feel free to <Link href="mailto:matteo.pelle.pellegrino@gmail.com?subject=%5BNight%20Focus%5D">reach out to me</Link> for any feedback, requests or suggestions.
                        </Body>
                      </Stack>
                    </Modal>
                  )}
                </Box>
                <SearchBar
                  data-focus-id="searchbar"
                  aria-label="Search for sources"
                  placeholder="Search for sources..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  rightAccessory={<Chip label="⌘ + K" color="grey" />}
                />
                <Stack space={4}>{sourcesRender}</Stack>
              </Stack>
            </Column>
            <Column>
              <ContentBlock maxWidth={700} alignSelf="center">
                <Stack space={0}>
                  <Stack space={4}>{tracksRender}</Stack>
                </Stack>
              </ContentBlock>
            </Column>
            <Column width="content">
              <IconButton
                label=""
                icon={IconSliders}
                size={24}
                kind="transparent"
                hierarchy="primary"
                onPress={() => setShowKeybindingsModal(!showKeybindingsModal)}
              />
              {showKeybindingsModal && (
                <Modal
                  title="Keybindings"
                  onClose={() => setShowKeybindingsModal(false)}
                >
                  <Stack space={4}>
                    {ACTIONS_INFO.map((a) => (
                      <Columns space={16} key={a.keybinding}>
                        <Column width="1/4">
                          <Inline space={8}>
                            <Chip label={a.keybinding} color="grey" />
                            {a.secondaryKeybinding && (
                              <Chip label={a.secondaryKeybinding} color="grey" />
                            )}
                          </Inline>
                        </Column>
                        <Column>
                          <Body size="medium">{a.desc}</Body>
                        </Column>
                      </Columns>
                    ))}
                  </Stack>
                </Modal>
              )}
            </Column>
          </Columns>
        </Column>
        <Column width="1/5">{ }</Column>
      </Columns>

    </Inset>
  );
};

export default App;
