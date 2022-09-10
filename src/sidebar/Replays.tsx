import { Combobox } from "@headlessui/react";
import { groupBy } from "rambda";
import { characterNameByExternalId, stageNameByExternalId } from "~/common/ids";
import { Picker } from "~/common/Picker";
import { GameSettings, PlayerSettings } from "~/common/types";
import { StageBadge } from "~/common/Badge";
import {
  selectionStore,
  select,
  Filter,
  addFilter,
  removeFilter,
} from "~/state/selectionStore";
import { useSnapshot } from "valtio";
import { useState } from "react";
import { classNames } from "~/common/util";

const defaultFilters: Filter[] = [
  ...characterNameByExternalId.map((name) => ({
    type: "character" as const,
    label: name,
    value: name,
  })),
  ...stageNameByExternalId.map((name) => ({
    type: "stage" as const,
    label: name,
    value: name,
  })),
];

export function Replays() {
  return (
    <>
      <div className="flex h-full w-96 flex-col items-center overflow-y-auto">
        <FilterPicker />
        <FilterChips />
        <FilterResults />
      </div>
    </>
  );
}

function FilterPicker() {
  const [query, setQuery] = useState("");
  const results =
    query === ""
      ? defaultFilters
      : defaultFilters.filter((filterOption) => {
          return filterOption.label.toLowerCase().includes(query.toLowerCase());
        });
  return (
    <div
      className="w-full"
      // don't trigger playback shortcuts when typing in the filter box
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    >
      <Combobox
        nullable
        onChange={(filter: Filter | null) => filter && addFilter(filter)}
      >
        <div className="relative">
          <Combobox.Input
            onChange={(event) => setQuery(event.target.value)}
            className="my-[1px] w-full rounded-md border border-gray-400 py-2 px-3 focus:my-0 focus:border-2 focus:border-slippi-500 focus:outline-none sm:text-sm"
            placeholder="Filter"
          />
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {results.map((filter) => (
              <Combobox.Option
                key={filter.value}
                value={filter}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active
                      ? "bg-slippi-500 text-white [&>span]:text-gray-300"
                      : "text-gray-900 [&>span]:text-gray-400"
                  )
                }
              >
                {filter.label}{" "}
                <span>
                  {filter.type === "character"
                    ? "Character"
                    : filter.type === "stage"
                    ? "Stage"
                    : ""}
                </span>
              </Combobox.Option>
            ))}
            {query !== "" && (
              <>
                <Combobox.Option
                  value={{
                    type: "displayName",
                    value: query.trim(),
                    label: query.trim(),
                  }}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-3 pr-9",
                      active
                        ? "bg-slippi-500 text-white [&>span]:text-gray-300"
                        : "text-gray-900 [&>span]:text-gray-400"
                    )
                  }
                >
                  "{query.trim()}" <span>Display Name</span>
                </Combobox.Option>
                <Combobox.Option
                  value={{
                    type: "connectCode",
                    value: query.trim(),
                    label: query.trim(),
                  }}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-3 pr-9",
                      active
                        ? "bg-slippi-500 text-white [&>span]:text-gray-300"
                        : "text-gray-900 [&>span]:text-gray-400"
                    )
                  }
                >
                  "{query.trim()}" <span>Connect Code</span>
                </Combobox.Option>
                <Combobox.Option
                  value={{
                    type: "nametag",
                    value: query.trim(),
                    label: query.trim(),
                  }}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-3 pr-9",
                      active
                        ? "bg-slippi-500 text-white [&>span]:text-gray-300"
                        : "text-gray-900 [&>span]:text-gray-400"
                    )
                  }
                >
                  "{query.trim()}" <span>Nametag (In game)</span>
                </Combobox.Option>
              </>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
}

function FilterChips() {
  const { filters } = useSnapshot(selectionStore);
  if (filters.length === 0) return null;
  return (
    <div className="my-2 flex w-full flex-wrap items-center gap-3">
      {filters.map((filter, index) => (
        <span
          className="inline-flex items-center rounded-full bg-slippi-400 py-1 pl-2.5 pr-1 text-sm font-medium text-white"
          key={index}
        >
          {filter.type === "displayName"
            ? `Name: ${filter.label}`
            : filter.type === "connectCode"
            ? `Code: ${filter.label}`
            : filter.type === "nametag"
            ? `Nametag: ${filter.label}`
            : filter.label}
          <button
            type="button"
            className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-white hover:bg-slippi-300"
            onClick={() => removeFilter(index)}
          >
            <span className="sr-only">Remove large option</span>
            <svg
              className="h-2 w-2"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 8 8"
            >
              <path
                strokeLinecap="round"
                strokeWidth="1.5"
                d="M1 1l6 6m0-6L1 7"
              />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}

function FilterResults() {
  const { filteredFilesAndSettings, selectedFileAndSettings } =
    useSnapshot(selectionStore);
  return (
    <Picker
      items={filteredFilesAndSettings as [File, GameSettings][]}
      render={([file, gameSettings]) => (
        <GameInfo gameSettings={gameSettings} />
      )}
      onClick={(fileAndSettings) => select(fileAndSettings)}
      // file is not proxied in the store so it is ok to compare
      selected={([file]) => selectedFileAndSettings?.[0] === file}
      estimateSize={([file, gameSettings]) => (gameSettings.isTeams ? 56 : 32)}
    />
  );
}

function GameInfo({ gameSettings }: { gameSettings: GameSettings }) {
  function playerString(player: PlayerSettings): string {
    const name = [player.displayName, player.connectCode, player.nametag].find(
      (s) => s?.length > 0
    );
    const character = characterNameByExternalId[player.externalCharacterId];
    return name !== undefined ? `${name}(${character})` : character;
  }

  return (
    <>
      <div className="flex w-full items-center">
        <StageBadge stageId={gameSettings.stageId} />
        <div className="flex flex-grow flex-col items-center">
          {gameSettings.isTeams
            ? Object.values(
                groupBy(
                  (p) => String(p.teamId),
                  gameSettings.playerSettings.filter((s) => s)
                )
              ).map((team, index) => (
                <div key={index}>{team.map(playerString).join(" + ")}</div>
              ))
            : gameSettings.playerSettings
                .filter((s) => s)
                .map(playerString)
                .join(" vs ")}
        </div>
      </div>
    </>
  );
}
