# hardhat selectors

Hardhat TS plugin to generate function selectors from each of the ABI/.json files found in the artifacts/contracts. (Depth/organization doesn't matter)

Outputs 'selectors.json' to project's root directory:

```
{
  "Lock.sol": {
    "0x251c1aa3": "unlockTime",
    "0x3ccfd60b": "withdraw",
    "0x8da5cb5b": "owner"
  }
}
```

if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "./function-selectors-plugin/index.ts";
```

Try running the following task:

```shell
yarn hardhat selectors
```

# options

```shell
module.exports = {
  functionSelectors: {
    separateContractSelectors: true, //separate by contract
    orderedByValue: true, //order function selectors by hex value, least to greatest
  },
};
```
