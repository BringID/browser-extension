import { Task } from '../core';
import { TVerification } from '../types';

const defineRelatedVerification = (
  task: Task,
  verifications: TVerification[],
) => {
  if (!task?.groups || !Array.isArray(verifications)) return null;

  for (const group of task.groups) {
    const matchingVerification = verifications.find(
      (verification) =>
        verification.credentialGroupId === group.credentialGroupId,
    );
    if (matchingVerification) {
      return matchingVerification;
    }
  }

  return null; // No related verification found
};

export default defineRelatedVerification;
