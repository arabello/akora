import { Box } from "@buildo/bento-design-system";

type Props = React.ComponentProps<typeof Box> & {
  children: JSX.Element;
};

export const Overlay = (props: Props) => {
  const { children, position, inset, style, ...rest } = props;
  const { backdropFilter, zIndex, backgroundColor, ...restStyle } = style || {};
  return (
    <Box
      position="absolute"
      inset={0}
      style={{
        backdropFilter: "blur(5px)",
        zIndex: 1,
        backgroundColor: "rgba(179, 190, 255, 0.1)",
        ...restStyle,
      }}
      {...rest}
    >
      {props.children}
    </Box>
  );
};
