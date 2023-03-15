type Props = {
  children: JSX.Element;
  visible: boolean;
};

export const Conceal = (props: Props) => (
  <div style={{ visibility: props.visible ? "visible" : "hidden" }}>
    {props.children}
  </div>
);
