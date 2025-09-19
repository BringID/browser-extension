function areObjectsEqual<T extends Record<string, any>>(obj1: T, obj2: T): boolean {
  const keys1 = Object.keys(obj1) as Array<keyof T>;
  const keys2 = Object.keys(obj2) as Array<keyof T>;

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (typeof val1 === 'object' && val1 !== null &&
        typeof val2 === 'object' && val2 !== null) {
      return areObjectsEqual(val1, val2); // recursive for nested objects
    }

    return val1 === val2;
  });
}

export default areObjectsEqual