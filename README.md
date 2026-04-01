<p align="center">
  <img src="banner.svg" alt="buddy-reroll" width="800"/>
</p>

# buddy-reroll

Reroll your Claude Code `/buddy` pet until you get the perfect one.

> Claude Code 2.1.89+ added a `/buddy` feature that generates a deterministic pet from your `userID`. This tool brute-forces userIDs to find your dream companion — legendary, shiny, specific species, whatever you want.

## How it works

Every buddy is deterministically generated from `hash(userID + SALT)` using Mulberry32 PRNG. The `userID` lives in `~/.claude.json`. Swap it, restart Claude Code, run `/buddy` — new pet.

**18 species**: duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk

**5 rarities**: ★ common (60%) · ★★ uncommon (25%) · ★★★ rare (10%) · ★★★★ epic (4%) · ★★★★★ legendary (1%)

**Extras**: 6 eye styles · 8 hats · 5 stats (DEBUGGING/PATIENCE/CHAOS/WISDOM/SNARK) · 1% shiny chance

## Requirements

**Bun** is required. Node.js uses FNV-1a hashing which does NOT match Claude Code's `Bun.hash()` — your rolled uid will produce a completely different pet.

```bash
# Install Bun if you don't have it
curl -fsSL https://bun.sh/install | bash
```

## Usage

### Check your current buddy

```bash
# Find your userID in ~/.claude.json, then:
bun buddy-reroll.js check <your-userID>
```

### Reroll for legendaries

```bash
# Any legendary
bun buddy-reroll.js reroll "" 5000000 3

# Legendary dragon
bun buddy-reroll.js reroll dragon 5000000 3

# Shiny legendary capybara (the holy grail)
bun buddy-reroll.js reroll capybara 50000000 1 --shiny
```

### Apply the result

1. Copy the `uid` from the output
2. Edit `~/.claude.json`:
   - Replace `"userID"` value with the new uid
   - Delete the entire `"companion"` block (name + personality + hatchedAt)
3. Restart Claude Code
4. Run `/buddy` to meet your new pet

## Examples

```
$ bun buddy-reroll.js reroll capybara 50000000 1 --shiny

Searching: legendary capybara, max 50,000,000 iterations, find 1

--- #1 ---
  Species : capybara
  Rarity  : legendary ★★★★★
  Eye     : ◉
  Hat     : beanie
  Shiny   : true
  Stats   :
    DEBUGGING  ████████████░░░░░░░░ 62
    PATIENCE   ████████░░░░░░░░░░░░ 44
    CHAOS      ████████████████████ 100
    WISDOM     ██████████████░░░░░░ 71
    SNARK      ████████████████░░░░ 84
  uid     : 82c23466ec41567b7cf20367c730640f76bd375cb45b606a18bad8dfa8f7ecea

Found 1 legendary in 0.0s
```

## FAQ

**Q: Will changing userID break anything?**
A: No. userID is only used for telemetry, A/B bucketing, and buddy generation. Your conversations, API keys, and settings are unaffected.

**Q: What about OAuth users?**
A: OAuth users' buddy is seeded from `oauthAccount.accountUuid` instead of `userID`. See [this guide](https://linux.do/t/topic/1871870) for OAuth-specific instructions.

**Q: Can I get the same pet back?**
A: Yes — just save your old userID before replacing it.

## Credits

Based on source analysis from [linux.do/t/topic/1871870](https://linux.do/t/topic/1871870) by **nemomen**. Algorithm matches Claude Code 2.1.89 native (Bun).

## License

MIT
