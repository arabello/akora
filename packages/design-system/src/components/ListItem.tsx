import { Bleed, Body, Box, Children, Column, Columns } from "@buildo/bento-design-system";
import { Status } from "./types";

type Props = React.ComponentProps<typeof Box> & {
  status?: Status;
  onClick?: () => void;
  rightAccessory?: JSX.Element;
  children: Children;
};

export const ListItem = (props: Props) => {
  const status = props.status === undefined ? "default" : props.status;
  return (
    <Box
      {...props}
      cursor={status == "disabled" ? "default" : "pointer"}
      background={
        status === "focused" ? "backgroundSecondary" : "backgroundPrimary"
      }
      paddingY={16}
      paddingX={24}
      onClick={status === "disabled" ? undefined : props.onClick}
    >
      <Columns space={24} alignY="baseline">
        <Column>
          <Body
            size="medium"
            color={status === "disabled" ? "disabled" : "primary"}
          >
            {props.children}
          </Body>
        </Column>
        <Column width="content">
          <Bleed spaceY={16}>
            {props.rightAccessory}
          </Bleed>
        </Column>
      </Columns>
    </Box>
  );
};
