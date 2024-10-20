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

| option         | description                                                                                                                                                  | default          |
| -------------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| `separateContractSelectors`         | separate by contract                                                                                                                                         | `true`           |
| `orderedByValue` | order function selectors by hex value, least to greatest                                                                                                      | `false`          |
| `outputPath`        | directory where output file should be written                                                                                                     | `./`             |
| `outputFilename`         | filename of generated output                                                                                              | `selectors.json` |
| `pretty`         | pretty print the output JSON(s)                                                   | `true`           |
| `runOnCompile`       | run the selectors task on compile                                                                                                   | `true`           |
| `includeParams`      | include the parameters in the selector title (outputs only)                                                                                                 | `true`           |
| `only`       | Array of String matchers used to select included contracts, defaults to all contracts if length is 0                                                                                  | `[]`             |
| `except`       | Array of String matchers used to exclude contracts                                                                                   | `[]`             |
| `skipSelectors`       | Array of selectors to be excluded from generated output | `[]`             |


```bash
<your hardhat config> = {
  functionSelectors: {
    separateContractSelectors: true, 
    orderedByValue: true,
    <other optional params>
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
