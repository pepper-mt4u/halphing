export function HowToPage() {
  return (
    <div className="pixel-box pixel-enter px-5 py-7 sm:px-8 sm:py-8">

      <p className="font-pixel mb-7 text-center" style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'var(--text)' }}>
        ⚔ CODEX ⚔
      </p>

      <div className="space-y-0">

        {/* The Game */}
        <section className="pb-6">
          <p className="font-pixel mb-3" style={{ fontSize: '0.44rem', color: 'var(--crt-red)', letterSpacing: '0.1em' }}>
            THE GAME
          </p>
          <p className="font-vt text-xl leading-relaxed" style={{ color: 'rgba(232,224,208,0.7)' }}>
            The hALPHing is a timer-halving survival game on Alephium blockchain. A countdown timer
            starts at ~2026 years. Each time someone plays, the timer is{' '}
            <span style={{ color: 'var(--text)' }}>halved</span> and that player becomes
            the current emperor.
          </p>
          <p className="font-vt text-xl leading-relaxed mt-2" style={{ color: 'rgba(232,224,208,0.7)' }}>
            When the timer runs out, the last emperor{' '}
            <span style={{ color: 'var(--text)' }}>wins 80%</span> of the pot. The
            remaining 20% seeds the next round.
          </p>
        </section>

        <div className="pixel-divider mb-6" />

        {/* How to Enter */}
        <section className="pb-6">
          <p className="font-pixel mb-3" style={{ fontSize: '0.44rem', color: 'var(--crt-red)', letterSpacing: '0.1em' }}>
            HOW TO ENTER
          </p>
          <div className="space-y-2">
            <div className="pixel-panel px-4 py-3">
              <p className="font-vt text-xl" style={{ color: 'rgba(232,224,208,0.75)' }}>
                <span style={{ color: 'var(--text)' }}>Enter the Arena</span> — Pay the
                entry fee to halve the timer (÷2) and become emperor
              </p>
            </div>
            <div className="pixel-panel px-4 py-3">
              <p className="font-vt text-xl" style={{ color: 'rgba(232,224,208,0.75)' }}>
                <span style={{ color: 'var(--text)' }}>Double Down</span> — Pay 2× the
                entry fee to quarter the timer (÷4) and become emperor
              </p>
            </div>
          </div>
          <p className="font-pixel mt-3" style={{ fontSize: '0.32rem', color: 'rgba(232,224,208,0.3)' }}>
            Entry fee starts at 5 ALPH · increases 1% after each round settles
          </p>
        </section>

        <div className="pixel-divider mb-6" />

        {/* Predicting */}
        <section className="pb-6">
          <p className="font-pixel mb-3" style={{ fontSize: '0.44rem', color: 'var(--crt-red)', letterSpacing: '0.1em' }}>
            PREDICTING
          </p>
          <p className="font-vt text-xl leading-relaxed" style={{ color: 'rgba(232,224,208,0.7)' }}>
            Bet on who you think will win the current round. Place predictions on any player who has
            entered the arena. If your chosen player wins, you receive a proportional share of the
            prediction pool based on your stake.
          </p>
        </section>

        <div className="pixel-divider mb-6" />

        {/* Getting ALPH */}
        <section className="pb-6">
          <p className="font-pixel mb-3" style={{ fontSize: '0.44rem', color: 'var(--crt-red)', letterSpacing: '0.1em' }}>
            GETTING ALPH
          </p>
          <p className="font-vt text-xl mb-4" style={{ color: 'rgba(232,224,208,0.7)' }}>
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
                      style={{
                        color: 'var(--gold-lit)',
                        borderBottom: '1px solid rgba(240,192,48,0.4)',
                        textDecoration: 'none',
                      }}
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
                          style={{
                            color: 'var(--gold-lit)',
                            borderBottom: '1px solid rgba(240,192,48,0.4)',
                            textDecoration: 'none',
                          }}
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
              <li key={n} className="flex gap-4">
                <span
                  className="font-pixel flex-shrink-0 mt-1"
                  style={{ fontSize: '0.4rem', color: 'rgba(255,50,0,0.6)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {n}
                </span>
                <p className="font-vt text-xl" style={{ color: 'rgba(232,224,208,0.7)' }}>
                  <span style={{ color: 'var(--text)' }}>{title}</span> — {body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="pixel-divider mb-6" />

        {/* Strategy */}
        <section>
          <p className="font-pixel mb-3" style={{ fontSize: '0.44rem', color: 'rgba(232,224,208,0.4)', letterSpacing: '0.1em' }}>
            STRATEGY
          </p>
          <ul className="space-y-2">
            {[
              'Early plays are cheap but leave a lot of time for others to react',
              'As the timer shrinks, the cost of each play rises — higher risk, higher reward',
              'Double Down is riskier but quarters the timer, giving opponents less time',
              'Watch the pot size — bigger pots draw more competition near the end',
            ].map((tip) => (
              <li key={tip} className="flex gap-3">
                <span className="mt-2 flex-shrink-0" style={{ width: 4, height: 4, background: 'rgba(255,50,0,0.45)', flexShrink: 0, marginTop: 10 }} />
                <p className="font-vt text-xl" style={{ color: 'rgba(232,224,208,0.45)' }}>{tip}</p>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  )
}
