const express = require('express')
const routes = require('./routes')

const { loadFile } = require('./persistence')
const { scanDirectory } = require('./filesystem')

const app = express()
const port = 8080

module.exports = () => {

    console.log('Application started.')

    const data = loadFile()

    const scannedFiles = scanDirectory()

    

    // app.use(routes)

    // app.listen(port, () => {
    //     console.log(`Example app listening at http://localhost:${port}`)
    // })

}
