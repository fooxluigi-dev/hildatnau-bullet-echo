# Bullet Echo · Hildatnau prototype

Top-down twin-stick shooter. Vanilla JS, zero deps, single file. Built in one evening as a prototype capturing the essence of [Bullet Echo](https://www.bulletecho.game/) (ZeptoLab).

## Play

`hildatnau-tetris` → see the deployed version. (URL: TBD)

## Controls

- **WASD** or **arrows** — move
- **Mouse** — aim
- **Click** or **Space** — shoot
- **Q** (hold) — charge ability (brief invuln + speed boost)
- **R** — restart with custom seed

### Mobile (touch twin-stick)
- Left half of screen = move stick (drag from where you touched)
- Right half = aim stick (drag from where you touched, hold to shoot)

## What this is

A prototype that captures the **paternité** of Bullet Echo:

- Top-down view
- Twin-stick controls (movement + aim independent)
- Real-time combat with bullets, line-of-sight, cover
- Enemies with state-machine AI (patrol → chase → take cover → peek)
- Wave-based progression
- Daily mode that changes the rules

## What this isn't

A faithful Bullet Echo replica. We're missing:

- Multiplayer (Bullet Echo is PvP team-based)
- Multiple heroes with unique abilities
- Polished art assets (we're using colored circles)
- Maps and progression
- Sound design

## The Surprise: Daily Modes

Every day has a different rule set. Same day → same mode. Press R to type a custom seed.

| Mode | What changes |
|---|---|
| **Frenzy** | Enemies 1.6× faster, shoot 1.4× faster. Pure chaos. |
| **Glass Cannon** | 1 HP for everyone. One bullet kills anything. |
| **Slow Motion** | Everything runs at 60% speed (you included). |
| **Ghost Walls** | Walls are 50% transparent. You see through cover. |
| **Bullet Storm** | Enemies fire 3-bullet spreads. |
| **Siege** | Enemies have 2× HP but deal 0.6× damage. You outlast them. |
| **Juggernaut** | Player has 2× HP, deals 0.6× damage. Brawler mode. |

Try `frenzy`, `glass`, `slowmo`, `ghost`, `storm`, `siege`, `juggernaut` as seeds.

## Tech

- HTML5 Canvas 2D (single buffer, no offscreen optimization)
- Vanilla JS — no build, no framework
- FNV-1a hash + Mulberry32 PRNG for deterministic seeds
- Custom physics: AABB circle-wall collision with push-out resolution
- AI state machine (patrol → chase → cover) with line-of-sight checks
- Particle system for impact feedback
- Touch input with virtual twin sticks (no third-party libs)

## Why this exists

Luigi asked: *"Can you create a base version of 1 game of 'bullet echo'?"*

A faithful port of Bullet Echo is impossible in vanilla JS (it's a multiplayer mobile game with assets and server infrastructure). What we can do is capture the **paternité** — the feel of top-down twin-stick combat — and add something new: a daily mode system that makes every day's play different.

Built in ~1 hour from the request, with a surprise mechanic (daily modes) that's shareable.

## Files

- `bullet-echo.html` — the entire game (~32KB)
- `README.md` — this file

## Run locally

```bash
open bullet-echo.html
```

## Deploy

```bash
./deploy-herenow.sh
```

## Test

```bash
node test-gameplay.js
```

Runs 1800 frames of simulated gameplay, verifies all 7 daily modes, collision helpers, and AI state transitions.

---

Built 2026-06-27 in one evening. From a single Telegram message: *"Can you create a base version of 1 game of 'bullet echo'?"*
