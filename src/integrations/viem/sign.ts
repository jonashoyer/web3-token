import { Web3TokenSignOptions } from "../../types";
import { sign as baseSign } from '../../sign';

export const sign = async (signer: { signMessage: (opt: { message: string }) => Promise<string>, account: { address: string } }, options: Web3TokenSignOptions) => {

  const signingMethod = (message: string) => {
    return signer.signMessage({ message });
  }

  return baseSign(signer.account.address, signingMethod, options)
}
