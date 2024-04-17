use std::ffi::CStr;
use crate::{lit_celebrations_in_range, LitColor};
use libc::{c_char, c_int, c_longlong};
use rusqlite::Connection;

macro_rules! str_to_fixed_array {
    ($s:expr, $size:expr) => {{
        let mut array = [0u8; $size];
        let bytes = $s.as_bytes();
        let len = bytes.len().min($size);
        array[..len].copy_from_slice(&bytes[..len]);
        array
    }};
}

#[repr(C)]
pub enum LitColorC {
	White,
	Black,
	Red,
	Green,
	Violet,
	Gold,
	Silver,
	Rose
}

impl From<LitColor> for LitColorC {
	fn from(color: LitColor) -> Self {
		match color {
			LitColor::White => LitColorC::White,
			LitColor::Black => LitColorC::Black,
			LitColor::Red => LitColorC::Red,
			LitColor::Green => LitColorC::Green,
			LitColor::Violet => LitColorC::Violet,
			LitColor::Gold => LitColorC::Gold,
			LitColor::Silver => LitColorC::Silver,
			LitColor::Rose => LitColorC::Rose,
		}
	}
}

#[repr(C)]
pub struct LitCelebrationC {
	/// The key is unique among other celebrations, but if the celebration appears
	/// on a different year, the key is the same
	event_key: [u8; 128],
	rank: i32,
	color: LitColorC,
	title: [u8; 256],
	subtitle: [u8; 128],
	gospel_ref: [u8; 64],
	gospel_text: *mut u8,
	readings_url: *mut u8,
	season: [u8; 32],
	/// seconds from 19700101 to 00:00 (midnight the morning of) on the day of this celebration
	epoch_seconds: i64,
}

impl LitCelebrationC {
	pub fn new(
		event_key: &str, rank: i32, color: LitColor, title: &str, subtitle: Option<&str>,
		gospel_ref: &str, gospel_text: &str, readings_url: &str, season: &str, epoch_seconds: i64
	) -> LitCelebrationC {
		LitCelebrationC {
			event_key: str_to_fixed_array!(event_key, 128),
			rank,
			color: color.into(),
			title: str_to_fixed_array!(title, 256),
			subtitle: subtitle.map_or([0u8; 128], |s| str_to_fixed_array!(s, 128)),
			gospel_ref: str_to_fixed_array!(gospel_ref, 64),
			gospel_text: Box::into_raw(gospel_text.to_string().into_boxed_str()) as *mut u8,
			readings_url: Box::into_raw(readings_url.to_string().into_boxed_str()) as *mut u8,
			season: str_to_fixed_array!(season, 32),
			epoch_seconds,
		}
	}
}

#[no_mangle]
pub extern "C" fn lit_celebrations_in_range_c(
	db_path: *const c_char,
	cal_id: c_int,
	lo: c_longlong,
	hi: c_longlong,
	out_cels: *mut *mut LitCelebrationC,
	out_count: *mut c_int,
) -> c_int {
	let path = unsafe { CStr::from_ptr(db_path).to_string_lossy().into_owned() };
	let conn = match Connection::open(path) {
		Ok(conn) => conn,
		Err(_) => return -1,
	};

	match lit_celebrations_in_range(&conn, cal_id, lo, hi) {
		Ok(celebrations) => {
			unsafe {
				*out_count = celebrations.len() as c_int;
				let size = celebrations.len() * std::mem::size_of::<LitCelebrationC>();
				*out_cels = libc::malloc(size) as *mut LitCelebrationC;
				let c_cels = std::slice::from_raw_parts_mut(*out_cels, celebrations.len());
				for (i, celebration) in celebrations.iter().enumerate() {
					c_cels[i] = LitCelebrationC::from_rust(celebration);
				}
			}
			0
		}
		Err(_) => -2,
	}
}
