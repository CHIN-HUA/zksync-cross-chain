import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

const goerli = require('./goerli.json');

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// * hardhat config灵活性很强，可以自己定义：https://hardhat.org/config/
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    // * hardhat关于编译solidity的相关设置，详细设置见：https://docs.soliditylang.org/en/v0.7.4/using-the-compiler.html#input-description
    settings: {
      // * 合约gas优化，假设将被调用的次数（run），详细逻辑见：https://docs.soliditylang.org/en/v0.7.4/using-the-compiler.html#input-description
      optimizer: {
        enabled: true,
        // * 如果希望部署成本低、未来调用成本高，就把run设置为1；反之无所谓部署成本、希望调用成本低，可以把run设置为一个较高值
        runs: 200
      },
      outputSelection: {
          '*': {
            '*': ['storageLayout']
          }
      }
    }
  },
  networks: {
    goerli: {
      // * 导入goerli的rpc url和部署合约地址的private key
      url: goerli.nodeUrl,
      accounts: [goerli.deployerPrivateKey]
    },
    localhost: {
      // * 运行 npx hardhat node 启动hardhat network时连接的测试网
      url: 'http://127.0.0.1:8545',
      accounts: ['0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110']
    }
  },
  // * 一个报告gas使用量的插件：https://learnblockchain.cn/docs/hardhat/plugins/hardhat-gas-reporter.html
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  // * 用Etherscan的验证服务对合约进行检查，需要api：https://learnblockchain.cn/docs/hardhat/plugins/nomiclabs-hardhat-etherscan.html
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;