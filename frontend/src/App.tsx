import { useEffect, useMemo, useState } from 'react'
import { web3, waitForTxConfirmation } from '@alephium/web3'
import { AlephiumConnectButton, useBalance, useWallet, useConnect } from '@alephium/web3-react'
import { CountdownGame } from '../../artifacts/ts/CountdownGame'
import { CountdownBettingMarket } from '../../artifacts/ts/CountdownBettingMarket'
import { FinalizeBettingRound } from '../../artifacts/ts/scripts'
import type { CountdownGameTypes } from '../../artifacts/ts/CountdownGame'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  alphToAtto,
  attoToAlph,
  BETTING_CONTRACT_ADDRESS,
  clearStoredActiveBet,
  CONTRACT_ADDRESS,
  EXPLORER_URL,
  fetcher,
  formatAddressWithYou,
  getHalvedCount,
  isValidAlephiumAddress,
  msToTimerParts,
  NODE_URL,
  pageFromLocation,
  readStoredActiveBet,
  sanitizeBetAmountInput,
  sleep,
  stripAddressGroup,
  THIRTY_MINUTES_MS,
  urlFromPage,
  writeStoredActiveBet,
} from './lib/utils'
import type { ActiveBetView, AppPage, StoredActiveBetStatus } from './types'
import { HomePage } from './pages/HomePage'
import { BettingPage } from './pages/BettingPage'
import { HowToPage } from './pages/HowToPage'

