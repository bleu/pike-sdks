import { AbstractAdapter, Address, ContractAbi } from '@pike-sdk/utils';
import { encodeFunctionData, PublicClient, WalletClient } from 'viem';

export class ViemAdapter extends AbstractAdapter {
  constructor(
    private publicClient: PublicClient,
    private walletClient: WalletClient
  ) {
    super();
  }

  encodeAbiFunctionData(
    abi: ContractAbi,
    functionName: string,
    values: any[]
  ): `0x${string}` {
    return encodeFunctionData({
      abi,
      functionName,
      args: values,
    });
  }

  sendTransaction(
    to: Address,
    data: `0x${string}`,
    value: bigint
  ): Promise<`0x${string}`> {
    if (!this.walletClient.account) {
      throw new Error('Wallet not connected');
    }

    return this.walletClient.sendTransaction({
      to,
      data,
      value,
      account: this.walletClient.account,
      chain: this.walletClient.chain,
    });
  }
  readContractData(
    abi: ContractAbi,
    address: Address,
    functionName: string,
    values: any[]
  ): Promise<any> {
    return this.publicClient.readContract({
      abi,
      address,
      functionName,
      args: values,
    });
  }
}
