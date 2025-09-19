function areArraysEqual(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) return false;

  // Sort both arrays by a unique key or full JSON string to ensure consistent order
  const sorted1 = [...arr1].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const sorted2 = [...arr2].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  return sorted1.every((item, index) => {
    return JSON.stringify(item) === JSON.stringify(sorted2[index]);
  });
}

export default areArraysEqual