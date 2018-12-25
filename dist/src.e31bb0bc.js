// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"../node_modules/hyperapp/src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = h;
exports.app = app;

function h(name, attributes) {
  var rest = [];
  var children = [];
  var length = arguments.length;

  while (length-- > 2) rest.push(arguments[length]);

  while (rest.length) {
    var node = rest.pop();

    if (node && node.pop) {
      for (length = node.length; length--;) {
        rest.push(node[length]);
      }
    } else if (node != null && node !== true && node !== false) {
      children.push(node);
    }
  }

  return typeof name === "function" ? name(attributes || {}, children) : {
    nodeName: name,
    attributes: attributes || {},
    children: children,
    key: attributes && attributes.key
  };
}

function app(state, actions, view, container) {
  var map = [].map;
  var rootElement = container && container.children[0] || null;
  var oldNode = rootElement && recycleElement(rootElement);
  var lifecycle = [];
  var skipRender;
  var isRecycling = true;
  var globalState = clone(state);
  var wiredActions = wireStateToActions([], globalState, clone(actions));
  scheduleRender();
  return wiredActions;

  function recycleElement(element) {
    return {
      nodeName: element.nodeName.toLowerCase(),
      attributes: {},
      children: map.call(element.childNodes, function (element) {
        return element.nodeType === 3 // Node.TEXT_NODE
        ? element.nodeValue : recycleElement(element);
      })
    };
  }

  function resolveNode(node) {
    return typeof node === "function" ? resolveNode(node(globalState, wiredActions)) : node != null ? node : "";
  }

  function render() {
    skipRender = !skipRender;
    var node = resolveNode(view);

    if (container && !skipRender) {
      rootElement = patch(container, rootElement, oldNode, oldNode = node);
    }

    isRecycling = false;

    while (lifecycle.length) lifecycle.pop()();
  }

  function scheduleRender() {
    if (!skipRender) {
      skipRender = true;
      setTimeout(render);
    }
  }

  function clone(target, source) {
    var out = {};

    for (var i in target) out[i] = target[i];

    for (var i in source) out[i] = source[i];

    return out;
  }

  function setPartialState(path, value, source) {
    var target = {};

    if (path.length) {
      target[path[0]] = path.length > 1 ? setPartialState(path.slice(1), value, source[path[0]]) : value;
      return clone(source, target);
    }

    return value;
  }

  function getPartialState(path, source) {
    var i = 0;

    while (i < path.length) {
      source = source[path[i++]];
    }

    return source;
  }

  function wireStateToActions(path, state, actions) {
    for (var key in actions) {
      typeof actions[key] === "function" ? function (key, action) {
        actions[key] = function (data) {
          var result = action(data);

          if (typeof result === "function") {
            result = result(getPartialState(path, globalState), actions);
          }

          if (result && result !== (state = getPartialState(path, globalState)) && !result.then // !isPromise
          ) {
              scheduleRender(globalState = setPartialState(path, clone(state, result), globalState));
            }

          return result;
        };
      }(key, actions[key]) : wireStateToActions(path.concat(key), state[key] = clone(state[key]), actions[key] = clone(actions[key]));
    }

    return actions;
  }

  function getKey(node) {
    return node ? node.key : null;
  }

  function eventListener(event) {
    return event.currentTarget.events[event.type](event);
  }

  function updateAttribute(element, name, value, oldValue, isSvg) {
    if (name === "key") {} else if (name === "style") {
      if (typeof value === "string") {
        element.style.cssText = value;
      } else {
        if (typeof oldValue === "string") oldValue = element.style.cssText = "";

        for (var i in clone(oldValue, value)) {
          var style = value == null || value[i] == null ? "" : value[i];

          if (i[0] === "-") {
            element.style.setProperty(i, style);
          } else {
            element.style[i] = style;
          }
        }
      }
    } else {
      if (name[0] === "o" && name[1] === "n") {
        name = name.slice(2);

        if (element.events) {
          if (!oldValue) oldValue = element.events[name];
        } else {
          element.events = {};
        }

        element.events[name] = value;

        if (value) {
          if (!oldValue) {
            element.addEventListener(name, eventListener);
          }
        } else {
          element.removeEventListener(name, eventListener);
        }
      } else if (name in element && name !== "list" && name !== "type" && name !== "draggable" && name !== "spellcheck" && name !== "translate" && !isSvg) {
        element[name] = value == null ? "" : value;
      } else if (value != null && value !== false) {
        element.setAttribute(name, value);
      }

      if (value == null || value === false) {
        element.removeAttribute(name);
      }
    }
  }

  function createElement(node, isSvg) {
    var element = typeof node === "string" || typeof node === "number" ? document.createTextNode(node) : (isSvg = isSvg || node.nodeName === "svg") ? document.createElementNS("http://www.w3.org/2000/svg", node.nodeName) : document.createElement(node.nodeName);
    var attributes = node.attributes;

    if (attributes) {
      if (attributes.oncreate) {
        lifecycle.push(function () {
          attributes.oncreate(element);
        });
      }

      for (var i = 0; i < node.children.length; i++) {
        element.appendChild(createElement(node.children[i] = resolveNode(node.children[i]), isSvg));
      }

      for (var name in attributes) {
        updateAttribute(element, name, attributes[name], null, isSvg);
      }
    }

    return element;
  }

  function updateElement(element, oldAttributes, attributes, isSvg) {
    for (var name in clone(oldAttributes, attributes)) {
      if (attributes[name] !== (name === "value" || name === "checked" ? element[name] : oldAttributes[name])) {
        updateAttribute(element, name, attributes[name], oldAttributes[name], isSvg);
      }
    }

    var cb = isRecycling ? attributes.oncreate : attributes.onupdate;

    if (cb) {
      lifecycle.push(function () {
        cb(element, oldAttributes);
      });
    }
  }

  function removeChildren(element, node) {
    var attributes = node.attributes;

    if (attributes) {
      for (var i = 0; i < node.children.length; i++) {
        removeChildren(element.childNodes[i], node.children[i]);
      }

      if (attributes.ondestroy) {
        attributes.ondestroy(element);
      }
    }

    return element;
  }

  function removeElement(parent, element, node) {
    function done() {
      parent.removeChild(removeChildren(element, node));
    }

    var cb = node.attributes && node.attributes.onremove;

    if (cb) {
      cb(element, done);
    } else {
      done();
    }
  }

  function patch(parent, element, oldNode, node, isSvg) {
    if (node === oldNode) {} else if (oldNode == null || oldNode.nodeName !== node.nodeName) {
      var newElement = createElement(node, isSvg);
      parent.insertBefore(newElement, element);

      if (oldNode != null) {
        removeElement(parent, element, oldNode);
      }

      element = newElement;
    } else if (oldNode.nodeName == null) {
      element.nodeValue = node;
    } else {
      updateElement(element, oldNode.attributes, node.attributes, isSvg = isSvg || node.nodeName === "svg");
      var oldKeyed = {};
      var newKeyed = {};
      var oldElements = [];
      var oldChildren = oldNode.children;
      var children = node.children;

      for (var i = 0; i < oldChildren.length; i++) {
        oldElements[i] = element.childNodes[i];
        var oldKey = getKey(oldChildren[i]);

        if (oldKey != null) {
          oldKeyed[oldKey] = [oldElements[i], oldChildren[i]];
        }
      }

      var i = 0;
      var k = 0;

      while (k < children.length) {
        var oldKey = getKey(oldChildren[i]);
        var newKey = getKey(children[k] = resolveNode(children[k]));

        if (newKeyed[oldKey]) {
          i++;
          continue;
        }

        if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
          if (oldKey == null) {
            removeElement(element, oldElements[i], oldChildren[i]);
          }

          i++;
          continue;
        }

        if (newKey == null || isRecycling) {
          if (oldKey == null) {
            patch(element, oldElements[i], oldChildren[i], children[k], isSvg);
            k++;
          }

          i++;
        } else {
          var keyedNode = oldKeyed[newKey] || [];

          if (oldKey === newKey) {
            patch(element, keyedNode[0], keyedNode[1], children[k], isSvg);
            i++;
          } else if (keyedNode[0]) {
            patch(element, element.insertBefore(keyedNode[0], oldElements[i]), keyedNode[1], children[k], isSvg);
          } else {
            patch(element, oldElements[i], null, children[k], isSvg);
          }

          newKeyed[newKey] = children[k];
          k++;
        }
      }

      while (i < oldChildren.length) {
        if (getKey(oldChildren[i]) == null) {
          removeElement(element, oldElements[i], oldChildren[i]);
        }

        i++;
      }

      for (var i in oldKeyed) {
        if (!newKeyed[i]) {
          removeElement(element, oldKeyed[i][0], oldKeyed[i][1]);
        }
      }
    }

    return element;
  }
}
},{}],"../node_modules/picostyle/src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.keyframes = keyframes;
var _id = 0;
var sheet = document.head.appendChild(document.createElement("style")).sheet;

