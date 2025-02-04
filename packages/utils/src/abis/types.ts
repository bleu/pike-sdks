export type StateMutability = 'pure' | 'view' | 'nonpayable' | 'payable';

export type AbiType =
  | 'function'
  | 'constructor'
  | 'event'
  | 'error'
  | 'receive'
  | 'fallback';

export type ValueType =
  | 'address'
  | 'bool'
  | 'string'
  | 'bytes'
  | 'uint256'
  | 'uint32'
  | 'bytes32'
  | 'bytes4'
  | `uint${number}`
  | `int${number}`
  | `bytes${number}`;

export interface AbiParameter {
  readonly internalType?: string;
  readonly name: string;
  readonly type: ValueType | string;
  readonly components?: readonly AbiParameter[];
  readonly indexed?: boolean;
}

export interface BaseAbiItem {
  readonly type: AbiType;
}

export interface AbiEventItem extends BaseAbiItem {
  readonly anonymous: boolean;
  readonly inputs: readonly AbiParameter[];
  readonly name: string;
  readonly type: 'event';
}

export interface AbiFunctionItem extends BaseAbiItem {
  readonly inputs: readonly AbiParameter[];
  readonly name: string;
  readonly outputs?: readonly AbiParameter[];
  readonly stateMutability: StateMutability;
  readonly type: 'function';
}

export interface AbiConstructorItem extends BaseAbiItem {
  readonly inputs: readonly AbiParameter[];
  readonly stateMutability: StateMutability;
  readonly type: 'constructor';
}

export interface AbiErrorItem extends BaseAbiItem {
  readonly inputs: readonly AbiParameter[];
  readonly name: string;
  readonly type: 'error';
}

export interface AbiFallbackItem extends BaseAbiItem {
  readonly stateMutability: StateMutability;
  readonly type: 'fallback';
}

export interface AbiReceiveItem extends BaseAbiItem {
  readonly stateMutability: 'payable';
  readonly type: 'receive';
}

export type AbiItem =
  | AbiEventItem
  | AbiFunctionItem
  | AbiConstructorItem
  | AbiErrorItem
  | AbiReceiveItem
  | AbiFallbackItem;

export type ContractAbi = readonly AbiItem[];
