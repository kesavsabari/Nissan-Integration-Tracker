# Nissan Integration Tracker - Project Memory

## 🚀 Project Overview
A high-performance, **Zero-Dependency** web application for tracking regional software integrations across Nissan and INFINITI brands.

## 🛠 Tech Stack
- **Backend:** Node.js `http` (Zero-dependency mode).
- **Frontend:** Vanilla JavaScript (ES6+), CSS3 (Modern features like CSS Nesting & Content Visibility).
- **Data Storage:** Data is split into granular files: `regions.json`, `integrations.json`, `statuses.json`, and `history.json`. The server merges them on fetch and splits them on save, keeping the structure clean and maintainable. Monolithic `data.json` has been removed.

## 🧠 Key Rules & Constraints
- **Zero-Dependency:** Do NOT add npm packages, external libraries, or complex frameworks (No Flask, No React, No Tailwind).
- **Performance First:** Maintain gzip compression, lazy rendering, and debounced inputs.
- **Storage Strategy:** Only store "overriding" statuses in `statuses.json`. Default states (`status: 'none'` with no note) should be pruned to keep the file size minimal. Data is partitioned into `regions`, `integrations`, and `statuses` files.

## ✅ Recent Updates (April 2026)
- **JSON Optimization:** Refactored storage to an "override-only" model, reducing payload size by 95%.
- **Server Modernization:** Implemented built-in `gzip` compression in `server.js`.
- **UI Modernization:**
  - **Glassmorphism:** Translucent floating bulk action bar with background blur.
  - **Micro-interactions:** Tactile button scaling and smooth transitions.
  - **Smooth Scroll:** Enabled global smooth scrolling and modern custom scrollbars.
  - **Lazy Rendering:** Used `content-visibility` for high-speed table scrolling.
- **New Features:**
  - **Executive Summary Charts:** Professional multi-stack distribution bars (Done/Progress/Blocked/None) for each region.
  - **Automatic Backups:** Throttled backup system in `server.js` that keeps the last 10 versions of all data files in a `backups/` folder.
  - **Global Activity Feed:** Searchable audit log of all status changes.
  - **Sidebar Progress:** Live completion percentages on region filters.
  - **Market Grouping:** Ability to categorize markets (e.g., "Tier 1") in tables.

## 📋 Current State
- **Brand Support:** Nissan and INFINITI are fully switchable in all views.
- **Data Integrity:** ASEAN region history was recently reset for testing. INFINITI data is currently being populated.
- **Server:** Running on port `5000`.

## 📍 Next Steps
- Continue populating INFINITI integration data.
- Add keyboard shortcuts for power-user data entry (Esc, Ctrl+S, B).
- Refine detailed status reporting with per-market drill-downs.
