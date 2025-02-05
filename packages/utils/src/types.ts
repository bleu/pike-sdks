export type Address = `0x${string}`;

export type Numeric = `${number}`;

export interface PTokenData {
  id: string;
  address: string;
  chainId: bigint;
  protocolId: string;
  index?: bigint;
  underlyingId: string;
  symbol: string;
  name: string;
  decimals: number;
  liquidationThreshold: bigint;
  liquidationIncentive: bigint;
  reserveFactor: bigint;
  collateralFactor: bigint;
  protocolSeizeShare: bigint;
  closeFactor: bigint;
  supplyCap: bigint;
  borrowCap: bigint;
  creationTransactionId: string;
  exchangeRateStored: bigint;
  utilization: bigint;
  borrowRatePerSecond: bigint;
  supplyRatePerSecond: bigint;
  borrowRateAPY: Numeric;
  supplyRateAPY: Numeric;
  borrowIndex: bigint;
  cash: bigint;
  totalSupply: bigint;
  totalReserves: bigint;
  totalBorrows: bigint;
  isBorrowPaused: boolean;
  isMintPaused: boolean;
  isTransferPaused: boolean;
  isSeizePaused: boolean;
  underlyingPriceCurrent: bigint;
  totalBorrowUsdValue: string;
  totalSupplyUsdValue: string;
  updatedAt: bigint;
  baseRatePerSecond: bigint;
  multiplierPerSecond: bigint;
  firstJumpMultiplierPerSecond: bigint;
  secondJumpMultiplierPerSecond: bigint;
  firstKink: bigint;
  secondKink: bigint;
}

export interface UserBalanceData {
  id: string;
  supplyShares: bigint;
  borrowAssets: bigint;
  isCollateral: boolean;
  interestIndex: bigint;
}

export type UserPositionsState = {
  userBalance?: UserBalanceData;
  pToken: PTokenData;
  eMode?: { liquidationThreshold: bigint };
}[];
