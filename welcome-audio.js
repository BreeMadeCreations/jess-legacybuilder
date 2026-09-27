(() => {
  const audio = document.getElementById('welcomeAudio');
  const button = document.getElementById('welcomeAudioToggle');
  if (!audio || !button) return;
  let awaitingInteraction = true;
  const stopWaiting = () => {
    awaitingInteraction = false;
    document.removeEventListener('click', firstInteraction);
    document.removeEventListener('keydown', firstInteraction);
  };
  const play = () => {
    audio.play().catch(() => {
      button.textContent = 'Play audio';
    });
  };
  function firstInteraction(event) {
    if (!awaitingInteraction || button.contains(event.target)) return;
    if (event.type === 'keydown' &&
        (event.repeat || !['Enter', ' '].includes(event.key) ||
         /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))) return;
    play();
  }
  button.addEventListener('click', () => {
    stopWaiting();
    if (audio.paused) play();
    else audio.pause();
  });
  audio.addEventListener('play', () => {
    stopWaiting();
    button.textContent = 'Pause audio';
    button.setAttribute('aria-label', 'Pause welcome audio');
  });
  const showPlay = () => {
    button.textContent = audio.ended ? 'Replay audio' : 'Play audio';
    button.setAttribute('aria-label', audio.ended ? 'Replay welcome audio' : 'Play welcome audio');
  };
  audio.addEventListener('pause', showPlay);
  audio.addEventListener('ended', showPlay);
  audio.addEventListener('error', () => {
    stopWaiting();
    button.textContent = 'Audio unavailable';
    button.disabled = true;
  });
  document.addEventListener('click', firstInteraction);
  document.addEventListener('keydown', firstInteraction);
  play();
})();
