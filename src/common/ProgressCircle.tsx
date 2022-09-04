export function ProgressCircle(props: { percent: number }) {
  return (
    <svg viewBox="-5 -5 10 10">
      <circle
        r={4}
        className="-rotate-90 fill-transparent stroke-slate-400"
        strokeDasharray="100"
        strokeDashoffset={100 - props.percent}
        // @ts-ignore
        pathLength="100"
      />
    </svg>
  );
}
