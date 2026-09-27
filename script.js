const cinematicIntro = document.querySelector('#cinematic-intro');
if (cinematicIntro) {
  const introContent = document.querySelectorAll('.site-header, main, .footer');
  const introReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finishIntro = () => {
    if (!cinematicIntro.isConnected) return;
    window.clearTimeout(introFallback);
    cinematicIntro.remove();
    document.body.classList.remove('intro-active');
    document.documentElement.classList.remove('intro-running');
    introContent.forEach((element) => {
      element.inert = false;
      element.removeAttribute('aria-hidden');
    });
  };
  let introFallback;

  document.body.classList.add('intro-active');
  document.documentElement.classList.add('intro-running');
  introContent.forEach((element) => {
    element.inert = true;
    element.setAttribute('aria-hidden', 'true');
  });

  if (introReducedMotion.matches) {
    cinematicIntro.classList.add('is-reduced');
    introFallback = window.setTimeout(finishIntro, 420);
  } else {
    cinematicIntro.classList.add('is-playing');
    introFallback = window.setTimeout(finishIntro, 3900);
    cinematicIntro.addEventListener('animationend', (event) => {
      if (event.target === cinematicIntro && event.animationName === 'intro-exit') finishIntro();
    });
  }
}

// Set this only after the official event date and time are confirmed.
const EVENT_DATE = null;

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileNavigation = window.matchMedia('(max-width: 650px)');

function closeMobileNavigation({ restoreFocus = false } = {}) {
  nav.classList.remove('open');
  nav.inert = mobileNavigation.matches;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  if (restoreFocus) menuButton.focus();
}

function syncNavigationMode() {
  if (mobileNavigation.matches) {
    if (menuButton.getAttribute('aria-expanded') !== 'true') nav.inert = true;
  } else {
    nav.classList.remove('open');
    nav.inert = false;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
}

syncNavigationMode();
mobileNavigation.addEventListener('change', syncNavigationMode);

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 24);
}

let headerFrame = 0;
window.addEventListener('scroll', () => {
  if (!headerFrame) {
    headerFrame = window.requestAnimationFrame(() => {
      updateHeader();
      headerFrame = 0;
    });
  }
}, { passive: true });
updateHeader();

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('open', !isOpen);
  nav.inert = isOpen;
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => closeMobileNavigation());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMobileNavigation({ restoreFocus: true });
  }
});

document.addEventListener('pointerdown', (event) => {
  if (mobileNavigation.matches && menuButton.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) {
    closeMobileNavigation();
  }
}, { passive: true });

const revealElements = document.querySelectorAll('.reveal');
if (reduceMotion.matches || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
  revealElements.forEach((element) => revealObserver.observe(element));
}

const countdownNodes = {
  days: document.querySelector('#days'),
  hours: document.querySelector('#hours'),
  minutes: document.querySelector('#minutes'),
  seconds: document.querySelector('#seconds'),
};

