type Props = {
  items: Array<{ id: string; label: string }>;
  isClickable?: (item: { id: string; label: string }) => boolean;
  onClick?: (item: { id: string; label: string }) => void;
};

export const ItemList = (props: Props) => (
  <ul>
    {props.items.map((item) => (
      <li key={item.id}>
        {props.isClickable && props.isClickable(item) ? (
          <a href="#" onClick={() => props.onClick && props.onClick(item)}>
            {item.label}
          </a>
        ) : (
          <span>{item.label}</span>
        )}
      </li>
    ))}
  </ul>
);
