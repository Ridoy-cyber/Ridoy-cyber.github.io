import { projectDetails } from './data.js';

const menuOverlay = document.querySelector('.menu-overlay');
const menuToggle = document.querySelector('.menu-toggle');
const sectionChip = document.getElementById('sectionChip');
const topicMap = {
  intro: { index: '00', title: 'Intro' },
  'work-1': { index: '01', title: 'UI/UX Design' },
  'work-2': { index: '02', title: 'Web Design' },
  'work-3': { index: '03', title: 'Projects' },
  'also-built': { index: '04', title: 'Skills & education' },
  story: { index: '05', title: 'Experience' },
  approach: { index: '06', title: 'Approach' },
  contact: { index: '07', title: 'Contact' }
};

const setMenuState = (isOpen) => {
  menuOverlay.classList.toggle('is-open', isOpen);
  menuOverlay.setAttribute('aria-hidden', String(!isOpen));
  menuOverlay.inert = !isOpen;
  menuToggle.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    menuOverlay.querySelector('.menu-close').focus();
  } else if (menuOverlay.contains(document.activeElement)) {
    menuToggle.focus();
  }
};

menuToggle.addEventListener('click', () => {
  const isOpen = !menuOverlay.classList.contains('is-open');
  setMenuState(isOpen);
});

document.querySelector('.menu-close').addEventListener('click', () => setMenuState(false));
menuOverlay.addEventListener('click', (event) => {
  if (event.target === menuOverlay) setMenuState(false);
});

document.querySelectorAll('.menu-overlay__list a').forEach((link) => {
  link.addEventListener('click', () => setMenuState(false));
});

const updateSectionChip = (id) => {
  const info = topicMap[id] || { index: '00', title: 'Intro' };
  sectionChip.querySelector('.section-chip__index').textContent = info.index;
  sectionChip.querySelector('.section-chip__title').textContent = info.title;
};

const sheets = [...document.querySelectorAll('.sheet')];
const tabs = [...document.querySelectorAll('.tab')];
const tabStartIndexes = tabs.map((tab) => sheets.findIndex((sheet) => `#${sheet.id}` === tab.dataset.target));
let sectionStarts = [];
let activeSheetId;
let activeTabIndex = -1;
let sectionChipHideTimer;
let activeSectionFrame = 0;

const measureSectionStarts = () => {
  sheets.forEach((sheet) => {
    sheet.classList.toggle('is-tall', sheet.offsetHeight > window.innerHeight + 24);
  });

  const starts = [0];
  for (let index = 1; index < sheets.length; index += 1) {
    const marginTop = parseFloat(window.getComputedStyle(sheets[index]).marginTop) || 0;
    starts[index] = starts[index - 1] + sheets[index - 1].offsetHeight + marginTop;
  }
  sectionStarts = starts;
};

const updatePageTurn = (scrollY) => {
  const viewportHeight = Math.max(1, window.innerHeight);
  sheets.forEach((sheet, index) => {
    const progress = index === 0
      ? 1
      : Math.min(1, Math.max(0, (scrollY - (sectionStarts[index] - viewportHeight)) / viewportHeight));
    const isTurning = progress > 0 && progress < 1;
    sheet.classList.toggle('is-turning', isTurning);

    if (isTurning) {
      const turnRadius = `${(progress * 145).toFixed(2)}%`;
      if (sheet.style.getPropertyValue('--turn-radius') !== turnRadius) {
        sheet.style.setProperty('--turn-radius', turnRadius);
      }
    } else {
      sheet.style.removeProperty('--turn-radius');
    }
  });
};

const updateActiveSection = () => {
  const scrollY = window.scrollY;
  const activationLine = window.innerHeight / 2;
  updatePageTurn(scrollY);
  let activeIndex = 0;

  for (let index = 1; index < sectionStarts.length; index += 1) {
    if (sectionStarts[index] > scrollY + activationLine) break;
    activeIndex = index;
  }

  const activeSheet = sheets[activeIndex];
  if (!activeSheet) return;

  const id = activeSheet.id || 'intro';
  let tabIndex = 0;
  for (let index = 1; index < tabStartIndexes.length; index += 1) {
    if (tabStartIndexes[index] > activeIndex) break;
    tabIndex = index;
  }
  const sectionStartIndex = tabStartIndexes[tabIndex];
  const sectionStart = sectionStartIndex === 0
    ? 0
    : Math.max(0, sectionStarts[sectionStartIndex] - activationLine);
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const nextStart = tabIndex < tabStartIndexes.length - 1
    ? Math.max(sectionStart, sectionStarts[tabStartIndexes[tabIndex + 1]] - activationLine)
    : Math.max(sectionStart, maxScroll);
  const progress = nextStart > sectionStart
    ? Math.min(1, Math.max(0, (scrollY - sectionStart) / (nextStart - sectionStart)))
    : 1;
  const sectionChanged = id !== activeSheetId;
  const tabChanged = tabIndex !== activeTabIndex;

  tabs.forEach((tab, index) => {
    const isActive = index === tabIndex;
    if (tabChanged) {
      tab.classList.toggle('is-active', isActive);
      if (isActive) {
        tab.setAttribute('aria-current', 'location');
      } else {
        tab.removeAttribute('aria-current');
      }
    }
    const progressValue = `${isActive ? (progress * 100).toFixed(2) : '0'}%`;
    if (tab.style.getPropertyValue('--progress') !== progressValue) {
      tab.style.setProperty('--progress', progressValue);
    }
  });

  activeTabIndex = tabIndex;
  if (!sectionChanged) return;
  activeSheetId = id;
  updateSectionChip(id);
  sectionChip.classList.add('is-visible');
  clearTimeout(sectionChipHideTimer);
  sectionChipHideTimer = setTimeout(() => sectionChip.classList.remove('is-visible'), 800);
};

