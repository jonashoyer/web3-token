import { Web3TokenSignOptions } from "../../types";
import { sign as baseSign } from '../../sign';
import type { Signer } from "@ethersproject/abstract-signer";

export const sign = async (signer: Signer, account: string, options: Web3TokenSignOptions) => {

  const signingMethod = (message: string) => {
    return signer.signMessage(message);
  }

  return baseSign(account, signingMethod, options)
}
