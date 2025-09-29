type TProps = {
  onAccept: () => void;
  onReject: () => void;
  taskIndex: number;
  transcriptRecv?: string;
  transcriptSent?: string;
};

export default TProps;
