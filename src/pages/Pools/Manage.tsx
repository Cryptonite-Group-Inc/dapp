import { AVAX, BNB, ChainId, DEV, ETHER, JSBI, MATIC, Pair, TokenAmount, ETHER_CURRENCIES } from '@zeroexchange/sdk'
import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_ZERO } from '../../constants'
import { ButtonOutlined, ButtonPrimary, ButtonSuccess } from '../../components/Button'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/pools/styled'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { RowBetween, RowCenter } from '../../components/Row'
import { StyledInternalLink, TYPE, Title } from '../../theme'
import styled, { ThemeContext } from 'styled-components'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { useTokenBalance, useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'

import { AutoColumn } from '../../components/Column'
import Card from '../../components/Card'
import ClaimRewardModal from '../../components/pools/ClaimRewardModal'
import { CountUp } from 'use-count-up'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import FullPositionCard from '../../components/PositionCard'
import PageContainer from './../../components/PageContainer'
import { RouteComponentProps } from 'react-router-dom'
import StakingModal from '../../components/pools/StakingModal'
import UnstakingModal from '../../components/pools/UnstakingModal'
import { currencyId } from '../../utils/currencyId'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import { useCurrency } from '../../hooks/Tokens'
import { useHistory } from 'react-router'
import { usePair } from '../../data/Reserves'
import { usePairs } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious'
import { useStakingInfo, STAKING_REWARDS_INFO } from '../../state/stake/hooks'
import { useTotalSupply } from '../../data/TotalSupply'
import useUSDCPrice from '../../utils/useUSDCPrice'
import { useWalletModalToggle } from '../../state/application/hooks'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import PlainPopup from 'components/Popups/PlainPopup'

const moment = require('moment')

const PageWrapper = styled.div`
  flex-direction: column;
  display: flex;
  width: 100%;
  flex-grow: 1;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding:0px;
`};
`
const Columns = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
  `};
`
const SingleColumn = styled.div`
  display: flex;
  flex-grow: 1;
  max-width: calc(50% - 20px);
  min-width: calc(50% - 20px);
  width: calc(50% - 20px);
  &.left {
    margin-right: 20px;
  }
  &.right {
    margin-left: 20px;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    &.left {
      margin-right: auto;
      margin-left: auto;
      max-width: calc(70% - 20px);
      min-width: calc(70% - 20px);
      width: 100%;
    }
    &.right {
      margin-right: auto;
      margin-left: auto;
      max-width: calc(70% - 20px);
      min-width: calc(70% - 20px);
      width: 100%;
    }
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  &.left {
    max-width: calc(100% - 20px);
    min-width: calc(100% - 20px);
  }
  &.right {
    max-width: calc(100% - 20px);
    min-width: calc(100% - 20px);
  }
`};
`
const Wrapper = styled.div`
  background: rgba(47, 53, 115, 0.32);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  border-radius: 44px;
  margin-bottom: 1rem;
  padding: 2rem 2.5rem;
  width: 100%;
  overflow: hidden;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  border-radius: 16px;
  padding: 16px 16px;
`};
`
const StatsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 24px;
  margin-bottom: 1.5rem;
  .add-liquidity-link, .trade-button-link {
    width: 188px;
    text-decoration: none;
  }
  .remove-liquidity-link {
    text-decoration: none;
    margin-left: 2rem;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  align-items: flex-start;
  .add-liquidity-link, .trade-button-link {
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    max-width: 500px;
  }
  .trade-button-link {
    margin-top: .5rem;
    margin-bottom: 1rem;
  }
  .remove-liquidity-link {
    margin-left: auto;
    margin-right: auto;
    margin-top: 1rem;
    width: 100%;
  }
`};
`
const Stat = styled.div`
  display: flex;
  flex-grow: 0;
  flex-direction: column;
  &.harvest {
    margin-left: 2rem;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  &.harvest {
    margin-top: 1rem;
    margin-bottom: 1rem;
    margin-left: 0;
  }
`};
`
const StatLabel = styled.h5`
  font-weight: bold;
  color: #fff;
  font-size: 1rem;
  span {
    opacity: 0.75;
    font-weight: normal;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  text-align: center
  `};
