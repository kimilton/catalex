const UNSAFE_ID_SEPARATOR = '-'
const SAFE_ID_SEPARATOR = '_'

const toSafeId = unsafe => unsafe.split(UNSAFE_ID_SEPARATOR).join(SAFE_ID_SEPARATOR)
const toUnsafeId = safe => safe.split(SAFE_ID_SEPARATOR).join(UNSAFE_ID_SEPARATOR)

const certifyEntry = entry => ({
    ...entry,
    timestamp: Date.now()
})

exports.certifyEntry = certifyEntry
exports.toSafeId = toSafeId
exports.toUnsafeId = toUnsafeId
