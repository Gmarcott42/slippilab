import { Setter } from "solid-js";
import {
  Accessor,
  createContext,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";

const DialogRefContext =
  createContext<
    [
      Accessor<HTMLDialogElement | undefined>,
      Setter<HTMLDialogElement | undefined>
    ]
  >();

export function Dialog(props: { onOpen?: () => void; children?: any }) {
  let [dialogRef, setDialogRef] = createSignal<HTMLDialogElement | undefined>();

  return (
    <DialogRefContext.Provider value={[dialogRef, setDialogRef]}>
      {props.children}
    </DialogRefContext.Provider>
  );
}

export function DialogTrigger(props: { children?: any; onOpen?: () => void }) {
  const context = useContext(DialogRefContext);
  const dialogRef = createMemo(() => context?.[0]);
  return (
    <div
      onClick={() => {
        props.onOpen?.();
        dialogRef?.()?.()?.showModal();
      }}
    >
      {props.children}
    </div>
  );
}

export function DialogContents(props: { children?: any }) {
  const context = useContext(DialogRefContext);
  const dialogRef = createMemo(() => context?.[0]);
  const setDialogRef = createMemo(() => context?.[1]);
  return (
    <dialog
      ref={setDialogRef()}
      class="rounded-lg backdrop:bg-slate-800 backdrop:opacity-30 flex flex-col gap-4"
      onClick={(e) => e.target === dialogRef()?.() && dialogRef()?.()?.close()}
    >
      {props.children}
    </dialog>
  );
}

export function DialogClose(props: { children?: any }) {
  const context = useContext(DialogRefContext);
  const dialogRef = createMemo(() => context?.[0]);
  return <div onClick={() => dialogRef?.()?.()?.close()}>{props.children}</div>;
}
