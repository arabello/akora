import {
  Box,
  Card,
  Column,
  Columns,
  ProgressBar,
  Stack,
  Title,
} from "@buildo/bento-design-system";
import { Status } from "./types";

type Props = React.ComponentPropsWithRef<typeof Box> & {
  title: string;
  progress: number;
  icon?: JSX.Element;
  status?: Exclude<Status, "disabled">;
};

export const ProgressBarCard = (props: Props) => {
  const status = props.status === undefined ? "default" : props.status;
  return (
    <Card elevation="small">
      <Box
        {...props}
        background={
          status === "focused" ? "backgroundSecondary" : "backgroundPrimary"
        }
        paddingY={16}
        paddingX={32}
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
