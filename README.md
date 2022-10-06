# Web3 Token

Web3 Token authenticate using the [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) specification.

This package is intended to be used as a [Turborepo internal package](https://turborepo.org/docs/handbook/sharing-code/internal-packages)

## Usage
```jsx
import React from 'react';
import { EthersIntegration } from 'web3-token';
import { Web3Provider } from '@ethersproject/providers';

const Demo: React.FC<{ submit: (token: string) => void }> = ({ submit }) => {

  const provider = React.useMemo(() => {
    return new Web3Provider(window.ethereum, 'any');
  }, []);

  const onConnect = async () => {
    if (!provider) return;
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const token = await EthersIntegration.sign(
      signer,
      address,
      {
        statement: 'Welcome to Better T3 Stack!',
        expiresIn: '30m',
        issuedAt: true,
        nonce: true,
        requestId: 'request-id',
        domain: 'localhost',
        notBefore: Date.now(),
        chainId: 1,
      }
    );

    submit(token)

    // ...
    // Verify
    const { address, payload } = await EthersIntegration.verify(token, { domain: 'localhost' });
  }

  return (
    <button onClick={onConnect}>Sign with Web3 Token</button>
  )
}
```

```jsx
// Omit statement from the token payload to reduce size
const token = await EthersIntegration.sign(
  signer,
  address,
  {
    statement: 'Web3 Token using omit statement!',
    omitStatementPayload: true,
  }
);

const { address, payload } = await EthersIntegration.verify(token, { statement: 'Web3 Token using omit statement!' });

```

```jsx
// Predefined Integrations
import { EthersIntegration, EthereumjsIntegration, Web3Integration } from 'web3-token';
```


## Reference

```ts
const token = await sign({
  expiresIn,
  expiresAt,
  issuedAt,
  notBefore,
  statement,
  domain,
  nonce,
  requestId,
  chainId,
  omitStatementPayload,
});
```

- `expiresIn?: number | string` &mdash; time to expiry in milliseconds or using `ms` e.g. `30m`
- `expiresAt?: number` &mdash; the exact time of expiry in milliseconds
- `issuedAt?: number | boolean` &mdash; specify the issued time or current time if set true
- `notBefore: number` &mdash; after what time it should be valid
- `statement?: string` &mdash; user facing statement, at the top of the signing message
- `domain?: string` &mdash; domain the token is attact to
- `nonce?: number | string | boolean` &mdash; nonce for the token, if set true uuidv4 will be used
- `requestId?: string` &mdash; request id for the token
- `chainId?: number` &mdash; chain id for the token
- `omitStatementPayload?: boolean` &mdash; omit the statement from the token payload, the exact same statement used to sign will have to be defined when verifying the token