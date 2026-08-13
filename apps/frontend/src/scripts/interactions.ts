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

  document.querySelectorAll<HTMLElement>('[data-capabilities]').forEach((showcase) => {
    const tabs = Array.from(showcase.querySelectorAll<HTMLButtonElement>('[data-capability-tab]'));
    const panels = Array.from(showcase.querySelectorAll<HTMLElement>('[data-capability-panel]'));
    const counter = showcase.querySelector<HTMLElement>('[data-capability-counter]');
    let isTransitioning = false;
    let queuedRequest: { tab: HTMLButtonElement; shouldFocus: boolean } | null = null;

    panels.forEach((panel) => {
      panel.toggleAttribute('inert', !panel.classList.contains('is-active'));
    });

    const takeQueuedRequest = () => {
      const request = queuedRequest;
      queuedRequest = null;
      return request;
    };

    const commitSelection = (nextTab: HTMLButtonElement, nextPanel: HTMLElement) => {
      tabs.forEach((tab) => {
        const active = tab === nextTab;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => {
        const active = panel === nextPanel;
        panel.classList.toggle('is-active', active);
        panel.setAttribute('aria-hidden', String(!active));
        panel.toggleAttribute('inert', !active);
      });

      const activeIndex = tabs.indexOf(nextTab) + 1;
      if (counter)
        counter.textContent = `${String(activeIndex).padStart(2, '0')} — ${String(tabs.length).padStart(2, '0')}`;
    };

    const play = async (
      panel: HTMLElement,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) => {
      const animation = panel.animate(keyframes, options);

      try {
        await animation.finished;
      } catch {
        // A superseded browser animation can settle through cancellation.
      } finally {
        animation.cancel();
      }
    };

    const runTransition = async (requestedTab: HTMLButtonElement, shouldFocus = false) => {
      const requestedTarget = requestedTab.dataset.capabilityTab;
      if (!requestedTarget) return;

      if (isTransitioning) {
        queuedRequest = { tab: requestedTab, shouldFocus };
        return;
      }

      const previousPanel = panels.find((panel) => panel.classList.contains('is-active'));
      const previousTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
      if (!previousPanel || !previousTab || previousTab === requestedTab) return;

      isTransitioning = true;
      let nextTab = requestedTab;
      let focusAfterTransition = shouldFocus;
      const previousIndex = tabs.indexOf(previousTab);
      let nextIndex = tabs.indexOf(nextTab);
      const exitDirection = nextIndex >= previousIndex ? -1 : 1;

      await play(
        previousPanel,
        [
          { opacity: 1, transform: 'translateX(0)' },
          { opacity: 0, transform: `translateX(${exitDirection * 34}px)` },
        ],
        { duration: 125, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'both' },
      );

      const requestAfterExit = takeQueuedRequest();
      if (requestAfterExit) {
        nextTab = requestAfterExit.tab;
        focusAfterTransition = requestAfterExit.shouldFocus;
        nextIndex = tabs.indexOf(nextTab);
      }

      const target = nextTab.dataset.capabilityTab;
      const nextPanel = panels.find((panel) => panel.dataset.capabilityPanel === target);
      if (!nextPanel) {
        isTransitioning = false;
        return;
      }

      commitSelection(nextTab, nextPanel);
      if (focusAfterTransition) nextTab.focus();

      const enterDirection = nextIndex >= previousIndex ? 1 : -1;
      await play(
        nextPanel,
        [
          { opacity: 0, transform: `translateX(${enterDirection * 34}px)` },
          { opacity: 1, transform: 'translateX(0)' },
        ],
        { duration: 175, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' },
      );

      isTransitioning = false;

      const pendingRequest = takeQueuedRequest();
      if (pendingRequest) {
        void runTransition(pendingRequest.tab, pendingRequest.shouldFocus);
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => void runTransition(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key))
          return;
        event.preventDefault();

        let nextIndex = index;
        if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
          nextIndex = (index + 1) % tabs.length;
        else nextIndex = (index - 1 + tabs.length) % tabs.length;

        void runTransition(tabs[nextIndex], true);
      });
    });
  });

}
