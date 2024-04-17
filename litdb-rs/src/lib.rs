pub mod capi;

use rusqlite::{params, Connection, Result};
use std::error::Error;
use rusqlite::types::{FromSqlResult, ValueRef, FromSql, FromSqlError};

#[derive(Debug)]
pub enum LitColor {
    White,
    Black,
    Red,
    Green,
    Violet,
    Gold,
    Silver,
    Rose
}

impl FromSql for LitColor {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        match value.as_str() {
            Ok("white") => Ok(LitColor::White),
            Ok("black") => Ok(LitColor::Black),
            Ok("red") => Ok(LitColor::Red),
            Ok("green") => Ok(LitColor::Green),
            Ok("violet") => Ok(LitColor::Violet),
            Ok("gold") => Ok(LitColor::Gold),
            Ok("silver") => Ok(LitColor::Silver),
            Ok("rose") => Ok(LitColor::Rose),
            Ok(_) | Err(_) => Err(FromSqlError::InvalidType),
        }
    }
}


#[derive(Debug)]
pub struct LitCelebration {
    event_key: String,
    rank: i32,
    color: LitColor,
    title: String,
    subtitle: Option<String>,
    gospel_ref: String,
    gospel_text: String,
    readings_url: String,
    season: String,
    date_seconds: i64,
}

pub fn lit_celebrations_in_range(
    conn: &Connection,
    cal_id: i32,
    lo: i64,
    hi: i64,
) -> Result<Vec<LitCelebration>, Box<dyn Error>> {
    if lo < 0 || hi < 0 {
        return Err("Invalid arguments: lo or hi are negative".into());
    }

    let query = "
        SELECT lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel,
        lc.gospel_ref, lc.readings_url, lcol.name AS color, ls.name,
        ld.secular_date_s, COUNT(*) OVER ()
        FROM lit_celebration lc
        JOIN lit_day ld ON lc.lit_day_id = ld.id
        JOIN lit_color lcol ON lc.lit_color_id = lcol.id
        JOIN lit_season ls ON ld.lit_season_id = ls.id
        JOIN lit_year ly ON ls.lit_year_id = ly.id
        WHERE ld.secular_date_s >= ? AND ld.secular_date_s <= ? AND ly.lit_calendar_id = ?
        ORDER BY ld.secular_date_s;
    ";

    let mut stmt = conn.prepare(query)?;
	let mut lit_celebration_iter =
		stmt.query_map(params![lo, hi, cal_id], |row| {
			let count: usize = row.get(10)?;
			Ok((count, LitCelebration {
				event_key: row.get(0)?,
				rank: row.get(1)?,
				title: row.get(2)?,
				subtitle: row.get(3)?,
				gospel_text: row.get(4)?,
				gospel_ref: row.get(5)?,
				readings_url: row.get(6)?,
				color: row.get(7)?,
				season: row.get(8)?,
				date_seconds: row.get(9)?,
			}))
		})?;

	let first_row = lit_celebration_iter.next()
		.ok_or_else(||-> Box<dyn Error> { "No rows found matching the query.".into()})?;
	let (count, first_cel) = first_row?;
	let mut celebrations = Vec::with_capacity(count);
	celebrations.push(first_cel);
	for result in lit_celebration_iter {
		let (_, celebration) = result?;
		celebrations.push(celebration);
	}
	Ok(celebrations)
}
//
// #[cfg(test)]
// mod tests {
//     use super::*;
//
//     #[test]
//     fn it_works() {
//         let result = add(2, 2);
//         assert_eq!(result, 4);
//     }
// }
