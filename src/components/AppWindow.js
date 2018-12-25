import { h } from "hyperapp";

import Draggable from "./Draggable";
import AppSelector from "./apps/AppSelector";
import { topBarHeight } from "../cfg";

const AppWindow = ({ app: frame }) => (state, actions) => {
  let place = frame.fullscreen
    ? {
        position: { x: 0, y: topBarHeight },
        size: { x: window.innerWidth, y: window.innerHeight - topBarHeight }
      }
    : {
        position: frame.position,
        size: frame.size
      };
  return (
    <div
      key={frame.id}
      style={{
        position: "absolute",
        top: place.position.y + "px",
        left: place.position.x + "px",
        width: place.size.x + "px",
        height: place.size.y + "px",
        border: "1px solid black",
        background: "white",
        borderRadius: "5px",
        zIndex: frame.zIndex,
        boxShadow: "rgba(68, 68, 68, 0.75) 2px 2px 10px 0px"
      }}
      onclick={() => actions.frames.up({ id: frame.id })}
    >
      <Draggable
        ondrag={(dx, dy) => actions.frames.move({ id: frame.id, dx, dy })}
        up={() => actions.frames.up({ id: frame.id })}
      >
        <div
          style={{
            height: "20px",
            padding: "0 5px",
            background: "black",
            color: "white",
            textAlign: "center",
            cursor: "move"
          }}
          ondblclick={() => {
            actions.frames.changeFullscreen({ id: frame.id });
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "red",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                margin: "0 0 0 5px",
                cursor: "pointer"
              }}
              onclick={() => actions.closeFrame({ id: frame.id })}
            />
            <div
              style={{
                display: "inline-block",
                background: "yellow",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                margin: "0 0 0 5px",
                cursor: "pointer"
              }}
              onclick={() => actions.frames.hide({ id: frame.id })}
            />
            <div
              style={{
                display: "inline-block",
                background: "green",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                margin: "0 0 0 5px",
                cursor: "pointer"
              }}
              onclick={() => {
                actions.frames.changeFullscreen({ id: frame.id });
              }}
            />
          </div>

          {frame.app.type}
        </div>
      </Draggable>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: `calc(100% - ${topBarHeight}px)`
        }}
      >
        <AppSelector frame={frame} />
      </div>

      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "10px",
          height: "10px",
          cursor: "se-resize"
        }}
      >
        <Draggable
          ondrag={(dx, dy) => actions.frames.resize({ id: frame.id, dx, dy })}
          up={() => actions.frames.up({ id: frame.id })}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderBottom: "10px solid black",
              borderLeft: "10px solid transparent"
            }}
          />
        </Draggable>
      </div>
    </div>
  );
};

export default AppWindow;