function App() {
  const queryClient = useQueryClient()
  const [activePage, setActivePage] = useState<AppPage>(() => {
    if (typeof window === 'undefined') return 'game'
    return pageFromLocation(window.location.pathname, window.location.hash)
  })
  const [status, setStatus] = useState<string>('')
  const [betStatus, setBetStatus] = useState<string>('')
  const [playing, setPlaying] = useState(false)
  const [playingDouble, setPlayingDouble] = useState(false)
  const [placingBet, setPlacingBet] = useState(false)
  const [finalizingBetRound, setFinalizingBetRound] = useState(false)
  const [claimingBet, setClaimingBet] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [pendingTxId, setPendingTxId] = useState<string | null>(null)
  const [betTarget, setBetTarget] = useState('')
  const [betAmountInput, setBetAmountInput] = useState('1')
  const [debouncedQuoteInput, setDebouncedQuoteInput] = useState<{ target: string; amount: bigint | null }>({
    target: '',
    amount: null
  })
  const [localActiveBet, setLocalActiveBet] = useState<ActiveBetView | null>(null)
  const [nowMs, setNowMs] = useState<bigint>(BigInt(Date.now()))
  const wallet = useWallet()
  const { balance, updateBalanceForTx } = useBalance()
  const { connect } = useConnect()

  const walletAddress = wallet?.account?.address
  const cleanedWalletAddress = walletAddress ? stripAddressGroup(walletAddress) : undefined
  const availableAlph = BigInt(balance?.balance ?? '0')

  // Fetch ALPH price in USD
  const { data: alphPriceUsd = 0 } = useQuery({
    queryKey: ['alph-price-usd'],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=usd')
        const data = await response.json()
        return data.alephium?.usd ?? 0
      } catch {
        return 0
      }
    },
    refetchInterval: 60000,
    staleTime: 30000
  })

  const formatUsd = (attoAlph: bigint): string => {
    if (alphPriceUsd === 0) return ''
    const alph = Number(attoAlph) / 1e18
    const usd = alph * alphPriceUsd
    if (usd < 0.01) return '< $0.01'
    if (usd < 1) return `$${usd.toFixed(2)}`
    if (usd < 1000) return `$${usd.toFixed(2)}`
    return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const navigateToPage = (nextPage: AppPage) => {
    setActivePage(nextPage)
    if (typeof window === 'undefined') return
    const nextUrl = urlFromPage(nextPage)
    const currentUrl = `${window.location.pathname}${window.location.hash || ''}`
    if (currentUrl !== nextUrl) {
      window.history.pushState({}, '', nextUrl)
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(BigInt(Date.now())), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const syncPageFromLocation = () => {
      setActivePage(pageFromLocation(window.location.pathname, window.location.hash))
    }
    window.addEventListener('popstate', syncPageFromLocation)
    window.addEventListener('hashchange', syncPageFromLocation)
    return () => {
      window.removeEventListener('popstate', syncPageFromLocation)
      window.removeEventListener('hashchange', syncPageFromLocation)
    }
  }, [])

  useEffect(() => {
    if (CONTRACT_ADDRESS.length === 0) return
    web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
  }, [])

  const { data: state, isLoading } = useQuery<CountdownGameTypes.Fields>({
    queryKey: ['countdown-state', NODE_URL, CONTRACT_ADDRESS],
    queryFn: async () => {
      if (CONTRACT_ADDRESS.length === 0) throw new Error('Missing contract address')
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const game = CountdownGame.at(CONTRACT_ADDRESS)
      const nextState = await game.fetchState()
      return nextState.fields
    },
    enabled: CONTRACT_ADDRESS.length > 0,
    refetchInterval: 4000,
    refetchIntervalInBackground: true
  })

  const { data: roundSnapshot } = useQuery<[boolean, bigint, bigint, string]>({
    queryKey: ['round-snapshot', NODE_URL, CONTRACT_ADDRESS],
    queryFn: async () => {
      if (CONTRACT_ADDRESS.length === 0) throw new Error('Missing contract address')
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const game = CountdownGame.at(CONTRACT_ADDRESS)
      const result = await game.view.getRoundSnapshot()
      return result.returns
    },
    enabled: CONTRACT_ADDRESS.length > 0,
    refetchInterval: 4000,
    refetchIntervalInBackground: true
  })

  const baseCurrentPlayCost = state?.currentPlayCost ?? 5n * 10n ** 18n
  const currentTimestamp = BigInt(Date.now())
  const willSettleOnPlay = state?.roundActive && currentTimestamp >= (state?.deadlineMs ?? 0n)
  const currentPlayCost = willSettleOnPlay ? baseCurrentPlayCost * 101n / 100n : baseCurrentPlayCost
  const doublePlayCost = currentPlayCost * 2n
  const canPlay = wallet !== undefined && CONTRACT_ADDRESS.length > 0
  const hasEnoughForSingle = availableAlph >= currentPlayCost
  const hasEnoughForDouble = availableAlph >= doublePlayCost
  const isRoundActive = roundSnapshot?.[0] ?? state?.roundActive ?? false
  const currentRoundId = roundSnapshot?.[1] ?? state?.currentRoundId ?? 0n
  const currentLeader = roundSnapshot?.[3] ?? state?.currentLeader ?? ''
  const roundDeadlineMs = roundSnapshot?.[2] ?? state?.deadlineMs ?? 0n
  const lastSettledRoundId = state?.lastSettledRoundId ?? 0n
  const minBet = CountdownBettingMarket.consts.MIN_BET
  const betAmount = alphToAtto(betAmountInput)
  const isBetAmountPositive = betAmount !== null && betAmount > 0n
  const cleanedBetTarget = stripAddressGroup(betTarget.trim())
  const isBetTargetValidAddress = cleanedBetTarget.length > 0 && isValidAlephiumAddress(cleanedBetTarget)
  const isBetAmountValid = betAmount !== null && betAmount >= minBet && betAmount > 0n
  const timeLeftForBetting = isRoundActive && roundDeadlineMs > nowMs ? roundDeadlineMs - nowMs : 0n
  const bettingWindowOpen = timeLeftForBetting >= THIRTY_MINUTES_MS
  const canPlaceBet =
    wallet !== undefined &&
    BETTING_CONTRACT_ADDRESS.length > 0 &&
    isRoundActive &&
    bettingWindowOpen &&
    isBetTargetValidAddress &&
    isBetAmountPositive &&
    isBetAmountValid &&
    betAmount !== null &&
    availableAlph >= betAmount

  const { data: myBet } = useQuery({
    queryKey: ['my-bet', NODE_URL, BETTING_CONTRACT_ADDRESS, currentRoundId.toString(), cleanedWalletAddress],
    queryFn: async () => {
      if (!cleanedWalletAddress || BETTING_CONTRACT_ADDRESS.length === 0) return null
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const market = CountdownBettingMarket.at(BETTING_CONTRACT_ADDRESS)
      const result = await market.view.getUserBet({
        args: { roundId: currentRoundId, bettor: cleanedWalletAddress }
      })
      return result.returns
    },
    enabled: Boolean(cleanedWalletAddress) && BETTING_CONTRACT_ADDRESS.length > 0 && currentRoundId > 0n,
    refetchInterval: 4000,
    refetchIntervalInBackground: true
  })

  const { data: myLastSettledBet } = useQuery({
    queryKey: ['my-last-settled-bet', NODE_URL, BETTING_CONTRACT_ADDRESS, lastSettledRoundId.toString(), cleanedWalletAddress],
    queryFn: async () => {
      if (!cleanedWalletAddress || BETTING_CONTRACT_ADDRESS.length === 0 || lastSettledRoundId === 0n) return null
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const market = CountdownBettingMarket.at(BETTING_CONTRACT_ADDRESS)
      const result = await market.view.getUserBet({
        args: { roundId: lastSettledRoundId, bettor: cleanedWalletAddress }
      })
      return result.returns
    },
    enabled: Boolean(cleanedWalletAddress) && BETTING_CONTRACT_ADDRESS.length > 0 && lastSettledRoundId > 0n,
    refetchInterval: 4000,
    refetchIntervalInBackground: true
  })

  const { data: payoutQuote = 0n } = useQuery({
    queryKey: [
      'bet-quote',
      NODE_URL,
      BETTING_CONTRACT_ADDRESS,
      currentRoundId.toString(),
      debouncedQuoteInput.target,
      debouncedQuoteInput.amount?.toString() ?? '0'
    ],
    queryFn: async () => {
      if (BETTING_CONTRACT_ADDRESS.length === 0) return 0n
      if (debouncedQuoteInput.amount === null || debouncedQuoteInput.amount <= 0n) return 0n
      if (debouncedQuoteInput.target.length === 0) return 0n
      if (!isValidAlephiumAddress(debouncedQuoteInput.target)) return 0n
      if (currentRoundId === 0n) return 0n
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const market = CountdownBettingMarket.at(BETTING_CONTRACT_ADDRESS)
      const result = await market.view.quotePayout({
        args: { roundId: currentRoundId, target: debouncedQuoteInput.target, amount: debouncedQuoteInput.amount }
      })
      return result.returns
    },
    enabled:
      BETTING_CONTRACT_ADDRESS.length > 0 &&
      currentRoundId > 0n &&
      debouncedQuoteInput.amount !== null &&
      debouncedQuoteInput.amount > 0n,
    refetchInterval: 15000,
    refetchIntervalInBackground: true
  })

  const { data: playedPlayers = [] } = useQuery<string[]>({
    queryKey: ['played-players', NODE_URL, CONTRACT_ADDRESS, currentRoundId.toString()],
    queryFn: async () => {
      if (CONTRACT_ADDRESS.length === 0) return []
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const provider = web3.getCurrentNodeProvider()
      let start = 0
      const players: string[] = []
      for (let i = 0; i < 100; i += 1) {
        const page = await provider.events.getEventsContractContractaddress(CONTRACT_ADDRESS, { start })
        for (const event of page.events) {
          if (event.eventIndex !== CountdownGame.eventIndex.Played) continue
          const roundField = event.fields[0]
          const playerField = event.fields[1]
          if (typeof roundField?.value === 'string' && typeof playerField?.value === 'string') {
            if (BigInt(roundField.value) === currentRoundId) {
              players.push(stripAddressGroup(playerField.value))
            }
          }
        }
        if (page.nextStart === start) break
        start = page.nextStart
      }
      const uniqueLatestFirst = [...new Set(players.reverse())]
      return uniqueLatestFirst
    },
    enabled: CONTRACT_ADDRESS.length > 0,
    refetchInterval: 8000,
    refetchIntervalInBackground: true
  })

  const { data: myBetHistory = [] } = useQuery({
    queryKey: ['my-bet-history', NODE_URL, BETTING_CONTRACT_ADDRESS, walletAddress],
    queryFn: async () => {
      if (!walletAddress || BETTING_CONTRACT_ADDRESS.length === 0) return []
      const cleaned = stripAddressGroup(walletAddress)
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const provider = web3.getCurrentNodeProvider()
      let start = 0
      const byRound = new Map<string, { roundId: bigint; target: string; amount: bigint; finalized: boolean; winner?: string; claimed: boolean; payout: bigint }>()
      const finalizedByRound = new Map<string, { winner?: string }>()
      for (let i = 0; i < 200; i += 1) {
        const page = await provider.events.getEventsContractContractaddress(BETTING_CONTRACT_ADDRESS, { start })
        for (const event of page.events) {
          if (event.eventIndex === CountdownBettingMarket.eventIndex.BetPlaced) {
            const roundId = event.fields[0]?.value
            const bettor = event.fields[1]?.value
            const target = event.fields[2]?.value
            const amount = event.fields[3]?.value
            if (typeof roundId !== 'string' || typeof bettor !== 'string' || typeof target !== 'string' || typeof amount !== 'string') continue
            if (stripAddressGroup(bettor) !== cleaned) continue
            byRound.set(roundId, {
              roundId: BigInt(roundId),
              target: stripAddressGroup(target),
              amount: BigInt(amount),
              finalized: byRound.get(roundId)?.finalized ?? false,
              winner: byRound.get(roundId)?.winner,
              claimed: false,
              payout: 0n
            })
          } else if (event.eventIndex === CountdownBettingMarket.eventIndex.RoundFinalized) {
            const roundId = event.fields[0]?.value
            const winner = event.fields[1]?.value
            if (typeof roundId !== 'string' || typeof winner !== 'string') continue
            finalizedByRound.set(roundId, { winner: stripAddressGroup(winner) })
            const existing = byRound.get(roundId)
            if (existing) {
              existing.finalized = true
              existing.winner = stripAddressGroup(winner)
              byRound.set(roundId, existing)
            }
          } else if (event.eventIndex === CountdownBettingMarket.eventIndex.Claimed) {
            const roundId = event.fields[0]?.value
            const bettor = event.fields[1]?.value
            const payout = event.fields[3]?.value
            if (typeof roundId !== 'string' || typeof bettor !== 'string' || typeof payout !== 'string') continue
            if (stripAddressGroup(bettor) !== cleaned) continue
            const existing = byRound.get(roundId)
            if (existing) {
              existing.claimed = true
              existing.payout = BigInt(payout)
              byRound.set(roundId, existing)
            }
          }
        }
        if (page.nextStart === start) break
        start = page.nextStart
      }
      const items = [...byRound.values()]
        .map((item) => {
          const finalized = finalizedByRound.get(item.roundId.toString())
          return { ...item, finalized: item.finalized || finalized !== undefined, winner: item.winner ?? finalized?.winner }
        })
        .filter((item) => item.amount > 0n || item.claimed)
        .sort((a, b) => Number(b.roundId - a.roundId))
      return items.slice(0, 10)
    },
    enabled: Boolean(walletAddress) && BETTING_CONTRACT_ADDRESS.length > 0,
    refetchInterval: 8000,
    refetchIntervalInBackground: true
  })

  const { data: bettingStats } = useQuery({
    queryKey: ['betting-stats', NODE_URL, BETTING_CONTRACT_ADDRESS, currentRoundId.toString()],
    queryFn: async () => {
      if (BETTING_CONTRACT_ADDRESS.length === 0 || currentRoundId === 0n) {
        return { totalPool: 0n, byPlayer: new Map<string, bigint>() }
      }
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const provider = web3.getCurrentNodeProvider()
      const market = CountdownBettingMarket.at(BETTING_CONTRACT_ADDRESS)
      const targetsInRound = new Set<string>()
      let start = 0
      for (let i = 0; i < 200; i += 1) {
        const page = await provider.events.getEventsContractContractaddress(BETTING_CONTRACT_ADDRESS, { start })
        for (const event of page.events) {
          if (event.eventIndex === CountdownBettingMarket.eventIndex.BetPlaced) {
            const roundId = event.fields[0]?.value
            const target = event.fields[2]?.value
            if (typeof roundId !== 'string' || typeof target !== 'string') continue
            if (BigInt(roundId) !== currentRoundId) continue
            targetsInRound.add(stripAddressGroup(target))
          }
        }
        if (page.nextStart === start) break
        start = page.nextStart
      }
      let totalPool = 0n
      const byPlayer = new Map<string, bigint>()
      if (targetsInRound.size === 0) {
        // No bets yet — carry-over pot may still exist; read it from contract state
        const marketState = await market.fetchState()
        totalPool = marketState.fields.carryOverPot
      } else {
        for (const target of targetsInRound) {
          const pools = await market.view.getRoundPools({ args: { roundId: currentRoundId, target } })
          if (totalPool === 0n) totalPool = pools.returns[0]
          const targetPool = pools.returns[1]
          if (targetPool > 0n) byPlayer.set(target, targetPool)
        }
      }
      return { totalPool, byPlayer }
    },
    enabled: BETTING_CONTRACT_ADDRESS.length > 0 && currentRoundId > 0n,
    refetchInterval: 8000,
    refetchIntervalInBackground: true
  })

  const totalBettingPool = bettingStats?.totalPool ?? 0n
  const bettingByPlayer = useMemo(
    () => bettingStats?.byPlayer ?? new Map<string, bigint>(),
    [bettingStats]
  )

  const topBetPlayer = useMemo(() => {
    if (bettingByPlayer.size === 0) return null
    let maxPlayer = ''
    let maxAmount = 0n
    for (const [player, amount] of bettingByPlayer.entries()) {
      if (amount > maxAmount) {
        maxAmount = amount
        maxPlayer = player
      }
    }
    return maxPlayer ? { address: maxPlayer, amount: maxAmount } : null
  }, [bettingByPlayer])

  const { data: finalizedRoundIds = new Set<string>() } = useQuery({
    queryKey: ['finalized-round-ids', NODE_URL, BETTING_CONTRACT_ADDRESS],
    queryFn: async () => {
      if (BETTING_CONTRACT_ADDRESS.length === 0) return new Set<string>()
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const provider = web3.getCurrentNodeProvider()
      let start = 0
      const ids = new Set<string>()
      for (let i = 0; i < 200; i += 1) {
        const page = await provider.events.getEventsContractContractaddress(BETTING_CONTRACT_ADDRESS, { start })
        for (const event of page.events) {
          if (event.eventIndex !== CountdownBettingMarket.eventIndex.RoundFinalized) continue
          const roundId = event.fields[0]?.value
          if (typeof roundId === 'string') ids.add(roundId)
        }
        if (page.nextStart === start) break
        start = page.nextStart
      }
      return ids
    },
    enabled: BETTING_CONTRACT_ADDRESS.length > 0,
    refetchInterval: 8000,
    refetchIntervalInBackground: true
  })

  const play = async (isDouble: boolean = false) => {
    if (wallet === undefined) {
      setStatus('Connect your Alephium wallet to enter the arena.')
      return
    }
    if (isDouble && !isRoundActive) {
      setStatus('Double play is only available during an active round.')
      return
    }
    if (CONTRACT_ADDRESS.length === 0) {
      setStatus('Missing contract address.')
      return
    }
    if (isDouble) {
      setPlayingDouble(true)
    } else {
      setPlaying(true)
    }
    setStatus('')
    try {
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const game = CountdownGame.at(CONTRACT_ADDRESS)
      const signer = wallet.signer
      if (signer === undefined) throw new Error('Connected wallet has no signer.')
      const latestState = await game.fetchState()
      let latestPlayCost = latestState.fields.currentPlayCost
      const now = BigInt(Date.now())
      const roundExpired = latestState.fields.roundActive && now >= latestState.fields.deadlineMs
      if (roundExpired) latestPlayCost = latestPlayCost * 101n / 100n
      const cost = isDouble ? latestPlayCost * 2n : latestPlayCost
      if (availableAlph < cost) {
        setStatus(`Insufficient ALPH. ${roundExpired ? 'After settlement, price' : 'Current price'} is ${attoToAlph(cost, 4)} ALPH but you have ${attoToAlph(availableAlph, 4)} ALPH.`)
        setPlaying(false)
        setPlayingDouble(false)
        return
      }
      const result = isDouble
        ? await game.transact.playDouble({ signer, attoAlphAmount: cost })
        : await game.transact.play({ signer, attoAlphAmount: cost })
      updateBalanceForTx(result.txId)
      setPendingTxId(result.txId)
      setStatus('Transaction submitted. Awaiting confirmation...')
      setConfirming(true)
      await waitForTxConfirmation(result.txId, 1, 1000)
      setStatus('Confirmed! Refreshing...')
      await sleep(3000)
      setStatus('')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setStatus(`Failed: ${message}`)
    } finally {
      setConfirming(false)
      setPlaying(false)
      setPlayingDouble(false)
      setPendingTxId(null)
    }
  }

  const placeBet = async () => {
    if (wallet === undefined) { setBetStatus('Connect your wallet to place a prediction.'); return }
    if (BETTING_CONTRACT_ADDRESS.length === 0) { setBetStatus('Missing prediction contract address.'); return }
    if (!isRoundActive) { setBetStatus('Predicting is open only during an active round.'); return }
    if (!bettingWindowOpen) { setBetStatus('Predictions close 30 minutes before round end.'); return }
    const target = cleanedBetTarget
    if (target.length === 0) { setBetStatus('Enter the target address you want to back.'); return }
    if (!isBetTargetValidAddress) { setBetStatus('Enter a valid Alephium address.'); return }
    if (betAmount === null || betAmount <= 0n) { setBetStatus('Bet amount must be greater than 0.'); return }
    if (!isBetAmountValid) { setBetStatus(`Minimum prediction is ${attoToAlph(minBet, 2)} ALPH.`); return }
    if (availableAlph < betAmount) { setBetStatus('Insufficient ALPH balance for this prediction.'); return }

    setPlacingBet(true)
    setConfirming(true)
    setBetStatus('')
    try {
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const market = CountdownBettingMarket.at(BETTING_CONTRACT_ADDRESS)
      const signer = wallet.signer
      if (signer === undefined) throw new Error('Connected wallet has no signer.')
      if (!cleanedWalletAddress) throw new Error('Missing connected wallet address.')
      setLocalActiveBet({ roundId: currentRoundId, target, amount: betAmount, status: 'pending' })
      const result = await market.transact.placeBet({
        signer,
        args: { roundId: currentRoundId, target, amount: betAmount },
        attoAlphAmount: betAmount + 5n * 10n ** 17n
      })
      updateBalanceForTx(result.txId)
      setPendingTxId(result.txId)
      writeStoredActiveBet(cleanedWalletAddress, {
        wallet: cleanedWalletAddress, roundId: currentRoundId.toString(),
        target, amount: betAmount.toString(), status: 'pending', txId: result.txId
      })
      setBetStatus('Prediction submitted. Awaiting confirmation...')
      await waitForTxConfirmation(result.txId, 1, 1000)
      setLocalActiveBet({ roundId: currentRoundId, target, amount: betAmount, status: 'confirmed' })
      writeStoredActiveBet(cleanedWalletAddress, {
        wallet: cleanedWalletAddress, roundId: currentRoundId.toString(),
        target, amount: betAmount.toString(), status: 'confirmed', txId: result.txId
      })
      setBetStatus('Confirmed! Refreshing...')
      await sleep(3000)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-bet'] }),
        queryClient.invalidateQueries({ queryKey: ['my-bet-history'] }),
        queryClient.invalidateQueries({ queryKey: ['betting-stats'] })
      ])
      setBetStatus('Prediction confirmed on-chain.')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (cleanedWalletAddress) clearStoredActiveBet(cleanedWalletAddress)
      setLocalActiveBet(null)
      setBetStatus(`Prediction failed: ${message}`)
    } finally {
      setPlacingBet(false)
      setConfirming(false)
      setPendingTxId(null)
    }
  }

  const finalizeBettingRound = async (roundId?: bigint) => {
    if (wallet === undefined || BETTING_CONTRACT_ADDRESS.length === 0 || CONTRACT_ADDRESS.length === 0) return
    const targetRoundId = roundId ?? lastSettledRoundId
    setFinalizingBetRound(true)
    setConfirming(true)
    setBetStatus('')
    try {
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const game = CountdownGame.at(CONTRACT_ADDRESS)
      const market = CountdownBettingMarket.at(BETTING_CONTRACT_ADDRESS)
      const signer = wallet.signer
      if (signer === undefined) throw new Error('Connected wallet has no signer.')
      const gameState = await game.fetchState()
      const finalizeRoundId = targetRoundId !== 0n ? targetRoundId : gameState.fields.lastSettledRoundId
      if (finalizeRoundId === 0n) { setBetStatus('No settled round yet to finalize.'); return }
      setBetStatus('Submitting settle + finalize...')
      const result = await FinalizeBettingRound.execute({
        signer,
        initialFields: { game: game.contractId, market: market.contractId, roundId: finalizeRoundId },
        attoAlphAmount: 3n * 10n ** 17n
      })
      updateBalanceForTx(result.txId)
      setPendingTxId(result.txId)
      setBetStatus('Finalize submitted. Awaiting confirmation...')
      await waitForTxConfirmation(result.txId, 1, 1000)
      setBetStatus('Confirmed! Refreshing...')
      await sleep(3000)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-bet-history'] }),
        queryClient.invalidateQueries({ queryKey: ['countdown-state'] }),
        queryClient.invalidateQueries({ queryKey: ['round-snapshot'] }),
        queryClient.invalidateQueries({ queryKey: ['finalized-round-ids'] })
      ])
      setBetStatus(`Round #${finalizeRoundId.toString()} finalized for predictions.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setBetStatus(`Finalize failed: ${message}`)
    } finally {
      setFinalizingBetRound(false)
      setConfirming(false)
      setPendingTxId(null)
    }
  }

  const claimBet = async (roundId?: bigint) => {
    if (wallet === undefined || BETTING_CONTRACT_ADDRESS.length === 0) return
    const targetRoundId = roundId ?? lastSettledRoundId
    if (targetRoundId === 0n) { setBetStatus('No settled round yet to claim.'); return }
    setClaimingBet(true)
    setConfirming(true)
    setBetStatus('')
    try {
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const market = CountdownBettingMarket.at(BETTING_CONTRACT_ADDRESS)
      const signer = wallet.signer
      if (signer === undefined) throw new Error('Connected wallet has no signer.')
      const result = await market.transact.claim({ signer, args: { roundId: targetRoundId } })
      updateBalanceForTx(result.txId)
      setPendingTxId(result.txId)
      setBetStatus('Claim submitted. Awaiting confirmation...')
      await waitForTxConfirmation(result.txId, 1, 1000)
      if (cleanedWalletAddress && localActiveBet && localActiveBet.roundId === targetRoundId) {
        writeStoredActiveBet(cleanedWalletAddress, {
          wallet: cleanedWalletAddress, roundId: localActiveBet.roundId.toString(),
          target: localActiveBet.target, amount: localActiveBet.amount.toString(),
          status: 'claimed', txId: result.txId
        })
        setLocalActiveBet({ ...localActiveBet, status: 'claimed' })
      }
      setBetStatus('Confirmed! Refreshing...')
      await sleep(3000)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-bet-history'] }),
        queryClient.invalidateQueries({ queryKey: ['my-last-settled-bet'] })
      ])
      setBetStatus(`Claim settled for round #${targetRoundId.toString()}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setBetStatus(`Claim failed: ${message}`)
    } finally {
      setClaimingBet(false)
      setConfirming(false)
      setPendingTxId(null)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuoteInput({ target: cleanedBetTarget, amount: betAmount })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [cleanedBetTarget, betAmount])

  useEffect(() => {
    if (!cleanedWalletAddress) { setLocalActiveBet(null); return }
    const stored = readStoredActiveBet(cleanedWalletAddress)
    if (!stored) { setLocalActiveBet(null); return }
    const parsedRoundId = BigInt(stored.roundId)
    if (parsedRoundId !== currentRoundId && stored.status !== 'claimed') {
      clearStoredActiveBet(cleanedWalletAddress)
      setLocalActiveBet(null)
      return
    }
    setLocalActiveBet({
      roundId: parsedRoundId,
      target: stored.target,
      amount: BigInt(stored.amount),
      status: stored.status as StoredActiveBetStatus
    })
  }, [cleanedWalletAddress, currentRoundId])

  const timeLeftMs = useMemo(() => {
    if (!isRoundActive) return 0n
    if (roundDeadlineMs <= nowMs) return 0n
    return roundDeadlineMs - nowMs
  }, [isRoundActive, roundDeadlineMs, nowMs])

  const timerParts = useMemo(() => msToTimerParts(timeLeftMs), [timeLeftMs])
  const pot = state?.currentPot ?? 0n
  const prizePot = (pot * 80n) / 100n
  const savingsPot = state?.savingsPot ?? 0n
  const totalSavings = savingsPot + (pot * 20n) / 100n
  const halvedCount = state ? getHalvedCount(state.currentDurationMs) : 0
  const isExpired = Boolean(isRoundActive && timeLeftMs === 0n)
  const isBettingWindowClosed = timeLeftMs < THIRTY_MINUTES_MS
  const hasMyBet = Boolean(myBet?.[0])
  const myBetTarget = hasMyBet ? stripAddressGroup(myBet?.[1] ?? '') : undefined
  const myBetAmount = hasMyBet ? myBet?.[2] ?? 0n : 0n
  const isSameAsExistingBet = hasMyBet && betAmount !== null && cleanedBetTarget === myBetTarget && betAmount === myBetAmount
  const hasMyLastSettledBet = Boolean(myLastSettledBet?.[0])
  const myLastSettledBetTarget = hasMyLastSettledBet ? stripAddressGroup(myLastSettledBet?.[1] ?? '') : undefined
  const myLastSettledBetAmount = hasMyLastSettledBet ? myLastSettledBet?.[2] ?? 0n : 0n
  const hasMyConfirmedRoundBet = hasMyBet && myBetAmount > 0n
  const activeBet: ActiveBetView | null = hasMyConfirmedRoundBet && myBetTarget
    ? { roundId: currentRoundId, target: myBetTarget, amount: myBetAmount, status: 'confirmed' }
    : localActiveBet && localActiveBet.roundId === currentRoundId && localActiveBet.status !== 'claimed'
      ? localActiveBet
      : null
  const shouldShowActiveBetPanel = activeBet !== null
  const isBusy = playing || playingDouble || placingBet || finalizingBetRound || claimingBet || confirming
  const selectablePlayers = useMemo(() => {
    if (!currentLeader) return playedPlayers
    const leader = stripAddressGroup(currentLeader)
    return playedPlayers.includes(leader) ? playedPlayers : [leader, ...playedPlayers]
  }, [playedPlayers, currentLeader])

  const isTargetInRecentPlayers = cleanedBetTarget.length > 0 && selectablePlayers.includes(cleanedBetTarget)
  const selectedPlayerPool = cleanedBetTarget.length > 0 ? bettingByPlayer.get(cleanedBetTarget) ?? 0n : 0n
  const lastSettledHistory = myBetHistory.find((item) => item.roundId === lastSettledRoundId)
  const lastSettledWinner = state?.lastSettledWinner ? stripAddressGroup(state.lastSettledWinner) : undefined
  const isLastSettledRoundFinalized = finalizedRoundIds.has(lastSettledRoundId.toString())
  const didWinLastSettledRound =
    Boolean(lastSettledWinner) &&
    Boolean(myLastSettledBetTarget) &&
    stripAddressGroup(myLastSettledBetTarget ?? '') === stripAddressGroup(lastSettledWinner ?? '')
  const hasClaimedLastSettledRound = Boolean(lastSettledHistory?.claimed)
  const showFinalizeRoundCta = Boolean(walletAddress) && !isBusy && ((isRoundActive && isExpired) || (lastSettledRoundId > 0n && !isLastSettledRoundFinalized))
  const finalizeCtaRoundId = isRoundActive && isExpired ? currentRoundId : lastSettledRoundId

  const { data: claimablePayout = 0n } = useQuery({
    queryKey: [
      'claimable-payout',
      NODE_URL,
      BETTING_CONTRACT_ADDRESS,
      lastSettledRoundId.toString(),
      myLastSettledBetTarget ?? '',
      myLastSettledBetAmount.toString(),
      didWinLastSettledRound ? 'win' : 'lose'
    ],
    queryFn: async () => {
      if (
        BETTING_CONTRACT_ADDRESS.length === 0 || lastSettledRoundId === 0n ||
        !myLastSettledBetTarget || myLastSettledBetAmount <= 0n || !didWinLastSettledRound
      ) return 0n
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const market = CountdownBettingMarket.at(BETTING_CONTRACT_ADDRESS)
      const result = await market.view.getClaimablePayout({
        args: { roundId: lastSettledRoundId, target: myLastSettledBetTarget, betAmount: myLastSettledBetAmount }
      })
      return result.returns
    },
    enabled:
      BETTING_CONTRACT_ADDRESS.length > 0 && lastSettledRoundId > 0n &&
      Boolean(myLastSettledBetTarget) && myLastSettledBetAmount > 0n &&
      didWinLastSettledRound && isLastSettledRoundFinalized,
    refetchInterval: 15000,
    refetchIntervalInBackground: true
  })

  const { data: activeBetQuote = 0n } = useQuery({
    queryKey: [
      'active-bet-quote',
      NODE_URL,
      BETTING_CONTRACT_ADDRESS,
      activeBet?.roundId.toString() ?? '0',
      activeBet?.target ?? '',
      activeBet?.amount.toString() ?? '0'
    ],
    queryFn: async () => {
      if (!activeBet || BETTING_CONTRACT_ADDRESS.length === 0) return 0n
      web3.setCurrentNodeProvider(NODE_URL, undefined, fetcher)
      const market = CountdownBettingMarket.at(BETTING_CONTRACT_ADDRESS)
      const result = await market.view.getClaimablePayout({
        args: { roundId: activeBet.roundId, target: activeBet.target, betAmount: activeBet.amount }
      })
      return result.returns
    },
    enabled: Boolean(activeBet) && BETTING_CONTRACT_ADDRESS.length > 0,
    refetchInterval: 15000,
    refetchIntervalInBackground: true
  })

  useEffect(() => {
    if (betTarget.length > 0) return
    if (selectablePlayers.length === 0) return
    setBetTarget(selectablePlayers[0])
  }, [betTarget, selectablePlayers])

  useEffect(() => {
    if (!cleanedWalletAddress) return
    if (!hasMyConfirmedRoundBet || !myBetTarget) return
    const synced = {
      wallet: cleanedWalletAddress, roundId: currentRoundId.toString(),
      target: myBetTarget, amount: myBetAmount.toString(), status: 'confirmed' as const
    }
    writeStoredActiveBet(cleanedWalletAddress, synced)
    setLocalActiveBet({ roundId: currentRoundId, target: myBetTarget, amount: myBetAmount, status: 'confirmed' })
  }, [cleanedWalletAddress, hasMyConfirmedRoundBet, myBetTarget, currentRoundId, myBetAmount])

  return (
    <div className="flex min-h-screen flex-col">

      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6"
        style={{ background: 'var(--surface)', borderBottom: '3px solid rgba(255,255,255,0.72)', boxShadow: '0 5px 0 #000' }}
      >
        <div>
          <h1
            className="font-pixel leading-snug"
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              background: 'linear-gradient(90deg, #f5c518 0%, #ff8c00 45%, #cc2000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            THE <span style={{ textTransform: 'lowercase' }}>h</span>ALPHing
          </h1>
          <p className="font-vt mt-0.5" style={{ fontSize: '1rem', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>
            GLADIATORIAL ARENA
          </p>
        </div>
        <AlephiumConnectButton />
      </header>

      {/* Nav */}
      <nav className="flex justify-center gap-3 px-4 py-5 sm:py-6">
        <button
          onClick={() => navigateToPage('game')}
          className={`pixel-tab ${activePage === 'game' ? 'pixel-tab-active' : ''}`}
        >
          Arena
        </button>
        <button
          onClick={() => navigateToPage('betting')}
          className={`pixel-tab ${activePage === 'betting' ? 'pixel-tab-active' : ''}`}
        >
          Augury
        </button>
        <button
          onClick={() => navigateToPage('instructions')}
          className={`pixel-tab ${activePage === 'instructions' ? 'pixel-tab-active' : ''}`}
        >
          Codex
        </button>
      </nav>

      {/* Main */}
      <main className="mx-auto w-full flex-1 px-4 pb-20 sm:px-6"
        style={{ maxWidth: activePage === 'betting' ? '56rem' : '44rem' }}>
        {activePage === 'game' && (
          <HomePage
            isLoading={isLoading}
            currentLeader={currentLeader}
            walletAddress={walletAddress}
            state={state}
            timerParts={timerParts}
            halvedCount={halvedCount}
            pot={pot}
            prizePot={prizePot}
            totalSavings={totalSavings}
            currentPlayCost={currentPlayCost}
            doublePlayCost={doublePlayCost}
            isRoundActive={isRoundActive}
            isExpired={isExpired}
            status={status}
            canPlay={canPlay}
            isBusy={isBusy}
            hasEnoughForSingle={hasEnoughForSingle}
            hasEnoughForDouble={hasEnoughForDouble}
            playing={playing}
            playingDouble={playingDouble}
            confirming={confirming}
            play={play}
            connect={connect}
            formatUsd={formatUsd}
          />
        )}

        {activePage === 'betting' && (
          <BettingPage
            currentRoundId={currentRoundId}
            pot={pot}
            isRoundActive={isRoundActive}
            currentLeader={currentLeader}
            timerParts={timerParts}
            timeLeftMs={timeLeftMs}
            lastSettledRoundId={lastSettledRoundId}
            lastSettledWinner={lastSettledWinner}
            isExpired={isExpired}
            walletAddress={walletAddress}
            betTarget={betTarget}
            betAmountInput={betAmountInput}
            setBetTarget={setBetTarget}
            setBetAmountInput={setBetAmountInput}
            betAmount={betAmount}
            isBetAmountPositive={isBetAmountPositive}
            isBetAmountValid={isBetAmountValid}
            isBetTargetValidAddress={isBetTargetValidAddress}
            cleanedBetTarget={cleanedBetTarget}
            isTargetInRecentPlayers={isTargetInRecentPlayers}
            minBet={minBet}
            bettingWindowOpen={bettingWindowOpen}
            isBettingWindowClosed={isBettingWindowClosed}
            canPlaceBet={canPlaceBet}
            isSameAsExistingBet={isSameAsExistingBet}
            betStatus={betStatus}
            placingBet={placingBet}
            finalizingBetRound={finalizingBetRound}
            claimingBet={claimingBet}
            isBusy={isBusy}
            hasMyBet={hasMyBet}
            totalBettingPool={totalBettingPool}
            bettingByPlayer={bettingByPlayer}
            topBetPlayer={topBetPlayer}
            selectablePlayers={selectablePlayers}
            selectedPlayerPool={selectedPlayerPool}
            payoutQuote={payoutQuote}
            activeBet={activeBet}
            shouldShowActiveBetPanel={shouldShowActiveBetPanel}
            activeBetQuote={activeBetQuote}
            showFinalizeRoundCta={showFinalizeRoundCta}
            finalizeCtaRoundId={finalizeCtaRoundId}
            isLastSettledRoundFinalized={isLastSettledRoundFinalized}
            hasMyLastSettledBet={hasMyLastSettledBet}
            myLastSettledBetTarget={myLastSettledBetTarget}
            myLastSettledBetAmount={myLastSettledBetAmount}
            didWinLastSettledRound={didWinLastSettledRound}
            hasClaimedLastSettledRound={hasClaimedLastSettledRound}
            claimablePayout={claimablePayout}
            lastSettledHistory={lastSettledHistory}
            myBetHistory={myBetHistory}
            placeBet={placeBet}
            finalizeBettingRound={finalizeBettingRound}
            claimBet={claimBet}
            formatUsd={formatUsd}
          />
        )}

        {activePage === 'instructions' && <HowToPage />}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ borderTop: '2px solid var(--border-dim)' }}>
        <p className="font-pixel" style={{ fontSize: '0.38rem', color: 'var(--text-dim)', letterSpacing: '0.12em' }}>
          BUILT ON ALEPHIUM
        </p>
      </footer>

      {/* Loading Overlay */}
      {isBusy && (
        <div className="fixed inset-0 z-50 grid place-items-center" style={{ background: 'rgba(3,1,8,0.94)' }}>
          <div className="pixel-box pixel-enter mx-4 w-full max-w-sm px-8 py-8 text-center">
            <div
              className="mx-auto mb-5 pixel-spin"
              style={{
                width: 32,
                height: 32,
                border: '3px solid #fff',
                borderTopColor: 'var(--crt-red)',
                boxShadow: '0 0 12px rgba(255,50,0,0.4)',
              }}
            />
            <p className="font-pixel" style={{ fontSize: '0.48rem', letterSpacing: '0.06em', color: 'var(--text)', lineHeight: 2 }}>
              {(playing || playingDouble)
                ? (playingDouble ? 'PAYING DOUBLE TRIBUTE' : 'ENTERING ARENA')
                : placingBet
                  ? 'PLACING PREDICTION'
                  : finalizingBetRound
                    ? 'FINALIZING ROUND'
                    : claimingBet
                      ? 'CLAIMING SPOILS'
                      : 'AWAITING CONFIRMATION'}
            </p>
            <p className="font-vt mt-2" style={{ fontSize: '1.1rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
              Please wait<span className="blink">_</span>
            </p>
            {pendingTxId && (
              <a
                href={`${EXPLORER_URL}/transactions/${pendingTxId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel mt-5 inline-block"
                style={{
                  fontSize: '0.38rem',
                  letterSpacing: '0.06em',
                  color: 'var(--crt-red)',
                  border: '2px solid rgba(255,50,0,0.45)',
                  padding: '8px 14px',
                  boxShadow: '2px 2px 0 #000',
                  textDecoration: 'none',
                }}
              >
                VIEW TX ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
