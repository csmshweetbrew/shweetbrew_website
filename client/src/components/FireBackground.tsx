/*
 * The fire behind the whole home page: smoke at the top, warmer with more sparks as you scroll.
 * See lib/fire/background.ts.
 */

import { useEffect, useRef } from "react";

export default function FireBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let gone = false;
    import("@/lib/fire/background").then(({ startFireBackground }) => {
      if (!gone && canvas.current) stop = startFireBackground(canvas.current);
    });
    return () => {
      gone = true;
      stop?.();
    };
  }, []);

  return (
    <div className="fire-bg" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
