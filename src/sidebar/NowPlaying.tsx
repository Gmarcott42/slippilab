import { useSnapshot } from "valtio";
import { replayStore } from "~/state/replayStore";
import { selectionStore } from "~/state/selectionStore";

export function NowPlaying() {
  const { replayData } = useSnapshot(replayStore);
  const { selectedFileAndSettings } = useSnapshot(selectionStore);
  const info =
    replayData === undefined || selectedFileAndSettings === undefined
      ? {}
      : {
          name: selectedFileAndSettings[0].name,
          date: new Date(replayData.settings.startTimestamp).toLocaleString(),
        };
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="text-xl">{info.name}</div>
        {info.date && <div className="text-xl">{info.date}</div>}
      </div>
    </>
  );
}
