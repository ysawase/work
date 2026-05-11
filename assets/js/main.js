/* TOP FV: synced three background videos.
   Each video starts from the beginning, plays almost to the end,
   then crossfades into the next video. */
(() => {
  const fv = document.querySelector('[data-fv-version="fv-video3-synced"]');
  if (!fv || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const videos = Array.from(fv.querySelectorAll('.niko-fv-video'));
  if (videos.length < 2) return;

  const fadeMs = 1350;
  const fallbackDurationMs = 5000;
  let currentIndex = 0;
  let timerId = null;

  const safePlay = (video) => {
    video.muted = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  const resetVideo = (video) => {
    try { video.currentTime = 0; } catch (_) {}
  };

  const getDurationMs = (video) => {
    if (Number.isFinite(video.duration) && video.duration > 1) {
      return video.duration * 1000;
    }
    return fallbackDurationMs;
  };

  const scheduleNext = () => {
    const currentVideo = videos[currentIndex];
    const waitMs = Math.max(2600, getDurationMs(currentVideo) - fadeMs);
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      showVideo((currentIndex + 1) % videos.length);
    }, waitMs);
  };

  const showVideo = (nextIndex) => {
    const previousIndex = currentIndex;
    const previousVideo = videos[previousIndex];
    const nextVideo = videos[nextIndex];

    currentIndex = nextIndex;
    resetVideo(nextVideo);
    safePlay(nextVideo);
    nextVideo.classList.add('is-active');

    if (previousVideo && previousVideo !== nextVideo) {
      previousVideo.classList.remove('is-active');
      window.setTimeout(() => {
        previousVideo.pause();
        resetVideo(previousVideo);
      }, fadeMs + 120);
    }

    scheduleNext();
  };

  videos.forEach((video, index) => {
    video.loop = false;
    video.addEventListener('ended', () => {
      if (index === currentIndex) showVideo((currentIndex + 1) % videos.length);
    });
  });

  videos.forEach((video, index) => {
    if (index === 0) {
      video.classList.add('is-active');
      resetVideo(video);
      safePlay(video);
    } else {
      video.classList.remove('is-active');
      video.pause();
      resetVideo(video);
    }
  });

  const first = videos[0];
  if (first.readyState >= 1) {
    scheduleNext();
  } else {
    first.addEventListener('loadedmetadata', scheduleNext, { once: true });
    window.setTimeout(scheduleNext, 1200);
  }
})();
