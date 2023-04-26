import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { Web3TokenError } from './errors';
import { Web3TokenPayload, Web3TokenSignOptions } from './types';


export type TokenPayload = Record<string, string | number | boolean | undefined>;

export const asciiToBase64 = (str: string) => {
  if (typeof btoa === 'undefined') {
    return Buffer.from(str, 'binary').toString('base64');
  }
  return btoa(str);
}

export const base64ToASCII = (base64: string) => {
  if (typeof atob === 'undefined') {
    return Buffer.from(base64, 'base64').toString('binary');
  }
  return atob(base64);
}

export const strip0x = (s: string) => s.startsWith('0x') ? s.slice(2) : s;
export const prefix0x = (s: string) => s.startsWith('0x') ? s : '0x' + s;

export const hexToBase64 = (hex: string) => {
  return asciiToBase64(hex.match(/\w{2}/g)!.map(function (a) {
    return String.fromCharCode(parseInt(a, 16));
  }).join(''));
}

export const stripBase64Padding = (base64: string) => base64.replace(/=+$/, '');

export const base64ToHex = (base64: string) => {
  const raw = base64ToASCII(base64);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result;
}


export const web3TokenEncode = (payload: string | TokenPayload, signature: string) => {
  const data = stripBase64Padding(asciiToBase64(typeof payload === "string" ? payload : JSON.stringify(payload)));
  return [
    data,
    stripBase64Padding(hexToBase64(strip0x(signature))),
  ].join('.')
}

export const web3TokenDecode = <T = TokenPayload>(token: string): { payload: T, signature: string } => {
  const [payload, signature] = token.split('.');
  if (!payload) throw new Web3TokenError('Token missing payload');
  if (!signature) throw new Web3TokenError('Token missing signature');

  const parse = (val: string) => val.startsWith('{') ? JSON.parse(val) : val;
  return {
    payload: parse(base64ToASCII(payload)),
    signature: prefix0x(base64ToHex(signature).toLowerCase()),
  };
}

export const isW3T = (str: string) => {
  const arr = str.split('.');
  return arr.length == 2 && arr[1]!.length == 88 && isBase64(arr[0]!) && isBase64(arr[1]!);
}

const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
export const isBase64 = (str: string) => {
  return base64regex.test(str);
}

export const payloadToERC4361Message = (value: Web3TokenPayload, customFields?: Record<string, string>, statement?: string) => {
  return [
    { value: value.statement ?? statement },
    ...(sortCustomFields(Object.entries(customFields ?? {})).map(([name, value]) => ({ name: formatCustomFieldName(name), value }))),
    { value: value.expiresAt && new Date(secondsToMilliseconds(value.expiresAt)).toUTCString(), name: 'Expires at' },
    { value: value.notBefore && new Date(secondsToMilliseconds(value.notBefore)).toUTCString(), name: 'Not before' },
    { value: typeof value.issuedAt == 'number' && new Date(secondsToMilliseconds(value.issuedAt)).toUTCString(), name: 'Issued at' },
    { value: value.address, name: 'Address' },
    { value: value.domain, name: 'Domain' },
    { value: value.requestId, name: 'Request ID' },
    { value: value.chainId, name: 'Chain ID' },
    { value: value.nonce, name: 'Nonce' },
  ]
    .filter(e => !!e.value)
    .map(e => e.name ? `${e.name}\n${e.value}` : e.value)
    .join('\n\n');
}

export const optionsToPayload = (address: string, { expiresIn, customFields, ...options }: Web3TokenSignOptions) => ({
  ...options,
  ...customFields,
  expiresAt: millisecondsToSeconds(expiresIn ? Date.now() + (typeof expiresIn == 'string' ? ms(expiresIn) : expiresIn) : options.expiresAt),
  nonce: options.nonce === true ? uuidv4() : (options.nonce ? options.nonce : undefined),
  issuedAt: millisecondsToSeconds(options.issuedAt === true ? Date.now() : (options.issuedAt ? options.issuedAt : undefined)),
  notBefore: options.notBefore ? millisecondsToSeconds(options.notBefore) : undefined,
  statement: options.statement,
  address,
})

export const extractCustomFields = (payload: TokenPayload, customFields: string[]) => {
  return Object.fromEntries(sortCustomFields(customFields).map(key => ([key, payload[key] as string])));
}

export const formatCustomFieldName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.replace(/([A-Z])/g, " $1").slice(1);
}

type TimeParser = {
  (num: number): number;
  (num: undefined): undefined;
  (num: number | undefined): number | undefined;
}

const millisecondsToSeconds: TimeParser = (milliseconds): any => {
  if (typeof milliseconds == 'undefined') return undefined;
  return Math.floor(milliseconds / 1000);
}

const secondsToMilliseconds: TimeParser = (seconds): any => {
  if (typeof seconds == 'undefined') return undefined;
  return seconds * 1000;
}

const sortCustomFields = <T extends string[] | Array<[string, string]>>(customFields: T): T => {
  return [...customFields].sort((a, b) => {
    const x = typeof a == 'string' ? a : a[0];
    const y = typeof b == 'string' ? b : b[0];

    return x.localeCompare(y);
  }) as any;
}