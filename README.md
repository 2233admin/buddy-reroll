<p align="center">
  <img src="banner.svg" alt="buddy-reroll" width="800"/>
</p>

# buddy-reroll

**Hunt for your dream Claude Code pet — legendary, shiny, or a specific species.**

> Claude Code's `/buddy` companion is deterministic. This tool brute-forces your identity to find the perfect one. 18 species, 5 rarities, infinite possibilities.

---

## The Key Discovery (Most Guides Get This Wrong)

If you're logged in to Claude Code (99% of users), **changing `userID` does nothing.**

You need to change `oauthAccount.accountUuid` instead.

```javascript
// Identity priority (from the binary):
seed = oauthAccount?.accountUuid ?? userID ?? "anon"
```

This is why other guides don't work for you. We fixed it.

---

## 30-Second Setup

### 1. Check what you have
```bash
bun buddy-reroll.js check your-uuid
```

### 2. Hunt for legendary
```bash
# OAuth user (UUID format) — any species
bun buddy-reroll.js reroll "" 5000000 1 --uuid

# Shiny legendary capybara (the holy grail)
bun buddy-reroll.js reroll capybara 50000000 1 --shiny --uuid
```

### 3. Apply
- Copy the `uid` from output
- Edit `~/.claude.json` → change `oauthAccount.accountUuid`
- Delete the `companion` block
- Restart Claude Code + run `/buddy`

---

## What You're Hunting

**18 Species**: duck · goose · blob · cat · dragon · octopus · owl · penguin · turtle · snail · ghost · axolotl · capybara · cactus · robot · rabbit · mushroom · chonk

**5 Rarities**:
- ★ **Common** (60%)
- ★★ **Uncommon** (25%)
- ★★★ **Rare** (10%)
- ★★★★ **Epic** (4%)
- ★★★★★ **Legendary** (1%) ← most people hunt this

**Extras**: 6 eye styles · 8 hats (crown, tophat, propeller, halo, wizard, beanie, tinyduck) · 5 stat levels · **1% shiny chance** (ultra rare)

---

## How It Works

```
seed = hash(identity + SALT) → Mulberry32 PRNG → species, rarity, stats, hat, eyes, shiny
```

**Identity priority**:
```
oauthAccount.accountUuid  (OAuth users — UUID format)
        ↓ if empty
userID                    (Offline/legacy — hex format)
        ↓ if empty
"anon"                    (Fallback)
```

**SALT**: `friend-2026-401`

**Hash function**: `Bun.hash()` (Wyhash) — **Node.js won't work**.

---

## Installation

**Bun required.** Node.js uses FNV-1a hashing, which doesn't match Claude Code's `Bun.hash()`. Your reroll would generate a different pet.

```bash
curl -fsSL https://bun.sh/install | bash
```

---

## Full Usage

### Check your current pet
```bash
bun buddy-reroll.js check <accountUuid-or-userID>
```

### Reroll (options)
```bash
# Legendary dragon — OAuth user
bun buddy-reroll.js reroll dragon 5000000 1 --uuid

# Shiny capybara (any rarity) — non-OAuth user
bun buddy-reroll.js reroll capybara 1000000 1 --shiny

# 3 random legendaries in one go
bun buddy-reroll.js reroll "" 5000000 3 --uuid
```

| Parameter | What it does |
|-----------|-------------|
| `species` | Target species (empty `""` = any) |
| `maxIter` | Max iterations to search (higher = slower but tries harder) |
| `count` | How many to find before stopping |
| `--uuid` | Generate UUID v4 format (use for OAuth users) |
| `--shiny` | Only match shiny companions (1 in 100 legendaries) |

