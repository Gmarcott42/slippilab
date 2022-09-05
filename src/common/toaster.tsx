import { useActor, useMachine, normalizeProps } from "@zag-js/react";
import * as toast from "@zag-js/toast";
import { createContext, ReactNode, useContext } from "react";
import { WhiteButton } from "~/common/Button";
import { newId } from "~/common/util";

function Toast({ actor }: { actor: toast.Service }) {
  const [state, send] = useActor(actor);
  const api = toast.connect(state, send, normalizeProps);

  return (
    <div
      {...api.rootProps}
      className="flex items-center gap-5 rounded border bg-slate-50 p-3"
    >
      <div className="flex flex-col gap-3">
        <div {...api.titleProps}>{api.title}</div>
        {api?.render()}
      </div>
      <WhiteButton
        className="material-icons cursor-pointer px-1 py-0"
        onClick={api.dismiss}
      >
        close
      </WhiteButton>
    </div>
  );
}

const ToastContext = createContext<
  ReturnType<typeof toast.group.connect> | undefined
>(undefined);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children?: ReactNode }) {
  const [state, send] = useMachine(
    toast.group.machine({ id: newId("toast-") })
  );
  const api = toast.group.connect(state, send, normalizeProps);
  return (
    // @ts-ignore: zag doesn't have their types together yet I think
    <ToastContext.Provider value={api}>
      {children}
      {Object.entries(api.toastsByPlacement).map(([placement, toasts]) => (
        <div
          key={placement}
          {...api.getGroupProps({ placement: placement as toast.Placement })}
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} actor={toast} />
          ))}
        </div>
      ))}
    </ToastContext.Provider>
  );
}
