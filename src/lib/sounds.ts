
'use client';

/**
 * Utility to manage and play application sounds efficiently.
 * Reuses Audio objects where possible to save memory.
 */

const sounds: Record<string, HTMLAudioElement | null> = {
  click: typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3') : null,
  success: typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3') : null,
  login: typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3') : null,
  startup: typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3') : null,
};

export function playSound(name: 'click' | 'success' | 'login' | 'startup') {
  if (typeof window !== 'undefined') {
    const isMuted = localStorage.getItem('careingo_muted') === 'true';
    if (isMuted) return;
  }

  const sound = sounds[name];
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {
      // Ignore errors if browser blocks autoplay
    });
  }
}
