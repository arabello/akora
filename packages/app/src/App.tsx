import {
  Body,
  Box,
  Chip,
  Column,
  Columns,
  Conceal,
  Headline,
  IconButton,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconInfo,
  IconMute,
  IconSliders,
  IconVolume,
  Inset,
  Label,
  Link,
  ListItem,
  ProgressBarCard,
  SearchBar,
  Stack,
} from "@night-focus/design-system";
import "@night-focus/design-system/lib/index.css";
import { KB, useKeyBinding } from "keybinding";
import { useState } from "react";
import "./app.css";
import { AboutModal } from "./components/AboutModal";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { useMixer } from "./mixer";
import { LocalStorageSessionRepository, SessionRepository } from "./session";
import { Source, search, sources } from "./sources";
import { useFocus } from "./useFocus";

type Track = Source & {
  volume: number;
};

const isTrack = (obj: any): obj is Track =>
  typeof obj.id === "string" &&
  typeof obj.name === "string" &&
  typeof obj.url === "string";

const sessionRepo: SessionRepository<Record<string, Track>> =
  new LocalStorageSessionRepository<Record<string, Track>>(
    "tracks",
    (tracks: Record<string, Track>): tracks is Record<string, Track> =>
      typeof tracks === "object" &&
      Object.keys(tracks).every((s) => typeof s === "string") &&
      Object.values(tracks).every(isTrack)
  );

let firstMount = false;
if (typeof window !== "undefined") {
  firstMount = true;
}

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

