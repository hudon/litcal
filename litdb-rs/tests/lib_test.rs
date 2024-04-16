use rusqlite::Connection;
use litdb::lit_celebrations_in_range;

#[test]
fn test_lit_celebrations_in_range() {
	let db_path = "tests/data/litcal.test.sqlite";
	let conn = Connection::open(db_path).unwrap();
	let cal_id = 1;
	let lo: i64 = 1704931200;
	let expected_count = 3;
	let hi: i64 = lo + (expected_count - 1) * 60 * 60 * 24;

	let result = lit_celebrations_in_range(&conn, cal_id, lo, hi);

	match result {
		Ok(lc_vec) => {
			// Perform assertions comparing lc_vec to expected results...
			assert_eq!(lc_vec.len(), expected_count.try_into().unwrap());
		},
		Err(e) => panic!("An error occurred: {}", e),
	}
}