function hyphenate(str) {
  return str.replace(/[A-Z]/g, "-$&").toLowerCase();
}

function insert(rule) {
  sheet.insertRule(rule, sheet.cssRules.length);
}

function createStyle(obj) {
  var id = "p" + _id++;
  parse(obj, "." + id).forEach(insert);
  return id;
}

function wrap(stringToWrap, wrapper) {
  return wrapper + "{" + stringToWrap + "}";
}

function parse(obj, classname, isInsideObj) {
  var arr = [""];
  isInsideObj = isInsideObj || 0;

  for (var prop in obj) {
    var value = obj[prop];
    prop = hyphenate(prop); // Same as typeof value === 'object', but smaller

    if (!value.sub) {
      if (/^(:|>|\.|\*)/.test(prop)) {
        prop = classname + prop;
      } // replace & in "&:hover", "p>&"


      prop = prop.replace(/&/g, classname);
      arr.push(wrap(parse(value, classname, 1 && !/^@/.test(prop)).join(""), prop));
    } else {
      arr[0] += prop + ":" + value + ";";
    }
  }

  if (!isInsideObj) {
    arr[0] = wrap(arr[0], classname);
  }

  return arr;
}

function _default(h) {
  return function (nodeName) {
    var cache = {};
    return function (decls) {
      return function (attributes, children) {
        attributes = attributes || {};
        children = attributes.children || children;
        var nodeDecls = typeof decls == "function" ? decls(attributes) : decls;
        var key = JSON.stringify(nodeDecls);
        cache[key] || (cache[key] = createStyle(nodeDecls));
        attributes.class = [attributes.class, cache[key]].filter(Boolean).join(" ");
        return h(nodeName, attributes, children);
      };
    };
  };
}

function keyframes(obj) {
  var id = "p" + _id++;
  insert(wrap(parse(obj, id, 1).join(""), "@keyframes " + id));
  return id;
}
},{}],"style.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _picostyle = _interopRequireDefault(require("picostyle"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _picostyle.default)(_hyperapp.h);

exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js","picostyle":"../node_modules/picostyle/src/index.js"}],"components/Screen.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _style = _interopRequireDefault(require("../style"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _style.default)("div")({
  position: "fixed",
  width: "100%",
  height: "100%",
  backgroundImage: "url(http://cdn.osxdaily.com/wp-content/uploads/2018/06/macos-mojave-night-lightened-r.jpg)",
  backgroundSize: "cover"
});

exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js","../style":"style.js"}],"components/DockBarIcon.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _style = _interopRequireDefault(require("../style"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DockBarIcon = function DockBarIcon(props, children) {
  return (0, _hyperapp.h)("div", {
    class: props.class,
    onclick: props.handleClick
  }, children);
};

var _default = (0, _style.default)(DockBarIcon)(function (_ref) {
  var app = _ref.app;
  return {
    display: "inline-block",
    height: "40px",
    width: "40px",
    margin: "10px",
    transition: "all 0.2s",
    backgroundImage: "url(".concat(app.icon, ")"),
    backgroundSize: "contain",
    ":hover": {
      transform: "scale(1.3)"
    }
  };
});

exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js","../style":"style.js"}],"components/DockBar.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _style = _interopRequireDefault(require("../style"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _style.default)("div")({
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

exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js","../style":"style.js"}],"cfg.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extToType = exports.extMap = exports.topBarHeight = void 0;
var topBarHeight = 20;
exports.topBarHeight = topBarHeight;
var extMap = {
  folder: "https://img.icons8.com/color/96/000000/folder-invoices.png",
  txt: "https://img.icons8.com/color/96/000000/txt.png",
  jpg: "https://img.icons8.com/color/96/000000/jpg.png",
  html: "https://img.icons8.com/color/96/000000/html-filetype.png"
};
exports.extMap = extMap;
var extToType = {
  txt: "Word",
  jpg: "Paint",
  folder: "Finder",
  html: "Browser"
};
exports.extToType = extToType;
},{}],"components/SystemTopBar.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Clock = exports.default = void 0;

var _hyperapp = require("hyperapp");

var _style = _interopRequireDefault(require("../style"));

var _cfg = require("../cfg");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SystemTopBar = function SystemTopBar(props, children) {
  return (0, _hyperapp.h)("div", {
    class: props.class
  }, children);
};

var _default = (0, _style.default)(SystemTopBar)(function () {
  return {
    height: "".concat(_cfg.topBarHeight, "px"),
    width: "100%",
    background: "black",
    color: "white",
    position: "absolute",
    top: "0",
    padding: "0 5px",
    display: "flex",
    justifyContent: "space-between"
  };
});

exports.default = _default;

var Clock = function Clock() {
  return function (state, actions) {
    return (0, _hyperapp.h)("div", {
      oncreate: function oncreate() {
        return setInterval(function () {
          return actions.updateTime(new Date());
        }, 1000);
      }
    }, state.time.toString().split(" ").slice(0, 5).join(" "));
  };
};

exports.Clock = Clock;
},{"hyperapp":"../node_modules/hyperapp/src/index.js","../style":"style.js","../cfg":"cfg.js"}],"components/Draggable.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var x0;
var y0;

var Draggable = function Draggable(_ref, children) {
  var _ondrag = _ref.ondrag,
      _ref$up = _ref.up,
      up = _ref$up === void 0 ? function () {} : _ref$up;
  return (0, _hyperapp.h)("div", {
    onmousedown: function onmousedown(e) {
      x0 = e.x;
      y0 = e.y;
      up();
    },
    draggable: true,
    ondrag: function ondrag(e) {
      // hack
      if (e.x === 0 && e.y === 0) return;
      var dx = e.x - x0;
      var dy = e.y - y0;

      _ondrag(dx, dy);

      x0 = e.x;
      y0 = e.y;
    }
  }, children);
};

var _default = Draggable;
exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js"}],"components/apps/Browser.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var Browser = function Browser(_ref) {
  var frame = _ref.frame;
  return (0, _hyperapp.h)("iframe", {
    width: "100%",
    height: "100%",
    src: frame.app.payload,
    title: "browser"
  });
};

var _default = Browser;
exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js"}],"components/apps/Word.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

function dangerouslySetInnerHTML(html) {
  return function (element) {
    element.innerHTML = html;
  };
}

var Word = function Word(_ref) {
  var frame = _ref.frame;
  return (0, _hyperapp.h)("div", {
    contenteditable: "true",
    style: {
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      padding: "10px",
      overflow: "scroll"
    },
    oncreate: dangerouslySetInnerHTML(frame.app.payload)
  });
};

var _default = Word;
exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js"}],"components/apps/Paint.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var Paint = function Paint(_ref) {
  var frame = _ref.frame;
  return (0, _hyperapp.h)("img", {
    src: frame.app.payload,
    alt: "img",
    style: {
      flex: "none",
      maxHeight: "100%",
      maxWidth: "100%"
    }
  });
};

var _default = Paint;
exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js"}],"libs.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getActiveFrame = exports.pathToArray = exports.getExtension = void 0;

var getExtension = function getExtension(file) {
  var ext = file.split("/").reverse()[0].split(".")[1];
  return ext ? ext : "folder";
};

exports.getExtension = getExtension;

var pathToArray = function pathToArray(path) {
  return path.split("/").filter(function (el) {
    return el;
  });
};

exports.pathToArray = pathToArray;

var getActiveFrame = function getActiveFrame(state) {
  return Object.values(state.frames).sort(function (a, b) {
    return b.zIndex - a.zIndex;
  })[0];
};

exports.getActiveFrame = getActiveFrame;
},{}],"components/apps/Finder.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _cfg = require("../../cfg");

var _libs = require("../../libs");

var Icon = function Icon(_ref) {
  var item = _ref.item,
      payload = _ref.payload,
      frame = _ref.frame;
  return function (state, actions) {
    var ext = (0, _libs.getExtension)(item);
    var image = _cfg.extMap[ext];
    return (0, _hyperapp.h)("div", {
      style: {
        padding: "5px",
        maxWidth: "120px",
        textAlign: "center",
        wordBreak: "break-word"
      }
    }, (0, _hyperapp.h)("img", {
      src: image,
      height: "40",
      alt: "icon",
      ondblclick: function ondblclick() {
        if (ext === "folder") {
          actions.frames.goToDir({
            id: frame.id,
            path: "/".concat((0, _libs.pathToArray)(frame.app.payload).concat([item]).join("/"))
          });
        } else {
          actions.openFrame({
            fileName: item,
            payload: payload
          });
        }
      }
    }), (0, _hyperapp.h)("div", null, item));
  };
};

