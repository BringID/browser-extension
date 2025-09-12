import { TNotarizationGroup } from "../../common/types";

type GroupMatchResult = {
  semaphoreGroupId: string;
  credentialGroupId: string;
  points: number;
} | null;

function defineGroup (rawData: string, groups: TNotarizationGroup[]): GroupMatchResult {
  // ✅ 1. Shortcut: If only one group, return it without checks
  if (groups.length === 1) {
    const group = groups[0];
    return {
      semaphoreGroupId: group.semaphoreGroupId,
      credentialGroupId: group.credentialGroupId,
      points: group.points,
    };
  }

  const extractedValues: Record<string, number> = {};

  // ✅ 2. Collect all keys needed for checks across groups
  const keysToExtract = Array.from(
    new Set(
      groups.flatMap(group =>
        group.checks?.map(check => check.key) ?? []
      )
    )
  );

  // ✅ 3. Extract values from raw string using RegExp
  for (const key of keysToExtract) {
    const regex = new RegExp(`"${key}":"?(\\d+)"?`);
    const match = rawData.match(regex);
    if (match) {
      extractedValues[key] = parseInt(match[1], 10);
    }
  }

  // ✅ 4. Sort groups by descending points
  const sortedGroups = [...groups].sort((a, b) => b.points - a.points);

  // ✅ 5. Evaluate each group
  for (const group of sortedGroups) {
    const checks = group.checks;

    // ✅ If group has no checks, it's automatically valid
    if (!checks || checks.length === 0) {
      return {
        semaphoreGroupId: group.semaphoreGroupId,
        credentialGroupId: group.credentialGroupId,
        points: group.points,
      };
    }

    let allChecksPass = true;

    for (const check of checks) {
      const actual = extractedValues[check.key];
      const expected = parseFloat(check.value);

      if (actual === undefined || isNaN(expected)) {
        allChecksPass = false;
        break;
      }

      switch (check.type) {
        case "gte":
          if (!(actual >= expected)) allChecksPass = false;
          break;
        case "gt":
          if (!(actual > expected)) allChecksPass = false;
          break;
        case "lte":
          if (!(actual <= expected)) allChecksPass = false;
          break;
        case "lt":
          if (!(actual < expected)) allChecksPass = false;
          break;
        case "eq":
          if (!(actual === expected)) allChecksPass = false;
          break;
        default:
          allChecksPass = false;
      }

      if (!allChecksPass) break;
    }

    if (allChecksPass) {
      return {
        semaphoreGroupId: group.semaphoreGroupId,
        credentialGroupId: group.credentialGroupId,
        points: group.points,
      };
    }
  }

  // ✅ 6. No valid group found
  return null;
}

export default defineGroup