### Real Example
```
$ bun buddy-reroll.js reroll capybara 50000000 1 --shiny --uuid

Searching: legendary capybara (UUID format), max 50,000,000 iterations, find 1

--- #1 ---
  Species : capybara
  Rarity  : legendary ★★★★★
  Eye     : ✦
  Hat     : crown
  Shiny   : true
  Stats   :
    DEBUGGING  █████████████████░░░ 87
    PATIENCE   ██████████░░░░░░░░░░ 50
    CHAOS      ██████████████░░░░░░ 74
    WISDOM     ████████████████████ 100
    SNARK      █████████████████░░░ 85
  uid     : 2810dbbc-4f33-461a-9aa6-afeb70f6f36c

Found 1 legendary in 28.1s
```

---

## Apply Your Reroll

1. **Copy the `uid`** from the output above

2. **Edit `~/.claude.json`**:
   ```jsonc
   {
     "oauthAccount": {
       "accountUuid": "2810dbbc-4f33-461a-9aa6-afeb70f6f36c",  // ← paste uid here
       // keep everything else
     }
   }
   ```

   *Non-OAuth user?*
   ```jsonc
   {
     "userID": "paste-hex-string-here"
   }
   ```

3. **Delete the companion block** (if it exists):
   ```jsonc
   // DELETE THIS:
   "companion": {
     "name": "...",
     "personality": "...",
     "hatchedAt": "..."
   }
   ```

4. **Restart Claude Code**

5. **Run `/buddy`** to meet your new pet

---

## FAQ

**Q: How do I know if I'm OAuth or non-OAuth?**
A: Open `~/.claude.json`. If you see `"oauthAccount"` with `"accountUuid"` (looks like a UUID), you're OAuth. Use `--uuid` and edit `accountUuid`. If there's only `"userID"` (hex string), edit that instead.

**Q: Will this break Claude Code?**
A: No. These IDs are only used for telemetry, A/B tests, and buddy generation. Your conversations, API keys, settings, and everything else stays untouched.

**Q: Can I get my old pet back?**
A: Yes — save your original `accountUuid` before changing it. Swap it back anytime.

**Q: Why does this tool exist if the generation is deterministic?**
A: Because randomly generated seeds are 1 in 100 for legendary, 1 in 10,000 for shiny. This tool brute-forces IDs to find the seed that produces what you want. It's the only way to guarantee results.

**Q: Why Bun and not Node.js?**
A: Claude Code uses Bun internally. The hash function (`Bun.hash`, which is Wyhash) is completely different from Node.js crypto hashes. If you generate a reroll with Node, it won't match what Claude Code produces — you'll get a totally different pet.

**Q: How long does searching take?**
A: Depends on what you hunt:
- Legendary (any species): ~10-30 seconds
- Legendary + specific species: ~1-5 minutes
- Shiny legendary: ~5-15 minutes
- Shiny legendary + specific species: ~30 minutes to several hours

Run it in the background. It's patient.

---

## How We Found This

The companion generation was reverse-engineered from the Claude Code binary via static analysis and runtime testing.

**Key discoveries**:
- The hash seed is `Bun.hash(identity + "friend-2026-401")`
- The identity chain is `oauthAccount.accountUuid ?? userID ?? "anon"`
- Most online guides only mention `userID`, which is why they don't work for logged-in users
- The PRNG is Mulberry32, seeded from the hash

**Binary snippet** (deobfuscated):
```javascript
function getCompanionSeed() {
  const identifier = oauthAccount?.accountUuid ?? userID ?? "anon"
  return Bun.hash(identifier + "friend-2026-401")
}

const rng = mulberry32(getCompanionSeed())
const companion = {
  species: SPECIES[rng() % 18],
  rarity: selectRarity(rng()),
  hat: HATS[rng() % 8],
  eyes: EYES[rng() % 6],
  shiny: rng() < 0.01,
  stats: generateStats(rng),
  // ...
}
```

---

## Credits

**Algorithm discovery**: nemomen on [linux.do](https://linux.do/t/topic/1871870)

**OAuth `accountUuid` priority chain**: Discovered via binary reverse-engineering. This was the missing piece that makes rerolling work for 99% of users.

---

## License

MIT
