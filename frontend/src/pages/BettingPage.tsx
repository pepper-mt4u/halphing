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
      <div className="pixel-box pixel-enter px-5 py-5 sm:px-7">
        <p className="font-pixel mb-4 text-center" style={{ fontSize: '0.36rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>
          ON-CHAIN WINNER PREDICTION
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="pixel-panel px-3 py-3">
            <p className="font-pixel" style={{ fontSize: '0.32rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>ROUND</p>
            <p className="font-vt mt-1 tabular-nums" style={{ fontSize: '1.6rem', color: 'var(--text)' }}>
              #{currentRoundId.toString()}
            </p>
          </div>
          <div className="pixel-panel px-3 py-3">
            <p className="font-pixel" style={{ fontSize: '0.32rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>GAME POOL</p>
            <p className="font-vt mt-1 tabular-nums" style={{ fontSize: '1.4rem', color: 'var(--text)' }}>
              {attoToAlph(pot, 2)}
            </p>
            <p className="font-pixel" style={{ fontSize: '0.28rem', color: 'var(--text-dim)' }}>ALPH</p>
          </div>
          <div className="pixel-panel px-3 py-3">
            <p className="font-pixel" style={{ fontSize: '0.32rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>COUNTDOWN</p>
            <p className="font-mono mt-1 text-sm tabular-nums leading-tight" style={{ color: 'var(--text)' }}>
              {timeLeftMs === 0n ? '0s' : formatCompactTimer(timerParts)}
            </p>
          </div>
        </div>

        {currentLeader && (
          <div className="pixel-panel-gold mt-4 px-4 py-3 text-center">
            <p className="font-pixel mb-1" style={{ fontSize: '0.3rem', letterSpacing: '0.2em', color: 'rgba(200,150,12,0.65)' }}>
              ⚔ CURRENT EMPEROR
            </p>
            <p className="font-mono break-all text-sm font-medium" style={{ color: 'var(--text)' }}>
              {formatAddressWithYou(currentLeader, walletAddress)}
            </p>
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Prediction Form */}
        <div className="pixel-box px-5 py-6 sm:px-7">
          <p className="font-pixel mb-5" style={{ fontSize: '0.36rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>
            PLACE PREDICTION
          </p>

          {/* Window closed warning */}
          {isBettingWindowClosed && isRoundActive && (
            <div className="pixel-panel-red mb-4 px-4 py-3 text-center">
              <p className="font-pixel" style={{ fontSize: '0.44rem', color: 'rgba(255,50,0,0.9)' }}>PREDICTION WINDOW CLOSED</p>
              <p className="font-vt mt-1 text-lg" style={{ color: 'rgba(232,224,208,0.45)' }}>
                Closes 30 min before timer ends
              </p>
            </div>
          )}

          <div className={`space-y-3 ${isBettingWindowClosed ? 'pointer-events-none opacity-40' : ''}`}>
            {/* Target Address */}
            <div>
              <label className="font-pixel mb-1.5 block" style={{ fontSize: '0.34rem', letterSpacing: '0.15em', color: 'var(--text-dim)' }}>
                TARGET ADDRESS
              </label>
              <input
                value={betTarget}
                onChange={(e) => setBetTarget(e.target.value)}
                placeholder="Paste any Alephium address"
                disabled={isBettingWindowClosed}
                className="pixel-input"
              />
            </div>

            {/* Player Picker */}
            <div className="pixel-panel overflow-hidden">
              <p className="font-pixel border-b px-3 py-2" style={{ fontSize: '0.3rem', letterSpacing: '0.2em', color: 'var(--text-dim)', borderColor: 'var(--border-dim)' }}>
                ELIGIBLE PLAYERS
              </p>
              <div className="max-h-36 overflow-auto p-2">
                {selectablePlayers.length === 0 ? (
                  <p className="font-vt px-1 py-1 text-lg" style={{ color: 'var(--text-dim)' }}>No players yet</p>
                ) : (
                  selectablePlayers.map((player) => (
                    <button
                      key={player}
                      onClick={() => setBetTarget(player)}
                      className={`mb-1 block w-full px-2 py-1.5 text-left font-mono text-xs transition-colors ${
                        cleanedBetTarget === player
                          ? 'border-l-2'
                          : 'hover:bg-[rgba(232,224,208,0.04)]'
                      }`}
                      style={
                        cleanedBetTarget === player
                          ? { background: 'rgba(255,50,0,0.08)', color: 'var(--text)', borderColor: 'var(--crt-red)' }
                          : { color: 'var(--text-dim)' }
                      }
                    >
                      {formatAddressWithYou(player, walletAddress)}
                      {player === stripAddressGroup(currentLeader) && (
                        <span className="ml-2" style={{ color: 'rgba(200,150,12,0.7)' }}>· Emperor</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {betTarget.trim().length > 0 && !isBetTargetValidAddress && (
              <p className="font-vt text-lg crt-red">Invalid Alephium address</p>
            )}
            {isBetTargetValidAddress && !isTargetInRecentPlayers && (
              <p className="font-vt text-lg" style={{ color: 'rgba(232,224,208,0.45)' }}>
                Valid address but not in recent players — tx may fail
              </p>
            )}

            {/* Amount */}
            <div>
              <label className="font-pixel mb-1.5 block" style={{ fontSize: '0.34rem', letterSpacing: '0.15em', color: 'var(--text-dim)' }}>
                BET AMOUNT
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
                  className="pixel-input pr-14"
                />
                <span className="font-pixel pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ fontSize: '0.3rem', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>
                  ALPH
                </span>
              </div>
            </div>

            {betAmountInput.trim().length > 0 && !isBetAmountPositive && (
              <p className="font-vt text-lg crt-red">Amount must be greater than 0</p>
            )}
            {betAmountInput.trim().length > 0 && isBetAmountPositive && !isBetAmountValid && (
              <p className="font-vt text-lg crt-red">
                Min {attoToAlph(minBet, 2)} ALPH
              </p>
            )}
          </div>

          {/* Selected Player Info */}
          {cleanedBetTarget.length > 0 && (
            <div className="pixel-panel-gold mt-4 px-4 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-vt text-lg" style={{ color: 'var(--text-dim)' }}>Target</span>
                <span className="font-mono" style={{ color: 'rgba(232,224,208,0.75)' }}>
                  {formatAddressWithYou(cleanedBetTarget, walletAddress)}
                </span>
              </div>
              {selectedPlayerPool > 0n ? (
                <>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="font-vt text-lg" style={{ color: 'var(--text-dim)' }}>Pool on player</span>
                    <span className="font-vt text-lg" style={{ color: 'rgba(232,224,208,0.7)' }}>{attoToAlph(selectedPlayerPool, 2)} ALPH</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-vt text-lg" style={{ color: 'var(--text-dim)' }}>Current odds</span>
                    <span className="font-vt text-xl font-semibold crt-gold">
                      {(Number(totalBettingPool * 100n / selectedPlayerPool) / 100).toFixed(2)}x
                    </span>
                  </div>
                </>
              ) : (
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-vt text-lg" style={{ color: 'var(--text-dim)' }}>No bets yet</span>
                  <span className="font-vt text-lg" style={{ color: 'rgba(200,150,12,0.7)' }}>Be first</span>
                </div>
              )}
            </div>
          )}

          {/* Payout estimate */}
          <div className="mt-3 text-center">
            <span className="font-vt text-lg" style={{ color: 'var(--text-dim)' }}>Min: {attoToAlph(minBet, 2)} ALPH</span>
            {!isBettingWindowClosed && payoutQuote > 0n && betAmount !== null && betAmount > 0n && (
              <span
                className="font-vt ml-2 px-2 py-0.5 text-lg font-semibold crt-gold"
                style={{ background: 'rgba(200,150,12,0.1)', border: '1px solid rgba(200,150,12,0.3)' }}
              >
                Est. {attoToAlph(payoutQuote, 2)} ALPH ({(Number(payoutQuote * 100n / betAmount) / 100).toFixed(2)}x)
              </span>
            )}
          </div>
          <p className="font-vt mt-0.5 text-center text-lg italic" style={{ color: 'rgba(232,224,208,0.22)' }}>
            Estimate moves as others bet
          </p>

          {/* Status */}
          {betStatus.length > 0 && (
            <div className="pixel-panel mt-4 px-3 py-2.5 text-center">
              <p className="font-vt text-lg" style={{ color: 'rgba(232,224,208,0.7)' }}>{betStatus}</p>
            </div>
          )}

          {/* Active Bet Panel */}
          {shouldShowActiveBetPanel && activeBet && (
            <div className="pixel-panel-red mt-4 px-4 py-4">
              <p className="font-pixel mb-2" style={{ fontSize: '0.32rem', letterSpacing: '0.2em', color: 'rgba(255,50,0,0.7)' }}>
                ACTIVE PREDICTION
              </p>
              <p className="font-vt text-lg" style={{ color: 'rgba(232,224,208,0.55)' }}>
                {activeBet.status === 'pending' ? 'Pending confirmation...' : 'Confirmed on-chain'}
              </p>
              <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                <p className="font-vt text-lg">
                  <span style={{ color: 'var(--text-dim)' }}>Amount: </span>
                  <span style={{ color: 'rgba(232,224,208,0.75)' }}>{attoToAlph(activeBet.amount, 2)} ALPH</span>
                </p>
                <p className="font-vt text-lg">
                  <span style={{ color: 'var(--text-dim)' }}>Target: </span>
                  <span className="font-mono" style={{ color: 'rgba(232,224,208,0.75)', fontSize: '0.7rem' }}>
                    {formatAddressWithYou(activeBet.target, walletAddress)}
                  </span>
                </p>
                <p className="font-vt text-lg">
                  <span style={{ color: 'var(--text-dim)' }}>Est. payout: </span>
                  <span className="crt-gold">{attoToAlph(activeBetQuote, 2)} ALPH</span>
                </p>
              </div>
              <p className="font-vt mt-2 text-lg italic" style={{ color: 'rgba(232,224,208,0.25)' }}>
                Refreshes every 15s
              </p>
            </div>
          )}

          {/* Place Bet CTA */}
          <div className="mt-5">
            <button
              onClick={placeBet}
              disabled={!canPlaceBet || isSameAsExistingBet || isBusy || isBettingWindowClosed}
              className="btn-pixel-red"
            >
              {placingBet
                ? 'SUBMITTING...'
                : isBettingWindowClosed
                  ? 'PREDICTION CLOSED'
                  : isSameAsExistingBet
                    ? 'PREDICTION UNCHANGED'
                    : hasMyBet
                      ? 'UPDATE PREDICTION'
                      : 'PLACE PREDICTION'}
            </button>
          </div>

          {/* Finalize CTA */}
          {showFinalizeRoundCta && finalizeCtaRoundId > 0n && (
            <div className="pixel-panel mt-4 px-4 py-4">
              <p className="font-vt mb-2 text-lg" style={{ color: 'rgba(232,224,208,0.45)' }}>
                Anyone can finalize an ended round. Small gas fee required.
              </p>
              <button
                onClick={() => finalizeBettingRound(finalizeCtaRoundId)}
                disabled={finalizingBetRound || isBusy}
                className="btn-pixel-ghost"
              >
                {finalizingBetRound ? 'FINALIZING...' : `FINALIZE ROUND #${finalizeCtaRoundId.toString()}`}
              </button>
            </div>
          )}

          {/* Last Settled Round */}
          {lastSettledRoundId > 0n && isLastSettledRoundFinalized && hasMyLastSettledBet && myLastSettledBetTarget && (
            <div className={`mt-4 px-4 py-4 ${didWinLastSettledRound ? 'pixel-panel-gold' : 'pixel-panel'}`}>
              <p className="font-pixel mb-2" style={{ fontSize: '0.3rem', letterSpacing: '0.18em', color: 'var(--text-dim)' }}>
                LAST SETTLED · ROUND #{lastSettledRoundId.toString()}
              </p>
              <p className="font-vt text-lg" style={{ color: 'rgba(232,224,208,0.65)' }}>
                Backed {formatAddressWithYou(myLastSettledBetTarget, walletAddress)} with{' '}
                {attoToAlph(myLastSettledBetAmount, 2)} ALPH
              </p>
              {didWinLastSettledRound ? (
                <>
                  <p className="font-vt mt-1.5 text-lg" style={{ color: 'rgba(232,224,208,0.75)' }}>
                    Your pick won. Claimable:{' '}
                    <span className="font-semibold crt-gold">{attoToAlph(claimablePayout, 2)} ALPH</span>
                  </p>
                  {!hasClaimedLastSettledRound ? (
                    <button
                      onClick={() => claimBet(lastSettledRoundId)}
                      disabled={isBusy}
                      className="btn-pixel-gold mt-3"
                    >
                      {claimingBet ? 'CLAIMING...' : 'CLAIM SPOILS'}
                    </button>
                  ) : (
                    <p className="font-vt mt-2 text-lg" style={{ color: 'var(--text-dim)' }}>
                      Claimed: {attoToAlph(lastSettledHistory?.payout ?? 0n, 2)} ALPH
                    </p>
                  )}
                </>
              ) : (
                <p className="font-vt mt-1.5 text-lg" style={{ color: 'rgba(232,224,208,0.4)' }}>
                  Winner: {lastSettledWinner ? formatAddressWithYou(lastSettledWinner, walletAddress) : '—'} · You did not win
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">

          {/* Pool Stats */}
          <div className="pixel-box px-5 py-5 sm:px-7">
            <p className="font-pixel mb-4" style={{ fontSize: '0.36rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>
              PREDICTION POOL
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="pixel-panel px-4 py-4 text-center">
                <p className="font-pixel" style={{ fontSize: '0.3rem', letterSpacing: '0.15em', color: 'var(--text-dim)' }}>TOTAL POOL</p>
                <p className="font-vt mt-1.5 tabular-nums crt-gold" style={{ fontSize: '2rem' }}>
                  {attoToAlph(totalBettingPool, 2)}
                </p>
                <p className="font-pixel" style={{ fontSize: '0.28rem', color: 'var(--text-dim)' }}>ALPH</p>
                {formatUsd(totalBettingPool) && (
                  <p className="font-vt mt-1 text-lg" style={{ color: 'rgba(232,224,208,0.28)' }}>{formatUsd(totalBettingPool)}</p>
                )}
              </div>
              <div className="pixel-panel px-4 py-4 text-center">
                <p className="font-pixel" style={{ fontSize: '0.3rem', letterSpacing: '0.15em', color: 'var(--text-dim)' }}>FAVOURITE</p>
                {topBetPlayer ? (
                  <>
                    <p className="font-mono mt-1.5 break-all" style={{ fontSize: '0.65rem', color: 'rgba(232,224,208,0.7)' }}>
                      {formatAddressWithYou(topBetPlayer.address, walletAddress)}
                    </p>
                    <p className="font-vt mt-1 text-lg crt-gold">
                      {attoToAlph(topBetPlayer.amount, 2)} ALPH · {totalBettingPool > 0n ? Math.round(Number(topBetPlayer.amount * 100n / totalBettingPool)) : 0}%
                    </p>
                  </>
                ) : (
                  <p className="font-vt mt-1.5 text-lg" style={{ color: 'var(--text-dim)' }}>No predictions yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Odds Table */}
          {bettingByPlayer.size > 0 && (
            <div className="pixel-box px-5 py-5 sm:px-7">
              <p className="font-pixel mb-3" style={{ fontSize: '0.36rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>
                LIVE ODDS
              </p>
              <div className="overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 border-b px-3 py-2" style={{ borderColor: 'var(--border-dim)' }}>
                  {['PLAYER', 'POOL', 'SHARE', 'ODDS'].map((h) => (
                    <span key={h} className="font-pixel" style={{ fontSize: '0.28rem', letterSpacing: '0.15em', color: 'var(--text-dim)', textAlign: h !== 'PLAYER' ? 'right' : 'left' }}>
                      {h}
                    </span>
                  ))}
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
                        className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 border-b px-3 py-2.5 last:border-b-0"
                        style={{
                          borderColor: 'var(--border-dim)',
                          background: isSelected ? 'rgba(255,50,0,0.05)' : undefined,
                        }}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {/* Pixel progress bar */}
                          <div
                            className="flex-shrink-0 overflow-hidden"
                            style={{ width: 40, height: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'var(--panel)', boxShadow: '1px 1px 0 #000' }}
                          >
                            <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--gold)' }} />
                          </div>
                          <span className="truncate font-mono" style={{ fontSize: '0.65rem', color: 'rgba(232,224,208,0.65)' }}>
                            {formatAddressWithYou(player, walletAddress)}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums" style={{ minWidth: 50, textAlign: 'right', fontSize: '0.65rem', color: 'rgba(232,224,208,0.55)' }}>
                          {attoToAlph(amount, 2)}
                        </span>
                        <span className="font-mono tabular-nums" style={{ minWidth: 32, textAlign: 'right', fontSize: '0.65rem', color: 'rgba(232,224,208,0.4)' }}>
                          {percentage}%
                        </span>
                        <span className="font-vt tabular-nums font-semibold crt-gold" style={{ minWidth: 38, textAlign: 'right', fontSize: '1.1rem' }}>
                          {odds.toFixed(2)}x
                        </span>
                      </div>
                    )
                  })}
              </div>
              <p className="font-vt mt-2 text-center text-lg italic" style={{ color: 'rgba(232,224,208,0.22)' }}>
                Multiplier if player wins
              </p>
            </div>
          )}

          {/* History */}
          <div className="pixel-box px-5 py-5 sm:px-7">
            <p className="font-pixel mb-3" style={{ fontSize: '0.36rem', letterSpacing: '0.2em', color: 'var(--text-dim)' }}>
              MY LAST 10 ROUNDS
            </p>
            <div className="max-h-64 space-y-2 overflow-auto">
              {myBetHistory.length === 0 ? (
                <p className="font-vt text-xl" style={{ color: 'rgba(232,224,208,0.3)' }}>No predictions yet from this wallet</p>
              ) : (
                myBetHistory.map((item) => {
                  const isWin = item.finalized && item.winner && stripAddressGroup(item.winner) === stripAddressGroup(item.target)
                  const isLoss = item.finalized && !isWin
                  return (
                    <div
                      key={item.roundId.toString()}
                      className={isWin ? 'pixel-panel-gold px-3 py-2.5' : isLoss ? 'pixel-panel-red px-3 py-2.5' : 'pixel-panel px-3 py-2.5'}
                    >
                      <p className="font-vt text-lg" style={{ color: 'rgba(232,224,208,0.65)' }}>
                        Round #{item.roundId.toString()} · {attoToAlph(item.amount, 2)} ALPH on{' '}
                        {formatAddressWithYou(item.target, walletAddress)}
                      </p>
                      <p className="font-vt mt-0.5 text-lg" style={{ color: 'rgba(232,224,208,0.4)' }}>
                        {item.finalized
                          ? `${isWin ? 'Won' : 'Lost'} · Winner: ${item.winner ? formatAddressWithYou(item.winner, walletAddress) : '—'}`
                          : 'Not finalized yet'}
                        {item.claimed ? ` · Claimed ${attoToAlph(item.payout, 2)} ALPH` : ''}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => finalizeBettingRound(item.roundId)}
                          disabled={item.finalized || isBusy || (item.roundId === lastSettledRoundId && isRoundActive && !isExpired)}
                          className="btn-pixel-ghost-sm"
                        >
                          {item.roundId === lastSettledRoundId && isRoundActive && !isExpired ? 'RUNNING' : item.finalized ? 'DONE' : 'FINALIZE'}
                        </button>
                        <button
                          onClick={() => claimBet(item.roundId)}
                          disabled={!item.finalized || item.claimed || isBusy}
                          className="btn-pixel-gold-sm"
                        >
                          CLAIM
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
