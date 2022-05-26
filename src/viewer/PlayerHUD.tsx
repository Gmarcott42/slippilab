import { createMemo, For, Show } from "solid-js";
import { characterNameByInternalId } from "../common/ids";
import { frame, store } from "../state";
import { playerColors, teamColors } from "./colors";

export function PlayerHUD(props: { player: number }) {
  const playerState = createMemo(
    () => store.replayData!.frames[frame()].players[props.player]?.state
  );
  const playerSettings = createMemo(
    () => store.replayData!.settings.playerSettings[props.player]
  );
  const position = createMemo(() => ({
    x: -30 + 20 * props.player, // ports at: -30%, -10%, 10%, 30%
    y: 40, // y% is flipped by css to make the text right-side up.
  }));
  const color = createMemo(() => getPlayerColor(props.player));
  const name = createMemo(() =>
    [
      playerSettings().displayName,
      playerSettings().connectCode,
      playerSettings().nametag,
      playerSettings().playerType === 1
        ? "CPU"
        : characterNameByInternalId[playerState()?.internalCharacterId],
    ].find(n => n?.length > 0)
  );
  return (
    <>
      <Show when={playerState()}>
        <For each={Array(playerState().stocksRemaining).fill(0)}>
          {(_, i) => (
            <circle
              cx={`${position().x - 2 * (1.5 - i())}%`}
              cy={`-${position().y}%`}
              r={5}
              fill={color()}
              stroke="black"
            />
          )}
        </For>
        <text
          style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
          x={`${position().x}%`}
          y={`${position().y + 4}%`}
          text-anchor="middle"
          textContent={`${Math.floor(playerState().percent)}%`}
          fill={color()}
          stroke="black"
        />
        <text
          style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
          x={`${position().x}%`}
          y={`${position().y + 7}%`}
          text-anchor="middle"
          textContent={name()}
          fill={color()}
          stroke="black"
        />
        <Show when={store.isDebug}>
          <text
            style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
            x={`${position().x}%`}
            y="-40%"
            text-anchor="middle"
            textContent={`State: ${playerState().actionStateId}`}
            fill={color()}
            stroke="black"
          />
          <text
            style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
            x={`${position().x}%`}
            y="-37%"
            text-anchor="middle"
            textContent={`Frame: ${parseFloat(
              playerState().actionStateFrameCounter.toFixed(4)
            )}`}
            fill={color()}
            stroke="black"
          />
          <text
            style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
            x={`${position().x}%`}
            y="-34%"
            text-anchor="middle"
            textContent={`X: ${parseFloat(playerState().xPosition.toFixed(4))}`}
            fill={color()}
            stroke="black"
          />
          <text
            style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
            x={`${position().x}%`}
            y="-31%"
            text-anchor="middle"
            textContent={`Y: ${parseFloat(playerState().yPosition.toFixed(4))}`}
            fill={color()}
            stroke="black"
          />
        </Show>
      </Show>
    </>
  );
}

// TODO: dedupe with same code in Player.tsx
function getPlayerColor(playerIndex: number) {
  if (store.replayData!.settings.isTeams) {
    const teamId =
      store.replayData!.settings.playerSettings[playerIndex].teamId;
    return teamColors[teamId];
  }
  return playerColors[playerIndex];
}
