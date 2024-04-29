import parseArgv from "minimist";

const args = parseArgv(process.argv.slice(2), {
    string: ['file', 'mode'],
    boolean: ['help'],
});

const isDebug = args['log'] === "debug";

export { isDebug };
