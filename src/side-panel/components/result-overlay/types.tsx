type TProps = {
  onAccept: () => void;
  onReject: () => void;
  taskIndex: number;
  transcriptRecv: string;
  transcriptSent: string;
  masterKey: string;
};

export default TProps;
