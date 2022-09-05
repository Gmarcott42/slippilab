import { Fragment } from "react";
import { useSnapshot } from "valtio";
import { characterNameByExternalId } from "~/common/ids";
import { ReplayData } from "~/common/types";
import { RenderData, replayStore } from "~/state/replayStore";
import { getPlayerOnFrame, getStartOfAction } from "~/viewer/viewerUtil";

export function Players() {
  const { renderDatas } = useSnapshot(replayStore);
  return (
    <>
      {renderDatas.map((renderData, index) => (
        <Fragment key={index}>
          <path
            transform={renderData.transforms.join(" ")}
            d={renderData.path}
            fill={renderData.innerColor}
            strokeWidth={2}
            stroke={renderData.outerColor}
          />
          <Shield renderData={renderData as RenderData} />
          <Shine renderData={renderData as RenderData} />
        </Fragment>
      ))}
    </>
  );
}

function Shield({ renderData }: { renderData: RenderData }) {
  const { replayData } = useSnapshot(replayStore);
  // [0,60]
  const shieldHealth = renderData.playerState.shieldSize;
  // [0,1]. If 0 is received, set to 1 because user may have released shield
  // during a Guard-related animation. As an example, a shield must stay active
  // for 8 frames minimum before it is dropped even if the player releases the
  // trigger early.
  // For GuardDamage the shield strength is fixed and ignores trigger updates,
  // so we must walk back to the first frame of stun and read trigger there.
  const triggerStrength =
    renderData.animationName === "GuardDamage"
      ? getPlayerOnFrame(
          renderData.playerSettings.playerIndex,
          getStartOfAction(renderData.playerState, replayData as ReplayData),
          replayData as ReplayData
        ).inputs.processed.anyTrigger
      : renderData.playerInputs.processed.anyTrigger === 0
      ? 1
      : renderData.playerInputs.processed.anyTrigger;
  // Formulas from https://www.ssbwiki.com/Shield#Shield_statistics
  const triggerStrengthMultiplier = 1 - (0.5 * (triggerStrength - 0.3)) / 0.7;
  const shieldSizeMultiplier =
    ((shieldHealth * triggerStrengthMultiplier) / 60) * 0.85 + 0.15;
  if (
    !["GuardOn", "Guard", "GuardReflect", "GuardDamage"].includes(
      renderData.animationName
    )
  ) {
    return null;
  }
  return (
    <circle
      // TODO: shield tilts
      cx={
        renderData.playerState.xPosition +
        renderData.characterData.shieldOffset[0] *
          renderData.playerState.facingDirection
      }
      cy={
        renderData.playerState.yPosition +
        renderData.characterData.shieldOffset[1]
      }
      r={renderData.characterData.shieldSize * shieldSizeMultiplier}
      fill={renderData.innerColor}
      opacity={0.6}
    />
  );
}

function Shine({ renderData }: { renderData: RenderData }) {
  const characterName =
    characterNameByExternalId[renderData.playerSettings.externalCharacterId];
  if (
    !["Fox", "Falco"].includes(characterName) ||
    !(
      renderData.animationName.includes("SpecialLw") ||
      renderData.animationName.includes("SpecialAirLw")
    )
  ) {
    return null;
  }
  return (
    <Hexagon
      x={renderData.playerState.xPosition}
      // TODO get true shine position, shieldY * 3/4 is a guess.
      y={
        renderData.playerState.yPosition +
        (renderData.characterData.shieldOffset[1] * 3) / 4
      }
      r={6}
    />
  );
}

function Hexagon({ x, y, r }: { x: number; y: number; r: number }) {
  const hexagonHole = 0.6;
  const sideX = Math.sin((2 * Math.PI) / 6);
  const sideY = 0.5;
  const offsets = [
    [0, 1],
    [sideX, sideY],
    [sideX, -sideY],
    [0, -1],
    [-sideX, -sideY],
    [-sideX, sideY],
  ];
  const points = offsets
    .map(([xOffset, yOffset]) => [r * xOffset + x, r * yOffset + y].join(","))
    .join(",");
  const maskPoints = offsets
    .map(([xOffset, yOffset]) =>
      [r * xOffset * hexagonHole + x, r * yOffset * hexagonHole + y].join(",")
    )
    .join(",");
  return (
    <>
      <defs>
        <mask id="innerHexagon">
          <polygon points={points} fill="white" />
          <polygon points={maskPoints} fill="black" />
        </mask>
      </defs>
      <polygon points={points} fill="#8abce9" mask="url(#innerHexagon)" />
    </>
  );
}
