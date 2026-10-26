# Harshit Singh — 3D Portfolio

An interactive 3D portfolio website showcasing software engineering projects, backend systems, mobile applications, and technical experience. Built with React, TypeScript, and Three.js, featuring an interactive 3D workspace, smooth GSAP scroll interactions, and responsive design.

**Developer:** Harshit Singh
**GitHub:** [https://github.com/harshittDEV](https://github.com/harshittDEV)
**LinkedIn:** [https://www.linkedin.com/in/harshit-singh-882b46309/](https://www.linkedin.com/in/harshit-singh-882b46309/)

---

## Technology Stack

* **Frontend Framework:** React 18
* **Language:** TypeScript
* **Build Tool:** Vite
* **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
* **Mesh Compression:** Draco (`public/draco/`)
* **Animation:** GSAP (GreenSock) & ScrollTrigger
* **Smooth Scrolling:** Lenis
* **Icons:** React Icons, Devicon
* **Deployment & Hosting:** Vercel (configured via `vercel.json`)

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* npm

### Installation

Install dependencies using clean install:

```bash
npm ci
```

### Development Server

Start the local development server:

```bash
npm run dev
```

Visit the local URL shown in your terminal (typically `http://localhost:5173/`).

### Production Build

Create an optimized production bundle:

```bash
npm run build
```

This compiles TypeScript (`tsc -b`) and generates production assets with Vite (`vite build`), ensuring type safety before deployment.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

---

## Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

Available environment variables:

* **`SITE_URL`**: The absolute origin of your deployed portfolio (e.g. `https://your-portfolio.vercel.app`), without a trailing slash. Used at build time to populate canonical URLs, Open Graph tags, and sitemaps.
* **`GROQ_API_KEY`**: Optional API key for serverless AI assistant functionality (`api/chat.ts`).

---

## 3D Character & Architecture

The desktop experience features an interactive 3D character at a workstation, rendered via Three.js and React Three Fiber. Key architectural details include:

* **Model & Textures:** The 3D model is stored in `public/models/character.enc` (encrypted with Draco mesh compression) and decrypted at runtime via Web Crypto (`AES-256-CBC`). Lighting is augmented with an HDR environment map (`public/models/char_enviorment.hdr`).
* **Appearance & Palette:** Mesh colors and material properties are driven centrally by `config.character` in [`src/config.ts`](src/config.ts).
* **Scroll Animations:** GSAP timelines coordinate character movements, head tracking, and camera framing as the user navigates through sections.
* **Responsive Fallbacks:** Mobile and touch devices bypass the intensive 3D rendering pipeline to ensure fast load times and clean layout presentation on smaller screens.

---

## Project Structure

```text
.
├── api/                     # Serverless backend functions (Vercel)
├── model-source/            # Source 3D assets (Git LFS pointer)
├── public/                  # Static assets (Draco, models, videos, favicon)
│   ├── draco/               # Draco WebAssembly decoder files
│   ├── models/              # Encrypted model and HDR environment map
│   └── video/               # Background video backdrop
├── scripts/                 # Utility scripts (model encryption, og card)
├── src/
│   ├── components/          # UI sections (Landing, About, Work, Career, Contact)
│   ├── context/             # React context providers
│   ├── data/                # 3D bone and animation data
│   ├── pages/               # Multi-route views (MyWorks, NotFound)
│   ├── utils/               # Breakpoint helpers, motion utilities
│   └── config.ts            # Central portfolio configuration & content
├── vercel.json              # Hosting and caching rules
└── vite.config.ts           # Vite plugins and metadata generation
```

---

## License & Attribution

This repository is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [`LICENSE`](LICENSE) file for details.

Third-party libraries, bundled components, fonts, Draco decoders, and original model assets retain their respective licenses and attributions. See [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) for complete attribution information.
