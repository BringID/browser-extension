import { ethers } from 'ethers';

function calculateScope(contractAddress: string): string {
  const cleanAddress = contractAddress.toLowerCase().replace('0x', '');

  if (cleanAddress.length !== 40) {
    throw new Error('Invalid contract address length');
  }
  const fullAddress = '0x' + cleanAddress;

  const types = ['address', 'uint256'];
  const values = [fullAddress, 0];

  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(types, values);

  const hash = ethers.keccak256(encoded);

  const result = ethers.getBigInt(hash);

  return result.toString();
}

export default calculateScope;
