const CONSTANTS = require('../const')

const jsonWrap = (data, error) => {
    if (data || error){
        let dataField = data ? {"data": data} : {}
        let errorField = error ? {"error": error} : {}
        return {
            ...dataField,
            ...errorField
        }
    }
    throw new Error(CONSTANTS.ERROR_NO_CONTENT)
}
const jsonWrapErr = error => jsonWrap(null, error)

module.exports = {
    jsonWrap,
    jsonWrapErr
}
