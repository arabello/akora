import {
  Box,
  Card,
  Column,
  Columns,
  ProgressBar,
  Stack,
  Title,
} from "@buildo/bento-design-system";

type Props = React.ComponentPropsWithRef<typeof Box> & {
  title: string;
  progress: number;
  icon?: JSX.Element;
};

export const ProgressBarCard = (props: Props) => {
  return (
    <Card elevation="small">
      <Box
        tabIndex={0}
        background={
          props.background === undefined
            ? props.background
            : "backgroundPrimary"
        }
        paddingY={16}
        paddingX={32}
        {...props}
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
