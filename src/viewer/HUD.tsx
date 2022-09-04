import { useSnapshot } from "valtio";
import { replayStore } from "~/state/replayStore";
import { PlayerHUD } from "~/viewer/PlayerHUD";
import { Timer } from "~/viewer/Timer";

export function HUD() {
  const { replayData } = useSnapshot(replayStore);
  const playerIndexes = replayData!.settings.playerSettings
    .filter(Boolean)
    .map((playerSettings) => playerSettings.playerIndex);
  return (
    <>
      <Timer />
      {playerIndexes.map((playerIndex, index) => (
        <PlayerHUD key={index} player={playerIndex} />
      ))}
    </>
  );
}
