import {
  WasmOracleCustomInitParams,
  WasmPriceSourceForString,
} from './generated/kawa-oracle-wasm/KawaOracleWasm.types'

export interface DeploymentConfig {
  oracleName: string
  oracleBaseDenom: string
  rewardsCollectorName?: string
  rewardsCollectorTimeoutSeconds?: number
  rewardsCollectorNeutronIbcConfig?: null
  marsDenom?: string
  baseAssetDenom: string
  gasPrice: string
  atomDenom?: string
  chainPrefix: string
  safetyFundFeeShare: string
  channelId?: string
  feeCollectorDenom?: string
  safetyFundDenom?: string
  chainId: string
  rpcEndpoint: string
  deployerMnemonic: string
  slippage_tolerance: string
  base_asset_symbol: string
  second_asset_symbol?: string
  multisigAddr?: string
  runTests: boolean
  mainnet: boolean
  swapRoutes?: []
  safetyFundAddr: string
  protocolAdminAddr: string
  feeCollectorAddr: string
  maxCloseFactor: string
  swapperDexName?: string
  assets: AssetConfig[]
  oracleConfigs: OracleConfig[]
  oracleCustomInitParams?: WasmOracleCustomInitParams
  incentiveEpochDuration: number
  maxWhitelistedIncentiveDenoms: number
  targetHealthFactor: string
}

export interface AssetConfig {
  denom: string
  max_loan_to_value: string
  reserve_factor: string
  liquidation_threshold: string
  liquidation_bonus: string
  interest_rate_model: {
    optimal_utilization_rate: string
    base: string
    slope_1: string
    slope_2: string
  }
  deposit_cap: string
  deposit_enabled: boolean
  borrow_enabled: boolean
  symbol: string
}

export interface OracleConfig {
  denom: string
  price_source: WasmPriceSourceForString
}
