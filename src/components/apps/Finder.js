import { h } from "hyperapp";

import { extMap } from "../../cfg";
import { getExtension, pathToArray } from "../../libs";

const Icon = ({ item, payload, frame }) => (state, actions) => {
  const ext = getExtension(item);

  const image = extMap[ext];

  return (
    <div
      style={{
        padding: "5px",
        width: "60px",
        textAlign: "center",
        wordBreak: "break-word"
      }}
    >
      <img
        src={image}
        height="40"
        alt="icon"
        style={{ cursor: "pointer" }}
        ondblclick={() => {
          if (ext === "folder") {
            actions.frames.goToDir({
              id: frame.id,
              path: `/${pathToArray(frame.app.payload)
                .concat([item])
                .join("/")}`
            });
          } else {
            actions.openFrame({ fileName: item, payload });
          }
        }}
      />
      <div>{item}</div>
    </div>
  );
};

const Finder = ({ frame }) => (state, actions) => {
  const path = pathToArray(frame.app.payload);

  let activeFolder = state.fs;

  path.forEach(el => {
    activeFolder = activeFolder[el];
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "scroll"
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap"
        }}
      >
        {Object.keys(activeFolder).map(item => (
          <Icon item={item} payload={activeFolder[item]} frame={frame} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "0",
          color: "white",
          background: "black",
          width: "100%"
        }}
      >
        <span
          style={{ cursor: "pointer" }}
          onclick={() =>
            actions.frames.goToDir({
              id: frame.id,
              path: "/"
            })
          }
        >
          Disk >{" "}
        </span>
        {path.map((el, index) => (
          <span
            style={{ cursor: "pointer" }}
            onclick={() =>
              actions.frames.goToDir({
                id: frame.id,
                path: "/" + path.slice(0, index + 1).join("/")
              })
            }
          >
            {el} >{" "}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Finder;
