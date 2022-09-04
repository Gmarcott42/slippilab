import { proxy, snapshot, subscribe } from "valtio";
import { subscribeKey } from "valtio/utils";
import { map, max, modulo, times, update } from "rambda";
// import { createResource } from "solid-js";
import {
  actionNameById,
  characterNameByExternalId,
  characterNameByInternalId,
} from "~/common/ids";
import {
  PlayerInputs,
  PlayerSettings,
  PlayerState,
  PlayerUpdate,
  PlayerUpdateWithNana,
  ReplayData,
} from "~/common/types";
import { parseReplay } from "~/parser/parser";
import { queries } from "~/search/queries";
import { Highlight, search } from "~/search/search";
import { selectionStore } from "~/state/selectionStore";
import { CharacterAnimations, fetchAnimations } from "~/viewer/animationCache";
import { actionMapByInternalId } from "~/viewer/characters";
import { Character } from "~/viewer/characters/character";
import { getPlayerOnFrame, getStartOfAction } from "~/viewer/viewerUtil";
import colors from "tailwindcss/colors";
import { fileStore } from "~/state/fileStore";

export interface RenderData {
  playerState: PlayerState;
  playerInputs: PlayerInputs;
  playerSettings: PlayerSettings;

  // main render
  path?: string;
  innerColor: string;
  outerColor: string;
  transforms: string[];

  // shield/shine renders
  animationName: string;
  characterData: Character;
}

export interface ReplayStoreState {
  replayData?: ReplayData;
  highlights: Record<string, Highlight[]>;
  selectedHighlight?: [string, Highlight];
  animations: (CharacterAnimations | undefined)[];
  frame: number;
  renderDatas: RenderData[];
  fps: number;
  framesPerTick: number;
  running: boolean;
  zoom: number;
  isDebug: boolean;
}
export const defaultReplayStoreState: ReplayStoreState = {
  highlights: map(() => [], queries),
  frame: 0,
  renderDatas: [],
  animations: Array(4).fill(undefined),
  fps: 60,
  framesPerTick: 1,
  running: false,
  zoom: 1,
  isDebug: false,
};

export const replayStore: ReplayStoreState = proxy(defaultReplayStoreState);

export function selectHighlight(nameAndHighlight: [string, Highlight]) {
  replayStore.selectedHighlight = nameAndHighlight;
  replayStore.frame = wrapFrame(
    replayStore,
    nameAndHighlight[1].startFrame - 30
  );
}

export function nextHighlight() {
  const highlights = Object.entries(replayStore.highlights).flatMap(
    ([name, highlights]) =>
      highlights.map((highlight): [string, Highlight] => [name, highlight])
  );
  const currentIndex =
    replayStore.selectedHighlight !== undefined
      ? highlights.findIndex(
          ([name, highlight]) => replayStore.selectedHighlight![1] === highlight
        )
      : -1;
  const nextIndex = wrapHighlight(replayStore, currentIndex + 1);
  replayStore.selectedHighlight = highlights[nextIndex];
  replayStore.frame = highlights[nextIndex][1].startFrame - 30;
}

export function previousHighlight() {
  const highlights = Object.entries(replayStore.highlights).flatMap(
    ([name, highlights]) =>
      highlights.map((highlight): [string, Highlight] => [name, highlight])
  );
  const currentIndex =
    replayStore.selectedHighlight !== undefined
      ? highlights.findIndex(
          ([name, highlight]) => replayStore.selectedHighlight![1] === highlight
        )
      : 1;
  const previousIndex = wrapHighlight(replayStore, currentIndex - 1);
  replayStore.selectedHighlight = highlights[previousIndex];
  replayStore.frame = highlights[previousIndex][1].startFrame - 30;
}

export function speedNormal(): void {
  replayStore.fps = 60;
  replayStore.framesPerTick = 1;
}

export function speedFast(): void {
  replayStore.fps = 60;
  replayStore.framesPerTick = 2;
}

export function speedSlow(): void {
  replayStore.fps = 30;
  replayStore.framesPerTick = 1;
}

export function zoomIn(): void {
  replayStore.zoom = replayStore.zoom * 1.01;
}