var Finder = function Finder(_ref2) {
  var frame = _ref2.frame;
  return function (state, actions) {
    var path = (0, _libs.pathToArray)(frame.app.payload);
    var activeFolder = state.fs;
    path.forEach(function (el) {
      activeFolder = activeFolder[el];
    });
    return (0, _hyperapp.h)("div", {
      style: {
        width: "100%",
        height: "100%"
      }
    }, (0, _hyperapp.h)("div", {
      style: {
        display: "flex"
      }
    }, Object.keys(activeFolder).map(function (item) {
      return (0, _hyperapp.h)(Icon, {
        item: item,
        payload: activeFolder[item],
        frame: frame
      });
    })), (0, _hyperapp.h)("div", {
      style: {
        position: "absolute",
        bottom: "0",
        color: "white",
        background: "black",
        width: "100%"
      }
    }, (0, _hyperapp.h)("span", {
      style: {
        cursor: "pointer"
      },
      onclick: function onclick() {
        return actions.frames.goToDir({
          id: frame.id,
          path: "/"
        });
      }
    }, "Disk >", " "), path.map(function (el, index) {
      return (0, _hyperapp.h)("span", {
        style: {
          cursor: "pointer"
        },
        onclick: function onclick() {
          return actions.frames.goToDir({
            id: frame.id,
            path: "/" + path.slice(0, index + 1).join("/")
          });
        }
      }, el, " >", " ");
    })));
  };
};

var _default = Finder;
exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js","../../cfg":"cfg.js","../../libs":"libs.js"}],"components/apps/AppSelector.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _Browser = _interopRequireDefault(require("./Browser"));

var _Word = _interopRequireDefault(require("./Word"));

var _Paint = _interopRequireDefault(require("./Paint"));

var _Finder = _interopRequireDefault(require("./Finder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var typeToComponentMapping = {
  Word: _Word.default,
  Paint: _Paint.default,
  Finder: _Finder.default,
  Browser: _Browser.default
};

var AppSelector = function AppSelector(_ref) {
  var frame = _ref.frame;
  var Component = typeToComponentMapping[frame.app.type];
  return (0, _hyperapp.h)(Component, {
    frame: frame
  });
};

var _default = AppSelector;
exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js","./Browser":"components/apps/Browser.js","./Word":"components/apps/Word.js","./Paint":"components/apps/Paint.js","./Finder":"components/apps/Finder.js"}],"components/AppWindow.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _Draggable = _interopRequireDefault(require("./Draggable"));

var _AppSelector = _interopRequireDefault(require("./apps/AppSelector"));

var _cfg = require("../cfg");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AppWindow = function AppWindow(_ref) {
  var frame = _ref.app;
  return function (state, actions) {
    var place = frame.fullscreen ? {
      position: {
        x: 0,
        y: _cfg.topBarHeight
      },
      size: {
        x: window.innerWidth,
        y: window.innerHeight - _cfg.topBarHeight
      }
    } : {
      position: frame.position,
      size: frame.size
    };
    return (0, _hyperapp.h)("div", {
      key: frame.id,
      style: {
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
      },
      onclick: function onclick() {
        return actions.frames.up({
          id: frame.id
        });
      }
    }, (0, _hyperapp.h)(_Draggable.default, {
      ondrag: function ondrag(dx, dy) {
        return actions.frames.move({
          id: frame.id,
          dx: dx,
          dy: dy
        });
      },
      up: function up() {
        return actions.frames.up({
          id: frame.id
        });
      }
    }, (0, _hyperapp.h)("div", {
      style: {
        height: "20px",
        padding: "0 5px",
        background: "black",
        color: "white",
        textAlign: "center",
        cursor: "move"
      },
      ondblclick: function ondblclick() {
        actions.frames.changeFullscreen({
          id: frame.id
        });
      }
    }, (0, _hyperapp.h)("div", {
      style: {
        position: "absolute",
        left: 0
      }
    }, (0, _hyperapp.h)("div", {
      style: {
        display: "inline-block",
        background: "red",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        margin: "0 0 0 5px",
        cursor: "pointer"
      },
      onclick: function onclick() {
        return actions.closeFrame({
          id: frame.id
        });
      }
    }), (0, _hyperapp.h)("div", {
      style: {
        display: "inline-block",
        background: "yellow",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        margin: "0 0 0 5px",
        cursor: "pointer"
      },
      onclick: function onclick() {
        return actions.frames.hide({
          id: frame.id
        });
      }
    }), (0, _hyperapp.h)("div", {
      style: {
        display: "inline-block",
        background: "green",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        margin: "0 0 0 5px",
        cursor: "pointer"
      },
      onclick: function onclick() {
        actions.frames.changeFullscreen({
          id: frame.id
        });
      }
    })), frame.app.type)), (0, _hyperapp.h)("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100% - ".concat(_cfg.topBarHeight, "px)")
      }
    }, (0, _hyperapp.h)(_AppSelector.default, {
      frame: frame
    })), (0, _hyperapp.h)("div", {
      style: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: "10px",
        height: "10px",
        cursor: "se-resize"
      }
    }, (0, _hyperapp.h)(_Draggable.default, {
      ondrag: function ondrag(dx, dy) {
        return actions.frames.resize({
          id: frame.id,
          dx: dx,
          dy: dy
        });
      },
      up: function up() {
        return actions.frames.up({
          id: frame.id
        });
      }
    }, (0, _hyperapp.h)("div", {
      style: {
        width: 0,
        height: 0,
        borderBottom: "10px solid black",
        borderLeft: "10px solid transparent"
      }
    }))));
  };
};

