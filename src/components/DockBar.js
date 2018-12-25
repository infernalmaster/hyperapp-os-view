import { h } from "hyperapp";
import pc from "../style";

export default pc("div")({
  position: "absolute",
  bottom: "0",
  left: "50%",
  transform: "translateX(-50%)",
  display: "inline-block",
  height: "60px",
  background: "black",
  borderRadius: "10px 10px 0 0",
  zIndex: "99999"
});
