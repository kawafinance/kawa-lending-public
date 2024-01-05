// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { UseQueryOptions, useQuery, useMutation, UseMutationOptions } from '@tanstack/react-query'
import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { StdFee, Coin } from '@cosmjs/amino'
import {
  InstantiateMsg,
  ExecuteMsg,
  KawaAddressType,
  OwnerUpdate,
  QueryMsg,
  AddressResponseItem,
  ArrayOfAddressResponseItem,
  ConfigResponse,
} from './KawaAddressProvider.types'
import {
  KawaAddressProviderQueryClient,
  KawaAddressProviderClient,
} from './KawaAddressProvider.client'
export const kawaAddressProviderQueryKeys = {
  contract: [
    {
      contract: 'kawaAddressProvider',
    },
  ] as const,
  address: (contractAddress: string | undefined) =>
    [{ ...kawaAddressProviderQueryKeys.contract[0], address: contractAddress }] as const,
  config: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...kawaAddressProviderQueryKeys.address(contractAddress)[0], method: 'config', args },
    ] as const,
  address: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...kawaAddressProviderQueryKeys.address(contractAddress)[0], method: 'address', args },
    ] as const,
  addresses: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...kawaAddressProviderQueryKeys.address(contractAddress)[0], method: 'addresses', args },
    ] as const,
  allAddresses: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      {
        ...kawaAddressProviderQueryKeys.address(contractAddress)[0],
        method: 'all_addresses',
        args,
      },
    ] as const,
}
export interface KawaAddressProviderReactQuery<TResponse, TData = TResponse> {
  client: KawaAddressProviderQueryClient | undefined
  options?: Omit<
    UseQueryOptions<TResponse, Error, TData>,
    "'queryKey' | 'queryFn' | 'initialData'"
  > & {
    initialData?: undefined
  }
}
export interface KawaAddressProviderAllAddressesQuery<TData>
  extends KawaAddressProviderReactQuery<ArrayOfAddressResponseItem, TData> {
  args: {
    limit?: number
    startAfter?: KawaAddressType
  }
}
export function useKawaAddressProviderAllAddressesQuery<TData = ArrayOfAddressResponseItem>({
  client,
  args,
  options,
}: KawaAddressProviderAllAddressesQuery<TData>) {
  return useQuery<ArrayOfAddressResponseItem, Error, TData>(
    kawaAddressProviderQueryKeys.allAddresses(client?.contractAddress, args),
    () =>
      client
        ? client.allAddresses({
            limit: args.limit,
            startAfter: args.startAfter,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface KawaAddressProviderAddressesQuery<TData>
  extends KawaAddressProviderReactQuery<ArrayOfAddressResponseItem, TData> {}
export function useKawaAddressProviderAddressesQuery<TData = ArrayOfAddressResponseItem>({
  client,
  options,
}: KawaAddressProviderAddressesQuery<TData>) {
  return useQuery<ArrayOfAddressResponseItem, Error, TData>(
    kawaAddressProviderQueryKeys.addresses(client?.contractAddress),
    () => (client ? client.addresses() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface KawaAddressProviderAddressQuery<TData>
  extends KawaAddressProviderReactQuery<AddressResponseItem, TData> {}
export function useKawaAddressProviderAddressQuery<TData = AddressResponseItem>({
  client,
  options,
}: KawaAddressProviderAddressQuery<TData>) {
  return useQuery<AddressResponseItem, Error, TData>(
    kawaAddressProviderQueryKeys.address(client?.contractAddress),
    () => (client ? client.address() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface KawaAddressProviderConfigQuery<TData>
  extends KawaAddressProviderReactQuery<ConfigResponse, TData> {}
export function useKawaAddressProviderConfigQuery<TData = ConfigResponse>({
  client,
  options,
}: KawaAddressProviderConfigQuery<TData>) {
  return useQuery<ConfigResponse, Error, TData>(
    kawaAddressProviderQueryKeys.config(client?.contractAddress),
    () => (client ? client.config() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface KawaAddressProviderUpdateOwnerMutation {
  client: KawaAddressProviderClient
  msg: OwnerUpdate
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useKawaAddressProviderUpdateOwnerMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, KawaAddressProviderUpdateOwnerMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, KawaAddressProviderUpdateOwnerMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.updateOwner(msg, fee, memo, funds),
    options,
  )
}
export interface KawaAddressProviderSetAddressMutation {
  client: KawaAddressProviderClient
  msg: {
    address: string
    addressType: KawaAddressType
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useKawaAddressProviderSetAddressMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, KawaAddressProviderSetAddressMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, KawaAddressProviderSetAddressMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.setAddress(msg, fee, memo, funds),
    options,
  )
}