var _default = AppWindow;
exports.default = _default;
},{"hyperapp":"../node_modules/hyperapp/src/index.js","./Draggable":"components/Draggable.js","./apps/AppSelector":"components/apps/AppSelector.js","../cfg":"cfg.js"}],"components/Icon.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = void 0;

var _hyperapp = require("hyperapp");

var _Draggable = _interopRequireDefault(require("./Draggable"));

var _cfg = require("../cfg");

var _libs = require("../libs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getFile = function getFile(path, state) {
  var file = state.fs;
  (0, _libs.pathToArray)(path).forEach(function (el) {
    file = file[el];
  });
  return file;
};

var Icon = function Icon(_ref) {
  var icon = _ref.icon;
  return function (state, actions) {
    var ext = (0, _libs.getExtension)(icon.link);
    var image = _cfg.extMap[ext];
    var fileName = icon.link;
    var payload = getFile(icon.link, state);
    return (0, _hyperapp.h)("div", {
      style: {
        position: "absolute",
        top: icon.position.y + "px",
        left: icon.position.x + "px",
        cursor: "pointer"
      }
    }, (0, _hyperapp.h)(_Draggable.default, {
      ondrag: function ondrag(dx, dy) {
        return actions.icons.move({
          id: icon.id,
          dx: dx,
          dy: dy
        });
      }
    }, (0, _hyperapp.h)("img", {
      src: image,
      height: "40",
      alt: "icon",
      ondblclick: function ondblclick() {
        actions.openFrame({
          fileName: fileName,
          payload: payload
        });
      }
    })), (0, _hyperapp.h)("div", {
      style: {
        maxWidth: "60px",
        color: "white",
        textAlign: "center",
        wordBreak: "break-word"
      }
    }, icon.name));
  };
};

exports.Icon = Icon;
},{"hyperapp":"../node_modules/hyperapp/src/index.js","./Draggable":"components/Draggable.js","../cfg":"cfg.js","../libs":"libs.js"}],"model.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.actions = exports.state = void 0;

var _libs = require("./libs");

var _cfg = require("./cfg");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var state = {
  time: new Date(),
  fs: {
    "cat.jpg": "http://placekitten.com/200/300",
    "wiki.html": "https://www.wikipedia.org",
    "note.txt": "\n      Some random notes about this fun program written with HyperApp\n    ",
    cats: {
      "1.jpg": "http://placekitten.com/500/500",
      "2.jpg": "http://placekitten.com/500/200",
      small: {
        "3.jpg": "http://placekitten.com/100/100",
        "4.jpg": "http://placekitten.com/100/50"
      }
    }
  },
  icons: {
    1: {
      id: 1,
      link: "/cat.jpg",
      name: "cat.jpg",
      position: {
        x: 900,
        y: 100
      }
    },
    2: {
      id: 2,
      link: "/cats",
      name: "cats",
      position: {
        x: 900,
        y: 170
      }
    },
    3: {
      id: 3,
      link: "/wiki.html",
      name: "wikipedia.html",
      position: {
        x: 970,
        y: 100
      }
    },
    4: {
      id: 4,
      link: "/note.txt",
      name: "note.txt",
      position: {
        x: 900,
        y: 240
      }
    }
  },
  frames: {}
};
exports.state = state;

var withOne = function withOne(id, fn) {
  return function (state) {
    if (!state[id]) return {};
    return _defineProperty({}, id, _objectSpread({}, state[id], fn(state[id])));
  };
};

var actions = {
  updateTime: function updateTime(time) {
    return function (state) {
      return _objectSpread({}, state, {
        time: time
      });
    };
  },
  icons: {
    move: function move(_ref2) {
      var id = _ref2.id,
          dx = _ref2.dx,
          dy = _ref2.dy;
      return withOne(id, function (icon) {
        return {
          position: {
            x: icon.position.x + dx,
            y: icon.position.y + dy
          }
        };
      });
    }
  },
  closeFrame: function closeFrame(_ref3) {
    var id = _ref3.id;
    return function (state) {
      var newFrames = {};
      Object.keys(state.frames).filter(function (key) {
        return Number(key) !== id;
      }).forEach(function (key) {
        newFrames[key] = state.frames[key];
      });
      return {
        frames: newFrames
      };
    };
  },
  openFrame: function openFrame(_ref4) {
    var fileName = _ref4.fileName,
        _ref4$payload = _ref4.payload,
        payload = _ref4$payload === void 0 ? null : _ref4$payload;
    return function (state) {
      var id = Math.max.apply(Math, _toConsumableArray(Object.keys(state.frames).map(Number).concat([0]))) + 1;
      var ext = (0, _libs.getExtension)(fileName);
      var type = _cfg.extToType[ext];
      if (ext === "folder") payload = fileName;
      var zIndex = ((0, _libs.getActiveFrame)(state) || {
        zIndex: 0
      }).zIndex + 1;
      var activeFrame = Object.values(state.frames).reverse()[0] || {
        position: {
          x: 100,
          y: 100
        }
      };
      var newFrame = {
        id: id,
        icon: "https://img.icons8.com/color/96/000000/chrome.png",
        position: {
          x: activeFrame.position.x + 10,
          y: activeFrame.position.y + 10
        },
        size: {
          x: 400,
          y: 500
        },
        shown: true,
        fullscreen: false,
        zIndex: zIndex,
        app: {
          type: type,
          payload: payload
        }
      };
      return {
        frames: _objectSpread({}, state.frames, _defineProperty({}, id, newFrame))
      };
    };
  },
  frames: {
    goToDir: function goToDir(_ref5) {
      var id = _ref5.id,
          path = _ref5.path;
      return withOne(id, function (frame) {
        return {
          app: _objectSpread({}, frame.app, {
            payload: path
          })
        };
      });
    },
    move: function move(_ref6) {
      var id = _ref6.id,
          dx = _ref6.dx,
          dy = _ref6.dy;
      return withOne(id, function (frame) {
        return {
          position: {
            x: frame.position.x + dx,
            y: frame.position.y + dy
          }
        };
      });
    },
    resize: function resize(_ref7) {
      var id = _ref7.id,
          dx = _ref7.dx,
          dy = _ref7.dy;
      return withOne(id, function (frame) {
        return {
          size: {
            x: frame.size.x + dx,
            y: frame.size.y + dy
          }
        };
      });
    },
    up: function up(_ref8) {
      var id = _ref8.id;
      return function (state) {
        var maxZIndex = Math.max.apply(Math, _toConsumableArray(Object.values(state).map(function (frame) {
          return frame.zIndex;
        }))) + 1;
        return withOne(id, function (frame) {
          return {
            zIndex: maxZIndex
          };
        })(state);
      };
    },
    changeFullscreen: function changeFullscreen(_ref9) {
      var id = _ref9.id;
      return withOne(id, function (frame) {
        return {
          fullscreen: !frame.fullscreen
        };
      });
    },
    show: function show(_ref10) {
      var id = _ref10.id;
      return withOne(id, function (frame) {
        return {
          shown: true
        };
      });
    },
    hide: function hide(_ref11) {
      var id = _ref11.id;
      return withOne(id, function (frame) {
        return {
          shown: false
        };
      });
    }
  }
};
exports.actions = actions;
},{"./libs":"libs.js","./cfg":"cfg.js"}],"../node_modules/lodash-es/_freeGlobal.js":[function(require,module,exports) {
var global = arguments[3];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
var _default = freeGlobal;
exports.default = _default;
},{}],"../node_modules/lodash-es/_root.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _freeGlobal = _interopRequireDefault(require("./_freeGlobal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
/** Used as a reference to the global object. */

