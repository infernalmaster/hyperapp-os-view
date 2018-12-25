import { h } from "hyperapp";

import Browser from "./Browser";
import Word from "./Word";
import Paint from "./Paint";
import Finder from "./Finder";

const typeToComponentMapping = {
  Word,
  Paint,
  Finder,
  Browser
};

const AppSelector = ({ frame }) => {
  const Component = typeToComponentMapping[frame.app.type];

  return <Component frame={frame} />;
};

export default AppSelector;
