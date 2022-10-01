import { Web3TokenError } from "./errors";
import { Web3TokenSignOptions } from "./types";
import { optionsToPayload, payloadToERC4361Message, web3TokenEncode } from "./utils";


// web3 sign method: (web3 as any).eth.personal.sign(message, account);
export const sign = async (account: string, signingMethod: (message: string) => Promise<string>, options: Web3TokenSignOptions) => {

  if (!account) throw new Web3TokenError('no account selected');

  const message = payloadToERC4361Message(optionsToPayload(account.toLowerCase(), options));
  const payload = optionsToPayload(account.toLowerCase(), options, true);
  
  const signature = await signingMethod(message);
  return web3TokenEncode(payload, signature);
}
