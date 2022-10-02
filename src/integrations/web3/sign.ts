import { Web3TokenSignOptions } from "../../types";
import { sign as baseSign } from '../../sign';
import type Web3 from "web3";

export const sign = async (web3: Web3, account: string, options: Web3TokenSignOptions) => {

  const signingMethod = (message: string) => {
    return (web3.eth.personal.sign as any)(message, account);
  }

  return baseSign(account, signingMethod, options)
}
