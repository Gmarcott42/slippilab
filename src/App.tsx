import { fetchAnimations } from "~/viewer/animationCache";
import { Landing } from "~/Landing";
import { filterFiles } from "~/common/util";
import { useToast } from "~/common/toaster";
import { TopBar } from "~/TopBar";
import { MainContent } from "~/MainContent";
import { downloadReplay } from "~/supabaseClient";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { useSnapshot } from "valtio";
import { fileStore, load } from "~/state/fileStore";
import "~/state/selectionStore";
import "~/state/replayStore";

// Get started fetching the most popular characters
void fetchAnimations(20); // Falco
void fetchAnimations(2); // Fox
void fetchAnimations(0); // Falcon
void fetchAnimations(9); // Marth

export function App() {
  const toaster = useToast();

  // Make the whole screen a dropzone
  const onDrop = useCallback(async (files: File[]) => {
    const filteredFiles = await filterFiles(files);
    return await load(filteredFiles, undefined, toaster);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  // load a file from query params if provided. Otherwise start playing the
  // sample match.
  const url = new URLSearchParams(location.search).get("replayUrl");
  const path = location.pathname.slice(1);
  const frameParse = Number(location.hash.split("#").at(-1));
  const startFrame = Number.isNaN(frameParse) ? 0 : frameParse;
  if (url !== null) {
    try {
      void fetch(url)
        .then(async (response) => await response.blob())
        .then((blob) => new File([blob], url.split("/").at(-1) ?? "url.slp"))
        .then(async (file) => await load([file], startFrame, toaster));
    } catch (e) {
      console.error("Error: could not load replay", url, e);
    }
  } else if (path !== "") {
    void downloadReplay(path).then(({ data, error }) => {
      if (data != null) {
        const file = new File([data], `${path}.slp`);
        return load([file], startFrame, toaster);
      }
      if (error != null) {
        console.error("Error: could not load replay", error);
      }
    });
  }

  const { files } = useSnapshot(fileStore);

  return (
    <>
      {files.length > 0 ? (
        <div
          className="flex flex-col md:h-screen md:w-screen"
          {...getRootProps()}
        >
          <TopBar />
          <MainContent />
        </div>
      ) : (
        <Landing />
      )}
      <input {...getInputProps()} />
    </>
  );
}

/**
 * TODO:
 * - toast, replace zagjs with something
 * - parser progress
 * - select, support custom nametags
 */
