import { Camera } from "~/viewer/Camera";
import { HUD } from "~/viewer/HUD";
import { Players } from "~/viewer/Player";
import { Stage } from "~/viewer/Stage";
import { Item } from "~/viewer/Item";
import { replayStore } from "~/state/replayStore";

export function Viewer() {
  const items = replayStore.replayData?.frames[replayStore.frame].items ?? [];
  if (!replayStore.replayData) {
    return null;
  }
  return (
    <svg
      /* up = positive y axis */
      className="rounded-lg border bg-slate-50"
      viewBox="-365 -300 730 600"
    >
      <g className="-scale-y-100">
        <Camera>
          <>
            <Stage />
            <Players />
            {items.map((item, index) => (
              <Item key={index} item={item} />
            ))}
          </>
        </Camera>
        <HUD />
      </g>
    </svg>
  );
}
