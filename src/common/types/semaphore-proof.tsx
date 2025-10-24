export type TSemaphoreProof = {
  credential_group_id: string;
  semaphore_proof: {
    merkle_tree_depth: number;
    merkle_tree_root: string;
    nullifier: string;
    message: string;
    scope: string;
    points: string[];
  };
};