var root = _freeGlobal.default || freeSelf || Function('return this')();
var _default = root;
exports.default = _default;
},{"./_freeGlobal.js":"../node_modules/lodash-es/_freeGlobal.js"}],"../node_modules/lodash-es/_Symbol.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _root = _interopRequireDefault(require("./_root.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Built-in value references. */
var Symbol = _root.default.Symbol;
var _default = Symbol;
exports.default = _default;
},{"./_root.js":"../node_modules/lodash-es/_root.js"}],"../node_modules/lodash-es/_getRawTag.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Symbol = _interopRequireDefault(require("./_Symbol.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Used for built-in method references. */
var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var nativeObjectToString = objectProto.toString;
/** Built-in value references. */

var symToStringTag = _Symbol.default ? _Symbol.default.toStringTag : undefined;
/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */

function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);

  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }

  return result;
}

var _default = getRawTag;
exports.default = _default;
},{"./_Symbol.js":"../node_modules/lodash-es/_Symbol.js"}],"../node_modules/lodash-es/_objectToString.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/** Used for built-in method references. */
var objectProto = Object.prototype;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var nativeObjectToString = objectProto.toString;
/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */

function objectToString(value) {
  return nativeObjectToString.call(value);
}

var _default = objectToString;
exports.default = _default;
},{}],"../node_modules/lodash-es/_baseGetTag.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Symbol = _interopRequireDefault(require("./_Symbol.js"));

var _getRawTag = _interopRequireDefault(require("./_getRawTag.js"));

var _objectToString = _interopRequireDefault(require("./_objectToString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';
/** Built-in value references. */

var symToStringTag = _Symbol.default ? _Symbol.default.toStringTag : undefined;
/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */

function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }

  return symToStringTag && symToStringTag in Object(value) ? (0, _getRawTag.default)(value) : (0, _objectToString.default)(value);
}

var _default = baseGetTag;
exports.default = _default;
},{"./_Symbol.js":"../node_modules/lodash-es/_Symbol.js","./_getRawTag.js":"../node_modules/lodash-es/_getRawTag.js","./_objectToString.js":"../node_modules/lodash-es/_objectToString.js"}],"../node_modules/lodash-es/_overArg.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

var _default = overArg;
exports.default = _default;
},{}],"../node_modules/lodash-es/_getPrototype.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _overArg = _interopRequireDefault(require("./_overArg.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Built-in value references. */
var getPrototype = (0, _overArg.default)(Object.getPrototypeOf, Object);
var _default = getPrototype;
exports.default = _default;
},{"./_overArg.js":"../node_modules/lodash-es/_overArg.js"}],"../node_modules/lodash-es/isObjectLike.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var _default = isObjectLike;
exports.default = _default;
},{}],"../node_modules/lodash-es/isPlainObject.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _baseGetTag = _interopRequireDefault(require("./_baseGetTag.js"));

var _getPrototype = _interopRequireDefault(require("./_getPrototype.js"));

var _isObjectLike = _interopRequireDefault(require("./isObjectLike.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** `Object#toString` result references. */
var objectTag = '[object Object]';
/** Used for built-in method references. */

var funcProto = Function.prototype,
    objectProto = Object.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString = funcProto.toString;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/** Used to infer the `Object` constructor. */

var objectCtorString = funcToString.call(Object);
/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */

function isPlainObject(value) {
  if (!(0, _isObjectLike.default)(value) || (0, _baseGetTag.default)(value) != objectTag) {
    return false;
  }

  var proto = (0, _getPrototype.default)(value);

  if (proto === null) {
    return true;
  }

  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}

var _default = isPlainObject;
exports.default = _default;
},{"./_baseGetTag.js":"../node_modules/lodash-es/_baseGetTag.js","./_getPrototype.js":"../node_modules/lodash-es/_getPrototype.js","./isObjectLike.js":"../node_modules/lodash-es/isObjectLike.js"}],"../node_modules/symbol-observable/es/ponyfill.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = symbolObservablePonyfill;

