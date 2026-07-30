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

  const motionEnabled =
    !reducedMotion || document.documentElement.classList.contains('motion-enabled');

  document.querySelectorAll<HTMLElement>('[data-scroll-stack]').forEach((stack) => {
    const cards = Array.from(
      stack.querySelectorAll<HTMLElement>('[data-scroll-stack-card]'),
    );

    if (!motionEnabled || cards.length < 2) return;

    let animationFrame = 0;

    const updateStack = () => {
      animationFrame = 0;
      const viewportHeight = window.innerHeight;
      const progressStart = viewportHeight * 0.82;

      cards.forEach((card, index) => {
        const nextCard = cards[index + 1];
        if (!nextCard) {
          card.style.setProperty('--stack-scale', '1');
          return;
        }

        const progressEnd =
          Math.min(viewportHeight * 0.18, 135) + (index + 1) * 22;
        const nextTop = nextCard.getBoundingClientRect().top;
        const progress = Math.min(
          1,
          Math.max(0, (progressStart - nextTop) / (progressStart - progressEnd)),
        );
        const targetScale = 1 - (cards.length - index - 1) * 0.025;
        const scale = 1 - progress * (1 - targetScale);

        card.style.setProperty('--stack-scale', scale.toFixed(4));
      });
    };

    const requestUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateStack);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    updateStack();
  });

}
