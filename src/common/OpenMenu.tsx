import { loadFromSupabase } from "~/stateUtil";
import { filterFiles } from "~/common/util";
import { load } from "~/state/fileStore";
import { ChangeEvent, createRef } from "react";
import { useToast } from "~/common/toaster";
import { Menu } from "@headlessui/react";

export function OpenMenu({ name }: { name: string }) {
  const toaster = useToast();
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
      <Menu as="div" className="relative">
        <Menu.Button className="flex w-fit items-center gap-2 rounded-md border border-transparent bg-slippi-400 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slippi-500 focus:outline-none focus:ring-2 focus:ring-slippi-500 focus:ring-offset-2">
          <div className="hidden md:block">{name}</div>
          <div className="material-icons" aria-label="Open File or Folder">
            folder_open
          </div>
        </Menu.Button>
        <Menu.Items
          as={"ul"}
          className="absolute left-0 z-10 w-max border bg-white text-black"
        >
          <Menu.Item
            as={"li"}
            className="cursor-pointer py-2 px-4 hover:bg-slate-200"
            onClick={() => fileInput.current?.click()}
          >
            Open File(s)
          </Menu.Item>
          <Menu.Item
            as={"li"}
            className="cursor-pointer py-2 px-4 hover:bg-slate-200"
            onClick={() => folderInput.current?.click()}
          >
            Open Folder
          </Menu.Item>
          <Menu.Item
            as={"li"}
            className="cursor-pointer py-2 px-4 hover:bg-slate-200"
            onClick={() =>
              loadFromSupabase("sample", (files) =>
                load(files, undefined, toaster)
              )
            }
          >
            Load Demo
          </Menu.Item>
        </Menu.Items>
      </Menu>
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
        // @ts-expect-error folder input is not standard, but is supported by
        // all modern browsers
        webkitdirectory="true"
        ref={folderInput}
        onChange={onFileSelected}
      />
    </>
  );
}
