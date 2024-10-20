
import {extendConfig} from "hardhat/config"
import "@nomiclabs/hardhat-ethers"
import 'hardhat/types/config';
import './tasks/compile';
import './tasks/selectors';

interface FunctionSelectorsUserConfigEntry {
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

export interface FunctionSelectorsConfigEntry {
    separateContractSelectors: boolean
    orderedByValue: boolean

    outputPath: string,
    outputFilename: string,

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
    outputPath: ".",
    outputFilename: "selectors.json",
    pretty: true,
    runOnCompile: true,
    includeParams: true,
    only: [],
    except: [],
    skipSelectors: [],
}

extendConfig((config, userConfig) => {
    config.functionSelectors = [userConfig.functionSelectors].flat().map((el) => {
        const conf = Object.assign({}, DEFAULT_CONFIG, el)
        return conf as FunctionSelectorsConfigEntry
    })
})