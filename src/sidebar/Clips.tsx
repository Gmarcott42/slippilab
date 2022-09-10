import { PlayerBadge } from "~/common/Badge";
import { Highlight } from "~/search/search";
import { replayStore, selectHighlight } from "~/state/replayStore";
import { classMap, classNames } from "~/common/util";
import { Disclosure } from "@headlessui/react";
import { useSnapshot } from "valtio";

export function Clips() {
  const { highlights } = useSnapshot(replayStore);

  return (
    <div>
      {Object.entries(highlights).map(([type, entries], index) => (
        <Disclosure key={index}>
          {({ open }) => (
            <>
              <Disclosure.Button
                className={classNames(
                  "flex w-full justify-between gap-3 rounded border border-slate-400 p-2",
                  classMap({
                    "cursor-default text-slate-400": entries.length === 0,
                  })
                )}
              >
                {type}
                {entries.length > 0 && (
                  <div className="material-icons">
                    {open ? "expand_less" : "expand_more"}
                  </div>
                )}
              </Disclosure.Button>
              <Disclosure.Panel>
                <ol>
                  {entries.map((entry, index) => (
                    <HighlightRow
                      key={index}
                      nameAndHighlight={[type, entry]}
                    />
                  ))}
                </ol>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}

function HighlightRow({
  nameAndHighlight,
}: {
  nameAndHighlight: [string, Highlight];
}) {
  const [name, highlight] = nameAndHighlight;
  const [selectedName, selectedHighlight] = useSnapshot(replayStore)
    .selectedHighlight ?? [undefined, undefined];
  const selected =
    selectedName === name &&
    selectedHighlight?.startFrame === highlight.startFrame &&
    selectedHighlight?.endFrame === highlight.endFrame;
  return (
    <>
      <div
        className={classNames(
          "flex w-full cursor-pointer items-center whitespace-nowrap border p-1 hover:bg-slippi-50",
          classMap({ "bg-slippi-100 hover:bg-slippi-200": selected })
        )}
        onClick={() => selectHighlight(nameAndHighlight)}
      >
        <div className="flex items-center gap-1">
          <PlayerBadge port={highlight.playerIndex + 1} />
        </div>
        <div className="flex flex-grow items-center justify-center">
          {`${highlight.startFrame}-${highlight.endFrame}`}
        </div>
      </div>
    </>
  );
}
