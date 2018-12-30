import { h } from "hyperapp";
import { iconByType } from "../cfg";

const DockBarIcon = ({ type, handleClick }, children) => {
  return (
    <div
      key={type}
      style={{
        display: "inline-block",
        height: "40px",
        width: "40px",
        margin: "10px",
        transition: "all 0.2s",
        backgroundImage: `url(${iconByType[type]})`,
        backgroundSize: "contain",
        cursor: "pointer"
      }}
      onclick={handleClick}
    >
      {children}
    </div>
  );
};

export default DockBarIcon;
