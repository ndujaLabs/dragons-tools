const {ERC721} = require('./abi.json');

module.exports = {
  ERC721ABI: ERC721,
  contracts: {
    ETH: "0x772da237fc93ded712e5823b497db5991cc6951e",
    TRON: "TLzVpnCQB9LU5h2pBimoarFGogRpvQ6EeM",
    POA: "0x051C663523De8b7B22849338EB4FAA62F37A8979"
  },
  marketPlaces: {
    ETH: "0xAbDC35433405972052FEB43cA900496fF0646E0c",
    POA: "0x3e8dda130f6c9a028096dfb68eaf48838ecf8630",
    TRON: "TYQq6573HQCPxFNUiFYTkEYL3eqi5dio2A"
  },
  bridges: {
    ETH: "TTtgcqFGyF2qRidMqbfqJfPwgpUmAk5vZ2",
    POA: "0xeE0f42712598f28521f45237cf42ad95F1d52DAa",
    TRON: "0x74AF9991d5FEa09EBB042CaFE51972D89aCDaFC8"
  }
}
