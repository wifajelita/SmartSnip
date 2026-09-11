/**
 * SmartSnip — JSON-driven education game
 * Levels, i18n, achievements from /data/*.json
 */
(() => {
  const state = {
    level: 1, score: 0, safety: 100,
    selectedTool: null,
    hazardsLeft: 0, pruneNeeded: 0, pruned: 0,
    hazardsClean: false, levelComplete: false,
    hintsLeft: 0, usedHintThisLevel: false,
    mistakesThisLevel: 0,
    levelsWithoutHint: 0,
    lang: localStorage.getItem('ss-lang') || 'id',
    soundOn: localStorage.getItem('ss-sound') !== 'off',
    unlockedBadges: JSON.parse(localStorage.getItem('ss-badges') || '[]'),
    highestLevel: +(localStorage.getItem('ss-highest') || 0),
  };

  let LEVELS = [];
  let I18N = {};
  let ACHIEVEMENTS = [];
  let requiredTool = {};

  const $ = (s) => document.querySelector(s);
  const loading = $('#loading');
  const startScreen = $('#start-screen');
  const tutorialOverlay = $('#tutorial-overlay');
  const app = $('#app');
  const plantArea = $('#plant-area');
  const toolsEl = $('#tools');
  const toolHint = $('#tool-hint');
  const taskText = $('#task-text');
  const taskProgress = $('#task-progress');
  const levelNum = $('#level-num');
  const scoreEl = $('#score');
  const safetyFill = $('#safety-fill');
  const btnNext = $('#btn-next');
  const btnHint = $('#btn-hint');
  const eduModal = $('#edu-modal');
  const modalIcon = $('#modal-icon');
  const modalTitle = $('#modal-title');
  const modalBody = $('#modal-body');
  const completeOverlay = $('#complete-overlay');
  const badgesOverlay = $('#badges-overlay');

  // ---------- Load JSON ----------
  async function loadData() {
    try {
      const [levelsRes, i18nRes, achRes] = await Promise.all([
        fetch('data/levels.json'),
        fetch('data/i18n.json'),
        fetch('data/achievements.json'),
      ]);
      LEVELS = await levelsRes.json();
      I18N = await i18nRes.json();
      ACHIEVEMENTS = await achRes.json();
      requiredTool = I18N.id.requiredTool; // same for both langs
      loading.classList.remove('active');
      startScreen.classList.add('active');
      applyLanguage();
    } catch (err) {
      console.error(err);
      loading.querySelector('.loading-text').textContent = 'Gagal memuat data. Refresh halaman.';
    }
  }

  function t(key) {
    const lang = I18N[state.lang] || I18N.id;
    return lang[key] ?? key;
  }

  function tEdu(key) {
    return (I18N[state.lang] || I18N.id).edu[key];
  }

  // ---------- Sound ----------
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function playTone(freq, dur, type = 'sine', gain = 0.1, slide = null) {
    if (!state.soundOn) return;
    try {
      const ctx = ensureAudio();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slide) osc.frequency.linearRampToValueAtTime(slide, ctx.currentTime + dur);
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur + 0.02);
    } catch (e) {}
  }
  const sfx = {
    click: () => playTone(580, 0.05, 'sine', 0.07),
    select: () => playTone(460, 0.07, 'triangle', 0.09),
    success: () => { playTone(520, 0.09, 'sine', 0.09); setTimeout(() => playTone(700, 0.12, 'sine', 0.09), 70); },
    remove: () => { playTone(880, 0.04, 'sine', 0.05); setTimeout(() => playTone(1100, 0.06, 'triangle', 0.04), 30); },
    prune: () => playTone(170, 0.1, 'sawtooth', 0.06, 85),
    error: () => playTone(200, 0.16, 'square', 0.08, 130),
    complete: () => {
      playTone(523, 0.1, 'sine', 0.09);
      setTimeout(() => playTone(659, 0.1, 'sine', 0.09), 100);
      setTimeout(() => playTone(784, 0.18, 'sine', 0.1), 200);
    },
    badge: () => { playTone(660, 0.1, 'sine', 0.1); setTimeout(() => playTone(880, 0.15, 'sine', 0.1), 100); },
  };

  // ---------- UI helpers ----------
  function showToast(msg, type = '') {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.className = `toast show ${type}`;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 1900);
  }

  function openModal(data) {
    modalIcon.textContent = data.icon;
    modalTitle.textContent = data.title;
    modalBody.textContent = data.body;
    eduModal.classList.add('open');
    eduModal.setAttribute('aria-hidden', 'false');
    sfx.click();
  }
  function closeModal() {
    eduModal.classList.remove('open');
    eduModal.setAttribute('aria-hidden', 'true');
  }

  function applyLanguage() {
    if (!I18N[state.lang]) return;
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) el.innerHTML = val;
    });
    document.querySelectorAll('#btn-lang, #btn-lang-start').forEach((b) => (b.textContent = state.lang.toUpperCase()));
    document.querySelectorAll('#btn-sound, #btn-sound-start').forEach((b) => {
      b.textContent = state.soundOn ? '🔊' : '🔇';
      b.classList.toggle('muted', !state.soundOn);
    });
    // tutorial
    const tut = (I18N[state.lang] || I18N.id).tutorial;
    if (tut) {
      $('#tutorial-title').textContent = tut.title;
      const ol = $('#tutorial-steps');
      ol.innerHTML = tut.steps.map((s) => `<li>${s}</li>`).join('');
      $('#btn-tutorial-close').textContent = tut.btn;
    }
    if (state.level && LEVELS[state.level - 1]) {
      taskText.textContent = t('tasks')[state.level - 1];
    }
    updateToolHint();
  }

  function updateToolHint() {
    if (!state.selectedTool) {
      toolHint.textContent = t('toolHint');
      return;
    }
    const names = {
      hand: t('toolHand'), tweezers: t('toolTweezers'),
      gloves: t('toolGloves'), brush: t('toolBrush'), shears: t('toolShears'),
    };
    toolHint.textContent = t('toolHintActive').replace('{tool}', names[state.selectedTool] || state.selectedTool);
  }

  function updateUI() {
    levelNum.textContent = state.level;
    scoreEl.textContent = state.score;
    safetyFill.style.width = Math.max(0, state.safety) + '%';
    const lv = LEVELS[state.level - 1];
    if (!lv) return;
    const total = lv.hazards.length + lv.pruneCount;
    const done = (lv.hazards.length - state.hazardsLeft) + state.pruned;
    taskProgress.textContent = done + '/' + total;
    btnHint.textContent = `${t('btnHint')} (${state.hintsLeft})`;

    if (state.hazardsClean && state.pruned >= state.pruneNeeded) {
      state.levelComplete = true;
      btnNext.classList.remove('hidden');
      setTimeout(showComplete, 400);
    }
  }

  // ---------- Achievements ----------
  function unlockBadge(id) {
    if (state.unlockedBadges.includes(id)) return null;
    state.unlockedBadges.push(id);
    localStorage.setItem('ss-badges', JSON.stringify(state.unlockedBadges));
    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    if (ach) {
      sfx.badge();
      return ach;
    }
    return null;
  }

  function checkLevelBadges() {
    const earned = [];
    if (state.level === 1) {
      const b = unlockBadge('first_clear');
      if (b) earned.push(b);
    }
    if (state.mistakesThisLevel === 0) {
      const b = unlockBadge('zero_mistake');
      if (b) earned.push(b);
    }
    if (!state.usedHintThisLevel) {
      state.levelsWithoutHint++;
      if (state.levelsWithoutHint >= 3) {
        const b = unlockBadge('hint_saver');
        if (b) earned.push(b);
      }
    } else {
      state.levelsWithoutHint = 0;
    }
    if (state.level === 5) {
      const b = unlockBadge('perfect_prune');
      if (b) earned.push(b);
      const all = unlockBadge('all_done');
      if (all) earned.push(all);
      if (state.safety >= 80) {
        const sm = unlockBadge('safety_master');
        if (sm) earned.push(sm);
      }
    }
    return earned;
  }

  function showComplete() {
    sfx.complete();
    const lv = LEVELS[state.level - 1];
    $('#final-score').textContent = state.score;
    $('#final-safety').textContent = Math.max(0, state.safety) + '%';
    $('#complete-msg').textContent = state.safety >= 80 ? t('completeGood') : t('completeOk');
    $('#lesson-text').textContent = lv.lesson[state.lang] || lv.lesson.id;

    const earned = checkLevelBadges();
    const badgeBox = $('#badge-earned');
    if (earned.length) {
      badgeBox.classList.remove('hidden');
      badgeBox.innerHTML = earned.map((b) => `${b.icon} ${b.title[state.lang] || b.title.id}`).join('<br>');
    } else {
      badgeBox.classList.add('hidden');
    }

    if (state.level > state.highestLevel) {
      state.highestLevel = state.level;
      localStorage.setItem('ss-highest', state.highestLevel);
    }
    completeOverlay.classList.add('active');
  }

  // ---------- SVG Plant ----------
  function createPlantSVG(lv) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 280 320');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const ground = document.createElementNS(ns, 'ellipse');
    ground.setAttribute('cx', '140'); ground.setAttribute('cy', '295');
    ground.setAttribute('rx', '110'); ground.setAttribute('ry', '18');
    ground.setAttribute('fill', '#166534'); ground.setAttribute('opacity', '0.35');
    svg.appendChild(ground);

    const pot = document.createElementNS(ns, 'path');
    pot.setAttribute('d', 'M85 255 L95 295 Q140 305 185 295 L195 255 Z');
    pot.setAttribute('fill', '#B45309'); pot.setAttribute('stroke', '#92400E'); pot.setAttribute('stroke-width', '2');
    svg.appendChild(pot);
    const rim = document.createElementNS(ns, 'ellipse');
    rim.setAttribute('cx', '140'); rim.setAttribute('cy', '255');
    rim.setAttribute('rx', '58'); rim.setAttribute('ry', '10');
    rim.setAttribute('fill', '#D97706'); rim.setAttribute('stroke', '#92400E'); rim.setAttribute('stroke-width', '1.5');
    svg.appendChild(rim);

    const trunk = document.createElementNS(ns, 'path');
    trunk.setAttribute('d', 'M132 255 Q138 200 140 140');
    trunk.setAttribute('stroke', '#78350F'); trunk.setAttribute('stroke-width', '14');
    trunk.setAttribute('fill', 'none'); trunk.setAttribute('stroke-linecap', 'round');
    svg.appendChild(trunk);

    const branchDefs = [
      { d: 'M140 200 Q100 180 70 150', w: 7 },
      { d: 'M140 180 Q170 160 210 130', w: 6.5 },
      { d: 'M140 160 Q110 130 85 95', w: 6 },
      { d: 'M140 150 Q175 120 220 90', w: 5.5 },
      { d: 'M140 210 Q105 220 75 210', w: 6 },
      { d: 'M140 190 Q180 200 215 185', w: 5.5 },
      { d: 'M140 145 Q145 100 130 60', w: 7 },
      { d: 'M100 160 Q80 140 55 120', w: 5 },
    ];

    const brGroup = document.createElementNS(ns, 'g');
    branchDefs.forEach((b, i) => {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', b.d);
      path.setAttribute('stroke', '#166534');
      path.setAttribute('stroke-width', b.w);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.classList.add('branch');
      path.dataset.index = i;

      const nums = b.d.match(/-?\d+\.?\d*/g).map(Number);
      if (nums.length >= 6) {
        [[(nums[0]+nums[2])/2, (nums[1]+nums[3])/2], [(nums[2]+nums[4])/2, (nums[3]+nums[5])/2]].forEach(([lx, ly]) => {
          const leaf = document.createElementNS(ns, 'circle');
          leaf.setAttribute('cx', lx + (Math.random()*8-4));
          leaf.setAttribute('cy', ly + (Math.random()*6-3));
          leaf.setAttribute('r', 7 + Math.random()*4);
          leaf.setAttribute('fill', i % 2 ? '#16A34A' : '#22C55E');
          leaf.setAttribute('opacity', '0.9');
          leaf.style.pointerEvents = 'none';
          brGroup.appendChild(leaf);
        });
      }
      brGroup.appendChild(path);
    });
    svg.appendChild(brGroup);

    lv.highlightBranches.forEach((idx) => {
      const br = brGroup.querySelector(`[data-index="${idx}"]`);
      if (br) br.classList.add('highlight');
    });

    const hGroup = document.createElementNS(ns, 'g');
    lv.hazards.forEach((h, i) => {
      hGroup.appendChild(drawHazard(ns, h, i));
    });
    svg.appendChild(hGroup);
    return svg;
  }

  function drawHazard(ns, h, i) {
    const g = document.createElementNS(ns, 'g');
    g.classList.add('hazard');
    g.dataset.type = h.type;
    g.dataset.id = i;

    const s = h.size, x = h.x, y = h.y;
    if (h.type === 'glass') {
      const poly = document.createElementNS(ns, 'polygon');
      poly.setAttribute('points', `${x},${y-s} ${x+s*0.9},${y+s*0.4} ${x-s*0.7},${y+s*0.6}`);
      poly.setAttribute('fill', 'rgba(186,230,253,0.85)');
      poly.setAttribute('stroke', 'rgba(255,255,255,0.7)');
      poly.setAttribute('stroke-width', '1.2');
      poly.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      g.appendChild(poly);
    } else if (h.type === 'wood') {
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', x - s * 0.7); rect.setAttribute('y', y - s * 0.25);
      rect.setAttribute('width', s * 1.4); rect.setAttribute('height', s * 0.5);
      rect.setAttribute('rx', '2');
      rect.setAttribute('fill', '#A16207');
      rect.setAttribute('stroke', '#78350F');
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      g.appendChild(rect);
    } else if (h.type === 'thorn') {
      const poly = document.createElementNS(ns, 'polygon');
      poly.setAttribute('points', `${x},${y-s} ${x+s*0.35},${y+s*0.5} ${x-s*0.35},${y+s*0.5}`);
      poly.setAttribute('fill', '#4D7C0F');
      poly.setAttribute('stroke', '#365314');
      poly.setAttribute('stroke-width', '1');
      poly.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      g.appendChild(poly);
    } else if (h.type === 'mud') {
      const ellipse = document.createElementNS(ns, 'ellipse');
      ellipse.setAttribute('cx', x); ellipse.setAttribute('cy', y);
      ellipse.setAttribute('rx', s * 0.8); ellipse.setAttribute('ry', s * 0.55);
      ellipse.setAttribute('fill', '#78350F');
      ellipse.setAttribute('opacity', '0.85');
      ellipse.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      g.appendChild(ellipse);
    }
    return g;
  }

  // ---------- Tools & Interaction ----------
  function renderTools(toolList) {
    const icons = { hand: '🖐️', tweezers: '🔧', gloves: '🧤', brush: '🧹', shears: '✂️' };
    const labels = {
      hand: t('toolHand'), tweezers: t('toolTweezers'),
      gloves: t('toolGloves'), brush: t('toolBrush'), shears: t('toolShears'),
    };
    toolsEl.innerHTML = '';
    toolList.forEach((tool) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tool';
      btn.dataset.tool = tool;
      btn.innerHTML = `<span class="tool-icon" aria-hidden="true">${icons[tool]}</span><span class="tool-name">${labels[tool]}</span>`;
      btn.addEventListener('click', () => selectTool(tool));
      toolsEl.appendChild(btn);
    });
  }

  function selectTool(tool) {
    state.selectedTool = tool;
    toolsEl.querySelectorAll('.tool').forEach((b) => b.classList.toggle('active', b.dataset.tool === tool));
    updateToolHint();
    sfx.select();
  }

  function handleHazardClick(el) {
    if (state.levelComplete) return;
    const type = el.dataset.type;
    const need = requiredTool[type];

    if (!state.selectedTool) {
      showToast(t('toastSelect'));
      return;
    }

    if (state.selectedTool === need) {
      el.classList.add('removed');
      state.hazardsLeft--;
      state.score += 25;
      sfx.remove();
      showToast(t('toastRemove'), 'success');
      if (state.hazardsLeft <= 0) {
        state.hazardsClean = true;
        setTimeout(() => openModal(tEdu('successClean')), 300);
      }
      updateUI();
    } else {
      state.safety = Math.max(0, state.safety - 15);
      state.score = Math.max(0, state.score - 8);
      state.mistakesThisLevel++;
      sfx.error();
      updateUI();
      showToast(t('toastWrong'), 'danger');

      if (type === 'glass' && state.selectedTool === 'hand') openModal(tEdu('glassHand'));
      else if (type === 'thorn' && state.selectedTool === 'hand') openModal(tEdu('thornHand'));
      else if (type === 'mud' && state.selectedTool === 'hand') openModal(tEdu('mudHand'));
      else openModal(tEdu('wrongTool'));
    }
  }

  function handleBranchClick(br) {
    if (state.levelComplete) return;
    if (!state.hazardsClean) {
      sfx.error();
      openModal(tEdu('hazardFirst'));
      showToast(t('toastHazardFirst'), 'danger');
      return;
    }
    if (!br.classList.contains('highlight')) {
      showToast(t('toastNoPrune'));
      return;
    }
    if (state.selectedTool === 'shears') {
      br.classList.remove('highlight');
      br.classList.add('pruned');
      state.pruned++;
      state.score += 40;
      sfx.prune();
      showToast(t('toastPrune'), 'success');
      updateUI();
    } else {
      sfx.error();
      openModal(tEdu('wrongPrune'));
    }
  }

  function useHint() {
    if (state.hintsLeft <= 0) {
      showToast(t('toastNoHint'));
      return;
    }
    state.hintsLeft--;
    state.usedHintThisLevel = true;
    updateUI();

    // Highlight remaining hazards briefly
    const remaining = plantArea.querySelectorAll('.hazard:not(.removed)');
    remaining.forEach((el) => {
      el.classList.add('hint-pulse');
      setTimeout(() => el.classList.remove('hint-pulse'), 2000);
    });

    // Also auto-select correct tool if only one type left
    if (remaining.length) {
      const type = remaining[0].dataset.type;
      const need = requiredTool[type];
      if (need) selectTool(need);
    }
    showToast(t('toastHintUsed').replace('{n}', state.hintsLeft), 'success');
    sfx.click();
  }

  // ---------- Load Level ----------
  function loadLevel(id) {
    const lv = LEVELS[id - 1];
    if (!lv) return;

    state.level = id;
    state.hazardsLeft = lv.hazards.length;
    state.pruneNeeded = lv.pruneCount;
    state.pruned = 0;
    state.hazardsClean = false;
    state.levelComplete = false;
    state.selectedTool = null;
    state.hintsLeft = lv.hintLimit || 2;
    state.usedHintThisLevel = false;
    state.mistakesThisLevel = 0;

    taskText.textContent = t('tasks')[id - 1];
    btnNext.classList.add('hidden');
    completeOverlay.classList.remove('active');

    renderTools(lv.tools);
    updateToolHint();

    plantArea.innerHTML = '';
    const svg = createPlantSVG(lv);
    plantArea.appendChild(svg);

    svg.querySelectorAll('.hazard').forEach((el) => {
      el.addEventListener('click', (e) => { e.stopPropagation(); handleHazardClick(el); });
    });
    svg.querySelectorAll('.branch').forEach((br) => {
      br.addEventListener('click', (e) => { e.stopPropagation(); handleBranchClick(br); });
    });

    updateUI();
  }

  // ---------- Events ----------
  function toggleLang() {
    state.lang = state.lang === 'id' ? 'en' : 'id';
    localStorage.setItem('ss-lang', state.lang);
    applyLanguage();
    if (state.level) {
      renderTools(LEVELS[state.level - 1].tools);
      if (state.selectedTool) {
        toolsEl.querySelectorAll('.tool').forEach((b) => b.classList.toggle('active', b.dataset.tool === state.selectedTool));
      }
    }
    sfx.click();
  }
  function toggleSound() {
    state.soundOn = !state.soundOn;
    localStorage.setItem('ss-sound', state.soundOn ? 'on' : 'off');
    applyLanguage();
    if (state.soundOn) sfx.select();
  }

  function showTutorial() {
    tutorialOverlay.classList.add('active');
  }

  $('#btn-start').addEventListener('click', () => {
    ensureAudio();
    startScreen.classList.remove('active');
    app.classList.remove('hidden');
    loadLevel(1);
    sfx.success();
  });

  $('#btn-tutorial').addEventListener('click', () => {
    startScreen.classList.remove('active');
    showTutorial();
  });

  $('#btn-tutorial-close').addEventListener('click', () => {
    tutorialOverlay.classList.remove('active');
    app.classList.remove('hidden');
    ensureAudio();
    loadLevel(1);
    sfx.success();
  });

  $('#modal-close').addEventListener('click', closeModal);
  eduModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  $('#btn-hint').addEventListener('click', useHint);

  $('#btn-reset').addEventListener('click', () => {
    state.score = Math.max(0, state.score - 10);
    loadLevel(state.level);
    showToast(t('toastReset'));
    sfx.click();
  });

  $('#btn-next').addEventListener('click', () => {
    if (state.level < LEVELS.length) {
      loadLevel(state.level + 1);
      sfx.click();
    } else {
      // show all badges at the end
      renderBadgesList();
      completeOverlay.classList.remove('active');
      badgesOverlay.classList.add('active');
    }
  });

  $('#btn-continue').addEventListener('click', () => {
    completeOverlay.classList.remove('active');
    sfx.click();
  });

  $('#btn-badges-close').addEventListener('click', () => {
    badgesOverlay.classList.remove('active');
    // restart option or stay
    startScreen.classList.add('active');
    app.classList.add('hidden');
  });

  function renderBadgesList() {
    const list = $('#badges-list');
    list.innerHTML = ACHIEVEMENTS.map((a) => {
      const unlocked = state.unlockedBadges.includes(a.id);
      return `<div class="badge-item ${unlocked ? 'unlocked' : ''}">
        <span class="b-icon">${a.icon}</span>
        <div class="b-info">
          <div class="b-title">${a.title[state.lang] || a.title.id}</div>
          <div class="b-desc">${a.desc[state.lang] || a.desc.id}</div>
        </div>
      </div>`;
    }).join('');
  }

  $('#btn-lang').addEventListener('click', toggleLang);
  $('#btn-lang-start').addEventListener('click', toggleLang);
  $('#btn-sound').addEventListener('click', toggleSound);
  $('#btn-sound-start').addEventListener('click', toggleSound);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Start
  loadData();
})();
