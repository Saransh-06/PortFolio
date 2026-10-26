# Third-party notices

Third-party code and assets that ship to the browser, listed so the licences
are actually satisfied rather than assumed.

---

## Stockfish (the `/play` chess engine)

**Stockfish 10** — copyright T. Romstad, M. Costalba, J. Kiiski, G. Linscott
and contributors. Multi-variant support by Daniel Dugovic and contributors.
Compiled to WebAssembly and asm.js by Niklas Fiekas.

- Upstream: <https://github.com/official-stockfish/Stockfish>
- The build bundled here: <https://github.com/niklasf/stockfish.js> (npm `stockfish.js@10.0.2`)
- Licence: **GNU General Public License v3**, full text at
  [`public/stockfish-COPYING.txt`](public/stockfish-COPYING.txt), served at
  `/stockfish-COPYING.txt`

Files: `public/stockfish.wasm.js`, `public/stockfish.wasm`, `public/stockfish.js`.
They are verbatim copies of that package — unmodified, banner intact.

**Why this section exists.** These three files are Stockfish, verbatim and
unmodified, with their copyright banner intact. The engine is credited on the
page under the board rather than presented as anything else, and the number
shown in the UI is search depth — not an ELO rating.

The engine is a bundled artifact, not a linked library, and it keeps its own
GPLv3 terms — the AGPL-3.0 licence on this repository covers this repository's
source only. If you fork this and are unsure what that means for you, read
the GPL text rather than taking my word for it.

---

## Chess piece graphics

The SVG piece set in `src/pages/Play.tsx` derives from **Cburnett**'s
standard chess pieces (Wikimedia Commons), recoloured to this site's palette.
Licensed **CC BY-SA 3.0** / GFDL.
<https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces>

---

## Icons

**Devicon** — technology logos in the tech-stack marquee, loaded at runtime
from jsDelivr. MIT. <https://github.com/devicons/devicon>

**React Icons** — Font Awesome and Material icon sets. MIT, with each bundled
set under its own terms. <https://github.com/react-icons/react-icons>

---

## Fonts

**Geist** — Vercel. SIL Open Font License 1.1. Loaded from Google Fonts.
<https://github.com/vercel/geist-font>

---

## Draco decoder (the 3D character)

**Draco** — Google's mesh compression library. The character GLB is
Draco-compressed, so the decoder ships with the site and runs in the browser.

- Upstream: <https://github.com/google/draco>
- Licence: **Apache License 2.0**
- Files: `public/draco/draco_decoder.wasm`, `public/draco/draco_wasm_wrapper.js`

Both are verbatim copies of the build distributed with three.js
(`node_modules/three/examples/jsm/libs/draco/`), unmodified, and must stay a
matched pair — a wrapper and a `.wasm` from different Draco builds do not
interoperate.

---

## The character model and the background video

`public/models/character.enc` (the 3D figure) and `public/video/video.webm`
(the tech-stack backdrop) came with the template this site was built from and
are used with its author's permission as part of it. They are not covered by
this repository's AGPL-3.0 licence and are not mine to relicense.

---

## Everything else

The runtime dependencies (React, Three.js, @react-three/\*, GSAP, Lenis,
chess.js, react-router-dom, react-fast-marquee, Vercel Analytics and Speed
Insights) are listed in `package.json` with their versions, and each carries
its own licence in `node_modules`. None are modified here.
