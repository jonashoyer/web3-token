import { verify as baseVerify } from '../../verify';
import {
  hashPersonalMessage,
  fromRpcSig,
  ecrecover,
  publicToAddress,
  bufferToHex
} from '@ethereumjs/util';
import { Web3TokenVerifyOptions } from '../../types';
import { Web3TokenError } from '../../errors';

export const verify = (token: string, options?: Web3TokenVerifyOptions) => {
  return baseVerify(token, {
    ...options,
    messageSignatureToAddress,
  })
}

const messageSignatureToAddress = async (message: string, signature: string) => {
  if (!signature) throw new Web3TokenError('w3t signature is required');
  try {

    const buf = Buffer.from(message);
    const msgHash = hashPersonalMessage(buf);
    const { v, r, s } = fromRpcSig(signature);

    const publicKey = ecrecover(
      msgHash,
      v,
      r,
      s
    );
    const addressBuffer = publicToAddress(publicKey);
    const address = bufferToHex(addressBuffer).toLowerCase();

    return address.toLowerCase();
  } catch(err) {
    throw new Web3TokenError('w3t malformed');
  }
}
