const requestLoggerMiddleware = (req, res, next) => {
    console.log(`[ INCOMING REQUEST ] ==============================================================`)
    console.log(`Request URL: ${req.originalUrl}`)
    console.log(`Request Method: ${req.method}`)
    if (req.body && req.body.length){
        console.log(`Request body to follow ---`)
        console.dir(req.body)
    }
    console.log(`Time: <${Date.now()}> ${new Date().toDateString()} ${new Date().toTimeString()}`)
    console.log(`===================================================================================\n`)
    next()
}

module.exports = {
    requestLoggerMiddleware
}