function updateCountdown() {
  const remaining = EVENT_DATE.getTime() - Date.now();
  if (remaining <= 0) {
    window.clearInterval(countdownTimer);
    Object.values(countdownNodes).forEach((node) => setCountdownValue(node, '00'));
    return;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  setCountdownValue(countdownNodes.days, String(Math.floor(totalSeconds / 86400)).padStart(2, '0'));
  setCountdownValue(countdownNodes.hours, String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0'));
  setCountdownValue(countdownNodes.minutes, String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'));
  setCountdownValue(countdownNodes.seconds, String(totalSeconds % 60).padStart(2, '0'));
}

function setCountdownValue(node, value) {
  if (node.textContent === value) return;
  node.textContent = value;
  if (!reduceMotion.matches && typeof node.animate === 'function') {
    node.animate(
      [{ opacity: 0.65, transform: 'translateY(2px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 180, easing: 'ease-out' },
    );
  }
}

if (EVENT_DATE instanceof Date && !Number.isNaN(EVENT_DATE.getTime())) {
  const countdownTimer = window.setInterval(updateCountdown, 1000);
  updateCountdown();
}

const registrationCta = document.querySelector('#registration-cta');
const registrationDialog = document.querySelector('#registration-dialog');
const registrationClose = registrationDialog?.querySelector('.registration-dialog__close');
const registrationForm = document.querySelector('#registration-form');
const registrationFormView = document.querySelector('#registration-form-view');
const registrationSuccess = document.querySelector('#registration-success');
const registrationSummary = document.querySelector('#form-error-summary');

if (registrationCta && registrationDialog && registrationClose && registrationForm && registrationFormView && registrationSuccess) {
  registrationCta.addEventListener('click', () => {
    registrationDialog.showModal();
    document.body.classList.add('registration-modal-open');
    window.requestAnimationFrame(() => registrationForm.elements.fullName.focus());
  });
  registrationClose.addEventListener('click', () => registrationDialog.close());
  registrationDialog.querySelector('.success-close').addEventListener('click', () => registrationDialog.close());
  registrationDialog.addEventListener('click', (event) => {
    if (event.target === registrationDialog) registrationDialog.close();
  });
  registrationDialog.addEventListener('close', () => {
    document.body.classList.remove('registration-modal-open');
    registrationForm.reset();
    registrationForm.querySelectorAll('[data-touched]').forEach((field) => delete field.dataset.touched);
    formHasSubmitted = false;
    registrationFormView.hidden = false;
    registrationSuccess.hidden = true;
    registrationSummary.textContent = '';
    registrationForm.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
    registrationForm.querySelectorAll('.field-error').forEach((message) => { message.textContent = ''; });
    registrationCta.focus({ preventScroll: true });
  });

  const fieldMessages = {
    fullName: 'Enter your name (at least 2 characters).',
    email: 'Enter a valid email address.',
    phone: 'Enter a phone number with 7–15 digits.',
    college: 'Enter your college or university.',
    year: 'Choose your year of study.',
    branch: 'Enter your branch or course.',
  };
  let formHasSubmitted = false;

  function validateField(field) {
    const value = field.value.trim();
    let message = '';
    if (field.name === 'fullName' && value.length < 2) message = fieldMessages.fullName;
    else if (field.name === 'email' && (!value || !field.validity.valid)) message = fieldMessages.email;
    else if (field.name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (!/^\+?[\d().\s-]+$/.test(value) || digits.length < 7 || digits.length > 15) message = fieldMessages.phone;
    } else if (['college', 'branch'].includes(field.name) && value.length < 2) message = fieldMessages[field.name];
    else if (field.name === 'year' && !value) message = fieldMessages.year;

    const error = document.querySelector(`#${field.id}-error`);
    if (error) error.textContent = message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    return message;
  }

  registrationForm.querySelectorAll('input, select').forEach((field) => {
    field.addEventListener('blur', () => {
      if (field.dataset.touched || formHasSubmitted) validateField(field);
    });
    field.addEventListener('input', () => {
      field.dataset.touched = 'true';
      if (field.hasAttribute('aria-invalid')) validateField(field);
      registrationSummary.textContent = '';
    });
    field.addEventListener('change', () => {
      field.dataset.touched = 'true';
      if (field.hasAttribute('aria-invalid')) validateField(field);
      registrationSummary.textContent = '';
    });
  });

  registrationForm.addEventListener('submit', (event) => {
    // Demonstration only: never transmit or persist registration details.
    event.preventDefault();
    formHasSubmitted = true;
    const fields = [...registrationForm.querySelectorAll('input[required], select[required]')];
    const invalidFields = fields.filter((field) => validateField(field));
    if (invalidFields.length) {
      registrationSummary.textContent = `CHECK YOUR FILE: ${invalidFields.length} ${invalidFields.length === 1 ? 'FIELD NEEDS' : 'FIELDS NEED'} ATTENTION.`;
      invalidFields[0].focus();
      return;
    }

    registrationFormView.hidden = true;
    registrationSuccess.hidden = false;
    registrationSuccess.focus();
  });
}

// A small pointer-led shift adds depth to the hero artwork on desktop only.
const hero = document.querySelector('.hero');
const canParallax = window.matchMedia('(hover: hover) and (pointer: fine)');
if (hero && canParallax.matches && !reduceMotion.matches) {
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  hero.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 6;
    if (!pointerFrame) {
      pointerFrame = window.requestAnimationFrame(() => {
        hero.style.setProperty('--hero-shift-x', `${pointerX.toFixed(1)}px`);
        hero.style.setProperty('--hero-shift-y', `${pointerY.toFixed(1)}px`);
        pointerFrame = 0;
      });
    }
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    hero.style.setProperty('--hero-shift-x', '0px');
    hero.style.setProperty('--hero-shift-y', '0px');
  }, { passive: true });
}
