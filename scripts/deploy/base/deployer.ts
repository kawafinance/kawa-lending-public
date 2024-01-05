import { AssetConfig, DeploymentConfig, OracleConfig } from '../../types/config'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import * as fs from 'fs'
import { printBlue, printGreen, printRed, printYellow } from '../../utils/chalk'
import { ARTIFACTS_PATH, Storage } from './storage'
import { InstantiateMsgs } from '../../types/msg'
import { writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import assert from 'assert'

import {
  InstantiateMsg as LendingInstantiateMsg,
  QueryMsg as LendingQueryMsg,
} from '../../types/generated/kawa-lending/KawaLending.types'
import { InstantiateMsg as AddressProviderInstantiateMsg } from '../../types/generated/kawa-address-provider/KawaAddressProvider.types'
import {
  WasmOracleCustomInitParams,
  InstantiateMsg as WasmOracleInstantiateMsg,
} from '../../types/generated/kawa-oracle-wasm/KawaOracleWasm.types'
import { ExecuteMsg as WasmOracleExecuteMsg } from '../../types/generated/kawa-oracle-wasm/KawaOracleWasm.types'
import { StorageItems } from '../../types/storageItems'

type OracleInstantiateMsg = WasmOracleInstantiateMsg

export class Deployer {
  constructor(
    public config: DeploymentConfig,
    public client: SigningCosmWasmClient,
    public deployerAddress: string,
    private storage: Storage,
  ) {}

  async saveStorage() {
    await this.storage.save()
  }

  async assertDeployerBalance() {
    const accountBalance = await this.client.getBalance(
      this.deployerAddress,
      this.config.baseAssetDenom,
    )
    printYellow(
      `${this.config.baseAssetDenom} account balance is: ${accountBalance.amount} (${
        Number(accountBalance.amount) / 1e6
      } ${this.config.chainPrefix})`,
    )
    if (Number(accountBalance.amount) < 1_000_000 && this.config.chainId === 'osmo-test-4') {
      printRed(
        `not enough ${this.config.chainPrefix} tokens to complete action, you may need to go to a test faucet to get more tokens.`,
      )
    }
  }

  async upload(name: keyof Storage['codeIds'], file: string) {
    if (this.storage.codeIds[name]) {
      printBlue(`Wasm already uploaded :: ${name} :: ${this.storage.codeIds[name]}`)
      return
    }

    const wasm = fs.readFileSync(ARTIFACTS_PATH + file)
    console.log(`Uploading wasm...`, ARTIFACTS_PATH + file)
    try {
      const uploadResult = await this.client.upload(this.deployerAddress, wasm, 'auto')

      console.log(`Upload result...`, uploadResult)
      this.storage.codeIds[name] = uploadResult.codeId

      console.log(`Upload result codeid...`, this.storage.codeIds)

      printGreen(`${this.config.chainId} :: ${name} : ${this.storage.codeIds[name]}`)
    } catch (ex) {
      console.log(ex)
      printRed(`error while uploading wasm...`)
    }
  }

  setOwnerAddr() {
    if (this.config.multisigAddr) {
      this.storage.owner = this.config.multisigAddr
    } else {
      this.storage.owner = this.deployerAddress
    }
    printGreen(`Owner is set to: ${this.storage.owner}`)
  }

  setAddress(name: keyof StorageItems['addresses'], address: string) {
    this.storage.addresses[name] = address
    printGreen(`Address of ${name} is set to: ${this.storage.addresses[name]}`)
  }

  async instantiate(name: keyof Storage['addresses'], codeId: number, msg: InstantiateMsgs) {
    if (this.storage.addresses[name]) {
      printBlue(`Contract already instantiated :: ${name} :: ${this.storage.addresses[name]}`)
      return
    }

    const { contractAddress: redBankContractAddress } = await this.client.instantiate(
      this.deployerAddress,
      codeId,
      msg,
      `kawa-${name}`,
      'auto',
      { admin: this.storage.owner },
    )

    this.storage.addresses[name] = redBankContractAddress
    printGreen(
      `${this.config.chainId} :: ${name} Contract Address : ${this.storage.addresses[name]}`,
    )
  }

  async instantiateAddressProvider() {
    const msg: AddressProviderInstantiateMsg = {
      owner: this.deployerAddress,
      prefix: this.config.chainPrefix,
    }
    await this.instantiate('address-provider', this.storage.codeIds['address-provider']!, msg)
  }

  async instantiateLending() {
    const msg: LendingInstantiateMsg = {
      owner: this.deployerAddress,
      config: {
        address_provider: this.storage.addresses['address-provider']!,
        close_factor: '0.5',
      },
    }
    await this.instantiate('lending', this.storage.codeIds.lending!, msg)
  }

  async instantiateOracle(init_params?: WasmOracleCustomInitParams) {
    const msg: OracleInstantiateMsg = {
      owner: this.deployerAddress,
      base_denom: this.config.oracleBaseDenom,
      custom_init: init_params,
    }
    await this.instantiate('oracle', this.storage.codeIds.oracle!, msg)
  }

  async saveDeploymentAddrsToFile() {
    const addressesDir = resolve(join(__dirname, '../../../deploy/addresses'))
    await writeFile(
      `${addressesDir}/${this.config.chainId}.json`,
      JSON.stringify(this.storage.addresses),
    )
  }

  async updateAddressProvider() {
    printBlue('Updating addresses in Address Provider...')
    const addressesToSet = [
      {
        address_type: 'oracle',
        address: this.storage.addresses.oracle,
      },
      {
        address_type: 'lending',
        address: this.storage.addresses.lending,
      },
      {
        address_type: 'fee_collector',
        address: this.config.feeCollectorAddr,
      },
      {
        address_type: 'safety_fund',
        address: this.config.safetyFundAddr,
      },
      {
        address_type: 'protocol_admin',
        address: this.config.protocolAdminAddr,
      },
    ]

    for (const addrObj of addressesToSet) {
      if (this.storage.execute.addressProviderUpdated[addrObj.address_type]) {
        printBlue(`Address already updated for ${addrObj.address_type}.`)
        continue
      }
      printBlue(`Setting ${addrObj.address_type} to ${addrObj.address}`)
      await this.client.execute(
        this.deployerAddress,
        this.storage.addresses['address-provider']!,
        { set_address: addrObj },
        'auto',
      )
      this.storage.execute.addressProviderUpdated[addrObj.address_type] = true
    }
    printGreen('Address Provider update completed')
  }

  async initializeAsset(assetConfig: AssetConfig) {
    if (this.storage.execute.assetsInitialized.includes(assetConfig.denom)) {
      printBlue(`${assetConfig.symbol} already initialized.`)
      return
    }
    printBlue(`Initializing ${assetConfig.symbol}...`)

    const msg = {
      init_asset: {
        denom: assetConfig.denom,
        params: {
          max_loan_to_value: assetConfig.max_loan_to_value,
          reserve_factor: assetConfig.reserve_factor,
          liquidation_threshold: assetConfig.liquidation_threshold,
          liquidation_bonus: assetConfig.liquidation_bonus,
          interest_rate_model: {
            optimal_utilization_rate: assetConfig.interest_rate_model.optimal_utilization_rate,
            base: assetConfig.interest_rate_model.base,
            slope_1: assetConfig.interest_rate_model.slope_1,
            slope_2: assetConfig.interest_rate_model.slope_2,
          },
          deposit_cap: assetConfig.deposit_cap,
          deposit_enabled: assetConfig.deposit_enabled,
          borrow_enabled: assetConfig.borrow_enabled,
        },
      },
    }

    await this.client.execute(this.deployerAddress, this.storage.addresses.lending!, msg, 'auto')

    printYellow(`${assetConfig.symbol} initialized`)

    this.storage.execute.assetsInitialized.push(assetConfig.denom)
  }

  async recordTwapSnapshots(denoms: string[]) {
    const msg: WasmOracleExecuteMsg = {
      custom: {
        record_twap_snapshots: {
          denoms,
        },
      },
    }

    await this.client.execute(this.deployerAddress, this.storage.addresses.oracle!, msg, 'auto')

    printYellow(`Twap snapshots recorded for denoms: ${denoms.join(',')}.`)
  }
  async setOracle(oracleConfig: OracleConfig) {
    printBlue(`Setting oracle price source: ${JSON.stringify(oracleConfig)}`)

    const msg = {
      set_price_source: oracleConfig,
    }

    await this.client.execute(this.deployerAddress, this.storage.addresses.oracle!, msg, 'auto')

    printYellow('Oracle Price is set.')

    this.storage.execute.oraclePriceSet = true

    try {
      const oracleResult = (await this.client.queryContractSmart(this.storage.addresses.oracle!, {
        price: { denom: oracleConfig.denom },
      })) as { price: number; denom: string }

      printGreen(
        `${this.config.chainId} :: ${oracleConfig.denom} oracle price:  ${JSON.stringify(
          oracleResult,
        )}`,
      )
    } catch (e) {
      // Querying astroport TWAP can fail if enough TWAP snapshots have not been recorded yet
      if (!Object.keys(oracleConfig.price_source).includes('astroport_twap')) {
        throw e
      }
    }
  }

  async executeDeposit() {
    const msg = { deposit: {} }

    const coins = [
      {
        denom: this.config.baseAssetDenom,
        amount: '10',
      },
    ]

    printYellow('Executing deposit...')

    try {
      await this.client.execute(
        this.deployerAddress,
        this.storage.addresses.lending!,
        msg,
        'auto',
        undefined,
        coins,
      )

      printYellow('Deposit Executed.')

      printYellow('Querying user position:')

      const msgTwo: LendingQueryMsg = { user_position: { user: this.deployerAddress } }
      console.log(await this.client.queryContractSmart(this.storage.addresses.lending!, msgTwo))
    } catch (ex) {
      printRed('Error while depositing...')
      console.log(ex)
    }
  }

  async executeBorrow() {
    const msg = {
      borrow: {
        denom: this.config.baseAssetDenom,
        amount: '1',
      },
    }

    await this.client.execute(this.deployerAddress, this.storage.addresses.lending!, msg, 'auto')
    printYellow('Borrow executed:')

    const msgTwo = { user_position: { user: this.deployerAddress } }
    console.log(await this.client.queryContractSmart(this.storage.addresses.lending!, msgTwo))
  }

  async executeRepay() {
    const msg = { repay: {} }
    const coins = [
      {
        denom: this.config.baseAssetDenom,
        amount: '2',
      },
    ]

    await this.client.execute(
      this.deployerAddress,
      this.storage.addresses.lending!,
      msg,
      'auto',
      undefined,
      coins,
    )
    printYellow('Repay executed:')

    const msgTwo = { user_position: { user: this.deployerAddress } }
    console.log(await this.client.queryContractSmart(this.storage.addresses.lending!, msgTwo))
  }

  async executeWithdraw() {
    const msg = {
      withdraw: {
        denom: this.config.baseAssetDenom,
        amount: '10',
      },
    }

    await this.client.execute(this.deployerAddress, this.storage.addresses.lending!, msg, 'auto')
    printYellow('Withdraw executed:')

    const msgTwo = { user_position: { user: this.deployerAddress } }
    console.log(await this.client.queryContractSmart(this.storage.addresses.lending!, msgTwo))
  }

  async updateIncentivesContractOwner() {
    const msg = {
      update_owner: {
        propose_new_owner: {
          proposed: this.storage.owner,
        },
      },
    }
    await this.client.execute(this.deployerAddress, this.storage.addresses.incentives!, msg, 'auto')
    printYellow('Owner updated to Mutlisig for Incentives')
    const incentivesConfig = (await this.client.queryContractSmart(
      this.storage.addresses.incentives!,
      {
        config: {},
      },
    )) as { proposed_new_owner: string }

    printRed(`${incentivesConfig.proposed_new_owner}`)
    assert.equal(incentivesConfig.proposed_new_owner, this.config.multisigAddr)
  }

  async updateLendingContractOwner() {
    const msg = {
      update_owner: {
        propose_new_owner: {
          proposed: this.storage.owner,
        },
      },
    }
    await this.client.execute(this.deployerAddress, this.storage.addresses.lending!, msg, 'auto')
    printYellow('Owner updated to Mutlisig for Red Bank')
    const lendingConfig = (await this.client.queryContractSmart(this.storage.addresses.lending!, {
      config: {},
    })) as { proposed_new_owner: string }

    assert.equal(lendingConfig.proposed_new_owner, this.config.multisigAddr)
  }

  async updateOracleContractOwner() {
    const msg = {
      update_owner: {
        propose_new_owner: {
          proposed: this.storage.owner,
        },
      },
    }
    await this.client.execute(this.deployerAddress, this.storage.addresses.oracle!, msg, 'auto')
    printYellow('Owner updated to Mutlisig for Oracle')
    const oracleConfig = (await this.client.queryContractSmart(this.storage.addresses.oracle!, {
      config: {},
    })) as { proposed_new_owner: string }

    assert.equal(oracleConfig.proposed_new_owner, this.config.multisigAddr)
  }

  async updateRewardsContractOwner() {
    const msg = {
      update_owner: {
        propose_new_owner: {
          proposed: this.storage.owner,
        },
      },
    }
    await this.client.execute(
      this.deployerAddress,
      this.storage.addresses['rewards-collector']!,
      msg,
      'auto',
    )
    printYellow('Owner updated to Mutlisig for Rewards Collector')
    const rewardsConfig = (await this.client.queryContractSmart(
      this.storage.addresses['rewards-collector']!,
      {
        config: {},
      },
    )) as { proposed_new_owner: string }

    assert.equal(rewardsConfig.proposed_new_owner, this.config.multisigAddr)
  }

  async updateSwapperContractOwner() {
    const msg = {
      update_owner: {
        propose_new_owner: {
          proposed: this.storage.owner,
        },
      },
    }
    await this.client.execute(this.deployerAddress, this.storage.addresses.swapper!, msg, 'auto')
    printYellow('Owner updated to Mutlisig for Swapper')
    const swapperConfig = (await this.client.queryContractSmart(this.storage.addresses.swapper!, {
      owner: {},
    })) as { proposed: string }

    assert.equal(swapperConfig.proposed, this.config.multisigAddr)
  }

  async updateAddressProviderContractOwner() {
    const msg = {
      update_owner: {
        propose_new_owner: {
          proposed: this.storage.owner,
        },
      },
    }
    await this.client.execute(
      this.deployerAddress,
      this.storage.addresses['address-provider']!,
      msg,
      'auto',
    )
    printYellow('Owner updated to Mutlisig for Rewards Collector')
    const addressProviderConfig = (await this.client.queryContractSmart(
      this.storage.addresses['address-provider']!,
      {
        config: {},
      },
    )) as { proposed_new_owner: string }

    assert.equal(addressProviderConfig.proposed_new_owner, this.config.multisigAddr)
  }
}