export function zoomOut(): void {
  replayStore.zoom = replayStore.zoom / 1.01;
}

export function toggleDebug(): void {
  replayStore.isDebug = !replayStore.isDebug;
}

export function togglePause(): void {
  replayStore.running = !replayStore.running;
}

export function pause(): void {
  replayStore.running = false;
}

export function jump(target: number): void {
  replayStore.frame = wrapFrame(replayStore, target);
}

// percent is [0,1]
export function jumpPercent(percent: number): void {
  replayStore.frame = Math.round(
    (replayStore.replayData?.frames.length ?? 0) * percent
  );
}

export function adjust(delta: number): void {
  replayStore.frame = wrapFrame(replayStore, replayStore.frame + delta);
}

let lastRender = performance.now();
function animate(time: number = performance.now()) {
  requestAnimationFrame(animate);
  const elapsed = time - lastRender;
  const frameInterval = 1000 / replayStore.fps;
  if (elapsed > frameInterval) {
    lastRender = time - (elapsed % frameInterval);
    if (replayStore.running) {
      replayStore.frame = wrapFrame(
        replayStore,
        replayStore.frame + replayStore.framesPerTick
      );
    }
  }
}
animate();

subscribeKey(selectionStore, "selectedFileAndSettings", async (sfas) => {
  const { selectedFileAndSettings } = snapshot(selectionStore);
  if (selectedFileAndSettings === undefined) {
    replayStore.highlights = map(() => [], queries);
    replayStore.frame = 0;
    replayStore.renderDatas = [];
    replayStore.animations = Array(4).fill(undefined);
    replayStore.fps = 60;
    replayStore.framesPerTick = 1;
    replayStore.running = false;
    replayStore.zoom = 1;
    replayStore.isDebug = false;
    return;
  }
  const replayData = parseReplay(
    await selectedFileAndSettings[0].arrayBuffer()
  );
  const highlights = map((query) => search(replayData, ...query), queries);
  replayStore.replayData = replayData;
  replayStore.highlights = highlights;
  replayStore.frame = fileStore.urlStartFrame ?? 0;
  replayStore.renderDatas = [];
  if (fileStore.urlStartFrame === undefined || fileStore.urlStartFrame === 0) {
    replayStore.running = true;
  }
});

// times(
//   (playerIndex) =>
//     createResource(
//       () => {
//         const replay = replayStore.replayData;
//         if (replay === undefined) {
//           return undefined;
//         }
//         const playerSettings = replay.settings.playerSettings[playerIndex];
//         if (playerSettings === undefined) {
//           return undefined;
//         }
//         const playerUpdate =
//           replay.frames[replayStore.frame].players[playerIndex];
//         if (playerUpdate === undefined) {
//           return playerSettings.externalCharacterId;
//         }
//         if (
//           playerUpdate.state.internalCharacterId ===
//           characterNameByInternalId.indexOf("Zelda")
//         ) {
//           return characterNameByExternalId.indexOf("Zelda");
//         }
//         if (
//           playerUpdate.state.internalCharacterId ===
//           characterNameByInternalId.indexOf("Sheik")
//         ) {
//           return characterNameByExternalId.indexOf("Sheik");
//         }
//         return playerSettings.externalCharacterId;
//       },
//       (id) => (id === undefined ? undefined : fetchAnimations(id))
//     ),
//   4
// ).forEach(([dataSignal], playerIndex) =>
//   createEffect(
//     () =>
//       // I can't use the obvious setReplayState("animations", playerIndex, dataSignal())
//       // because it will merge into the previous animations data object,
//       // essentially overwriting the previous characters animation data forever
//       (replayStore.animations = update(
//         playerIndex,
//         dataSignal(),
//         replayStore.animations
//       ))
//   )
// );

