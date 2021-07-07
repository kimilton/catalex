let model = {}


const updateModel = newModel => {
    model = newModel
    return model
}

const loadModel = () => model

const updateWorks = newWorks => {
    model.works = newWorks
    return model.works
}

const updateWork = (workId, payload) => {
    const work = model.works && model.works[workId] || {}
    work = {
        ...work,
        ...payload
    }
    model.works = {
        [workId]: work,
        ...model.works
    }
    return model.works[workId]
}

const loadWorks = () => model.works

const updatePerformers = newPerformers => {
    model.performers = newPerformers
    return model.performers
}

const updatePerformer = (performerId, payload) => {
    const performer = model.performers && model.performers[performerId] || {}
    performer = {
        ...performer,
        ...payload
    }
    model.works = {
        [performerId]: performer,
        ...model.performers
    }
    return model.performers[performerId]
}

const loadPerformers = () => model.performers
