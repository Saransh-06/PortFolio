import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { config } from "../config";

/**
 * The two role lines each hold a PAIR of children. initialFX() splits
 * `.landing-h2-1`/`.landing-h2-2` and `.landing-h2-info`/`.landing-h2-info-1`
 * and cross-fades them on a loop — the template shipped only the first of
 * each pair, so that animation was running against empty node lists.
 * Both halves are rendered here; the second sits absolutely on top of the
 * first (see Landing.css), and is hidden below 768px where the layout is
 * static.
 */
const Landing = ({ children }: PropsWithChildren) => {
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";
  const [primary, primaryAlt] = config.developer.rolesPrimary;
  const [secondary, secondaryAlt] = config.developer.rolesSecondary;

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName.toUpperCase()}
              {' '}
              <br />
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
          </div>
          <div className="landing-info">
            <h3>{config.developer.article}</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">{primary}</div>
              <div className="landing-h2-2">{primaryAlt}</div>
            </h2>
            <h2>
              <div className="landing-h2-info">{secondary}</div>
              <div className="landing-h2-info-1">{secondaryAlt}</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
