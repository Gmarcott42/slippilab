export function SpinnerCircle() {
  return (
    <svg viewBox="-5 -5 10 10">
      <circle
        r={4}
        className="animate-spin fill-transparent stroke-slate-400"
        strokeDasharray="100"
        strokeDashoffset={44}
        stroke-linecap="round"
        // @ts-ignore
        pathLength="100"
      />
    </svg>
  );
}
