const fspath = require('fspath')
const fs = require('fs-extra')
const path = require('path')
const parse = require('csv-parse/lib/sync')
const Case = require('case')

const dragonsTools = require('./dragonsTools')
fs.ensureDirSync(path.resolve(__dirname, '../images/nameSVGs'))
fs.ensureDirSync(path.resolve(__dirname, '../images/nameHeadSVGs'))
fs.ensureDirSync(path.resolve(__dirname, '../images/namePNGs'))
fs.ensureDirSync(path.resolve(__dirname, '../images/nameHeadPNGs'))
fs.ensureDirSync(path.resolve(__dirname, '../images/originalHeadSVGs'))
fs.ensureDirSync(path.resolve(__dirname, '../images/nameTransparentHeadPNGs'))

const finalDNA = require('../data/finalDNA.json')
const colors2 = require('../data/colors2.json')

function capitalize(str) {
  return str.split(' ').map(e => e.substring(0, 1).toUpperCase() + e.substring(1)).join(' ')
}

function splitWords(str) {
  return str.replace(/([A-Z]{1})/g, " $1").replace(/^ /, '')
}

let input = new fspath('data/extras.csv')
let extras = parse(input.read(), {
  columns: header => header.map(column => capitalize(column))
})

let elements = [
  'Fire',
  'Water',
  'Air',
  'Earth',
  'Vacuum'
]

function isASpecial(gene) {
  for (let extra of extras) {
    if (extra.Extra === gene) {
      return extra
    }
  }
  return false
}

const missingNames = {}

function getName(part, value) {
  // console.log(part, value)
  let partName = finalDNA[value.toUpperCase()]
  // console.log(partName)
  if (!partName) {
    if (!missingNames[part]) {
      missingNames[part] = {}
    }
    missingNames[part][value.substring(1).toLowerCase()] = 1
    return 'NOT DEFINED'
  }
  // let all = partName.split(part)
  // if (all[0] !== partName) {
  //   return partName.replace(/ \w+$/, '')
  // }
  return partName
}

let generations = {
  '0': 'Unknown',
  '1': 'First',
  '2': 'Second',
  '3': 'Third',
  '4': 'Fourth',
  '5': 'Fifth',
  '6': 'Sixth',
  '7': 'Seventh'
}

async function renameSvg(id, name, dir, outdir = 'nameSVGs') {
  id = parseInt(id) - 1
  let svgName = '0'.repeat(5 - id.toString().length) + id + '.svg'
  let inputPath = path.join(dir, svgName)
  if (fs.existsSync(inputPath)) {
    // console.log(inputPath, path.resolve(__dirname, '../images/' + outdir + '/' + name + '.svg'))
    await fs.copy(inputPath, path.resolve(__dirname, '../images/' + outdir + '/' + name + '.svg'))
  } else {
    console.log(inputPath + ' not found')
  }
}

async function generatePngWithAura(data) {
  const name = capitalize(data.Names)
  let svg = path.resolve(__dirname, '../images/nameSVGs/' + name + '.svg')
  let bg = path.resolve(__dirname, '../images/backgroundGenesis/' + data.BgFile + '.png')
  let aura
  if (data.Aura) {
    aura = path.resolve(__dirname, '../images/auras/' + data.Aura + '.png')
  }
  let output = path.resolve(__dirname, '../images/namePNGs/' + name + '.png')
  await dragonsTools.pngOverBackground(svg, bg, output, aura)
}

async function generateHeadPngWithAura(data) {
  const name = capitalize(data.Names)
  let svg = path.resolve(__dirname, '../images/nameTransparentHeadPNGs/' + name + '.png')
  let bg = path.resolve(__dirname, '../images/backgroundGenesis/' + data.BgFile + '.png')
  let aura
  if (data.Aura) {
    aura = path.resolve(__dirname, '../images/auras/' + data.Aura + '.png')
  }
  let output = path.resolve(__dirname, '../images/nameHeadPNGs/' + name + '.png')
  await dragonsTools.pngOverBackground(svg, bg, output, aura)
}