subscribeKey(replayStore, "frame", () => {
  if (replayStore.replayData === undefined) {
    return;
  }
  replayStore.renderDatas = replayStore.replayData.frames[
    replayStore.frame
  ].players
    .filter((playerUpdate) => playerUpdate)
    .flatMap((playerUpdate) => {
      const animations = replayStore.animations[playerUpdate.playerIndex];
      if (animations === undefined) return [];
      const renderDatas = [];
      renderDatas.push(
        computeRenderData(replayStore, playerUpdate, animations, false)
      );
      if (playerUpdate.nanaState != null) {
        renderDatas.push(
          computeRenderData(replayStore, playerUpdate, animations, true)
        );
      }
      return renderDatas;
    });
});

function computeRenderData(
  replayStore: ReplayStoreState,
  playerUpdate: PlayerUpdate,
  animations: CharacterAnimations,
  isNana: boolean
): RenderData {
  const playerState = (playerUpdate as PlayerUpdateWithNana)[
    isNana ? "nanaState" : "state"
  ];
  const playerInputs = (playerUpdate as PlayerUpdateWithNana)[
    isNana ? "nanaInputs" : "inputs"
  ];
  const playerSettings = replayStore
    .replayData!.settings.playerSettings.filter(Boolean)
    .find((settings) => settings.playerIndex === playerUpdate.playerIndex)!;

  const startOfActionPlayerState: PlayerState = (
    getPlayerOnFrame(
      playerUpdate.playerIndex,
      getStartOfAction(playerState, replayStore.replayData!),
      replayStore.replayData!
    ) as PlayerUpdateWithNana
  )[isNana ? "nanaState" : "state"];
  const actionName = actionNameById[playerState.actionStateId];
  const characterData = actionMapByInternalId[playerState.internalCharacterId];
  const animationName =
    characterData.animationMap.get(actionName) ??
    characterData.specialsMap.get(playerState.actionStateId) ??
    actionName;
  const animationFrames = animations[animationName];
  // TODO: validate L cancels, other fractional frames, and one-indexed
  // animations. I am currently just flooring. Converts - 1 to 0 and loops for
  // Entry, Guard, etc.
  const frameIndex = modulo(
    Math.floor(max(0, playerState.actionStateFrameCounter)),
    animationFrames?.length ?? 1
  );
  // To save animation file size, duplicate frames just reference earlier
  // matching frames such as "frame20".
  const animationPathOrFrameReference = animationFrames?.[frameIndex];
  const path =
    animationPathOrFrameReference !== undefined &&
    (animationPathOrFrameReference.startsWith("frame") ?? false)
      ? animationFrames?.[
          Number(animationPathOrFrameReference.slice("frame".length))
        ]
      : animationPathOrFrameReference;
  const rotation =
    animationName === "DamageFlyRoll"
      ? getDamageFlyRollRotation(replayStore, playerState)
      : isSpacieUpB(playerState)
      ? getSpacieUpBRotation(replayStore, playerState)
      : 0;
  // Some animations naturally turn the player around, but facingDirection
  // updates partway through the animation and incorrectly flips the
  // animation. The solution is to "fix" the facingDirection for the duration
  // of the action, as the animation expects. However upB turnarounds and
  // Jigglypuff/Kirby mid-air jumps are an exception where we need to flip
  // based on the updated state.facingDirection.
  const facingDirection = actionFollowsFacingDirection(animationName)
    ? playerState.facingDirection
    : startOfActionPlayerState.facingDirection;
  return {
    playerState,
    playerInputs,
    playerSettings,
    path,
    innerColor: getPlayerColor(
      replayStore,
      playerUpdate.playerIndex,
      playerState.isNana
    ),
    outerColor:
      startOfActionPlayerState.lCancelStatus === "missed"
        ? "red"
        : playerState.hurtboxCollisionState !== "vulnerable"
        ? "blue"
        : "black",
    transforms: [
      `translate(${playerState.xPosition} ${playerState.yPosition})`,
      // TODO: rotate around true character center instead of current guessed
      // center of position+(0,8)
      `rotate(${rotation} 0 8)`,
      `scale(${characterData.scale} ${characterData.scale})`,
      `scale(${facingDirection} 1)`,
      "scale(.1 -.1) translate(-500 -500)",
    ],
    animationName,
    characterData,
  };
}

