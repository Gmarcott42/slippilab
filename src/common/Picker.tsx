import { ReactNode, useRef } from "react";
import { classMap, classNames } from "~/common/util";
import { useVirtualizer } from "@tanstack/react-virtual";

export function Picker<T>({
  items,
  render,
  onClick,
  selected,
  estimateSize,
}: {
  items: T[];
  render: (item: T, index: number) => ReactNode | undefined;
  onClick: (item: T, index: number) => unknown;
  selected: (item: T, index: number) => boolean;
  estimateSize: (item: T, index: number) => number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    get count() {
      return items.length;
    },
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => estimateSize(items[i], i),
    overscan: 5,
  });

  return (
    <>
      <div ref={parentRef} className="w-full overflow-auto">
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((item) => (
            <div
              key={item.index}
              role="button"
              className={classNames(
                "absolute top-0 left-0 w-full overflow-hidden whitespace-nowrap border p-1 hover:bg-slate-100",
                classMap({
                  "bg-slate-200 hover:bg-slate-300": selected(
                    items[item.index],
                    item.index
                  ),
                })
              )}
              style={{ transform: `translateY(${item.start}px)` }}
              onClick={() => onClick(items[item.index], item.index)}
            >
              {render(items[item.index], item.index)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
