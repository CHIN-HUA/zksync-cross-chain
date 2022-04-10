//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 实现了一些layer1的方法，以及我们Governance update的方法
import "@matterlabs/zksync-contracts/contracts/interfaces/IZkSync.sol";
// zk operation的核心代码，未来值得研究
import "@matterlabs/zksync-contracts/contracts/libraries/Operations.sol";

contract Governance {
    // 定义address
    address public governor;

    // 参数：message sender
    constructor() {
        governor = msg.sender;
    }

    function callZkSync(
        address zkSyncAddress, 
        address contractAddr, 
        bytes memory data,
        uint64 ergsLimit
        // public所有人都可以访问，external只能在外部访问（不能在内部访问 ）
        // 添加payable，该函数被调用时允许接收ether：https://solidity-by-example.org/payable/
    ) external payable {
        require(msg.sender == governor, "Only governor is allowed");

        // 实例化了一个IZkSync
        IZkSync zksync = IZkSync(zkSyncAddress);
        // Note that we pass the value as the fee for executing the transaction
        // 传入msg.value、合约地址、data、ergsLimit、QueueType.Deque、OpTree.Full
        zksync.requestExecute{value: msg.value}(contractAddr, data, ergsLimit, Operations.QueueType.Deque, Operations.OpTree.Full);
    }
}