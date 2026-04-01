#!/usr/bin/env bun
// buddy-reroll.js — Bun only (matches Claude Code's Bun.hash)
// Key: OAuth users use oauthAccount.accountUuid, NOT userID
//   Priority: oauthAccount.accountUuid ?? userID ?? "anon"
//   Seed = (uuid|userID) + SALT → Bun.hash → mulberry32 PRNG

const crypto = require('crypto')

const SALT = 'friend-2026-401'
const SPECIES = ['duck','goose','blob','cat','dragon','octopus','owl','penguin','turtle','snail','ghost','axolotl','capybara','cactus','robot','rabbit','mushroom','chonk']
const RARITIES = ['common','uncommon','rare','epic','legendary']
const RARITY_WEIGHTS = { common:60, uncommon:25, rare:10, epic:4, legendary:1 }
const RARITY_RANK = { common:0, uncommon:1, rare:2, epic:3, legendary:4 }
const EYES = ['·','✦','×','◉','@','°']
const HATS = ['none','crown','tophat','propeller','halo','wizard','beanie','tinyduck']
const STAT_NAMES = ['DEBUGGING','PATIENCE','CHAOS','WISDOM','SNARK']
const RARITY_FLOOR = { common:5, uncommon:15, rare:25, epic:35, legendary:50 }
const RARITY_STARS = { common:'★', uncommon:'★★', rare:'★★★', epic:'★★★★', legendary:'★★★★★' }

function hashString(s) {
  return Number(BigInt(Bun.hash(s)) & 0xffffffffn)
}

function mulberry32(seed) {
  let a = seed >>> 0
  return function() {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)] }

function rollRarity(rng) {
  let roll = rng() * 100
  for (const r of RARITIES) { roll -= RARITY_WEIGHTS[r]; if (roll < 0) return r }
  return 'common'
}

function rollStats(rng, rarity) {
  const floor = RARITY_FLOOR[rarity]
  const peak = pick(rng, STAT_NAMES)
  let dump = pick(rng, STAT_NAMES)
  while (dump === peak) dump = pick(rng, STAT_NAMES)
  const stats = {}
  for (const name of STAT_NAMES) {
    if (name === peak) stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30))
    else if (name === dump) stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15))
    else stats[name] = floor + Math.floor(rng() * 40)
  }
  return stats
}

function rollFull(uid) {
  const rng = mulberry32(hashString(uid + SALT))
  const rarity = rollRarity(rng)
  const species = pick(rng, SPECIES)
  const eye = pick(rng, EYES)
  const hat = rarity === 'common' ? 'none' : pick(rng, HATS)
  const shiny = rng() < 0.01
  const stats = rollStats(rng, rarity)
  return { rarity, species, eye, hat, shiny, stats }
}

function printBuddy(uid, r) {
  console.log(`  Species : ${r.species}`)
  console.log(`  Rarity  : ${r.rarity} ${RARITY_STARS[r.rarity]}`)
  console.log(`  Eye     : ${r.eye}`)
  console.log(`  Hat     : ${r.hat}`)
  console.log(`  Shiny   : ${r.shiny}`)
  console.log(`  Stats   :`)
  for (const name of STAT_NAMES) {
    const val = r.stats[name]
    const bar = '█'.repeat(Math.floor(val / 5)) + '░'.repeat(20 - Math.floor(val / 5))
    console.log(`    ${name.padEnd(10)} ${bar} ${val}`)
  }
  if (uid) console.log(`  uid     : ${uid}`)
}

// --- CLI ---
const args = process.argv.slice(2)
const mode = args[0]

if (mode === 'check') {
  const uid = args[1]
  console.log(`\n=== Current Buddy ===`)
  const r = rollFull(uid)
  printBuddy(uid, r)
  process.exit(0)
}

if (mode === 'reroll') {
  const targetSpecies = args[1] || null
  const wantShiny = args.includes('--shiny')
  const useUuid = args.includes('--uuid')
  const maxIter = parseInt(args[2]) || 5_000_000
  const count = parseInt(args[3]) || 5

  console.log(`\nSearching: legendary${targetSpecies ? ' ' + targetSpecies : ' (any species)'}${useUuid ? ' (UUID format)' : ''}, max ${maxIter.toLocaleString()} iterations, find ${count}`)
  console.log('')

  let found = 0
  const start = Date.now()

  for (let i = 0; i < maxIter; i++) {
    const uid = useUuid ? uuidV4() : crypto.randomBytes(32).toString('hex')
    const r = rollFull(uid)

    if (r.rarity !== 'legendary') continue
    if (targetSpecies && r.species !== targetSpecies) continue
    if (wantShiny && !r.shiny) continue

    found++
    console.log(`--- #${found} ---`)
    printBuddy(uid, r)
    console.log('')

    if (found >= count) break
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(found === 0
    ? `No legendary found in ${maxIter.toLocaleString()} iterations (${elapsed}s)`
    : `Found ${found} legendary in ${elapsed}s`)
  process.exit(0)
}

console.log(`Usage:
  bun buddy-reroll.js check <userID|accountUuid>
  bun buddy-reroll.js reroll [species] [maxIter] [count] [--shiny] [--uuid]

  --uuid    Generate UUID v4 format (for OAuth users with accountUuid)
            OAuth priority: oauthAccount.accountUuid ?? userID ?? "anon"

Species: ${SPECIES.join(', ')}`)

function uuidV4() {
  const bytes = crypto.randomBytes(16)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.toString('hex')
  return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20)
}