const scheduleActiveSectionUpdate = () => {
  if (activeSectionFrame) return;
  activeSectionFrame = requestAnimationFrame(() => {
    activeSectionFrame = 0;
    updateActiveSection();
  });
};

const handleLayoutChange = () => {
  measureSectionStarts();
  scheduleActiveSectionUpdate();
};

measureSectionStarts();
const observer = new IntersectionObserver(scheduleActiveSectionUpdate, { threshold: [0, 0.3, 0.7] });
sheets.forEach((sheet) => observer.observe(sheet));
window.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true });
window.addEventListener('resize', handleLayoutChange);
window.addEventListener('load', handleLayoutChange);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(handleLayoutChange);
}
updateActiveSection();

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.target;
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalScreenMain = modal.querySelector('.modal__screen--main');
const modalScreenSide = modal.querySelector('.modal__screen--side');
const modalClose = modal.querySelector('.modal__close');
let modalTrigger = null;

const closeProjectModal = () => {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  modalTrigger?.focus();
};

document.querySelectorAll('.project-visual').forEach((card) => {
  card.querySelector('.view-button').addEventListener('click', (event) => {
    const key = card.dataset.project;
    const meta = projectDetails[key];
    if (!meta) return;
    modalTrigger = event.currentTarget;
    modalTitle.textContent = meta.title;
    modalText.textContent = meta.text;
    modalScreenMain.style.background = meta.bg;
    modalScreenSide.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(18,16,14,0.12))';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modalClose.focus();
  });
});

