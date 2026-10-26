import { Accent, accentColors, Project } from "../config";
import "./styles/ProjectCard.css";

/**
 * Renders a project card as inline SVG, generated from config.
 *
 * WHY THIS EXISTS
 * ───────────────
 * A screenshot per project is the ideal, but a missing screenshot is a
 * broken image — worse than no image at all. So a card is always drawn
 * from the project's own data. Drop a real screenshot in and set
 * `image` on the project in config.ts; this stops being used for it.
 *
 * The motif is deliberately abstract — a dot field and a corner
 * bracket. It does NOT draw a chart, because the numbers here aren't
 * comparable to each other and a bar height would be a claim the data
 * doesn't support.
 */

interface Props {
  project: Project;
  index: number;
  /** "work" = the horizontal scroller, "grid" = the /myworks grid. */
  variant?: "work" | "grid";
}

/** Big numbers need to shrink as they get longer, or they overflow. */
const valueFontSize = (value: string) => {
  if (value.length <= 6) return 62;
  if (value.length <= 10) return 44;
  if (value.length <= 14) return 33;
  return 25;
};

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/** Strip the em-dash clause — the card only has room for the number. */
const shortBaseline = (baseline: string) => truncate(baseline, 42);

const withAlpha = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const DOT_COLS = 13;
const DOT_ROWS = 6;

const ProjectCard = ({ project, index, variant = "work" }: Props) => {
  const accent = accentColors[(project.accent as Accent) ?? "practice"];
  const gradientId = `pc-glow-${project.id}`;
  const metric = project.metric;
  const number = String(index + 1).padStart(2, "0");

  const dots = [];
  for (let row = 0; row < DOT_ROWS; row++) {
    for (let col = 0; col < DOT_COLS; col++) {
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={296 + col * 11}
          cy={232 + row * 11}
          r={1.1}
          fill="#ffffff"
          opacity={0.05 + (row / DOT_ROWS) * 0.11}
        />
      );
    }
  }

  return (
    <svg
      className={`project-card project-card-${variant}`}
      viewBox="0 0 440 330"
      role="img"
      aria-label={
        metric
          ? `${project.title} — ${project.category}. ${metric.value} ${metric.label}.`
          : `${project.title} — ${project.category}.`
      }
      preserveAspectRatio={variant === "grid" ? "xMidYMid slice" : "xMidYMid meet"}
    >
      <defs>
        <radialGradient id={gradientId} cx="82%" cy="14%" r="72%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.26" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="440" height="330" rx="14" fill="#0f0c11" />
      <rect x="0" y="0" width="440" height="330" rx="14" fill={`url(#${gradientId})`} />
      <rect
        x="0.75"
        y="0.75"
        width="438.5"
        height="328.5"
        rx="13.5"
        fill="none"
        stroke={withAlpha(accent, 0.26)}
        strokeWidth="1.5"
      />

      {dots}

      {/* Corner bracket — accent, top-left, purely a frame device. */}
      <path
        d="M28 60 L28 30 L58 30"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        opacity="0.75"
      />

      <text
        x="72"
        y="35"
        fill={accent}
        fontSize="11.5"
        fontWeight="500"
        letterSpacing="2.2"
        fontFamily="Geist, sans-serif"
      >
        {project.category.toUpperCase()}
      </text>

      <text
        x="412"
        y="35"
        textAnchor="end"
        fill="rgba(255,255,255,0.28)"
        fontSize="12"
        letterSpacing="1.5"
        fontFamily="Geist, sans-serif"
      >
        {number}
      </text>

      {metric ? (
        <>
          <text
            x="28"
            y="168"
            fill="#eae5ec"
            fontSize={valueFontSize(metric.value)}
            fontWeight="500"
            letterSpacing="-1"
            fontFamily="Geist, sans-serif"
          >
            {metric.value}
          </text>
          <text
            x="28"
            y="196"
            fill="rgba(255,255,255,0.5)"
            fontSize="14"
            fontFamily="Geist, sans-serif"
          >
            {truncate(metric.label, 40)}
          </text>
        </>
      ) : (
        <text
          x="28"
          y="176"
          fill="#eae5ec"
          fontSize={valueFontSize(project.title)}
          fontWeight="500"
          letterSpacing="-1"
          fontFamily="Geist, sans-serif"
        >
          {project.title}
        </text>
      )}

      <line
        x1="28"
        y1="232"
        x2="272"
        y2="232"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />

      <text
        x="28"
        y="262"
        fill="#ffffff"
        fontSize="19"
        fontWeight="500"
        fontFamily="Geist, sans-serif"
      >
        {truncate(project.title, 28)}
      </text>

      {/* The baseline is the point of the whole card. If there isn't one,
          fall back to the stack rather than leaving dead space. */}
      <text
        x="28"
        y="288"
        fill={withAlpha(accent, 0.78)}
        fontSize="12"
        fontFamily="Geist, sans-serif"
      >
        {metric?.baseline
          ? `vs ${shortBaseline(metric.baseline)}`
          : truncate(project.technologies, 42)}
      </text>
    </svg>
  );
};

export default ProjectCard;
