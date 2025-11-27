const GET_MEMBER_INDEX = `
  query GetMemberIndex($identityCommitment: BigInt!) {
    members(where: { identityCommitment: $identityCommitment }) {
      index
    }
  }
`

export default GET_MEMBER_INDEX
