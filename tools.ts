import {HardhatRuntimeEnvironment} from "hardhat/types";


export function checkConfigExists(hre: HardhatRuntimeEnvironment) {
    if (!hre.config.functionSelectors) {
        throw new Error(`Missing \`functionSelectors\` configuration in Hardhat config. 
        An example configuration looks like this:

        module.exports = {
          functionSelectors: {
            separateContractSelectors: true, // separate by contract
            orderedByValue: true, // order function selectors by hex value, least to greatest
            
            outputPath: ".", // directory where output file should be written
            outputFilename: "selectors.json", // filename of generated output
            
            pretty: true, // pretty print the output JSON(s)
            runOnCompile: true, // run the selectors task on compile
            includeParams: true, // include the parameters in the selector title (outputs only)
            
            only: [], // Array of String matchers used to select included contracts, defaults to all contracts if length is 0
            except: [], // Array of String matchers used to exclude contracts
            skipSelectors: [], // Array of selectors to be excluded from generated output
          },
          // other configurations...
        }
      `)
    }
}

export function sortDict<T>(dict: { [key: string]: T }): { [key: string]: T } {
    return Object.keys(dict)
        .sort()
        .reduce((obj, key) => {
            obj[key] = dict[key]
            return obj
        }, {} as { [key: string]: T })
}
