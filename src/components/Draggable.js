import { h } from "hyperapp";

let x0;
let y0;

const Draggable = ({ ondrag, up = () => {} }, children) => (
  <div
    onmousedown={e => {
      x0 = e.x;
      y0 = e.y;
      up();
    }}
    draggable
    ondrag={e => {
      // hack
      if (e.x === 0 && e.y === 0) return;

      const dx = e.x - x0;
      const dy = e.y - y0;
      ondrag(dx, dy);
      x0 = e.x;
      y0 = e.y;
    }}
  >
    {children}
  </div>
);

export default Draggable;
