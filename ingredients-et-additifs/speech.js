(() => {
  'use strict';

  const synth = window.speechSynthesis;
  const supported = !!(synth && window.SpeechSynthesisUtterance);
  let activeButton = null;
  let activeUtterance = null;
  let frenchVoice = null;

  function chooseFrenchVoice() {
    if (!supported) return null;
    const voices = synth.getVoices ? synth.getVoices() : [];
    frenchVoice =
      voices.find(v => /^fr-FR$/i.test(v.lang)) ||
      voices.find(v => /^fr/i.test(v.lang)) ||
      voices.find(v => /fran[cç]ais|french/i.test(v.name)) ||
      null;
    return frenchVoice;
  }

  if (supported) {
    chooseFrenchVoice();
    if ('onvoiceschanged' in synth) {
      synth.addEventListener?.('voiceschanged', chooseFrenchVoice);
      synth.onvoiceschanged = chooseFrenchVoice;
    }
  }

  function cleanText(text) {
    return String(text || '')
      .replace(/\s+/g, ' ')
      .replace(/…/g, ' mot à compléter ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .trim();
  }

  function readableText(element) {
    if (!element) return '';
    const clone = element.cloneNode(true);
    clone.querySelectorAll(
      '.tts-button,.tts-inline,[aria-hidden="true"],.bin-count,.stage-tab__status,' +
      '.legend-dot,.sort-bin__title>span:first-child,.ingredient-dossier__head>span:first-child'
    ).forEach(el => el.remove());

    clone.querySelectorAll('.cloze-slot').forEach(slot => {
      const value = cleanText(slot.textContent);
      slot.textContent = (!value || value === 'mot à compléter')
        ? ' mot à compléter '
        : ` ${value} `;
    });

    return cleanText(clone.textContent);
  }

  function resetActiveVisual() {
    if (activeButton) {
      activeButton.classList.remove('is-speaking');
      activeButton.setAttribute('aria-label', 'Lire ce texte');
      activeButton.setAttribute('title', 'Lire ce texte');
    }
    activeButton = null;
    activeUtterance = null;
  }

  function stopSpeech() {
    if (!supported) return;
    synth.cancel();
    resetActiveVisual();
  }

  function speak(text, button) {
    if (!supported) return;

    // Deuxième clic sur le même pictogramme : arrêt.
    if (activeButton === button && button.classList.contains('is-speaking')) {
      stopSpeech();
      return;
    }

    // Une nouvelle lecture coupe toujours la précédente.
    stopSpeech();

    const cleaned = cleanText(typeof text === 'function' ? text() : text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = frenchVoice || chooseFrenchVoice();
    if (voice) utterance.voice = voice;

    activeButton = button;
    activeUtterance = utterance;
    button.classList.add('is-speaking');
    button.setAttribute('aria-label', 'Arrêter la lecture');
    button.setAttribute('title', 'Arrêter la lecture');

    const finish = () => {
      if (activeUtterance === utterance) resetActiveVisual();
    };
    utterance.onend = finish;
    utterance.onerror = finish;

    synth.speak(utterance);
  }

  function wireSpeaker(button, getText) {
    if (!supported) {
      button.classList.add('is-unavailable');
      button.setAttribute('aria-label', 'Lecture vocale non disponible');
      button.setAttribute('title', 'Lecture vocale non disponible');
      return button;
    }

    const activate = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      speak(getText, button);
    };

    button.addEventListener('click', activate);
    button.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') activate(ev);
    });
    return button;
  }

  function makeBlockSpeaker(host, customText = null) {
    if (!host || host.dataset.ttsBlock === '1') return;
    host.dataset.ttsBlock = '1';
    host.classList.add('tts-host');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tts-button';
    button.textContent = '🔊';
    button.setAttribute('aria-label', 'Lire ce texte');
    button.setAttribute('title', 'Lire ce texte');

    wireSpeaker(button, () =>
      cleanText(typeof customText === 'function'
        ? customText()
        : (customText || readableText(host)))
    );

    host.appendChild(button);
  }

  function makeInlineSpeaker(host, customText = null) {
    if (!host || host.dataset.ttsInline === '1') return;
    host.dataset.ttsInline = '1';
    host.classList.add('tts-inline-host');

    const speaker = document.createElement('span');
    speaker.className = 'tts-inline';
    speaker.textContent = '🔊';
    speaker.setAttribute('role', 'button');
    speaker.setAttribute('tabindex', '0');
    speaker.setAttribute('aria-label', 'Lire ce texte');
    speaker.setAttribute('title', 'Lire ce texte');

    wireSpeaker(speaker, () =>
      cleanText(typeof customText === 'function'
        ? customText()
        : (customText || readableText(host)))
    );

    host.appendChild(speaker);
  }

  function enhanceStaticText() {
    // Présentation et règle générale.
    makeBlockSpeaker(document.querySelector('.hero__copy'));
    makeBlockSpeaker(document.querySelector('.rule-card'));

    // Consignes de chaque étape.
    document.querySelectorAll('.stage-heading > div:first-child')
      .forEach(el => makeBlockSpeaker(el));

    // Documents, rappels et conseils utiles.
    document.querySelectorAll('.source-card,.trace-help,.investigation-tip')
      .forEach(el => makeBlockSpeaker(el));

    // Les trois définitions de l'étape 1.
    document.querySelectorAll('.legend-grid > div')
      .forEach(el => makeBlockSpeaker(el));

    // Chaque zone de classement.
    document.querySelectorAll('.sort-bin')
      .forEach(el => makeBlockSpeaker(el));

    // Dossiers d'ingrédients de l'étape 3.
    document.querySelectorAll('.ingredient-dossier')
      .forEach(el => makeBlockSpeaker(el));

    // La trace écrite entière est lisible à tout moment, avec les mots déjà placés.
    const cloze = document.querySelector('.cloze-text');
    if (cloze) makeBlockSpeaker(cloze, () => readableText(cloze));

    // Carte finale.
    makeBlockSpeaker(document.querySelector('.final-card'));
  }

  function enhanceDynamicText() {
    // Étape 1 : chaque ingrédient peut être lu séparément.
    document.querySelectorAll('.ingredient-chip')
      .forEach(el => makeInlineSpeaker(el));

    // Étape 2 : chaque situation + chaque proposition.
    document.querySelectorAll('.lab-card__head')
      .forEach(el => makeBlockSpeaker(
        el,
        () => cleanText(el.querySelector('strong')?.textContent || readableText(el))
      ));
    document.querySelectorAll('.lab-option')
      .forEach(el => makeInlineSpeaker(el));

    // Étape 3 : chaque question + chaque proposition.
    document.querySelectorAll('.inspection-card__head')
      .forEach(el => makeBlockSpeaker(
        el,
        () => cleanText(el.querySelector('strong')?.textContent || readableText(el))
      ));
    document.querySelectorAll('.inspection-option')
      .forEach(el => makeInlineSpeaker(el));

    // Étape 4 : chaque mot de la banque.
    document.querySelectorAll('.cloze-word')
      .forEach(el => makeInlineSpeaker(el));

    // Messages de correction / validation.
    document.querySelectorAll('.feedback').forEach(el => {
      if (cleanText(el.textContent)) makeBlockSpeaker(el, () => readableText(el));
    });
  }

  function enhanceAll() {
    enhanceStaticText();
    enhanceDynamicText();
  }

  // Un haut-parleur sur chaque document-image de l'étape 1 :
  // il lit ce que l'élève doit identifier sans lui donner le classement.
  const figureReadings = new Map([
    ['Compote pommes-mangues',
      'Compote pommes-mangues. Ingrédients : purée et morceaux de mangues 50 pour cent, purée de pommes 49 virgule 8 pour cent, arôme naturel, antioxydant : acide ascorbique.'],
    ['Carottes râpées',
      'Carottes râpées assaisonnées. Ingrédients : carottes 81 pour cent, eau, huile d’olive, moutarde, vinaigre d’alcool, épices, jus d’orange concentré, sel, amidon transformé, épaississant : gomme xanthane, conservateur : sorbate de potassium.'],
    ['Sirop de menthe',
      'Sirop de menthe. Ingrédients : sucre, eau, colorants E 150 b et E 133, arôme naturel de menthe.']
  ]);

  document.querySelectorAll('.doc-grid figure').forEach(fig => {
    const caption = cleanText(fig.querySelector('figcaption')?.textContent);
    makeBlockSpeaker(fig, figureReadings.get(caption) || (() => readableText(fig)));
  });

  enhanceAll();

  // Les exercices sont reconstruits en JavaScript à chaque clic/reset :
  // on remet automatiquement les pictogrammes après chaque rendu.
  const observer = new MutationObserver(() => enhanceAll());
  observer.observe(document.body, {childList:true, subtree:true, characterData:true});

  // Changer d'étape arrête une lecture en cours.
  document.addEventListener('click', ev => {
    if (ev.target.closest('.stage-tab')) stopSpeech();
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSpeech();
  });
  window.addEventListener('pagehide', stopSpeech);
})();
