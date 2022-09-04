import { useSnapshot } from "valtio";
import { Clips } from "~/sidebar/Clips";
import { Replays } from "~/sidebar/Replays";
import { replayStore } from "~/state/replayStore";
import { Controls } from "~/viewer/Controls";
import { Viewer } from "~/viewer/Viewer";

export function MainContent() {
  const { replayData } = useSnapshot(replayStore);
  return (
    <div className="box-border flex w-full flex-col-reverse gap-5 p-5 md:h-full md:flex-row md:overflow-y-auto">
      {/* <div className="w-full md:h-full md:w-auto md:overflow-y-auto">
        <Replays />
      </div>
      <div className="w-full md:h-full md:w-auto md:overflow-y-auto">
        <Clips />
      </div> */}
      <div className="flex w-full flex-grow flex-col justify-between overflow-y-auto md:h-full md:w-auto">
        <Viewer />
        {replayData && <Controls />}
      </div>
    </div>
  );
}
