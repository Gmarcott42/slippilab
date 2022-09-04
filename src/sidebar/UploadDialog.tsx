import { PrimaryButton, SecondaryButton } from "~/common/Button";
import { SpinnerCircle } from "~/common/SpinnerCircle";
import {
  Dialog,
  DialogClose,
  DialogContents,
  DialogTrigger,
} from "~/common/Dialog";
import { uploadReplay } from "~/supabaseClient";
import { selectionStore } from "~/state/selectionStore";
import { useState } from "react";
import { useSnapshot } from "valtio";

export function UploadDialog() {
  const { selectedFileAndSettings } = useSnapshot(selectionStore);
  const [state, setState] = useState<"not started" | "loading" | "done">(
    "not started"
  );
  const [url, setUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isUrlCopied, setIsUrlCopied] = useState(false);

  async function onUploadClicked() {
    setState("loading");
    const [file] = selectedFileAndSettings!;
    const { id, data, error } = await uploadReplay(file);
    if (data != null) {
      setUrl(`${window.location.origin}/${id}`);
    } else {
      setError("Error uploading file");
      console.error(error);
    }
    setState("done");
  }

  function onOpen() {
    setState("not started");
    setIsUrlCopied(false);
    setUrl(undefined);
    setError(undefined);
  }

  return (
    <Dialog>
      <DialogTrigger onOpen={onOpen}>
        <PrimaryButton className="text-md flex items-center gap-2">
          <div className="hidden md:block">Upload</div>
          <div className="material-icons">upload_file</div>
        </PrimaryButton>
      </DialogTrigger>
      <DialogContents>
        <h1 className="text-lg">Replay Upload</h1>
        <div>
          <div className="flex w-96 items-center justify-center gap-2">
            {state === "not started" && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm">
                  Upload {selectedFileAndSettings?.[0].name} to share?
                </p>
                <PrimaryButton onClick={onUploadClicked}>Upload</PrimaryButton>
              </div>
            )}
            {state === "loading" && (
              <div className="h-10 w-10">
                <SpinnerCircle />
              </div>
            )}
            {state === "done" &&
              (url ? (
                <>
                  <code className="text-sm">{url}</code>
                  <div
                    className="material-icons cursor-pointer rounded bg-slate-100 px-1 py-0 text-lg"
                    onClick={() => {
                      const link = url;
                      if (link === undefined) return;
                      void navigator.clipboard.writeText(link);
                      setIsUrlCopied(true);
                    }}
                  >
                    content_copy
                  </div>
                </>
              ) : (
                error
              ))}
          </div>
          {isUrlCopied && <div className="text-center">Copied!</div>}
        </div>
        <div className="flex justify-end">
          <DialogClose>
            <SecondaryButton>Close</SecondaryButton>
          </DialogClose>
        </div>
      </DialogContents>
    </Dialog>
  );
}
