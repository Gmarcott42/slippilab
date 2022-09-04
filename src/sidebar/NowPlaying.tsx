import { replayStore } from "~/state/replayStore";
import { selectionStore } from "~/state/selectionStore";

export function NowPlaying() {
  const info =
    replayStore.replayData === undefined ||
    selectionStore.selectedFileAndSettings === undefined
      ? {}
      : {
          name: selectionStore.selectedFileAndSettings[0].name,
          date: new Date(
            replayStore.replayData.settings.startTimestamp
          ).toLocaleString(),
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
