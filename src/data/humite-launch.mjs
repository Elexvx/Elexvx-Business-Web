export const humiteLaunch = {
  enabled: true,
  releaseAt: '2026-11-23T09:00:00+08:00',
};

export function isHumiteReleaseDue(now = Date.now()) {
  return !humiteLaunch.enabled || now >= Date.parse(humiteLaunch.releaseAt);
}

export function isHumiteProductPath(path) {
  return /^(?:\/en)?\/products\/humite\/?$/.test(path);
}
