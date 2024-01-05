import { taskRunner } from '../base'
import { seiTestnetConfig } from './config_testnet.js'

void (async function () {
  await taskRunner(seiTestnetConfig)
})()
