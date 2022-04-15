import { Contract, ethers } from "ethers";
import { utils, Provider } from "zksync-web3";
import 'dotenv/config';

// Interact with Layer1 Contract
require('dotenv').config();
const GOVERNANCE_ABI = require("./governance.json");
const COUNTER_ABI = require("./counter.json");

const L1_CONTRACT_ADDRESS = process.env.L1_CONTRACT_ADDRESS;
const L2_PRIVATE_KEY = process.env.L2_PRIVATE_KEY;
const L2_CONTRACT_ADDRESS = process.env.L2_CONTRACT_ADDRESS;

// console.log(GOVERNANCE_ADDRESS)

async function main() {
  // 1. Connect
  // L1 Contract Provider, for interact with layer1
  const l1Provider = ethers.providers.getDefaultProvider("goerli");
  const wallet = new ethers.Wallet(L2_PRIVATE_KEY, l1Provider);
  const governance = new ethers.Contract(L1_CONTRACT_ADDRESS, GOVERNANCE_ABI, wallet);

  // L2 Contract Provider, for interact with layer2
  const l2Provider = new Provider("https://zksync2-testnet.zksync.dev");
  const zkSyncAddress = await l2Provider.getMainContractAddress();
  const zkSyncContract = new ethers.Contract(zkSyncAddress, utils.ZKSYNC_MAIN_ABI, wallet);

  // 2. 调用L2的合约，需要L1向L2转一部分费用
  // More info about zk fee model：https://v2-docs.zksync.io/dev/zksync-v2/fee-model.html
  // ethers中的interface：拿到_abiCoder、functions、errors、events、structs等信息
  const counterInterface = new ethers.utils.Interface(COUNTER_ABI);
  // encode Counter.sol 中的increment函数（encode l1 tx）
  const data = counterInterface.encodeFunctionData("increment", []);

  // 通过contract call的gasPriceUsed来计算，所以需要在调用前就得到gasPrice的信息
  const gasPrice = await l1Provider.getGasPrice();
  // 在这里定义了ergs limit，目前zkSync还没有实现准确计算 L1->L2 tx费用（ergslimit）的功能，跟以太坊和rollup本身有关系，因为ZKrollup基于以太坊layer1，ergs也会受到gas影响
  const ergsLimit = BigNumber.from(100);

  // 计算出准确的成本（wei）
  const baseCost = await zkSyncContract.executeBaseCost(gasPrice, ergsLimit, ethers.utils.hexlify(data).length, 0, 0);

  // 3. 调用合约
  // 通过Layer1合约（governance）调用Layer2合约（Counter）
  const changeTx = await governance.callZkSync(zkSyncAddress, L2_CONTRACT_ADDRESS, data, ergsLimit, {
    value: baseCost,
    gasPrice,
  });
  // 等待调用完成
  await changeTx.wait();
  // 获取调用结果
  const l2Response = await l2Provider.getL2TransactionFromPriorityOp(changeTx);
  const l2Receipt = await l2Response.wait();
  console.log(l2Receipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});