modal.addEventListener('click', (event) => {
  if (event.target.dataset.close === 'true' || event.target === modalClose) closeProjectModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (modal.classList.contains('is-open')) closeProjectModal();
    if (menuOverlay.classList.contains('is-open')) {
      setMenuState(false);
      menuToggle.focus();
    }
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const surname = document.querySelector('.surname');
if (surname && !reducedMotion.matches) {
  const text = surname.textContent.trim();
  const chars = [...text].map((char, index) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.display = 'inline-block';
    span.style.transform = `translateY(${30 + index * 10}px)`;
    span.style.opacity = '0';
    span.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
    return span;
  });

  surname.textContent = '';
  chars.forEach((span) => surname.appendChild(span));

  requestAnimationFrame(() => {
    chars.forEach((span, index) => {
      setTimeout(() => {
        span.style.transform = 'translateY(0)';
        span.style.opacity = '1';
      }, index * 40);
    });
  });
}

const portrait = document.querySelector('.portrait-surface');
if (portrait) {
  let pointerX = 0;
  let pointerY = 0;
  const move = (event) => {
    const rect = portrait.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    portrait.style.transform = `translate(${pointerX * 0.4}px, ${pointerY * 0.4}px)`;
    portrait.style.setProperty('--light-x', `${event.clientX - rect.left}px`);
    portrait.style.setProperty('--light-y', `${event.clientY - rect.top}px`);
  };

  portrait.addEventListener('pointermove', move);
  portrait.addEventListener('pointerleave', () => {
    portrait.style.transform = 'translate(0, 0)';
  });
}

window.addEventListener('load', () => {
  updateSectionChip('intro');
  sectionChip.classList.add('is-visible');
  setTimeout(() => sectionChip.classList.remove('is-visible'), 800);
});

const uiCardStack = document.querySelector('.project-visual[data-project="ui-ux-design"] .card-stack');
if (uiCardStack) {
  const uiCards = [...uiCardStack.querySelectorAll('.card-stack__card')];
  const uiPills = [...uiCardStack.querySelectorAll('.card-stack__pill')];
  const uiViewport = uiCardStack.querySelector('.card-stack__viewport');
  const uiStyles = getComputedStyle(uiCardStack);
  const uiDuration = (name, fallback) => parseFloat(uiStyles.getPropertyValue(name)) || fallback;
  const uiPhaseDurations = [
    uiDuration('--stack-idle-duration', 2000),
    uiDuration('--stack-transition-duration', 1000),
    uiDuration('--stack-pan-duration', 2500),
    uiDuration('--stack-reset-duration', 500)
  ];
  const uiPauseReasons = new Set();
  let uiActiveIndex = 0;
  let uiPhase = 0;
  let uiTimer = 0;
  let uiPhaseStarted = 0;
  let uiPhaseRemaining = uiPhaseDurations[0];
  let uiDragStart = null;

  const updateUiSlides = () => {
    uiCards.forEach((card, index) => {
      const order = (index - uiActiveIndex + uiCards.length) % uiCards.length;
      card.classList.remove('is-front', 'is-back-1', 'is-back-2', 'is-back-3');
      card.classList.add(order === 0 ? 'is-front' : `is-back-${order}`);
      card.setAttribute('aria-hidden', String(order !== 0));
      card.setAttribute('aria-label', `${index + 1} of ${uiCards.length}`);
    });
    uiPills.forEach((pill, index) => {
      if (index === uiActiveIndex) pill.setAttribute('aria-current', 'true');
      else pill.removeAttribute('aria-current');
    });
  };

  const scheduleUiPhase = () => {
    if (reducedMotion.matches || uiPauseReasons.size) return;
    uiPhaseStarted = performance.now();
    uiTimer = window.setTimeout(advanceUiPhase, uiPhaseRemaining);
  };

  const advanceUiPhase = () => {
    uiTimer = 0;
    uiPhase = (uiPhase + 1) % uiPhaseDurations.length;
    if (uiPhase === 0) {
      uiCardStack.classList.remove('is-transitioning', 'is-panning', 'is-resetting');
    } else if (uiPhase === 1) {
      uiCardStack.classList.add('is-transitioning');
    } else if (uiPhase === 2) {
      uiCardStack.classList.add('is-panning');
    } else {
      uiActiveIndex = (uiActiveIndex + 1) % uiCards.length;
      uiCardStack.classList.remove('is-transitioning', 'is-panning');
      uiCardStack.classList.add('is-resetting');
      updateUiSlides();
    }
    uiPhaseRemaining = uiPhaseDurations[uiPhase];
    scheduleUiPhase();
  };

  const selectUiSlide = (index) => {
    window.clearTimeout(uiTimer);
    uiTimer = 0;
    uiActiveIndex = (index + uiCards.length) % uiCards.length;
    uiPhase = uiPhaseDurations.length - 1;
    uiPhaseRemaining = uiPhaseDurations[uiPhase];
    uiCardStack.classList.remove('is-transitioning', 'is-panning');
    uiCardStack.classList.add('is-resetting');
    updateUiSlides();
    if (reducedMotion.matches) {
      window.setTimeout(() => uiCardStack.classList.remove('is-resetting'), 150);
    } else {
      scheduleUiPhase();
    }
  };

  const pauseUiCycle = (reason) => {
    if (uiPauseReasons.has(reason)) return;
    uiPauseReasons.add(reason);
    if (!uiTimer) return;
    window.clearTimeout(uiTimer);
    uiTimer = 0;
    uiPhaseRemaining = Math.max(0, uiPhaseRemaining - (performance.now() - uiPhaseStarted));
  };

  const resumeUiCycle = (reason) => {
    uiPauseReasons.delete(reason);
    if (!uiPauseReasons.size && !uiTimer) scheduleUiPhase();
  };

  uiPills.forEach((pill, index) => pill.addEventListener('click', () => selectUiSlide(index)));
  uiCardStack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      selectUiSlide(uiActiveIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  uiCardStack.addEventListener('pointerenter', () => pauseUiCycle('pointer'));
  uiCardStack.addEventListener('pointerleave', () => resumeUiCycle('pointer'));
  uiCardStack.addEventListener('focusin', () => pauseUiCycle('focus'));
  uiCardStack.addEventListener('focusout', (event) => {
    if (!uiCardStack.contains(event.relatedTarget)) resumeUiCycle('focus');
  });
  uiViewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    uiDragStart = event.clientX;
    uiViewport.setPointerCapture(event.pointerId);
    uiCardStack.classList.add('is-dragging');
  });
  uiViewport.addEventListener('pointerup', (event) => {
    if (uiDragStart === null) return;
    const distance = event.clientX - uiDragStart;
    uiDragStart = null;
    uiCardStack.classList.remove('is-dragging');
    if (Math.abs(distance) > 40) selectUiSlide(uiActiveIndex + (distance < 0 ? 1 : -1));
  });
  uiViewport.addEventListener('pointercancel', () => {
    uiDragStart = null;
    uiCardStack.classList.remove('is-dragging');
  });

  updateUiSlides();
  scheduleUiPhase();
}
