import json
from datetime import datetime, timezone, date, timedelta
from urllib.request import urlopen
import urllib.error
from bs4 import BeautifulSoup
from time import sleep
import re
import sys
from collections import namedtuple

_RE_COMBINE_WHITESPACE = re.compile(r"\s+")

_RE_MANY_REFS = re.compile(r"^[a-zA-Z]..*[^\d][a-zA-Z]")
_RE_OR = re.compile(r"[^a-zA-Z]O[rR][^a-zA-Z]")
_RE_HIDDEN_REF = re.compile(r"\d:") # try to find refs hidden in Gospel text

_RE_NAME_MARY = re.compile(r"^[^S].*(mary|our lady)", re.IGNORECASE) # excludes when name starts with Saturday
_RE_SAINTS_AND = re.compile(r"^Saints.*[^a-zA-Z]and[^a-zA-Z]")

LitYear = namedtuple('LitYear', ['secular', 'startDate', 'endDate'])
LitSeason = namedtuple('LitSeason', ['name', 'litColor', 'startDate', 'endDate'])

# TODO: test me
def remove_vigil_mass(j):
    res = dict()
    for key, event in j.items():
        if event.get('isVigilMass') == True:
            continue
        else:
            res[key] = event.copy()
    return res

def add_urls(j, messages):
    """Add URLs to all the events and returns the dict with the events

    messages arg is modified in-place rather than returning a copy
    """
    def to_key(n):
        return str(n).rjust(2, '0')

    res = j
    for ev_key, event in j.items():
        # We do not recompute the URL if it's already there
        # This prevents overwriting URLs if they've been manually edited
        if 'readingsUrl' in event:
            continue

        d = datetime.utcfromtimestamp(int(event['date']))
        base_url = "http://bible.usccb.org/bible/readings/"
        key = to_key(d.month) + to_key(d.day) + str(d.year)[2:]
        url = base_url + key + '.cfm'
        messages.append('Adding url {} to event {}'.format(url, ev_key))
        res[ev_key]['readingsUrl'] = url
    return res

def add_raw_gospels(j, messages, max_ev=1):
    """For each event, fetch the gospel and gospelRef text from the USCCB. Do not transform the data.

    Set max_ev to -1 to not have any maximum on the loop
    """
    res = j
    i = 1
    for key, event in j.items():
        #if event['name'] == 'The Assumption of the Blessed Virgin Mary':
            #import pdb;pdb.set_trace()

        if max_ev >= 0 and i > max_ev:
            messages.append('Reached max_ev of {}. Exiting loop.'.format(max_ev))
            break
        i += 1

        # TODO: make sure in all tests that the length of events doesn't change

        # Skip this event if gospel was already fetched
        # This prevents unnecessary HTTP requests, plus prevents overwriting
        # if the gospel was manually edited
        if 'gospel' in event and 'gospelRef' in event:
            continue

        try:
            with urlopen(event['readingsUrl']) as response:
                soup = BeautifulSoup(response, 'html.parser')
                hrs = soup.find_all('h3', 'name')
                if not hrs:
                    messages.append('Error: No Gospel found at this URL {} for event {}.'.format(event['readingsUrl'], key))
                for hr in hrs:
                    hr_str = hr.string
                    if hr_str is None:
                        continue
                    title_lower = hr_str.strip().lower()
                    if title_lower != 'gospel':
                        continue
                    readingRef = hr.next_sibling.next_sibling.a.string

                    # Remove trailing dot that they sometimes place
                    if readingRef.endswith('.'):
                        readingRef = readingRef[:-1]
                    # Ensure the book shorthand is always uppercased (MT, LK, etc.)
                    readingRef = readingRef[:2].upper() + readingRef[2:]
                    if 'gospelRef' not in event:
                        res[key]['gospelRef'] = readingRef.strip()
                    strs = hr.parent.next_sibling.next_sibling.strings
                    # The Gospel text sometimes contain inconsistent whitespace
                    strs_stripped = [_RE_COMBINE_WHITESPACE.sub(' ', s).strip() for s in strs]
                    # The whitespace-join is to convert <br> into spaces.
                    gospelText = ' '.join(strs_stripped).strip()
                    # Sometimes they add a link to an another Feast reading in the Gospel text
                    pos = gospelText.find('For the reading')
                    if pos > -1:
                        gospelText = gospelText[:pos]
                    # TODO: instead of this 'gospel' key check to prevent overwrites, why not break out of the loop? write a comment when you find the answer
                    if 'gospel' not in event:
                        res[key]['gospel'] = gospelText
                    messages.append('Adding gospel from url {} to event {}'.format(event['readingsUrl'], key))
                # This check is to guard against the case where there are 'hrs' found, but they're all empty
                if 'gospel' not in res[key]:
                    messages.append('Error: No Gospel found at this URL {} for event {}.'.format(event['readingsUrl'], key))
        except urllib.error.HTTPError as e:
            messages.append('HTTPError: {}. URL: {}. FIX: Fix the URL in the input file and try again.,'.format(e.code, event['readingsUrl']))
        sleep(0.1)
    return res

