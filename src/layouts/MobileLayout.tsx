import {
  Box,
  Button,
  Column,
  Columns,
  Headline,
  IconButton,
  IconInfoCircle,
  Inset,
  Stack,
} from "@buildo/bento-design-system";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  AboutModal,
  IconMute,
  IconVolume,
  ListItem,
  SearchBar,
} from "../components";
import { Source } from "../sources";

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
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [overlayTop, setOverlayTop] = useState<number>(0);

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

  const sourcesList = useMemo(
    () =>
      filteredSources.map((s) => (
        <ListItem
          key={s.id}
          onClick={() => {
            onSelectSource(s.id, s.url);
            setSearchQuery("");
            setOverlayOpen(false);
          }}
        >
          {s.name}
        </ListItem>
      )),
    [filteredSources, onSelectSource],
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
            <Headline size="large">Night Focus</Headline>
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
                icon={IconInfoCircle}
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
      {aboutModalShow && (
        <AboutModal onClose={() => setAboutModalShow(false)} />
      )}
    </Box>
  );
};
