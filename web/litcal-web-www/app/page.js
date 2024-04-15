import {Fragment} from 'react'
import {CalendarIcon,} from '@heroicons/react/24/outline'

const teams = [
	{ id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
	{ id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
	{ id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

function DatePicker() {
	return <p>Date Picker</p>
}

function NavHolyDays() {
	const team = teams[0];
	return <a
		href={team.href}
		className={classNames(
			team.current
				? 'bg-indigo-700 text-white'
				: 'text-indigo-200 hover:text-white hover:bg-indigo-700',
			'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
		)}
	>
		<CalendarIcon
			className='text-white h-6 w-6 shrink-0'
			aria-hidden="true"
		/>
		<span className="truncate">Holy Days of obligation</span>
	</a>
}

function NavFooter() {
	return <a
		href="#"
		className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700"
	>
		<span className="sr-only">Download on the App Store</span>
		<span aria-hidden="true">Download on the App Store</span>
	</a>
}

export default function Page() {
	return (
		<>
			<div>
				{/* Static sidebar for desktop */}
				<div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
					{/* Sidebar component, swap this element with another sidebar if you like */}
					<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6">
						<div className="flex h-16 shrink-0 items-center">
							<img
								className="h-8 w-auto"
								src="https://tailwindui.com/img/logos/mark.svg?color=white"
								alt="Your Company"
							/>
						</div>
						<nav className="flex flex-1 flex-col">
							<ul role="list" className="flex flex-1 flex-col gap-y-7">
								<li>
									<DatePicker></DatePicker>
								</li>
								<li>
									<ul role="list" className="-mx-2 mt-2 space-y-1">
										<li>
											<NavHolyDays></NavHolyDays>
										</li>
									</ul>
								</li>
								<li className="-mx-6 mt-auto">
									<NavFooter></NavFooter>
								</li>
							</ul>
						</nav>
					</div>
				</div>

				<main className="py-10 lg:pl-72">
					<div className="px-4 sm:px-6 lg:px-8">{/* Your content */}</div>
				</main>
			</div>
		</>
	)
}
