import { attoToAlph, formatAddressWithYou, formatCompactTimer, sanitizeBetAmountInput, stripAddressGroup } from '../lib/utils'
import type { ActiveBetView, TimerPart, UserBetHistoryItem } from '../types'

type BettingPageProps = {
  currentRoundId: bigint
  pot: bigint
  isRoundActive: boolean
  currentLeader: string
  timerParts: TimerPart[]
  timeLeftMs: bigint
  lastSettledRoundId: bigint
  lastSettledWinner: string | undefined
  isExpired: boolean
  walletAddress: string | undefined
  betTarget: string
  betAmountInput: string
  setBetTarget: (v: string) => void
  setBetAmountInput: (v: string) => void
  betAmount: bigint | null
  isBetAmountPositive: boolean
  isBetAmountValid: boolean
  isBetTargetValidAddress: boolean
  cleanedBetTarget: string
  isTargetInRecentPlayers: boolean
  minBet: bigint
  bettingWindowOpen: boolean
  isBettingWindowClosed: boolean
  canPlaceBet: boolean
  isSameAsExistingBet: boolean
  betStatus: string
  placingBet: boolean
  finalizingBetRound: boolean
  claimingBet: boolean
  isBusy: boolean
  hasMyBet: boolean
  totalBettingPool: bigint
  bettingByPlayer: Map<string, bigint>
  topBetPlayer: { address: string; amount: bigint } | null
  selectablePlayers: string[]
  selectedPlayerPool: bigint
  payoutQuote: bigint
  activeBet: ActiveBetView | null
  shouldShowActiveBetPanel: boolean
  activeBetQuote: bigint
  showFinalizeRoundCta: boolean
  finalizeCtaRoundId: bigint
  isLastSettledRoundFinalized: boolean
  hasMyLastSettledBet: boolean
  myLastSettledBetTarget: string | undefined
  myLastSettledBetAmount: bigint
  didWinLastSettledRound: boolean
  hasClaimedLastSettledRound: boolean
  claimablePayout: bigint
  lastSettledHistory: UserBetHistoryItem | undefined
  myBetHistory: UserBetHistoryItem[]
  placeBet: () => Promise<void>
  finalizeBettingRound: (roundId?: bigint) => Promise<void>
  claimBet: (roundId?: bigint) => Promise<void>
  formatUsd: (attoAlph: bigint) => string
}

