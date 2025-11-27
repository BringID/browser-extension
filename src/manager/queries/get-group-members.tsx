const GET_GROUP_MEMBERS = `
  query GetGroupMembers($groupId: ID!) {
    group(id: $groupId) {
      id
      members {
        id
        identityCommitment
        index
      }
    }
  }
`

export default GET_GROUP_MEMBERS
