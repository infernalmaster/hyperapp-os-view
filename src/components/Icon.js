import { h } from "hyperapp";
import Draggable from "./Draggable";
import { extMap } from "../cfg";
import { getExtension, pathToArray } from "../libs";

const getFile = (path, state) => {
  let file = state.fs;

  pathToArray(path).forEach(el => {
    file = file[el];
  });

  return file;
};

export const Icon = ({ icon }) => (state, actions) => {
  const ext = getExtension(icon.link);
  const image = extMap[ext];

  const fileName = icon.link;
  const payload = getFile(icon.link, state);

  return (
    <div
      style={{
        position: "absolute",
        top: icon.position.y + "px",
        left: icon.position.x + "px",
        cursor: "pointer"
      }}
    >
      <Draggable
        ondrag={(dx, dy) => actions.icons.move({ id: icon.id, dx, dy })}
      >
        <img
          src={image}
          height="40"
          alt="icon"
          ondblclick={() => {
            actions.openFrame({
              fileName,
              payload
            });
          }}
        />
      </Draggable>
      <div
        style={{
          maxWidth: "60px",
          color: "white",
          textAlign: "center",
          wordBreak: "break-word"
        }}
      >
        {icon.name}
      </div>
    </div>
  );
};
