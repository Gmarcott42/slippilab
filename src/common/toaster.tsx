import { PropTypes, useActor, useMachine } from "@zag-js/solid";
import * as toast from "@zag-js/toast";
import { createPortal } from "react-dom";
import { WhiteButton } from "~/common/Button";

function Toast(props: { actor: any }) {
  const [state, send] = useActor(props.actor);
  // @ts-ignore
  const api = toast.connect<PropTypes>(state, send);

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

const [state, send] = useMachine(toast.group.machine);
const api = toast.group.connect(state, send);

export function ToastGroup() {
  return createPortal(
    <>
      {Object.entries(api.toastsByPlacement).map(
        ([placement, toasts], index) => (
          // @ts-ignore
          <div key={index} {...api.getGroupProps({ placement })}>
            {toasts.map((toast, index) => (
              <Toast key={index} actor={toast} />
            ))}
          </div>
        )
      )}
    </>,
    document.body
  );
}

export const createToast = api.create;
export const dismissToast = api.dismiss;
