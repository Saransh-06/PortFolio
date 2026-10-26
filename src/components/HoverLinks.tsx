import "./styles/style.css";

/** The label is rendered twice: the second copy is what slides up on hover,
 *  positioned by CSS. It is purely visual, so it is hidden from assistive tech
 *  — without aria-hidden every nav item and the resume link were announced
 *  twice over ("RESUME RESUME"). */
const HoverLinks = ({ text, cursor }: { text: string; cursor?: boolean }) => {
  return (
    <div className="hover-link" data-cursor={!cursor && `disable`}>
      <div className="hover-in">
        {text}{" "}
        <div aria-hidden="true">{text}</div>
      </div>
    </div>
  );
};

export default HoverLinks;
