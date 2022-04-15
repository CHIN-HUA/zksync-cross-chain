# 基本思路

在zkSync Layer2上部署Counter合约，其中的increment method每次调用都会增加value值

在Ethereum Layer1上部署Governance合约，通过L1合约调用L2的increment method

流程图如下：

<img width="650" alt="Screen Shot 2022-04-15 at 23 11 55" src="https://user-images.githubusercontent.com/70309026/163587835-41dcb9a2-6791-4012-a3cb-0e0d2fdf8a6a.png">

# 合约结构

Layer1的合约如下，未来用户会在l1上通过这个合约向l2的合约发送请求（目前zkSync只实现了L1 -> L2，暂时没有实现L2 -> L1）

核心文件分别是IZkSync.sol和Operations.sol

```
contract Governance {
    address public governor;

    constructor() {
        governor = msg.sender;
    }

    function callZkSync(
        address zkSyncAddress, 
        address contractAddr, 
        bytes memory data,
        uint64 ergsLimit
    ) external payable {
        require(msg.sender == governor, "Only governor is allowed");

        IZkSync zksync = IZkSync(zkSyncAddress);
        zksync.requestExecute{value: msg.value}(contractAddr, data, ergsLimit, Operations.QueueType.Deque, Operations.OpTree.Full);
    }
}
```
  
<br>

Layer2的合约如下，通过调用increment，可以将value值加1
```
contract Counter {
  uint256 public value = 0;

  address public governance;

  constructor(address newGovernance) {
      governance = newGovernance;
  }

  function increment() public {
      require(msg.sender == governance);
      value += 1;
  }
}
```

# 启动方法

1. Clone这个仓库到本地以后，编译并部署L1合约
```
cd Layer1

// 这里使用的是goerli  network：实际上运行hardhat run --network goerli ./deploy/deploy.ts
yarn compile
yarn deploy
```

2. 之后编译并部署L2合约
```
cd Layer2

// 这里使用的是zksync v2 network：实际上运行yarn hardhat deploy-zksync
yarn compile
yarn deploy
```

3. 调用layer1合约，查询当前的value存储值
```
cd Layer2
ts-node scripts/display-value.ts
```

4. 调用Governance合约，向Layer2发送请求，将value值加一
```
yarn ts-node ./scripts/increment-counter.ts
```

5. 查询返回值，验证存储成功
```
yarn ts-node ./scripts/display-value.ts

return:
The counter value is 1
```
