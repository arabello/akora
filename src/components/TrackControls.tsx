import {
  Box,
  Column,
  Columns,
  IconButton,
  IconChevronLeft,
  IconChevronRight,
} from "@buildo/bento-design-system";

type Props = React.ComponentProps<typeof Box> & {
  variant?: "default" | "mobile";
  children: JSX.Element;
  showControls: boolean;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onLeave?: () => void;
};

export const TrackControls = ({
  variant = "default",
  showControls,
  onArrowLeft = () => {},
  onArrowRight = () => {},
  onEnter,
  onLeave,
  children,
  ...boxProps
}: Props) => {
  return (
    <Box onMouseEnter={onEnter} onMouseLeave={onLeave} {...boxProps}>
      <Columns space={24} alignY="center">
        {variant === "default" ? (
          <Column width="content">
            <Box style={{ visibility: showControls ? "visible" : "hidden" }}>
              <IconButton
                icon={IconChevronLeft}
                size={12}
                kind="transparent"
                hierarchy="primary"
                label=""
                onPress={onArrowLeft}
              />
            </Box>
          </Column>
        ) : null}
        <Column width="full">{children}</Column>
        {variant === "default" ? (
          <Column width="content">
            <Box style={{ visibility: showControls ? "visible" : "hidden" }}>
              <IconButton
                icon={IconChevronRight}
                size={12}
                kind="transparent"
                hierarchy="primary"
                label=""
                onPress={onArrowRight}
              />
            </Box>
          </Column>
        ) : null}
      </Columns>
    </Box>
  );
};
