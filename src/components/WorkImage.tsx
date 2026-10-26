import { ReactNode, useState } from "react";
import { MdArrowOutward } from "react-icons/md";
import { Link } from "react-router-dom";

interface Props {
  /** Optional. When absent, `fallback` is rendered instead — that's how
   *  projects without a screenshot avoid becoming broken images. */
  image?: string;
  alt?: string;
  video?: string;
  link?: string;
  fallback?: ReactNode;
}

const WorkImage = (props: Props) => {
  const [isVideo, setIsVideo] = useState(false);
  const [video, setVideo] = useState("");
  /* `image` being set only means someone typed a path, not that the file is
     there. Without this the ternary below happily renders a broken <img> with
     alt text — exactly what the SVG card exists to prevent. */
  const [imageFailed, setImageFailed] = useState(false);
  const isExternalLink = Boolean(props.link && !props.link.startsWith("/"));

  const handleMouseEnter = async () => {
    if (props.video) {
      setIsVideo(true);
      const response = await fetch(`src/assets/${props.video}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideo(blobUrl);
    }
  };

  const media = (
    <>
      {props.image && !imageFailed ? (
        <img
          src={props.image}
          alt={props.alt}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        props.fallback
      )}
      {isVideo && <video src={video} autoPlay muted playsInline loop></video>}
    </>
  );

  const hoverProps = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: () => setIsVideo(false),
    "data-cursor": "disable",
  };

  return (
    <div className="work-image">
      {props.link ? (
        isExternalLink ? (
          <a
            className="work-image-in"
            href={props.link}
            target="_blank"
            rel="noopener noreferrer"
            {...hoverProps}
          >
            <div className="work-link">
              <MdArrowOutward />
            </div>
            {media}
          </a>
        ) : (
          <Link className="work-image-in" to={props.link} {...hoverProps}>
            <div className="work-link">
              <MdArrowOutward />
            </div>
            {media}
          </Link>
        )
      ) : (
        <div className="work-image-in" {...hoverProps}>
          {media}
        </div>
      )}
    </div>
  );
};

export default WorkImage;
