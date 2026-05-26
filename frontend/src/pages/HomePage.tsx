import { AnimatePresence, motion } from 'framer-motion'
import { Zap } from 'lucide-react'
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
  state,
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
    <div className="space-y-4">

      {/* Main Game Plate */}
      <div className="tectonic-plate tectonic-enter px-6 py-8 sm:px-10 sm:py-10">

        {/* Emperor */}
        <div className="tectonic-panel mb-6 px-5 py-4">
          <p className="mb-1.5 text-[9px] font-medium tracking-[0.32em] uppercase text-[rgba(212,175,55,0.65)]">
            Current Emperor
          </p>
          {isLoading ? (
            <p className="text-sm text-[rgba(224,224,224,0.3)]">—</p>
          ) : currentLeader ? (
            <p className="break-all font-mono text-sm text-[#E0E0E0] sm:text-base">
              {formatAddressWithYou(currentLeader, walletAddress)}
            </p>
          ) : (
            <p className="text-sm italic text-[rgba(224,224,224,0.3)]">The throne is empty</p>
          )}
        </div>

        <div className="fault-line mb-8" />

        {/* Timer */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={state?.currentDurationMs?.toString() ?? 'loading'}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 text-center"
          >
            <div
              className={`font-cinzel font-bold leading-none tracking-tight ${timerActive ? 'text-magma-glow' : 'engraved text-[rgba(224,224,224,0.5)]'}`}
              style={{ fontSize: 'clamp(2.2rem, 9vw, 5.5rem)' }}
            >
              <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-1">
                {timerParts.map((part) => (
                  <span key={part.unit} className="inline-flex items-end">
                    <span className="tabular-nums">{part.value}</span>
                    <span
                      className="ml-1 font-normal opacity-35"
                      style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.4rem)' }}
                    >
                      {part.unit}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mb-8 text-center">
          <p className="text-[10px] tracking-[0.22em] uppercase text-[rgba(224,224,224,0.3)]">
            halved {halvedCount}×
          </p>
          <p className="mt-0.5 text-[9px] text-[rgba(224,224,224,0.18)]">
            Each play halves the timer · adds 30s
          </p>
        </div>

        <div className="fault-line mb-8" />

        {/* Opulentia + Tributum */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="tectonic-panel px-4 py-5 text-center">
            <p className="mb-2 text-[8px] font-medium tracking-[0.36em] uppercase text-[#D4AF37]">
              Opulentia
            </p>
            <p className="font-cinzel text-2xl font-semibold text-[#E0E0E0] engraved sm:text-3xl tabular-nums">
              {attoToAlph(pot, 2)}
            </p>
            <p className="mt-0.5 text-[10px] text-[rgba(224,224,224,0.4)]">ALPH</p>
            {formatUsd(pot) && (
              <p className="mt-1.5 text-[9px] text-[rgba(255,72,0,0.65)]">{formatUsd(pot)}</p>
            )}
            <p className="mt-2 text-[8px] tracking-wider text-[rgba(224,224,224,0.18)]">
              Total prize pool
            </p>
          </div>
          <div className="tectonic-panel px-4 py-5 text-center">
            <p className="mb-2 text-[8px] font-medium tracking-[0.36em] uppercase text-[rgba(224,224,224,0.38)]">
              Tributum
            </p>
            <p className="font-cinzel text-2xl font-semibold text-[#E0E0E0] engraved sm:text-3xl tabular-nums">
              {attoToAlph(currentPlayCost, 2)}
            </p>
            <p className="mt-0.5 text-[10px] text-[rgba(224,224,224,0.4)]">ALPH</p>
            {formatUsd(currentPlayCost) && (
              <p className="mt-1.5 text-[9px] text-[rgba(224,224,224,0.28)]">
                {formatUsd(currentPlayCost)}
              </p>
            )}
            <p className="mt-2 text-[8px] tracking-wider text-[rgba(224,224,224,0.18)]">
              Current entry fee
            </p>
          </div>
        </div>

        {/* Status */}
        {status.length > 0 && (
          <div
            className="mb-5 border border-[rgba(255,72,0,0.3)] bg-[rgba(255,72,0,0.05)] px-4 py-3 text-center text-xs text-[#FF4800]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          >
            {status}
          </div>
        )}

        {/* Expired */}
        {isExpired && (
          <div
            className="mb-5 border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.04)] px-4 py-4 text-center"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          >
            <p className="font-cinzel text-sm font-semibold tracking-wide text-[#D4AF37]">
              Time's Up
            </p>
            <p className="mt-1 text-xs text-[rgba(224,224,224,0.55)]">
              {currentLeader ? formatAddressWithYou(currentLeader, walletAddress) : '—'} wins{' '}
              {attoToAlph(prizePot, 2)} ALPH · Play to claim &amp; start a new round
            </p>
          </div>
        )}

        {/* No active round */}
        {!isRoundActive && !isExpired && (
          <div
            className="mb-5 border border-[rgba(224,224,224,0.1)] bg-[rgba(224,224,224,0.03)] px-4 py-4 text-center"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          >
            <p className="font-cinzel text-sm font-semibold tracking-wide text-[rgba(224,224,224,0.7)]">
              The Coliseum awaits
            </p>
            <p className="mt-1 text-xs text-[rgba(224,224,224,0.38)]">
              Be the first to start a new round and claim the throne
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => walletAddress ? play(false) : connect()}
            disabled={walletAddress ? (!canPlay || isBusy || !hasEnoughForSingle) : false}
            className={`btn-magma ${timerActive ? 'magma-pulse' : ''}`}
          >
            {!walletAddress
              ? 'Connect Wallet to Play'
              : !hasEnoughForSingle
                ? 'Insufficient Tribute'
                : playing
                  ? 'Submitting...'
                  : confirming && !playingDouble
                    ? 'Confirming...'
                    : isExpired
                      ? `Claim & Start New Round · ${attoToAlph(currentPlayCost, 2)} ALPH`
                      : !isRoundActive
                        ? `Start a New Round · ${attoToAlph(currentPlayCost, 2)} ALPH`
                        : `Enter the Arena · ${attoToAlph(currentPlayCost, 2)} ALPH`}
          </button>

          {isRoundActive && !isExpired && (
            <>
              <button
                onClick={() => walletAddress ? play(true) : connect()}
                disabled={walletAddress ? (!canPlay || isBusy || !hasEnoughForDouble) : false}
                className="btn-gold"
              >
                <Zap size={13} />
                {!walletAddress
                  ? 'Connect Wallet'
                  : !hasEnoughForDouble
                    ? 'Need More ALPH'
                    : playingDouble
                      ? 'Submitting...'
                      : confirming && playingDouble
                        ? 'Confirming...'
                        : `Double Down · ${attoToAlph(doublePlayCost, 2)} ALPH`}
              </button>
              <p className="text-center text-[9px] tracking-wider text-[rgba(224,224,224,0.22)]">
                Double down quarters the timer (÷4)
              </p>
            </>
          )}
        </div>

        {walletAddress && !hasEnoughForSingle && (
          <p className="mt-3 text-center text-[10px] text-[rgba(224,224,224,0.35)]">
            Need at least {attoToAlph(currentPlayCost, 2)} ALPH to enter
          </p>
        )}

      </div>

      {/* Prize Split Plates */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="tectonic-plate px-4 py-5 text-center">
          <p className="mb-1.5 text-[8px] tracking-[0.3em] uppercase text-[rgba(224,224,224,0.3)]">
            Prize Pot
          </p>
          <p className="font-cinzel text-lg font-semibold text-[#E0E0E0] engraved tabular-nums sm:text-xl">
            {attoToAlph(prizePot, 2)}
          </p>
          <p className="text-[10px] text-[rgba(224,224,224,0.38)]">ALPH</p>
          {formatUsd(prizePot) && (
            <p className="mt-1 text-[9px] text-[rgba(255,72,0,0.55)]">{formatUsd(prizePot)}</p>
          )}
          <p className="mt-2 text-[8px] tracking-wider text-[rgba(224,224,224,0.18)]">80% to winner</p>
        </div>
        <div className="tectonic-plate px-4 py-5 text-center">
          <p className="mb-1.5 text-[8px] tracking-[0.3em] uppercase text-[rgba(224,224,224,0.3)]">
            Next Round Seed
          </p>
          <p className="font-cinzel text-lg font-semibold text-[#E0E0E0] engraved tabular-nums sm:text-xl">
            {attoToAlph(totalSavings, 2)}
          </p>
          <p className="text-[10px] text-[rgba(224,224,224,0.38)]">ALPH</p>
          {formatUsd(totalSavings) && (
            <p className="mt-1 text-[9px] text-[rgba(224,224,224,0.25)]">{formatUsd(totalSavings)}</p>
          )}
          <p className="mt-2 text-[8px] tracking-wider text-[rgba(224,224,224,0.18)]">20% seeds next round</p>
        </div>
      </div>

    </div>
  )
}
