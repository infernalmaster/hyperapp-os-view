export const getExtension = file => {
  const ext = file
    .split("/")
    .reverse()[0]
    .split(".")[1];

  return ext ? ext : "folder";
};

export const pathToArray = path => path.split("/").filter(el => el);

export const getActiveFrame = state =>
  Object.values(state.frames).sort((a, b) => b.zIndex - a.zIndex)[0];
