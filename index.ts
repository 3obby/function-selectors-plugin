import { extendEnvironment } from "hardhat/config";
import { task } from "hardhat/config";
import * as fs from "fs";
import * as path from "path";
import "@nomiclabs/hardhat-ethers";

interface CustomHardhatConfig {
  separateContractSelectors?: boolean;
  orderedByValue?: boolean;
}

declare module "hardhat/types/config" {
  interface HardhatUserConfig {
    functionSelectors?: CustomHardhatConfig;
  }
  interface HardhatConfig {
    functionSelectors: CustomHardhatConfig;
  }
}

extendEnvironment((hre) => {
  hre.selectors = async () => {
    const artifactsDir = path.join(hre.config.paths.artifacts, "/contracts");
    const separateContractSelectors =
      hre.config.functionSelectors.separateContractSelectors || false;
    const orderedByValue = hre.config.functionSelectors.orderedByValue || false;

    // Initialize an object to store all contracts selectors
    let contractsSelectors: {
      [contract: string]: { [selector: string]: string };
    } = {};

    const processDirectory = (directory: string) => {
      const files = fs.readdirSync(directory);

      for (let file of files) {
        const filePath = path.join(directory, file);

        if (fs.lstatSync(filePath).isDirectory()) {
          processDirectory(filePath);
        } else if (
          path.extname(file) === ".json" &&
          !file.endsWith(".dbg.json")
        ) {
          const contractName = path.basename(file, ".json");
          const artifact = JSON.parse(fs.readFileSync(filePath, "utf8"));
          const abi = artifact.abi;

          if (separateContractSelectors) {
            contractsSelectors[contractName] = {};
          }

          for (let item of abi) {
            if (item.type === "function") {
              const abiCoder = new hre.ethers.utils.AbiCoder();
              const packedData = abiCoder.encode(
                ["string"],
                [
                  `${item.name}(${item.inputs
                    .map((i: any) => i.type)
                    .join(",")})`,
                ]
              );

              const signature = hre.ethers.utils.keccak256(packedData);
              const selector = signature.slice(0, 10);

              // Save the selector under the corresponding contract if enabled
              if (separateContractSelectors) {
                contractsSelectors[contractName][selector] = item.name;
              } else {
                contractsSelectors[selector] = item.name;
              }
            }
          }
        }
      }
    };

    processDirectory(artifactsDir);

    // Ordering function selectors by their hex value if enabled
    if (orderedByValue) {
      for (let contract in contractsSelectors) {
        const unorderedSelectors = contractsSelectors[contract];
        const orderedSelectors = Object.keys(unorderedSelectors)
          .sort()
          .reduce((obj, key) => {
            obj[key] = unorderedSelectors[key];
            return obj;
          }, {} as { [selector: string]: string });

        contractsSelectors[contract] = orderedSelectors;
      }
    }

    // Write the contracts' selectors to a file
    fs.writeFileSync(
      "selectors.json",
      JSON.stringify(contractsSelectors, null, 2)
    );

    console.log("Function selectors have been written to selectors.json");
  };
});

// Define a new task that uses your plugin
task(
  "selectors",
  "Generate a file of function selectors",
  async (args, hre) => {
    await hre.selectors();
  }
);

// This is needed for TypeScript not to complain about the hre.selectors() field
declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    selectors?: () => Promise<void>;
  }
}
declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    selectors: () => Promise<void>;
  }
}
