import { ButtonOutlined, ButtonPrimary } from 'components/Button'
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import PageContainer from 'components/PageContainer';
import { IDO_LIST } from 'constants/idos';
import { useParams } from 'react-router';
import moment from 'moment';
import { CgAddR } from 'react-icons/cg';
import { FaTelegramPlane, FaTwitter } from 'react-icons/fa';

const Title = styled.h1`
  width: 100%;
  padding: 0px 64px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0;
    text-align: center;
    font-size: 49px;
    margin-top: 40px;
    margin-bottom: 0px;
  `};
`
const ImageContainer = styled.div`
  margin-top: 1rem;
  height: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
`
const MiniImageContainer = styled.div`
  height: 1.2rem;
  & img {
    height: 100%;
  }
`
const InfoSection = styled.div`
  margin: 1rem 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`
const ButtonsSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  max-width: 25rem;
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`
const ButtonIcon = styled.div`
  margin-right: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`
const ButtonsSpacer = styled.div`
  width: 2rem;
  height: 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 0;
    height: 1rem;
  `};
`
const VerticalLine = styled.div`
  height: 1rem;
  width: 0;
  border-right: solid 1px white;
  margin: 0 0.6rem;
`
const BgWrapper = styled.div`
  background: rgba(47, 53, 115, 0.32);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  border-radius: 44px;
  margin-bottom: 8rem;
  margin-top: 6rem;
  padding: 30px;
  width: 100%;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 16px;
    padding: 20px;
  `};
`
const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const Heading = styled.h2`

`
const Detail = styled.p`
  margin: 2rem 0;
`
const SocialLinks = styled.div`
  display: flex;
`
const SocialIcon = styled.div`
  /* height: 1.4rem;
  width: 1.4rem; */
  font-size: 1.4rem;
  display: flex;
  position: relative;
  padding: .4rem .6rem;
  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`
const Tooltip = styled.div`
  cursor: pointer;
  font-size: .8rem;
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }
`
const StatsSection = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`
const Stat = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`
const StatTitle = styled.p`
  color: rgba(255,255,255,0.5);
  margin-bottom: 0.4rem;
`
const StatText = styled.p`
  margin: 0;
`

export default function ZeroGravityInfo() {

  const {idoURL} = useParams<{idoURL:string}>();

  const [idoData, setIdoData] = useState<any>();
  const [socialMediaLinks, setSocialMediaLinks] = useState([
    {
      name: 'Telegram',
      icon: <FaTelegramPlane/>,
      link: 'https://telegram.org/'
    },
    {
      name: 'Twitter',
      icon: <FaTwitter/>,
      link: 'https://twitter.com/'
    },
  ])
  const launchingString = useMemo<string>(() => {
    if (idoData?.launchDate) {
      if (moment(idoData.launchDate).isBefore(moment.now())) {
        return `Launched ${moment(idoData?.launchDate??'').fromNow()}`;
      }
      return `Launching ${moment(idoData?.launchDate??'').fromNow()}`;
    }
    return '';
  }, [idoData]);

  useEffect(() => {
    // fetch data here
    setIdoData(IDO_LIST.find(item => item.idoURL===idoURL))
  }, [idoURL])

  return (
    <>
      <Title>Info</Title>
      <PageContainer>
        <ImageContainer>
          <img src={idoData?.logo ?? ''} alt={idoData?.idoURL ?? ''}/>
        </ImageContainer>
        <InfoSection>
          <p>Future</p>
          <VerticalLine />
          <MiniImageContainer>
            <img src={idoData?.logo ?? ''} alt={idoData?.idoURL ?? ''}/>
          </MiniImageContainer>
          <VerticalLine />
          <p>{launchingString}</p>
        </InfoSection>
        <ButtonsSection>
          <ButtonOutlined >
            <ButtonIcon>
              <CgAddR/>
            </ButtonIcon>
            Join Whishlist
          </ButtonOutlined>
          <ButtonsSpacer />
          <ButtonOutlined disabled>
            <ButtonIcon>
              <CgAddR/>
            </ButtonIcon>
            Join Pool
          </ButtonOutlined>
        </ButtonsSection>
        <BgWrapper>
          <HeadingRow>
            <Heading>
              Pool details
            </Heading>
            <SocialLinks>
              {socialMediaLinks.map(iconDetails => 
                <SocialIcon onClick={()=>window.open(iconDetails.link)}>
                  {iconDetails.icon}
                  <Tooltip className="tooltip">{iconDetails.name}</Tooltip>
                </SocialIcon>
              )}
            </SocialLinks>
          </HeadingRow>
          <Detail>
            {idoData?.description ?? ''}
          </Detail>
          <StatsSection>
            <Stat>
              <StatTitle> Auction Start Date </StatTitle>
              <StatText>{moment(idoData?.launchDate??"").format('MMM DD, YYYY hh:mm A')}</StatText>
            </Stat>
            <Stat>
              <StatTitle> Token Distribution Date </StatTitle>
              <StatText>{moment(idoData?.distributionDate??"").format('MMM DD, YYYY hh:mm A')}</StatText>
            </Stat>
            <Stat>
              <StatTitle> Min. Allocation </StatTitle>
              <StatText>{idoData?.allocationMin??''}</StatText>
            </Stat>
            <Stat>
              <StatTitle> Allocation per Winning Ticket </StatTitle>
              <StatText>{idoData?.allocationWinningAmount??''}</StatText>
            </Stat>
          </StatsSection>
        </BgWrapper>
      </PageContainer>
    </>
  )
}
