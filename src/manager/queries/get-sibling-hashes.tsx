const GET_SIBLING_HASHES = `
  query GetSiblingHashes($groupId: String!, $indices: [Int!]!) {
    group(id: $groupId) {
      id
      merkleTree {
        nodes(where: { index_in: $indices }) {
          index
          hash
        }
      }
    }
  }
`
export default GET_SIBLING_HASHES