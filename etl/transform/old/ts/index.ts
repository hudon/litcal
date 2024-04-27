#!/usr/bin/env node
'use strict';
import fs from 'fs';
import parseArgv from 'minimist';
import { Logger } from './logger.js';
import {
  fetchReadings,
  hydrateLCAPIData,
  removeCruft,
  convertFileToHexString,
  findInvalidLCAPIData,
  mergeDataForYear,
  truncateData,
  guessLitCelebrationTitle
} from "./agents.js";
import { LCAPIYear } from "./types.js";

const args = parseArgv(process.argv.slice(2), {
  string: ['file', 'mode'],
  boolean: ['help'],
});

const logger = new Logger();

const runAgent = async (data?) => {
  const getData = (): LCAPIYear => {
    if (data) {
      return data;
    }
    if (!args['file']) {
      logger.error('Missing file name');
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(args['file'], 'utf8'));
  };

  let results = '';
  if (args['agent'] === 'hydrate') {
    let lcAPIData = getData();
    const readingsData = await fetchReadings(lcAPIData, args['days'], args['startDay']);
    results = JSON.stringify(hydrateLCAPIData(readingsData, removeCruft(lcAPIData)), null, 2);
  } else if (args['agent'] === 'convert') {
    results = await convertFileToHexString(getData());
  } else if (args['agent'] === 'validate') {
    const isError = findInvalidLCAPIData(getData());
    process.exit(isError ? 1 : 0);
  } else if (args['agent'] === 'merge') {
    const prevFileArg: string | undefined = args['prevfile'];
    results = JSON.stringify(mergeDataForYear(
      getData(), 
      prevFileArg
    ), null, 2);
  } else if (args['agent'] === 'truncate') {
    results = JSON.stringify(truncateData(
      getData(), 
      args['endDate']
    ), null, 2);
  } else if (args['agent'] === 'guesstitles') {
    results = JSON.stringify(guessLitCelebrationTitle(
      getData()
    ), null, 2)
  } else {
    logger.error('Unknown agent');
    process.exit(1);
  }
  logger.info(results);
};

if (args['help']) {
  logger.info(`
    --help: show this help message
    --agent=hydrate: hydrate LCAPI data with readings fetched from USCCB
    --agent=convert: convert the LCAPI data to hex strings
    --agent=validate: find invalid LCAPI data
    --agent=merge: merges 2 LCAPI data files to get the full dataset for one year
    --agent=truncate: truncate data up and including to a given endDate
    --agent=guesstitles: guesses the title and subtitles of events based on their names
    --file=FILEPATH: the file to use for the agent
    `);
  process.exit(0);
}


// We used to support passing data in, but the way this is setup breaks when node is run from IDEs. IDEs will run node **not** from a TTY, and so the use of `readable` below will block indefinitely.
// const readable = process.stdin;
// 
// if (!readable.isTTY) {
//   logger.debug("Reading from stdin, which is not a TTY");
//   let chunks: any[] = [];
//   readable.on('readable', () => {
//     let chunk;
//     while (null !== (chunk = readable.read())) {
//       chunks.push(chunk);
//     }
//   });
//   readable.on('end', () => {
//     runAgent(JSON.parse(chunks.join('')));
//   });
// } else {
//   logger.debug("Reading from a TTY, so expecting a file");
//   runAgent();
// }

runAgent();

