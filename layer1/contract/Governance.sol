//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 实现了一些layer1的方法，以及我们Governance update的方法. Implemented some layer1 methods, as well as our Governance update method
import "@matterlabs/zksync-contracts/contracts/interfaces/IZkSync.sol";
// zk operation的核心代码，未来值得研究. The core code of zk operation is worth studying in the future
import "@matterlabs/zksync-contracts/contracts/libraries/Operations.sol";

contract Governance {
    // define address
    address public governor;

    // parameter：message sender
    constructor() {
        governor = msg.sender;
    }

    function callZkSync(
        address zkSyncAddress, 
        address contractAddr, 
        bytes memory data,
        uint64 ergsLimit
        // public所有人都可以访问，external只能在外部访问（不能在内部访问 ）. Public can be accessed by everyone, external can only be accessed externally (can not be accessed internally)
        // 添加payable，该函数被调用时允许接收ether：https://solidity-by-example.org/payable/. Add payable, which allows to receive ether when the function is called
    ) external payable {
        require(msg.sender == governor, "Only governor is allowed");

        // 实例化了一个IZkSync. instantiated an i zk sync
        IZkSync zksync = IZkSync(zkSyncAddress);
        // Note that we pass the value as the fee for executing the transaction
        // 传入msg.value、合约地址、data、ergsLimit、QueueType.Deque、OpTree.Full. Input msg.value, contract address, data, ergs limit, queue type.deque, op tree.full
        zksync.requestExecute{value: msg.value}(contractAddr, data, ergsLimit, Operations.QueueType.Deque, Operations.OpTree.Full);
    }
}