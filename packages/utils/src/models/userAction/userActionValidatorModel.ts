import { calculateUserMetricsOnProtocol } from '../../calculation';
import { PTokenData, UserBalanceData, UserPositionsState } from '../../types';

export class UserActionValidatorModel {
  constructor(private positionState: UserPositionsState) {}

  private _updatePositionState(
    pTokenId: string,
    positionUpdate:
      | UserBalanceData
      | ((balance: UserBalanceData) => UserBalanceData)
  ) {
    const newPositionState = [...this.positionState].map(position => {
      if (position.pToken.id === pTokenId) {
        return {
          ...position,
          balance:
            typeof positionUpdate === 'function'
              ? positionUpdate(
                  position.userBalance || {
                    supplyShares: 0n,
                    borrowAssets: 0n,
                    isCollateral: false,
                    interestIndex: 0n,
                    id: `${position.pToken.id}-user`,
                  }
                )
              : positionUpdate,
        };
      }
      return position;
    });

    return new UserActionValidatorModel(newPositionState);
  }

  validateDeposit(pToken: PTokenData, amount: bigint) {
    const updateState = this._updatePositionState(pToken.id, balance => ({
      ...balance,
      supplyShares: balance.supplyShares + amount,
    }));

    return updateState.validate();
  }

  validateWithdraw(pToken: PTokenData, amount: bigint) {
    const newPositionState = this._updatePositionState(pToken.id, balance => ({
      ...balance,
      supplyShares: balance.supplyShares - amount,
    }));

    return newPositionState.validate();
  }

  validateBorrow(pToken: PTokenData, amount: bigint) {
    const newPositionState = this._updatePositionState(pToken.id, balance => ({
      ...balance,
      borrowAssets: balance.borrowAssets + amount,
    }));

    return newPositionState.validate();
  }

  validateRepay(pToken: PTokenData, amount: bigint) {
    const newPositionState = this._updatePositionState(pToken.id, balance => ({
      ...balance,
      borrowAssets: balance.borrowAssets - amount,
    }));

    return newPositionState.validate();
  }

  validateEnterMarket(pToken: PTokenData) {
    const newPositionState = this._updatePositionState(pToken.id, balance => ({
      ...balance,
      isCollateral: true,
    }));

    return newPositionState.validate();
  }

  validateExitMarket(pToken: PTokenData) {
    const newPositionState = this._updatePositionState(pToken.id, balance => ({
      ...balance,
      isCollateral: false,
    }));

    return newPositionState.validate();
  }

  private _validateIndividualPosition(
    pToken: PTokenData,
    balance?: UserBalanceData
  ) {
    if (!balance) return true;
    if (balance.supplyShares < 0n) return false;
    if (balance.borrowAssets < 0n) return false;
    if (balance.supplyShares > pToken.supplyCap) return false;
    if (balance.borrowAssets > pToken.borrowCap) return false;
    return true;
  }

  validate() {
    const isIndividualPositionsValid = this.positionState.every(position =>
      this._validateIndividualPosition(position.pToken, position.userBalance)
    );

    if (!isIndividualPositionsValid) return false;

    const metrics = calculateUserMetricsOnProtocol(this.positionState);

    return Number(metrics.healthIndex) > 1;
  }
}