`
const StatValue = styled.h6`
  font-weight: bold;
  color: #fff;
  font-size: 1.75rem;
  margin-top: 10px;
  margin-bottom: 0;
  span {
    opacity: 0.75;
    font-weight: normal;
    font-size: 1.25rem;
    margin-left: 4px;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  font-size: 1.25rem;
`};
`

const PositionInfo = styled(AutoColumn) <{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`

const StyledBox = styled.div`
  border-radius: 12px;
  width: 100%;
  position: relative;
  display: flex;
  border: 2px solid ${({ theme }) => theme.green1};
  padding: 1rem;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  div {
    color: ${({ theme }) => theme.green1};
    font-weight: bold;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  font-size: 1.3rem;
  span {
    font-size: 0.9rem;
    margin-left: 2px;
  }
`};
`
const SymbolTitleWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom 2rem;
`
const SymbolTitleInner = styled.div`
  flex-grow: 0;
  display: flex;
  font-size: 1.5rem;
`
const TextLink = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: #6752f7;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
  &.pink {
    color: #b368fc;
  }
  &:hover {
    opacity: 0.9;
  }
`
const StyledTradelLink = styled(StyledInternalLink)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom: 10px;
`};
  button {
    background: rgba(30, 247, 231, 0.18);
    border: 1px solid #1ef7e7;
  }
`
const StyledButtonsWrap = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  column-gap: 40px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
width: 100%;
flex-direction: column;
`};
`
export default function Manage({
  match: {
    params: { currencyIdA, currencyIdB }
  },
  ...props
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const { account, chainId } = useActiveWeb3React()
  const history = useHistory()

  const locationState: any = props?.location?.state
  const stakingRewardAddress: any = locationState?.stakingRewardAddress ? locationState?.stakingRewardAddress : null

  if (!stakingRewardAddress) {
    history.push('/pools')
  }
  const flatRewards = Object.values(STAKING_REWARDS_INFO).flat(1)
  const currentPairInfo = flatRewards.find(token => token && token['stakingRewardAddress'] === stakingRewardAddress)
  const [isGongolaRewards, setGongolaRewards] = useState(false)
  const [gongolaPathName, setGongolaPathName] = useState('usdt') 
  useMemo(() => {
    if(currentPairInfo &&
      currentPairInfo?.rewardInfo && currentPairInfo?.rewardInfo?.chain === 'Gondola') {
    }
     
    setGongolaPathName(currentPairInfo?.rewardInfo?.pathName)
    setGongolaRewards(true)}, [setGongolaRewards ])
  const theme = useContext(ThemeContext)
  // get currencies and pair
  const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const [, stakingTokenPair] = usePair(tokenA, tokenB, '0x842cc3a5cDf13cFdA564b315b3F3a2E8aBF0eb0A')

  const baseStakingInfo = useStakingInfo(stakingTokenPair)
  const stakingInfo = baseStakingInfo.find(x => x.stakingRewardAddress === stakingRewardAddress);

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)

  
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const [showPopupOpen, setShowPopupOpen] = useState(false)
  const [showRemLiquidity, setShowRemLiquidity] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  const [token, WETH] = currencyA && ETHER_CURRENCIES.includes(currencyA)
    ? [tokenB, tokenA]
    : [tokenA, tokenB];
  const backgroundColor = useColor(token)

  // get WETH value of staked LP tokens
  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo?.stakedAmount?.token)
  let valueOfTotalStakedAmountInWETH: TokenAmount | undefined
  if (totalSupplyOfStakingToken && stakingTokenPair && stakingInfo && WETH) {
    // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
    valueOfTotalStakedAmountInWETH = new TokenAmount(
      WETH,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(WETH).raw),
          JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw
      )
    )
  }

  const countUpAmount =
    stakingInfo?.earnedAmount?.toFixed(Math.min(6, stakingInfo?.earnedAmount?.currency.decimals)) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  // get the USD value of staked WETH
  const USDPrice = useUSDCPrice(WETH)
  const valueOfTotalStakedAmountInUSDC =
    valueOfTotalStakedAmountInWETH && USDPrice?.quote(valueOfTotalStakedAmountInWETH)
  const totalAmountInUSD = valueOfTotalStakedAmountInUSDC // stakingInfo?.rewardsTokenSymbol === 'GDL' ? gondolaTotalSupply : valueOfTotalStakedAmountInUSDC
  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  // pool functionality =====================
  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )

  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens?.filter(({ liquidityToken }) => {
        if (liquidityToken) {
          v2PairsBalances[liquidityToken?.address]?.greaterThan('0')
        }
      }),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  // show liquidity even if its deposited in rewards contract
  const allStakingInfo = useStakingInfo()
  const stakingInfosWithBalance = allStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const stakingPairs = usePairs(stakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens))

  // remove any pairs that also are included in pairs with stake in mining pool
  const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(v2Pair => {
    return (
      stakingPairs
        ?.map(stakingPair => stakingPair[1])
        .filter(stakingPair => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
    )
  })

  const showMe = (pair: any) => {
    return (
      pair?.token0?.symbol === stakingTokenPair?.token0?.symbol &&
      pair?.token1?.symbol === stakingTokenPair?.token1?.symbol
    )
  }

  const symbol = WETH?.symbol
  return (
    <>
      {stakingInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <UnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            stakingInfo={stakingInfo}
          />
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => setShowClaimRewardModal(false)}
            stakingInfo={stakingInfo}
          />
        </>
      )}
      <Title>Manage</Title>
      <PageContainer>
        {account !== null && (
          <>
            <SymbolTitleWrapper>
              <SymbolTitleInner>
                {currencyA?.symbol}/{currencyB?.symbol}
                <span style={{ marginLeft: '10px', marginRight: '10px' }}>Liquidity Mining</span>
                <DoubleCurrencyLogo currency0={currencyA ?? undefined} currency1={currencyB ?? undefined} size={30} />
              </SymbolTitleInner>
            </SymbolTitleWrapper>
            <span
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '-1.5rem',
                marginBottom: '2rem',
                color: 'rgb(167, 177, 244)'
              }}
            >
              ( Ending: {moment(stakingInfo?.periodFinish).fromNow()} )
            </span>
            <StatsWrapper>
              <Stat className="weekly">
                <StatLabel style={{ textAlign: 'left' }}>Total Deposits:</StatLabel>
                <StatValue>
                  {totalAmountInUSD
                    ? `$${totalAmountInUSD.toFixed(0, { groupSeparator: ',' })}`
                    : `${valueOfTotalStakedAmountInWETH?.toSignificant(4, { groupSeparator: ',' }) ?? '-'}`}
                  <span>{symbol}</span>
                </StatValue>
              </Stat>
              <Stat className="harvest">
                <StatLabel style={{ textAlign: 'left' }}>Reward Rate:</StatLabel>
                <StatValue>
                  {stakingInfo?.active
                    ? stakingInfo?.totalRewardRate
                      ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                      ?.toFixed(0, { groupSeparator: ',' }) ?? '-'
                    : '0'}
                  <span>{` ${stakingInfo?.rewardsTokenSymbol ?? 'ZERO'} / week`}</span>
                </StatValue>
              </Stat>
              {
                showAddLiquidityButton ? (!isGongolaRewards ) ? (
                  <StyledInternalLink className="add-liquidity-link"
                    to={{
                      pathname: `/add/${currencyA && currencyId(currencyA)}/${currencyB && currencyId(currencyB)}`,
                      state: { stakingRewardAddress }
                    }
                    }
                  >
                    <ButtonOutlined className="add-liquidity-button">Add Liquidity</ButtonOutlined>
                  </StyledInternalLink>
                ) : (
                  <div className="add-liquidity-link">
                    <ButtonOutlined className="add-liquidity-button" onClick={() => setShowPopupOpen(true)}>Add Liquidity</ButtonOutlined>

                  </div>

                ) : null
              }
              {
                true ? (<PlainPopup isOpen={showPopupOpen} onDismiss={() => setShowPopupOpen(false)} content={
                  {
                    simpleAnnounce: {
                      message: `
                The current functional is developing now
                To add liquidity on https://app.gondola.finance/
                 push the button
         `}
                  }} removeAfterMs={2000}
                  link={`https://app.gondola.finance/#/deposit/${gongolaPathName}`} buttonName={"Add Liquidity"} />) : <></>
              }


              {showAddLiquidityButton ? null : (!isGongolaRewards) ? (

                <StyledInternalLink className="remove-liquidity-link"
                  to={{
                    pathname: `/add/${currencyA && currencyId(currencyA)}/${currencyB && currencyId(currencyB)}`,
                    state: { stakingRewardAddress }
                  }}
                >
                  <ButtonOutlined className="add-liquidity-button">Add Liquidity</ButtonOutlined>
                </StyledInternalLink>
              ) :
                (
                  <div className="add-liquidity-link">
                    <ButtonOutlined className="add-liquidity-button" onClick={() => setShowRemLiquidity(true)}>Remove Liquidity</ButtonOutlined>

                  </div>

                )
              }
              {
                true ? (<PlainPopup isOpen={showRemLiquidity} onDismiss={() => setShowRemLiquidity(false)} content={
                  {
                    simpleAnnounce: {
                      message: `
                The current functional is developing now
                You can remove liquidity push the link below
         `}
                  }} removeAfterMs={2000}
                  link={`https://app.gondola.finance/#/deposit/${gongolaPathName}`} buttonName={"Remove Liquidity"} />) : <></>
              }


            </StatsWrapper>{' '}
          </>
        )}
        <PageWrapper>
          <Columns>
            <SingleColumn className="left">
              <Wrapper>
                <StatLabel style={{ color: '#A7B1F4' }}>Rewards Earned:</StatLabel>
                <RowBetween className="is-mobile" style={{ marginBottom: '2rem' }}>
                  <TYPE.white fontWeight={600} fontSize={[24, 32]} style={{ textOverflow: 'ellipsis' }}>
                    <CountUp
                      key={countUpAmount}
                      isCounting
                      decimalPlaces={4}
                      start={parseFloat(countUpAmountPrevious)}
                      end={parseFloat(countUpAmount)}
                      thousandsSeparator={','}
                      duration={1}
                    />
                  </TYPE.white>
                  {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
                    <ButtonPrimary onClick={() => setShowClaimRewardModal(true)} style={{ width: '160px' }}>
                      Claim
                    </ButtonPrimary>
                  )}
                </RowBetween>
                <StatLabel style={{ color: '#A7B1F4' }}>Earning Rate:</StatLabel>
                <RowBetween className="is-mobile" style={{ marginBottom: '2rem' }}>
                  <TYPE.white fontWeight={600} fontSize={[24, 32]} style={{ textOverflow: 'ellipsis' }}>
                    {stakingInfo?.active
                      ? stakingInfo?.rewardRateWeekly
                        ?.divide(JSBI.BigInt(10 ** 15))
                        .toSignificant(Math.min(4, stakingInfo?.earnedAmount?.currency.decimals), {
                          groupSeparator: ','
                        }) ?? '-'
                      : '0'}
                    <span
                      style={{ opacity: '.8', marginLeft: '5px', fontSize: '16px' }}
                    >{` ${stakingInfo?.rewardsTokenSymbol ?? 'ZERO'} / week`}</span>
                  </TYPE.white>
                </RowBetween>
                <StatLabel style={{ color: '#A7B1F4' }}>Current Liquidity Deposits:</StatLabel>
                <RowBetween className="is-mobile" style={{ marginBottom: '2rem' }}>
                  <TYPE.white fontWeight={600} fontSize={[24, 32]} style={{ textOverflow: 'ellipsis' }}>
                    {stakingInfo?.stakedAmount?.toSignificant(
                      Math.min(6, stakingInfo?.earnedAmount?.currency.decimals)
                    ) ?? '-'}
                    <span style={{ opacity: '.8', marginLeft: '5px', fontSize: '16px' }}>
                      {` ${stakingInfo?.rewardsTokenSymbol ?? 'ZERO'}`} {currencyA?.symbol}-{currencyB?.symbol}
                    </span>
                  </TYPE.white>
                </RowBetween>
                {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
                  <RowCenter>
                    <TextLink onClick={() => setShowUnstakingModal(true)}>Withdraw From Pool</TextLink>
                  </RowCenter>
                )}
              </Wrapper>
            </SingleColumn>
            {(stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ||
              (userLiquidityUnstaked && !userLiquidityUnstaked.equalTo('0'))) && (
                <SingleColumn className="right">
                  <Wrapper>
                    {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo(
                      '0'
                    ) ? null : !stakingInfo?.active ? null : (
                      <>

                        <StatLabel style={{ color: '#A7B1F4' }}>LP To Deposit:</StatLabel>
                        <RowBetween className="is-mobile" style={{ marginBottom: '2rem' }}>
                          <TYPE.white fontWeight={600} fontSize={[24, 32]} style={{ textOverflow: 'ellipsis' }}>
                            {userLiquidityUnstaked?.toSignificant(
                              Math.min(6, stakingInfo?.earnedAmount?.currency.decimals)
                            )}
                            <span style={{ opacity: '.8', marginLeft: '5px', fontSize: '16px' }}>{` ${stakingInfo?.rewardsTokenSymbol ?? 'ZERO'} / week`} LP tokens</span>
                          </TYPE.white>
                          <ButtonOutlined
                            className="remove-liquidity-button green"
                            onClick={handleDepositClick}
                            style={{ width: '160px' }}
                          >
                            {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Deposit' : 'Deposit'}
                          </ButtonOutlined>
                        </RowBetween>

                      </>
                    )}
                    {stakingPairs.map(
                      (stakingPair, i) =>
                        stakingPair[1] &&
                        showMe(stakingPair[1]) && (
                          <FullPositionCard
                            key={stakingInfosWithBalance[i].stakingRewardAddress}
                            pair={stakingPair[1]}
                            stakedBalance={stakingInfosWithBalance[i].stakedAmount}
                          />
                        )
                    )}
                  </Wrapper>
                </SingleColumn>
              )}
          </Columns>
        </PageWrapper>
      </PageContainer>
    </>
  )
}