// DamageFlyRoll default rotation is (0,1), but we calculate rotation from (1,0)
// so we need to subtract 90 degrees. Quick checks:
// 0 - 90 = -90 which turns (0,1) into (1,0)
// -90 - 90 = -180 which turns (0,1) into (-1,0)
// Facing direction is handled naturally because the rotation will go the
// opposite direction (that scale happens first) and the flip of (0,1) is still
// (0, 1)
function getDamageFlyRollRotation(
  replayStore: ReplayStoreState,
  playerState: PlayerState
): number {
  const previousState = (
    getPlayerOnFrame(
      playerState.playerIndex,
      playerState.frameNumber - 1,
      replayStore.replayData!
    ) as PlayerUpdateWithNana
  )[playerState.isNana ? "nanaState" : "state"];
  const deltaX = playerState.xPosition - previousState.xPosition;
  const deltaY = playerState.yPosition - previousState.yPosition;
  return (Math.atan2(deltaY, deltaX) * 180) / Math.PI - 90;
}

// Rotation will be whatever direction the player was holding at blastoff. The
// default rotation of the animation is (1,0), so we need to subtract 180 when
// facing left, and subtract 0 when facing right.
// Quick checks:
// 0 - 0 = 0, so (1,0) is unaltered when facing right
// 0 - 180 = -180, so (1,0) is flipped when facing left
function getSpacieUpBRotation(
  replayStore: ReplayStoreState,
  playerState: PlayerState
): number {
  const startOfActionPlayer = getPlayerOnFrame(
    playerState.playerIndex,
    getStartOfAction(playerState, replayStore.replayData!),
    replayStore.replayData!
  );
  const joystickDegrees =
    ((startOfActionPlayer.inputs.processed.joystickY === 0 &&
    startOfActionPlayer.inputs.processed.joystickX === 0
      ? Math.PI / 2
      : Math.atan2(
          startOfActionPlayer.inputs.processed.joystickY,
          startOfActionPlayer.inputs.processed.joystickX
        )) *
      180) /
    Math.PI;
  return (
    joystickDegrees -
    ((startOfActionPlayer as PlayerUpdateWithNana)[
      playerState.isNana ? "nanaState" : "state"
    ].facingDirection === -1
      ? 180
      : 0)
  );
}

// All jumps and upBs either 1) Need to follow the current frame's
// facingDirection, or 2) Won't have facingDirection change during the action.
// In either case we can grab the facingDirection from the current frame.
function actionFollowsFacingDirection(animationName: string): boolean {
  return (
    animationName.includes("Jump") ||
    ["SpecialHi", "SpecialAirHi"].includes(animationName)
  );
}

function isSpacieUpB(playerState: PlayerState): boolean {
  const character = characterNameByInternalId[playerState.internalCharacterId];
  return (
    ["Fox", "Falco"].includes(character) &&
    [355, 356].includes(playerState.actionStateId)
  );
}

function getPlayerColor(
  replayStore: ReplayStoreState,
  playerIndex: number,
  isNana: boolean
): string {
  if (replayStore.replayData!.settings.isTeams) {
    const settings =
      replayStore.replayData!.settings.playerSettings[playerIndex];
    return [
      [colors.red["800"], colors.red["600"]],
      [colors.green["800"], colors.green["600"]],
      [colors.blue["800"], colors.blue["600"]],
    ][settings.teamId][isNana ? 1 : settings.teamShade];
  }
  return [
    [colors.red["700"], colors.red["600"]],
    [colors.blue["700"], colors.blue["600"]],
    [colors.yellow["500"], colors.yellow["400"]],
    [colors.green["700"], colors.green["600"]],
  ][playerIndex][isNana ? 1 : 0];
}

function wrapFrame(replayStore: ReplayStoreState, frame: number): number {
  if (!replayStore.replayData) return frame;
  return (
    (frame + replayStore.replayData.frames.length) %
    replayStore.replayData.frames.length
  );
}

function wrapHighlight(
  replayStore: ReplayStoreState,
  highlight: number
): number {
  const length = Object.entries(replayStore.highlights).flatMap(
    ([name, highlights]) => highlights
  ).length;
  return (highlight + length) % length;
}
