import {TASK_COMPILE} from 'hardhat/builtin-tasks/task-names';
import {extendEnvironment, task} from "hardhat/config"
import * as fs from "fs"
import "@nomiclabs/hardhat-ethers"
import {HardhatRuntimeEnvironment} from "hardhat/types";

interface FunctionSelectorsConfig {
    separateContractSelectors?: boolean
    orderedByValue?: boolean

    outputPath?: string,
    outputFilename?: string,

    pretty?: boolean
    runOnCompile?: boolean
    includeParams?: boolean

    only?: string[]
    except?: string[]
    skipSelectors?: string[]
}

declare module "hardhat/types/config" {
    interface HardhatUserConfig {
        functionSelectors?: FunctionSelectorsConfig
    }

    interface HardhatConfig {
        functionSelectors: FunctionSelectorsConfig
    }
}

function sortDict<T>(dict: { [key: string]: T }): { [key: string]: T } {
    return Object.keys(dict)
        .sort()
        .reduce((obj, key) => {
            obj[key] = dict[key]
            return obj
        }, {} as { [key: string]: T })
}

function checkConfigExists(hre: HardhatRuntimeEnvironment) {
    if (!hre.config.functionSelectors) {
        throw new Error(`Missing \`functionSelectors\` configuration in Hardhat config. 
        An example configuration looks like this:

        module.exports = {
          functionSelectors: {
            separateContractSelectors: true, // separate by contract
            orderedByValue: true, // order function selectors by hex value, least to greatest
            
            outputPath: ".",
            outputFilename: "selectors.json",
            
            pretty: true, // pretty print the output JSON(s)
            runOnCompile: true, // run the selectors task on compile
            includeParams: true, // include the parameters in the selector title (outputs only)
            
            only: [],
            except: [],
            skipSelectors: [],
          },
          // other configurations...
        }
      `)
    }
}

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
    hre.selectors = async () => {
        const args = hre.config.functionSelectors

        const separateContractSelectors = args.separateContractSelectors || false
        const orderedByValue = args.orderedByValue || false
        const outputPath = args.outputPath || "."
        const outputFilename = args.outputFilename || "selectors.json"
        const prettyPrint = args.pretty || false
        const includeParams = args.includeParams || true

        const outFile = `${outputPath}/${outputFilename}`

        const fullNames = await hre.artifacts.getAllFullyQualifiedNames()

        const abiCoder = new hre.ethers.utils.AbiCoder()

        // Initialize an object to store all contracts selectors
        let contractsSelectors: {
            [contract: string]: { [selector: string]: string }
        } = {}

        await Promise.all(
            fullNames.map(async (fullName) => {
                // if limiting with only, skip if not matching some expression
                if (args.only && args.only.length && !args.only.some((m) => fullName.match(m)))
                    return [fullName, {}]
                // if limiting with except, skip if matching some expression
                if (args.except && args.except.length && args.except.some((m) => fullName.match(m)))
                    return [fullName, {}]

                // load the artifact
                let {abi, contractName} = await hre.artifacts.readArtifact(fullName)

                // if abi has no functions, it's not worth persisting
                if (!abi.some((item) => item.type === "function")) {
                    return
                }

                contractsSelectors[contractName] = {}

                for (let item of abi) {
                    if (item.type === "function") {
                        const functionDef = `${item.name}(${item.inputs.map((i: any) => i.type).join(",")})`

                        const persistedSelectorTitle = includeParams ? functionDef : item.name

                        const signature = hre.ethers.utils.keccak256(
                            abiCoder.encode(["string"], [functionDef])
                        )

                        const selector = signature.slice(0, 10)

                        // check if this selector is in the skip list
                        if (args.skipSelectors && args.skipSelectors.length && args.skipSelectors.some((m) => selector.match(m)))
                            continue

                        contractsSelectors[contractName][selector] = persistedSelectorTitle
                    }
                }
            })
        )

        // optionally flatten the contracts/selectors
        let outputSelectors: {
            [contract: string]: { [selector: string]: string } | string
        } = separateContractSelectors
            // if separating, use already split contracts/selectors
            ? contractsSelectors
            // if not separating, flatten the selectors into 1 object
            : Object.values(contractsSelectors)
                .reduce((acc, selectors) => ({...acc, ...selectors}), {});

        // Ordering function selectors by their hex value if enabled
        if (orderedByValue) {
            outputSelectors = separateContractSelectors
                // sort the selectors associated with each contract
                ? Object.fromEntries(
                    Object.entries(contractsSelectors).map(
                        ([contract, selectors]) => [contract, sortDict(selectors)]
                    )
                )
                // sort all the selectors
                : sortDict(outputSelectors);
        }

        const writeData = prettyPrint ? JSON.stringify(outputSelectors, null, 2) : JSON.stringify(outputSelectors)

        fs.mkdirSync(outputPath, {recursive: true})

        // Write the contracts' selectors to a file
        fs.writeFileSync(outFile, writeData)

        console.log(`Function selectors have been written to ${outFile}`)
    }
})

// Define a new task that uses your plugin
task(
    "selectors",
    "Generate a file of function selectors",
    async (args, hre) => {
        checkConfigExists(hre)
        await hre.selectors()
    }
)

// extend the compilation task to optionally generate selectors on each compile
task(TASK_COMPILE)
    .setAction(async (args, hre, runSuper) => {
        await runSuper()
        if (!(hre as any).__SOLIDITY_COVERAGE_RUNNING) {
            checkConfigExists(hre)
            if (hre.config.functionSelectors.runOnCompile) {
                await hre.selectors()
            }
        }
    })

// This is needed for TypeScript not to complain about the hre.selectors() field
declare module "hardhat/types/config" {
    export interface HardhatUserConfig {
        selectors?: () => Promise<void>
    }
}
declare module "hardhat/types/runtime" {
    interface HardhatRuntimeEnvironment {
        selectors: () => Promise<void>
    }
}
