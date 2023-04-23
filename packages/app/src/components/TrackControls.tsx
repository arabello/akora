import {
  Box,
  Column,
  Columns,
  Conceal,
  IconButton,
  IconChevronLeft,
  IconChevronRight,
} from "@night-focus/design-system";

type Props = {
  children: JSX.Element;
  showControls: boolean;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onLeave?: () => void;
};

export const TrackControls = (props: Props) => {
  const { onArrowLeft = () => {}, onArrowRight = () => {} } = props;

  return (
    <Box onMouseEnter={props.onEnter} onMouseLeave={props.onLeave}>
      <Columns space={24} alignY="center">
        <Column width="content">
          <Conceal visible={props.showControls}>
            <IconButton
              icon={IconChevronLeft}
              size={8}
              kind="transparent"
              hierarchy="primary"
              label=""
              onPress={onArrowLeft}
            />
          </Conceal>
        </Column>
        {props.children}
        <Column width="content">
          <Conceal visible={props.showControls}>
            <IconButton
              icon={IconChevronRight}
              size={8}
              kind="transparent"
              hierarchy="primary"
              label=""
              onPress={onArrowRight}
            />
          </Conceal>
        </Column>
      </Columns>
    </Box>
  );
};
