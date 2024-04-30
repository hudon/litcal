interface TransformedCal {
	events: { [key: string]: any; year: number; month: number; day: number }
	messages: string[]
}

interface LCAPICal {
	LitCal: { [key: string]: any }
}

type InputCal = TransformedCal | LCAPICal

export { InputCal, LCAPICal, TransformedCal }
