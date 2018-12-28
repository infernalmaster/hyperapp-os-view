import { getExtension, getActiveFrame, fillFolderWithImages } from "./libs";
import { extToType } from "./cfg";

export const state = {
  time: new Date(),

  fs: {
    "cat.jpg": "http://placekitten.com/200/300",
    "wiki.html": "https://www.wikipedia.org",
    "note.txt": `
      Some random notes about this fun program written with HyperApp
    `,

    "Lorn-Anvil.mp3": {
      url: "https://521dimensions.com/songs/LORN - ANVIL.mp3",
      cover_art_url:
        "https://521dimensions.com/img/open-source/amplitudejs/album-art/anvil.jpg"
    },

    photos: {
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
      position: { x: 900, y: 100 }
    },
    2: {
      id: 2,
      link: "/photos",
      name: "photos",
      position: { x: 900, y: 170 }
    },
    3: {
      id: 3,
      link: "/wiki.html",
      name: "wikipedia.html",
      position: { x: 970, y: 100 }
    },
    4: {
      id: 4,
      link: "/note.txt",
      name: "note.txt",
      position: { x: 900, y: 240 }
    },
    5: {
      id: 4,
      link: "/Lorn-Anvil.mp3",
      name: "lorn-anvil.mp3",
      position: { x: 970, y: 240 }
    }
  },

  frames: {}
};

fillFolderWithImages(state.fs.photos, 0, 100);

const withOne = (id, fn) => state => {
  if (!state[id]) return {};
  return {
    [id]: {
      ...state[id],
      ...fn(state[id])
    }
  };
};

export const actions = {
  updateTime: time => state => ({ ...state, time }),

  icons: {
    move: ({ id, dx, dy }) =>
      withOne(id, icon => ({
        position: {
          x: icon.position.x + dx,
          y: icon.position.y + dy
        }
      }))
  },

  closeFrame: ({ id }) => state => {
    let newFrames = {};
    Object.keys(state.frames)
      .filter(key => Number(key) !== id)
      .forEach(key => {
        newFrames[key] = state.frames[key];
      });

    return { frames: newFrames };
  },

  openFrame: ({ fileName, payload = null }) => state => {
    const id =
      Math.max(
        ...Object.keys(state.frames)
          .map(Number)
          .concat([0])
      ) + 1;

    const ext = getExtension(fileName);
    const type = extToType[ext];

    if (ext === "folder") payload = fileName;

    const zIndex = (getActiveFrame(state) || { zIndex: 0 }).zIndex + 1;

    const activeFrame = Object.values(state.frames).reverse()[0] || {
      position: { x: 100, y: 100 }
    };

    const newFrame = {
      id,
      position: {
        x: activeFrame.position.x + 20,
        y: activeFrame.position.y + 20
      },
      size: {
        x: 400,
        y: 500
      },
      shown: true,
      fullscreen: false,
      zIndex,
      app: {
        type,
        payload
      }
    };

    return { frames: { ...state.frames, [id]: newFrame } };
  },

  frames: {
    goToDir: ({ id, path }) =>
      withOne(id, frame => ({
        app: {
          ...frame.app,
          payload: path
        }
      })),

    move: ({ id, dx, dy }) =>
      withOne(id, frame => ({
        position: {
          x: frame.position.x + dx,
          y: frame.position.y + dy
        }
      })),

    resize: ({ id, dx, dy }) =>
      withOne(id, frame => ({
        size: {
          x: frame.size.x + dx,
          y: frame.size.y + dy
        }
      })),

    up: ({ id }) => state => {
      let maxZIndex =
        Math.max(...Object.values(state).map(frame => frame.zIndex)) + 1;

      return withOne(id, frame => ({
        zIndex: maxZIndex
      }))(state);
    },

    changeFullscreen: ({ id }) =>
      withOne(id, frame => ({
        fullscreen: !frame.fullscreen
      })),

    show: ({ id }) =>
      withOne(id, frame => ({
        shown: true
      })),

    hide: ({ id }) =>
      withOne(id, frame => ({
        shown: false
      }))
  }
};
