interface TransformedCal {
	events: { [key: string]: any }
	messages: string[]
}

interface LCAPICal {
	LitCal: { [key: string]: any }
}

type InputCal = TransformedCal | LCAPICal

export { InputCal, LCAPICal, TransformedCal }
