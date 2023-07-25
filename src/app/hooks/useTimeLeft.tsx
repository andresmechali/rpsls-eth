import { useEffect, useState } from "react";

/**
 * Starts a timer from lastAction, and returns the minutes, seconds and milliseconds left.
 * The seconds correspond to how many seconds are left given the current minutes, while the milliseconds
 * correspond to the total amount.
 * @param lastAction
 */
export function useTimeLeft(lastAction?: number) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [minutesLeft, setMinutesLeft] = useState<number>(0);
  const [msLeft, setMsLeft] = useState<number>();

  const totalMinutes = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lastAction) {
        const last = new Date(lastAction);
        const expiry = new Date(
          last.setSeconds(last.getSeconds() + totalMinutes * 60),
        );
        const now = new Date();
        const missing = expiry.getTime() - now.getTime();
        const seconds = Math.floor((missing / 1_000) % 60);
        const minutes = Math.floor((missing / (60 * 1_000)) % totalMinutes);
        setSecondsLeft(seconds > 0 ? seconds : 0);
        setMinutesLeft(minutes > 0 ? minutes : 0);
        setMsLeft(missing > 0 ? missing : 0);
      }
    }, 1_000);

    return () => clearTimeout(timer);
  });

  return { secondsLeft, minutesLeft, msLeft };
}
