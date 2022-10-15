import { Web3TokenError } from "./errors";
import { Web3TokenSignOptions } from "./types";
import { optionsToPayload, payloadToERC4361Message, TokenPayload, web3TokenEncode } from "./utils";


// web3 sign method: (web3 as any).eth.personal.sign(message, account);
export const sign = async (account: string, signingMethod: (message: string) => Promise<string>, options: Web3TokenSignOptions) => {

  if (!account) throw new Web3TokenError('no account selected');

  const payload = optionsToPayload(account.toLowerCase(), options);
  const message = payloadToERC4361Message(payload, options.customFields);
  
  const signature = await signingMethod(message);
  return web3TokenEncode(withOmitPayload(options.omitStatementPayload, payload), signature);
}

const withOmitPayload = (omit: boolean | undefined, payload: TokenPayload) => {
  if (omit) return { ...payload, statement: undefined };
  return payload;
}