import { TokenExpiredError, TokenPrematureError, Web3TokenError } from './errors';
import { Web3TokenVerifyOptions } from './types';
import { optionsToPayload, payloadToERC4361Message, web3TokenDecode } from './utils';


export interface VerifyProps extends Web3TokenVerifyOptions {
  messageSignatureToAddress: (message: string, signature: string) => Promise<string>;
}

export const verify = async (token: string, options: VerifyProps) => {
  const { payload, signature } = web3TokenDecode<ReturnType<typeof optionsToPayload>>(token);
  if (payload.domain && options?.domain) {
    
    if (Array.isArray(options.domain)) {
      if (!options.domain.includes(payload.domain)) throw new Web3TokenError('w3t domain invalid');

    } else if (options.domain !== payload.domain) throw new Web3TokenError('w3t domain invalid');
  }

  if (payload.expiresAt) {
    if (payload.expiresAt < Date.now()) throw new TokenExpiredError(payload.expiresAt);
  }

  if (payload.notBefore) {
    if (payload.notBefore > Date.now()) throw new TokenPrematureError(payload.notBefore);
  }

  const message = payloadToERC4361Message(payload, options?.statement);
  const address = await options.messageSignatureToAddress(message, signature);

  if (payload.address.toLowerCase() != address.toLowerCase()) {
    throw new Web3TokenError('w3t malformed');
  }

  return {
    address,
    payload,
  }
}