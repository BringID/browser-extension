type TRunTask = (
  taskId: number,
  masterKey: string
) => Promise<void>;

export default TRunTask;
