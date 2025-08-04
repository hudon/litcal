import process from "node:process"
import fs from "fs"

main()

// Transform the JCLAPI calendar output so that it becomes test data for us (like a snapshot test)
// there are some bugs in his data, and there are some things we just do differently, hence the
// need to process the name, rank, etc.
function main() {
  let filename = process.argv[2]
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'))
  const year = 2025

  const result = {}

  const events = data.litcal
  const easterEV = events.find(e => e.event_key === 'Easter')
  const easterDate = new Date(Date.UTC(easterEV.year, easterEV.month - 1, easterEV.day))
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday']
  let processedEpiphany = false
  for (const ev of events) {
    if (ev.is_vigil_mass) continue
    if (ev.year !== year) continue

    const date = new Date(Date.UTC(ev.year, ev.month - 1, ev.day))

    const grade = ev.grade
    let rank = -1
    if (grade === 7) {
      if (ev.event_key === 'Easter' || ev.event_key === 'GoodFri') rank = 1
      else rank = 2
    } else if (grade === 6) {
      if (ev.name[0] === '[') rank = 4
      else rank = 3
    } else if (grade === 5) {
      if (ev.name.includes('Sunday')) rank = 6
      else rank = 5
    } else if (grade === 4) {
      if (ev.name[0] === '[') rank = 8
      else if (ev.name.includes('Week of')) rank = 9
      else if (ev.name.includes('Octave of')) rank = 9
      else rank = 7
    } else if (grade === 3) {
      if (ev.name[0] === '[') rank = 11
      else rank = 10
    } else if (grade === 2 || grade === 1) rank = 12
    else {
      if (ev.liturgical_season === 'LENT' && date.getUTCDay() !== 0)
        rank = 9
      else rank = 13
    }

    let name = ev.name.replace(', Mother of', ', the Holy Mother of')
      .replace(/.*(Christmas Weekday)/, '$1')
      .replace(/\[.*\] /, '')
      .replace('Epiphany', 'The Epiphany of the Lord')
      .replace('Baptism of', 'The Baptism of')
      .replace('in Ordinary', 'of Ordinary')
      .replace('Presentation', 'The Presentation')
      .replace('First', '1st').replace('Second', '2nd') .replace('Third', '3rd')
      .replace('Fourth', '4th').replace('Fifth', '5th')
      .replace('Sixth', '6th').replace('Seventh', '7th')
      .replace('Eighth', '8th').replace('Ninth', '9th')
      .replace('Joseph Husband', 'Joseph, Spouse')
      .replace('Annun', 'The Annun')
      .replace('Palm Sunday', "Palm Sunday of the Lord's Passion")
      .replace('Good Friday', "Friday of the Lord's Passion")
      .replace('Easter Vigil', 'The Easter Vigil in the Holy Night')
      .replace(' or Divine Mercy Sunday', '')
      .replace('as the Apostle', 'as, Apostle')
      .replace('Visit', 'The Visit')
      .replace('Ascension', 'The Ascension of the Lord')
      .replace('Pentecost', 'Pentecost Sunday')
      .replace('Blessed Virgin Mary, the Holy Mother of the Church', 'The Blessed Virgin Mary, Mother of the Church')
      .replace('Holy Trinity Sunday', 'The Most Holy Trinity')
      .replace('Corpus Christi', 'The Most Holy Body and Blood of Christ')
      .replace('Most Sacred', 'The Most Sacred')
      .replace('Saint Irenaeus, Bishop and Martyr and Doctor of the Church', 'Saint Irenaeus, Bishop and Martyr')
      .replace('Blessed Jun', 'Saint Jun')
    if (name.includes('Epiphany')) processedEpiphany = true

    if (processedEpiphany) {
      name = name.replace(
        /.*Christmas Weekday.*/,
        `${dayNames[date.getUTCDay()]} after Epiphany Sunday`)
    }
    if (name.includes('Easter Vigil')) {
      rank = 1
    } else if (name.includes('Holy Trin') || name.includes('Body and Blood')) {
      rank = 3
    } else if (name.includes('Independence') rank = 12
    
    result[date] ??= []
    const newCel = { date, name, rank }
    const highestRank = result[date]
      .map(c => c.rank)
      .reduce((a, b) => b === 12 ? a : Math.min(a, b), 999)
    if (rank < highestRank) {
      if (rank === 12) result[date].push(newCel)
      else result[date] = [newCel]
    } else if (highestRank === rank || highestRank === 12)
      result[date].push(newCel)
    //result[date].push({ date, grade, name, rank })
  }

  const date = new Date(Date.UTC(year, 0, 23))
  result[date].push({ date, name: 'Saint Marianne Cope, Virgin', rank: 12 })

  const outStr = JSON.stringify(result, null, 2)
  console.log(outStr)
}
