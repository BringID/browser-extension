import IManager, {
} from './types';
import TRunTask from './types/run-task';
import { sendMessage } from '../common/core';

class Manager implements IManager {
  runTask: TRunTask = async (task) => {
    window.setTimeout(() => {
      sendMessage({
        type: 'NOTARIZE',
        task
      });
    }, 1000);
  };
}

const manager = new Manager();

export default manager;
