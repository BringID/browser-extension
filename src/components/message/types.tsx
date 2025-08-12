export type TMessageStatus = 'error' | 'default' | 'warning';

type TProps = {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  status?: TMessageStatus;
};

export default TProps;
