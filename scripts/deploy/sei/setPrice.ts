import { setupDeployer } from '../base/setupDeployer'
import { seiTestnetConfig, seiOracle } from './config_testnet'

async function main() {
  const deployer = await setupDeployer(seiTestnetConfig)

  await deployer.setOracle(seiOracle)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
