import { TNotarizationGroup } from '../../common/types';

type TDefineTaskPointsRange = (groups: TNotarizationGroup[]) => string | null;

const defineTaskPointsRange: TDefineTaskPointsRange = (groups) => {
  if (groups.length === 0) {
    return null;
  }
  if (groups.length === 1) {
    return `${groups[0].points} pts.`;
  }
  const mostPointsAmongGroups = groups.reduce<number>((sum, group) => {
    if (sum < group.points) sum = group.points;
    return sum;
  }, 0);

  return `up to ${mostPointsAmongGroups} pts.`;
};

export default defineTaskPointsRange;
