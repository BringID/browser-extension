import calculateSiblingIndices from "./calculate-sibling-indices"
import fetchSiblingsForPath from "./fetch-siblings-for-path";

async function generateMerklePathFromIndex(
  groupId: string,
  memberIndex: number,
  treeDepth: number,
  treeSize: number
): Promise<any> {
  try {
    // Calculate sibling indices
    const siblingIndicesPerLevel = calculateSiblingIndices(memberIndex, treeDepth);
    const allSiblingIndices = siblingIndicesPerLevel.flat();
    const validSiblingIndices = allSiblingIndices.filter(index => index < treeSize);

    // Fetch sibling values
    const siblingsMap = await fetchSiblingsForPath(groupId, validSiblingIndices);

    // Build path
    const pathElements: string[] = [];
    const pathIndices: number[] = [];

    let currentIndex = memberIndex;
    for (let level = 0; level < treeDepth; level++) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      const siblingValue = siblingIndex < treeSize 
        ? siblingsMap.get(siblingIndex) || '0' 
        : '0';
      
      pathElements.push(siblingValue);
      pathIndices.push(isRightNode ? 0 : 1);
      
      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      memberIndex,
      treeDepth,
      treeSize,
      pathElements,
      pathIndices,
      
    };
  } catch (error) {
    console.error('Error generating Merkle path from index:', error);
    throw error;
  }
}

export default generateMerklePathFromIndex