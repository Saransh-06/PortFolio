import "./styles/Certifications.css";
import { config, Certification } from "../config";
import { MdArrowOutward } from "react-icons/md";

/* Group the courses under their programme once, at module scope — the list is
   static, so there is no reason to redo it on every render.

   A course whose `parent` matches no programme title falls through to
   `standalone` rather than disappearing, which is what makes a typo in
   config.ts visible instead of silent. */
const majors = config.certifications.filter((c) => c.tier === "major");
const majorTitles = new Set(majors.map((c) => c.title));

const coursesByParent = new Map<string, Certification[]>();
const standalone: Certification[] = [];

for (const cert of config.certifications) {
  if (cert.tier === "major") continue;
  if (cert.parent && majorTitles.has(cert.parent)) {
    const bucket = coursesByParent.get(cert.parent);
    bucket ? bucket.push(cert) : coursesByParent.set(cert.parent, [cert]);
  } else {
    standalone.push(cert);
  }
}

const Verify = ({ url, label }: { url: string; label: string }) => (
  <a
    className="certs-verify"
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    data-cursor="disable"
  >
    {label} <MdArrowOutward />
  </a>
);

const Certifications = () => {
  return (
    /* An id but no navbar entry, on purpose. The bar holds three short words
       and is centred; a fourth reading "CERTIFICATIONS" unbalances it and
       collides with the email address around 1100px. The id still makes
       /#certifications linkable from a CV or the main portfolio — which is
       the only reason anyone would want to jump straight here. */
    <div className="certs-section section-container" id="certifications">
      <div className="certs-container">
        <h2>
          Certifications <span>&</span>
          <br /> credentials
        </h2>

        <p className="certs-lede">
          {config.certifications.length} in total, every one of them verifiable
          from this page.
        </p>

        <div className="certs-grid">
          {majors.map((cert) => {
            const courses = coursesByParent.get(cert.title) ?? [];
            return (
              <article className="certs-card" key={cert.title}>
                <div className="certs-card-head">
                  <span className="certs-issuer">{cert.issuer}</span>
                  <span className="certs-year">{cert.year}</span>
                </div>

                <h3>{cert.title}</h3>

                {cert.covers && (
                  <span className="certs-covers">{cert.covers}</span>
                )}
                {cert.note && <p className="certs-note">{cert.note}</p>}

                {cert.credentialId && (
                  <p className="certs-id">
                    <span>Credential ID</span>
                    <code>{cert.credentialId}</code>
                  </p>
                )}

                <Verify url={cert.url} label="Verify" />

                {courses.length > 0 && (
                  /* <details> rather than a useState toggle: it opens without
                     JavaScript, it is keyboard-operable and screen-reader
                     announced for free, and Ctrl+F finds the course titles
                     inside it in Chrome. */
                  <details className="certs-courses">
                    <summary data-cursor="disable">
                      <span className="certs-courses-label">
                        {courses.length} courses
                      </span>
                      <span className="certs-chevron" aria-hidden="true" />
                    </summary>
                    <ul>
                      {courses.map((course) => (
                        <li key={course.title}>
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor="disable"
                          >
                            {course.title} <MdArrowOutward />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </article>
            );
          })}
        </div>

        {standalone.length > 0 && (
          <div className="certs-standalone">
            <h4>Also completed</h4>
            <ul>
              {standalone.map((cert) => (
                <li key={cert.title}>
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="disable"
                  >
                    <span className="certs-standalone-title">{cert.title}</span>
                    <span className="certs-standalone-issuer">
                      {cert.issuer} · {cert.year}
                    </span>
                    <MdArrowOutward />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certifications;
