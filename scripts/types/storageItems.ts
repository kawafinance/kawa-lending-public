export interface StorageItems {
  codeIds: {
    lending?: number
    'rewards-collector'?: number
    'address-provider'?: number
    incentives?: number
    oracle?: number
    swapper?: number
    params?: number
  }
  addresses: {
    'address-provider'?: string
    'rewards-collector'?: string
    lending?: string
    incentives?: string
    oracle?: string
    swapper?: string
    params?: string
  }

  execute: {
    addressProviderUpdated: Record<string, boolean>
    assetsInitialized: string[]
    secondAssetInitialized?: boolean
    oraclePriceSet?: boolean
    smokeTest?: boolean
  }

  owner?: string
}
