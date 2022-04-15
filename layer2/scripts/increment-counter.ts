import { Contract, ethers } from "ethers";
import { utils, Provider } from "zksync-web3";
import 'dotenv/config';

// Interact with Layer1 Contract
require('dotenv').config();
const GOVERNANCE_ABI = require("./governance.json");
const L1_CONTRACT_ADDRESS = process.env.L1_CONTRACT_ADDRESS;
const L2_PRIVATE_KEY = process.env.L2_PRIVATE_KEY;
const L2_CONTRACT_ADDRESS = process.env.L2_CONTRACT_ADDRESS;

// console.log(GOVERNANCE_ADDRESS)

async function main() {
  // L1 Contract
  const l1Provider = ethers.providers.getDefaultProvider("goerli");
  const wallet = new ethers.Wallet(L2_PRIVATE_KEY, l1Provider);
  const governance = new ethers.Contract(L1_CONTRACT_ADDRESS, GOVERNANCE_ABI, wallet);

  // L2 Contract
  const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
  const zkSyncAddress = await l2Provider.getMainContractAddress();
  const zkSyncContract = new ethers.Contract(zkSyncAddress, utils.ZKSYNC_MAIN_ABI, wallet);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});