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

export const rnd = (from, to) => from + Math.random() * (to - from);
export const rndInt = (from, to) => Math.round(rnd(from, to));

export const fillFolderWithImages = (folder, index, maxIndex) => {
  for (let i = index; i < maxIndex; i++) {
    if (Math.random() > 0.1) {
      if (Math.random() > 0.3) {
        const fileName = `cat_${i}.jpg`;
        folder[fileName] = `http://placekitten.com/${rndInt(
          100,
          1000
        )}/${rndInt(100, 1000)}`;
      } else {
        const fileName = `random_${i}.jpg`;
        folder[fileName] = `https://picsum.photos/200/300?image=${i}`;
      }
    } else {
      const folderName = `folder_${i}`;
      folder[folderName] = {};
      fillFolderWithImages(folder[folderName], i, maxIndex);
    }
  }
};
