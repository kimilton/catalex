const express = require('express')
const routes = require('./routes')

const { loadFile } = require('./persistence')

const app = express()
const port = 8080

module.exports = () => {

    console.log('Application started.')

    const data = loadFile()
    
    data["ads"] = 113232

    app.use((request, response, next) => {
        request.data = data
        next()
    })

    app.use(routes)

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })

}
