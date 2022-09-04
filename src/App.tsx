import { fetchAnimations } from "~/viewer/animationCache";
import { createDropzone } from "@solid-primitives/upload";
import { Landing } from "~/Landing";
import { filterFiles } from "~/common/util";
import { ToastProvider } from "~/common/toaster";
import "@thisbeyond/solid-select/style.css";
import { fileStore, load } from "~/state/fileStore";
import { TopBar } from "~/TopBar";
import { MainContent } from "~/MainContent";
import { downloadReplay } from "~/supabaseClient";

export function App() {
  // Get started fetching the most popular characters
  void fetchAnimations(20); // Falco
  void fetchAnimations(2); // Fox
  void fetchAnimations(0); // Falcon
  void fetchAnimations(9); // Marth

  // Make the whole screen a dropzone
  const { setRef: dropzoneRef } = createDropzone({
    onDrop: async (uploads) => {
      const files = uploads.map((upload) => upload.file);
      const filteredFiles = await filterFiles(files);
      return await load(filteredFiles);
    },
  });

  // load a file from query params if provided. Otherwise start playing the sample
  // match.
  const url = new URLSearchParams(location.search).get("replayUrl");
  const path = location.pathname.slice(1);
  const frameParse = Number(location.hash.split("#").at(-1));
  const startFrame = Number.isNaN(frameParse) ? 0 : frameParse;
  if (url !== null) {
    try {
      void fetch(url)
        .then(async (response) => await response.blob())
        .then((blob) => new File([blob], url.split("/").at(-1) ?? "url.slp"))
        .then(async (file) => await load([file], startFrame));
    } catch (e) {
      console.error("Error: could not load replay", url, e);
    }
  } else if (path !== "") {
    void downloadReplay(path).then(({ data, error }) => {
      if (data != null) {
        const file = new File([data], `${path}.slp`);
        return load([file], startFrame);
      }
      if (error != null) {
        console.error("Error: could not load replay", error);
      }
    });
  }

  return (
    <ToastProvider>
      {fileStore.files.length > 0 ? (
        <div
          className="flex flex-col md:h-screen md:w-screen"
          ref={dropzoneRef}
        >
          <TopBar />
          <MainContent />
        </div>
      ) : (
        <Landing />
      )}
    </ToastProvider>
  );
}

/**
 * TODO:
 * - requestAnimationFrame, replace solid-primitive
 * - file dropzone, replace solid-primitive
 * - accordion, replace zagjs with headless-ui
 * - toast, replace zagjs with headless-ui
 * - select, replace solid-select with react-select
 * - virtualized list, replace solid-virtual with react-virtual
 * - remove solidjs reactivity, repalce createEffect with vialto subscriptions
 * - rewrite components depending on solidjs reactivity semantics
 */
