import { h } from "hyperapp";

function dangerouslySetInnerHTML(html) {
  return element => {
    element.innerHTML = html;
  };
}

const Word = ({ frame }) => (
  <div
    contenteditable="true"
    style={{
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      padding: "10px",
      overflow: "scroll"
    }}
    oncreate={dangerouslySetInnerHTML(frame.app.payload)}
  />
);

export default Word;
