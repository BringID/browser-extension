type TProps = {
  onAccept: () => void;
  onReject: () => void;
  title: string;
  transcriptRecv: string;
  transcriptSent: string;
  presentationData: string;
  loading: boolean;
};

export default TProps;
