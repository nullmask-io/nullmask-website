<script>
	import CopyButton from './CopyButton.svelte'
	import { etherscanAddress } from './addresses'

	export let address = ''
	/** Name used in the copy button's accessible label. */
	export let label = ''
	/** Optional short tag shown before the address, e.g. "Relayer 1". */
	export let tag = ''
</script>

<div class="line">
	{#if tag}<span class="tag">{tag}</span>{/if}
	<code class="addr">{address}</code>
	<span class="actions">
		<CopyButton value={address} label="{label} address" />
		<a
			class="ext"
			href={etherscanAddress(address)}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="View {label} on Etherscan"
		>
			Etherscan
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M7 17 17 7" />
				<path d="M8 7h9v9" />
			</svg>
		</a>
	</span>
</div>

<style>
	.line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 12px;
	}
	.tag {
		flex-shrink: 0;
		min-width: 74px;
		font-size: 13px;
		opacity: 0.65;
	}
	.addr {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 14px;
		letter-spacing: 0.01em;
		word-break: break-all;
		user-select: all;
		-webkit-user-select: all;
	}
	.actions {
		display: inline-flex;
		gap: 6px;
		margin-left: auto;
	}
	.ext {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 30px;
		padding: 0 10px;
		border-radius: 8px;
		font-size: 13px;
		line-height: 1;
		background: var(--primary-dark);
		color: var(--primary-light);
		white-space: nowrap;
		transition: opacity 0.2s;
	}
	.ext:hover {
		opacity: 0.82;
	}
	.ext:focus-visible {
		outline: 2px solid var(--primary-dark);
		outline-offset: 2px;
	}
	.ext svg {
		width: 13px;
		height: 13px;
	}

	@media (max-width: 767px) {
		.addr {
			font-size: 12.5px;
			flex-basis: 100%;
		}
		.tag {
			flex-basis: 100%;
			margin-bottom: -4px;
		}
		.actions {
			margin-left: 0;
		}
	}
</style>
