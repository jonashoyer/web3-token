import { verify as baseVerify } from '../../verify';
import { Web3TokenVerifyOptions } from '../../types';
import { Web3TokenError } from '../../errors';
import { verifyMessage } from '@ethersproject/wallet';

export const verify = <T extends string>(token: string, options?: Web3TokenVerifyOptions<T>) => {
  return baseVerify(token, {
    ...options,
    messageSignatureToAddress,
  })
}

const messageSignatureToAddress = async (message: string, signature: string) => {
  if (!signature) throw new Web3TokenError('w3t signature is required');
  try {
    const recoveredAddress = verifyMessage(message, signature);
    return recoveredAddress.toLowerCase();
    
  } catch(err) {
    throw new Web3TokenError('w3t malformed');
  }
}
