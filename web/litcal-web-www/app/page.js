import Image from "next/image";

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
	Bars3Icon,
	CalendarIcon,
	ChartPieIcon,
	DocumentDuplicateIcon,
	FolderIcon,
	HomeIcon,
	UsersIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'

const navigation = [
	{ name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
	{ name: 'Team', href: '#', icon: UsersIcon, current: false },
	{ name: 'Projects', href: '#', icon: FolderIcon, current: false },
	{ name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
	{ name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
	{ name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
]
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
		<span
			className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-500 text-[0.625rem] font-medium text-white"
		>
			{team.initial}
		</span>
		<span className="truncate">Holy Days of obligation</span>
	</a>
}

function NavFooter() {
	return <a
		href="#"
		className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700"
	>
		<img
			className="h-8 w-8 rounded-full bg-indigo-700"
			src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
			alt=""
		/>
		<span className="sr-only">Your profile</span>
		<span aria-hidden="true">Tom Cook</span>
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
