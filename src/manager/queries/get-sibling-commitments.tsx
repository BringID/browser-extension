const GET_SIBLINGS_COMMITMENTS = `
  query GetSiblings($groupId: String!, $indices: [Int!]!) {
    group(id: $groupId) {
      id
      members(where: { index_in: $indices }) {
        index
        identityCommitment
      }
    }
  }
`
export default GET_SIBLINGS_COMMITMENTS