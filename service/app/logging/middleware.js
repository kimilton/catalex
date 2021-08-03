const requestLoggerMiddleware = (req, res, next) => {
    console.log(`\n[ INCOMING REQUEST ] ==============================================================`)
    console.log(`Request URL: ${req.originalUrl}`)
    console.log(`Request Method: ${req.method}`)
    if (req.body && Object.keys(req.body).length){
        console.log(`Request body:`)
        console.dir(req.body)
    }
    console.log(`Time: <${Date.now()}> ${new Date().toDateString()} ${new Date().toTimeString()}`)
    console.log(`===================================================================================\n`)
    next()
}

module.exports = {
    requestLoggerMiddleware
}
