/**
 * ═══════════════════════════════════════════════════════════════════════
 *  SITE CONTENT — EDIT THIS FILE, NOTHING ELSE.
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Every section reads from here: the landing, About, What I Do, Career,
 *  Work, the Tech Stack pyramid, Contact and the /myworks page.
 *
 *  HOW METRICS WORK
 *  ────────────────────────────────────────────────
 *  A `metric` carries `label`, `value`, and optional `baseline` and `caveat`.
 *  The project cards render the value; /myworks renders the caveat underneath.
 * ═══════════════════════════════════════════════════════════════════════
 */

/** Drives the project card accent colour. */
export type Accent = "ml" | "systems" | "security" | "web" | "practice";

export const accentColors: Record<Accent, string> = {
  ml: "#35d6c0",
  systems: "#f0a03c",
  security: "#8b7bd8",
  web: "#5fbf6a",
  practice: "#9aa3a8",
};

export interface Metric {
  /** The number or status itself. */
  value: string;
  /** What it measures. Short — it sits under the value. */
  label: string;
  /** What this beat. */
  baseline?: string;
  /** The honest footnote: what it cost, or what it doesn't prove. */
  caveat?: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  /** Comma-separated — the template renders it as one line. */
  technologies: string;
  description: string;
  /** Optional screenshot. Leave undefined and a generated SVG card is
   *  rendered instead, so a card is never a broken image. */
  image?: string;
  /** Primary link. Internal routes start with "/". */
  link: string;
  accent: Accent;
  metric?: Metric;
}

export interface Experience {
  position: string;
  company: string;
  /** Human range. Used as the fallback for the big year. */
  period: string;
  /** Overrides the big number on the timeline. Use "NOW" for current. */
  year?: string;
  location: string;
  kind: "work" | "programme" | "education";
  description: string;
  /** Outcomes, not duties. */
  responsibilities: string[];
  technologies: string[];
  link?: { label: string; url: string };
}

export interface Certification {
  title: string;
  issuer: string;
  year: string;
  /** Verification or information link. */
  url: string;
  /** "major" = a full programme, rendered as a card. "course" = one
   *  component, folded inside its parent. */
  tier: "major" | "course";
  /** Programmes only: what the programme spans. */
  covers?: string;
  credentialId?: string;
  /** Exact `title` of the programme this course rolls up into. Courses with
   *  no parent render in the standalone group. */
  parent?: string;
  note?: string;
}

/* ───────────────────────────  IDENTITY  ─────────────────────────── */