def guess_or_gospels(j, messages):
    res = j

    for key, event in j.items():
        # no-op if gospel is already there
        if 'gospelRef' not in event or 'gospel' not in event:
            continue

        gospel_ref = event['gospelRef']
        many_refs = _RE_MANY_REFS.findall(gospel_ref)
        for many_ref_occurrence in many_refs:
            messages.append("WARNING: Found many refs in gospelRef. Event key: {}, gospelRef: {}, problem string: {}".format(key, gospel_ref, many_ref_occurrence))

        gospel = event['gospel']
        many_gospels = _RE_OR.findall(gospel)
        for many_gospel_occurrence in many_gospels:
            messages.append("WARNING: Found many gospels in gospel. Event key: {}, problem string: {}".format(key, many_gospel_occurrence))

        hidden_refs = _RE_HIDDEN_REF.findall(gospel)
        for hidden_ref in hidden_refs:
            messages.append("WARNING: Found hidden ref in gospel. Event key: {}, problem string: {}".format(key, hidden_ref))

    return res

def find_missing_events(j, messages):
    """Find dates that only have an optional memorial. This is an issue because we need to know
       what to celebrate if not the optional memorial.
    """
    res = j
    error_celebrations = dict()
    for key, event in j.items():
        ev_date = int(event['date'])
        grade = event['grade']
        # Store optional memorials by their date
        if grade == 1 or grade == 2:
            if ev_date in error_celebrations:
                error_celebrations[ev_date].append(key)
            else:
                error_celebrations[ev_date] = [key]
    for key, event in res.items():
        grade = event['grade']
        ev_date = int(event['date'])
        if grade != 1 and grade != 2 and ev_date in error_celebrations:
            error_celebrations[ev_date].append(key)

    for ev_date, keys in error_celebrations.items():
        if len(keys) == 1:
            messages.append("Missing fallback ferial celebration for {} for {}".format(ev_date, keys[0]))

    return res

def guess_lit_titles(j, messages):
    """Add litTitle and litSubtitle, remove [ USA ] prefix"""
    res = j
    for key, event in j.items():
        if 'name' in event:
            name = event['name']
            # name to litName
            if name[0] == '[':
                pos = name.find(']')
                name = name[pos + 2:]
            event['litName'] = name
        else:
            name = event['litName']

        # skip if title already exists
        if 'litTitle' in event:
            continue

        # litSubtitle guessing
        if _RE_NAME_MARY.search(name):
            messages.append(f'WARNING: Found an event for Our Lady, skipping subtitle guessing. Event: {key}')
            event['litTitle'] = name
            continue

        commaCount = name.count(',')
        if commaCount > 1:
            messages.append(f'WARNING: Found an event with many commas, skipping subtitle guessing. Event: {key}')
            event['litTitle'] = name
            continue

        if _RE_SAINTS_AND.search(name):
            messages.append(f'WARNING: Found an event with "Saints...and", skipping subtitle guessing. Event: {key}')
            event['litTitle'] = name
            continue

        pos = name.find(',')
        if pos > -1:
            event['litTitle'] = name[:pos]
            event['litSubtitle'] = name[pos + 2:]
        else:
            event['litTitle'] = name

    return res


