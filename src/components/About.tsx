import "./styles/About.css";
import { config } from "../config";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        {/* h2, not h3: this is the first section heading after the landing
            h1, and every other section on the page uses h2. As an h3 it
            skipped a level and inverted the page's outline. */}
        <h2 className="title">{config.about.title}</h2>
        <p className="para">
          {config.about.description}
        </p>
        {/* Four numbers, each one checkable. Deliberately not styled as a
            "stats" brag row — the label carries the qualifier. */}
        <div className="about-facts">
          {config.about.facts.map((fact) => (
            <div className="about-fact" key={fact.label}>
              <span className="about-fact-value">{fact.value}</span>
              <span className="about-fact-label">{fact.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
