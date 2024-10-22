import {task, subtask, types} from "hardhat/config"
import {checkConfigExists, sortDict} from "../tools";
import {FunctionSelectorsConfigEntry} from "../index";
import fs from "fs";
import * as path from 'path';

task('selectors')
    .setAction(async (args, hre) => {

        checkConfigExists(hre)

        const configs = hre.config.functionSelectors;

        await Promise.all(
            configs.map((abiGroupConfig) => {
                return hre.run('export-selectors-group', { abiGroupConfig });
            }),
        );
    });

// Define a new task that uses your plugin
subtask(
    "export-selectors-group",
    "Generate a file of function selectors"
).addParam(
    'abiGroupConfig',
    'a single function-selectors-exporter config object',
    undefined,
    types.any,
).setAction(async (args, hre) => {
    const { abiGroupConfig: config } = args as {
        abiGroupConfig: FunctionSelectorsConfigEntry;
    };

    const fullNames = await hre.artifacts.getAllFullyQualifiedNames()

    const abiCoder = new hre.ethers.utils.AbiCoder()

    // Initialize an object to store all contracts selectors
    let contractsSelectors: {
        [contract: string]: { [selector: string]: string }
    } = {}

    await Promise.all(
        fullNames.map(async (fullName) => {
            // if limiting with only, skip if not matching some expression
            if (config.only.length && !config.only.some((m) => fullName.match(m)))
                return [fullName, {}]
            // if limiting with except, skip if matching some expression
            if (config.except.length && config.except.some((m) => fullName.match(m)))
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

                    const persistedSelectorTitle = config.includeParams ? functionDef : item.name

                    const signature = hre.ethers.utils.keccak256(
                        abiCoder.encode(["string"], [functionDef])
                    )

                    const selector = signature.slice(0, 10)

                    // check if this selector is in the skip list
                    if (config.skipSelectors.length && config.skipSelectors.some((m) => selector.match(m)))
                        continue

                    contractsSelectors[contractName][selector] = persistedSelectorTitle
                }
            }
        })
    )

    // optionally flatten the contracts/selectors
    let outputSelectors: {
        [contract: string]: { [selector: string]: string } | string
    } = config.separateContractSelectors
        // if separating, use already split contracts/selectors
        ? contractsSelectors
        // if not separating, flatten the selectors into 1 object
        : Object.values(contractsSelectors)
            .reduce((acc, selectors) => ({...acc, ...selectors}), {});

    // Ordering function selectors by their hex value if enabled
    if (config.orderedByValue) {
        // if separated, sort the selectors for each contract
        if(config.separateContractSelectors){
            outputSelectors = Object.fromEntries(
                Object.entries(contractsSelectors).map(
                    ([contract, selectors]) => [contract, sortDict(selectors)]
                )
            )
        }

        // regardless of separation, sort the output keys
        //  - if separated, sorts contract names
        //  - if not separated, sorts selectors
        outputSelectors = sortDict(outputSelectors)
    }

    // make sure the parent directory to the outputPath exists
    fs.mkdirSync(path.dirname(config.outputPath), {recursive: true})

    // Write the contracts' selectors to a file
    fs.writeFileSync(
        config.outputPath,
        JSON.stringify(outputSelectors, null, config.pretty ? 2 : 0)
    )

    console.log(`Function selectors have been written to ${config.outputPath}`)
})
