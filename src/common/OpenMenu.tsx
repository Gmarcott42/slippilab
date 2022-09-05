import * as menu from "@zag-js/menu";
import { normalizeProps, useMachine } from "@zag-js/react";
import { loadFromSupabase } from "~/stateUtil";
import { PrimaryButton } from "~/common/Button";
import { filterFiles, newId } from "~/common/util";
import { load } from "~/state/fileStore";
import { ChangeEvent, createRef } from "react";
import { useToast } from "~/common/toaster";

export function OpenMenu({ name }: { name: string }) {
  const toaster = useToast();
  const [menuState, menuSend] = useMachine(
    menu.machine({ id: newId("menu-"), "aria-label": "Open Replays" })
  );
  const menuApi = menu.connect(menuState, menuSend, normalizeProps);

  let fileInput = createRef<HTMLInputElement>();
  let folderInput = createRef<HTMLInputElement>();

  async function onFileSelected(
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    if (e.target.files === null || e.target.files.length === 0) {
      return;
    }
    const files = Array.from(e.target.files);
    const filteredFiles = await filterFiles(files);
    return await load(filteredFiles, undefined, toaster);
  }

  return (
    <>
      <div>
        <PrimaryButton
          {...menuApi.triggerProps}
          className="flex items-center gap-2"
        >
          <div className="hidden md:block">{name}</div>
          <div className="material-icons" aria-label="Open File or Folder">
            folder_open
          </div>
        </PrimaryButton>
        <div {...menuApi.positionerProps} className="z-10 bg-white opacity-100">
          <ul
            {...menuApi.contentProps}
            className="flex flex-col border border-slate-300"
            onClick={(e) => {
              switch ((e.target as HTMLUListElement).id) {
                case "file":
                  fileInput.current?.click();
                  break;
                case "folder":
                  folderInput.current?.click();
                  break;
                case "demo":
                  loadFromSupabase("sample", (files) =>
                    load(files, undefined, toaster)
                  );
                  break;
              }
            }}
          >
            <li
              {...menuApi.getItemProps({ id: "file" })}
              className="w-full cursor-pointer py-2 px-4 hover:bg-slate-200"
            >
              Open File(s)
            </li>
            <li
              {...menuApi.getItemProps({ id: "folder" })}
              className="w-full cursor-pointer py-2 px-4 hover:bg-slate-200"
            >
              Open Folder
            </li>
            <li
              {...menuApi.getItemProps({ id: "demo" })}
              className="w-full cursor-pointer py-2 px-4 hover:bg-slate-200"
            >
              Load Demo
            </li>
          </ul>
        </div>
      </div>
      <input
        className="hidden"
        type="file"
        accept=".slp,.zip"
        multiple
        ref={fileInput}
        onChange={onFileSelected}
      />
      <input
        className="hidden"
        type="file"
        // @ts-expect-error folder input is not standard, but is supported by all
        // modern browsers
        webkitdirectory="true"
        ref={folderInput}
        onChange={onFileSelected}
      />
    </>
  );
}
