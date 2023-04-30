import {
  Banner,
  Body,
  Box,
  Chip,
  Column,
  Columns,
  Headline,
  IconButton,
  IconClose,
  Inset,
  Link,
  Stack,
} from "@buildo/bento-design-system";
import { KB, useKeyBinding } from "keybinding";
import { useState } from "react";
import "./app.css";
import {
  AboutModal,
  Conceal,
  IconInfo,
  IconMute,
  IconSliders,
  IconVolume,
  ListItem,
  ProgressBarCard,
  SearchBar,
  ShortcutsModal,
  TrackControls,
} from "./components";
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

const isMobile = (() => {
  const userAgent =
    typeof navigator === "undefined" ? "SSR" : navigator.userAgent;
  return (
    Boolean(userAgent.match(/SSR/i)) ||
    Boolean(userAgent.match(/Android/i)) ||
    Boolean(userAgent.match(/iPhone|iPad|iPod/i)) ||
    Boolean(userAgent.match(/Opera Mini/i)) ||
    Boolean(userAgent.match(/IEMobile/i))
  );
})();

const App = () => {
  /**
   * Mixer
   */
  const session = firstMount ? sessionRepo.read() || {} : {};
  firstMount = false;
  const mixer = useMixer(Object.values(session));
  const tracks: Record<string, Track> = Object.entries(mixer.channels).reduce(
    (acc, [id, { url, volume }]) => {
      const name = sources.find((s) => s.id === id)?.name;
      return !name
        ? acc
        : {
            ...acc,
            [id]: {
              id,
              name,
              url,
              volume,
            },
          };
    },
    {}
  );
  sessionRepo.write(tracks);

  /**
   * Mute
   */
  const [mute, setMute] = useState(false);
  mixer.muteAll(mute);

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
      setShowShortcutsModal(false);
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
      withFocusedTrackDo((tid) => mixer.volume(tid, -VOLUME_STEP)),
    [KB.ArrowRight.id]: () =>
      withFocusedTrackDo((tid) => mixer.volume(tid, VOLUME_STEP)),
    [KB.shift.ArrowLeft.id]: () =>
      withFocusedTrackDo((tid) => mixer.volume(tid, -VOLUME_ADJUST)),
    [KB.shift.ArrowRight.id]: () =>
      withFocusedTrackDo((tid) => mixer.volume(tid, VOLUME_ADJUST)),
    [KB.shift.Slash.id]: () => setShowShortcutsModal(!showShortcutsModal),
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
        background={isFocused ? "backgroundSecondary" : undefined}
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
      <TrackControls
        key={`track-container-${track.id}`}
        showControls={isFocused}
        onEnter={() => focusFirst({ find: (id) => id === trackFID })}
        onLeave={() => focusClear()}
        onArrowLeft={() => mixer.volume(track.id, -VOLUME_STEP)}
        onArrowRight={() => mixer.volume(track.id, VOLUME_STEP)}
      >
        <ProgressBarCard
          key={track.id}
          tabIndex={0}
          data-focus-id={trackFID}
          title={track.name}
          progress={track.volume}
          background={isFocused ? "backgroundSecondary" : undefined}
          icon={iconRemove}
        />
      </TrackControls>
    );
  });

  const placeholderTracksRange = [...Array(7)];
  const placeholderTracksRender = placeholderTracksRange.flatMap((_, i) => (
    <Box
      style={{ position: "relative" }}
      key={`placeholder-track-container-${i}`}
    >
      <Box
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgba(255, 255, 255, ${
            i * (1 / placeholderTracksRange.length)
          })`,
        }}
      />
      <TrackControls showControls={false}>
        <ProgressBarCard
          key={`placeholder-track-${i}`}
          title=" " // Use of U+2000 to render an empty block with the same height as a title
          progress={0}
        />
      </TrackControls>
    </Box>
  ));

  const [aboutModalShow, setAboutModalShow] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  return isMobile ? (
    <Box
      display="flex"
      height="full"
      alignItems="center"
      flexDirection="column"
      paddingTop={80}
    >
      <Banner
        title="Mobile devices are not support"
        description="Please visit Night Focus via a desktop browser"
        kind="secondary"
      />
    </Box>
  ) : (
    <Inset spaceX={32} spaceY={32}>
      <Columns space={80}>
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
                  rightAccessory={
                    <Body size="small" color="secondary">
                      ?
                    </Body>
                  }
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
                  rightAccessory={
                    <Body size="small" color="secondary">
                      ⇧ + M
                    </Body>
                  }
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
          <Stack space={16}>
            {tracksRender
              .concat(placeholderTracksRender)
              .slice(
                0,
                Math.max(placeholderTracksRange.length, tracksRender.length)
              )}
          </Stack>
        </Column>
        <Column width="1/5">
          <Stack space={16}>
            <Body size="medium" color="secondary" align="justify">
              To{" "}
              <Body size="medium" weight="strong">
                load a track{" "}
              </Body>
              into the pool, click on the desired audio source from the left
              panel.
            </Body>
            <Body size="medium" color="secondary" align="justify">
              Once a track has been successfully loaded, you may{" "}
              <Body size="medium" weight="strong">
                hover{" "}
              </Body>{" "}
              your cursor over the track to reveal the available controls.
            </Body>
            <Body size="medium" color="secondary" align="justify">
              To{" "}
              <Body size="medium" weight="strong">
                adjust the volume{" "}
              </Body>
              of a selected track, use the side arrow buttons.
            </Body>
            <Body size="medium" color="secondary" align="justify">
              Check out the{" "}
              <Link
                onClick={() => {
                  setShowShortcutsModal(true);
                }}
              >
                <Body size="medium" weight="strong">
                  keyboard shortcuts
                </Body>
              </Link>{" "}
              to streamline your workflow.
            </Body>
          </Stack>
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
