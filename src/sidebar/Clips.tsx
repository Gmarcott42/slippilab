import { PlayerBadge } from "~/common/Badge";
import { Picker } from "~/common/Picker";
import { Highlight } from "~/search/search";
import { replayStore, selectHighlight } from "~/state/replayStore";
import * as accordion from "@zag-js/accordion";
import { normalizeProps, useMachine } from "@zag-js/react";
import { classMap, classNames, newId } from "~/common/util";

export function Clips() {
  const data = Object.keys(replayStore.highlights).map((name) => ({
    title: name,
    content: (
      <Picker
        items={replayStore.highlights[name].map(
          (highlight) => [name, highlight] as [string, Highlight]
        )}
        render={ClipRow}
        onClick={(nameAndHighlight) => selectHighlight(nameAndHighlight)}
        selected={([name, highlight]) =>
          replayStore.selectedHighlight?.[0] === name &&
          replayStore.selectedHighlight?.[1].startFrame ===
            highlight.startFrame &&
          replayStore.selectedHighlight?.[1].endFrame === highlight.endFrame &&
          replayStore.selectedHighlight?.[1].playerIndex ===
            highlight.playerIndex
        }
        estimateSize={() => 32}
      ></Picker>
    ),
  }));
  const [state, send] = useMachine(
    accordion.machine({
      id: newId("accordion-"),
      multiple: true,
      collapsible: true,
    })
  );
  const api = accordion.connect(state, send, normalizeProps);

  return (
    <div {...api.rootProps}>
      {data.map((item, index) => (
        <div key={index} {...api.getItemProps({ value: item.title })}>
          <h3>
            <button
              className={classNames(
                "flex w-full justify-between gap-3 rounded border border-slate-400 p-2",
                classMap({
                  "text-slate-400":
                    replayStore.highlights[item.title].length === 0,
                })
              )}
              {...api.getTriggerProps({
                value: item.title,
                disabled: replayStore.highlights[item.title].length === 0,
              })}
            >
              {item.title}
              {replayStore.highlights[item.title].length > 0 && (
                <div className="material-icons">
                  {api.getItemState({ value: item.title }).isOpen
                    ? "expand_less"
                    : "expand_more"}
                </div>
              )}
            </button>
          </h3>
          <div className="mb-5" {...api.getContentProps({ value: item.title })}>
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClipRow(props: [string, Highlight]) {
  return (
    <>
      <div className="flex w-full items-center">
        <div className="flex items-center gap-1">
          <PlayerBadge port={props[1].playerIndex + 1} />
        </div>
        <div className="flex flex-grow items-center justify-center">
          {`${props[1].startFrame}-${props[1].endFrame}`}
        </div>
      </div>
    </>
  );
}
