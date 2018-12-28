import { h } from "hyperapp";

const Paint = ({ frame }) => (
  <div>
    <img
      src={frame.app.payload.cover_art_url}
      alt="album-cover"
      style={{ width: "100%" }}
    />
    <audio controls="controls" autoplay="autoplay" style={{ width: "100%" }}>
      Ваш браузер не поддерживает <code>audio</code> элемент.
      <source src={frame.app.payload.url} type="audio/mp3" />
    </audio>
  </div>
);

export default Paint;
