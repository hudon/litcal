import * as cheerio from "cheerio";
import { setTimeout } from "timers/promises";
import fs from "fs";
import * as BSON from "bson";
import { Logger } from "./logger.js";
import { LCAPIYear } from "./types.js";


const logger = new Logger();

const fetchReadings = async (lcData: LCAPIYear, numDays = 365, startDay = 1) => {
    const readingTitleToKey = {
        'gospel': 'gospel'
    }

    const readingsData = {};
    // https://qoob.cc/web-scraping/
    // https://www.freecodecamp.org/news/the-ultimate-guide-to-web-scraping-with-node-js-daa2027dcd3/
    const urlBase = "https://bible.usccb.org/bible/readings/"
    for (let i = startDay; i <= numDays; i++) {
        logger.debug(`Scraping day ${i}/${numDays}...`)
        const date = new Date(Date.UTC(lcData['Settings']['Year'], 0, i));
        logger.debug('Using date:', date);
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        const dayOfMonth = date.getUTCDate().toString().padStart(2, '0')
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
        const year = date.getUTCFullYear().toString().slice(2)
        const dateKey = month + dayOfMonth + year;
        const url = urlBase + dateKey + '.cfm';

        readingsData[dateKey] = {
            'readingsUrl': url
        };
        logger.debug('Fetching URL:', url)

        let html = await fetch(url).then(res => res.text())
        let $ = cheerio.load(html);
        $('h3.name').each(function() {
            let readingTitle = $(this).text().trim();
            // Ignore empty header, sections that have "verse before Gospel" or procession readings
            let titleLower = readingTitle.toLowerCase();
            if (readingTitle.length === 0 || titleLower === 'verse before the gospel' || titleLower.startsWith('at the procession')) {
                return;
            }
            // Some pages have a bug that doesn't put "Responsorial Psalm as the section title" and instead puts the
            // reference in the title.
            if (titleLower.startsWith("ps")) {
                readingTitle = "Responsorial Psalm";
            }
            // Days with processions have "at the Mass - " in the title.
            if (titleLower.startsWith('at the mass')) {
                readingTitle = readingTitle.slice(14);
            }
            // Skip the "OR" readings for now
            if (titleLower.startsWith('or')) {
                return;
            }
            if (titleLower !== 'gospel') {
                // For now we only care about the Gospel reading
                return;
            }

            // Some titles have a no-break space instead of a space
            readingTitle = readingTitle.replace(/\u00A0/g, ' ');

            let readingRef = $(this).next().children('a').first().text().trim();
            // Some references have periods in them, so remove them
            if (readingRef.endsWith('.')) {
                readingRef = readingRef.slice(0, -1);
            }
            // Some references forget to start with "Ps", so add it
            if (titleLower.startsWith("respons") && !readingRef.startsWith('Ps')) {
                readingRef = 'Ps ' + readingRef;
            }
            let readingRefKey = readingTitleToKey[titleLower];
            if (!readingRefKey) {
                logger.warn(`Unknown reading title. %O`, {
                    readingTitle: titleLower,
                    readingRef: readingRef,
                    dateKey: dateKey,
                    dayOfYear: i
                });
                return;
            }
            // We'll have called trim() twice on the reference. This covers the case where the reference
            // ends in " . " (space dot space)
            readingsData[dateKey][readingRefKey + 'Ref'] = readingRef.trim();
            // Ensure <br> are converted to spaces in final output
            $(this).parent().next().find('br').replaceWith("<br>\n");
            // Now get the actual reading text. 
            readingsData[dateKey][readingRefKey] = $(this).parent()
                .next().text().replace(/\s+/g, ' ').trim();
        });
        await setTimeout(800);
    }
    return readingsData;
};

const removeCruft = (lcCalData: LCAPIYear): LCAPIYear => {
    const newData = { ...lcCalData };

    logger.debug('Removing Vigil Masses...');
    for (const [key, value] of Object.entries(newData['LitCal'])) {
        if (value['isVigilMass']) {
            delete newData['LitCal'][key];
        }
    }

    logger.debug('Removing Metadata & Messages...');
    delete newData['Metadata'];
    delete newData['Messages'];

    return newData;
};

