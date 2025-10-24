type TProps = {
  onAccept: () => void;
  onReject: () => void;
  title: string;
  transcriptRecv: string;
  transcriptSent: string;
  loading: boolean;
};

export default TProps;
