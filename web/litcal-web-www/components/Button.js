import React from "react"
import { Link } from "@/components/catalyst/link"
import { Button as HeadlessButton } from "@headlessui/react"
import { clsx } from "clsx"

const styles = {
	base: [
		// Base
		"relative isolate inline-flex items-center justify-center gap-x-2 rounded-md border text-xs/6 font-light",

		// Sizing
		"px-[calc(theme(spacing.3)-1px)] py-[calc(theme(spacing.1)-1px)]",
		"sm:px-[calc(theme(spacing.3)-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] sm:text-xs/6",

		// Focus
		"focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500",

		// Disabled
		"data-[disabled]:opacity-50",

		// Icon
		"[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-[--btn-icon] [&>[data-slot=icon]]:sm:my-1 [&>[data-slot=icon]]:sm:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-[hover]:[--btn-icon:ButtonText]",
	],
	solid: [
		// Optical border, implemented as the button background to avoid corner artifacts
		"border-transparent bg-[--btn-border]",

		// Dark mode: border is rendered on `after` so background is set to button background
		"dark:bg-[--btn-bg]",

		// Button background, implemented as foreground layer to stack on top of pseudo-border layer
		"before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-[--btn-bg]",

		// Drop shadow, applied to the inset `before` layer so it blends with the border
		"before:shadow",

		// Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
		"dark:before:hidden",

		// Dark mode: Subtle white outline is applied using a border
		"dark:border-white/5",

		// Shim/overlay, inset to match button foreground and used for hover state + highlight shadow
		"after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.lg)-1px)]",

		// Inner highlight shadow
		"after:shadow-[shadow:inset_0_1px_theme(colors.white/15%)]",

		// White overlay on hover
		"after:data-[active]:bg-[--btn-hover-overlay] after:data-[hover]:bg-[--btn-hover-overlay]",

		// Dark mode: `after` layer expands to cover entire button
		"dark:after:-inset-px dark:after:rounded-lg",

		// Disabled
		"before:data-[disabled]:shadow-none after:data-[disabled]:shadow-none",
	],
	colors: {
		dove: [
			"text-ashes [--btn-bg:theme(colors.dove)] [--btn-border:theme(colors.dove/90%)] [--btn-hover-overlay:theme(colors.white/40%)]",
			// Dark mode not implemented yet
			// "dark:text-white dark:[--btn-bg:theme(colors.zinc.600)] dark:[--btn-hover-overlay:theme(colors.white/5%)]",
			"[--btn-icon:theme(colors.ashes)] data-[active]:[--btn-icon:theme(colors.ashes)] data-[hover]:[--btn-icon:theme(colors.ashes)]",
		],
		"dark/zinc": [
			"text-white [--btn-bg:theme(colors.zinc.900)] [--btn-border:theme(colors.zinc.950/90%)] [--btn-hover-overlay:theme(colors.white/10%)]",
			"dark:text-white dark:[--btn-bg:theme(colors.zinc.600)] dark:[--btn-hover-overlay:theme(colors.white/5%)]",
			"[--btn-icon:theme(colors.zinc.400)] data-[active]:[--btn-icon:theme(colors.zinc.300)] data-[hover]:[--btn-icon:theme(colors.zinc.300)]",
		],
		light: [
			"text-zinc-950 [--btn-bg:white] [--btn-border:theme(colors.zinc.950/10%)] [--btn-hover-overlay:theme(colors.zinc.950/2.5%)] data-[active]:[--btn-border:theme(colors.zinc.950/15%)] data-[hover]:[--btn-border:theme(colors.zinc.950/15%)]",
			"dark:text-white dark:[--btn-hover-overlay:theme(colors.white/5%)] dark:[--btn-bg:theme(colors.zinc.800)]",
			"[--btn-icon:theme(colors.zinc.500)] data-[active]:[--btn-icon:theme(colors.zinc.700)] data-[hover]:[--btn-icon:theme(colors.zinc.700)] dark:[--btn-icon:theme(colors.zinc.500)] dark:data-[active]:[--btn-icon:theme(colors.zinc.400)] dark:data-[hover]:[--btn-icon:theme(colors.zinc.400)]",
		],
		"dark/white": [
			"text-white [--btn-bg:theme(colors.zinc.900)] [--btn-border:theme(colors.zinc.950/90%)] [--btn-hover-overlay:theme(colors.white/10%)]",
			"dark:text-zinc-950 dark:[--btn-bg:white] dark:[--btn-hover-overlay:theme(colors.zinc.950/5%)]",
			"[--btn-icon:theme(colors.zinc.400)] data-[active]:[--btn-icon:theme(colors.zinc.300)] data-[hover]:[--btn-icon:theme(colors.zinc.300)] dark:[--btn-icon:theme(colors.zinc.500)] dark:data-[active]:[--btn-icon:theme(colors.zinc.400)] dark:data-[hover]:[--btn-icon:theme(colors.zinc.400)]",
		],
		dark: [
			"text-white [--btn-bg:theme(colors.zinc.900)] [--btn-border:theme(colors.zinc.950/90%)] [--btn-hover-overlay:theme(colors.white/10%)]",
			"dark:[--btn-hover-overlay:theme(colors.white/5%)] dark:[--btn-bg:theme(colors.zinc.800)]",
			"[--btn-icon:theme(colors.zinc.400)] data-[active]:[--btn-icon:theme(colors.zinc.300)] data-[hover]:[--btn-icon:theme(colors.zinc.300)]",
		],
		white: [
			"text-zinc-950 [--btn-bg:white] [--btn-border:theme(colors.zinc.950/10%)] [--btn-hover-overlay:theme(colors.zinc.950/2.5%)] data-[active]:[--btn-border:theme(colors.zinc.950/15%)] data-[hover]:[--btn-border:theme(colors.zinc.950/15%)]",
			"dark:[--btn-hover-overlay:theme(colors.zinc.950/5%)]",
			"[--btn-icon:theme(colors.zinc.400)] data-[active]:[--btn-icon:theme(colors.zinc.500)] data-[hover]:[--btn-icon:theme(colors.zinc.500)]",
		],
		zinc: [
			"text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.zinc.600)] [--btn-border:theme(colors.zinc.700/90%)]",
			"dark:[--btn-hover-overlay:theme(colors.white/5%)]",
			"[--btn-icon:theme(colors.zinc.400)] data-[active]:[--btn-icon:theme(colors.zinc.300)] data-[hover]:[--btn-icon:theme(colors.zinc.300)]",
		],
	},
}

/**
 * A button component
 *
 * @param {string} color
 * @param {string} className
 * @param {Array<JSX.Element>} children
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const Button = React.forwardRef(function Button(
	{ color, className, children, ...props },
	ref,
) {
	let classes = clsx(
		className,
		styles.base,
		clsx(styles.solid, styles.colors[color ?? "dark/zinc"]),
	)
	return "href" in props ? (
		<Link {...props} className={classes} ref={ref}>
			<TouchTarget>{children}</TouchTarget>
		</Link>
	) : (
		<HeadlessButton
			{...props}
			className={clsx(classes, "cursor-default")}
			ref={ref}
		>
			<TouchTarget>{children}</TouchTarget>
		</HeadlessButton>
	)
})

/* Expand the hit area to at least 44×44px on touch devices */
export function TouchTarget({ children }) {
	return (
		<>
			{children}
			<span
				className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
				aria-hidden="true"
			/>
		</>
	)
}
