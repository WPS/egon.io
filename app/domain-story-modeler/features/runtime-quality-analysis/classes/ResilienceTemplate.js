class ResilienceTemplate {
    constructor(type, name) {
        this.type = type;
        this.name = name;
        // this.scenarioStart = scenarioStart;
        // this.scenarioDuration = scenarioDuration;
    }
    
    getName() {
        return this.name;
    }
}

export const ResilienceInjectionTypesEnum = {
    APPLICATION: 'application',
    INFRASTRUCTURE: 'infrastructure'
}

export const ResilienceEnvironmentEnum = {
    PROD: 'production',
    TESTING: 'testing',
    STAGING: 'staging'
}

export const ResilienceFaultTypeEnum = {
    SERVICE_FAILURE: 'service failure',
    SERVICE_DELAY: 'service call delay'
}