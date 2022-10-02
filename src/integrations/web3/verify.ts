import { verify as baseVerify } from '../../verify';
import { Web3TokenVerifyOptions } from '../../types';
import { Web3TokenError } from '../../errors';
import type Web3 from 'web3';

export const verify = (web3: Web3, token: string, options?: Web3TokenVerifyOptions) => {
  return baseVerify(token, {
    ...options,
    messageSignatureToAddress: (msg: string, sig: string) => messageSignatureToAddress(web3, msg, sig),
  })
}

const messageSignatureToAddress = async (web3: Web3, message: string, signature: string) => {
  if (!signature) throw new Web3TokenError('w3t signature is required');
  try {

    const address = web3.eth.accounts.recover(message, signature);
    return address.toLowerCase();
    
  } catch(err) {
    throw new Web3TokenError('w3t malformed');
  }
}