function symbolObservablePonyfill(root) {
  var result;
  var Symbol = root.Symbol;

  if (typeof Symbol === 'function') {
    if (Symbol.observable) {
      result = Symbol.observable;
    } else {
      result = Symbol('observable');
      Symbol.observable = result;
    }
  } else {
    result = '@@observable';
  }

  return result;
}

;
},{}],"../node_modules/symbol-observable/es/index.js":[function(require,module,exports) {
var global = arguments[3];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ponyfill = _interopRequireDefault(require("./ponyfill.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global window */
var root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill.default)(root);
var _default = result;
exports.default = _default;
},{"./ponyfill.js":"../node_modules/symbol-observable/es/ponyfill.js"}],"../node_modules/redux/es/createStore.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createStore;
exports.ActionTypes = void 0;

var _isPlainObject = _interopRequireDefault(require("lodash-es/isPlainObject"));

var _symbolObservable = _interopRequireDefault(require("symbol-observable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = {
  INIT: '@@redux/INIT'
  /**
   * Creates a Redux store that holds the state tree.
   * The only way to change the data in the store is to call `dispatch()` on it.
   *
   * There should only be a single store in your app. To specify how different
   * parts of the state tree respond to actions, you may combine several reducers
   * into a single reducer function by using `combineReducers`.
   *
   * @param {Function} reducer A function that returns the next state tree, given
   * the current state tree and the action to handle.
   *
   * @param {any} [preloadedState] The initial state. You may optionally specify it
   * to hydrate the state from the server in universal apps, or to restore a
   * previously serialized user session.
   * If you use `combineReducers` to produce the root reducer function, this must be
   * an object with the same shape as `combineReducers` keys.
   *
   * @param {Function} [enhancer] The store enhancer. You may optionally specify it
   * to enhance the store with third-party capabilities such as middleware,
   * time travel, persistence, etc. The only store enhancer that ships with Redux
   * is `applyMiddleware()`.
   *
   * @returns {Store} A Redux store that lets you read the state, dispatch actions
   * and subscribe to changes.
   */

};
exports.ActionTypes = ActionTypes;

function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */


  function getState() {
    return currentState;
  }
  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */


  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;
      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }
  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */


  function dispatch(action) {
    if (!(0, _isPlainObject.default)(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }

    return action;
  }
  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */


  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({
      type: ActionTypes.INIT
    });
  }
  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */


  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe: unsubscribe
        };
      }
    }, _ref[_symbolObservable.default] = function () {
      return this;
    }, _ref;
  } // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.


  dispatch({
    type: ActionTypes.INIT
  });
  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[_symbolObservable.default] = observable, _ref2;
}
},{"lodash-es/isPlainObject":"../node_modules/lodash-es/isPlainObject.js","symbol-observable":"../node_modules/symbol-observable/es/index.js"}],"../node_modules/redux/es/utils/warning.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = warning;

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */


  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */

}
},{}],"../node_modules/redux/es/combineReducers.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = combineReducers;

var _createStore = require("./createStore");

var _isPlainObject = _interopRequireDefault(require("lodash-es/isPlainObject"));

var _warning = _interopRequireDefault(require("./utils/warning"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';
  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state. ' + 'If you want this reducer to hold no value, you can return null instead of undefined.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject.default)(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });
  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, {
      type: _createStore.ActionTypes.INIT
    });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined. If you don\'t want to set a value for this reducer, ' + 'you can use null instead of undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');

    if (typeof reducer(undefined, {
      type: type
    }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined, but can be null.');
    }
  });
}
/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */


function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};

  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if ("development" !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        (0, _warning.default)('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  var finalReducerKeys = Object.keys(finalReducers);
  var unexpectedKeyCache = void 0;

  if ("development" !== 'production') {
    unexpectedKeyCache = {};
  }

  var shapeAssertionError = void 0;

  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    if ("development" !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);

      if (warningMessage) {
        (0, _warning.default)(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};

    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer = finalReducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(_key, action);
        throw new Error(errorMessage);
      }

      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}
},{"./createStore":"../node_modules/redux/es/createStore.js","lodash-es/isPlainObject":"../node_modules/lodash-es/isPlainObject.js","./utils/warning":"../node_modules/redux/es/utils/warning.js"}],"../node_modules/redux/es/bindActionCreators.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bindActionCreators;

function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}
/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */


function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];

    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }

  return boundActionCreators;
}
},{}],"../node_modules/redux/es/compose.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = compose;

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(undefined, arguments));
    };
  });
}
},{}],"../node_modules/redux/es/applyMiddleware.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = applyMiddleware;

