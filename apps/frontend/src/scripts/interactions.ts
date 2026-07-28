export function initInteractions() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if (reducedMotion) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  if (!reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const strength = Number(element.dataset.magnetStrength ?? 0.16);
        const x = (event.clientX - rect.left - rect.width / 2) * strength;
        const y = (event.clientY - rect.top - rect.height / 2) * strength;
        element.style.setProperty('--magnet-x', `${x}px`);
        element.style.setProperty('--magnet-y', `${y}px`);
      });

      element.addEventListener('pointerleave', () => {
        element.style.setProperty('--magnet-x', '0px');
        element.style.setProperty('--magnet-y', '0px');
      });
    });

    document.querySelectorAll<HTMLElement>('[data-spotlight-card]').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
      });
    });
  }

  const stepsSequence = document.querySelector<HTMLOListElement>('[data-steps-sequence]');

  if (stepsSequence) {
    stepsSequence
      .querySelectorAll<HTMLElement>('.typewriter-output')
      .forEach((output) => (output.textContent = ''));

    const wait = (duration: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, duration));

    const typeStep = async (step: HTMLElement) => {
      const typewriter = step.querySelector<HTMLElement>('[data-typewriter]');
      const output = step.querySelector<HTMLElement>('.typewriter-output');
      const text = typewriter?.dataset.text ?? '';

      if (!typewriter || !output || !text) return;

      output.textContent = '';
      step.classList.add('is-typing');

      for (const character of Array.from(text)) {
        output.textContent += character;
        typewriter.style.setProperty(
          '--caret-position',
          `${output.getBoundingClientRect().width}px`,
        );
        await wait(character === ' ' ? 18 : 30);
      }

      step.classList.remove('is-typing');
      step.classList.add('is-described');
      await wait(210);
      step.classList.add('is-complete');
    };

    const playSequence = async () => {
      const steps = Array.from(stepsSequence.querySelectorAll<HTMLElement>('[data-step-motion]'));

      for (const step of steps) {
        await typeStep(step);
        await wait(140);
      }
    };

    const stepsObserver = new IntersectionObserver(
      ([entry], observer) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        void playSequence();
      },
      { threshold: 0.55, rootMargin: '0px 0px -18% 0px' },
    );

    const firstStep = stepsSequence.querySelector<HTMLElement>('[data-step-motion]');
    if (firstStep) stepsObserver.observe(firstStep);
  }
}