# This function returns the date of easter for a given year.
#
# The algorithm is based on the following website:
# https://en.wikipedia.org/wiki/Date_of_Easter#Anonymous_Gregorian_algorithm
# using the New Scientist correction
#
# also ref https://www.codeproject.com/Articles/10860/Calculating-Christian-Holidays
# when calculating holidays
def compute_easter_gregorian(year):
    a = year % 19
    b = year // 100
    c = year % 100
    d = b // 4
    e = b % 4
    g = (8 * b + 13) // 25
    h = (19*a+b-d-g+15)%30
    i = c//4
    k = c%4
    l = (32+2*e+2*i-h-k)%7
    m = (a+11*h+19*l)//433
    month = (h+l-7*m+90) // 25
    day = (h+l-7*m+33*(month)+19)%32
    return (month, day)


def make_lit_fields(j, messages):
    """Transform grade, date, color for Litcal consumption"""
    # TODO: make this function no-op if lit fields already exist
    res = j
    for key, event in j.items():
        ev_name = event['name']
        if 'litKey' not in event:
            event['litKey'] = key

        lit_date = datetime.fromtimestamp(int(event['date']), tz=timezone.utc).date()
        event['litDate'] = lit_date.isoformat()

        # Refer to the "Table of Liturgical Days According to Their Order of Precedence" from the "General Norms for the Liturgical Year and the Calendar" for an understanding of where our ranks are coming from
        # Refer to https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI/blob/master/includes/enums/LitGrade.php for an understanding what grade represents
        easter_date_tup = compute_easter_gregorian(lit_date.year)
        easter_date = date(lit_date.year, easter_date_tup[0], easter_date_tup[1])
        grade = event['grade']
        if grade is not None:
            if not ev_name:
                messages.append(f'ERROR: Cannot compute litRank if we do not have the original event name. Key: {key}')
            elif grade == 7:
                if lit_date <= easter_date and lit_date >= easter_date - timedelta(days=2):
                    # is Easter Triduum
                    lit_rank = 1
                else:
                    lit_rank = 2
            elif grade == 6:
                if ev_name[0] != '[':
                    lit_rank = 3
                else:
                    lit_rank = 4
            elif grade == 5:
                if ev_name.find('Sunday') == -1:
                    lit_rank = 5
                else:
                    lit_rank = 6
            elif grade == 4:
                # NOTE: unclear if the feasts of the Dedication of the Basilicas of Sts Peter and Paul or the Lateran Basilica should be of rank 8 or 7
                if ev_name[0] == '[':
                    lit_rank = 8
                elif ev_name.find('Week of') > -1:
                    lit_rank = 9
                elif ev_name.find('Octave of') > -1:
                    lit_rank = 9
                else:
                    lit_rank = 7
            elif grade == 3:
                if ev_name[0] != '[':
                    lit_rank = 10
                else:
                    lit_rank = 11
            elif grade == 2 or grade == 1:
                lit_rank = 12
            else:
                lit_rank = 13
            event['litRank'] = lit_rank

        color = event['color']
        def parse_default_color(lit_colors):
            if "red" in lit_colors:
                return "red"
            else:
                return lit_colors[0]
        if color:
            lit_color = color
            if isinstance(lit_color, list):
                lit_color = parse_default_color(lit_color)
            else:
                lit_color = lit_color.split(',')
                if len(lit_color) > 1:
                    lit_color = parse_default_color(lit_color)
            if lit_color == 'purple':
                lit_color = 'violet'
            elif lit_color == 'pink':
                lit_color = 'rose'
            event['litColor'] = lit_color

    return res

def remove_fields(j, messages):
    res = j
    for key, event in j.items():
        # unused fields
        event.pop('eventIdx', None)
        event.pop('common', None)
        event.pop('displayGrade', None)
        event.pop('type', None)
        event.pop('liturgicalYear', None)
        event.pop('hasVesperI', None)
        event.pop('hasVesperII', None)
        event.pop('psalterWeek', None)
        event.pop('hasVigilMass', None)
        # fields used for transformation but not for litcal consumption
        event.pop('name', None)
        event.pop('grade', None)
        event.pop('color', None)
        event.pop('date', None)
    return res

