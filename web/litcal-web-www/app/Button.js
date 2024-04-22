/**
 * A button component
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {JSX.ElementType} props.Icon
 * @param {string} [props.bgColorClass]
 * @param {string} [props.textColorClass]
 * @returns {JSX.Element}
 */
export default function Button({
	label,
	Icon,
	bgColorClass = "bg-dove",
	textColorClass = "text-ashes",
}) {
	return (
		<div
			className={`flex flex-row rounded-md px-3 py-1.5 
			${bgColorClass} ${textColorClass} hover:cursor-pointer`}
		>
			<Icon className="h- w-4" aria-hidden="true" strokeWidth="2" />
			<span className="pl-2 text-xs">{label}</span>
		</div>
	)
}
