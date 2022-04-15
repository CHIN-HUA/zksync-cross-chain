import { Contract, Provider, Wallet } from "zksync-web3";
import 'dotenv/config';

require('dotenv').config()

const COUNTER_ADDRESS = process.env.L1_CONTRACT_ADDRESS;
// console.log(COUNTER_ADDRESS)
const COUNTER_ABI = require("./counter.json");

async function main() {
  // RPC
  const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
  // Interact with Contract
  const counter = new Contract(COUNTER_ADDRESS, COUNTER_ABI, l2Provider);

  console.log(`The counter value is ${(await counter.value()).toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});