def transform_to_reintroduce_names(j):
    res = j
    f2 = open('data/LCAPI-USA-2023-python-with-fixed-gospels.json', 'r', encoding='utf-8')
    j2 = json.loads(f2.read())
    names = {}
    for key, event in j2.items():
        names[key] = event['name']
    for key, event in j.items():
        event['name'] = names[key]
    return res

def add_seasons(j, messages):
    """Add seasons to data"""
    lit_years = {}
    lit_seasons = {}

    def compute_advent_start(secular_year):
        nat_date = date(secular_year, 12, 25) # Christmas for this liturgical year is in the last secular year
        sunday_before_nat = nat_date - timedelta(days=nat_date.isoweekday()) # isoweekday(): Mon=1, Sun=7
        return sunday_before_nat - timedelta(weeks=3)

    def compute_lit_year(year):
        start_date = compute_advent_start(year - 1)
        end_date = compute_advent_start(year) - timedelta(days=1)
        return LitYear(secular=year, startDate=start_date, endDate=end_date)

    def find_or_compute_next_lit_year(ev_date):
        lit_year_next = lit_years.get(ev_date.year + 1, None)
        if lit_year_next:
            assert lit_year_next.startDate.year == ev_date.year # liturgical year begins at the end of last secular year (ie. before Christmas)
            return lit_year_next
        lit_year_next = compute_lit_year(ev_date.year + 1)
        assert lit_year_next.startDate.year == ev_date.year
        lit_years[ev_date.year + 1] = lit_year_next
        return lit_year_next

    def find_or_compute_lit_year(ev_date):
        lit_year = lit_years.get(ev_date.year, None)
        if not lit_year:
            lit_year = compute_lit_year(ev_date.year)
            lit_years[ev_date.year] = lit_year
        if ev_date > lit_year.endDate:
            return find_or_compute_next_lit_year(ev_date)
        else:
            return lit_year

    def make_season(name, color, start_date, end_date):
        return LitSeason(name=name, litColor=color, startDate=start_date, endDate=end_date)

    def find_or_compute_lit_season(ev_date, lit_year, baptism_date):
        if not lit_year.secular in lit_seasons:
            s = {}
            lit_seasons[lit_year.secular] = s
            christmas_start_date = date(lit_year.secular - 1, 12, 25)
            easter_month, easter_day = compute_easter_gregorian(lit_year.secular)
            easter_date = date(lit_year.secular, easter_month, easter_day)

            s['Advent'] = make_season(
                    'Advent', 'violet',
                    lit_year.startDate, christmas_start_date - timedelta(days=1))

            if baptism_date.year == lit_year.secular: # won't be true for events in Nov and Dec
                s['Christmas'] = make_season(
                        'Christmas', 'white',
                        christmas_start_date, baptism_date)
                s['Ordinary Time'] = make_season(
                        'Ordinary Time', 'green',
                        baptism_date + timedelta(days=1), easter_date - timedelta(days=47))
                s['Ordinary Time 2'] = make_season(
                        'Ordinary Time', 'green',
                        easter_date + timedelta(days=50), lit_year.endDate)
                s['Lent'] = make_season(
                        'Lent', 'violet',
                        easter_date - timedelta(days=46), easter_date - timedelta(days=4))
                s['Paschal Triduum'] = make_season(
                        'Paschal Triduum', 'red',
                        easter_date - timedelta(days=3), easter_date - timedelta(days=1))
                s['Easter'] = make_season(
                        'Easter', 'white',
                        easter_date, easter_date + timedelta(days=49))

        seasons_for_year = lit_seasons[lit_year.secular]
        ev_season = None
        for season in lit_seasons[lit_year.secular].values():
            if ev_date >= season.startDate and ev_date <= season.endDate:
                return season.name
        if ev_date >= date(ev_date.year, 12, 25) and ev_date <= date(ev_date.year, 12, 31):
            # The only time we won't have already found a season is because this event is at year-end and we don't have the baptism date for the next liturgical year in this dataset
            assert baptism_date != lit_year.secular
            return 'Christmas'
        raise ValueError(f'No season found for event on date {ev_date}')

    res = j

    baptism_ev = j.get('BaptismLord', None)
    if not baptism_ev:
        messages.append("ERROR: missing BaptismLord event, so we cannot add seasons and year data")
        return res, {}, {}
    baptism_date = date.fromisoformat(baptism_ev['litDate'])

    for key, event in j.items():
        ev_date = date.fromisoformat(event['litDate'])
        lit_year = find_or_compute_lit_year(ev_date)
        lit_season_name = find_or_compute_lit_season(ev_date, lit_year, baptism_date)
        event['litYearSecular'] = lit_year.secular
        event['litSeasonName'] = lit_season_name

    # Serialize
    lit_seasons_list = []
    for _, seasons in lit_seasons.items():
        for key, season in seasons.items():
            lit_seasons_list.append({
                'name': season.name,
                'litColor': season.litColor,
                'startDate': season.startDate.isoformat(),
                'endDate': season.endDate.isoformat()
                })
    for key, lit_year in lit_years.items():
        lit_years[key] = {
                'secular': lit_year.secular,
                'startDate': lit_year.startDate.isoformat(),
                'endDate': lit_year.endDate.isoformat()
                }

    return res, lit_seasons_list, lit_years

