import { stageNameByExternalId } from "~/common/ids";
import { classMap, classNames } from "~/common/util";

export function PlayerBadge(props: { port: number }) {
  return (
    <span
      className={classNames(
        "inline-flex w-max items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        classMap({
          "bg-red-100 text-red-800": props.port === 1,
          "bg-blue-100 text-blue-800": props.port === 2,
          "bg-yellow-100 text-yellow-800": props.port === 3,
          "bg-green-100 text-green-800": props.port === 4,
        })
      )}
    >
      P{props.port}
    </span>
  );
}

export function StageBadge(props: { stageId: number }) {
  const abbreviation =
    { 8: "YS", 3: "PS", 2: "FoD", 31: "BF", 32: "FD", 28: "DL" }[
      props.stageId
    ] ?? "??";
  return (
    <span
      className={classNames(
        "inline-flex w-max items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        classMap({
          "bg-green-100 text-green-800":
            props.stageId === stageNameByExternalId.indexOf("Yoshi's Story"),
          "bg-purple-100 text-purple-800":
            props.stageId ===
            stageNameByExternalId.indexOf("Fountain of Dreams"),
          "bg-blue-100 text-blue-800":
            props.stageId === stageNameByExternalId.indexOf("Pokémon Stadium"),
          "bg-gray-100 text-gray-800":
            props.stageId === stageNameByExternalId.indexOf("Battlefield"),
          "bg-fuchsia-100 text-fuchsia-800":
            props.stageId ===
            stageNameByExternalId.indexOf("Final Destination"),
          "bg-orange-100 text-orange-800":
            props.stageId === stageNameByExternalId.indexOf("Dream Land N64"),
        })
      )}
      title={stageNameByExternalId[props.stageId]}
    >
      {abbreviation}
    </span>
  );
}