export function BettingPage({
  currentRoundId,
  pot,
  isRoundActive,
  currentLeader,
  timerParts,
  timeLeftMs,
  lastSettledRoundId,
  lastSettledWinner,
  isExpired,
  walletAddress,
  betTarget,
  betAmountInput,
  setBetTarget,
  setBetAmountInput,
  betAmount,
  isBetAmountPositive,
  isBetAmountValid,
  isBetTargetValidAddress,
  cleanedBetTarget,
  isTargetInRecentPlayers,
  minBet,
  bettingWindowOpen,
  isBettingWindowClosed,
  canPlaceBet,
  isSameAsExistingBet,
  betStatus,
  placingBet,
  finalizingBetRound,
  claimingBet,
  isBusy,
  hasMyBet,
  totalBettingPool,
  bettingByPlayer,
  topBetPlayer,
  selectablePlayers,
  selectedPlayerPool,
  payoutQuote,
  activeBet,
  shouldShowActiveBetPanel,
  activeBetQuote,
  showFinalizeRoundCta,
  finalizeCtaRoundId,
  isLastSettledRoundFinalized,
  hasMyLastSettledBet,
  myLastSettledBetTarget,
  myLastSettledBetAmount,
  didWinLastSettledRound,
  hasClaimedLastSettledRound,
  claimablePayout,
  lastSettledHistory,
  myBetHistory,
  placeBet,
  finalizeBettingRound,
  claimBet,
  formatUsd,
}: BettingPageProps) {
  return (
    <div className="space-y-4">

      {/* Round Header */}
      <div className="tectonic-plate tectonic-enter px-5 py-5 sm:px-7">
        <p className="mb-4 text-center text-[9px] tracking-[0.3em] uppercase text-[rgba(224,224,224,0.35)]">
          On-chain Winner Prediction
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="tectonic-panel px-3 py-3">
            <p className="text-[8px] tracking-[0.25em] uppercase text-[rgba(224,224,224,0.35)]">Round</p>
            <p className="mt-1 font-cinzel text-lg font-semibold text-[#E0E0E0] engraved tabular-nums">
              #{currentRoundId.toString()}
            </p>
          </div>
          <div className="tectonic-panel px-3 py-3">
            <p className="text-[8px] tracking-[0.25em] uppercase text-[rgba(224,224,224,0.35)]">Game Pool</p>
            <p className="mt-1 font-cinzel text-base font-semibold text-[#E0E0E0] engraved tabular-nums">
              {attoToAlph(pot, 2)}
            </p>
            <p className="text-[9px] text-[rgba(224,224,224,0.38)]">ALPH</p>
          </div>
          <div className="tectonic-panel px-3 py-3">
            <p className="text-[8px] tracking-[0.25em] uppercase text-[rgba(224,224,224,0.35)]">Countdown</p>
            <p className="mt-1 font-mono text-sm text-[#E0E0E0] tabular-nums leading-tight">
              {timeLeftMs === 0n ? '0s' : formatCompactTimer(timerParts)}
            </p>
          </div>
        </div>

        {currentLeader && (
          <div
            className="mt-4 border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.04)] px-4 py-3 text-center"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
          >
            <p className="text-[8px] tracking-[0.25em] uppercase text-[rgba(212,175,55,0.55)]">
              Current Leader
            </p>
            <p className="mt-1 break-all font-mono text-sm font-medium text-[#E0E0E0] sm:text-base">
              {formatAddressWithYou(currentLeader, walletAddress)}
            </p>
          </div>
        )}
      </div>

      {/* Two-column layout for form + stats on larger screens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Prediction Form */}
        <div className="tectonic-plate px-5 py-6 sm:px-7">
          <p className="mb-5 text-[9px] tracking-[0.28em] uppercase text-[rgba(224,224,224,0.35)]">
            Place Prediction
          </p>

          {/* Window closed warning */}
          {isBettingWindowClosed && isRoundActive && (
            <div
              className="mb-4 border border-[rgba(255,72,0,0.25)] bg-[rgba(255,72,0,0.04)] px-4 py-3 text-center"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
            >
              <p className="text-xs font-medium text-[rgba(255,72,0,0.85)]">Prediction Window Closed</p>
              <p className="mt-1 text-[10px] text-[rgba(224,224,224,0.4)]">
                Closes 30 min before timer ends
              </p>
            </div>
          )}

          <div className={`space-y-3 ${isBettingWindowClosed ? 'pointer-events-none opacity-40' : ''}`}>
            {/* Target Address */}
            <div>
              <label className="mb-1.5 block text-[9px] tracking-[0.22em] uppercase text-[rgba(224,224,224,0.45)]">
                Target Address
              </label>
              <input
                value={betTarget}
                onChange={(e) => setBetTarget(e.target.value)}
                placeholder="Paste any Alephium address"
                disabled={isBettingWindowClosed}
                className="stone-input font-mono"
                style={{ fontFamily: "'Courier New', monospace", fontSize: '0.7rem' }}
              />
            </div>

            {/* Player Picker */}
            <div
              className="border border-[rgba(224,224,224,0.06)] bg-[rgba(5,5,5,0.5)]"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
            >
              <p className="border-b border-[rgba(224,224,224,0.06)] px-3 py-2 text-[8px] tracking-[0.25em] uppercase text-[rgba(224,224,224,0.35)]">
                Eligible Players
              </p>
              <div className="max-h-36 overflow-auto p-2">
                {selectablePlayers.length === 0 ? (
                  <p className="px-1 py-1 text-[10px] text-[rgba(224,224,224,0.3)]">No players yet</p>
                ) : (
                  selectablePlayers.map((player) => (
                    <button
                      key={player}
                      onClick={() => setBetTarget(player)}
                      className={`mb-1 block w-full px-2 py-1.5 text-left font-mono text-[10px] transition-colors ${
                        cleanedBetTarget === player
                          ? 'bg-[rgba(255,72,0,0.1)] text-[#E0E0E0] border-l-2 border-[#FF4800]'
                          : 'text-[rgba(224,224,224,0.55)] hover:bg-[rgba(224,224,224,0.04)] hover:text-[rgba(224,224,224,0.8)]'
                      }`}
                    >
                      {formatAddressWithYou(player, walletAddress)}
                      {player === stripAddressGroup(currentLeader) && (
                        <span className="ml-2 text-[rgba(212,175,55,0.7)]">· Leader</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {betTarget.trim().length > 0 && !isBetTargetValidAddress && (
              <p className="text-[10px] text-[rgba(255,72,0,0.8)]">Invalid Alephium address</p>
            )}
            {isBetTargetValidAddress && !isTargetInRecentPlayers && (
              <p className="text-[10px] text-[rgba(224,224,224,0.4)]">
                Valid address but not in recent players — tx may fail
              </p>
            )}

            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-[9px] tracking-[0.22em] uppercase text-[rgba(224,224,224,0.45)]">
                Bet Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  enterKeyHint="done"
                  value={betAmountInput}
                  onChange={(e) => setBetAmountInput(sanitizeBetAmountInput(e.target.value))}
                  placeholder="0.1"
                  disabled={isBettingWindowClosed}
                  className="stone-input pr-14"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px] tracking-widest uppercase text-[rgba(224,224,224,0.3)]">
                  ALPH
                </span>
              </div>
            </div>

            {betAmountInput.trim().length > 0 && !isBetAmountPositive && (
              <p className="text-[10px] text-[rgba(255,72,0,0.8)]">Amount must be greater than 0</p>
            )}
            {betAmountInput.trim().length > 0 && isBetAmountPositive && !isBetAmountValid && (
              <p className="text-[10px] text-[rgba(255,72,0,0.8)]">
                Min {attoToAlph(minBet, 2)} ALPH
              </p>
            )}
          </div>

          {/* Selected Player Info */}
          {cleanedBetTarget.length > 0 && (
            <div
              className="mt-4 border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.03)] px-4 py-3"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[rgba(224,224,224,0.45)]">Target</span>
                <span className="font-mono text-[rgba(224,224,224,0.75)]">
                  {formatAddressWithYou(cleanedBetTarget, walletAddress)}
                </span>
              </div>
              {selectedPlayerPool > 0n ? (
                <>
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-[rgba(224,224,224,0.45)]">Pool on player</span>
                    <span className="text-[rgba(224,224,224,0.7)]">{attoToAlph(selectedPlayerPool, 2)} ALPH</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-[rgba(224,224,224,0.45)]">Current odds</span>
                    <span className="font-semibold text-[#D4AF37]">
                      {(Number(totalBettingPool * 100n / selectedPlayerPool) / 100).toFixed(2)}x
                    </span>
                  </div>
                </>
              ) : (
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-[rgba(224,224,224,0.45)]">No bets yet</span>
                  <span className="text-[rgba(212,175,55,0.7)]">Be first</span>
                </div>
              )}
            </div>
          )}

          {/* Payout estimate */}
          <div className="mt-3 text-center text-[9px] text-[rgba(224,224,224,0.35)]">
            Min: {attoToAlph(minBet, 2)} ALPH
            {!isBettingWindowClosed && payoutQuote > 0n && betAmount !== null && betAmount > 0n && (
              <span
                className="ml-2 bg-[rgba(212,175,55,0.1)] px-2 py-0.5 font-semibold text-[#D4AF37]"
                style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
              >
                Est. {attoToAlph(payoutQuote, 2)} ALPH ({(Number(payoutQuote * 100n / betAmount) / 100).toFixed(2)}x)
              </span>
            )}
          </div>
          <p className="mt-0.5 text-center text-[9px] italic text-[rgba(224,224,224,0.2)]">
            Estimate moves as others bet
          </p>

          {/* Status */}
          {betStatus.length > 0 && (
            <div
              className="mt-4 border border-[rgba(224,224,224,0.1)] bg-[rgba(224,224,224,0.03)] px-3 py-2.5 text-center text-[10px] text-[rgba(224,224,224,0.7)]"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
            >
              {betStatus}
            </div>
          )}

          {/* Active Bet Panel */}
          {shouldShowActiveBetPanel && activeBet && (
            <div
              className="mt-4 border border-[rgba(255,72,0,0.22)] bg-[rgba(255,72,0,0.04)] px-4 py-4"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
            >
              <p className="mb-2 text-[8px] tracking-[0.28em] uppercase text-[rgba(255,72,0,0.7)]">
                Active Prediction
              </p>
              <p className="text-[10px] text-[rgba(224,224,224,0.5)]">
                {activeBet.status === 'pending' ? 'Pending confirmation...' : 'Confirmed on-chain'}
              </p>
              <div className="mt-2 grid grid-cols-1 gap-1.5 text-[10px] sm:grid-cols-3">
                <p>
                  <span className="text-[rgba(224,224,224,0.4)]">Amount: </span>
                  <span className="text-[rgba(224,224,224,0.75)]">{attoToAlph(activeBet.amount, 2)} ALPH</span>
                </p>
                <p>
                  <span className="text-[rgba(224,224,224,0.4)]">Target: </span>
                  <span className="font-mono text-[rgba(224,224,224,0.75)]">
                    {formatAddressWithYou(activeBet.target, walletAddress)}
                  </span>
                </p>
                <p>
                  <span className="text-[rgba(224,224,224,0.4)]">Est. payout: </span>
                  <span className="text-[rgba(212,175,55,0.8)]">{attoToAlph(activeBetQuote, 2)} ALPH</span>
                </p>
              </div>
              <p className="mt-2 text-[9px] italic text-[rgba(224,224,224,0.25)]">
                Refreshes every 15s
              </p>
            </div>
          )}

          {/* Place Bet CTA */}
          <div className="mt-5">
            <button
              onClick={placeBet}
              disabled={!canPlaceBet || isSameAsExistingBet || isBusy || isBettingWindowClosed}
              className="btn-magma"
            >
              {placingBet
                ? 'Submitting...'
                : isBettingWindowClosed
                  ? 'Prediction Closed'
                  : isSameAsExistingBet
                    ? 'Prediction Unchanged'
                    : hasMyBet
                      ? 'Update Prediction'
                      : 'Place Prediction'}
            </button>
          </div>

          {/* Finalize CTA */}
          {showFinalizeRoundCta && finalizeCtaRoundId > 0n && (
            <div
              className="mt-4 border border-[rgba(224,224,224,0.08)] bg-[rgba(224,224,224,0.02)] px-4 py-4"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
            >
              <p className="mb-2 text-[10px] text-[rgba(224,224,224,0.45)]">
                Anyone can finalize an ended round. Small gas fee required.
              </p>
              <button
                onClick={() => finalizeBettingRound(finalizeCtaRoundId)}
                disabled={finalizingBetRound || isBusy}
                className="btn-stone"
                style={{ width: '100%' }}
              >
                {finalizingBetRound ? 'Finalizing...' : `Finalize Round #${finalizeCtaRoundId.toString()}`}
              </button>
            </div>
          )}

          {/* Last Settled Round */}
          {lastSettledRoundId > 0n && isLastSettledRoundFinalized && hasMyLastSettledBet && myLastSettledBetTarget && (
            <div
              className={`mt-4 border px-4 py-4 ${
                didWinLastSettledRound
                  ? 'border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.04)]'
                  : 'border-[rgba(224,224,224,0.08)] bg-[rgba(224,224,224,0.02)]'
              }`}
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
            >
              <p className="mb-2 text-[8px] tracking-[0.28em] uppercase text-[rgba(224,224,224,0.38)]">
                Last Settled · Round #{lastSettledRoundId.toString()}
              </p>
              <p className="text-[10px] text-[rgba(224,224,224,0.6)]">
                Backed {formatAddressWithYou(myLastSettledBetTarget, walletAddress)} with{' '}
                {attoToAlph(myLastSettledBetAmount, 2)} ALPH
              </p>
              {didWinLastSettledRound ? (
                <>
                  <p className="mt-1.5 text-[10px] text-[rgba(224,224,224,0.7)]">
                    Your pick won. Claimable:{' '}
                    <span className="font-semibold text-[#D4AF37]">{attoToAlph(claimablePayout, 2)} ALPH</span>
                  </p>
                  {!hasClaimedLastSettledRound ? (
                    <button
                      onClick={() => claimBet(lastSettledRoundId)}
                      disabled={isBusy}
                      className="btn-gold mt-3"
                    >
                      {claimingBet ? 'Claiming...' : 'Claim Winnings'}
                    </button>
                  ) : (
                    <p className="mt-2 text-[10px] text-[rgba(224,224,224,0.4)]">
                      Claimed: {attoToAlph(lastSettledHistory?.payout ?? 0n, 2)} ALPH
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1.5 text-[10px] text-[rgba(224,224,224,0.38)]">
                  Winner: {lastSettledWinner ? formatAddressWithYou(lastSettledWinner, walletAddress) : '—'} · You did not win
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">

          {/* Pool Stats */}
          <div className="tectonic-plate px-5 py-5 sm:px-7">
            <p className="mb-4 text-[9px] tracking-[0.28em] uppercase text-[rgba(224,224,224,0.35)]">
              Prediction Pool
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="tectonic-panel px-4 py-4 text-center">
                <p className="text-[8px] tracking-wider uppercase text-[rgba(224,224,224,0.35)]">Total Pool</p>
                <p className="mt-1.5 font-cinzel text-xl font-semibold text-[#D4AF37] engraved tabular-nums">
                  {attoToAlph(totalBettingPool, 2)}
                </p>
                <p className="text-[9px] text-[rgba(224,224,224,0.38)]">ALPH</p>
                {formatUsd(totalBettingPool) && (
                  <p className="mt-1 text-[9px] text-[rgba(224,224,224,0.28)]">{formatUsd(totalBettingPool)}</p>
                )}
              </div>
              <div className="tectonic-panel px-4 py-4 text-center">
                <p className="text-[8px] tracking-wider uppercase text-[rgba(224,224,224,0.35)]">Favourite</p>
                {topBetPlayer ? (
                  <>
                    <p className="mt-1.5 font-mono text-[10px] text-[rgba(224,224,224,0.7)] break-all">
                      {formatAddressWithYou(topBetPlayer.address, walletAddress)}
                    </p>
                    <p className="mt-1 text-[9px] text-[#D4AF37]">
                      {attoToAlph(topBetPlayer.amount, 2)} ALPH · {totalBettingPool > 0n ? Math.round(Number(topBetPlayer.amount * 100n / totalBettingPool)) : 0}%
                    </p>
                  </>
                ) : (
                  <p className="mt-1.5 text-[10px] text-[rgba(224,224,224,0.3)]">No predictions yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Odds Table */}
          {bettingByPlayer.size > 0 && (
            <div className="tectonic-plate px-5 py-5 sm:px-7">
              <p className="mb-3 text-[9px] tracking-[0.28em] uppercase text-[rgba(224,224,224,0.35)]">
                Live Odds
              </p>
              <div className="overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 border-b border-[rgba(224,224,224,0.06)] px-3 py-2 text-[8px] tracking-[0.2em] uppercase text-[rgba(224,224,224,0.3)]">
                  <span>Player</span>
                  <span className="text-right">Pool</span>
                  <span className="text-right">Share</span>
                  <span className="text-right">Odds</span>
                </div>
                {[...bettingByPlayer.entries()]
                  .sort((a, b) => Number(b[1] - a[1]))
                  .map(([player, amount]) => {
                    const percentage = totalBettingPool > 0n ? Number(amount * 100n / totalBettingPool) : 0
                    const odds = amount > 0n ? Number(totalBettingPool * 100n / amount) / 100 : 0
                    const isSelected = cleanedBetTarget === player
                    return (
                      <div
                        key={player}
                        className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 border-b border-[rgba(224,224,224,0.04)] px-3 py-2.5 last:border-b-0 ${
                          isSelected ? 'bg-[rgba(255,72,0,0.05)]' : ''
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="h-1 w-12 flex-shrink-0 overflow-hidden bg-[rgba(224,224,224,0.08)]">
                            <div
                              className="h-full bg-[rgba(212,175,55,0.6)]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="truncate font-mono text-[10px] text-[rgba(224,224,224,0.65)]">
                            {formatAddressWithYou(player, walletAddress)}
                          </span>
                        </div>
                        <span className="min-w-[50px] text-right font-mono text-[10px] tabular-nums text-[rgba(224,224,224,0.55)]">
                          {attoToAlph(amount, 2)}
                        </span>
                        <span className="min-w-[32px] text-right font-mono text-[10px] tabular-nums text-[rgba(224,224,224,0.38)]">
                          {percentage}%
                        </span>
                        <span className="min-w-[38px] text-right font-mono text-[10px] font-semibold tabular-nums text-[#D4AF37]">
                          {odds.toFixed(2)}x
                        </span>
                      </div>
                    )
                  })}
              </div>
              <p className="mt-2 text-center text-[8px] italic text-[rgba(224,224,224,0.2)]">
                Multiplier if player wins
              </p>
            </div>
          )}

          {/* History */}
          <div className="tectonic-plate px-5 py-5 sm:px-7">
            <p className="mb-3 text-[9px] tracking-[0.28em] uppercase text-[rgba(224,224,224,0.35)]">
              My Last 10 Rounds
            </p>
            <div className="max-h-64 space-y-2 overflow-auto">
              {myBetHistory.length === 0 ? (
                <p className="text-[10px] text-[rgba(224,224,224,0.28)]">No predictions yet from this wallet</p>
              ) : (
                myBetHistory.map((item) => {
                  const isWin = item.finalized && item.winner && stripAddressGroup(item.winner) === stripAddressGroup(item.target)
                  const isLoss = item.finalized && !isWin
                  return (
                    <div
                      key={item.roundId.toString()}
                      className={`border px-3 py-2.5 ${
                        isWin
                          ? 'border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.04)]'
                          : isLoss
                            ? 'border-[rgba(255,72,0,0.15)] bg-[rgba(255,72,0,0.03)]'
                            : 'border-[rgba(224,224,224,0.07)] bg-[rgba(224,224,224,0.02)]'
                      }`}
                      style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
                    >
                      <p className="text-[10px] text-[rgba(224,224,224,0.65)]">
                        Round #{item.roundId.toString()} · {attoToAlph(item.amount, 2)} ALPH on{' '}
                        {formatAddressWithYou(item.target, walletAddress)}
                      </p>
                      <p className="mt-0.5 text-[9px] text-[rgba(224,224,224,0.38)]">
                        {item.finalized
                          ? `${isWin ? 'Won' : 'Lost'} · Winner: ${item.winner ? formatAddressWithYou(item.winner, walletAddress) : '—'}`
                          : 'Not finalized yet'}
                        {item.claimed ? ` · Claimed ${attoToAlph(item.payout, 2)} ALPH` : ''}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => finalizeBettingRound(item.roundId)}
                          disabled={item.finalized || isBusy || (item.roundId === lastSettledRoundId && isRoundActive && !isExpired)}
                          className="btn-stone-sm"
                        >
                          {item.roundId === lastSettledRoundId && isRoundActive && !isExpired ? 'Running' : item.finalized ? 'Done' : 'Finalize'}
                        </button>
                        <button
                          onClick={() => claimBet(item.roundId)}
                          disabled={!item.finalized || item.claimed || isBusy}
                          className="btn-gold-sm"
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