export const config = {
  developer: {
    name: "Harshit",
    fullName: "Harshit Singh",
    initials: "HS",
    title: "Software Developer | Backend Engineering & Mobile Applications",
    /** Shown in the loading marquee. */
    disciplines: ["Backend Engineering", "Mobile Applications", "Database Systems"],
    /** The landing cycles each pair. Keep every line SHORT — they are set
     *  at up to 75px with `white-space: nowrap` and will overflow. */
    article: "A",
    rolesPrimary: ["Software Developer", "Backend Developer"],
    rolesSecondary: ["Backend & Mobile", "Reliable Systems"],
    /** Doubles as the meta description, so it has to make the claim inside ~180 characters. */
    description:
      "I build software that solves practical problems, combining mobile and frontend development with database design, API development, and secure application architecture.",
    resumeUrl: "/HarshitSingh_CV.pdf",
    /** Portrait shown at the close of the page, in the Contact section.
     *  If the file is missing the Contact section renders without it rather than
     *  showing a broken image. */
    photo: "/images/harshit.png",
    photoAlt: "Harshit Singh",
  },

  social: {
    github: "harshittDEV",
    email: "harshitsinghh1128@gmail.com",
    location: "Bengaluru, India",
    timezone: "IST, UTC+5:30",
    mainSite: "https://github.com/harshittDEV",
  },

  /* ───────────────────────────  ABOUT  ─────────────────────────── */

  about: {
    title: "About Me",
    /** Set in large type. */
    description:
      "I’m a software developer focused on building practical applications and understanding the engineering behind them. My work spans mobile application development, interactive user interfaces, database-driven systems, and backend development. I enjoy taking ideas from concept to implementation, exploring different architectural approaches, and solving problems that require more than just writing code. Through personal projects, collaborative development, and open-source contributions, I’m continuously strengthening my understanding of software engineering, application security, and reliable system design. I’m particularly interested in backend engineering, mobile applications, and building products that are useful, maintainable, and thoughtfully designed.",
    facts: [
      { value: "6", label: "projects in mobile, backend and database systems" },
      { value: "2", label: "certifications — HackerRank SQL and Java (Basic)" },
      { value: "3", label: "hackathon and competitive programming recognitions" },
      { value: "1", label: "open-source pull request to Metabase" },
    ],
  },

  /* ─────────────────────────  EXPERIENCE  ───────────────────────── */

  experiences: [
    {
      position: "Co-founder and Lead",
      company: "Versoid",
      period: "Jul 2026 – Nov 2026",
      year: "2026",
      location: "Bengaluru, India",
      kind: "work",
      description:
        "Leading product planning and cross-functional team coordination, guiding practical applications from concept to architecture.",
      responsibilities: [
        "Managing product planning and feature roadmaps across development stages.",
        "Coordinating development efforts to ensure cohesive execution and focus on practical utility.",
      ],
      technologies: ["Product Planning", "Team Coordination", "System Design"],
    },
    {
      position: "Hackathon Finalist & Competitor",
      company: "Hackathons & Competitions",
      period: "2026",
      year: "2026",
      location: "Bengaluru, India",
      kind: "programme",
      description:
        "Competitive technical development, problem solving, and product prototyping in structured hackathons.",
      responsibilities: [
        "Hacktoberfest event at Startup Park (October 2026) — reached the finals.",
        "HackerRank Orchestrate (October 2026) — reached the finals.",
        "Zero to One (June 2026) — awarded third place.",
      ],
      technologies: ["Problem Solving", "Rapid Prototyping", "Teamwork"],
    },
    {
      position: "Open-Source Contributor",
      company: "Metabase",
      period: "2026",
      year: "2026",
      location: "Remote",
      kind: "work",
      description:
        "Contributed to the open-source business intelligence platform Metabase.",
      responsibilities: [
        "Authored pull request #84991 to resolve SQL autocomplete behavior when text follows the cursor.",
      ],
      technologies: ["TypeScript", "SQL", "Git", "Open Source"],
      link: {
        label: "Pull request #84991",
        url: "https://github.com/metabase/metabase/pull/84991",
      },
    },
    {
      position: "B.E. in Computer Science and Engineering",
      company: "Dayananda Sagar College of Engineering",
      period: "Expected 2029",
      year: "2029",
      location: "Bengaluru, India",
      kind: "education",
      description:
        "Undergraduate degree focusing on core computer science foundations, algorithms, data structures, and software engineering.",
      responsibilities: [
        "Foundational coursework in Data Structures and Algorithms, Object-Oriented Programming, and Database Design.",
      ],
      technologies: ["Data Structures", "Algorithms", "Database Design", "Java"],
    },
  ] as Experience[],

  /* ───────────────────────  CERTIFICATIONS  ─────────────────────── */

  certifications: [
    {
      title: "SQL (Basic)",
      issuer: "HackerRank",
      year: "2026",
      url: "https://www.hackerrank.com/skills-verification",
      tier: "major",
      covers: "Relational Queries & Aggregations",
      note: "Covers SQL queries, filtering conditions, joins, grouping, and aggregations.",
    },
    {
      title: "Java (Basic)",
      issuer: "HackerRank",
      year: "2026",
      url: "https://www.hackerrank.com/skills-verification",
      tier: "major",
      covers: "Java Fundamentals & OOP",
      note: "Covers core language syntax, object-oriented concepts, and control flow in Java.",
    },
  ] as Certification[],

  /* ───────────────────────────  WORK  ─────────────────────────── */
  /** Ordered strongest-first. The landing scroller shows the first five;
   *  /myworks shows all of them. */

  projects: [
    {
      id: 1,
      title: "CampusMart",
      category: "Campus Marketplace / Full-Stack Development",
      technologies: "Mobile Development, Architecture",
      description:
        "A campus-focused marketplace designed to help students discover and exchange products within their college community.",
      link: "https://github.com/harshittDEV/CampusMart",
      accent: "web",
      metric: {
        value: "In Dev",
        label: "Campus marketplace",
        caveat:
          "In development; describes architectural intent without claiming unimplemented features.",
      },
    },
    {
      id: 2,
      title: "ScopeLock AI",
      category: "AI Workflows / Task Execution",
      technologies: "AI Workflows, Task Execution",
      description:
        "A project focused on AI-assisted workflows and task execution.",
      link: "https://github.com/harshittDEV/ScopeLock-AI",
      accent: "ml",
      metric: {
        value: "Completed",
        label: "Workflow execution",
        caveat:
          "Repository project; claims no unverified external benchmarks or proprietary models.",
      },
    },
    {
      id: 3,
      title: "TicketPilot",
      category: "Automation / Backend",
      technologies: "Python, FastAPI, Agent Workflows",
      description:
        "A railway booking automation project with a FastAPI backend and agent execution workflow.",
      link: "https://github.com/harshittDEV/TicketPilot",
      accent: "systems",
      metric: {
        value: "In Dev",
        label: "FastAPI agent workflow",
        caveat:
          "In active development. Does not claim live booking integration or production deployment.",
      },
    },
    {
      id: 4,
      title: "OrgCore",
      category: "Database / Management",
      technologies: "SQL, Database Design, Schema Architecture",
      description:
        "An employee management and database system structured around normalized schema design and relational records.",
      link: "https://github.com/harshittDEV/OrgCore-EmployeeManagementDatabase",
      accent: "systems",
      metric: {
        value: "Database",
        label: "Relational records management",
        caveat:
          "Focuses on schema design and records management without fabricated performance metrics.",
      },
    },
    {
      id: 5,
      title: "Lost and Found Portal",
      category: "Web Application",
      technologies: "JavaScript, Web Development, Database",
      description:
        "A dedicated community portal designed to report, track, and recover lost and found belongings with structured item logging.",
      link: "https://github.com/harshittDEV/lost_and_found_portal",
      accent: "web",
      metric: {
        value: "Portal",
        label: "Item recovery workflow",
        caveat:
          "Functional community utility application for structured item logging.",
      },
    },
    {
      id: 6,
      title: "Flutter Credit Card UI",
      category: "Mobile UI",
      technologies: "Flutter, Dart, Mobile UI",
      description:
        "An interactive mobile card interface focusing on clean visual hierarchy, reactive component structure, and smooth state transitions.",
      link: "https://github.com/harshittDEV/flutter-credit-card-ui",
      accent: "practice",
      metric: {
        value: "Mobile UI",
        label: "Component design in Flutter",
        caveat:
          "UI-focused project; does not claim backend payment processing or financial integrations.",
      },
    },
  ] as Project[],

  /* ─────────────────────────  CONTACT  ───────────────────────── */

  contact: {
    email: "harshitsinghh1128@gmail.com",
    /** `rail: true` puts it in the fixed left-hand icon strip. */
    socials: [
      {
        icon: "github",
        label: "GitHub",
        handle: "harshittDEV",
        url: "https://github.com/harshittDEV",
        rail: true,
      },
      {
        icon: "linkedin",
        label: "LinkedIn",
        handle: "harshit-singh",
        url: "https://www.linkedin.com/in/harshit-singh-882b46309/",
        rail: true,
      },
      {
        icon: "leetcode",
        label: "LeetCode",
        handle: "aHu59DzfYF",
        url: "https://leetcode.com/u/aHu59DzfYF/",
        rail: false,
      },
    ],
    githubAlt: "https://github.com/harshittDEV",
    availability: {
      status: "Open to opportunities",
      detail:
        "Open to internships, freelance opportunities, and collaborations.",
    },
  },

  /* ───────────────────────  WHAT I DO  ─────────────────────── */
  /** Exactly two panels — WhatIDo.tsx hardcodes two border treatments. */

  skills: {
    engineering: {
      title: "BACKEND & DATABASES",
      description: "APIs, schema design, and architectures",
      details:
        "Building reliable services and structured data models. Focused on relational database design, query optimization, clean API development, and secure authentication flows.",
      tools: [
        "Java",
        "SQL",
        "MySQL",
        "PostgreSQL",
        "SQLite",
        "TypeScript",
        "API Development",
        "Database Design",
        "Authentication",
        "Application Security",
        "Data Structures & Algorithms",
      ],
    },
    shipping: {
      title: "FRONTEND & MOBILE",
      description: "Cross-platform mobile applications and interfaces",
      details:
        "Developing responsive mobile applications and intuitive user interfaces. Focused on component architecture, state management, and reliable cross-platform execution.",
      tools: [
        "Flutter",
        "Dart",
        "React Native",
        "Swift",
        "HTML",
        "CSS",
        "JavaScript",
        "Mobile Development",
        "Open-Source Contributions",
      ],
    },
  },

  /* ─────────────────────────  TECH STACK  ───────────────────────── */
  /**
   * Rendered as an inverted pyramid, so the row lengths matter:
   * 12 → 10 → 8 → 6 → 4 → 2. Keep those counts if you edit.
   */

  techStack: [
    [
      { name: "Java", slug: "java/java-original" },
      { name: "JavaScript", slug: "javascript/javascript-original" },
      { name: "TypeScript", slug: "typescript/typescript-original" },
      { name: "Dart", slug: "dart/dart-original" },
      { name: "SQL" },
      { name: "HTML", slug: "html5/html5-original" },
      { name: "CSS", slug: "css3/css3-original" },
      { name: "Flutter", slug: "flutter/flutter-original" },
      { name: "React Native", slug: "react/react-original" },
      { name: "Swift", slug: "swift/swift-original" },
      { name: "Git", slug: "git/git-original" },
      { name: "GitHub", slug: "github/github-original" },
    ],
    [
      { name: "MySQL", slug: "mysql/mysql-original" },
      { name: "PostgreSQL", slug: "postgresql/postgresql-original" },
      { name: "SQLite", slug: "sqlite/sqlite-original" },
      { name: "Relational Databases" },
      { name: "Database Design" },
      { name: "API Development" },
      { name: "REST APIs" },
      { name: "Mobile Development" },
      { name: "Backend Engineering" },
      { name: "Open Source" },
    ],
    [
      { name: "Data Structures" },
      { name: "Algorithms" },
      { name: "Authentication" },
      { name: "Application Security" },
      { name: "Schema Architecture" },
      { name: "Mobile Architecture" },
      { name: "System Design" },
      { name: "Open-Source Contributions" },
    ],
    [
      { name: "LeetCode" },
      { name: "Problem Solving" },
      { name: "Backend Systems" },
      { name: "Mobile Applications" },
      { name: "Relational Models" },
      { name: "API Architecture" },
    ],
    [
      { name: "Algorithms & DSA" },
      { name: "Secure Systems" },
      { name: "Database Systems" },
      { name: "Application Engineering" },
    ],
    [
      { name: "Computer Science" },
      { name: "Software Engineering" },
    ],
  ],

  /* ─────────────────────────  CHARACTER  ───────────────────────── */
  /**
   * The 3D avatar's colouring.
   *
   * Preserved unchanged in this phase.
   */
  character: {
    skin: "#a9764a",
    skinShadow: "#96683f",
    hair: "#140f0c",
    shirt: "#2b2f3a",
    pants: "#1d2027",
    shoes: "#141519",
    skinRoughness: 0.62,
    clothRoughness: 0.86,
  },

  /* ───────────────────────────  /PLAY  ─────────────────────────── */
  /**
   * IMPORTANT — READ BEFORE EDITING.
   *
   * The engine on this page is Stockfish 10 (GPLv3), served from
   * public/stockfish.wasm.js + .wasm with public/stockfish.js as the asm.js
   * fallback. It is NOT my work, and it is NOT a portfolio project.
   */
  play: {
    title: "Play chess, ask my AI",
    engineName: "Stockfish",
    engineCredit:
      "Stockfish — copyright T. Romstad, M. Costalba, J. Kiiski, G. Linscott and contributors, compiled to WebAssembly by Niklas Fiekas. Licensed under the GNU GPL v3. Not my work.",
    engineUrl: "https://stockfishchess.org/",
    licenseUrl: "https://www.gnu.org/licenses/gpl-3.0.html",
    searchDepth: 12,
    chatGreeting:
      "Hi — I'm an AI assistant answering questions about Harshit's work. Ask me about TicketPilot, CampusMart, OrgCore, or anything on this site.",
  },
};
