import { h } from "hyperapp";

export default (prosp, children) => (
  <div
    style={{
      position: "absolute",
      bottom: "0",
      left: "0",
      width: "100%",
      zIndex: "99999",

      display: "flex",
      justifyContent: "center"
    }}
  >
    <div
      style={{
        display: "inline-block",
        // height: "60px",
        background: "black",
        borderRadius: "10px 10px 0 0",
        zIndex: "99999"
      }}
    >
      {children}
    </div>
  </div>
);
