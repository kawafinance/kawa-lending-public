// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

export interface InstantiateMsg {
  owner: string
  prefix: string
}
export type ExecuteMsg =
  | {
      set_address: {
        address: string
        address_type: KawaAddressType
      }
    }
  | {
      update_owner: OwnerUpdate
    }
export type KawaAddressType =
  | ('incentives' | 'oracle' | 'lending' | 'rewards_collector')
  | 'protocol_admin'
  | 'fee_collector'
  | 'safety_fund'
  | 'swapper'
export type OwnerUpdate =
  | {
      propose_new_owner: {
        proposed: string
      }
    }
  | 'clear_proposed'
  | 'accept_proposed'
  | 'abolish_owner_role'
  | {
      set_emergency_owner: {
        emergency_owner: string
      }
    }
  | 'clear_emergency_owner'
export type QueryMsg =
  | {
      config: {}
    }
  | {
      address: KawaAddressType
    }
  | {
      addresses: KawaAddressType[]
    }
  | {
      all_addresses: {
        limit?: number | null
        start_after?: KawaAddressType | null
      }
    }
export interface AddressResponseItem {
  address: string
  address_type: KawaAddressType
}
export type ArrayOfAddressResponseItem = AddressResponseItem[]
export interface ConfigResponse {
  owner?: string | null
  prefix: string
  proposed_new_owner?: string | null
}
