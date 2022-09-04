import CreatableSelect from "react-select/creatable";
import { groupBy } from "rambda";
import { characterNameByExternalId, stageNameByExternalId } from "~/common/ids";
import { Picker } from "~/common/Picker";
import { GameSettings, PlayerSettings } from "~/common/types";
import { StageBadge } from "~/common/Badge";
import { PrimaryButton } from "~/common/Button";
import {
  selectionStore,
  setFilters,
  select,
  nextFile,
  previousFile,
  Filter,
} from "~/state/selectionStore";
import { useSnapshot } from "valtio";

// TODO: support custom filters (display name, connect code, nametag)
const filterOptions = [
  ...characterNameByExternalId.map((name) => ({
    type: "character",
    label: name,
    value: name,
  })),
  ...stageNameByExternalId.map((name) => ({
    type: "stage",
    label: name,
    value: name,
  })),
];

export function Replays() {
  const { filteredFilesAndSettings, selectedFileAndSettings, filters } =
    useSnapshot(selectionStore);
  return (
    <>
      <div className="flex h-full w-96 flex-col items-center gap-2 overflow-y-auto">
        <div
          className="w-full"
          // don't trigger global shortcuts when typing in the filter box
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
        >
          <CreatableSelect
            className="w-full rounded border border-slate-600 bg-white"
            placeholder="Filter"
            options={filterOptions}
            isMulti
            // initialValue={selectionStore.filters}
            onChange={(filters) => setFilters(filters as unknown as Filter[])}
          />
        </div>
        <Picker
          items={filteredFilesAndSettings as [File, GameSettings][]}
          render={([file, gameSettings]) => (
            <GameInfo gameSettings={gameSettings} />
          )}
          onClick={(fileAndSettings) => select(fileAndSettings)}
          selected={([file, gameSettings]) =>
            selectedFileAndSettings?.[0] === file &&
            selectedFileAndSettings?.[1] === gameSettings
          }
          estimateSize={([file, gameSettings]) =>
            gameSettings.isTeams ? 56 : 32
          }
        />
        <div className="flex w-full items-center justify-between gap-4">
          <PrimaryButton onClick={previousFile}>
            <div className="material-icons cursor-pointer">arrow_upward</div>
          </PrimaryButton>
          <PrimaryButton onClick={nextFile}>
            <div className="material-icons cursor-pointer">arrow_downward</div>
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}

function GameInfo(props: { gameSettings: GameSettings }) {
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
        <StageBadge stageId={props.gameSettings.stageId} />
        <div className="flex flex-grow flex-col items-center">
          {props.gameSettings.isTeams
            ? Object.values(
                groupBy(
                  (p) => String(p.teamId),
                  props.gameSettings.playerSettings.filter((s) => s)
                )
              ).map((team, index) => (
                <div key={index}>{team.map(playerString).join(" + ")}</div>
              ))
            : props.gameSettings.playerSettings
                .filter((s) => s)
                .map(playerString)
                .join(" vs ")}
        </div>
      </div>
    </>
  );
}
