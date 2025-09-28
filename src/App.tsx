import { Body, IconButton, IconX } from "@buildo/bento-design-system";
import { useRef, useState } from "react";
import "./app.css";
import { ListItem, ProgressBarCard, TrackControls } from "./components";
import { KB, useKeyBinding, useKeyPress } from "./keybinding";
import { MobileLayout } from "./layouts/MobileLayout";
import { useResponsiveLayout } from "./layouts/useResponsiveLayout";
import { WebLayout } from "./layouts/WebLayout";
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
      Object.values(tracks).every(isTrack),
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

// Responsive layout selected via matchMedia rather than UA sniffing

const App = () => {
  /**
   * Mixer
   */
  useKeyPress();
  const session = firstMount ? sessionRepo.read() || {} : {};
  const [showOverlay, setShowOverlay] = useState(
    firstMount && Object.keys(session).length > 0,
  );
  firstMount = false;
  const [aboutModalShow, setAboutModalShow] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const { isMobile } = useResponsiveLayout();

  const mixer = useMixer(Object.values(session), () => setShowOverlay(false));
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
    {},
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
      (s) => s.id === FID.source.from(currentFocusId),
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
    const iconRemove = isFocused ? (
      <IconButton
        icon={IconX}
        size={12}
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
    ) : undefined;
    return (
      <TrackControls
        key={`track-container-${track.id}`}
        variant="default"
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

  const placeholderTracksRange = [
    ...Array(Math.max(0, 6 - tracksRender.length)),
  ];
  const placeholderTracksRender = placeholderTracksRange.flatMap((_, i) => (
    <TrackControls
      key={`placeholder-track-container-${i}`}
      variant={isMobile ? "mobile" : "default"}
      showControls={false}
      style={{ opacity: 1 - i / placeholderTracksRange.length }}
    >
      <ProgressBarCard
        key={`placeholder-track-${i}`}
        title="&#8205;" // Use of U+2000 to render an empty block with the same height as a title
        progress={0}
      />
    </TrackControls>
  ));

  // Mobile-specific tracks render: full-width cards, volume via horizontal drag
  // Persist drag state across renders to avoid losing pointer interaction mid-drag
  const dragStateRef = useRef<
    Record<string, { x: number; vol: number; active: boolean }>
  >({});
  const mobileTracksRender = Object.values(tracks).map((track) => {
    const sensitivityPx = 200; // horizontal pixels to go from 0 to 1 volume

    // Ensure a state bucket exists for this track
    if (!dragStateRef.current[track.id]) {
      dragStateRef.current[track.id] = {
        x: 0,
        vol: track.volume,
        active: false,
      };
    }
    const state = dragStateRef.current[track.id];

    const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
      state.x = e.clientX;
      state.vol = track.volume;
      state.active = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
      if (!state.active) return;
      const dx = e.clientX - state.x;
      const delta = dx / sensitivityPx;
      const next = Math.max(0, Math.min(1, state.vol + delta));
      mixer.setVolume(track.id, next);
    };

    const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
      state.active = false;
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    };

    return (
      <ProgressBarCard
        key={`mtrack-${track.id}`}
        title={track.name}
        progress={track.volume}
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        icon={
          <IconButton
            icon={IconX}
            size={12}
            kind="transparent"
            hierarchy="primary"
            label=""
            onPress={() => {
              mixer.unload(track.id);
              focusClear();
            }}
          />
        }
      />
    );
  });

  const mobileTracksWithPlaceholders = mobileTracksRender.concat(
    placeholderTracksRender,
  );

  return isMobile ? (
    <MobileLayout
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      tracksRender={mobileTracksWithPlaceholders}
      filteredSources={filteredSources}
      onSelectSource={(id, url) => {
        mixer.load(id, url);
      }}
      aboutModalShow={aboutModalShow}
      setAboutModalShow={setAboutModalShow}
      mute={mute}
      setMute={setMute}
    />
  ) : (
    <WebLayout
      showOverlay={showOverlay}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      mute={mute}
      setMute={setMute}
      aboutModalShow={aboutModalShow}
      setAboutModalShow={setAboutModalShow}
      showShortcutsModal={showShortcutsModal}
      setShowShortcutsModal={setShowShortcutsModal}
      sourcesRender={sourcesRender}
      tracksRender={tracksRender}
      placeholderTracksRender={placeholderTracksRender}
    />
  );
};
export default App;
