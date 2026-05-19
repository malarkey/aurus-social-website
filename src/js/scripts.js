(() => {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  const authoredTheme = root.dataset.authoredTheme;
  const storageKey = "aurus-theme-preference";

  if (!toggle || !authoredTheme) {
    return;
  }

  const setToggleState = (isUsingAuthoredTheme) => {
    toggle.classList.toggle("is-active", !isUsingAuthoredTheme);
    toggle.setAttribute("aria-checked", isUsingAuthoredTheme ? "false" : "true");
  };

  const applyTheme = (nextTheme) => {
    if (nextTheme === authoredTheme) {
      root.setAttribute("data-theme", authoredTheme);
      setToggleState(true);
      return;
    }

    root.setAttribute("data-theme", nextTheme);
    setToggleState(false);
  };

  const savedTheme = window.localStorage.getItem(storageKey);
  const initialTheme = savedTheme === "high-contrast" ? "high-contrast" : authoredTheme;

  applyTheme(initialTheme);

  toggle.addEventListener("click", () => {
    const isUsingAuthoredTheme = root.getAttribute("data-theme") === authoredTheme;
    const nextTheme = isUsingAuthoredTheme ? "high-contrast" : authoredTheme;

    applyTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
  });
})();

(() => {
  const panelSvgs = document.querySelectorAll("svg.panel-animated");

  if (!panelSvgs.length) {
    return;
  }

  const panelAnimationSelector =
    "#panel-2-person path, .panel-3-building > *, .panel-3-line, .panel-4-building > *, #panel-dark-item path, #panel-dark-row path, #panel-light-figure path, #panel-light-person path";

  const getPanelPaths = (panelSvg) => {
    return panelSvg.querySelectorAll(panelAnimationSelector);
  };

  const resetPanelAnimations = (panelSvg) => {
    const animatedPaths = getPanelPaths(panelSvg);

    animatedPaths.forEach((animatedPath) => {
      animatedPath.style.animation = "none";
    });

    // Force reflow so animation restart is applied consistently.
    void panelSvg.getBoundingClientRect();

    animatedPaths.forEach((animatedPath) => {
      animatedPath.style.animation = "";
      animatedPath.style.animationPlayState = "paused";
    });
  };

  const startPanelAnimations = (panelSvg) => {
    const animatedPaths = getPanelPaths(panelSvg);

    animatedPaths.forEach((animatedPath) => {
      animatedPath.style.animationPlayState = "running";
    });
  };

  panelSvgs.forEach((panelSvg) => {
    resetPanelAnimations(panelSvg);
  });

  if (!("IntersectionObserver" in window)) {
    panelSvgs.forEach((panelSvg) => {
      startPanelAnimations(panelSvg);
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, intersectionObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        startPanelAnimations(entry.target);
        intersectionObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.2,
    },
  );

  panelSvgs.forEach((panelSvg) => {
    observer.observe(panelSvg);
  });
})();

(() => {
  const carousel = document.querySelector("#panels");

  if (!carousel) {
    return;
  }

  const panels = Array.from(carousel.querySelectorAll(":scope > .panel"));

  if (panels.length < 2) {
    return;
  }

  let activePanelIndex = 0;
  const customControls =
    carousel.previousElementSibling?.querySelector(".panels-naviagtion") || null;
  let controls = customControls;
  let dots = [];
  const daimlerPanel = carousel.querySelector("#panel-daimler");
  const daimlerBars = daimlerPanel
    ? Array.from(daimlerPanel.querySelectorAll("#svg-progress-bars rect"))
    : [];
  let daimlerBarLoopTimeout;
  let daimlerBarTimeouts = [];

  if (controls) {
    controls.setAttribute("aria-label", "Panels");

    dots = panels.map((panel, index) => {
      const panelId = panel.id || `home-panel-${index + 1}`;
      const dot = controls.children[index]?.querySelector("a, button");

      panel.id = panelId;

      if (!dot) {
        return null;
      }

      dot.setAttribute("aria-controls", panelId);
      dot.addEventListener("click", (event) => {
        event.preventDefault();
        setActivePanel(index, { updateHash: true });
      });

      return dot;
    });
  } else {
    controls = document.createElement("nav");
    controls.className = "panel-carousel-controls";
    controls.setAttribute("aria-label", "Panels");

    dots = panels.map((panel, index) => {
      const panelId = panel.id || `home-panel-${index + 1}`;
      const dot = document.createElement("button");

      panel.id = panelId;
      dot.className = "panel-carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-controls", panelId);
      dot.setAttribute("aria-label", `Show panel ${index + 1}`);
      dot.addEventListener("click", () => {
        setActivePanel(index);
      });

      controls.append(dot);
      return dot;
    });

    carousel.insertAdjacentElement("afterend", controls);
  }

  const getPanelIndexFromHash = () => {
    const hash = window.location.hash;

    if (!hash) {
      return -1;
    }

    return panels.findIndex((panel) => `#${panel.id}` === hash);
  };

  const syncHashToActivePanel = () => {
    const activePanel = panels[activePanelIndex];

    if (!activePanel || !activePanel.id || !customControls) {
      return;
    }

    window.history.replaceState(null, "", `#${activePanel.id}`);
  };

  const parseTimeValue = (value, fallback = 0) => {
    if (!value) {
      return fallback;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.endsWith("ms")) {
      return Number.parseFloat(trimmedValue) || fallback;
    }

    if (trimmedValue.endsWith("s")) {
      return (Number.parseFloat(trimmedValue) || 0) * 1000;
    }

    return fallback;
  };

  const clearDaimlerBarLoop = () => {
    if (daimlerBarLoopTimeout) {
      window.clearTimeout(daimlerBarLoopTimeout);
      daimlerBarLoopTimeout = undefined;
    }

    daimlerBarTimeouts.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });

    daimlerBarTimeouts = [];
  };

  const resetDaimlerBars = () => {
    if (!daimlerBars.length) {
      return;
    }

    daimlerBars.forEach((bar) => {
      bar.classList.remove("is-visible");
    });
  };

  const runDaimlerBarLoop = () => {
    if (!daimlerPanel || !daimlerBars.length || !daimlerPanel.classList.contains("is-active")) {
      return;
    }

    clearDaimlerBarLoop();
    resetDaimlerBars();

    const daimlerStyles = window.getComputedStyle(daimlerPanel);
    const barFadeDuration = parseTimeValue(
      daimlerStyles.getPropertyValue("--daimler-bar-fade-duration"),
      450,
    );
    const barHoldDuration = parseTimeValue(
      daimlerStyles.getPropertyValue("--daimler-bar-hold-duration"),
      3000,
    );
    const barStep = parseTimeValue(
      daimlerStyles.getPropertyValue("--daimler-bar-step"),
      540,
    );
    const buildOrder = [...daimlerBars].reverse();
    const hideOrder = [...daimlerBars];

    buildOrder.forEach((bar, index) => {
      const timeoutId = window.setTimeout(() => {
        bar.classList.add("is-visible");
      }, index * barStep);

      daimlerBarTimeouts.push(timeoutId);
    });

    const buildEndAt = ((buildOrder.length - 1) * barStep) + barFadeDuration;
    const hideStartAt = buildEndAt + barHoldDuration;

    hideOrder.forEach((bar, index) => {
      const timeoutId = window.setTimeout(() => {
        bar.classList.remove("is-visible");
      }, hideStartAt + (index * barStep));

      daimlerBarTimeouts.push(timeoutId);
    });

    const cycleDuration = hideStartAt + ((hideOrder.length - 1) * barStep) + barFadeDuration;

    daimlerBarLoopTimeout = window.setTimeout(() => {
      runDaimlerBarLoop();
    }, cycleDuration);
  };

  function setActivePanel(nextIndex, options = {}) {
    const { updateHash = false } = options;
    const normalizedIndex = (nextIndex + panels.length) % panels.length;

    activePanelIndex = normalizedIndex;

    panels.forEach((panel, index) => {
      const isActive = index === activePanelIndex;

      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    dots.forEach((dot, index) => {
      if (!dot) {
        return;
      }

      const isActive = index === activePanelIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    if (updateHash) {
      syncHashToActivePanel();
    }

    if (daimlerPanel) {
      if (panels[activePanelIndex] === daimlerPanel) {
        runDaimlerBarLoop();
      } else {
        clearDaimlerBarLoop();
        resetDaimlerBars();
      }
    }
  }

  window.addEventListener("hashchange", () => {
    const hashIndex = getPanelIndexFromHash();

    if (hashIndex === -1) {
      return;
    }

    setActivePanel(hashIndex);
  });

  const initialHashIndex = getPanelIndexFromHash();

  if (initialHashIndex !== -1) {
    setActivePanel(initialHashIndex);
    return;
  }

  setActivePanel(0);
})();
