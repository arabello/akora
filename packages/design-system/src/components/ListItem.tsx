import { Bleed, Body, Box, Children } from "@buildo/bento-design-system";
import { useState } from "react";

type Props = React.ComponentProps<typeof Box> & {
  disabled?: boolean;
  onClick?: () => void;
  leftAccessory?: JSX.Element;
  rightAccessory?: JSX.Element;
  children: Children;
};

export const ListItem = (props: Props) => {
  const [hover, setHover] = useState(false);
  const disabled = props.disabled || false;

  return (
    <Box
      {...props}
      cursor={disabled ? "default" : "pointer"}
      background={hover ? "backgroundSecondary" : props.background}
      paddingX={16}
      paddingY={8}
      onClick={disabled ? undefined : props.onClick}
      onMouseEnter={(e) => {
        props.onMouseEnter && props.onMouseEnter(e);
        setHover(true);
      }}
      onMouseLeave={(e) => {
        props.onMouseLeave && props.onMouseLeave(e);
        setHover(false);
      }}
      display="flex"
      gap={8}
      alignItems="center"
    >
      <Bleed spaceY={16}>{props.leftAccessory}</Bleed>
      <Box flex={1}>
        <Body size="medium" color={disabled ? "disabled" : "primary"}>
          {props.children}
        </Body>
      </Box>
      <Bleed spaceY={16}>{props.rightAccessory}</Bleed>
    </Box>
  );
};
