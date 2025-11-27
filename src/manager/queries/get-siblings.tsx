const GET_SIBLINGS = `
  query GetSiblings($groupId: ID!, $indices: [Int!]!) {
    group(id: $groupId) {
      id
      members(where: { index_in: $indices }, orderBy: index) {
        index
        identityCommitment
      }
    }
  }
`

export default GET_SIBLINGS