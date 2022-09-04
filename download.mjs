import isURL from 'is-url'
import path from 'path'
import { parse as parseURL } from 'url'
import unfetch from 'node-fetch'
import {
  writeFile as wf,
  readFileSync as rfs,
  access,
  constants
} from 'fs'
import mkdirp from 'mkdirp'
import { parse } from 'path'
import { promisify } from 'util'
import cliProgress from 'cli-progress'
import colors from 'ansi-colors'

const wfp = promisify(wf)
const accessp = promisify(access)

const checkFile = async (path) => {
  return accessp(path, constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

const writeFile = async (path, data) => {
  const { dir } = parse(path)
  await mkdirp(dir)

  return wfp(path, data)
}

const fetch = async (url, init) => {
  const resp = await unfetch(url, init)
  if (resp.ok !== true) {
    throw new Error(`Request failed with code ${resp.status}`)
  }

  return resp
}

/**
 * Downloads a single file from a URL
 * @param {string} url The URL to the download
 * @param {string} filePath Output directory
 * @param {string} fileName Output name
 * @param {boolean} overwrite Overwrite the file if it already exists
 */
export async function downloadFile (
    url,
    filePath,
    fileName,
    overwrite
  ) {
    // Validation
    if (!isURL(url)) throw new Error('Invalid URL')
    if (filePath === undefined || filePath === null || filePath === '') {
      throw new Error('Please specify a File Path')
    }
  
    try {
      const fullFileName = `${fileName.split('/').pop()}` // ${fileExt}
      const fullPath = path.join(filePath, fullFileName)

      let skip = false
      if (!overwrite) {
        skip = await checkFile(fullPath)
      }

      if (!skip) {
        // Download file contents
        const resp = await fetch(url)
    
        // Parse a filename
        const parsedFile = parseURL(url).pathname
        if (parsedFile === undefined) throw new Error('cannot determine file name')
    
        const fileExt = path.extname(parsedFile)
        if (fileName === undefined || fileName === null || fileName === '') {
          fileName = path.basename(parsedFile, fileExt)
        }
    
        // File Operations
        const buffer = Buffer.from(await resp.arrayBuffer())
        await writeFile(fullPath, buffer)
      }
    } catch (err) {
      throw new Error(`${url}: ${err.message}`)
    }
  }

/**
 * Downloads URLs into a directory
 * @param {Array<string>} URLs The array of URLs
 * @param {string} outputDir An output directory. Will create if it doesn't exist
 * @param {boolean} overwrite Overwrite the file if it already exists
 */
export async function downloadFiles (
    URLs,
    outputDir,
    overwrite
) {
    URLs = URLs.map(url => {
        if (isURL(url)) return url
        // TODO: Verify that it's a file
        else {
            const contents = rfs(url)
            return contents.toString().split('\n').map(c => c.trim())
        }
    })
      .flat()
      .filter(url => url && url.length)

    if (URLs.length === 0) throw new Error('No valid URLs passed')
    if (outputDir === undefined || outputDir === null || outputDir === '') {
        throw new Error('Please specify a Output Directory')
    }

    const bar = new cliProgress.SingleBar({
      format: colors.cyan('{bar}') + ' | {duration_formatted} | {value}/{total} | {url}',
      hideCursor: true
    });
    bar.start(URLs.length, 0)
  
    let num_of_errors = 0, num_of_urls = 0
  
    try {
      await Promise.all(URLs.map((url, i) => {
        if (!url) return Promise.reject('Invalid URL')
        else return downloadFile(url, outputDir, url, overwrite)
          .catch(async err => {
            await wfp('./bulkdl.log', err.message)
            num_of_errors++
          })
          .finally(() => {
            bar.update(++num_of_urls, { url })
          })
      }))
    } catch (err) {
      console.error(err.message)
    }

    bar.stop()

    if (num_of_errors) {
      console.log('Oops! ' + colors.red(num_of_errors) + ' error(s). See details in "bulkdl.log"')
    }
}