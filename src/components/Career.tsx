import "./styles/Career.css";
import { config } from "../config";
import { MdArrowOutward } from "react-icons/md";

/** The big number on the timeline. `year` in config wins — several
 *  entries are current, and "NOW" printed six times reads as a bug. */
const getDisplayYear = (period: string, year?: string) => {
  if (year) return year;
  if (period.includes("Present")) return "NOW";
  if (period.includes(" - ")) return period.split(" - ")[0];
  return period;
};

const kindLabel: Record<string, string> = {
  work: "Role",
  programme: "Programme",
  education: "Education",
};

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {config.experiences.map((exp, index) => (
            <div key={index} className="career-info-box">
              <div className="career-info-in">
                {/* h3 then h4 under the section's h2. These were h4 then h5,
                    which skipped a level, and the big year below was an h3 —
                    so a screen reader's outline for every single entry read
                    role, employer, then jumped back UP to a bare number. The
                    year is a decorative numeral, not a heading. */}
                <div className="career-role">
                  <h3>{exp.position}</h3>
                  <h4>{exp.company}</h4>
                  <p className="career-meta">
                    {exp.period} · {exp.location}
                  </p>
                </div>
                <div className="career-when">
                  <div className="career-year">
                    {getDisplayYear(exp.period, exp.year)}
                  </div>
                  <span className="career-kind">{kindLabel[exp.kind]}</span>
                </div>
              </div>

              {/* The template dropped responsibilities[] and technologies[]
                  on the floor. They're the whole substance of an entry. */}
              <div className="career-detail">
                <p>{exp.description}</p>

                {exp.responsibilities.length > 0 && (
                  <ul className="career-bullets">
                    {exp.responsibilities.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}

                {exp.technologies.length > 0 && (
                  <div className="career-tags">
                    {exp.technologies.map((tech) => (
                      <span className="career-tag" key={tech}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {exp.link && (
                  <a
                    className="career-link"
                    href={exp.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="disable"
                  >
                    {exp.link.label} <MdArrowOutward />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
