import { ReactNode } from "react";
import { classMap, classNames } from "~/common/util";
import { createVirtualizer } from "~/common/virtual";

export function Picker<T>(props: {
  items: T[];
  render: (item: T, index: number) => ReactNode | undefined;
  onClick: (item: T, index: number) => unknown;
  selected: (item: T, index: number) => boolean;
  estimateSize: (item: T, index: number) => number;
}) {
  let scrollParentRef: HTMLDivElement | undefined;

  const virtualizer = createVirtualizer({
    get count() {
      return props.items.length;
    },
    getScrollElement: () => scrollParentRef,
    estimateSize: (i) => props.estimateSize(props.items[i], i),
    overscan: 5,
  });

  return (
    <>
      <div ref={scrollParentRef} className="w-full overflow-auto">
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((item, index) => (
            <div
              key={index}
              role="button"
              className={classNames(
                "absolute top-0 left-0 w-full overflow-hidden whitespace-nowrap border p-1 hover:bg-slate-100",
                classMap({
                  "bg-slate-200 hover:bg-slate-300": props.selected(
                    props.items[item.index],
                    item.index
                  ),
                })
              )}
              style={{ transform: `translateY(${item.start}px)` }}
              onClick={() => props.onClick(props.items[item.index], item.index)}
            >
              {props.render(props.items[item.index], item.index)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