def remove_extra_events(j, messages):
    """Remove events so there is only 1 event per date"""
    events_by_date = {}
    for key, event in j.items():
        ev_date = date.fromisoformat(event['litDate'])
        #if ev_date == date(2023, 1, 3):
            #import pdb;pdb.set_trace()
        if event['litRank'] == 12:
            # We place the key there but we ignore this event because the app currently ignores optional memorials
            if ev_date not in events_by_date:
                events_by_date[ev_date] = None
            continue
        incumbent = events_by_date.get(ev_date, None)
        event['oldKey'] = key
        if incumbent is None:
            events_by_date[ev_date] = event
        else:
            if event['litRank'] < incumbent['litRank']:
                events_by_date[ev_date] = event
            elif event['litRank'] == incumbent['litRank']:
                messages.append(f"ERROR: equal non-12 rank found for event {key}. Incumbent key {incumbent['litKey']}")
    res = {}
    for key, event in events_by_date.items():
        if event:
            res[event['oldKey']] = event
            del event['oldKey']
        else:
            #import pdb;pdb.set_trace()
            messages.append(f'ERROR: no event for date {key}')
    return res

def make_martyr_events_red(j):
    """For events that have white or red as their liturgical color, make them red if they are martyrs

    The new make_lit_fields does this already, so this function is only to fix old JSON files
    """
    for key, event in j['litEvents'].items():
        #import pdb;pdb.set_trace()
        if event['color'] == ['white', 'red']:
            event['litColor'] = 'red'
    return j


def transform(j, max_ev=-1):
    """Transform the data and return messages for data you couldn't transform"""
    messages = []

    # Received data could be just events, or events wrapped alongside years and season data
    orig = None
    if 'litEvents' in j:
        orig = j
        j = j['litEvents']

    j = add_urls(j, messages)
    j = add_raw_gospels(j, messages, max_ev)
    j = guess_or_gospels(j, messages)
    j = find_missing_events(j, messages)
    j = guess_lit_titles(j, messages)
    j = make_lit_fields(j, messages)

    if orig:
        orig['litEvents'] = j
        j = orig
    else:
        j, seasons, years = add_seasons(j, messages)
        j = { 'litYears': years, 'litSeasons': seasons, 'litEvents': j }

    return (j, messages)


def main():
    """Process files. Try not to overwrite data we've already processed

    Supports reading both original files, which have a {"LitCal": events} structures, as well
    as files we've already processed, which are just {...events}
    """
    filename = sys.argv[1]
    with open(filename, 'r', encoding="utf-8") as f:
        read_data = f.read()
        j = json.loads(read_data)
        if 'LitCal' in j:
            j = j['LitCal']

        if len(sys.argv) < 3:
            raise ValueError("Incorrect arguments. Third argument should be 'transform or 'minify'")
        mode = sys.argv[2]
        if mode == 'transform':
            j, messages = transform(j)
        elif mode == 'minify':
            j, messages = minify(j)
        else:
            raise ValueError("Incorrect third argument. should be 'transform' or 'minify'")

        for msg in messages:
            print(msg)
        if mode == 'transform':
            print(json.dumps(j, indent=2))
        elif mode == 'minify':
            print(json.dumps(j, separators=(',', ':')))
        return j