const hydrateLCAPIData = (readingsData, data: LCAPIYear) => {
    logger.debug('Keying by date...')

    // key it by date
    const lcDataByDate = {};
    for (let [key, value] of Object.entries(data['LitCal'])) {
        value['lcKey'] = key;
        // find in lcDataByDate. If it isn't there, append it
        if (!lcDataByDate[value['date']]) {
            lcDataByDate[value['date']] = [value];
        } else {
            lcDataByDate[value['date']].push(value);
        }
    }

    logger.debug('Adding readings...')

    // iterate over readings
    for (const [dateKey, value] of Object.entries(readingsData)) {
        const dayOfMonth = Number(dateKey.slice(2, 4));
        const month = Number(dateKey.slice(0, 2));
        const year = Number('20' + dateKey.slice(4));
        const secondsSinceEpoch = Date.UTC(year, month - 1, dayOfMonth) / 1000;
        let lcDataForDate = lcDataByDate[secondsSinceEpoch];
        if (!lcDataForDate) {
            logger.error(`No data for ${dateKey}`);
            process.exit(1);
        }
        for (let i = 0; i < lcDataForDate.length; i++) {
            let lcData = lcDataForDate[i];
            if (lcData['isVigilMass']) {
                logger.error(`Vigil Mass found for ${dateKey}. Exiting.`);
                process.exit(1);
            }
            Object.assign(lcData, value);
        }
    }

    logger.debug('Updating LCAPI data...')

    const newLCData = {};
    for (const key of Object.keys(lcDataByDate)) {
        for (let i = 0; i < lcDataByDate[key].length; i++) {
            let lcData = lcDataByDate[key][i];
            newLCData[lcData['lcKey']] = lcData;
        }
    }
    data['LitCal'] = newLCData;
    return data;
}

const convertFileToHexString = async (lcAPIData): Promise<string> => {
    let bsonData = BSON.serialize(lcAPIData);
    let hexBytes = `#ifndef LIBLITCAL_CORE_CALENDARDATA_H
#define LIBLITCAL_CORE_CALENDARDATA_H
#include <vector>
namespace lit{
std::vector<std::uint8_t> CAL_LCAPI_USA_2022 = {`;
    let prepend = false;
    for (const value of bsonData.values()) {
        if (prepend) {
            hexBytes += ',';
        }
        hexBytes += `0x${value.toString(16)}`
        prepend = true;
    }
    // Language=TEXT
    hexBytes += `};
}
#endif //LIBLITCAL_CORE_CALENDARDATA_H`;
    return hexBytes;
}

const findInvalidLCAPIData = (data: LCAPIYear): boolean => {
    let errorCelebrations: { [index: string]: string[] } = {};
    let errorsFound = false;
    
    // iterate over readings and find events that are optional memorials or commemorations. Also find missing Gospels (separate concern)
    for (const [lcCelebKey, lcCelebration] of Object.entries(data['LitCal'])) {
        const lcDate = lcCelebration['date'];
        if (!lcCelebration['gospelRef'] || lcCelebration['gospelRef'] === "") {
            logger.error(`Missing gospelRef for ${lcDate} for ${lcCelebKey}`);
            errorsFound = true;
        }
        
        const lcGrade = lcCelebration['grade'];
        if (lcGrade !== 2 && lcGrade !== 1) continue;
        
        if (errorCelebrations[lcDate]) {
            errorCelebrations[lcDate].push(lcCelebKey);
        } else {
            errorCelebrations[lcDate] = [lcCelebKey];
        }
        if (lcCelebration['isVigilMass']) {
            logger.error(`Vigil Mass found for ${lcCelebKey}`);
            process.exit(1);
        }
    }

    // On days with optional memorials, we should find another feast to celebrate if the user doesn't want to celebrate the optional memorial
    for (let [lcCelebKey, lcCelebration] of Object.entries(data['LitCal'])) {
        const lcGrade = lcCelebration['grade'];
        const lcDate = lcCelebration['date'];
        if (lcGrade === 2 || lcGrade === 1) continue;
        // Vigil Masses are ignored for now
        if (lcCelebration['isVigilMass']) continue;

        if (errorCelebrations[lcDate]) {
            errorCelebrations[lcDate].push(lcCelebKey);
        }
    }

    
    for (let [lcDate, lcCelebKeys] of Object.entries(errorCelebrations)) {
        if (lcCelebKeys.length === 1) {
            logger.error(`Missing fallback ferial celebration for ${lcDate} for ${lcCelebKeys[0]}`);
            errorsFound = true;
        }
    }
    if (!errorsFound) {
        logger.info('No errors found');
    }
    return errorsFound;
}


