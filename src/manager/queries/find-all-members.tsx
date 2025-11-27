const FIND_ALL_MEMBERS = `
  query FindAllMembers {
    members {
      id
      identityCommitment
      index
      group {
        id
        merkleTree {
          depth
          size
        }
      }
    }
  }
`

export default FIND_ALL_MEMBERS
