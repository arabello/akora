import { Bleed, Body, Box, Children } from "@buildo/bento-design-system";
import { useState } from "react";

type ListItemProps = {
  disabled?: boolean;
  onClick?: () => void;
  leftAccessory?: JSX.Element;
  rightAccessory?: JSX.Element;
  children: Children;
};
type Props = React.ComponentProps<typeof Box> & ListItemProps;

export const ListItem = (props: Props) => {
  const [hover, setHover] = useState(false);
  const {
    disabled = false,
    onClick,
    leftAccessory,
    rightAccessory,
    children,
    ...boxProps
  } = props;
  const {
    onMouseEnter = () => {},
    onMouseLeave = () => {},
    background,
    ...restBoxProps
  } = boxProps;
  return (
    <Box
      {...restBoxProps}
      cursor={disabled ? "default" : "pointer"}
      background={hover ? "backgroundSecondary" : background}
      paddingX={8}
      paddingY={4}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={(e) => {
        onMouseEnter(e);
        setHover(true);
      }}
      onMouseLeave={(e) => {
        onMouseLeave(e);
        setHover(false);
      }}
      display="flex"
      gap={8}
      alignItems="center"
      borderRadius={4}
    >
      <Bleed spaceY={16}>{leftAccessory}</Bleed>
      <Box flex={1}>
        <Body size="medium" color={disabled ? "disabled" : "primary"}>
          {children}
        </Body>
      </Box>
      <Bleed spaceY={16}>{rightAccessory}</Bleed>
    </Box>
  );
};
