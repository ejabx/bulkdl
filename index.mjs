import { program } from 'commander'
import { readPackageUp } from 'read-pkg-up'
import { downloadFiles } from './download.mjs'

const pkg = await readPackageUp()
const version = (pkg && pkg.packageJson.version)

program
    .version(version)
    .option('-D, --dir <dir>', 'Destination Directory')
    .parse(program.argv)

const main = async prog => {
    if (prog.args.length === 0) prog.help()

    try {
        const options = program.opts()
        const outputDir = options.dir || '.'
        const args = prog.args

        downloadFiles(args, outputDir)
    } catch (err) {
        console.error(err)
    }
}

main(program)