const App = () => {
  /**
   * Mixer
   */
  const session = firstMount ? sessionRepo.read() || {} : {};
  firstMount = false;
  const mixer = useMixer(Object.values(session));
  const tracks: Record<string, Track> = Object.entries(mixer.channels).reduce(
    (acc, [id, ch]) => {
      const name = sources.find((s) => s.id === id)?.name;
      return !name
        ? acc
        : {
            ...acc,
            [id]: {
              id,
              name,
              url: ch.url(),
              volume: ch.volume(),
            },
          };
    },
    {}
  );
  sessionRepo.write(tracks);

  /**
   * Info dialog
   */
  const [showKeybindingsModal, setShowKeybindingsModal] = useState(false);

  /**
   * Mute
   */
  const [mute, setMute] = useState(false);
  Object.values(mixer.channels).forEach((ch) => ch.mute(mute));

  /**
   * Search
   */
  const [searchQuery, setSearchQuery] = useState<string>("");
  const filteredSources = searchQuery === "" ? sources : search(searchQuery);

  /**
   * Focus
   */
  const { currentFocusId, focusFirst, focusNext, focusPrevious, focusClear } =
    useFocus();

  const navigationTarget =
    currentFocusId?.includes("searchbar") ||
    currentFocusId?.includes(FID.source.prefix)
      ? FID.source.prefix
      : FID.track.prefix;

  const withFocusedTrackDo = (fn: (tid: string) => unknown) => {
    if (currentFocusId === undefined) {
      return;
    }
    const track = tracks[FID.track.from(currentFocusId)];
    track && fn(FID.track.from(currentFocusId));
  };

  const withFocusedSourceDo = (fn: (source: Source) => unknown) => {
    if (currentFocusId === undefined) {
      return;
    }
    const source = filteredSources.find(
      (s) => s.id === FID.source.from(currentFocusId)
    );
    source && fn(source);
  };

  /**
   * Keybindings
   */
  const keyBindingActions = {
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
        mixer.load(source.id, source.url);
        focusNext({
          find: (id) => id.includes(navigationTarget),
          wrap: true,
        });
      }),
    [KB.X.id]: () =>
      withFocusedTrackDo((tid) => {
        mixer.unload(tid);
        focusNext({
          find: (id) => id.includes(navigationTarget),
          wrap: true,
        });
      }),
    [KB.ArrowLeft.id]: () =>
      withFocusedTrackDo((tid) => mixer.channels[tid].fade(-VOLUME_STEP)),
    [KB.ArrowRight.id]: () =>
      withFocusedTrackDo((tid) => mixer.channels[tid].fade(VOLUME_STEP)),
    [KB.shift.ArrowLeft.id]: () =>
      withFocusedTrackDo((tid) => mixer.channels[tid].fade(-VOLUME_ADJUST)),
    [KB.shift.ArrowRight.id]: () =>
      withFocusedTrackDo((tid) => mixer.channels[tid].fade(VOLUME_ADJUST)),
    [KB.shift.Slash.id]: () => setShowKeybindingsModal(!showKeybindingsModal),
    [KB.shift.M.id]: () => setMute(!mute),
  };
  useKeyBinding(keyBindingActions);

  /**
   * Rendering
   */
  const sourcesRender = filteredSources.map((s) => {
    const sourceFID = FID.source.to(s.id);
    const isFocused = currentFocusId === sourceFID;
    const isLoaded = tracks[s.id] !== undefined;
    return (
      <ListItem
        key={s.id}
        onMouseEnter={() => focusFirst({ find: (id) => id === sourceFID })}
        onMouseLeave={() => focusClear()}
        tabIndex={isLoaded ? undefined : 0}
        data-focus-id={sourceFID}
        disabled={isLoaded}
        onClick={() => {
          mixer.load(s.id, s.url);
          focusClear();
        }}
        rightAccessory={
          isFocused ? (
            <Body size="small" color="secondary">
              ⏎
            </Body>
          ) : undefined
        }
      >
        {s.name}
      </ListItem>
    );
  });

  const tracksRender = Object.values(tracks).map((track) => {
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
            withFocusedTrackDo((tid) => {
              mixer.unload(tid);
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
                onPress={() => mixer.channels[track.id].fade(-VOLUME_STEP)}
              />
            </Conceal>
          </Column>
          <ProgressBarCard
            key={track.id}
            tabIndex={0}
            data-focus-id={trackFID}
            title={track.name}
            progress={track.volume}
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
                onPress={() => mixer.channels[track.id].fade(VOLUME_STEP)}
              />
            </Conceal>
          </Column>
        </Columns>
      </Box>
    );
  });

  const wizardInfoRender = (
    <Stack space={8}>
      <Label size="large" color="secondary">
        Load a track in the pool by clicking on a source from the left panel.
      </Label>
      <Label size="large" color="secondary">
        Hover on a loaded track to see the controls.
      </Label>
      <Label size="large" color="secondary">
        Control its volume with the side arrows buttons.
      </Label>
      <Label size="large" color="secondary">
        Check out the{" "}
        <Link
          onClick={() => {
            setShowKeybindingsModal(true);
          }}
        >
          keyboard shortcuts
        </Link>
        .
      </Label>
    </Stack>
  );

  const [aboutModalShow, setAboutModalShow] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  return (
    <Inset spaceX={32} spaceY={32}>
      <Columns space={24}>
        <Column width="1/3">
          <Box display="flex" justifyContent="flexEnd">
            <Stack space={16}>
              <Box display="flex" alignItems="baseline">
                <Box flex={1}>
                  <Headline size="large">Night Focus</Headline>
                </Box>
              </Box>
              <Stack space={4}>
                <ListItem
                  onClick={() => setAboutModalShow(true)}
                  leftAccessory={(() => (
                    <IconInfo size={16} color="primaryInverse" />
                  ))()}
                >
                  About
                </ListItem>
                <ListItem
                  onClick={() => setShowShortcutsModal(true)}
                  leftAccessory={(() => (
                    <IconSliders size={16} />
                  ))()}
                >
                  Keybindings
                </ListItem>
                <ListItem
                  onClick={() => setMute(!mute)}
                  leftAccessory={(() =>
                    mute ? (
                      <IconVolume size={16} color="primaryInverse" />
                    ) : (
                      <IconMute size={16} color="primaryInverse" />
                    ))()}
                >
                  {mute ? "Unmute" : "Mute"}
                </ListItem>
              </Stack>
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
          </Box>
        </Column>
        <Column width="1/3">
          {tracksRender.length <= 0 ? (
            wizardInfoRender
          ) : (
            <Stack space={4}>{tracksRender}</Stack>
          )}
        </Column>
      </Columns>
      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}
      {aboutModalShow && (
        <AboutModal onClose={() => setAboutModalShow(false)} />
      )}
    </Inset>
  );
};

export default App;
