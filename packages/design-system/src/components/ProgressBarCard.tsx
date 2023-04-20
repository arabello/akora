import {
  Box,
  Card,
  Column,
  Columns,
  ProgressBar,
  Stack,
  Title,
} from "@buildo/bento-design-system";
import { useState } from "react";

type Props = React.ComponentPropsWithRef<typeof Box> & {
  title: string;
  progress: number;
  icon?: JSX.Element;
};

export const ProgressBarCard = (props: Props) => {
  const [hover, setHover] = useState(false);

  return (
    <Card>
      <Box
        {...props}
        background={hover ? "backgroundSecondary" : props.background}
        paddingY={16}
        paddingX={32}
        onMouseEnter={(e) => {
          props.onMouseEnter && props.onMouseEnter(e);
          setHover(true);
        }}
        onMouseLeave={(e) => {
          props.onMouseLeave && props.onMouseLeave(e);
          setHover(false);
        }}
      >
        <Stack space={8}>
          <Columns space={0} alignY="center">
            <Column>
              <Title size="large">{props.title}</Title>
            </Column>
            <Column width="content">{props.icon}</Column>
          </Columns>
          <ProgressBar
            kind="continuous"
            value={props.progress}
            maxValue={1}
            label="Progress"
          />
        </Stack>
      </Box>
    </Card>
  );
};
