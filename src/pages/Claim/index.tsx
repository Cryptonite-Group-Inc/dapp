import { ButtonPrimary } from 'components/Button'
import React, { useEffect, useState } from 'react'
import { getTokenBalances } from 'api'

import Bubble from '../../components/Bubble'
import PageContainer from '../../components/PageContainer'
import styled from 'styled-components'

import useWindowDimensions from '../../hooks/useWindowDimensions'
import { Title } from '../../theme'

const BubbleMarginWrap = styled.div`
  display: flex;
  gap: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    justify-content: space-between;
    align-items: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    gap: 0.1rem;
  `};
`
const Flex = styled.div<{ isColumn: boolean }>`
  margin: 50px auto 0;
  display: flex;
  justify-content: ${({ isColumn }) => (isColumn ? 'center' : 'space-between')};
  flex-wrap: wrap;
  gap: 4rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    margin: 10px auto 0;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 2rem;
  `};
`

const FlexButtons = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 50px;
  margin-bottom: 4rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: center;
  `};
`
const Button = styled.div`
  width: 25%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width:100%;
  `};
`

function fnum(x: number) {
  if (isNaN(x)) return { value: x, suffix: '' }

  if (x < 9999) {
    return { value: x, suffix: '' }
  }

  if (x < 1000000) {
    return { value: x / 1000, suffix: 'K' }
  }

  if (x < 1000000000) {
    return { value: x / 1000000, suffix: 'M' }
  }

  if (x < 1000000000000) {
    return { value: x / 1000000000, suffix: 'B' }
  }

  return { value: x / 1000000000000, suffix: 'T' }
}

export default function Claim() {
  const [tokenBalances, setTokenBalances] = useState<number>(26285647.16)

  const { width } = useWindowDimensions()
  const isColumn = width < 2000

  const getTokenBalances1 = async () => {
    const res = await getTokenBalances()
    console.log('res ', res)
    if (!res.hasError) {
      setTokenBalances(res.data)
    }
  }

  useEffect(() => {
    getTokenBalances1()
  }, [])

  return (
    <>
      <Title>Claim V2 Tokens</Title>
      <PageContainer>
        <Flex isColumn={isColumn}>
          <BubbleMarginWrap>
            <Bubble
              variant="purple"
              color="#FFFFFF"
              prefix="$"
              suffix={fnum(tokenBalances)?.suffix}
              title="Mishka tokens to claim"
              showMountains={true}
            >
              {fnum(tokenBalances)?.value?.toFixed(3)}
            </Bubble>
          </BubbleMarginWrap>
        </Flex>
        <FlexButtons>
          <Button>
            <ButtonPrimary>Claim Tokens</ButtonPrimary>
          </Button>
        </FlexButtons>
      </PageContainer>
    </>
  )
}
