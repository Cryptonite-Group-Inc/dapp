import { get, post } from './api'

const ZERO_API_URL = process.env.REACT_APP_ZERO_API_URL
const ZERO_API_KEY = process.env.REACT_APP_ZERO_API_KEY

export async function getTokenBalances(account) {
  return get(`https://web3api.io/api/v2/addresses/${account}/token-balances/latest`)
}

export async function getRelayerBalances() {
  return get(`${ZERO_API_URL}/relayers/QueryRelayerBalances?apikey=${ZERO_API_KEY}`)
}

export async function getTVLData() {
  return get(`${ZERO_API_URL}/TVL/GetTVLdata`)
}

export async function getAllPoolsAPY() {
  return get(`${ZERO_API_URL}/APY/GetAllPoolsAPY`)
}

export async function getSinglePoolAPY(address) {
  return get(`${ZERO_API_URL}/APY/GetPoolAPY?contractAddr=${address}`)
}

export async function getWalletHolderCount() {
  return get(`${ZERO_API_URL}/walletholders/getCount`)
}

export async function getTVLHistory() {
  return get(`${ZERO_API_URL}/TVL/GetHistory`)
}

export async function getMishkaInfo() {
  return post(`https://graphql.bitquery.io/`, {
    operationName: null,
    query:
      'query ($network: EthereumNetwork!, $token: String!, $from: ISO8601DateTime, $till: ISO8601DateTime) {\n  ethereum(network: $network) {\n    transfers(currency: {is: $token}, amount: {gt: 0}, date: {since: $from, till: $till}) {\n      currency {\n        symbol\n        __typename\n      }\n      median: amount(calculate: median)\n      average: amount(calculate: average)\n      amount\n      count\n      days: count(uniq: dates)\n      sender_count: count(uniq: senders)\n      receiver_count: count(uniq: receivers)\n      min_date: minimum(of: date)\n      max_date: maximum(of: date)\n      __typename\n    }\n    __typename\n  }\n}\n',
    variables: {
      limit: 10,
      network: 'ethereum',
      offset: 0,
      token: '0x976091738973b520a514ea206acdd008a09649de'
    }
  })
}
