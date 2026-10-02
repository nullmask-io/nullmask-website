<script>
	import { onMount } from 'svelte'

	import { currentSection } from '$lib/Stores/currentSection'
	import CopyButton from '$lib/compliance/CopyButton.svelte'
	import AddressLine from '$lib/compliance/AddressLine.svelte'
	import {
		CHAIN,
		CONTRACTS,
		ETHERSCAN,
		OPERATIONAL,
		addressesCsv,
		etherscanAddress
	} from '$lib/compliance/addresses'
	// Rendered as-is: the signature only verifies against these exact bytes
	import statement from '$lib/compliance/ownership-statement.json'

	const CONTACT = 'compliance@nullmask.io'
	const UPDATED = '2026-10-01'

	const meta = {
		title: 'Compliance | Nullmask',
		description:
			'Nullmask on-chain addresses on Ethereum mainnet, how deposits are screened, and the contact for law enforcement and regulators.'
	}

	const sections = [
		{ id: 'law-enforcement', title: 'Law enforcement contact' },
		{ id: 'contracts', title: 'Contract addresses' },
		{ id: 'operational', title: 'Operational addresses' },
		{ id: 'screening', title: 'How deposits are screened' },
		{ id: 'security', title: 'Security' },
		{ id: 'ownership', title: 'Proof of ownership' }
	]

	// Single quotes keep the multi-line message literal in any POSIX shell
	const shellQuote = (s) => `'${s.replace(/'/g, `'\\''`)}'`
	const castCommand = `cast wallet verify --address ${statement.address} ${shellQuote(statement.message)} ${statement.signature}`

	const csv = addressesCsv()

	// The page scrolls inside its own container (html and body are fixed),
	// so in-page links scroll that container rather than the window
	const jump = (event, id) => {
		const target = document.getElementById(id)
		if (!target) return
		event.preventDefault()
		target.scrollIntoView({ behavior: 'smooth', block: 'start' })
		history.replaceState(history.state, '', `#${id}`)
	}

	onMount(() => {
		// The header takes its colours from the section in view; this page is light
		currentSection.set({ index: 0, id: 'compliance', theme: 'light' })

		if (location.hash) {
			document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' })
		}
	})
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<link rel="canonical" href="https://nullmask.io/compliance" />
	<meta property="og:url" content="https://nullmask.io/compliance" />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:image:url" content="/thumbnail.webp" />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={meta.title} />
	<meta property="twitter:description" content={meta.description} />
</svelte:head>

