#!/usr/bin/env node

import { program } from 'commander'
import { readPackageUp } from 'read-pkg-up'
import { downloadFiles } from './download.mjs'

const pkg = await readPackageUp()
const version = (pkg && pkg.packageJson.version)

program
    .version(version)
    .argument('filename', 'text file containing list of URLs')
    .option('-D, --dir <dir>', 'Destination Directory', 'downloads')
    .option('-O, --overwrite', 'Overwrite the file if already exists', false)
    .showHelpAfterError()
    .parse(program.argv)

const main = async prog => {
    if (prog.args.length === 0) prog.help()

    try {
        const options = program.opts()
        const outputDir = options.dir
        const overwrite = options.overwrite
        const args = prog.args

        downloadFiles(args, outputDir, overwrite)
    } catch (err) {
        console.error(err)
    }
}

main(program)