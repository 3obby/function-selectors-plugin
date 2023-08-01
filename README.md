# generate-function-selectors plugin

Hardhat TS plugin to generate function selectors from each of the ABI/.json files found in the artifacts/contracts. (Depth/organization doesn't matter)

Outputs 'selectors.json' to project's root directory, which looks like the below for the hardhat example project:

```
{
  "Lock.sol": {
    "0x251c1aa3": "unlockTime",
    "0x3ccfd60b": "withdraw",
    "0x8da5cb5b": "owner"
  }
}
```

## Quick Start

1. Install the Hardhat plug-in

```npm
npm install hardhat-generate-function-selectors
```

```yarn
yarn add hardhat-generate-function-selectors
```

2. Add this to your hardhat.config.js

```js
require("hardhat-generate-function-selectors");
```

```ts
import "hardhat-generate-function-selectors";
```

3. Add this to your hardhat.config.js as well:

```bash
<your hardhat config> = {
  functionSelectors: {
    separateContractSelectors: true, //separate by contract
    orderedByValue: true, //order function selectors by hex value, least to greatest
  },
};
```

Now you're able to to generate the function selectors with:

```bash
npx hardhat selectors
```

```bash
yarn hardhat selectors
```
