# Minimalist Todo Control Center

A local-first personal task dashboard. Add tasks, mark complete, track categories, and view progress with a light/dark theme toggle. All data stays in the browser (no backend).

## What’s inside
- React + TypeScript + Vite (fast dev/build)
- Redux Toolkit (global state for todos)
- Tailwind CSS (styling)
- hello-pangea/dnd (installed; can be re-enabled if you want drag-and-drop later)

## Features
- Add/edit tasks with title, description, comma-separated categories, priority, and optional due date
- Square checkboxes for completion
- Delete confirmation with optional “don’t ask again” preference
- Light/dark mode toggle stored in localStorage
- Completed and active sections with quick stats and a completion bar

## Getting started
1) Install dependencies  
```bash
npm install
```

2) Run the dev server  
```bash
npm run dev
```
Visit the printed localhost URL.

3) Create a production build (optional)  
```bash
npm run build
```
Output lands in `dist/`.

## Notes
- All data is stored locally; clearing browser storage will reset tasks.
- Drag-and-drop is currently disabled; if you want it back, reintroduce the hello-pangea/dnd wrappers around the active list.
