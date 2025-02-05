import { Address } from '../types';

export abstract class EVMAdapterModel {
  abstract deposit(
    amount: bigint,
    pTokenAddress: Address
  ): Promise<`0x${string}`>;

  abstract withdraw(
    amount: bigint,
    pTokenAddress: Address
  ): Promise<`0x${string}`>;

  abstract borrow(
    amount: bigint,
    pTokenAddress: Address
  ): Promise<`0x${string}`>;

  abstract repay(
    amount: bigint,
    pTokenAddress: Address
  ): Promise<`0x${string}`>;

  abstract enterMarket(pTokenAddress: Address): Promise<`0x${string}`>;

  abstract exitMarket(pTokenAddress: Address): Promise<`0x${string}`>;
}
