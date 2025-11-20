import { TVerification } from '../types';
import defineTaskByCredentialGroupId from './define-task-by-credential-group-id';

function calculateAvailablePoints(verifications: TVerification[], devMode: boolean): number {
  let points = 0;
  verifications.forEach((verification) => {
    if (verification.status !== 'completed') {
      return;
    }
    const relatedTask = defineTaskByCredentialGroupId(
      verification.credentialGroupId,
      devMode
    );

    if (!relatedTask) {
      return;
    }

    const { group } = relatedTask;

    points = points + (group.points || 0);
  });
  return points;
}

export default calculateAvailablePoints;
