import process from "node:process"
import fs from "fs"

main()
function main() {
  let filename = process.argv[2]
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'))

  const result = {}

  const events = data.litcal
  const easterEV = events.find(e => e.event_key === 'Easter')
  const easterDate = new Date(Date.UTC(easterEV.year, easterEV.month - 1, easterEV.day))
  for (const ev of events) {
    if (ev.is_vigil_mass) continue
    if (ev.year !== 2025) continue

    const grade = ev.grade
    let rank = -1
    if (grade === 7)
      if (ev.event_key === 'Easter' || ev.event_key === 'GoodFri') rank = 1
      else rank = 2
    else if (grade === 6)
      if (ev.name[0] === '[') rank = 4
      else rank = 3
    else if (grade === 5)
      if (ev.name.includes('Sunday')) rank = 6
      else rank = 5
    else if (grade === 4)
      if (ev.name[0] === '[') rank = 8
      else if (ev.name.includes('Week of')) rank = 9
      else if (ev.name.includes('Octave of')) rank = 9
      else rank = 7
    else if (grade === 3)
      if (ev.name[0] === '[') rank = 11
      else rank = 10
    else if (grade === 2 || grade === 1) rank = 12
    else rank = 13

    const name = ev.name.replace(', Mother of', ', the Holy Mother of')
      .replace(/.*(Christmas Weekday)/, '$1')
    const date = new Date(Date.UTC(ev.year, ev.month - 1, ev.day))
    result[date] ??= []
    //result[date].push({ date, grade, name, rank })
    result[date].push({ date, name, rank })
  }

  const outStr = JSON.stringify(result, null, 2)
  console.log(outStr)
}
