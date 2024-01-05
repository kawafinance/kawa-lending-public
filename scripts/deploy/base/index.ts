import { setupDeployer } from './setupDeployer'
import { DeploymentConfig } from '../../types/config'
import { printGreen, printRed } from '../../utils/chalk'

export const taskRunner = async (config: DeploymentConfig) => {
  const deployer = await setupDeployer(config)

  try {
    await deployer.saveStorage()
    await deployer.assertDeployerBalance()

    // Upload contracts
    await deployer.upload('lending', 'kawa_lending.wasm')
    await deployer.upload('address-provider', 'kawa_address_provider.wasm')
    await deployer.upload('oracle', `kawa_oracle_${config.oracleName}.wasm`)

    // Instantiate contracts
    deployer.setOwnerAddr()
    await deployer.instantiateAddressProvider()
    await deployer.instantiateLending()
    await deployer.instantiateOracle(config.oracleCustomInitParams)
    await deployer.saveDeploymentAddrsToFile()

    // setup
    await deployer.updateAddressProvider()
    for (const asset of config.assets) {
      await deployer.initializeAsset(asset)
    }
    for (const oracleConfig of config.oracleConfigs) {
      await deployer.setOracle(oracleConfig)
    }

    // run tests
    if (config.runTests) {
      await deployer.executeDeposit()
      await deployer.executeBorrow()
      await deployer.executeRepay()
      await deployer.executeWithdraw()
    }

    if (config.multisigAddr) {
      await deployer.updateIncentivesContractOwner()
      await deployer.updateLendingContractOwner()
      await deployer.updateOracleContractOwner()
      await deployer.updateRewardsContractOwner()
      await deployer.updateSwapperContractOwner()
      await deployer.updateAddressProviderContractOwner()
      printGreen('It is confirmed that all contracts have transferred ownership to the Multisig')
    } else {
      printGreen('Owner remains the deployer address.')
    }
  } catch (e) {
    printRed(e)
  } finally {
    await deployer.saveStorage()
  }
}
