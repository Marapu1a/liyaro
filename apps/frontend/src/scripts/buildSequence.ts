const MOTION_KEY = 'liyaro:motion:full';
const BUILD_COMMAND = 'BUILD SOMETHING USEFUL';

export function initBuildSequence() {
  const root = document.querySelector<HTMLElement>('[data-build-intro]');
  const surface = document.querySelector<HTMLElement>('[data-build-surface]');
  const command = document.querySelector<HTMLElement>('[data-build-command]');
  const commandOutput = document.querySelector<HTMLElement>('[data-build-command-output]');
  const flyingLogo = document.querySelector<HTMLElement>('[data-build-flying-logo]');
  const control = document.querySelector<HTMLButtonElement>('[data-build-control]');
  const hint = document.querySelector<HTMLElement>('[data-build-hint]');
  const header = document.querySelector<HTMLElement>('[data-build-header]');
  const logoTarget = document.querySelector<HTMLElement>('[data-build-logo-target]');
  if (
    !root ||
    !surface ||
    !command ||
    !commandOutput ||
    !flyingLogo ||
    !control ||
    !hint ||
    !header ||
    !logoTarget
  ) {
    document.documentElement.classList.remove('build-intro-pending');
    return;
  }

  let sequenceId = 0;
  let isRunning = false;
  let interactionCount = 0;
  let speedMultiplier = 1;
  let revealCleanup = 0;
  const activeAnimations = new Set<Animation>();

  const wait = (duration: number, currentId: number) =>
    new Promise<void>((resolve) => {
      let elapsed = 0;
      let previousTime = window.performance.now();

      const tick = (currentTime: number) => {
        if (currentId !== sequenceId) {
          resolve();
          return;
        }

        elapsed += (currentTime - previousTime) * speedMultiplier;
        previousTime = currentTime;

        if (elapsed >= duration) {
          resolve();
          return;
        }

        window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
    });

  const trackAnimation = async (
    element: Element,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) => {
    const animation = element.animate(keyframes, options);
    animation.playbackRate = speedMultiplier;
    activeAnimations.add(animation);

    try {
      await animation.finished;
    } catch {
      // A cancelled animation is settled immediately by finishSequence().
    } finally {
      activeAnimations.delete(animation);
    }
  };

  const resetHeader = () => {
    header.classList.remove('is-fill', 'is-logo', 'is-details', 'is-line');
  };

  const cancelElementAnimations = () => {
    [surface, command, flyingLogo].forEach((element) => {
      element.getAnimations().forEach((animation) => animation.cancel());
    });
  };

  const finishSequence = (currentId: number) => {
    if (currentId !== sequenceId) return;

    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations.clear();
    header.classList.add('is-fill', 'is-logo', 'is-details', 'is-line');
    root.classList.remove('is-active');
    cancelElementAnimations();
    document.documentElement.classList.add('is-revealing-main');
    document.documentElement.classList.remove('build-intro-pending', 'is-building');
    document.body.style.removeProperty('overflow');
    flyingLogo.removeAttribute('style');
    surface.removeAttribute('style');
    command.removeAttribute('style');
    isRunning = false;

    window.clearTimeout(revealCleanup);
    revealCleanup = window.setTimeout(() => {
      document.documentElement.classList.remove('is-revealing-main');
    }, 750);

  };

  const runSequence = async () => {
    if (isRunning) return;

    isRunning = true;
    const currentId = ++sequenceId;
    interactionCount = 0;
    speedMultiplier = 1;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.clearTimeout(revealCleanup);
    document.documentElement.classList.remove('is-revealing-main');
    resetHeader();
    cancelElementAnimations();
    commandOutput.textContent = '';
    command.classList.remove('is-complete');
    hint.textContent = 'Клик — ускорить';
    control.setAttribute('aria-label', 'Ускорить вступительную анимацию');
    command.style.opacity = '1';
    flyingLogo.removeAttribute('style');
    surface.removeAttribute('style');
    surface.style.opacity = '1';
    root.classList.add('is-active');
    document.documentElement.classList.add('is-building');
    document.documentElement.classList.remove('build-intro-pending');
    document.body.style.overflow = 'hidden';

    await wait(180, currentId);

    for (const character of Array.from(BUILD_COMMAND)) {
      if (currentId !== sequenceId) return;
      commandOutput.textContent += character;
      await wait(character === ' ' ? 26 : 38, currentId);
    }

    command.classList.add('is-complete');
    await wait(1100, currentId);
    if (currentId !== sequenceId) return;

    await trackAnimation(
      command,
      [
        { opacity: 1, filter: 'blur(0)' },
        { opacity: 0, filter: 'blur(5px)' },
      ],
      { duration: 240, easing: 'ease-out', fill: 'forwards' },
    );

    const targetRect = logoTarget.getBoundingClientRect();
    const startScale = Math.min(5.4, Math.max(3.4, (window.innerWidth * 0.42) / targetRect.width));
    const startX = window.innerWidth / 2 - targetRect.left - (targetRect.width * startScale) / 2;
    const startY =
      window.innerHeight / 2 - targetRect.top - (targetRect.height * startScale) / 2;
    const startTransform = `translate(${startX}px, ${startY}px) scale(${startScale})`;

    flyingLogo.style.left = `${targetRect.left}px`;
    flyingLogo.style.top = `${targetRect.top}px`;
    flyingLogo.style.width = `${targetRect.width}px`;
    flyingLogo.style.height = `${targetRect.height}px`;

    await trackAnimation(
      flyingLogo,
      [
        {
          opacity: 0,
          transform: `translate(${startX}px, ${startY}px) scale(${startScale * 0.94})`,
        },
        { opacity: 1, transform: startTransform },
      ],
      { duration: 360, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
    );

    await wait(280, currentId);
    if (currentId !== sequenceId) return;

    header.classList.add('is-fill');

    const surfacePromise = trackAnimation(
      surface,
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 720, easing: 'ease-in-out', fill: 'forwards' },
    );

    await trackAnimation(
      flyingLogo,
      [
        { transform: startTransform },
        { transform: 'translate(0, 0) scale(1)' },
      ],
      { duration: 760, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' },
    );

    await surfacePromise;
    if (currentId !== sequenceId) return;

    header.classList.add('is-logo');
    flyingLogo.style.opacity = '0';
    await wait(120, currentId);
    header.classList.add('is-details');
    await wait(360, currentId);
    header.classList.add('is-line');
    await wait(940, currentId);

    finishSequence(currentId);
  };

  const handleScreenClick = () => {
    if (!isRunning) return;

    if (interactionCount === 0) {
      interactionCount = 1;
      speedMultiplier = 2;
      activeAnimations.forEach((animation) => {
        animation.playbackRate = 2;
      });
      hint.textContent = 'Ещё клик — пропустить';
      control.setAttribute('aria-label', 'Пропустить вступительную анимацию');
      return;
    }

    const currentId = sequenceId;
    finishSequence(currentId);
    sequenceId += 1;
  };

  control.addEventListener('click', handleScreenClick);

  try {
    if (window.localStorage.getItem(MOTION_KEY) === 'enabled') {
      document.documentElement.classList.add('motion-enabled');
    }
  } catch {
    // Storage can be unavailable in privacy-restricted contexts.
  }

  if (document.documentElement.classList.contains('build-intro-pending')) {
    void runSequence();
  } else {
    document.documentElement.classList.remove('build-intro-pending');
  }
}
