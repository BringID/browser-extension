import { TNotarizationStep } from '../types';

export type Task = {
  title: string;
  description?: string;
  icon?: string;
  points: number;
  semaphoreGroupId: string;
  credentialGroupId: string;
  steps: TNotarizationStep[];
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
      if (typeof task.title !== 'string' || typeof task.points !== 'number') {
        console.warn('Invalid task format:', task);
        throw new Error('Invalid task format');
      }

      return {
        title: task.title,
        description: task.description,
        icon: task.icon,
        points: task.points,
        semaphoreGroupId: task.semaphoreGroupId,
        credentialGroupId: task.credentialGroupId,
        steps: task.steps,
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
