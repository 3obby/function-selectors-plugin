import {TASK_COMPILE} from 'hardhat/builtin-tasks/task-names';
import {task} from "hardhat/config"
import {checkConfigExists} from "../tools";
import "../index";

// extend the compilation task to optionally generate selectors on each compile
task(TASK_COMPILE)
    .setAction(async (args, hre, runSuper) => {
        if (!(hre as any).__SOLIDITY_COVERAGE_RUNNING) {

            checkConfigExists(hre)

            const configs = hre.config.functionSelectors;

            await Promise.all(
                configs.map((abiGroupConfig) => {
                    if (abiGroupConfig.runOnCompile) {
                        return hre.run('export-selectors-group', { abiGroupConfig });
                    }
                }),
            );
        }
        await runSuper()
    })