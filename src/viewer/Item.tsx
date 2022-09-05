import { itemNamesById } from "~/common/ids";
import { ItemUpdate, PlayerUpdate } from "~/common/types";
import { replayStore } from "~/state/replayStore";

// TODO: characters projectiles

// Note: Most items coordinates and sizes are divided by 256 to convert them
// from hitboxspace to worldspace.
export function Item({ item }: { item: ItemUpdate }) {
  const itemName = itemNamesById[item.typeId];
  switch (itemName) {
    case "Needle(thrown)":
      return <Needle item={item} />;
    case "Fox's Laser":
      return <FoxLaser item={item} />;
    case "Falco's Laser":
      return <FalcoLaser item={item} />;
    case "Turnip":
      return <Turnip item={item} />;
    case "Yoshi's egg(thrown)":
      return <YoshiEgg item={item} />;
    case "Luigi's fire":
      return <LuigiFireball item={item} />;
    case "Mario's fire":
      return <MarioFireball item={item} />;
    case "Missile":
      return <Missile item={item} />;
    case "Samus's bomb":
      return <SamusBomb item={item} />;
    case "Samus's chargeshot":
      return <SamusChargeshot item={item} />;
    case "Shyguy (Heiho)":
      return <FlyGuy item={item} />;
    default:
      return null;
  }
}

function SamusChargeshot({ item }: { item: ItemUpdate }) {
  // charge levels go 0 to 7
  const hitboxesByChargeLevel = [300, 400, 500, 600, 700, 800, 900, 1200];
  return (
    <>
      <circle
        cx={item.xPosition}
        cy={item.yPosition}
        r={hitboxesByChargeLevel[item.chargeShotChargeLevel] / 256}
        fill="darkgray"
      />
    </>
  );
}

function SamusBomb({ item }: { item: ItemUpdate }) {
  // states: 1 = falling, 3 = exploding
  return (
    <>
      <circle
        cx={item.xPosition}
        cy={item.yPosition}
        r={(item.state === 3 ? 1536 : 500) / 256}
        fill="darkgray"
      />
    </>
  );
}

function Missile({ item }: { item: ItemUpdate }) {
  // samusMissileTypes: 0 = homing missile, 1 = smash missile
  return (
    <>
      <circle
        cx={item.xPosition}
        cy={item.yPosition}
        r={(item.samusMissileType === 0 ? 500 : 600) / 256}
        fill="darkgray"
      />
    </>
  );
}

function MarioFireball({ item }: { item: ItemUpdate }) {
  return (
    <>
      <circle
        cx={item.xPosition}
        cy={item.yPosition}
        r={600 / 256}
        fill="darkgray"
      />
    </>
  );
}

function LuigiFireball({ item }: { item: ItemUpdate }) {
  return (
    <>
      <circle
        cx={item.xPosition}
        cy={item.yPosition}
        r={500 / 256}
        fill="darkgray"
      />
    </>
  );
}

function YoshiEgg({ item }: { item: ItemUpdate }) {
  // states: 0 = held, 1 = thrown, 2 = exploded
  const ownerState = getOwner(item).state;
  return (
    <>
      <circle
        cx={item.state === 0 ? ownerState.xPosition : item.xPosition}
        cy={item.state === 0 ? ownerState.yPosition + 8 : item.yPosition}
        r={item.state === 2 ? 2500 / 256 : 1000 / 256}
        fill="darkgray"
        opacity={item.state === 1 ? 1 : 0.5}
      />
    </>
  );
}

function Turnip({ item }: { item: ItemUpdate }) {
  // states: 0 = held, 1 = bouncing?, 2 = thrown
  // face: item.peachTurnipFace
  const ownerState = getOwner(item).state;
  return (
    <>
      <circle
        cx={item.state === 0 ? ownerState.xPosition : item.xPosition}
        cy={item.state === 0 ? ownerState.yPosition + 8 : item.yPosition}
        r={600 / 256}
        fill="darkgray"
        opacity={item.state === 0 ? 0.5 : 1}
      />
    </>
  );
}

function Needle({ item }: { item: ItemUpdate }) {
  return (
    <>
      <circle
        cx={item.xPosition}
        cy={item.yPosition}
        r={500 / 256}
        fill="darkgray"
      />
    </>
  );
}

function FoxLaser({ item }: { item: ItemUpdate }) {
  // There is a 4th hitbox for the first frame only at -3600 (hitboxspace) with
  // size 400 / 256 that I am skipping.
  const hitboxOffsets = [-200, -933, -1666].map((x) => x / 256);
  const hitboxSize = 300 / 256;
  // Throws and deflected lasers are not straight horizontal
  const direction = Math.atan2(item.yVelocity, item.xVelocity);
  const rotations = [Math.cos(direction), Math.sin(direction)];
  return (
    <>
      <line
        x1={
          item.xPosition +
          hitboxOffsets[0] * item.facingDirection * rotations[0]
        }
        y1={
          item.yPosition +
          hitboxOffsets[0] * item.facingDirection * rotations[1]
        }
        x2={
          item.xPosition +
          hitboxOffsets[hitboxOffsets.length - 1] *
            item.facingDirection *
            rotations[0]
        }
        y2={
          item.yPosition +
          hitboxOffsets[hitboxOffsets.length - 1] *
            item.facingDirection *
            rotations[1]
        }
        stroke="red"
      />
      {hitboxOffsets.map((hitboxOffset, index) => (
        <circle
          key={index}
          cx={
            item.xPosition + hitboxOffset * item.facingDirection * rotations[0]
          }
          cy={
            item.yPosition + hitboxOffset * item.facingDirection * rotations[1]
          }
          r={hitboxSize}
          fill="red"
        />
      ))}
    </>
  );
}

function FalcoLaser({ item }: { item: ItemUpdate }) {
  const hitboxOffsets = [-200, -933, -1666, -2400].map((x) => x / 256);
  const hitboxSize = 300 / 256;
  // Throws and deflected lasers are not straight horizontal
  const direction = Math.atan2(item.yVelocity, item.xVelocity);
  const rotations = [Math.cos(direction), Math.sin(direction)];
  return (
    <>
      <line
        x1={item.xPosition + hitboxOffsets[0] * rotations[0]}
        y1={item.yPosition + hitboxOffsets[0] * rotations[1]}
        x2={
          item.xPosition +
          hitboxOffsets[hitboxOffsets.length - 1] * rotations[0]
        }
        y2={
          item.yPosition +
          hitboxOffsets[hitboxOffsets.length - 1] * rotations[1]
        }
        stroke="red"
      />
      {hitboxOffsets.map((hitboxOffset, index) => (
        <circle
          key={index}
          cx={item.xPosition + hitboxOffset * rotations[0]}
          cy={item.yPosition + hitboxOffset * rotations[1]}
          r={hitboxSize}
          fill="red"
        />
      ))}
    </>
  );
}

function FlyGuy({ item }: { item: ItemUpdate }) {
  return (
    <>
      <circle
        cx={item.xPosition}
        cy={item.yPosition}
        r={5 * 0.85}
        fill="#aa0000"
      />
    </>
  );
}

function getOwner(item: ItemUpdate): PlayerUpdate {
  return replayStore.replayData!.frames[item.frameNumber].players[item.owner];
}
