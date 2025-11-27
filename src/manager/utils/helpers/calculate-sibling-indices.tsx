function calculateSiblingIndices(leafIndex: number, treeDepth: number): number[][] {
  const allSiblings: number[][] = []
  let currentIndex = leafIndex

  for (let level = 0; level < treeDepth; level++) {
    const isRightNode = currentIndex % 2 === 1
    const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1
    allSiblings.push([siblingIndex])
    currentIndex = Math.floor(currentIndex / 2)
  }

  return allSiblings
}

export default calculateSiblingIndices