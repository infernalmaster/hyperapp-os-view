import { h } from "hyperapp";

export default (prosp, children) => (
  <div
    style={{
      position: "fixed",
      width: "100%",
      height: "100%",
      backgroundColor: "#158aa5",
      backgroundSize: "cover"
    }}
  >
    {children}
  </div>
);
