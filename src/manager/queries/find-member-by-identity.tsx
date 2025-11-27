const FIND_MEMBER_BY_IDENTITY = `
  query FindMemberByIdentity($identityCommitment: BigInt!) {
    members(where: { identityCommitment: $identityCommitment }) {
      id
      identityCommitment
      index
      group {
        id
        merkleTree {
          depth
          size
          root
        }
      }
    }
  }
`

export default FIND_MEMBER_BY_IDENTITY
