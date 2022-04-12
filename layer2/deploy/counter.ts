import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

require('dotenv').config()


// Insert the address of the governance contract
const GOVERNANCE_ADDRESS = process.env.L1_CONTRACT_ADDRESS;

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  if(process.env.L2_PRIVATE_KEY){
    console.log(`Running deploy script for the Counter contract`);

    // Initialize the wallet.
    const wallet = new Wallet(process.env.L2_PRIVATE_KEY);
  
    // Create deployer object and load the artifact of the contract we want to deploy.
    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact("Counter");
  
    // Deposit some funds to L2 to be able to perform deposits.
    const depositAmount = ethers.utils.parseEther("0.001");
    const depositHandle = await deployer.zkWallet.deposit({
      to: deployer.zkWallet.address,
      token: utils.ETH_ADDRESS,
      amount: depositAmount,
    });
    // Wait until the deposit is processed on zkSync
    await depositHandle.wait();
    console.log('Transfer completed successfully'); 
  
    // Deploy this contract. The returned object will be of a `Contract` type, similar to the ones in `ethers`.
    // The address of the governance is an argument for contract constructor.
    const counterContract = await deployer.deploy(artifact, [GOVERNANCE_ADDRESS]);
  
    // Show the contract info.
    const contractAddress = counterContract.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
  } else {
    console.log('no private key');
  }
}