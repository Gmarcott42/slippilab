import { createContext, ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";

const DialogRefContext = createContext<
  [
    HTMLDialogElement | undefined,
    ((dialog: HTMLDialogElement) => void) | undefined
  ]
>([undefined, undefined]);

export function Dialog({ children }: { children?: ReactNode }) {
  let [dialogRef, setDialogRef] = useState<HTMLDialogElement | undefined>();

  return (
    <DialogRefContext.Provider value={[dialogRef, setDialogRef]}>
      {children}
    </DialogRefContext.Provider>
  );
}

export function DialogTrigger({
  children,
  onOpen,
  className,
}: {
  children?: ReactNode;
  onOpen?: () => void;
  className?: string;
}) {
  const context = useContext(DialogRefContext);
  const dialogRef = context[0];
  return (
    <div
      className={className ?? ""}
      onClick={() => {
        onOpen?.();
        dialogRef?.showModal();
      }}
    >
      {children}
    </div>
  );
}

export function DialogContents({ children }: { children?: ReactNode }) {
  const context = useContext(DialogRefContext);
  const dialogRef = context[0];
  const setDialogRef = context[1];
  return createPortal(
    <dialog
      ref={setDialogRef}
      className="flex flex-col gap-4 rounded-lg backdrop:bg-gray-500 backdrop:opacity-75 [&:not([open])>*]:hidden"
      onClick={(e) => {
        const rect = (e.target as HTMLDialogElement).getBoundingClientRect();
        const clickedInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;
        if (clickedInDialog === false) {
          e.target === dialogRef && dialogRef.close();
        }
      }}
    >
      {children}
    </dialog>,
    document.body
  );
}

export function DialogClose({ children }: { children?: ReactNode }) {
  const context = useContext(DialogRefContext);
  const dialogRef = context[0];
  return <div onClick={() => dialogRef?.close()}>{children}</div>;
}
