import { proxy, ref } from "valtio";
import { ProgressCircle } from "~/common/ProgressCircle";
import { useToast } from "~/common/toaster";
import { GameSettings } from "~/common/types";
import { send } from "~/workerClient";

export interface FileStoreState {
  files: File[];
  gameSettings: GameSettings[];
  parseProgress: number;
  urlStartFrame?: number;
}

export const fileStore: FileStoreState = proxy({
  files: [],
  gameSettings: [],
  parseProgress: 0,
});

export async function load(
  files: File[],
  startFrame?: number,
  toaster?: ReturnType<typeof useToast>
): Promise<void> {
  fileStore.parseProgress = 0;
  fileStore.urlStartFrame = startFrame;
  const progressToast = toaster?.create({
    title: "Parsing files",
    duration: 999999,
    render: () => (
      <div className="flex items-center gap-3">
        <ProgressCircle
          percent={(fileStore.parseProgress * 100) / files.length}
        />
        {fileStore.parseProgress}/{files.length}
      </div>
    ),
    placement: "top-end",
  });

  console.log(progressToast);
  const {
    goodFilesAndSettings,
    skipCount,
    failedFilenames,
  }: {
    goodFilesAndSettings: Array<[File, GameSettings]>;
    failedFilenames: string[];
    skipCount: number;
  } = await send(files, () => fileStore.parseProgress++);

  // Save results to the store and show results toasts
  fileStore.gameSettings = goodFilesAndSettings.map(([, settings]) => settings);
  // use 'ref' to tell valtio not to proxy the File object. It breaks everything
  fileStore.files = goodFilesAndSettings.map(([file]) => ref(file));

  toaster?.dismiss(progressToast);
  if (failedFilenames.length > 0) {
    toaster?.create({
      title: `Failed to parse ${failedFilenames.length} file(s)`,
      duration: 2000,
      render: () => (
        <div className="flex flex-col">
          {failedFilenames.map((failedFilename, index) => (
            <div key={index}>{failedFilename}</div>
          ))}
        </div>
      ),
      placement: "top-end",
    });
  }
  if (skipCount > 0) {
    toaster?.create({
      title: `Skipped ${skipCount} file(s) with CPUs or illegal stages`,
      duration: 2000,
      placement: "top-end",
    });
  }
}