<div class="page">
	<main class="doc">
		<header class="intro">
			<p class="eyebrow">Nullmask &middot; {CHAIN.name}</p>
			<h1>Compliance</h1>
			<p class="lead">
				Nullmask is a privacy protocol on {CHAIN.name} (chain ID {CHAIN.id}). Deposits are screened
				before they enter the pool. This page lists the protocol's on-chain addresses, explains how
				deposits are screened, and shows how to reach us.
			</p>

			<nav class="toc" aria-label="On this page">
				{#each sections as s}
					<a href="#{s.id}" on:click={(e) => jump(e, s.id)}>{s.title}</a>
				{/each}
			</nav>

			<div class="csv">
				<span>Labeling these addresses? Copy every address on this page in one go.</span>
				<CopyButton value={csv} label="all addresses as CSV" text="Copy all as CSV" />
			</div>
		</header>

		<!-- Law enforcement -->
		<section id="law-enforcement" class="card dark" aria-labelledby="law-enforcement-title">
			<h2 id="law-enforcement-title">Law enforcement contact</h2>
			<p class="sub">For law enforcement agencies and regulators.</p>

			<div class="contact">
				<a class="contact-mail" href="mailto:{CONTACT}">{CONTACT}</a>
				<CopyButton value={CONTACT} label="email address" tone="dark" />
			</div>

			<ul class="points">
				<li>
					We respond to requests from law enforcement and regulators sent from an official government
					email address together with the relevant legal process.
				</li>
				<li>We acknowledge verified requests within 72 hours.</li>
				<li>
					Urgent requests involving an imminent risk to life are handled first. Mark them
					<strong>URGENT</strong> in the subject line.
				</li>
				<li>
					We cooperate with valid legal process and provide the information available to us, as
					required by applicable law.
				</li>
				<li>
					Deposits that fail screening are refused before they are credited and returned to the
					sending address.
				</li>
			</ul>
		</section>

		<!-- Contracts -->
		<section id="contracts" class="block" aria-labelledby="contracts-title">
			<div class="block-head">
				<h2 id="contracts-title">Contract addresses</h2>
				<p class="facts">
					<span>{CHAIN.name}, chain ID {CHAIN.id}</span>
					<span
						>Deployed at block
						<a href="{ETHERSCAN}/block/{CHAIN.deployBlock}" target="_blank" rel="noopener noreferrer"
							>{CHAIN.deployBlock}</a
						></span
					>
					<span>Source verified on Etherscan</span>
				</p>
			</div>

			<div class="card list">
				{#each CONTRACTS as item}
					<div class="row">
						<div class="row-info">
							<h3>{item.name}</h3>
							<span class="kind">{item.kind}</span>
							{#if item.note}<p class="note">{item.note}</p>{/if}
						</div>
						<div class="row-addrs">
							{#each item.addresses as address}
								<AddressLine {address} label={item.name} />
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Operational -->
		<section id="operational" class="block" aria-labelledby="operational-title">
			<div class="block-head">
				<h2 id="operational-title">Operational addresses</h2>
				<p class="facts"><span>Accounts the protocol operates on {CHAIN.name}</span></p>
			</div>

			<div class="card list">
				{#each OPERATIONAL as item}
					<div class="row">
						<div class="row-info">
							<h3>{item.name}</h3>
							{#if item.addresses.length > 1}<span class="kind">{item.addresses.length} addresses</span
								>{/if}
							{#if item.note}<p class="note">{item.note}</p>{/if}
						</div>
						<div class="row-addrs">
							{#each item.addresses as address, i}
								{#if item.addresses.length > 1}
									<AddressLine
										{address}
										label="{item.name.replace(/s$/, '')} {i + 1}"
										tag="{item.name.replace(/s$/, '')} {i + 1}"
									/>
								{:else}
									<AddressLine {address} label={item.name} />
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Screening -->
		<section id="screening" class="block" aria-labelledby="screening-title">
			<div class="block-head">
				<h2 id="screening-title">How deposits are screened</h2>
				<p class="facts"><span>Performed by the Guard before a deposit is credited</span></p>
			</div>

			<div class="card">
				<ol class="steps">
					<li>
						<strong>Pending first.</strong> Every deposit first waits in the contract as pending. Nothing
						enters the pool until the Guard approves it.
					</li>
					<li>
						<strong>ETH and USDT only.</strong> These are the only accepted assets; the contract refuses
						any other token.
					</li>
					<li>
						<strong>Sanctions and blocklists.</strong> Each depositor address is checked against sanctions
						and blocklists: OFAC SDN, the Chainalysis sanctions oracle, EU and UK sanctions lists, the
						USDT and USDC issuer blacklists, and public scam lists. It is also risk-scored by AMLBot.
					</li>
					<li>
						<strong>Refusal criteria.</strong> Deposits linked to sanctions, stolen funds, hacks, darknet
						markets, scams, ransomware, terrorism financing, child exploitation or other illicit activity,
						or with a risk score above our threshold, are refused.
					</li>
					<li>
						<strong>Quarantine.</strong> New funds wait in a short quarantine before they are credited.
					</li>
					<li>
						<strong>Refunds.</strong> A refused deposit is never credited: the contract returns it to the
						sending address. A depositor can also take back a pending deposit at any time.
					</li>
					<li>
						<strong>Ongoing monitoring.</strong> Depositor addresses stay under ongoing AMLBot monitoring.
					</li>
				</ol>
			</div>
		</section>

		<!-- Security -->
		<section id="security" class="block" aria-labelledby="security-title">
			<div class="block-head">
				<h2 id="security-title">Security</h2>
			</div>
			<div class="card">
				<p class="text">
					The contracts are verified on Etherscan with full source code. An independent audit report
					will be published on this page when it is completed.
				</p>
			</div>
		</section>

		<!-- Ownership -->
		<section id="ownership" class="block" aria-labelledby="ownership-title">
			<div class="block-head">
				<h2 id="ownership-title">Proof of ownership</h2>
				<p class="facts">
					<span>A statement signed by the deployer key (EIP-191 personal_sign)</span>
				</p>
			</div>

			<div class="card proof">
				<div class="field">
					<div class="field-head">
						<h3>Signer address</h3>
					</div>
					<AddressLine address={statement.address} label="Deployer" />
				</div>

				<div class="field">
					<div class="field-head">
						<h3>Message</h3>
						<CopyButton value={statement.message} label="signed message" text="Copy message" />
					</div>
					<pre class="message">{statement.message}</pre>
				</div>

				<div class="field">
					<div class="field-head">
						<h3>Signature</h3>
						<CopyButton value={statement.signature} label="signature" text="Copy signature" />
					</div>
					<code class="sig">{statement.signature}</code>
				</div>

				<div class="field verify">
					<h3>How to verify</h3>
					<ol class="how">
						<li>
							Open Etherscan's
							<a href="{ETHERSCAN}/verifiedSignatures" target="_blank" rel="noopener noreferrer"
								>Verified Signatures</a
							>
							page, choose Verify Signature and paste the signer address, the message and the signature. Use the copy buttons above:
							the message must match exactly, including line breaks.
						</li>
						<li>
							Or, with Foundry:
							<code class="cmd">cast wallet verify --address &lt;address&gt; "&lt;message&gt;" &lt;signature&gt;</code>
							<span class="cmd-copy">
								<CopyButton
									value={castCommand}
									label="ready-to-run cast command"
									text="Copy full command"
								/>
								<span class="hint">with the address, message and signature filled in</span>
							</span>
						</li>
					</ol>
					<p class="hint">
						Signer on Etherscan:
						<a href={etherscanAddress(statement.address)} target="_blank" rel="noopener noreferrer"
							>{statement.address}</a
						>
					</p>
				</div>
			</div>
		</section>

		<footer class="foot">
			<span>Last updated {UPDATED}</span>
			<a href="mailto:{CONTACT}">{CONTACT}</a>
		</footer>
	</main>
</div>

<style>
	.page {
		position: relative;
		height: 100%;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		background: var(--primary-light);
		color: var(--primary-dark);
	}

	.doc {
		max-width: 1000px;
		margin: 0 auto;
		/* clear the fixed header (80px phone / 106px desktop) */
		padding: 104px 16px 40px;
	}

	section {
		scroll-margin-top: 100px;
	}

	a {
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-thickness: 1px;
	}

	/* Intro */
	.eyebrow {
		font-size: 13px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.65;
		margin-bottom: 8px;
	}
	h1 {
		font-size: 40px;
		line-height: 1.05;
		margin-bottom: 16px;
	}
	.lead {
		font-size: 16px;
		line-height: 1.6;
		max-width: 720px;
	}

	.toc {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 20px;
	}
	.toc a {
		text-decoration: none;
		font-size: 13px;
		line-height: 1;
		padding: 8px 12px;
		border: 1px solid var(--primary-dark);
		border-radius: 999px;
		transition:
			background-color 0.2s,
			color 0.2s;
	}
	.toc a:hover {
		background: var(--primary-dark);
		color: var(--primary-light);
	}

	.csv {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 12px;
		margin-top: 16px;
		font-size: 14px;
		opacity: 0.9;
	}

	/* Cards */
	.card {
		border: 1px solid var(--primary-dark);
		border-radius: 15px;
		padding: 16px;
	}
	.card.dark {
		background: var(--primary-dark);
		color: var(--primary-light);
		border-color: var(--primary-dark);
		margin-top: 28px;
	}

	h2 {
		font-size: 24px;
		line-height: 1.2;
	}
	h3 {
		font-size: 16px;
		font-weight: 600;
		line-height: 1.3;
	}

	.block {
		margin-top: 40px;
	}
	.block-head {
		margin-bottom: 14px;
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 2px 16px;
		margin-top: 6px;
		font-size: 14px;
		opacity: 0.75;
	}

	/* Law enforcement card */
	.sub {
		margin-top: 4px;
		font-size: 14px;
		opacity: 0.75;
	}
	.contact {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 14px;
		margin: 18px 0 20px;
	}
	.contact-mail {
		color: var(--primaty-green);
		font-size: 22px;
		font-weight: 500;
		word-break: break-all;
	}
	.points {
		display: grid;
		gap: 10px;
		font-size: 15px;
		line-height: 1.55;
	}
	.points li {
		position: relative;
		padding-left: 20px;
	}
	.points li::before {
		content: '';
		position: absolute;
		left: 2px;
		top: 0.62em;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--primaty-green);
	}

	/* Address lists */
	.list {
		padding: 0;
	}
	.row {
		display: grid;
		gap: 10px;
		padding: 16px;
	}
	.row + .row {
		border-top: 1px solid rgba(32, 34, 33, 0.18);
	}
	.row-info {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 8px;
		min-width: 0;
	}
	.row-info h3 {
		word-break: break-word;
	}
	.kind {
		font-size: 12px;
		line-height: 1;
		padding: 4px 7px;
		border-radius: 6px;
		background: rgba(32, 34, 33, 0.08);
	}
	.note {
		flex-basis: 100%;
		font-size: 14px;
		line-height: 1.5;
		opacity: 0.75;
	}
	.row-addrs {
		display: grid;
		gap: 12px;
		min-width: 0;
	}

	/* Screening */
	.steps {
		display: grid;
		gap: 14px;
		counter-reset: step;
		font-size: 15px;
		line-height: 1.6;
	}
	.steps li {
		position: relative;
		padding-left: 38px;
		counter-increment: step;
	}
	.steps li::before {
		content: counter(step);
		position: absolute;
		left: 0;
		top: 1px;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--primary-dark);
		color: var(--primaty-green);
		font-size: 13px;
		font-weight: 600;
		line-height: 26px;
		text-align: center;
	}

	.text {
		font-size: 15px;
		line-height: 1.6;
	}

	/* Proof of ownership */
	.proof {
		display: grid;
		gap: 22px;
	}
	.field {
		display: grid;
		gap: 10px;
		min-width: 0;
	}
	.field-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.message,
	.sig,
	.cmd {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
	}
	.message {
		margin: 0;
		padding: 14px;
		border-radius: 10px;
		background: rgba(32, 34, 33, 0.06);
		border: 1px solid rgba(32, 34, 33, 0.18);
		font-size: 13px;
		line-height: 1.6;
		/* wrap long lines on screen; the copy button uses the exact text */
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		max-width: 100%;
	}
	.sig {
		display: block;
		padding: 12px 14px;
		border-radius: 10px;
		background: rgba(32, 34, 33, 0.06);
		border: 1px solid rgba(32, 34, 33, 0.18);
		font-size: 13px;
		line-height: 1.55;
		word-break: break-all;
	}
	.verify {
		padding-top: 18px;
		border-top: 1px solid rgba(32, 34, 33, 0.18);
	}
	.how {
		display: grid;
		gap: 14px;
		list-style: decimal;
		padding-left: 20px;
		font-size: 15px;
		line-height: 1.6;
	}
	.cmd {
		display: block;
		margin-top: 8px;
		padding: 10px 12px;
		border-radius: 10px;
		background: var(--primary-dark);
		color: var(--primary-light);
		font-size: 13px;
		line-height: 1.5;
		overflow-wrap: anywhere;
	}
	.cmd-copy {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 10px;
		margin-top: 10px;
	}
	.hint {
		font-size: 13px;
		opacity: 0.7;
		overflow-wrap: anywhere;
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px 16px;
		margin-top: 40px;
		padding-top: 16px;
		border-top: 1px solid rgba(32, 34, 33, 0.25);
		font-size: 13px;
		opacity: 0.8;
	}

	@media (min-width: 768px) {
		.doc {
			padding: 146px 32px 56px;
		}
		section {
			scroll-margin-top: 126px;
		}
		h1 {
			font-size: 60px;
			margin-bottom: 20px;
		}
		.lead {
			font-size: 18px;
		}
		h2 {
			font-size: 30px;
		}
		.card {
			padding: 28px;
		}
		.card.dark {
			margin-top: 36px;
		}
		.contact-mail {
			font-size: 30px;
		}
		.points {
			font-size: 16px;
		}
		.block {
			margin-top: 56px;
		}
		.list {
			padding: 0;
		}
		.row {
			grid-template-columns: 230px minmax(0, 1fr);
			gap: 20px;
			padding: 20px 28px;
		}
		.row-info {
			flex-direction: column;
			align-items: flex-start;
			gap: 6px;
		}
		.note {
			flex-basis: auto;
		}
		.steps,
		.text,
		.how {
			font-size: 16px;
		}
		.message {
			padding: 18px 20px;
			font-size: 14px;
		}
	}
</style>
