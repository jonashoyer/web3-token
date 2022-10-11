import { TokenExpiredError, TokenPrematureError, Web3TokenError } from './errors';
import { MaybePromise, Web3TokenVerifyOptions } from './types';
import { extractCustomFields, optionsToPayload, payloadToERC4361Message, web3TokenDecode } from './utils';


export interface VerifyProps<T extends string> extends Web3TokenVerifyOptions<T> {
  messageSignatureToAddress: (message: string, signature: string) => MaybePromise<string>;
}


export const verify = async <T extends string>(token: string, options: VerifyProps<T>) => {
  const { payload, signature } = web3TokenDecode<ReturnType<typeof optionsToPayload> & Record<T, string>>(token);
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

  const customFields = extractCustomFields(payload, options.customFields ?? []);

  const message = payloadToERC4361Message(payload, customFields, options?.statement);
  const address = await options.messageSignatureToAddress(message, signature);

  if (payload.address.toLowerCase() != address.toLowerCase()) {
    throw new Web3TokenError('w3t malformed');
  }

  return {
    address,
    payload,
  }
}