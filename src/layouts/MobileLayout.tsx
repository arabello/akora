import {
  Box,
  Button,
  Headline,
  Inset,
  Stack,
  Toast,
} from "@buildo/bento-design-system";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  AboutModal,
  IconInfo,
  IconMute,
  IconVolume,
  ListItem,
  SearchBar,
} from "../components";
import { Source } from "../sources";
import { isAudioSuspended, resumeAudio } from "../mixer";

export type MobileLayoutProps = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tracksRender: JSX.Element[];
  filteredSources: Source[];
  onSelectSource: (id: string, url: string) => void;
  aboutModalShow: boolean;
  setAboutModalShow: (v: boolean) => void;
  mute: boolean;
  setMute: (v: boolean) => void;
};

export const MobileLayout = (props: MobileLayoutProps) => {
  const {
    searchQuery,
    setSearchQuery,
    tracksRender,
    filteredSources,
    onSelectSource,
    aboutModalShow,
    setAboutModalShow,
    mute,
    setMute,
  } = props;
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showAudioHint, setShowAudioHint] = useState(true);
  const [showDragControlHint, setShowDragControlHint] = useState<
    boolean | undefined
  >(undefined);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [overlayTop, setOverlayTop] = useState<number>(0);
  useEffect(() => {
    const t = setInterval(() => {
      if (isAudioSuspended()) {
        resumeAudio();
      }
    }, 500);
    return () => clearInterval(t);
  }, []);

  const handleOnSelectSource = (id: string, url: string) => {
    onSelectSource(id, url);
    if (showDragControlHint === undefined) {
      setShowDragControlHint(true);
      setTimeout(() => setShowDragControlHint(false), 5000);
    }
  };

  // Measure header height to place overlay under the search bar
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setOverlayTop(headerRef.current.getBoundingClientRect().bottom);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    // Disable background scroll when overlay is open
    const original = document.body.style.overflow;
    if (overlayOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [overlayOpen]);

  // Auto-hide toast after a few seconds
  useEffect(() => {
    if (!showAudioHint) return;
    const t = setTimeout(() => setShowAudioHint(false), 10000);
    return () => clearTimeout(t);
  }, [showAudioHint]);

  const sourcesList = useMemo(
    () =>
      filteredSources.map((s) => (
        <ListItem
          key={s.id}
          onClick={() => {
            handleOnSelectSource(s.id, s.url);
            setSearchQuery("");
            setOverlayOpen(false);
          }}
        >
          {s.name}
        </ListItem>
      )),
    [filteredSources, handleOnSelectSource],
  );

  return (
    <Box style={{ minHeight: "100vh", position: "relative" }}>
      <Inset spaceX={16} spaceY={16}>
        <Stack space={16}>
          <Box
            ref={headerRef as any}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={16}
          >
            <Headline size="large">Akora</Headline>
            <Box
              width="full"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <Button
                icon={IconInfo}
                size="small"
                kind="transparent"
                hierarchy="secondary"
                label="About"
                onPress={() => setAboutModalShow(true)}
              />
              <Button
                icon={mute ? IconMute : IconVolume}
                size="small"
                kind="transparent"
                hierarchy="secondary"
                label="Mute"
                onPress={() => setMute(!mute)}
              />
            </Box>
            <Box width="full" onClick={() => setOverlayOpen(true)}>
              <SearchBar
                data-focus-id="searchbar"
                aria-label="Search for sources"
                placeholder="Search for sources..."
                value={searchQuery}
                onChange={setSearchQuery}
                onBlur={() => setTimeout(() => setOverlayOpen(false), 200)}
              />
            </Box>
          </Box>
          <Stack space={12}>{tracksRender}</Stack>
        </Stack>
      </Inset>
      {overlayOpen && (
        <Box
          position="fixed"
          style={{ left: 0, right: 0, top: overlayTop, bottom: 0 }}
        >
          {/* Backdrop under content */}
          <Box
            position="absolute"
            inset={0}
            style={{ backgroundColor: "transparent", zIndex: 0 }}
          />
          {/* Content */}
          <Box
            position="absolute"
            style={{
              left: 0,
              right: 0,
              top: 0,
              backgroundColor: "#fff",
              zIndex: 1,
              overflowY: "auto",
              maxHeight: "70vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Inset spaceX={16} spaceY={8}>
              <Stack space={8}>{sourcesList}</Stack>
            </Inset>
          </Box>
        </Box>
      )}
      {showAudioHint && (
        <Box
          position="fixed"
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ left: 0, right: 0, bottom: 16, zIndex: 1000 }}
        >
          <Toast
            // Non-dismissible: omit any close handler/UI
            message="Turn off silent mode."
            kind="warning"
          />
        </Box>
      )}
      {showDragControlHint && (
        <Box
          position="fixed"
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ left: 0, right: 0, bottom: 16, zIndex: 1000 }}
        >
          <Toast
            // Non-dismissible: omit any close handler/UI
            message="Scroll horizontally to adjust the volume."
            kind="informative"
          />
        </Box>
      )}
      {aboutModalShow && (
        <AboutModal onClose={() => setAboutModalShow(false)} />
      )}
    </Box>
  );
};
