import { proxy, snapshot } from "valtio";
import { subscribeKey } from "valtio/utils";
import { GameSettings } from "~/common/types";
import {
  characterNameByExternalId,
  ExternalCharacterName,
  ExternalStageName,
  stageNameByExternalId,
} from "~/common/ids";
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
  if (selectionStore.filteredFilesAndSettings.length === 0) {
    return;
  }
  if (selectionStore.selectedFileAndSettings === undefined) {
    selectionStore.selectedFileAndSettings =
      selectionStore.filteredFilesAndSettings[0];
  } else {
    const currentIndex = selectionStore.filteredFilesAndSettings.findIndex(
      ([file]) => file === selectionStore.selectedFileAndSettings![0]
    );
    const nextIndex = wrap(
      currentIndex + 1,
      selectionStore.filteredFilesAndSettings.length
    );
    selectionStore.selectedFileAndSettings =
      selectionStore.filteredFilesAndSettings[nextIndex];
  }
}

export function previousFile() {
  if (selectionStore.filteredFilesAndSettings.length === 0) {
    return;
  }
  if (selectionStore.selectedFileAndSettings === undefined) {
    selectionStore.selectedFileAndSettings =
      selectionStore.filteredFilesAndSettings[0];
  } else {
    const currentIndex = selectionStore.filteredFilesAndSettings.findIndex(
      ([file]) => file === selectionStore.selectedFileAndSettings![0]
    );
    const nextIndex = wrap(
      currentIndex - 1,
      selectionStore.filteredFilesAndSettings.length
    );
    selectionStore.selectedFileAndSettings =
      selectionStore.filteredFilesAndSettings[nextIndex];
  }
}

subscribeKey(fileStore, "files", (f) => {
  selectionStore.selectedFileAndSettings = undefined;
});

// Update filter results if files, gameSettings, or filters change
subscribeKey(fileStore, "files", (f) => {
  const { files, gameSettings } = snapshot(fileStore);
  const { filters } = snapshot(selectionStore);
  const filesWithSettings = zip(
    files as File[],
    gameSettings as GameSettings[]
  ) as [File, GameSettings][];
  selectionStore.filteredFilesAndSettings = applyFilters(
    filesWithSettings,
    filters as Filter[]
  );
});
subscribeKey(fileStore, "gameSettings", (g) => {
  const { files, gameSettings } = snapshot(fileStore);
  const { filters } = snapshot(selectionStore);
  const filesWithSettings = zip(
    files as File[],
    gameSettings as GameSettings[]
  ) as [File, GameSettings][];
  selectionStore.filteredFilesAndSettings = applyFilters(
    filesWithSettings,
    filters as Filter[]
  );
});
subscribeKey(selectionStore, "filters", (f) => {
  const { files, gameSettings } = snapshot(fileStore);
  const { filters } = snapshot(selectionStore);
  const filesWithSettings = zip(
    files as File[],
    gameSettings as GameSettings[]
  ) as [File, GameSettings][];
  selectionStore.filteredFilesAndSettings = applyFilters(
    filesWithSettings,
    filters as Filter[]
  );
});

// ???
subscribeKey(selectionStore, "filteredFilesAndSettings", (ffas) => {
  const { filteredFilesAndSettings, selectedFileAndSettings } =
    snapshot(selectionStore);
  if (
    filteredFilesAndSettings.length > 0 &&
    selectedFileAndSettings === undefined
  ) {
    selectionStore.selectedFileAndSettings = filteredFilesAndSettings[0] as [
      File,
      GameSettings
    ];
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
