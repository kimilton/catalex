const CONSTANTS = require('../../const')
const { numToFixed } = require('../shared')

const getDefaultModel = () => ({
    id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    otherNames: [],
    retired: CONSTANTS.UNKNOWN,
    birthYear: 0,
    image: "",
    tags: [],
})

const generateIdFromName = (firstName, lastName, suffix=0) => {
    if (firstName && lastName){
        let suffixStr = numToFixed(suffix)
        let firstId = firstName.slice(0,3).toUpperCase()
        let lastId = lastName.slice(0,3).toUpperCase()
        return `${firstId}${lastId}${suffixStr}`
    }
    throw new Error(CONSTANTS.ERROR_MISSING_INFO)
}

module.exports = {
    getDefaultModel,
    generateIdFromName,
}
