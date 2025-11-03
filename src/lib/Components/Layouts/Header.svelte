<script>
	import { fade, fly } from 'svelte/transition'

	import { mediaQuery } from '$Stores/mediaQuery'
	import MenuToggle from '$Components/AnimatedIcons/MenuToggle/MenuToggle.svelte'
	import { isMenuOpen, toggleMenu } from '$Stores/menuStore'
	import { currentSection } from '$lib/Stores/currentSection'

	import { HEADER, SOCIALS } from '$lib/const'
	import Logo from '$Components/AnimatedIcons/Logo/index.svelte'
	import Wordmark from '$Components/AnimatedIcons/Wordmark/Wordmark.svelte'
	import { cn } from '$utils'
	import XLogo from '$Components/AnimatedIcons/Socials/x-logo.svelte'
	import TgLogo from '$Components/AnimatedIcons/Socials/tg-logo.svelte'
	import Email from '$Components/AnimatedIcons/Socials/email.svelte'
	import Nullmask from '$Components/AnimatedIcons/Socials/nullmask.svelte'
</script>

<header
	class="fixed top-0 z-[10001] px-4 pt-4"
	style="height: {$mediaQuery.md
		? HEADER.height.desktop
		: HEADER.height
				.mobile}px; max-width: 1440px; left: 50%; transform: translateX(-50%); width: 100%;"
	data-theme={$currentSection.theme}
>
	<div
		class={cn(
			'flex h-full justify-between rounded-t-[15px]  border transition-all duration-500',
			!$isMenuOpen && 'rounded-b-[15px]'
		)}
		class:bg-dark={$currentSection.theme === 'dark'}
		class:bg-light={$currentSection.theme === 'light'}
		class:border-light={$currentSection.theme === 'dark'}
		class:border-dark={$currentSection.theme === 'light'}
	>
		<div class="items-cetner flex h-full flex-shrink-0 gap-2 md:gap-4">
			<a href="/" class="block flex items-center">
				<Logo
					className="h-12 w-12 transition-colors ml-2 md:ml-4 duration-500 md:h-16 md:w-16"
					theme={$currentSection.theme}
				/>
			</a>

			<Wordmark
				className="md:w-[240px] w-[160px] flex-shrink-0  transition-colors duration-500 h-auto object-contain"
				theme={$currentSection.theme}
			/>
		</div>

		<!-- {#if !$mediaQuery.md} -->
		<MenuToggle
			className="border-l flex items-center justify-center transition-colors duration-500 {$currentSection.theme ===
			'light'
				? 'border-light'
				: 'border-dark'}"
			theme={$currentSection.theme}
			on:click={toggleMenu}
		/>
		<!-- {/if} -->
	</div>
</header>

{#if $isMenuOpen}
	<div
		class="absolute inset-0 z-[10000] transition-colors duration-500"
		class:bg-dark={$currentSection.theme === 'dark'}
		class:bg-light={$currentSection.theme === 'light'}
		in:fade={{ duration: 400 }}
		out:fade={{ duration: 400 }}
	></div>
{/if}

{#if $isMenuOpen}
	<div
		class=" fixed bottom-0 z-[10000] flex flex-col overflow-hidden px-4"
		style="top: {$mediaQuery.md
			? HEADER.height.desktop
			: HEADER.height
					.mobile}px; max-width: 1440px; left: 50%; transform: translateX(-50%); width: 100%;"
	>
		<div
			class="relative z-[1] mb-4 flex flex-grow flex-col overflow-y-scroll rounded-b-[15px] border-x border-b transition-colors duration-500"
			class:border-light={$currentSection.theme === 'dark'}
			class:border-dark={$currentSection.theme === 'light'}
			in:fly={{ y: '-100%', duration: 500, opacity: 0 }}
			out:fly={{ y: '-100%', duration: 500, opacity: 0 }}
		>
			<div>
				<div
					target="_blank"
					rel="noopener noreferrer"
					class={cn(
						'border-border group relative flex h-14 flex-shrink-0 cursor-not-allowed items-center overflow-hidden border-b px-4 transition-all duration-500',
						$currentSection.theme === 'dark' ? 'bg-dark hover:bg-light' : 'bg-light  hover:bg-dark'
					)}
					class:border-light={$currentSection.theme === 'dark'}
					class:border-dark={$currentSection.theme === 'light'}
				>
					<span
						class={cn(
							'relative z-10 flex items-center gap-2 transition-all  duration-500',
							$currentSection.theme === 'dark'
								? 'text-light group-hover:text-dark'
								: 'text-dark group-hover:text-light'
						)}
					>
						<Nullmask className="text-inherit h-6 w-6" />
						<p class="">Use NullMask (Soon)</p>
					</span>
				</div>

				<a
					href={SOCIALS.x}
					target="_blank"
					rel="noopener noreferrer"
					class={cn(
						'border-border group relative flex h-14 flex-shrink-0 items-center overflow-hidden border-b px-4 transition-all duration-500',
						$currentSection.theme === 'dark' ? 'bg-dark hover:bg-light' : 'bg-light  hover:bg-dark'
					)}
					class:border-light={$currentSection.theme === 'dark'}
					class:border-dark={$currentSection.theme === 'light'}
				>
					<span
						class={cn(
							'relative z-10 flex items-center gap-2 transition-all  duration-500',
							$currentSection.theme === 'dark'
								? 'text-light group-hover:text-dark'
								: 'text-dark group-hover:text-light'
						)}
					>
						<XLogo className="text-inherit h-6 w-6" />
						<p>Join Our Community</p>
					</span>
				</a>

				<a
					href={SOCIALS.tg}
					target="_blank"
					rel="noopener noreferrer"
					class={cn(
						'border-border group relative flex h-14 flex-shrink-0 items-center overflow-hidden border-b px-4 transition-all duration-500',
						$currentSection.theme === 'dark' ? 'bg-dark hover:bg-light' : 'bg-light  hover:bg-dark'
					)}
					class:border-light={$currentSection.theme === 'dark'}
					class:border-dark={$currentSection.theme === 'light'}
				>
					<span
						class={cn(
							'relative z-10 flex items-center gap-2 transition-all  duration-500',
							$currentSection.theme === 'dark'
								? 'text-light group-hover:text-dark'
								: 'text-dark group-hover:text-light'
						)}
					>
						<TgLogo className="text-inherit h-6 w-6" />
						<p>Be the first to know</p>
					</span>
				</a>

				<a
					href={SOCIALS.email}
					class={cn(
						'border-border group relative flex h-14 flex-shrink-0 items-center overflow-hidden border-b px-4 transition-all duration-500',
						$currentSection.theme === 'dark' ? 'bg-dark hover:bg-light' : 'bg-light  hover:bg-dark'
					)}
					class:border-light={$currentSection.theme === 'dark'}
					class:border-dark={$currentSection.theme === 'light'}
				>
					<span
						class={cn(
							'relative z-10 flex items-center gap-2 transition-all duration-500',
							$currentSection.theme === 'dark'
								? 'text-light group-hover:text-dark'
								: 'text-dark group-hover:text-light'
						)}
					>
						<Email className="text-inherit h-6 w-6" />
						<p>Business Inquiries</p>
					</span>
				</a>
			</div>
		</div>
	</div>
{/if}
