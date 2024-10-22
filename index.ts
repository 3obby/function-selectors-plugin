import {extendConfig} from "hardhat/config"
import {HardhatPluginError} from "hardhat/plugins";
import "@nomiclabs/hardhat-ethers"
import 'hardhat/types/config';
import './tasks/compile';
import './tasks/selectors';

interface FunctionSelectorsUserConfigEntry {
    separateContractSelectors?: boolean
    orderedByValue?: boolean

    outputPath?: string,

    pretty?: boolean
    runOnCompile?: boolean
    includeParams?: boolean

    only?: string[]
    except?: string[]
    skipSelectors?: string[]
}

export interface FunctionSelectorsConfigEntry {
    separateContractSelectors: boolean
    orderedByValue: boolean

    outputPath: string,

    pretty: boolean
    runOnCompile: boolean
    includeParams: boolean

    only: string[]
    except: string[]
    skipSelectors: string[]
}

declare module "hardhat/types/config" {
    interface HardhatUserConfig {
        functionSelectors?: FunctionSelectorsUserConfigEntry | FunctionSelectorsUserConfigEntry[]
    }

    interface HardhatConfig {
        functionSelectors: FunctionSelectorsConfigEntry[]
    }
}

const DEFAULT_CONFIG : FunctionSelectorsConfigEntry = {
    separateContractSelectors: true,
    orderedByValue: false,
    outputPath: "./selectors.json",
    pretty: true,
    runOnCompile: true,
    includeParams: true,
    only: [],
    except: [],
    skipSelectors: [],
}

extendConfig((config, userConfig) => {
    config.functionSelectors = [userConfig.functionSelectors].flat().map((el) => {
        // if any values not provided by user, go with defaults
        const conf = Object.assign({}, DEFAULT_CONFIG, el)

        // check if only/except have an overlap
        const overlap = conf.only.filter(value => conf.except.includes(value))
        if (overlap.length>0) {
            throw new HardhatPluginError(
                "function-selectors-plugin",
                `\`only\` & \`except\` elements cannot overlap: [${overlap}]`,
            );
        }

        // check if any selectors not correct len
        const incorrectLen = conf.skipSelectors.filter((sel) => sel.length !== 10)
        if(incorrectLen.length > 0){
            throw new HardhatPluginError(
                "function-selectors-plugin",
                `selectors in \`skipSelectors\` must be 10 characters: [${incorrectLen}]`,
            );
        }

        // check if any selectors don't start with "0x"
        const incorrectPrefix = conf.skipSelectors.filter((sel) => !sel.startsWith("0x"))
        if(incorrectLen.length > 0){
            throw new HardhatPluginError(
                "function-selectors-plugin",
                `selectors in \`skipSelectors\` must be start with a \`0x\`: [${incorrectPrefix}]`,
            );
        }

        return conf as FunctionSelectorsConfigEntry
    })
})