async function removeMissingParts(id, missing) {
  id = parseInt(id) - 1
  let svgName = '0'.repeat(5 - id.toString().length) + id + '.svg'
  let svg = await fs.readFile(path.resolve(__dirname, '../images/originalSVGs/' + svgName), 'utf8')
  if (missing.W) {
    svg = dragonsTools.removeWings(svg)
  }
  if (missing.T) {
    svg = dragonsTools.removeTail(svg)
  }
  return fs.writeFile(path.resolve(__dirname, '../tmp/' + svgName), svg)
}

async function extractAvatar(id, name) {
  id = parseInt(id) - 1
  let svgName = '0'.repeat(5 - id.toString().length) + id + '.svg'
  let svg = await fs.readFile(path.resolve(__dirname, '../images/originalSVGs/' + svgName), 'utf8')
  svg = dragonsTools.leaveHeadOnly(svg)
  const input = path.resolve(__dirname, '../images/originalHeadSVGs/' + svgName)
  await fs.writeFile(input, svg)
  await dragonsTools.extractHead(input, path.resolve(__dirname, '../images/nameTransparentHeadPNGs/' + name + '.png'))
}

async function getMetadataJSON(data, missingParts, exportPng) {

  let tId = parseInt(data.TokenId)
  let elem = elements[parseInt(data.Domain)]

  const metadata = {
    description: `Everdragons2 is a collection of 10,001 dragons randomly generated from hundreds of assets. They inherit the legacy of Everdragons, minted in 2018 as the first bridgeable cross-chain non-fungible token (NFT)  for gaming. In the marvelous upcoming Origins, the play-to-earn game of the Everdragons Metaverse, holders of Everdragons2 will get a Loot Box containing Obsidian (the Origins token), Settlement Plans, and Genesis Units based on rarity.`,
    external_url: `https://everdragons2.com/nft/ed2/${data.Names}`,
    image: `https://img.everdragons2.com/ed2/${data.Names}.png`,
    name: data.Names,
    // allTraitsTypes: ['Sky', 'Element', 'Color Palette', 'Generation', 'Purity level', 'Aura', 'Wings', 'Tail', 'Body', 'Legs', 'Head', 'Horns', 'Eyes', 'Hoodie', 'Footwear', 'Sunglasses', 'Armor', 'Hornlets', 'Necklace', 'Piercing', 'Bracelets', 'Baby'],
    // firstMutableTrait: 21,
    // colorPalette: colors2[elem.substring(0,1).toUpperCase()+ data.Color],
    attributes: [
      {
        trait_type: 'Sky',
        value: data.Bg
      },
      {
        trait_type: 'Element',
        value: elem
      },
      {
        trait_type: 'Color Palette',
        value: elem.substring(0, 1) + data.Color
      },
      {
        trait_type: 'Generation',
        value: generations[data.Generation]
      }
    ]
  }

  if (~['Fuoco', 'Aria', 'Aqua', 'Terra'].indexOf(data.Names)) {
    metadata.attributes.push({
      trait_type: 'Baby',
      value: true
    })
  }

  // for (let k = 0; k < powers.length; k++) {
  //   metadata.attributes.push({
  //     trait_type: powers[k],
  //     value: parseInt((data.Powers || [])[k] || '5')
  //   })
  // }

  metadata.attributes.push({
    trait_type: 'Aura',
    value: data.Aura ? splitWords(capitalize(data.Aura)) : 'none'
  })

  let parts = 'Wings,Tail,Body,Legs,Head,Horns,Eyes'.split(',')
  let initials = 'W,T,B,L,H,C,E'.split(',')

  let missing = missingParts[data.TokenId] || {}
  let purity = {}

  for (let i = 0; i < parts.length; i++) {
    let part = parts[i]
    if (!part) {
      console.log('Missing part')
    }
    let value
    let fullValue
    if ((i === 0 && missing.W) || (i === 1 && missing.T)) {
      value = 'none'
      fullvalue = value
      // console.log(data.Names)
    } else {
      value = parseInt(data[part].replace(/[a-zA-Z]+/g, ''))
      fullValue = initials[i] + data[part].toUpperCase()
    }
    purity[value.toString()] = (purity[value.toString()] || 0) + 1
    if (data[part]) {
      let extra = isASpecial(fullValue)
      if (extra) {
        metadata.attributes.push({
          trait_type: extra.Type,
          value: `${fullValue} ${getName(part, fullValue)}`
        })
        fullValue = fullValue.replace(/[a-zA-Z]{1}$/, '')
        metadata.attributes.push({
          trait_type: part,
          value: `${fullValue} ${getName(part, fullValue)}`
        })
      } else {
        metadata.attributes.push({
          trait_type: part,
          value: fullValue ? `${fullValue} ${getName(part, fullValue)}` : 'none'
        })
      }
    }
  }

  let purityLevel = 0
  for (let p in purity) {
    purityLevel = Math.max(purityLevel, purity[p])
  }

  metadata.attributes.push({
    trait_type: 'Purity level',
    value: purityLevel
  })


  if (exportPng) {
    if (missing.W || missing.T) {
      await removeMissingParts(data.TokenId, missing)
      let dir = path.resolve(__dirname, '../tmp/')
      await renameSvg(data.TokenId, capitalize(data.Names), dir)
      await generatePngWithAura(data)
    } else {
      let dir = path.resolve(__dirname, '../images/originalSVGs/')
      await renameSvg(data.TokenId, capitalize(data.Names), dir)
      await generatePngWithAura(data)
    }
  }

  // at the end, we save the report
  if (parseInt(data.TokenId) === 10001) {
    for (let part in missingNames) {
      missingNames[part] = Object.keys(missingNames[part])
    }
    let output = new fspath('data/missingPartNames.json')
    output.write(JSON.stringify(missingNames, null, 2))
  }

  return metadata
}

