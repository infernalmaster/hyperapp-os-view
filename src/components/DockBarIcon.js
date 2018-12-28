import { h } from "hyperapp";
import pc from "../style";
import { iconByType } from "../cfg";

const DockBarIcon = (props, children) => {
  return (
    <div class={props.class} onclick={props.handleClick}>
      {children}
    </div>
  );
};

export default pc(DockBarIcon)(({ type }) => ({
  display: "inline-block",
  height: "40px",
  width: "40px",
  margin: "10px",
  transition: "all 0.2s",
  backgroundImage: `url(${iconByType[type]})`,
  backgroundSize: "contain",
  cursor: "pointer",
  ":hover": {
    transform: "scale(1.3)"
  }
}));