import unittest

class TestAgent(unittest.TestCase):
    def setUp(self):
        self.file = open('test_data/short_set.json', 'r', encoding="utf-8")
        self.parsed_json = json.loads(self.file.read())['LitCal']

    def tearDown(self):
        self.file.close()

    def test_urls(self):
        res = add_urls(self.parsed_json, [])
        self.assertEqual(res['Epiphany']['readingsUrl'], 'http://bible.usccb.org/bible/readings/010823.cfm')

    def test_gospels(self):
        res, _ = transform(self.parsed_json, 1)
        self.assertEqual(res['MotherGod']['gospelRef'], 'LK 2:16-21')
        self.assertEqual(res['MotherGod']['gospel'][:40], 'The shepherds went in haste to Bethlehem')

    def test_gospels_multiple_gospels(self):
        """For some events, events have multiple Gospels linked to from the main URL"""

        with open('test_data/multi_gospels.json', 'r', encoding="utf-8") as f:
            j = json.loads(f.read())['LitCal']
            #import pdb;pdb.set_trace()
            res, _ = transform(j)
            # Assert the URL, even if it won't point to anything valid on USCCB side, to confirm we constructed the right date
            ev_key = 'Christmas'
            self.assertEqual(res[ev_key]['readingsUrl'], 'http://bible.usccb.org/bible/readings/122523.cfm')
            self.assertNotIn('gospelRef', res[ev_key])
            self.assertNotIn('gospel', res[ev_key])

            # Fix the URL and try again
            res[ev_key]['readingsUrl'] = 'https://bible.usccb.org/bible/readings/122523-Day.cfm'
            new_res, _ = transform(res)
            self.assertEqual(new_res[ev_key]['gospelRef'], 'JN 1:1-18')
            self.assertEqual(new_res[ev_key]['gospel'][:29], 'In the beginning was the Word')

    def test_gospels_bad_url(self):
        """For some events, the USCCB doesn't have a predictable URL for the readings"""
        # TODO: test some other bad URL case (the ones with multiple gospels, too, where the result won't necessarily be 404)
        with open('test_data/usccb_bad_url.json', 'r', encoding="utf-8") as f:
            j = json.loads(f.read())['LitCal']
            res, _ = transform(j)
            # Assert the URL, even if it won't point to anything valid on USCCB side, to confirm we constructed the right date
            ev_key = 'StJohnBosco'
            self.assertEqual(res[ev_key]['readingsUrl'], 'http://bible.usccb.org/bible/readings/013123.cfm')
            self.assertNotIn('gospelRef', res[ev_key])
            self.assertNotIn('gospel', res[ev_key])

            # Fix the URL and try again
            res[ev_key]['readingsUrl'] = 'https://bible.usccb.org/bible/readings/01312023.cfm'
            new_res, _ = transform(res)
            self.assertEqual(new_res[ev_key]['gospelRef'], 'MK 5:21-43')
            self.assertEqual(new_res[ev_key]['gospel'][:40], 'When Jesus had crossed again in the boat')

    def test_many_refs(self):
        with open('test_data/many_refs.json', 'r', encoding='utf-8') as f:
            j = json.loads(f.read())
            res, messages = transform(j)
            self.assertEqual(messages[0], 'WARNING: Found many refs in gospelRef. Event key: Presentation, gospelRef: LK 2:22-40 or 2:22-32, problem string: LK 2:22-40 or')

    def test_easter_calc(self):
        easter2022 = compute_easter_gregorian(2022)
        easter2023 = compute_easter_gregorian(2023)
        self.assertEqual(easter2022, (4, 17))
        self.assertEqual(easter2023, (4, 9))

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'test':
        sys.argv = sys.argv[:-1]
        unittest.main()
    else:
        main()


# to debug: https://docs.python.org/3/library/pdb.html