// Takes the data and outputs new data with these changes:
// 1- events that do not belong to the year in data.Settings.Year are gone
// 2- events that belong to the data year that are in the prevFileName are added to the output
const mergeDataForYear = (data: LCAPIYear, prevFileName?: string): LCAPIYear => {
    const year = data['Settings']['Year'];
    const yearStartDate = new Date(Date.UTC(year, 0, 1));
    const nextAdventDate = new Date(data['LitCal']['Advent1']['date'] * 1000);
    let result = { ...removeCruft(data) };

    for (const [lcCelebKey, lcCelebration] of Object.entries(data['LitCal'])) {
        const date = new Date(lcCelebration['date'] * 1000);
        // we can only delete events that are in the next Advent or later because we don't know the date of `data`'s Advent so we don't know when the liturgical year starts yet.
        if (nextAdventDate <= date) {
            delete result['LitCal'][lcCelebKey];
            logger.debug('event deleted', lcCelebration);
        }
    }

    if (!prevFileName) {
        // If this agent runs without a prevFileName, we at least have purged the current data from irrelevant events, which is somewhat useful
        return result;
    }

    const prevYearData: LCAPIYear = removeCruft(JSON.parse(fs.readFileSync(prevFileName, 'utf8')));
    const prevYear = prevYearData['Settings']['Year'];
    const adventDate = new Date(prevYearData['LitCal']['Advent1']['date'] * 1000);

    if (!adventDate) {
        logger.error(`Couldn't find the advent date.`);
        process.exit(1);
    }
    if (prevYear !== year - 1) {
        logger.error(`The prevfile should actually be for the previous year`, {
            year: year,
            prevYear: prevYear
        });
        process.exit(1);
    }

    for (const [lcCelebKey, lcCelebration] of Object.entries(prevYearData['LitCal'])) {
        const date = new Date(lcCelebration['date'] * 1000);
        if (adventDate <= date) {
            result['LitCal'][lcCelebKey] = lcCelebration;
            logger.debug('event added', lcCelebration);
        }
    }

    // This pass ensures we have no events that pre-date Advent
    for (const [lcCelebKey, lcCelebration] of Object.entries(result['LitCal'])) {
        const date = new Date(lcCelebration['date'] * 1000);
        if (date < adventDate) {
            delete result['LitCal'][lcCelebKey];
            logger.debug('event deleted', lcCelebration);
        }
    }

    return result;
};

const truncateData = (data: LCAPIYear, endDateSeconds: number): LCAPIYear => {
    let result = { ...data };
    const endDate = new Date(endDateSeconds * 1000);
    for (const [lcCelebKey, lcCelebration] of Object.entries(data['LitCal'])) {
        const date = new Date(lcCelebration['date'] * 1000);
        if (endDate < date) {
            delete result['LitCal'][lcCelebKey];
            logger.debug('event deleted', lcCelebration);
        }
    }
    return result;
};

/// simple heuristic to guess a title and subtitle for a named event
const guessLitCelebrationTitle = (data: LCAPIYear): LCAPIYear => {
    let result = { ...data };
    for (const [lcCelebKey, lcCelebration] of Object.entries(data['LitCal'])) {
        let title = '';
        let subtitle = '';
        const currName: string = lcCelebration['name'];

        let commaPos = currName.indexOf(', and');
        if (commaPos > -1) {
            commaPos = currName.indexOf(',', commaPos + 1);
            if (commaPos > -1) {
                title = currName.slice(0, commaPos);
                subtitle = currName.slice(commaPos + 2); // skip ', '
                result['LitCal'][lcCelebKey]['litTitle'] = title;
                result['LitCal'][lcCelebKey]['litSubTitle'] = subtitle;
                continue;
            } else {
                title = currName;
                // no subtitle
                result['LitCal'][lcCelebKey]['litTitle'] = title;
                continue;
            }
        } else {
            commaPos = currName.indexOf(',');
            if (commaPos > -1) {
                title = currName.slice(0, commaPos);
                subtitle = currName.slice(commaPos + 2); // skip ', '
                result['LitCal'][lcCelebKey]['litTitle'] = title;
                result['LitCal'][lcCelebKey]['litSubtitle'] = subtitle;
                continue;
            } else {
                title = currName;
                // no subtitle
                result['LitCal'][lcCelebKey]['litTitle'] = title;
                continue;
            }
        }
    }
    return result;
};

export {
    guessLitCelebrationTitle,
    mergeDataForYear,
    fetchReadings,
    hydrateLCAPIData,
    removeCruft,
    convertFileToHexString,
    findInvalidLCAPIData,
    truncateData
};
