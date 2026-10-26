import { useState } from "react";
import { Link } from "react-router-dom";
import { accentColors, config } from "../config";
import type { Project } from "../config";
import ProjectCard from "../components/ProjectCard";
import PageLinks from "../components/PageLinks";
import { useDocumentMeta } from "../utils/useDocumentMeta";
import "./MyWorks.css";

/* `project.image` being a non-empty string only means someone typed a path —
   it says nothing about the file existing. Without the onError the ternary
   below renders a broken <img> with alt text for a typo'd or missing file,
   which is the very thing ProjectCard exists to prevent. Needs its own
   component because the failure is per-card state and the cards are a map(). */
const GridImage = ({
  project,
  index,
}: {
  project: Project;
  index: number;
}) => {
  const [failed, setFailed] = useState(false);
  if (!project.image || failed) {
    return <ProjectCard project={project} index={index} variant="grid" />;
  }
  return (
    <img
      src={project.image}
      alt={project.title}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
};

const MyWorks = () => {
  useDocumentMeta(
    `All works — ${config.developer.fullName}`,
    `Every project, strongest first: ${config.projects.length} builds, each headline number shown with the caveat that comes with it.`
  );

  return (
    <div className="myworks-page">
      <div className="myworks-header">
        <Link to="/" className="back-button" data-cursor="disable">
          ← Back to Home
        </Link>
        <PageLinks />
        <h1>
          All <span>Works</span>
        </h1>
        {/* This line used to promise that every number carried "what it beat".
            Two of the fifteen have a baseline; all fifteen have a caveat. The
            copy now says what the data actually supports — on a portfolio whose
            whole argument is honesty about numbers, that sentence was the one
            place it overclaimed. */}
        <p>
          {config.projects.length} projects, strongest first. Every headline number
          carries the caveat that comes with it — what it cost, or what it
          doesn&apos;t prove. Where there&apos;s a baseline to beat, that&apos;s on
          the card too.
        </p>
      </div>

      <div className="myworks-grid">
        {config.projects.map((project, index) => {
          const isInternalLink = Boolean(project.link?.startsWith("/"));
          const accent = accentColors[project.accent];
          const cardContent = (
            <>
              <div className="myworks-card-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="myworks-card-image">
                <GridImage project={project} index={index} />
              </div>
              <div className="myworks-card-info">
                <h3>{project.title}</h3>
                <p className="myworks-card-category">{project.category}</p>

                {project.metric && (
                  <div className="myworks-metric">
                    <div className="myworks-metric-head">
                      <span className="myworks-metric-value">{project.metric.value}</span>
                      <span className="myworks-metric-label">{project.metric.label}</span>
                    </div>
                    {project.metric.baseline && (
                      <p className="myworks-metric-baseline">
                        Baseline — {project.metric.baseline}
                      </p>
                    )}
                  </div>
                )}

                <p className="myworks-card-description">{project.description}</p>

                {project.metric?.caveat && (
                  <p className="myworks-card-caveat">
                    <span>The caveat</span>
                    {project.metric.caveat}
                  </p>
                )}

                <p className="myworks-card-tech">{project.technologies}</p>
              </div>
            </>
          );

          if (isInternalLink) {
            return (
              <Link
                className="myworks-card"
                key={project.id}
                data-cursor="disable"
                to={project.link}
                style={{ "--cardAccent": accent } as React.CSSProperties}
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <a
              className="myworks-card"
              key={project.id}
              data-cursor="disable"
              href={project.link || undefined}
              target={project.link ? "_blank" : undefined}
              rel={project.link ? "noopener noreferrer" : undefined}
              style={{ "--cardAccent": accent } as React.CSSProperties}
            >
              {cardContent}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default MyWorks;
