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
    name: "Saransh",
    fullName: "Saransh Singh",
    initials: "SS",
    title: "Computer Science Student & Developer",
    /** Shown in the loading marquee. */
    disciplines: [
      "Software Engineering",
      "Full-Stack Development",
      "Data Structures & Algorithms",
    ],
    /** The landing cycles each pair. Keep every line SHORT — they are set
     *  at up to 75px with `white-space: nowrap` and will overflow. */
    article: "A",
    rolesPrimary: ["Software Developer", "Full-Stack Developer"],
    rolesSecondary: ["Problem Solver", "AI/ML Enthusiast"],
    /** Doubles as the meta description, so it has to make the claim inside ~180 characters. */
    description:
      "Computer Science student at DSCE, Bengaluru, building software solutions with a focus on Data Structures, full-stack development, and practical applications.",
    resumeUrl: "/Saransh_Singh_Resume.pdf",
    /** Portrait shown at the close of the page, in the Contact section.
     *  If the file is missing or empty the Contact section renders without it. */
    photo: "",
    photoAlt: "Saransh Singh",
  },

  social: {
    github: "Saransh-06",
    email: "ssa.260506@gmail.com",
    location: "Bengaluru, India",
    timezone: "Asia/Kolkata",
    mainSite: "https://github.com/Saransh-06",
  },

  /* ───────────────────────────  ABOUT  ─────────────────────────── */

  about: {
    title: "About Me",
    /** Set in large type. */
    description:
      "I am a Computer Science undergraduate at Dayananda Sagar College of Engineering (DSCE), Bengaluru, developing my skills in programming, Data Structures and Algorithms, and full-stack development. I enjoy building practical software projects, collaborating with teams, and exploring the intersection of software engineering and AI/ML.",
    facts: [
      { value: "200+", label: "LeetCode problems solved" },
      { value: "3rd", label: "place in college-level CSE hackathon" },
    ],
  },

  /* ─────────────────────────  EXPERIENCE  ───────────────────────── */

  experiences: [
    {
      position: "CTO",
      company: "Verseoid",
      period: "Startup Project",
      year: "Startup",
      location: "Bengaluru, India",
      kind: "work",
      description:
        "Served as CTO in a five-person startup team working on a platform intended to unify tracking of developers' coding progress across multiple platforms.",
      responsibilities: [
        "Collaborated within a five-person startup team on technical direction and architecture.",
        "Researched concepts and architectural workflows for unified developer progress tracking.",
      ],
      technologies: ["System Design", "Technical Direction", "Full-Stack"],
    },
    {
      position: "Hackathon Competitor",
      company: "College-Level CSE Hackathon",
      period: "College",
      year: "3rd Place",
      location: "Bengaluru, India",
      kind: "programme",
      description:
        "Competed in a college-level CSE hackathon, collaborating on software problem solving, rapid prototyping, and presentation.",
      responsibilities: [
        "Secured third place in the competition.",
      ],
      technologies: ["Problem Solving", "Rapid Prototyping", "Teamwork"],
    },
    {
      position: "Bachelor of Technology in Computer Science",
      company: "Dayananda Sagar College of Engineering (DSCE)",
      period: "Expected 2029",
      year: "2029",
      location: "Bengaluru, India",
      kind: "education",
      description:
        "Undergraduate studies focusing on Computer Science foundations, Data Structures and Algorithms, Object-Oriented Programming, and software development.",
      responsibilities: [
        "Foundational coursework in Data Structures and Algorithms, Object-Oriented Programming, and Computer Science fundamentals.",
      ],
      technologies: ["Data Structures", "Algorithms", "Java", "C++"],
    },
  ] as Experience[],

  /* ───────────────────────  CERTIFICATIONS  ─────────────────────── */

  certifications: [] as Certification[],

  /* ───────────────────────────  WORK  ─────────────────────────── */
  /** Ordered strongest-first. The landing scroller shows the first five;
   *  /myworks shows all of them. */

  projects: [
    {
      id: 1,
      title: "TicketPilot",
      category: "Automation / Scheduling Service",
      technologies: "Python, Scheduling, Windows Startup, Automation",
      description:
        "A journey-reminder and scheduling service designed to help users prepare for time-sensitive train-ticket booking windows with IST-based scheduling, alerts, and missed-reminder recovery.",
      link: "https://github.com/Saransh-06/TicketPilot",
      accent: "systems",
      metric: {
        value: "Service",
        label: "Scheduling & reminders",
        caveat:
          "Assists with journey reminders and booking window notifications. Does not automate ticket booking, bypass CAPTCHAs, or process payments.",
      },
    },
    {
      id: 2,
      title: "Marupaḍe",
      category: "Campus Lost & Found Platform",
      technologies: "React, TypeScript, Web Development, Team Project",
      description:
        "A team-built campus lost-and-found platform that helps people report, discover, and reconnect with lost belongings through structured item logging.",
      link: "https://lost-and-found-portal-nu.vercel.app/",
      accent: "web",
      metric: {
        value: "Platform",
        label: "Campus item recovery",
        caveat:
          "Team-built campus platform for reporting and reconnecting with lost belongings.",
      },
    },
  ] as Project[],

  /* ─────────────────────────  CONTACT  ───────────────────────── */

  contact: {
    email: "ssa.260506@gmail.com",
    /** `rail: true` puts it in the fixed left-hand icon strip. */
    socials: [
      {
        icon: "github",
        label: "GitHub",
        handle: "Saransh-06",
        url: "https://github.com/Saransh-06",
        rail: true,
      },
      {
        icon: "linkedin",
        label: "LinkedIn",
        handle: "saransh-singh",
        url: "https://www.linkedin.com/in/saransh-singh-a229b7381/",
        rail: true,
      },
      {
        icon: "leetcode",
        label: "LeetCode",
        handle: "SARANSH-26",
        url: "https://leetcode.com/u/SARANSH-26/",
        rail: true,
      },
    ],
    githubAlt: "https://github.com/Saransh-06",
    availability: {
      status: "Open to connecting",
      detail:
        "Open to software engineering internships, collaborative projects, and technical discussions.",
    },
  },

  /* ───────────────────────  WHAT I DO  ─────────────────────── */
  /** Exactly two panels — WhatIDo.tsx hardcodes two border treatments. */

  skills: {
    engineering: {
      title: "SOFTWARE & ALGORITHMS",
      description: "Data structures, problem solving, and backend logic",
      details:
        "Focusing on computer science fundamentals, algorithmic problem solving, and structured software development. Experienced with Data Structures and Algorithms, Object-Oriented Programming, and core programming languages.",
      tools: [
        "Java",
        "C++",
        "Python",
        "SQL",
        "Data Structures",
        "Algorithms",
        "OOP",
        "Git",
        "GitHub",
        "Problem Solving",
      ],
    },
    shipping: {
      title: "FRONTEND & TOOLS",
      description: "Responsive web interfaces and developer workflows",
      details:
        "Developing responsive web applications and interfaces. Focused on modern web technologies, component-based architectures, and practical developer tools.",
      tools: [
        "HTML",
        "CSS",
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Tailwind CSS",
        "Visual Studio Code",
        "Postman",
        "Full-Stack Development",
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
      { name: "C++", slug: "cplusplus/cplusplus-original" },
      { name: "Python", slug: "python/python-original" },
      { name: "TypeScript", slug: "typescript/typescript-original" },
      { name: "JavaScript", slug: "javascript/javascript-original" },
      { name: "HTML", slug: "html5/html5-original" },
      { name: "CSS", slug: "css3/css3-original" },
      { name: "React", slug: "react/react-original" },
      { name: "Next.js", slug: "nextjs/nextjs-original" },
      { name: "Tailwind CSS", slug: "tailwindcss/tailwindcss-original" },
      { name: "Git", slug: "git/git-original" },
      { name: "GitHub", slug: "github/github-original" },
    ],
    [
      { name: "Visual Studio Code", slug: "vscode/vscode-original" },
      { name: "Postman", slug: "postman/postman-original" },
      { name: "SQL" },
      { name: "Data Structures" },
      { name: "Algorithms" },
      { name: "Object-Oriented Programming" },
      { name: "Full-Stack Development" },
      { name: "Frontend Development" },
      { name: "Software Engineering" },
      { name: "Problem Solving" },
    ],
    [
      { name: "Data Structures & Algorithms" },
      { name: "OOP Principles" },
      { name: "Web Development" },
      { name: "Code Optimization" },
      { name: "System Design Basics" },
      { name: "Clean Code" },
      { name: "Team Collaboration" },
      { name: "Version Control" },
    ],
    [
      { name: "Software Development" },
      { name: "Full-Stack Engineering" },
      { name: "Algorithm Design" },
      { name: "Technical Problem Solving" },
      { name: "AI/ML Exploration" },
      { name: "Practical Applications" },
    ],
    [
      { name: "Computer Science" },
      { name: "Engineering Foundations" },
      { name: "DSA & Problem Solving" },
      { name: "Applied Development" },
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
      "Hi — I'm an AI assistant answering questions about Saransh's work. Ask me about TicketPilot, Marupaḍe, or anything on this site.",
  },
};
