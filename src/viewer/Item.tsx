import { itemNamesById } from "~/common/ids";
import { ItemUpdate, PlayerUpdate } from "~/common/types";
import { replayStore } from "~/state/replayStore";

// TODO: characters projectiles

// Note: Most items coordinates and sizes are divided by 256 to convert them
// from hitboxspace to worldspace.
export function Item(props: { item: ItemUpdate }) {
  const itemName = itemNamesById[props.item.typeId];
  switch (itemName) {
    case "Needle(thrown)":
      return <Needle item={props.item} />;
    case "Fox's Laser":
      return <FoxLaser item={props.item} />;
    case "Falco's Laser":
      return <FalcoLaser item={props.item} />;
    case "Turnip":
      return <Turnip item={props.item} />;
    case "Yoshi's egg(thrown)":
      return <YoshiEgg item={props.item} />;
    case "Luigi's fire":
      return <LuigiFireball item={props.item} />;
    case "Mario's fire":
      return <MarioFireball item={props.item} />;
    case "Missile":
      return <Missile item={props.item} />;
    case "Samus's bomb":
      return <SamusBomb item={props.item} />;
    case "Samus's chargeshot":
      return <SamusChargeshot item={props.item} />;
    case "Shyguy (Heiho)":
      return <FlyGuy item={props.item} />;
    default:
      return null;
  }
}

function SamusChargeshot(props: { item: ItemUpdate }) {
  // charge levels go 0 to 7
  const hitboxesByChargeLevel = [300, 400, 500, 600, 700, 800, 900, 1200];
  return (
    <>
      <circle
        cx={props.item.xPosition}
        cy={props.item.yPosition}
        r={hitboxesByChargeLevel[props.item.chargeShotChargeLevel] / 256}
        fill="darkgray"
      />
    </>
  );
}

function SamusBomb(props: { item: ItemUpdate }) {
  // states: 1 = falling, 3 = exploding
  return (
    <>
      <circle
        cx={props.item.xPosition}
        cy={props.item.yPosition}
        r={(props.item.state === 3 ? 1536 : 500) / 256}
        fill="darkgray"
      />
    </>
  );
}

function Missile(props: { item: ItemUpdate }) {
  // samusMissileTypes: 0 = homing missile, 1 = smash missile
  return (
    <>
      <circle
        cx={props.item.xPosition}
        cy={props.item.yPosition}
        r={(props.item.samusMissileType === 0 ? 500 : 600) / 256}
        fill="darkgray"
      />
    </>
  );
}

function MarioFireball(props: { item: ItemUpdate }) {
  return (
    <>
      <circle
        cx={props.item.xPosition}
        cy={props.item.yPosition}
        r={600 / 256}
        fill="darkgray"
      />
    </>
  );
}

function LuigiFireball(props: { item: ItemUpdate }) {
  return (
    <>
      <circle
        cx={props.item.xPosition}
        cy={props.item.yPosition}
        r={500 / 256}
        fill="darkgray"
      />
    </>
  );
}

function YoshiEgg(props: { item: ItemUpdate }) {
  // states: 0 = held, 1 = thrown, 2 = exploded
  const ownerState = getOwner(props.item).state;
  return (
    <>
      <circle
        cx={
          props.item.state === 0 ? ownerState.xPosition : props.item.xPosition
        }
        cy={
          props.item.state === 0
            ? ownerState.yPosition + 8
            : props.item.yPosition
        }
        r={props.item.state === 2 ? 2500 / 256 : 1000 / 256}
        fill="darkgray"
        opacity={props.item.state === 1 ? 1 : 0.5}
      />
    </>
  );
}

function Turnip(props: { item: ItemUpdate }) {
  // states: 0 = held, 1 = bouncing?, 2 = thrown
  // face: props.item.peachTurnipFace
  const ownerState = getOwner(props.item).state;
  return (
    <>
      <circle
        cx={
          props.item.state === 0 ? ownerState.xPosition : props.item.xPosition
        }
        cy={
          props.item.state === 0
            ? ownerState.yPosition + 8
            : props.item.yPosition
        }
        r={600 / 256}
        fill="darkgray"
        opacity={props.item.state === 0 ? 0.5 : 1}
      />
    </>
  );
}

function Needle(props: { item: ItemUpdate }) {
  return (
    <>
      <circle
        cx={props.item.xPosition}
        cy={props.item.yPosition}
        r={500 / 256}
        fill="darkgray"
      />
    </>
  );
}

function FoxLaser(props: { item: ItemUpdate }) {
  // There is a 4th hitbox for the first frame only at -3600 (hitboxspace) with
  // size 400 / 256 that I am skipping.
  const hitboxOffsets = [-200, -933, -1666].map((x) => x / 256);
  const hitboxSize = 300 / 256;
  // Throws and deflected lasers are not straight horizontal
  const direction = Math.atan2(props.item.yVelocity, props.item.xVelocity);
  const rotations = [Math.cos(direction), Math.sin(direction)];
  return (
    <>
      <line
        x1={
          props.item.xPosition +
          hitboxOffsets[0] * props.item.facingDirection * rotations[0]
        }
        y1={
          props.item.yPosition +
          hitboxOffsets[0] * props.item.facingDirection * rotations[1]
        }
        x2={
          props.item.xPosition +
          hitboxOffsets[hitboxOffsets.length - 1] *
            props.item.facingDirection *
            rotations[0]
        }
        y2={
          props.item.yPosition +
          hitboxOffsets[hitboxOffsets.length - 1] *
            props.item.facingDirection *
            rotations[1]
        }
        stroke="red"
      />
      {hitboxOffsets.map((hitboxOffset, index) => (
        <circle
          key={index}
          cx={
            props.item.xPosition +
            hitboxOffset * props.item.facingDirection * rotations[0]
          }
          cy={
            props.item.yPosition +
            hitboxOffset * props.item.facingDirection * rotations[1]
          }
          r={hitboxSize}
          fill="red"
        />
      ))}
    </>
  );
}

function FalcoLaser(props: { item: ItemUpdate }) {
  const hitboxOffsets = [-200, -933, -1666, -2400].map((x) => x / 256);
  const hitboxSize = 300 / 256;
  // Throws and deflected lasers are not straight horizontal
  const direction = Math.atan2(props.item.yVelocity, props.item.xVelocity);
  const rotations = [Math.cos(direction), Math.sin(direction)];
  return (
    <>
      <line
        x1={props.item.xPosition + hitboxOffsets[0] * rotations[0]}
        y1={props.item.yPosition + hitboxOffsets[0] * rotations[1]}
        x2={
          props.item.xPosition +
          hitboxOffsets[hitboxOffsets.length - 1] * rotations[0]
        }
        y2={
          props.item.yPosition +
          hitboxOffsets[hitboxOffsets.length - 1] * rotations[1]
        }
        stroke="red"
      />
      {hitboxOffsets.map((hitboxOffset, index) => (
        <circle
          key={index}
          cx={props.item.xPosition + hitboxOffset * rotations[0]}
          cy={props.item.yPosition + hitboxOffset * rotations[1]}
          r={hitboxSize}
          fill="red"
        />
      ))}
    </>
  );
}

function FlyGuy(props: { item: ItemUpdate }) {
  return (
    <>
      <circle
        cx={props.item.xPosition}
        cy={props.item.yPosition}
        r={5 * 0.85}
        fill="#aa0000"
      />
    </>
  );
}

function getOwner(item: ItemUpdate): PlayerUpdate {
  return replayStore.replayData!.frames[item.frameNumber].players[item.owner];
}
