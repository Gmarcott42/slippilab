import { createRef, useEffect } from "react";
import { useSnapshot } from "valtio";
import {
  replayStore,
  adjust,
  jump,
  jumpPercent,
  nextHighlight,
  pause,
  previousHighlight,
  speedFast,
  speedNormal,
  speedSlow,
  toggleDebug,
  togglePause,
  zoomIn,
  zoomOut,
} from "~/state/replayStore";
import { nextFile, previousFile } from "~/state/selectionStore";

export function Controls() {
  const { frame, running, isDebug, replayData } = useSnapshot(replayStore);
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  function onKeyDown({ key }: KeyboardEvent): void {
    switch (key) {
      case "k":
      case " ":
        togglePause();
        break;
      case "ArrowRight":
      case "l":
        adjust(120);
        break;
      case "ArrowLeft":
      case "j":
        adjust(-120);
        break;
      case ".":
        pause();
        adjust(1);
        break;
      case ",":
        pause();
        adjust(-1);
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        jumpPercent(Number(key) * 0.1); // convert 3 => 30%
        break;
      case "ArrowUp":
        speedSlow();
        break;
      case "ArrowDown":
        speedFast();
        break;
      case "-":
      case "_":
        zoomOut();
        break;
      case "=":
      case "+":
        zoomIn();
        break;
      case "]":
      case "}":
        void nextFile();
        break;
      case "[":
      case "{":
        void previousFile();
        break;
      case "'":
      case '"':
        nextHighlight();
        break;
      case ";":
      case ":":
        previousHighlight();
        break;
      case "d":
        toggleDebug();
        break;
    }
  }

  function onKeyUp({ key }: KeyboardEvent): void {
    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
        speedNormal();
        break;
    }
  }

  let seekbarInput = createRef<HTMLInputElement>();

  return (
    <div className="flex flex-wrap items-center justify-evenly gap-4 rounded-lg border pl-2 pr-4 text-slate-800">
      <div className="flex">
        <div
          className="material-icons cursor-pointer text-7xl md:text-5xl"
          onClick={() => previousFile()}
          aria-label="previous file"
        >
          skip_previous
        </div>
        {running ? (
          <div
            className="material-icons cursor-pointer text-7xl md:text-5xl"
            onClick={() => togglePause()}
            aria-label="pause playback"
          >
            pause
          </div>
        ) : (
          <div
            className="material-icons cursor-pointer text-7xl md:text-5xl"
            onClick={() => togglePause()}
            aria-label="Resume playback"
          >
            play_arrow
          </div>
        )}
        <div
          className="material-icons cursor-pointer text-7xl md:text-5xl"
          onClick={() => nextFile()}
          aria-label="next file"
        >
          skip_next
        </div>
      </div>
      <label htmlFor="seekbar" className="text-sm">
        {isDebug ? frame - 123 : frame}
      </label>
      <input
        id="seekbar"
        className="flex-grow accent-slippi-500"
        type="range"
        ref={seekbarInput}
        value={frame}
        max={replayData!.frames.length - 1}
        onInput={() =>
          seekbarInput.current && jump(seekbarInput.current.valueAsNumber)
        }
      />
      <div className="flex items-center gap-2">
        <div
          className="material-icons cursor-pointer text-7xl md:text-4xl"
          onClick={() => adjust(-120)}
          aria-label="Rewind 2 seconds"
        >
          history
        </div>
        <div
          className="material-icons cursor-pointer text-7xl md:text-4xl"
          onClick={() => {
            pause();
            adjust(-1);
          }}
          aria-label="Rewind 1 frame"
        >
          rotate_left
        </div>
        <div
          className="material-icons cursor-pointer text-7xl md:text-4xl"
          onClick={() => {
            pause();
            adjust(1);
          }}
          aria-label="Skip ahead 1 frame"
        >
          rotate_right
        </div>
        <div
          className="material-icons cursor-pointer text-7xl md:text-4xl"
          onClick={() => adjust(120)}
          aria-label="Skip ahead 2 seconds"
        >
          update
        </div>
      </div>
    </div>
  );
}
