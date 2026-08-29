import confetti from 'canvas-confetti';

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6'],
    });
  } catch {
    // Ignore in unsupported environments
  }
}

export function triggerStreakConfetti() {
  try {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#10B981', '#EC4899', '#8B5CF6'],
      });
    }, 250);
  } catch {
    // Ignore in unsupported environments
  }
}
