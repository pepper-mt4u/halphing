import type { CountdownGameTypes } from '../../../artifacts/ts/CountdownGame'
import { attoToAlph, formatAddressWithYou } from '../lib/utils'
import type { TimerPart } from '../types'

type HomePageProps = {
  isLoading: boolean
  currentLeader: string
  walletAddress: string | undefined
  state: CountdownGameTypes.Fields | undefined
  timerParts: TimerPart[]
  halvedCount: number
  pot: bigint
  prizePot: bigint
  totalSavings: bigint
  currentPlayCost: bigint
  doublePlayCost: bigint
  isRoundActive: boolean
  isExpired: boolean
  status: string
  canPlay: boolean
  isBusy: boolean
  hasEnoughForSingle: boolean
  hasEnoughForDouble: boolean
  playing: boolean
  playingDouble: boolean
  confirming: boolean
  play: (isDouble?: boolean) => Promise<void>
  connect: () => void
  formatUsd: (attoAlph: bigint) => string
}

export function HomePage({
  isLoading,
  currentLeader,
  walletAddress,
  timerParts,
  halvedCount,
  pot,
  prizePot,
  totalSavings,
  currentPlayCost,
  doublePlayCost,
  isRoundActive,
  isExpired,
  status,
  canPlay,
  isBusy,
  hasEnoughForSingle,
  hasEnoughForDouble,
  playing,
  playingDouble,
  confirming,
  play,
  connect,
  formatUsd,
}: HomePageProps) {
  const timerActive = isRoundActive && !isExpired

  return (
    <div className="space-y-3">

      {/* Main Game Card */}
      <div className="pixel-box pixel-enter px-5 py-6 sm:px-8 sm:py-8">

        {/* Emperor */}
        <div className="pixel-panel mb-5 px-4 py-4">
          <p className="font-pixel mb-2" style={{ fontSize: '0.38rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>
            ⚔ CURRENT EMPEROR
          </p>
          {isLoading ? (
            <p className="font-mono text-sm" style={{ color: 'var(--text-dim)' }}>—</p>
          ) : currentLeader ? (
            <p className="font-mono break-all text-sm" style={{ color: 'var(--text)' }}>
              {formatAddressWithYou(currentLeader, walletAddress)}
            </p>
          ) : (
            <p className="font-vt text-xl italic" style={{ color: 'var(--text-dim)' }}>
              The throne is vacant
            </p>
          )}
        </div>

        <div className="pixel-divider mb-5" />

        {/* Timer */}
        <div className="mb-4">
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {timerParts.map((part) => (
              <div key={part.unit} className="pixel-panel text-center px-3 py-3" style={{ minWidth: 68 }}>
                <p
                  className={`font-vt tabular-nums leading-none ${timerActive ? 'crt-red' : ''}`}
                  style={{ fontSize: '3rem', color: timerActive ? undefined : 'var(--text-dim)' }}
                >
                  {part.value}
                </p>
                <p className="font-pixel mt-1" style={{ fontSize: '0.36rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                  {part.unit.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="font-pixel" style={{ fontSize: '0.36rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
              HALVED {halvedCount}×
            </p>
            <p className="font-vt mt-0.5" style={{ fontSize: '0.9rem', color: 'rgba(232,224,208,0.25)', letterSpacing: '0.1em' }}>
              Each play halves the timer · adds 30s
            </p>
          </div>
        </div>

        <div className="pixel-divider mb-5" />

        {/* Opulentia + Tributum */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="pixel-panel-gold px-4 py-4 text-center">
            <p className="font-pixel mb-2" style={{ fontSize: '0.34rem', color: 'rgba(200,150,12,0.75)', letterSpacing: '0.2em' }}>
              OPULENTIA
            </p>
            <p className="font-vt tabular-nums leading-none crt-gold" style={{ fontSize: '2.5rem' }}>
              {attoToAlph(pot, 2)}
            </p>
            <p className="font-pixel mt-1" style={{ fontSize: '0.32rem', color: 'var(--text-dim)' }}>ALPH</p>
            {formatUsd(pot) && (
              <p className="font-vt mt-1" style={{ fontSize: '0.9rem', color: 'rgba(255,50,0,0.65)' }}>{formatUsd(pot)}</p>
            )}
            <p className="font-pixel mt-2" style={{ fontSize: '0.3rem', color: 'rgba(232,224,208,0.22)' }}>TOTAL PRIZE POOL</p>
          </div>
          <div className="pixel-panel px-4 py-4 text-center">
            <p className="font-pixel mb-2" style={{ fontSize: '0.34rem', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>
              TRIBUTUM
            </p>
            <p className="font-vt tabular-nums leading-none" style={{ fontSize: '2.5rem', color: 'var(--text)' }}>
              {attoToAlph(currentPlayCost, 2)}
            </p>
            <p className="font-pixel mt-1" style={{ fontSize: '0.32rem', color: 'var(--text-dim)' }}>ALPH</p>
            {formatUsd(currentPlayCost) && (
              <p className="font-vt mt-1" style={{ fontSize: '0.9rem', color: 'rgba(232,224,208,0.35)' }}>{formatUsd(currentPlayCost)}</p>
            )}
            <p className="font-pixel mt-2" style={{ fontSize: '0.3rem', color: 'rgba(232,224,208,0.22)' }}>ENTRY FEE</p>
          </div>
        </div>

        {/* Status */}
        {status.length > 0 && (
          <div className="pixel-panel-red mb-4 px-4 py-3 text-center">
            <p className="font-vt text-lg crt-red tracking-wide">{status}</p>
          </div>
        )}

        {/* Expired */}
        {isExpired && (
          <div className="pixel-panel-gold mb-4 px-4 py-4 text-center">
            <p className="font-pixel mb-1" style={{ fontSize: '0.5rem', color: 'var(--gold-lit)', letterSpacing: '0.08em' }}>
              ★ TIME'S UP ★
            </p>
            <p className="font-vt text-lg" style={{ color: 'rgba(232,224,208,0.7)' }}>
              {currentLeader ? formatAddressWithYou(currentLeader, walletAddress) : '—'} wins{' '}
              {attoToAlph(prizePot, 2)} ALPH · Play to claim &amp; start a new round
            </p>
          </div>
        )}

        {/* No active round */}
        {!isRoundActive && !isExpired && (
          <div className="pixel-panel mb-4 px-4 py-4 text-center">
            <p className="font-pixel mb-1" style={{ fontSize: '0.46rem', color: 'rgba(232,224,208,0.65)', letterSpacing: '0.08em' }}>
              THE COLOSSEUM AWAITS
            </p>
            <p className="font-vt text-lg" style={{ color: 'var(--text-dim)' }}>
              Be the first to start a new round and claim the throne
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => walletAddress ? play(false) : connect()}
            disabled={walletAddress ? (!canPlay || isBusy || !hasEnoughForSingle) : false}
            className={`btn-pixel-red ${timerActive ? 'pixel-pulse' : ''}`}
          >
            {!walletAddress
              ? 'CONNECT WALLET'
              : !hasEnoughForSingle
                ? 'INSUFFICIENT TRIBUTE'
                : playing
                  ? 'SUBMITTING...'
                  : confirming && !playingDouble
                    ? 'CONFIRMING...'
                    : isExpired
                      ? `CLAIM + NEW ROUND · ${attoToAlph(currentPlayCost, 2)} ALPH`
                      : !isRoundActive
                        ? `START NEW ROUND · ${attoToAlph(currentPlayCost, 2)} ALPH`
                        : `ENTER ARENA · ${attoToAlph(currentPlayCost, 2)} ALPH`}
          </button>

          {isRoundActive && !isExpired && (
            <>
              <button
                onClick={() => walletAddress ? play(true) : connect()}
                disabled={walletAddress ? (!canPlay || isBusy || !hasEnoughForDouble) : false}
                className="btn-pixel-gold"
              >
                ⚡{' '}
                {!walletAddress
                  ? 'CONNECT WALLET'
                  : !hasEnoughForDouble
                    ? 'NEED MORE ALPH'
                    : playingDouble
                      ? 'SUBMITTING...'
                      : confirming && playingDouble
                        ? 'CONFIRMING...'
                        : `DOUBLE DOWN · ${attoToAlph(doublePlayCost, 2)} ALPH`}
              </button>
              <p className="font-pixel text-center" style={{ fontSize: '0.32rem', color: 'rgba(232,224,208,0.25)', letterSpacing: '0.08em' }}>
                DOUBLE DOWN QUARTERS THE TIMER (÷4)
              </p>
            </>
          )}
        </div>

        {walletAddress && !hasEnoughForSingle && (
          <p className="font-vt mt-3 text-center text-lg" style={{ color: 'rgba(232,224,208,0.4)' }}>
            Need at least {attoToAlph(currentPlayCost, 2)} ALPH to enter
          </p>
        )}

      </div>

      {/* Prize Split */}
      <div className="grid grid-cols-2 gap-3">
        <div className="pixel-box px-4 py-5 text-center">
          <p className="font-pixel mb-1" style={{ fontSize: '0.32rem', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>PRIZE POT</p>
          <p className="font-vt tabular-nums crt-gold" style={{ fontSize: '2rem' }}>{attoToAlph(prizePot, 2)}</p>
          <p className="font-pixel" style={{ fontSize: '0.3rem', color: 'var(--text-dim)' }}>ALPH</p>
          {formatUsd(prizePot) && (
            <p className="font-vt mt-1" style={{ fontSize: '0.9rem', color: 'rgba(255,50,0,0.55)' }}>{formatUsd(prizePot)}</p>
          )}
          <p className="font-pixel mt-2" style={{ fontSize: '0.28rem', color: 'rgba(232,224,208,0.22)' }}>80% TO WINNER</p>
        </div>
        <div className="pixel-box px-4 py-5 text-center">
          <p className="font-pixel mb-1" style={{ fontSize: '0.32rem', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>NEXT SEED</p>
          <p className="font-vt tabular-nums" style={{ fontSize: '2rem', color: 'var(--text)' }}>{attoToAlph(totalSavings, 2)}</p>
          <p className="font-pixel" style={{ fontSize: '0.3rem', color: 'var(--text-dim)' }}>ALPH</p>
          {formatUsd(totalSavings) && (
            <p className="font-vt mt-1" style={{ fontSize: '0.9rem', color: 'rgba(232,224,208,0.28)' }}>{formatUsd(totalSavings)}</p>
          )}
          <p className="font-pixel mt-2" style={{ fontSize: '0.28rem', color: 'rgba(232,224,208,0.22)' }}>20% SEEDS NEXT ROUND</p>
        </div>
      </div>

    </div>
  )
}
