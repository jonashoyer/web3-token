export type Web3TokenPayload = { address: string } & Pick<Web3TokenSignOptions, 'expiresAt' | 'issuedAt' | 'statement' | 'domain' | 'nonce' | 'notBefore' | 'requestId' | 'chainId'>


export interface Web3TokenSignOptions {
  expiresIn?: number | string;
  expiresAt?: number;

  issuedAt?: number | boolean;

  notBefore?: number;
  
  statement?: string;
  domain?: string;
  nonce?: number | string | boolean;
  requestId?: string;
  chainId?: number;

  omitStatementPayload?: boolean;
}

export interface Web3TokenVerifyOptions {
  domain?: string | string[];
  statement?: string;
}