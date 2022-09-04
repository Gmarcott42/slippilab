import { characterNameByInternalId } from "~/common/ids";
import { replayStore } from "~/state/replayStore";

export function PlayerHUD(props: { player: number }) {
  const renderData = replayStore.renderDatas.find(
    (renderData) =>
      renderData.playerSettings.playerIndex === props.player &&
      renderData.playerState.isNana === false
  );
  const position = {
    x: -30 + 20 * props.player, // ports at: -30%, -10%, 10%, 30%
    y: 40, // y% is flipped by css to make the text right-side up.
  };
  const name = renderData
    ? [
        renderData!.playerSettings.displayName,
        renderData!.playerSettings.connectCode,
        renderData!.playerSettings.nametag,
        renderData!.playerSettings.displayName,
        renderData!.playerSettings.playerType === 1
          ? "CPU"
          : characterNameByInternalId[
              renderData!.playerState.internalCharacterId
            ],
      ].find((n) => n !== undefined && n.length > 0)
    : "";
  if (!renderData) {
    return null;
  }
  return (
    <>
      {Array(renderData!.playerState.stocksRemaining)
        .fill(0)
        .map((_, index) => (
          <circle
            key={index}
            cx={`${position.x - 2 * (1.5 - index)}%`}
            cy={`-${position.y}%`}
            r={5}
            fill={renderData!.innerColor}
            stroke="black"
          />
        ))}
      <text
        style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
        x={`${position.x}%`}
        y={`${position.y + 4}%`}
        text-anchor="middle"
        fill={renderData!.innerColor}
        stroke="black"
      >{`${Math.floor(renderData!.playerState.percent)}%`}</text>
      <text
        style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
        x={`${position.x}%`}
        y={`${position.y + 7}%`}
        text-anchor="middle"
        fill={renderData!.innerColor}
        stroke="black"
      >
        {name}
      </text>
      {replayStore.isDebug && (
        <>
          <text
            style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
            x={`${position.x}%`}
            y="-40%"
            text-anchor="middle"
            fill={renderData!.innerColor}
            stroke="black"
          >
            {`State ID: ${renderData!.playerState.actionStateId}`}
          </text>
          <text
            style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
            x={`${position.x}%`}
            y="-37%"
            text-anchor="middle"
            fill={renderData!.innerColor}
            stroke="black"
          >
            {`State Frame: ${parseFloat(
              renderData!.playerState.actionStateFrameCounter.toFixed(4)
            )}`}
          </text>
          <text
            style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
            x={`${position.x}%`}
            y="-34%"
            text-anchor="middle"
            fill={renderData!.innerColor}
            stroke="black"
          >
            {`X: ${parseFloat(renderData!.playerState.xPosition.toFixed(4))}`}
          </text>
          <text
            style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
            x={`${position.x}%`}
            y="-31%"
            text-anchor="middle"
            fill={renderData!.innerColor}
            stroke="black"
          >
            {`Y: ${parseFloat(renderData!.playerState.yPosition.toFixed(4))}`}
          </text>
          <text
            style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
            x={`${position.x}%`}
            y="-28%"
            text-anchor="middle"
            fill={renderData!.innerColor}
            stroke="black"
          >
            {renderData!.animationName}
          </text>
        </>
      )}
    </>
  );
}
