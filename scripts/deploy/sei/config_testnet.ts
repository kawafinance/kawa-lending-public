import { DeploymentConfig, AssetConfig, OracleConfig } from '../../types/config'

const protocolAdminAddr = 'sei1rajkwsnxl9kv0xnq4s8xa9fzd65eme7evfvl48'

const gasPrice = '0.1usei'
const chainId = 'atlantic-2'
const rpcEndpoint = 'https://rpc.atlantic-2.seinetwork.io/'

// Astroport configuration
const astroportFactory = 'sei1cp0hjmhwn9mz8rd4t29zjx2sks5mlxsjzhch2ef3yr4q2ssqwuvst5lyc9'
// const astroportRouter = 'sei1n389228apfytkxgvjkwl3acakgl8evpx7z5nghwvluhwsjwq37gqjatsxy'

// note the following three addresses are all 'mars' bech32 prefix
const safetyFundAddr = protocolAdminAddr
const feeCollectorAddr = protocolAdminAddr

// Testnet chain: atlantic-2
// Pyth configuration // atlantic-2
// const pythAddr = 'sei1w2rxq6eckak47s25crxlhmq96fzjwdtjgdwavn56ggc0qvxvw7rqczxyfy'
// const pythSeiID = 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'
// const pythUsdcID = 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'

// export const seiOracle: OracleConfig = {
//   denom: 'usei',
//   price_source: {
//     pyth: {
//       contract_addr: pythAddr,
//       price_feed_id: pythSeiID,
//       denom_decimals: 6,
//       max_staleness: 300, // 5 minutes
//     },
//   },
// }


export const seiOracle: OracleConfig = {
  denom: 'usei',
  price_source: {
    fixed: {
      price: '110000',
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
  max_loan_to_value: '0.4',
  reserve_factor: '0.1',
  liquidation_threshold: '0.5',
  liquidation_bonus: '0.15',
  interest_rate_model: {
    optimal_utilization_rate: '0.6',
    base: '0',
    slope_1: '0.15',
    slope_2: '3',
  },
  deposit_cap: '5000000000000',
  deposit_enabled: true,
  borrow_enabled: true,
  symbol: 'SEI',
}

export const seiTestnetConfig: DeploymentConfig = {
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
  assets: [seiAsset],
  oracleConfigs: [usdOracle, seiOracle],
  maxCloseFactor: '0.5',
  oracleCustomInitParams: {
    astroport_factory: astroportFactory,
  },
  incentiveEpochDuration: 604800, // 1 week
  maxWhitelistedIncentiveDenoms: 10,
  targetHealthFactor: '1.2',
}
