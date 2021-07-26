const fs = require('fs/promises')
const path = require('path')

const { generateRawObject } = require('../model')

const scanDirectory = async () => {
    const { catalexRawPath, catalexExtension } = process.env
    const rawFilesList = await recurseDirAndCollectRaw(catalexRawPath, catalexExtension, [])
    console.log(`Scanned ${rawFilesList.length} valid files`)
    return rawFilesList
}

const recurseDirAndCollectRaw = async (dirPath, extension, filesList=[]) => {
    try {
        const dir = await fs.opendir(dirPath)
        for await(const dirent of dir){
            const { name } = dirent
            if (dirent.isDirectory()){
                filesList.concat(await recurseDirAndCollectRaw(`${dirPath}${path.sep}${name}`, extension, filesList))
            } else if (dirent.isFile() && path.extname(name).slice(1) === extension){
                let objectId = path.basename(name, extension).toUpperCase()
                objectId = objectId.slice(0, objectId.length - 1)
                const rawObject = generateRawObject(objectId, dirPath, dirPath + path.sep + name)
                filesList.push(rawObject)
            }
        }
    } catch (err) {
        console.error(err)
        return filesList
    }
    return filesList
}

exports.scanDirectory = scanDirectory
