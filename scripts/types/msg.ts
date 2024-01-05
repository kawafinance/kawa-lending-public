import { InstantiateMsg as LendingInstantiateMsg } from './generated/kawa-lending/KawaLending.types'
import { InstantiateMsg as AddressProviderInstantiateMsg } from './generated/kawa-address-provider/KawaAddressProvider.types'
import { InstantiateMsg as WasmOracleInstantiateMsg } from './generated/kawa-oracle-wasm/KawaOracleWasm.types'

export type InstantiateMsgs =
  | LendingInstantiateMsg
  | AddressProviderInstantiateMsg
  | WasmOracleInstantiateMsg

export interface UpdateOwner {
  owner: string
}
