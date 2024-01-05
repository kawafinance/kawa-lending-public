import { taskRunner } from '../base'
import { seiMainnetConfig } from './config_mainnet.js'

void (async function () {
  await taskRunner(seiMainnetConfig)
})()
