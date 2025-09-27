import { TNotarizationStep, TNotarizationGroup } from '../types';

export type Task = {
  id: string;
  title: string;
  description?: string;
  icon: string;
  groups: TNotarizationGroup[];
  steps: TNotarizationStep[];
  dev?: boolean;
  permissionUrl: string[]
};

function loadTasks(): Task[] {
  try {
    const tasksConfig = require('../../../cfg/tasks.json');

    // Validate that it's an array
    if (!Array.isArray(tasksConfig)) {
      console.error('Tasks config is not an array');
      return [];
    }

    // Parse and validate each task
    return tasksConfig.map((task): Task => {
      // Ensure required fields are present
      if (typeof task.title !== 'string' || !task.groups) {
        console.warn('Invalid task format:', task);
        throw new Error('Invalid task format');
      }

      return {
        title: task.title,
        id: task.id,
        description: task.description,
        icon: task.icon,
        groups: task.groups,
        steps: task.steps,
        dev: task.dev,
        permissionUrl: task.permissionUrl
      };
    });
  } catch (error) {
    console.error('Failed to parse tasks config:', error);
    return [];
  }
}

const TASKS = loadTasks();
export function tasks(): Task[] {
  return [...TASKS];
}
