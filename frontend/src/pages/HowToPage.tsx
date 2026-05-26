export function HowToPage() {
  return (
    <div className="tectonic-plate tectonic-enter px-6 py-8 sm:px-10 sm:py-10">

      <h2 className="font-cinzel mb-8 text-center text-xl font-semibold tracking-[0.2em] text-[#E0E0E0] engraved sm:text-2xl">
        How to Play
      </h2>

      <div className="space-y-0">

        {/* The Game */}
        <section className="pb-7">
          <h3 className="font-cinzel mb-3 text-base font-semibold tracking-wider text-[#D4AF37]">
            The Game
          </h3>
          <p className="mb-2 text-sm leading-relaxed text-[rgba(224,224,224,0.65)]">
            The hALPHing is a timer-halving survival game on Alephium blockchain. A countdown timer
            starts at ~2026 years. Each time someone plays, the timer is{' '}
            <strong className="text-[rgba(224,224,224,0.9)]">halved</strong> and that player becomes
            the current leader.
          </p>
          <p className="text-sm leading-relaxed text-[rgba(224,224,224,0.65)]">
            When the timer runs out, the last leader{' '}
            <strong className="text-[rgba(224,224,224,0.9)]">wins 80%</strong> of the pot. The
            remaining 20% seeds the next round.
          </p>
        </section>

        <div className="fault-line mb-7" />

        {/* How to Enter */}
        <section className="pb-7">
          <h3 className="font-cinzel mb-3 text-base font-semibold tracking-wider text-[#D4AF37]">
            How to Enter
          </h3>
          <div className="space-y-2">
            <div
              className="tectonic-panel px-4 py-3"
            >
              <p className="text-sm text-[rgba(224,224,224,0.7)]">
                <strong className="text-[rgba(224,224,224,0.9)]">Enter the Arena</strong> — Pay the
                entry fee to halve the timer (÷2) and become leader
              </p>
            </div>
            <div className="tectonic-panel px-4 py-3">
              <p className="text-sm text-[rgba(224,224,224,0.7)]">
                <strong className="text-[rgba(224,224,224,0.9)]">Double Down</strong> — Pay 2× the
                entry fee to quarter the timer (÷4) and become leader
              </p>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-[rgba(224,224,224,0.32)]">
            Entry fee starts at 5 ALPH · increases 1% after each round settles
          </p>
        </section>

        <div className="fault-line mb-7" />

        {/* Predicting */}
        <section className="pb-7">
          <h3 className="font-cinzel mb-3 text-base font-semibold tracking-wider text-[#D4AF37]">
            Predicting
          </h3>
          <p className="text-sm leading-relaxed text-[rgba(224,224,224,0.65)]">
            Bet on who you think will win the current round. Place predictions on any player who has
            entered the arena. If your chosen player wins, you receive a proportional share of the
            prediction pool based on your stake.
          </p>
        </section>

        <div className="fault-line mb-7" />

        {/* Getting ALPH */}
        <section className="pb-7">
          <h3 className="font-cinzel mb-3 text-base font-semibold tracking-wider text-[#D4AF37]">
            Getting ALPH
          </h3>
          <p className="mb-4 text-sm text-[rgba(224,224,224,0.65)]">
            To play, you need ALPH — Alephium's native token.
          </p>
          <ol className="space-y-3">
            {[
              {
                n: '01',
                title: 'Install a Wallet',
                body: (
                  <>
                    Download the{' '}
                    <a
                      href="https://alephium.org/wallets"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-b border-[rgba(212,175,55,0.4)] text-[#D4AF37] transition hover:border-[#D4AF37]"
                    >
                      Alephium Extension Wallet
                    </a>{' '}
                    for your browser
                  </>
                ),
              },
              {
                n: '02',
                title: 'Buy ALPH',
                body: (
                  <>
                    Purchase on{' '}
                    {[
                      { label: 'Gate.io', href: 'https://www.gate.io/' },
                      { label: 'MEXC', href: 'https://www.mexc.com/' },
                      { label: 'Bitget', href: 'https://www.bitget.com/' },
                    ].map(({ label, href }, i, arr) => (
                      <span key={label}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-b border-[rgba(212,175,55,0.4)] text-[#D4AF37] transition hover:border-[#D4AF37]"
                        >
                          {label}
                        </a>
                        {i < arr.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </>
                ),
              },
              {
                n: '03',
                title: 'Withdraw to Wallet',
                body: 'Send ALPH to your wallet address',
              },
              {
                n: '04',
                title: 'Connect & Play',
                body: 'Click "Connect Wallet" and enter the arena',
              },
            ].map(({ n, title, body }) => (
              <li key={n} className="flex gap-4 text-sm">
                <span className="font-cinzel mt-0.5 flex-shrink-0 text-[10px] font-semibold tabular-nums text-[rgba(255,72,0,0.55)]">
                  {n}
                </span>
                <p className="text-[rgba(224,224,224,0.65)]">
                  <strong className="text-[rgba(224,224,224,0.88)]">{title}</strong> — {body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="fault-line mb-7" />

        {/* Strategy */}
        <section>
          <h3 className="font-cinzel mb-3 text-base font-semibold tracking-wider text-[rgba(224,224,224,0.5)]">
            Strategy
          </h3>
          <ul className="space-y-2 text-sm text-[rgba(224,224,224,0.45)]">
            {[
              'Early plays are cheap but leave a lot of time for others to react',
              'As the timer shrinks, the cost of each play rises — higher risk, higher reward',
              'Double Down is riskier but quarters the timer, giving opponents less time',
              'Watch the pot size — bigger pots draw more competition near the end',
            ].map((tip) => (
              <li key={tip} className="flex gap-3">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 bg-[rgba(255,72,0,0.4)]" />
                {tip}
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  )
}
