type TProps = {
  title?: string;
  id: string | number;
  checked: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (checked: boolean) => void;
};

export default TProps;
