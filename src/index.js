import { h, app } from "hyperapp";

import Screen from "./components/Screen";
import DockBarIcon from "./components/DockBarIcon";
import DockBar from "./components/DockBar";
import SystemTopBar, { Clock } from "./components/SystemTopBar";
import AppWindow from "./components/AppWindow";
import { Icon } from "./components/Icon";

import { state, actions } from "./model";

import { getActiveFrame } from "./libs";

import { extToType } from "./cfg";

// TODO:
// menu for top bar
// right mouse button menu (delete file and icon)

const App = (state, actions) => (
  <Screen>
    <SystemTopBar>
      <div>
        <span>JSOS </span>
      </div>
      <div>{(getActiveFrame(state) || { app: { type: "-" } }).app.type}</div>
      <div>
        <Clock />
      </div>
    </SystemTopBar>

    {Object.values(state.icons).map(icon => (
      <Icon key={icon.id} icon={icon} />
    ))}

    {Object.values(state.frames)
      .filter(app => app.shown)
      .map(app => (
        <AppWindow key={app.id} frame={app} />
      ))}

    <DockBar>
      {Object.values(extToType).map(type => (
        <DockBarIcon
          key={type}
          type={type}
          handleClick={() => {
            actions.openAppByType({ type });
          }}
        />
      ))}
    </DockBar>
  </Screen>
);

if (process.env.NODE_ENV !== "production") {
  require("hyperapp-redux-devtools")(app)(
    state,
    actions,
    App,
    document.getElementById("app")
  );
} else {
  app(state, actions, App, document.getElementById("app"));
}
