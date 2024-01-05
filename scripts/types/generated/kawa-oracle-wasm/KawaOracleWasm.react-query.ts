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
  WasmOracleCustomInitParams,
  ExecuteMsg,
  WasmPriceSourceForString,
  Decimal,
  Identifier,
  OwnerUpdate,
  WasmOracleCustomExecuteMsg,
  QueryMsg,
  ConfigResponse,
  PriceResponse,
  PriceSourceResponseForString,
  ArrayOfPriceSourceResponseForString,
  ArrayOfPriceResponse,
} from './KawaOracleWasm.types'
import { KawaOracleWasmQueryClient, KawaOracleWasmClient } from './KawaOracleWasm.client'
export const kawaOracleWasmQueryKeys = {
  contract: [
    {
      contract: 'kawaOracleWasm',
    },
  ] as const,
  address: (contractAddress: string | undefined) =>
    [{ ...kawaOracleWasmQueryKeys.contract[0], address: contractAddress }] as const,
  config: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...kawaOracleWasmQueryKeys.address(contractAddress)[0], method: 'config', args }] as const,
  priceSource: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...kawaOracleWasmQueryKeys.address(contractAddress)[0], method: 'price_source', args },
    ] as const,
  priceSources: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...kawaOracleWasmQueryKeys.address(contractAddress)[0], method: 'price_sources', args },
    ] as const,
  price: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...kawaOracleWasmQueryKeys.address(contractAddress)[0], method: 'price', args }] as const,
  prices: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...kawaOracleWasmQueryKeys.address(contractAddress)[0], method: 'prices', args }] as const,
}
export interface KawaOracleWasmReactQuery<TResponse, TData = TResponse> {
  client: KawaOracleWasmQueryClient | undefined
  options?: Omit<
    UseQueryOptions<TResponse, Error, TData>,
    "'queryKey' | 'queryFn' | 'initialData'"
  > & {
    initialData?: undefined
  }
}
export interface KawaOracleWasmPricesQuery<TData>
  extends KawaOracleWasmReactQuery<ArrayOfPriceResponse, TData> {
  args: {
    limit?: number
    startAfter?: string
  }
}
export function useKawaOracleWasmPricesQuery<TData = ArrayOfPriceResponse>({
  client,
  args,
  options,
}: KawaOracleWasmPricesQuery<TData>) {
  return useQuery<ArrayOfPriceResponse, Error, TData>(
    kawaOracleWasmQueryKeys.prices(client?.contractAddress, args),
    () =>
      client
        ? client.prices({
            limit: args.limit,
            startAfter: args.startAfter,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface KawaOracleWasmPriceQuery<TData>
  extends KawaOracleWasmReactQuery<PriceResponse, TData> {
  args: {
    denom: string
  }
}
export function useKawaOracleWasmPriceQuery<TData = PriceResponse>({
  client,
  args,
  options,
}: KawaOracleWasmPriceQuery<TData>) {
  return useQuery<PriceResponse, Error, TData>(
    kawaOracleWasmQueryKeys.price(client?.contractAddress, args),
    () =>
      client
        ? client.price({
            denom: args.denom,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface KawaOracleWasmPriceSourcesQuery<TData>
  extends KawaOracleWasmReactQuery<ArrayOfPriceSourceResponseForString, TData> {
  args: {
    limit?: number
    startAfter?: string
  }
}
export function useKawaOracleWasmPriceSourcesQuery<TData = ArrayOfPriceSourceResponseForString>({
  client,
  args,
  options,
}: KawaOracleWasmPriceSourcesQuery<TData>) {
  return useQuery<ArrayOfPriceSourceResponseForString, Error, TData>(
    kawaOracleWasmQueryKeys.priceSources(client?.contractAddress, args),
    () =>
      client
        ? client.priceSources({
            limit: args.limit,
            startAfter: args.startAfter,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface KawaOracleWasmPriceSourceQuery<TData>
  extends KawaOracleWasmReactQuery<PriceSourceResponseForString, TData> {
  args: {
    denom: string
  }
}
export function useKawaOracleWasmPriceSourceQuery<TData = PriceSourceResponseForString>({
  client,
  args,
  options,
}: KawaOracleWasmPriceSourceQuery<TData>) {
  return useQuery<PriceSourceResponseForString, Error, TData>(
    kawaOracleWasmQueryKeys.priceSource(client?.contractAddress, args),
    () =>
      client
        ? client.priceSource({
            denom: args.denom,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface KawaOracleWasmConfigQuery<TData>
  extends KawaOracleWasmReactQuery<ConfigResponse, TData> {}
export function useKawaOracleWasmConfigQuery<TData = ConfigResponse>({
  client,
  options,
}: KawaOracleWasmConfigQuery<TData>) {
  return useQuery<ConfigResponse, Error, TData>(
    kawaOracleWasmQueryKeys.config(client?.contractAddress),
    () => (client ? client.config() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface KawaOracleWasmCustomMutation {
  client: KawaOracleWasmClient
  msg: WasmOracleCustomExecuteMsg
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useKawaOracleWasmCustomMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, KawaOracleWasmCustomMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, KawaOracleWasmCustomMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.custom(msg, fee, memo, funds),
    options,
  )
}
export interface KawaOracleWasmUpdateConfigMutation {
  client: KawaOracleWasmClient
  msg: {
    baseDenom?: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useKawaOracleWasmUpdateConfigMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, KawaOracleWasmUpdateConfigMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, KawaOracleWasmUpdateConfigMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) =>
      client.updateConfig(msg, fee, memo, funds),
    options,
  )
}
export interface KawaOracleWasmUpdateOwnerMutation {
  client: KawaOracleWasmClient
  msg: OwnerUpdate
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useKawaOracleWasmUpdateOwnerMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, KawaOracleWasmUpdateOwnerMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, KawaOracleWasmUpdateOwnerMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.updateOwner(msg, fee, memo, funds),
    options,
  )
}
export interface KawaOracleWasmRemovePriceSourceMutation {
  client: KawaOracleWasmClient
  msg: {
    denom: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useKawaOracleWasmRemovePriceSourceMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, KawaOracleWasmRemovePriceSourceMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, KawaOracleWasmRemovePriceSourceMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) =>
      client.removePriceSource(msg, fee, memo, funds),
    options,
  )
}
export interface KawaOracleWasmSetPriceSourceMutation {
  client: KawaOracleWasmClient
  msg: {
    denom: string
    priceSource: WasmPriceSourceForString
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useKawaOracleWasmSetPriceSourceMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, KawaOracleWasmSetPriceSourceMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, KawaOracleWasmSetPriceSourceMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) =>
      client.setPriceSource(msg, fee, memo, funds),
    options,
  )
}
