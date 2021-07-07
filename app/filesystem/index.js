const fs = require('fs/promises')
const path = require('path')

const scanDirectory = async () => {
    const { catalexFilePath, catalexExtension } = process.env
    const filesList = await recurseDirectory(catalexFilePath, catalexExtension, [])
    console.log(`Scanned ${filesList.length} valid files`)

    return filesList
}

const recurseDirectory = async (dirPath, extension, filesList=[]) => {
    try {
        const dir = await fs.opendir(dirPath)
        for await(const dirent of dir){
            const { name } = dirent
            if (dirent.isDirectory()){
                filesList.concat(await recurseDirectory(`${dirPath}${path.sep}${name}`, extension, filesList))
            } else if (dirent.isFile() && path.extname(name).slice(1) === extension){
                let objectId = path.basename(name, extension).toUpperCase()
                objectId = objectId.slice(0, objectId.length - 1)
                const hdwObject = {
                    id: objectId,
                    dirPath: dirPath,
                    fullFilePath: dirPath + path.sep + name
                }
                filesList.push(hdwObject)
            }
        }
    } catch (err) {
        console.error(err)
        return filesList
    }
    return filesList
}

exports.scanDirectory = scanDirectory
