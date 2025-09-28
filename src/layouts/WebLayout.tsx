import {
  Body,
  Box,
  Chip,
  Column,
  Columns,
  Headline,
  Inline,
  Inset,
  Link,
  Stack,
} from "@buildo/bento-design-system";
import { Overlay } from "../components/Overlay";
import {
  AboutModal,
  IconInfo,
  IconMute,
  IconSliders,
  IconVolume,
  ListItem,
  SearchBar,
  ShortcutsModal,
} from "../components";
import { IconHeart } from "../components/Icons/IconHeart";

export type WebLayoutProps = {
  showOverlay: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  mute: boolean;
  setMute: (v: boolean) => void;
  aboutModalShow: boolean;
  setAboutModalShow: (v: boolean) => void;
  showShortcutsModal: boolean;
  setShowShortcutsModal: (v: boolean) => void;
  sourcesRender: JSX.Element[];
  tracksRender: JSX.Element[];
  placeholderTracksRender: JSX.Element[];
};

export const WebLayout = (props: WebLayoutProps) => {
  const {
    showOverlay,
    searchQuery,
    setSearchQuery,
    mute,
    setMute,
    aboutModalShow,
    setAboutModalShow,
    showShortcutsModal,
    setShowShortcutsModal,
    sourcesRender,
    tracksRender,
    placeholderTracksRender,
  } = props;

  const placeholderTracksRange = [...Array(7)];

  return (
    <Box>
      {showOverlay && (
        <Overlay style={{ height: "110vh" }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="full"
          >
            <Stack space={4} align="center">
              <Body size="large">Press any key</Body>
              <Body size="large">to resume</Body>
            </Stack>
          </Box>
        </Overlay>
      )}
      <Box style={{ height: "100vh" }}>
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
                        <IconInfo size={16} color="primary" />
                      ))()}
                    >
                      About
                    </ListItem>
                    <ListItem
                      onClick={() => setShowShortcutsModal(true)}
                      leftAccessory={(() => (
                        <IconSliders size={16} color="primary" />
                      ))()}
                      rightAccessory={
                        <Body size="small" color="secondary">
                          ?
                        </Body>
                      }
                    >
                      Shortcuts
                    </ListItem>
                    <ListItem
                      onClick={() => setMute(!mute)}
                      leftAccessory={(() =>
                        mute ? (
                          <IconMute size={16} color="informative" />
                        ) : (
                          <IconVolume size={16} color="primary" />
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
                    Math.max(
                      placeholderTracksRange.length,
                      tracksRender.length,
                    ),
                  )}
              </Stack>
            </Column>
            <Column width="1/5">
              <Stack space={16}>
                <Body size="medium" color="secondary" align="justify">
                  Click on a source from the left panel to{" "}
                  <Body size="medium" weight="strong">
                    load a track{" "}
                  </Body>
                  into the pool.
                </Body>
                <Body size="medium" color="secondary" align="justify">
                  You may{" "}
                  <Body size="medium" weight="strong">
                    hover{" "}
                  </Body>{" "}
                  over the loaded track to reveal the available controls.
                </Body>
                <Body size="medium" color="secondary" align="justify">
                  Use the side arrow buttons to{" "}
                  <Body size="medium" weight="strong">
                    adjust the volume{" "}
                  </Body>
                  of a selected track.
                </Body>
                <Body size="medium" color="secondary" align="justify">
                  Check out the{" "}
                  <Body size="medium" weight="strong">
                    keyboard shortcuts
                  </Body>{" "}
                  to streamline your workflow.
                </Body>
                <Body size="medium" color="secondary" align="justify">
                  Loaded tracks will be saved if you leave the app. When you
                  came back, {""}
                  <Body size="medium" weight="strong">
                    click{" "}
                  </Body>{" "}
                  on anything to resume the audio.
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
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        paddingTop={16}
        paddingBottom={16}
        style={{ height: "10vh" }}
      >
        <Inline space={4}>
          <Body size="small" color="secondary">
            Made with
          </Body>
          <IconHeart size={12} color="secondary" />
          <Body size="small" color="secondary">
            by
          </Body>
          <Link href="https://www.matteopellegrino.dev" target="blank">
            <Body size="small" color="secondary">
              Matteo Pellegrino.
            </Body>
          </Link>
          <Body size="small" color="secondary">
            Sounds
          </Body>
          <Link
            href="https://github.com/arabello/night-focus/blob/main/README.md"
            target="blank"
          >
            <Body size="small" color="secondary">
              credits.
            </Body>
          </Link>
        </Inline>
      </Box>
    </Box>
  );
};
