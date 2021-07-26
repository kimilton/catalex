const getDefaultIdValidator = (cache) => {
    return id => id && !cache.hasEntry(id)
}

module.exports = {
    getDefaultIdValidator
}
