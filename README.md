# FFXIVTracker

FFXIVTracker is a fan-made React + Vite project for browsing, filtering, and tracking Final Fantasy XIV collection content.

Live site: [ffxivtracker.vercel.app](https://ffxivtracker.vercel.app/)

It pulls live data from the public [FFXIV Collect](https://ffxivcollect.com/) API and presents it in a browsable tracker-style interface with themed cards, search and filter tools, favorites, detail modals, and character-based ownership syncing.

## What It Does

- Fetches live mounts, minions, accessories, and achievements from FFXIV Collect
- Displays artwork, source details, patch/expansion info, and ownership counts
- Supports search, source filtering, expansion filtering, and collection-state filtering
- Lets you favorite entries for quicker browsing
- Opens a detailed modal view for each collection entry
- Links users to relevant external sources when available
- Supports character sync so owned and missing entries can be highlighted in the UI
- Keeps accessory ownership available locally on the device for manual tracking

## Current Features

- Dynamic API-driven collection lists
- Search by name or source text
- Source-type filtering
- Expansion filtering from ARR through Dawntrail
- Compact sticky filter sidebar
- Favorites system stored locally
- Character search and sync integration
- Owned / missing collection filtering after sync
- Theme-aware card styling for mounts, minions, accessories, and achievements
- Detail modals with richer source and ownership information
- Minion Verminion stats and source details
- Responsive layout for desktop and mobile

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- FFXIV Collect API

## Character Sync

Character sync is handled through local API-style middleware in development/preview and uses FFXIV Collect character data to:

- search for characters by name, world, and data center
- refresh character data when possible
- retrieve owned mount and minion data
- compare synced ownership against the collection list in the app
- support manual local ownership tracking for accessories

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build locally

## Project Notes

- This is a personal hobby project built for learning, experimentation, and portfolio growth.
- The UI and data handling are still evolving.
- Some source linking is direct, while some links are inferred from available source data.
- Card styling is intentionally theme-specific so each collection tab feels distinct.

## Disclaimer

This is a non-commercial fan-made project.

Final Fantasy XIV and all related names, media, and assets belong to Square Enix.

Mount and minion data is provided through the public [FFXIV Collect](https://ffxivcollect.com/) service.

## Future Ideas

- More UI/UX polish
- Additional sorting and collection tools
- More refined mobile interactions
