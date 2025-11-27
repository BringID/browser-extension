const GET_SIBLINGS_AT_LEVEL = `
  query GetSiblingsAtLevel($groupId: ID!, $indices: [Int!]!) {
    group(id: $groupId) {
      id
      members(where: { index_in: $indices }, orderBy: index) {
        index
        identityCommitment
      }
    }
  }
`

export default GET_SIBLINGS_AT_LEVEL
