import { h } from "hyperapp";
import pc from "../style";

const DockBarIcon = (props, children) => {
  return (
    <div class={props.class} onclick={props.handleClick}>
      {children}
    </div>
  );
};

export default pc(DockBarIcon)(({ app }) => ({
  display: "inline-block",
  height: "40px",
  width: "40px",
  margin: "10px",
  transition: "all 0.2s",
  backgroundImage: `url(${app.icon})`,
  backgroundSize: "contain",
  ":hover": {
    transform: "scale(1.3)"
  }
}));
