import {
  Coin,
  FeesMultipliers,
  FungibleToken,
  SupportedCurrency,
  TransactionData,
  Account,
  BaseWallet,
  SettingsNetwork,
} from '@secretkeylabs/xverse-core/types';
import BigNumber from 'bignumber.js';

export const SetWalletKey = 'SetWallet';
export const ResetWalletKey = 'ResetWallet';
export const FetchAccountKey = 'FetchAccount';
export const SelectAccountKey = 'SelectAccount';
export const UnlockWalletKey = 'UnlockWallet';
export const LockWalletKey = 'LockWallet';
export const StoreEncryptedSeedKey = 'StoreEncryptedSeed';
export const UpdateVisibleCoinListKey = 'UpdateVisibleCoinList';
export const AddAccountKey = 'AddAccount';
export const SetFeeMultiplierKey = 'SetFeeMultiplierKey';
export const ChangeFiatCurrencyKey = 'ChangeFiatCurrency';
export const ChangeNetworkKey = 'ChangeNetwork';
export const GetActiveAccountsKey = 'GetActiveAccounts';
export const SetWalletSeedPhraseKey = 'SetWalletSeed';

export const FetchStxWalletDataRequestKey = 'FetchStxWalletDataRequest';
export const SetStxWalletDataKey = 'SetStxWalletDataKey';

export const SetBtcWalletDataKey = 'SetBtcWalletData';

export const SetCoinRatesKey = 'SetCoinRatesKey';

export const SetCoinDataKey = 'SetCoinDataKey';

export const ChangeHasActivatedOrdinalsKey = 'ChangeHasActivatedOrdinalsKey';

export const ChangeShowBtcReceiveAlertKey = 'ChangeShowBtcReceiveAlertKey';
export const ChangeShowOrdinalReceiveAlertKey = 'ChangeShowOrdinalReceiveAlertKey';

export const SetBrcCoinsListKey = 'SetBrcCoinsList';

export interface WalletState {
  stxAddress: string;
  btcAddress: string;
  ordinalsAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  ordinalsPublicKey: string;
  accountsList: Account[];
  selectedAccount: Account | null;
  network: SettingsNetwork;
  seedPhrase: string;
  encryptedSeed: string;
  fiatCurrency: SupportedCurrency;
  btcFiatRate: BigNumber;
  stxBtcRate: BigNumber;
  stxBalance: BigNumber;
  stxAvailableBalance: BigNumber;
  stxLockedBalance: BigNumber;
  stxNonce: number;
  btcBalance: BigNumber;
  coinsList: FungibleToken[] | null;
  coins: Coin[];
  brcCoinsList: FungibleToken[] | null;
  feeMultipliers: FeesMultipliers | null;
  networkAddress: string | undefined;
  hasActivatedOrdinalsKey: boolean | undefined;
  showBtcReceiveAlert: boolean | null;
  showOrdinalReceiveAlert: boolean | null;
  btcApiUrl: string;
}

export interface SetWallet {
  type: typeof SetWalletKey;
  wallet: BaseWallet;
}

export interface StoreEncryptedSeed {
  type: typeof StoreEncryptedSeedKey;
  encryptedSeed: string;
}

export interface SetWalletSeedPhrase {
  type: typeof SetWalletSeedPhraseKey;
  seedPhrase: string;
}
export interface UnlockWallet {
  type: typeof UnlockWalletKey;
  seed: string;
}

export interface SetFeeMultiplier {
  type: typeof SetFeeMultiplierKey;
  feeMultipliers: FeesMultipliers;
}

export interface LockWallet {
  type: typeof LockWalletKey;
}
export interface ResetWallet {
  type: typeof ResetWalletKey;
}

export interface FetchAccount {
  type: typeof FetchAccountKey;
  selectedAccount: Account | null;
  accountsList: Account[];
}

export interface AddAccount {
  type: typeof AddAccountKey;
  accountsList: Account[];
}
export interface SelectAccount {
  type: typeof SelectAccountKey;
  selectedAccount: Account | null;
  stxAddress: string;
  btcAddress: string;
  ordinalsAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  ordinalsPublicKey: string;
  bnsName?: string;
  network: SettingsNetwork;
  // stackingState: StackingStateData;
}
export interface SetCoinRates {
  type: typeof SetCoinRatesKey;
  stxBtcRate: BigNumber;
  btcFiatRate: BigNumber;
}

export interface SetStxWalletData {
  type: typeof SetStxWalletDataKey;
  stxBalance: BigNumber;
  stxAvailableBalance: BigNumber;
  stxLockedBalance: BigNumber;
  stxTransactions: TransactionData[];
  stxNonce: number;
}

export interface SetBtcWalletData {
  type: typeof SetBtcWalletDataKey;
  balance: BigNumber;
}

export interface SetCoinData {
  type: typeof SetCoinDataKey;
  coinsList: FungibleToken[];
  supportedCoins: Coin[];
}
export interface UpdateVisibleCoinList {
  type: typeof UpdateVisibleCoinListKey;
  coinsList: FungibleToken[];
}

export interface ChangeFiatCurrency {
  type: typeof ChangeFiatCurrencyKey;
  fiatCurrency: SupportedCurrency;
}
export interface ChangeNetwork {
  type: typeof ChangeNetworkKey;
  network: SettingsNetwork;
  networkAddress: string | undefined;
  btcApiUrl: string;
}

export interface GetActiveAccounts {
  type: typeof GetActiveAccountsKey;
  accountsList: Account[];
}

export interface ChangeActivateOrdinals {
  type: typeof ChangeHasActivatedOrdinalsKey;
  hasActivatedOrdinalsKey: boolean;
}

export interface ChangeShowBtcReceiveAlert {
  type: typeof ChangeShowBtcReceiveAlertKey;
  showBtcReceiveAlert: boolean | null;
}

export interface ChangeShowOrdinalReceiveAlert {
  type: typeof ChangeShowOrdinalReceiveAlertKey;
  showOrdinalReceiveAlert: boolean | null;
}

export interface SetBrcCoinsData {
  type: typeof SetBrcCoinsListKey;
  brcCoinsList: FungibleToken[];
}

export type WalletActions =
  | SetWallet
  | ResetWallet
  | FetchAccount
  | AddAccount
  | SelectAccount
  | StoreEncryptedSeed
  | SetWalletSeedPhrase
  | UnlockWallet
  | LockWallet
  | SetFeeMultiplier
  | SetCoinRates
  | SetStxWalletData
  | SetBtcWalletData
  | SetCoinData
  | UpdateVisibleCoinList
  | ChangeFiatCurrency
  | ChangeNetwork
  | GetActiveAccounts
  | ChangeActivateOrdinals
  | ChangeShowBtcReceiveAlert
  | ChangeShowOrdinalReceiveAlert
  | SetBrcCoinsData;
