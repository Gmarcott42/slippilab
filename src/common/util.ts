import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";

export async function filterFiles(files: File[]): Promise<File[]> {
  const slpFiles = files.filter((file) => file.name.endsWith(".slp"));
  const zipFiles = files.filter((file) => file.name.endsWith(".zip"));
  const blobsFromZips = (await Promise.all(zipFiles.map(unzip)))
    .flat()
    .filter((file) => file.name.endsWith(".slp"));
  return [...slpFiles, ...blobsFromZips];
}

export async function unzip(zipFile: File): Promise<File[]> {
  const entries = await new ZipReader(new BlobReader(zipFile)).getEntries();
  return await Promise.all(
    entries
      // filter out some Apple-related hidden files I sometimes saw.
      .filter(
        (entry) => !(entry.filename.split("/").at(-1)?.startsWith(".") ?? true)
      )
      .map(
        async (entry) =>
          await (entry.getData?.(new BlobWriter()) as Promise<Blob>).then(
            (blob) => new File([blob], entry.filename)
          )
      )
  );
}

export function classNames(...classes: string[]): string {
  return classes.join(" ");
}

export function classMap(obj: Record<string, boolean>): string {
  return Object.entries(obj)
    .filter(([c, v]) => v)
    .map(([c]) => c)
    .join(" ");
}