var _compose = _interopRequireDefault(require("./compose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];
      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose.default.apply(undefined, chain)(store.dispatch);
      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":"../node_modules/redux/es/compose.js"}],"../node_modules/redux/es/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "createStore", {
  enumerable: true,
  get: function () {
    return _createStore.default;
  }
});
Object.defineProperty(exports, "combineReducers", {
  enumerable: true,
  get: function () {
    return _combineReducers.default;
  }
});
Object.defineProperty(exports, "bindActionCreators", {
  enumerable: true,
  get: function () {
    return _bindActionCreators.default;
  }
});
Object.defineProperty(exports, "applyMiddleware", {
  enumerable: true,
  get: function () {
    return _applyMiddleware.default;
  }
});
Object.defineProperty(exports, "compose", {
  enumerable: true,
  get: function () {
    return _compose.default;
  }
});

var _createStore = _interopRequireDefault(require("./createStore"));

var _combineReducers = _interopRequireDefault(require("./combineReducers"));

var _bindActionCreators = _interopRequireDefault(require("./bindActionCreators"));

var _applyMiddleware = _interopRequireDefault(require("./applyMiddleware"));

var _compose = _interopRequireDefault(require("./compose"));

var _warning = _interopRequireDefault(require("./utils/warning"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if ("development" !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning.default)('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}
},{"./createStore":"../node_modules/redux/es/createStore.js","./combineReducers":"../node_modules/redux/es/combineReducers.js","./bindActionCreators":"../node_modules/redux/es/bindActionCreators.js","./applyMiddleware":"../node_modules/redux/es/applyMiddleware.js","./compose":"../node_modules/redux/es/compose.js","./utils/warning":"../node_modules/redux/es/utils/warning.js"}],"../node_modules/redux-devtools-extension/index.js":[function(require,module,exports) {
"use strict";

var compose = require('redux').compose;

exports.__esModule = true;
exports.composeWithDevTools = (
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
    function() {
      if (arguments.length === 0) return undefined;
      if (typeof arguments[0] === 'object') return compose;
      return compose.apply(null, arguments);
    }
);

exports.devToolsEnhancer = (
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ ?
    window.__REDUX_DEVTOOLS_EXTENSION__ :
    function() { return function(noop) { return noop; } }
);

},{"redux":"../node_modules/redux/es/index.js"}],"../node_modules/hyperapp-redux-devtools/index.js":[function(require,module,exports) {
var { createStore } = require("redux");
var { composeWithDevTools } = require("redux-devtools-extension");

function reduxReducer(state = {}, action) {
  return Object.assign({}, state, action.payload);
}

function reducAction(name, data) {
  return {
    type: name,
    payload: data
  };
}

function copy(target, source) {
  var obj = {};
  for (var i in target) obj[i] = target[i];
  for (var i in source) obj[i] = source[i];
  return obj;
}

function set(path, value, source, target) {
  if (path.length) {
    target[path[0]] =
      1 < path.length ? set(path.slice(1), value, source[path[0]], {}) : value;
    return copy(source, target);
  }
  return value;
}

function get(path, source) {
  for (var i = 0; i < path.length; i++) {
    source = source[path[i]];
  }
  return source;
}

module.exports = function devtools(app) {
  var composeEnhancers = composeWithDevTools({ action: reducAction });
  var store;

  return function(state, actions, view, container) {
    var appActions;

    function wire(path, actions) {
      for (var key in actions) {
        if (typeof actions[key] === "function") {
          (function(key, action) {
            actions[key] = function() {
              var reducer = action.apply(this, arguments);
              return function (slice) {
                var data = typeof reducer === "function"
                  ? reducer(slice, get(path, appActions))
                  : reducer;
                if (data && !data.then) {
                  state = set(path, copy(slice, data), state, {});
                  store.dispatch(reducAction(key, state));
                }
                return data;
              };
            };
          })(key, actions[key]);
        } else {
          wire(path.concat(key), (actions[key] = copy(actions[key])));
        }
      }
    }
    wire([], (actions = copy(actions)));

    actions.replaceState = function(actualState) {
      return function (state) {
        return actualState;
      }
    };
    store = createStore(reduxReducer, state, composeEnhancers());
    store.subscribe(function() {
      appActions.replaceState(store.getState());
    });

    appActions = app(state, actions, view, container);
    return appActions;
  };
};


},{"redux":"../node_modules/redux/es/index.js","redux-devtools-extension":"../node_modules/redux-devtools-extension/index.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _hyperapp = require("hyperapp");

var _Screen = _interopRequireDefault(require("./components/Screen"));

var _DockBarIcon = _interopRequireDefault(require("./components/DockBarIcon"));

var _DockBar = _interopRequireDefault(require("./components/DockBar"));

var _SystemTopBar = _interopRequireWildcard(require("./components/SystemTopBar"));

var _AppWindow = _interopRequireDefault(require("./components/AppWindow"));

var _Icon = require("./components/Icon");

var _model = require("./model");

var _libs = require("./libs");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var App = function App(state, actions) {
  return (0, _hyperapp.h)(_Screen.default, null, (0, _hyperapp.h)(_SystemTopBar.default, null, (0, _hyperapp.h)("div", null, (0, _hyperapp.h)("span", null, "JSOS ")), (0, _hyperapp.h)("div", null, ((0, _libs.getActiveFrame)(state) || {
    name: "-"
  }).name), (0, _hyperapp.h)("div", null, (0, _hyperapp.h)(_SystemTopBar.Clock, null))), Object.values(state.icons).map(function (icon) {
    return (0, _hyperapp.h)(_Icon.Icon, {
      key: icon.id,
      icon: icon
    });
  }), Object.values(state.frames).filter(function (app) {
    return app.shown;
  }).map(function (app) {
    return (0, _hyperapp.h)(_AppWindow.default, {
      key: app.id,
      app: app
    });
  }), (0, _hyperapp.h)(_DockBar.default, null, Object.values(state.frames).map(function (app) {
    return (0, _hyperapp.h)(_DockBarIcon.default, {
      key: app.id,
      app: app,
      handleClick: function handleClick() {
        actions.frames.up({
          id: app.id
        });
        actions.frames.show({
          id: app.id
        });
      }
    });
  })));
};

if ("development" !== "production") {
  require("hyperapp-redux-devtools")(_hyperapp.app)(_model.state, _model.actions, App, document.getElementById("app"));
} else {
  (0, _hyperapp.app)(_model.state, _model.actions, App, document.getElementById("app"));
}
},{"hyperapp":"../node_modules/hyperapp/src/index.js","./components/Screen":"components/Screen.js","./components/DockBarIcon":"components/DockBarIcon.js","./components/DockBar":"components/DockBar.js","./components/SystemTopBar":"components/SystemTopBar.js","./components/AppWindow":"components/AppWindow.js","./components/Icon":"components/Icon.js","./model":"model.js","./libs":"libs.js","hyperapp-redux-devtools":"../node_modules/hyperapp-redux-devtools/index.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57401" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.map