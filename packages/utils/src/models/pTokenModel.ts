import {
  assetsToShares,
  currentRatePerSecondToAPY,
  sharesToAssets,
} from '../calculation';
import { MathSol } from '../math';
import { DoubleJumpRateModel } from './interestRateModel';
import { UserBalanceData } from '../types';

export class PTokenModel extends DoubleJumpRateModel {
  private _pendingAccrueInterest(): {
    totalBorrows: bigint;
    totalReserves: bigint;
    borrowIndex: bigint;
    updatedAt: bigint;
  } {
    const snapshot = {
      updatedAt: this.pTokenData.updatedAt,
      totalBorrows: this.pTokenData.totalBorrows,
      totalReserves: this.pTokenData.totalReserves,
      borrowIndex: this.pTokenData.borrowIndex,
    };

    const accruedBlockTimestamp = snapshot.updatedAt;

    const currentTimestamp = BigInt(Date.now() / 1000);

    if (
      currentTimestamp <= accruedBlockTimestamp ||
      snapshot.totalBorrows === 0n
    )
      return snapshot;

    // Calculate the interest accumulated into borrows and reserves and the new index
    const timeDelta = currentTimestamp - accruedBlockTimestamp;
    const borrowRate = this.getBorrowRate();
    const interestFactor = borrowRate * timeDelta;
    const interestAccumulated = MathSol.mulDownFixed(
      snapshot.totalBorrows,
      interestFactor
    );

    const accumulatedReserve = MathSol.mulDownFixed(
      snapshot.totalReserves,
      interestFactor
    );

    const accumulatedBorrowIndex = MathSol.mulDownFixed(
      interestFactor,
      snapshot.borrowIndex
    );

    // Update snapshot values
    snapshot.totalBorrows += interestAccumulated;
    snapshot.totalReserves += accumulatedReserve;
    snapshot.borrowIndex += accumulatedBorrowIndex;

    return snapshot;
  }

  private _accrueInterest(): PTokenModel {
    const snapshot = this._pendingAccrueInterest();

    const utilization = this.getUtilization();
    const borrowRatePerSecond = this.getBorrowRate();
    const supplyRatePerSecond = this.getSupplyRate();

    const exchangeRateStored = MathSol.divDownFixed(
      this.pTokenData.cash +
        this.pTokenData.totalBorrows -
        this.pTokenData.totalReserves,
      this.pTokenData.totalSupply
    );

    return new PTokenModel({
      ...this.pTokenData,
      ...snapshot,
      borrowRatePerSecond,
      supplyRatePerSecond,
      supplyRateAPY: currentRatePerSecondToAPY(supplyRatePerSecond),
      borrowRateAPY: currentRatePerSecondToAPY(borrowRatePerSecond),
      utilization,
      exchangeRateStored,
    });
  }

  accrueInterest(): void {
    const newPToken = this._accrueInterest();

    this.pTokenData = newPToken.pTokenData;
  }

  exchangeRateCurrent(): bigint {
    const updatedModel = this._accrueInterest();
    return updatedModel.pTokenData.exchangeRateStored;
  }

  getAccountSnapshot(userBalance?: UserBalanceData): [bigint, bigint, bigint] {
    if (!userBalance) return [0n, 0n, this.exchangeRateCurrent()];

    return [
      userBalance.supplyShares,
      userBalance.borrowAssets,
      this.exchangeRateCurrent(),
    ];
  }

  totalBorrowsCurrent(): bigint {
    const snapshot = this._pendingAccrueInterest();
    return snapshot.totalBorrows;
  }

  totalReservesCurrent(): bigint {
    const snapshot = this._pendingAccrueInterest();
    return snapshot.totalReserves;
  }

  borrowBalanceCurrent(userBalance: UserBalanceData): bigint {
    if (!userBalance) return 0n;

    const snapshot = this._pendingAccrueInterest();
    return MathSol.mulDownFixed(
      userBalance.borrowAssets,
      MathSol.divDownFixed(snapshot.borrowIndex, userBalance.interestIndex)
    );
  }

  borrowBalanceStored(userBalance: UserBalanceData): bigint {
    if (!userBalance) return 0n;
    return userBalance.borrowAssets;
  }

  convertToShares(assets: bigint): bigint {
    return assetsToShares(assets, this.pTokenData.exchangeRateStored);
  }

  convertToAssets(shares: bigint): bigint {
    return sharesToAssets(shares, this.pTokenData.exchangeRateStored);
  }

  previewDeposit(assets: bigint): bigint {
    const updatedModel = this._accrueInterest();

    return updatedModel.convertToShares(assets);
  }

  previewMint(shares: bigint): bigint {
    const updatedModel = this._accrueInterest();

    return updatedModel.convertToAssets(shares);
  }

  previewWithdraw(assets: bigint): bigint {
    const updatedModel = this._accrueInterest();

    return updatedModel.convertToShares(assets);
  }

  previewRedeem(shares: bigint): bigint {
    const updatedModel = this._accrueInterest();

    return updatedModel.convertToAssets(shares);
  }

  totalAssets(): bigint {
    const updated = this._accrueInterest();
    return (
      updated.pTokenData.cash +
      updated.pTokenData.totalBorrows -
      updated.pTokenData.totalReserves
    );
  }
}