let powers = [
  'Strength',
  'Dexterity',
  'Intelligence',
  'Focus',
  'Constitution'
]

async function getHeadMetadataJSON(data, exportPng) {

  let tId = parseInt(data.TokenId)
  let elem = elements[parseInt(data.Domain)]

  const metadata = {
    description: `Everdragons2 Avatars is a collection of 10,001 dragons avatars randomly generated from hundreds of assets. They inherit the legacy of Everdragons, minted in 2018 as the first bridgeable cross-chain non-fungible token (NFT)  for gaming. In the marvelous upcoming Origins, the play-to-earn game of the Everdragons Metaverse, holders of Everdragons2 will get a Loot Box containing Obsidian (the Origins token), Settlement Plans, and Genesis Units based on rarity.`,
    external_url: `https://everdragons2.com/nft/ed2a/${data.Names}`,
    image: `https://img.everdragons2.com/ed2a/${data.Names}.png`,
    name: data.Names,
    // colorPalette: colors2[elem.substring(0,1).toUpperCase()+ data.Color],
    attributes: [
      {
        trait_type: 'Sky',
        value: data.Bg
      },
      {
        trait_type: 'Element',
        value: elem
      },
      {
        trait_type: 'Color Palette',
        value: elem.substring(0, 1) + data.Color
      },
      {
        trait_type: 'Generation',
        value: generations[data.Generation]
      }
    ]
  }

  if (data.Aura) {
    metadata.attributes.push({
      trait_type: 'Aura',
      value: splitWords(capitalize(data.Aura))
    })
  }

  let parts = 'Head,Horns,Eyes'.split(',')
  let initials = 'H,C,E'.split(',')

  for (let i = 0; i < parts.length; i++) {
    let part = parts[i]
    let fullValue = initials[i] + data[part].toUpperCase()

    if (data[part]) {
      let extra = isASpecial(fullValue)
      if (extra) {
        metadata.attributes.push({
          trait_type: extra.Type,
          value: `${fullValue} ${getName(part, fullValue)}`
        })
        fullValue = fullValue.replace(/[a-zA-Z]{1}$/, '')
        metadata.attributes.push({
          trait_type: part,
          value: `${fullValue} ${getName(part, fullValue)}`
        })
      } else {
        metadata.attributes.push({
          trait_type: part,
          value: `${fullValue} ${getName(part, fullValue)}`
        })
      }
    }
  }

  if (exportPng) {
    // console.log(data.Names)
    await extractAvatar(data.TokenId, data.Names)
    await generateHeadPngWithAura(data)
  }
  return metadata
}

module.exports = {
  getMetadataJSON,
  getHeadMetadataJSON
}
