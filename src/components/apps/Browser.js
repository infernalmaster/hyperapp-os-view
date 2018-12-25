import { h } from "hyperapp";

const Browser = ({ frame }) => (
  <iframe width="100%" height="100%" src={frame.app.payload} title="browser" />
);

export default Browser;
