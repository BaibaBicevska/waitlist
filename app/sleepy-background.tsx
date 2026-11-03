// Night sky behind the page: gradient, moon, twinkling stars, drifting
// clouds and floating "z"s. Pure CSS animations (see globals.css).

// Deterministic pseudo-random in [0, 1), so stars land in the same place
// on every render (no Math.random during prerendering).
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const stars = Array.from({ length: 70 }, (_, i) => ({
  left: rand(i + 1) * 100,
  top: rand(i + 101) * 75,
  size: 1 + rand(i + 201) * 2,
  delay: rand(i + 301) * 6,
  duration: 3 + rand(i + 401) * 4,
}));

const clouds = [
  { top: 18, width: 320, duration: 90, delay: -20, opacity: 0.08 },
  { top: 52, width: 460, duration: 120, delay: -70, opacity: 0.06 },
  { top: 72, width: 280, duration: 100, delay: -45, opacity: 0.07 },
];

const zs = [
  { size: 18, delay: 0 },
  { size: 24, delay: 2.5 },
  { size: 30, delay: 5 },
];

export function SleepyBackground() {
  return (
    <div
      aria-hidden="true"
      className="sleepy-sky pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="sleepy-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      <div className="sleepy-moon">
        <div className="sleepy-moon-disc" />
        {zs.map((z, i) => (
          <span
            key={i}
            className="sleepy-z"
            style={{ fontSize: z.size, animationDelay: `${z.delay}s` }}
          >
            z
          </span>
        ))}
      </div>

      {clouds.map((c, i) => (
        <span
          key={i}
          className="sleepy-cloud"
          style={{
            top: `${c.top}%`,
            width: c.width,
            height: c.width / 3,
            opacity: c.opacity,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      <div className="sleepy-hills" />
    </div>
  );
}
