import { h } from "hyperapp";

export default (prosp, children) => (
  <div
    style={{
      position: "fixed",
      width: "100%",
      height: "100%",
      backgroundImage:
        "url(https://wallpapersite.com/images/pages/pic_h/5165.jpg)",
      backgroundSize: "cover"
    }}
  >
    {children}
  </div>
);
