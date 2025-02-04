import { ContractAbi } from './abis';
import { Address } from './types';

export abstract class AbstractAdapter {
  abstract encodeAbiFunctionData(
    abi: ContractAbi,
    functionName: string,
    values: any[]
  ): `0x${string}`;

  abstract sendTransaction(
    to: Address,
    data: `0x${string}`,
    value: bigint
  ): Promise<`0x${string}`>;

  abstract readContractData(
    abi: ContractAbi,
    address: Address,
    functionName: string,
    values: any[]
  ): Promise<any>;
}
