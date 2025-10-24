export type TVerifyResult = {
  verifierHash: string;
  signature: string;
  verifierMessage: {
    registry: string;
    credentialGroupId: string;
    idHash: string;
    identityCommitment: string;
  };
};
