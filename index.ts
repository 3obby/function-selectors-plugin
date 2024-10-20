
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
    separateContractSelectors: false, // separate by contract
    orderedByValue: false, // order function selectors by hex value, least to greatest

    outputPath: "'",
    outputFilename: "selectors.json",

    pretty: true, // pretty print the output JSON(s)
    runOnCompile: true, // run the selectors task on compile
    includeParams: true, // include the parameters in the selector title (outputs only)

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