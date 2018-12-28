export const topBarHeight = 20;
export const extMap = {
  folder: "https://img.icons8.com/color/96/000000/folder-invoices.png",
  txt: "https://img.icons8.com/color/96/000000/txt.png",
  jpg: "https://img.icons8.com/color/96/000000/jpg.png",
  html: "https://img.icons8.com/color/96/000000/html-filetype.png",
  mp3: "https://img.icons8.com/color/96/000000/mp3.png"
};

export const extToType = {
  folder: "Finder",
  html: "Browser",
  jpg: "Paint",
  txt: "Word",
  mp3: "MusicPlayer"
};

export const iconByType = {
  Finder: "https://img.icons8.com/color/96/000000/computer.png",
  Word: "https://img.icons8.com/color/96/000000/pen.png",
  Paint: "https://img.icons8.com/color/96/000000/stack-of-photos.png",
  Browser: "https://img.icons8.com/color/96/000000/firefox.png",
  MusicPlayer: "https://img.icons8.com/color/48/000000/musical-notes.png"
};

export const newFileByType = {
  Finder: { fileName: "/" },
  Word: { fileName: "new.txt", payload: "" },
  Paint: {
    fileName: "new.jpg",
    payload: "http://placekitten.com/500/500"
  },
  Browser: { fileName: "new.html", payload: "https://www.wikipedia.org" },
  MusicPlayer: {
    fileName: "new.mp3",
    payload: {
      url: "https://521dimensions.com/songs/LORN - ANVIL.mp3",
      cover_art_url:
        "https://521dimensions.com/img/open-source/amplitudejs/album-art/anvil.jpg"
    }
  }
};
