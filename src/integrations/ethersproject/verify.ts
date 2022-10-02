import { verify as baseVerify } from '../../verify';
import { Web3TokenVerifyOptions } from '../../types';
import { Web3TokenError } from '../../errors';
import { recoverAddress } from '@ethersproject/transactions';

export const verify = (token: string, options?: Web3TokenVerifyOptions) => {
  return baseVerify(token, {
    ...options,
    messageSignatureToAddress,
  })
}

const messageSignatureToAddress = async (message: string, signature: string) => {
  if (!signature) throw new Web3TokenError('w3t signature is required');
  try {
    const recoveredAddress = recoverAddress(message, signature);
    return recoveredAddress.toLowerCase();
    
  } catch(err) {
    throw new Web3TokenError('w3t malformed');
  }
}
