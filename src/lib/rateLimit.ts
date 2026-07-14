const trackers: Record<string, { count: number; resetTime: number }> = {};

export function checkRateLimit(key: string, limit = 10, windowMs = 60000): { success: boolean; remaining: number } {
  const now = Date.now();
  if (!trackers[key] || now > trackers[key].resetTime) {
    trackers[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true, remaining: limit - 1 };
  }

  if (trackers[key].count >= limit) {
    return { success: false, remaining: 0 };
  }

  trackers[key].count++;
  return { success: true, remaining: limit - trackers[key].count };
}
