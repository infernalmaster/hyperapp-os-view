import { h, app } from "hyperapp";

import Screen from "./components/Screen";
import DockBarIcon from "./components/DockBarIcon";
import DockBar from "./components/DockBar";
import SystemTopBar, { Clock } from "./components/SystemTopBar";
import AppWindow from "./components/AppWindow";
import { Icon } from "./components/Icon";

import { state, actions } from "./model";

import { getActiveFrame } from "./libs";

// icons
// https://icons8.com/icon/set/game/color

// TODO:
// app icons
// group app by type for dockBar and always show apps in doc bar
// allow frames with empty app.payload
// some random data for fs
// menu for top bar
// transitions https://github.com/zaceno/hyperapp-transitions
// deploy

const App = (state, actions) => (
  <Screen>
    <SystemTopBar>
      <div>
        <span>JSOS </span>
      </div>
      <div>{(getActiveFrame(state) || { name: "-" }).name}</div>
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
        <AppWindow key={app.id} app={app} />
      ))}

    <DockBar>
      {Object.values(state.frames).map(app => (
        <DockBarIcon
          key={app.id}
          app={app}
          handleClick={() => {
            actions.frames.up({ id: app.id });
            actions.frames.show({ id: app.id });
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
