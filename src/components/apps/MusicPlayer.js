import { h } from "hyperapp";

const Paint = ({ frame }) => (
  <div>
    {frame.app.payload.cover_art_url && (
      <img
        src={frame.app.payload.cover_art_url}
        alt="album-cover"
        style={{ width: "100%" }}
      />
    )}

    <audio
      controls="controls"
      autoplay="autoplay"
      style={{ width: "100%" }}
      src={frame.app.payload.url}
    />
  </div>
);

export default Paint;
