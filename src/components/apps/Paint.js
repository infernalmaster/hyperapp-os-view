import { h } from "hyperapp";

const Paint = ({ frame }) => (
  <img
    src={frame.app.payload}
    alt="img"
    style={{
      flex: "none",
      maxHeight: "100%",
      maxWidth: "100%"
    }}
  />
);

export default Paint;
