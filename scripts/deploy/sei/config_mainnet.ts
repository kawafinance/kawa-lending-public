import { DeploymentConfig, AssetConfig, OracleConfig } from '../../types/config'

const usdcEthWHDenom = 'factory/sei189adguawugk3e55zn63z8r9ll29xrjwca636ra7v7gxuzn98sxyqwzt47l/Hq4tuDzhRBnxw3tFA5n6M52NVMVcC19XggbyDiJKCD6H'
const protocolAdminAddr = 'sei14jjf2jpganxfsc8sxsa5ls8pk7whw5c39vczxy'

const gasPrice = '0.1usei'
const chainId = 'pacific-1'
const rpcEndpoint = 'https://sei-rpc.polkachu.com/'

// Astroport configuration
const astroportFactory = 'sei1xr3rq8yvd7qplsw5yx90ftsr2zdhg4e9z60h5duusgxpv72hud3shh3qfl'
// const astroportRouter = 'sei16awrdehvla6kqq2dk5v4m6ze83qfg8trpw55qc8rvfrg9qdmfvhq7hj6x9'

// note the following three addresses are all 'mars' bech32 prefix
const safetyFundAddr = protocolAdminAddr
const feeCollectorAddr = protocolAdminAddr

// Chain: pacific-1
// Pyth configuration // pacific-1
// const pythAddr = 'sei15d2tyq2jzxmpg32y3am3w62dts32qgzmds9qnr6c87r0gwwr7ynqal0x38'
// const pythSeiID = '53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb'
// const pythUsdcID = 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'

export const seiOracle: OracleConfig = {
  denom: 'usei',
  price_source: {
    fixed: {
      price: '110000',
    },
  },
}

export const usdcEthWHOracle: OracleConfig = {
  denom: usdcEthWHDenom,
  price_source: {
    fixed: {
      price: '1000000',
    },
  },
}

export const usdOracle: OracleConfig = {
  denom: 'usd',
  price_source: {
    fixed: {
      price: '1000000',
    },
  },
}

// Asset configurations
export const seiAsset: AssetConfig = {
  denom: 'usei',
  max_loan_to_value: '0.38',
  reserve_factor: '0.1',
  liquidation_threshold: '0.40',
  liquidation_bonus: '0.15',
  interest_rate_model: {
    optimal_utilization_rate: '0.6',
    base: '0',
    slope_1: '0.15',
    slope_2: '3',
  },
  deposit_cap: '1000000000000',
  deposit_enabled: false,
  borrow_enabled: false,
  symbol: 'SEI',
}

export const usdcEthWHAsset: AssetConfig = {
  denom: usdcEthWHDenom,
  max_loan_to_value: '0.73',
  reserve_factor: '0.1',
  liquidation_threshold: '0.75',
  liquidation_bonus: '0.15',
  interest_rate_model: {
    optimal_utilization_rate: '0.6',
    base: '0',
    slope_1: '0.2',
    slope_2: '3',
  },
  deposit_cap: '1000000000000',
  deposit_enabled: true,
  borrow_enabled: true,
  symbol: 'USDC.eth',
}

export const seiMainnetConfig: DeploymentConfig = {
  oracleName: 'wasm',
  oracleBaseDenom: 'uusd',
  // rewardsCollectorName: 'sei',
  // rewardsCollectorNeutronIbcConfig: neutronIbcConfig,
  // atomDenom: atomDenom,
  baseAssetDenom: 'usei',
  gasPrice: gasPrice,
  chainId: chainId,
  chainPrefix: 'sei',
  // channelId: marsNeutronChannelId,
  // marsDenom: marsDenom,
  rewardsCollectorTimeoutSeconds: 600,
  rpcEndpoint: rpcEndpoint,
  safetyFundFeeShare: '0.5',
  deployerMnemonic:
    '',//todo add seed phrase
  slippage_tolerance: '0.01',
  base_asset_symbol: 'SEI',
  // second_asset_symbol: 'ATOM',
  runTests: true,
  mainnet: false,
  // feeCollectorDenom: marsDenom,
  // safetyFundDenom: axlUsdcDenom,
  // swapRoutes: [atomUsdcRoute, atomKawaRoute, ntrnUsdcRoute, ntrnKawaRoute, usdcKawaRoute],
  safetyFundAddr: safetyFundAddr,
  protocolAdminAddr: protocolAdminAddr,
  feeCollectorAddr: feeCollectorAddr,
  // swapperDexName: 'astroport',
  assets: [usdcEthWHAsset],
  oracleConfigs: [usdOracle, usdcEthWHOracle],
  maxCloseFactor: '0.5',
  oracleCustomInitParams: {
    astroport_factory: astroportFactory,
  },
  incentiveEpochDuration: 604800, // 1 week
  maxWhitelistedIncentiveDenoms: 10,
  targetHealthFactor: '1.2',
}
