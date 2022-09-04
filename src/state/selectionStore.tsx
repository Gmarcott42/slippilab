import { proxy, useSnapshot } from "valtio";
import { GameSettings } from "~/common/types";
import {
  characterNameByExternalId,
  ExternalCharacterName,
  ExternalStageName,
  stageNameByExternalId,
} from "~/common/ids";
import { createEffect, on } from "solid-js";
import { groupBy, map, zip } from "rambda";
import { fileStore } from "~/state/fileStore";

export type Filter =
  | { type: "character"; label: ExternalCharacterName }
  | { type: "stage"; label: ExternalStageName }
  | { type: "codeOrName"; label: string };

export interface SelectionStoreState {
  filters: Filter[];
  filteredFilesAndSettings: [File, GameSettings][];
  selectedFileAndSettings?: [File, GameSettings];
}

export const selectionStore: SelectionStoreState = proxy({
  filters: [],
  filteredFilesAndSettings: [],
});

export function setFilters(filters: Filter[]) {
  selectionStore.filters = filters;
}

export function select(fileAndSettings: [File, GameSettings]) {
  selectionStore.selectedFileAndSettings = fileAndSettings;
}

export function nextFile() {
  const snap = useSnapshot(selectionStore);
  if (snap.filteredFilesAndSettings.length === 0) {
    return;
  }
  if (snap.selectedFileAndSettings === undefined) {
    selectionStore.selectedFileAndSettings =
      selectionStore.filteredFilesAndSettings[0];
  } else {
    const currentIndex = snap.filteredFilesAndSettings.findIndex(
      ([file]) => file === snap.selectedFileAndSettings![0]
    );
    const nextIndex = wrap(
      currentIndex + 1,
      snap.filteredFilesAndSettings.length
    );
    selectionStore.selectedFileAndSettings =
      selectionStore.filteredFilesAndSettings[nextIndex];
  }
}

export function previousFile() {
  const snap = useSnapshot(selectionStore);
  if (snap.filteredFilesAndSettings.length === 0) {
    return;
  }
  if (snap.selectedFileAndSettings === undefined) {
    selectionStore.selectedFileAndSettings =
      selectionStore.filteredFilesAndSettings[0];
  } else {
    const currentIndex = snap.filteredFilesAndSettings.findIndex(
      ([file]) => file === snap.selectedFileAndSettings![0]
    );
    const nextIndex = wrap(
      currentIndex - 1,
      snap.filteredFilesAndSettings.length
    );
    selectionStore.selectedFileAndSettings =
      selectionStore.filteredFilesAndSettings[nextIndex];
  }
}

createEffect(
  on(
    () => fileStore.files,
    () => (selectionStore.selectedFileAndSettings = undefined)
  )
);

// Update filter results if files, gameSettings, or filters change
createEffect(() => {
  const filesWithSettings = zip(fileStore.files, fileStore.gameSettings) as [
    File,
    GameSettings
  ][];
  selectionStore.filteredFilesAndSettings = applyFilters(
    filesWithSettings,
    selectionStore.filters
  );
});

// ???
createEffect(() => {
  if (
    selectionStore.filteredFilesAndSettings.length > 0 &&
    selectionStore.selectedFileAndSettings === undefined
  ) {
    selectionStore.selectedFileAndSettings =
      selectionStore.filteredFilesAndSettings[0];
  }
});

function applyFilters(
  filesWithSettings: [File, GameSettings][],
  filters: Filter[]
): [File, GameSettings][] {
  const charactersNeeded = map(
    (filters: Filter[]) => filters.length,
    groupBy(
      (filter) => filter.label,
      filters.filter((filter) => filter.type === "character")
    )
  );
  const stagesAllowed = filters
    .filter((filter) => filter.type === "stage")
    .map((filter) => filter.label);
  const namesNeeded = filters
    .filter((filter) => filter.type === "codeOrName")
    .map((filter) => filter.label);
  return filesWithSettings.filter(([file, gameSettings]) => {
    const areCharactersSatisfied = Object.entries(charactersNeeded).every(
      ([character, amountRequired]) =>
        gameSettings.playerSettings.filter(
          (p) => character === characterNameByExternalId[p.externalCharacterId]
        ).length === amountRequired
    );
    const stagePass =
      stagesAllowed.length === 0 ||
      stagesAllowed.includes(stageNameByExternalId[gameSettings.stageId]);
    const areNamesSatisfied = namesNeeded.every((name) =>
      gameSettings.playerSettings.some((p) =>
        [
          p.connectCode?.toLowerCase(),
          p.displayName?.toLowerCase(),
          p.nametag?.toLowerCase(),
        ].includes(name.toLowerCase())
      )
    );
    return stagePass && areCharactersSatisfied && areNamesSatisfied;
  });
}

function wrap(index: number, limit: number): number {
  if (limit === 0) {
    return 0;
  }
  return (index + limit) % limit;
}
