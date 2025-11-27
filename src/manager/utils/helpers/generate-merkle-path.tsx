import findMemberByIdentity from "./find-member-by-identity"
import calculateSiblingIndices from "./calculate-sibling-indices"
import fetchSiblingsForPath from "./fetch-siblings-for-path"

async function generateMerklePath(identityCommitment: string): Promise<any> {
  try {
    // Find the member by identity commitment
    const memberInfo = await findMemberByIdentity(identityCommitment);
  
    if (!memberInfo) {
      throw new Error(`Member with identity commitment ${identityCommitment} not found`);
    }

    const { index: memberIndex, group } = memberInfo
    console.log({ memberIndex, group })

    const { depth: treeDepth, size: treeSize } = (group as any).merkleTree

    // Calculate all sibling indices needed for the path
    const siblingIndicesPerLevel = calculateSiblingIndices(memberIndex, treeDepth)
    const allSiblingIndices = siblingIndicesPerLevel.flat();

    // Filter out indices that are beyond the tree size (these will be zero hashes)
    const validSiblingIndices = allSiblingIndices.filter(index => index < treeSize)

    // Fetch sibling values from the subgraph
    const siblingsMap = await fetchSiblingsForPath((group as any).id, validSiblingIndices);

    // Build the path elements and indices
    const pathElements: string[] = []
    const pathIndices: number[] = []

    let currentIndex = memberIndex;
    for (let level = 0; level < treeDepth; level++) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      // Get sibling value or use zero hash if beyond tree size
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
      group
    }
  } catch (error) {
    console.error('Error generating Merkle path:', error);
    throw error;
  }
}

export default generateMerklePath