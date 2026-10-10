<script>
	import { createEventDispatcher } from 'svelte'

	/** Groups of { path, href, title }, from src/lib/docs/nav.js */
	export let nav = []
	/** Path of the page on screen */
	export let current = ''
	/** Larger rows for fingers (the phone menu) */
	export let touch = false

	const dispatch = createEventDispatcher()
</script>

<ul class="groups" class:touch>
	{#each nav as group}
		<li class="group" class:titled={group.title}>
			{#if group.title}
				<p class="group-title">{group.title}</p>
			{/if}
			<ul>
				{#each group.pages as item (item.path)}
					<li>
						<a
							href={item.href}
							class="link"
							class:active={item.path === current}
							aria-current={item.path === current ? 'page' : undefined}
							on:click={() => dispatch('navigate')}>{item.title}</a
						>
					</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>

<style>
	.groups {
		display: grid;
		gap: 4px;
	}
	.group.titled {
		margin: 14px 0 6px;
	}
	.group-title {
		padding: 0 12px;
		margin-bottom: 6px;
		font-size: 11.5px;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		opacity: 0.6;
	}
	.link {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 7px 12px;
		border-radius: 10px;
		font-size: 14px;
		line-height: 1.35;
		transition:
			background-color 0.15s,
			color 0.15s;
	}
	.link:hover {
		background: rgba(32, 34, 33, 0.08);
	}
	.link.active {
		background: var(--primary-dark);
		color: var(--primary-light);
		font-weight: 500;
	}
	.touch .link {
		padding: 10px 12px;
		font-size: 15px;
	}
	.link.active::before {
		content: '';
		flex: none;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--primaty-green);
	}
</style>
