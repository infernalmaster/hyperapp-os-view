import { h } from "hyperapp";

import { topBarHeight } from "../cfg";

const SystemTopBar = (props, children) => {
  return (
    <div
      style={{
        height: `${topBarHeight}px`,
        width: "100%",
        background: "black",
        color: "white",
        position: "absolute",
        top: "0",
        padding: "0 5px",
        display: "flex",
        justifyContent: "space-between"
      }}
    >
      {children}
    </div>
  );
};

export default SystemTopBar;

export const Clock = () => (state, actions) => (
  <div oncreate={() => setInterval(() => actions.updateTime(new Date()), 1000)}>
    {state.time
      .toString()
      .split(" ")
      .slice(0, 5)
      .join(" ")}
  </div>
);
