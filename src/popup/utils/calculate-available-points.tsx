import { tasks } from '../../common/core';
import { TVerification } from '../types';

function calculateAvailablePoints(verifications: TVerification[]): number {
  let points = 0;
  const availableTasks = tasks();
  verifications.forEach((verification) => {
    if (verification.status !== 'completed') {
      return;
    }
    const taskId = verification.credentialGroupId;
    const relatedTask = availableTasks.find(
      (task) => task.credentialGroupId === taskId,
    );
    points = points + (relatedTask?.points || 0);
  });
  return points;
}

export default calculateAvailablePoints;
