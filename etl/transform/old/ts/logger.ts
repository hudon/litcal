import { isDebug } from './constants.js';

class Logger {
    isDebug: boolean;
    
    constructor() {
        this.isDebug = isDebug;
    }

    // For logs that developers should see (or users if they ask for it)
    debug(...args) {
        if (this.isDebug) {
            console.debug(...args);
        }
    }

    // For logs that users should see

    info(...args) {
        console.info(...args);
    }

    warn(...args) {
        console.warn(...args);
    }

    error(...args) {
        console.error(...args);
    }
}

export {Logger};
