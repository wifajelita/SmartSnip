/**
 * SmartSnip — Education game
 * Loads data/*.json with embedded fallback so it never gets stuck on loading.
 */
(() => {
  // ---------- Embedded fallback (used if fetch fails) ----------
  const FALLBACK_LEVELS = [
    { id:1, shape:"neat", pruneCount:3, highlightBranches:[1,3,5], tools:["hand","tweezers","shears"],
      hazards:[{type:"glass",x:95,y:85,rot:-15,size:13},{type:"glass",x:175,y:110,rot:25,size:12},{type:"glass",x:130,y:155,rot:-30,size:11},{type:"glass",x:200,y:70,rot:10,size:12}],
      lesson:{id:"Jangan ambil pecahan kaca dengan tangan kosong. Selalu pakai penjepit.",en:"Never pick up glass shards with bare hands. Always use tweezers."} },
    { id:2, shape:"triangle", pruneCount:3, highlightBranches:[0,2,4], tools:["hand","tweezers","shears"],
      hazards:[{type:"wood",x:90,y:100,rot:20,size:14},{type:"wood",x:170,y:90,rot:-15,size:13},{type:"wood",x:125,y:160,rot:35,size:12},{type:"wood",x:195,y:140,rot:-25,size:11}],
      lesson:{id:"Potongan kayu kering biasanya aman diambil dengan tangan.",en:"Dry wood pieces are usually safe to pick up by hand."} },
    { id:3, shape:"round", pruneCount:3, highlightBranches:[1,3,6], tools:["hand","gloves","shears"],
      hazards:[{type:"thorn",x:100,y:80,rot:0,size:12},{type:"thorn",x:165,y:105,rot:40,size:11},{type:"thorn",x:120,y:150,rot:-20,size:13},{type:"thorn",x:190,y:75,rot:15,size:10},{type:"thorn",x:145,y:180,rot:-35,size:11}],
      lesson:{id:"Duri tanaman tajam. Pakai sarung tangan agar tangan terlindungi.",en:"Plant thorns are sharp. Wear gloves to protect your hands."} },
    { id:4, shape:"heart", pruneCount:3, highlightBranches:[2,4,5], tools:["hand","brush","shears"],
      hazards:[{type:"mud",x:88,y:95,rot:10,size:15},{type:"mud",x:160,y:85,rot:-20,size:14},{type:"mud",x:205,y:125,rot:30,size:13},{type:"mud",x:115,y:155,rot:-10,size:14}],
      lesson:{id:"Lumpur lebih efektif dibersihkan dengan sikat.",en:"Mud is more effectively cleaned with a brush."} },
    { id:5, shape:"oval", pruneCount:4, highlightBranches:[0,2,4,6], tools:["hand","tweezers","gloves","shears"],
      hazards:[{type:"glass",x:85,y:90,rot:-10,size:12},{type:"glass",x:195,y:80,rot:20,size:11},{type:"thorn",x:130,y:70,rot:15,size:11},{type:"thorn",x:160,y:150,rot:-25,size:12},{type:"glass",x:110,y:160,rot:5,size:10}],
      lesson:{id:"Saat ada beberapa jenis bahaya, pilih alat yang tepat untuk masing-masing.",en:"When there are multiple hazards, choose the right tool for each one."} }
  ];

  const FALLBACK_I18N = {
    id: {
      tagline:"Belajar memangkas tanaman dengan <strong>aman</strong> &amp; <strong>cerdas</strong>",
      feat1:"Prioritas Keselamatan", feat2:"Teknik Pangkas Benar", feat3:"Edukasi Praktis",
      btnStart:"Mulai Bermain", btnTutorial:"Lihat Tutorial",
      hintStart:"Setiap level punya tantangan berbeda. Pilih alat yang tepat!",
      level:"Level", score:"Skor", safety:"Keselamatan", task:"Tugas", chooseTool:"Pilih Alat",
      toolHand:"Tangan", toolTweezers:"Penjepit", toolGloves:"Sarung Tangan", toolBrush:"Sikat", toolShears:"Gunting",
      toolHint:"Pilih alat lalu klik objek di tanaman", toolHintActive:"Alat aktif: {tool} — klik objek di tanaman",
      btnReset:"Ulangi Level", btnNext:"Level Berikutnya →", btnUnderstand:"Mengerti", btnContinue:"Lanjut", btnHint:"💡 Hint",
      levelComplete:"Level Selesai!", completeGood:"Hebat! Kamu menyelesaikan level dengan aman.", completeOk:"Level selesai. Coba lebih hati-hati lain kali ya.",
      toastRemove:"Berhasil dibersihkan! +25", toastPrune:"Daun dipangkas! +15", toastWrong:"Alat salah! Hati-hati.",
      toastSelect:"Pilih alat yang sesuai dulu", toastNoPrune:"Cabang ini tidak perlu dipangkas", toastReset:"Level diulang",
      toastHazardFirst:"Bersihkan bahaya dulu sebelum memangkas!", toastHintUsed:"Hint dipakai. Sisa hint: {n}", toastNoHint:"Hint sudah habis (maksimal 3 untuk seluruh game)",
      allDoneTitle:"Semua Level Selesai!", allDoneBody:"Selamat! Skor {score}, Keselamatan {safety}%. Terus jaga keselamatan saat berkebun!",
      lessonTitle:"Yang Kamu Pelajari", badgeUnlocked:"Badge baru terbuka!",
      tasks:[
        "Bersihkan pecahan kaca yang menempel, lalu pangkas daun sampai tanaman berbentuk rapi dan bulat.",
        "Buang potongan kayu kering, lalu pangkas daun sampai berbentuk SEGITIGA.",
        "Pisahkan duri-duri tajam, lalu pangkas daun sampai berbentuk BULAT.",
        "Bersihkan noda lumpur, lalu pangkas daun sampai berbentuk HATI (love).",
        "Bersihkan semua bahaya, lalu pangkas daun sampai berbentuk OVAL."
      ],
      edu:{
        glassHand:{icon:"⚠️",title:"Jangan Pakai Tangan Kosong!",body:"Pecahan kaca sangat tajam. Bisa melukai jari dan menyebabkan infeksi. Selalu gunakan Penjepit!"},
        thornHand:{icon:"🌵",title:"Duri Bisa Melukai!",body:"Duri tanaman tajam. Pakai Sarung Tangan agar tanganmu terlindungi dari tusukan."},
        mudHand:{icon:"🧤",title:"Pakai Sikat untuk Lumpur",body:"Lumpur menempel kuat. Sikat lebih efektif dan menjaga tangan tetap bersih."},
        wrongTool:{icon:"🔧",title:"Alat yang Salah",body:"Pilih alat yang sesuai dengan jenis bahaya."},
        hazardFirst:{icon:"🛡️",title:"Bersihkan Bahaya Dulu!",body:"Masih ada benda berbahaya di tanaman. Bersihkan semuanya sebelum memangkas."},
        successClean:{icon:"✅",title:"Bagus! Area Aman",body:"Semua bahaya sudah dibersihkan. Sekarang tanaman aman untuk dipangkas."},
        wrongPrune:{icon:"✂️",title:"Gunakan Gunting Pangkas",body:"Untuk memotong cabang, gunakan Gunting Pangkas."}
      },
      tutorial:{title:"Cara Bermain",steps:["1. Pilih alat di bagian bawah (kamu harus menebak alat yang tepat).","2. Klik benda berbahaya di tanaman.","3. Setelah bersih, potong cabang emas untuk membentuk siluet.","4. Hint hanya 3 kali untuk seluruh game — pakai bijak!","5. Jaga bar Keselamatan tetap tinggi."],btn:"Mengerti, Mulai!"},
      requiredTool:{glass:"tweezers",wood:"hand",thorn:"gloves",mud:"brush"}
    },
    en: {
      tagline:"Learn to prune plants <strong>safely</strong> &amp; <strong>smartly</strong>",
      feat1:"Safety First", feat2:"Proper Pruning Technique", feat3:"Practical Education",
      btnStart:"Start Playing", btnTutorial:"View Tutorial",
      hintStart:"Each level has a different challenge. Choose the right tool!",
      level:"Level", score:"Score", safety:"Safety", task:"Task", chooseTool:"Choose Tool",
      toolHand:"Hand", toolTweezers:"Tweezers", toolGloves:"Gloves", toolBrush:"Brush", toolShears:"Shears",
      toolHint:"Select a tool then tap objects on the plant", toolHintActive:"Active tool: {tool} — tap objects on the plant",
      btnReset:"Retry Level", btnNext:"Next Level →", btnUnderstand:"Got it", btnContinue:"Continue", btnHint:"💡 Hint",
      levelComplete:"Level Complete!", completeGood:"Great job! You completed the level safely.", completeOk:"Level done. Try to be more careful next time.",
      toastRemove:"Cleared successfully! +25", toastPrune:"Leaf pruned! +15", toastWrong:"Wrong tool! Be careful.",
      toastSelect:"Select the correct tool first", toastNoPrune:"This branch doesn't need pruning", toastReset:"Level restarted",
      toastHazardFirst:"Clear hazards before pruning!", toastHintUsed:"Hint used. Hints left: {n}", toastNoHint:"No hints left (max 3 for the whole game)",
      allDoneTitle:"All Levels Complete!", allDoneBody:"Congrats! Score {score}, Safety {safety}%. Keep practicing garden safety!",
      lessonTitle:"What You Learned", badgeUnlocked:"New badge unlocked!",
      tasks:[
        "Clear the glass shards, then prune leaves into a neat ROUND shape.",
        "Remove dry wood pieces, then prune leaves into a TRIANGLE shape.",
        "Remove sharp thorns, then prune leaves into a ROUND shape.",
        "Clean the mud stains, then prune leaves into a HEART shape.",
        "Clear all hazards, then prune leaves into an OVAL shape."
      ],
      edu:{
        glassHand:{icon:"⚠️",title:"Never Use Bare Hands!",body:"Glass shards are extremely sharp. Always use Tweezers!"},
        thornHand:{icon:"🌵",title:"Thorns Can Hurt!",body:"Plant thorns are sharp. Wear Gloves to protect your hands."},
        mudHand:{icon:"🧤",title:"Use a Brush for Mud",body:"Mud sticks firmly. A brush is more effective."},
        wrongTool:{icon:"🔧",title:"Wrong Tool",body:"Choose the tool that matches the hazard."},
        hazardFirst:{icon:"🛡️",title:"Clear Hazards First!",body:"Clear all dangerous objects before pruning."},
        successClean:{icon:"✅",title:"Great! Area Safe",body:"All hazards cleared. The plant is now safe to prune."},
        wrongPrune:{icon:"✂️",title:"Use Pruning Shears",body:"To cut branches you must use pruning shears."}
      },
      tutorial:{title:"How to Play",steps:["1. Choose a tool at the bottom (figure out the right one).","2. Tap hazardous objects on the plant.","3. After clearing, cut gold branches to form the silhouette.","4. Only 3 hints for the whole game — use wisely!","5. Keep the Safety bar high."],btn:"Got it, Start!"},
      requiredTool:{glass:"tweezers",wood:"hand",thorn:"gloves",mud:"brush"}
    }
  };

  const FALLBACK_ACHIEVEMENTS = [
    {id:"first_clear",icon:"🧹",title:{id:"Pembersih Pemula",en:"First Cleaner"},desc:{id:"Berhasil membersihkan bahaya di level 1",en:"Cleared hazards in level 1"}},
    {id:"zero_mistake",icon:"🛡️",title:{id:"Tanpa Kesalahan",en:"Zero Mistake"},desc:{id:"Selesaikan level tanpa menurunkan keselamatan",en:"Finish a level without reducing safety"}},
    {id:"safety_master",icon:"🏅",title:{id:"Master Keselamatan",en:"Safety Master"},desc:{id:"Selesaikan semua level dengan keselamatan ≥ 80%",en:"Finish all levels with safety ≥ 80%"}},
    {id:"perfect_prune",icon:"✂️",title:{id:"Pangkas Sempurna",en:"Perfect Prune"},desc:{id:"Selesaikan level 5",en:"Complete level 5"}},
    {id:"hint_saver",icon:"💡",title:{id:"Hemat Hint",en:"Hint Saver"},desc:{id:"Selesaikan 3 level tanpa memakai hint",en:"Complete 3 levels without using any hint"}},
    {id:"all_done",icon:"🏆",title:{id:"Lulus SmartSnip",en:"SmartSnip Graduate"},desc:{id:"Menyelesaikan semua 5 level",en:"Completed all 5 levels"}}
  ];

  // ---------- State ----------
  const state = {
    level:1, score:0, safety:100, selectedTool:null,
    hazardsLeft:0, pruneNeeded:0, pruned:0,
    hazardsClean:false, levelComplete:false,
    hintsLeft:3, usedHintThisLevel:false, mistakesThisLevel:0, levelsWithoutHint:0,
    lang: localStorage.getItem('ss-lang') || 'id',
    soundOn: localStorage.getItem('ss-sound') !== 'off',
    unlockedBadges: JSON.parse(localStorage.getItem('ss-badges') || '[]'),
    highestLevel: +(localStorage.getItem('ss-highest') || 0),
  };

  let LEVELS = FALLBACK_LEVELS;
  let I18N = FALLBACK_I18N;
  let ACHIEVEMENTS = FALLBACK_ACHIEVEMENTS;
  let requiredTool = FALLBACK_I18N.id.requiredTool;

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

  // ---------- Load JSON (with fallback) ----------
  function showStartScreen() {
    if (loading) loading.classList.remove('active');
    if (startScreen) startScreen.classList.add('active');
    applyLanguage();
  }

  function fetchWithTimeout(url, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
  }

  async function loadData() {
    // Show UI immediately so GitHub Pages never sticks on loading logo
    showStartScreen();

    try {
      // Resolve base for project pages: https://user.github.io/repo/
      let base = './';
      const script = document.querySelector('script[src*="game.js"]');
      if (script && script.src) {
        base = script.src.replace(/js\/game\.js(\?.*)?$/, '');
      }
      const [levelsRes, i18nRes, achRes] = await Promise.all([
        fetchWithTimeout(base + 'data/levels.json', 4000),
        fetchWithTimeout(base + 'data/i18n.json', 4000),
        fetchWithTimeout(base + 'data/achievements.json', 4000),
      ]);
      if (levelsRes.ok) {
        const data = await levelsRes.json();
        if (Array.isArray(data) && data.length) LEVELS = data;
      }
      if (i18nRes.ok) {
        const data = await i18nRes.json();
        if (data && data.id) {
          I18N = data;
          requiredTool = (data.id && data.id.requiredTool) || requiredTool;
        }
      }
      if (achRes.ok) {
        const data = await achRes.json();
        if (Array.isArray(data)) ACHIEVEMENTS = data;
      }
      applyLanguage();
    } catch (e) {
      console.warn('JSON fetch skipped, using embedded data', e);
    }
  }

  function t(key) {
    const lang = I18N[state.lang] || I18N.id || FALLBACK_I18N.id;
    return lang[key] ?? key;
  }
  function tEdu(key) {
    const lang = I18N[state.lang] || I18N.id || FALLBACK_I18N.id;
    return lang.edu?.[key] || FALLBACK_I18N.id.edu[key];
  }

  // ---------- Sound ----------
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function playTone(freq, dur, type='sine', gain=0.1, slide=null) {
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
    } catch(e) {}
  }
  const sfx = {
    click: () => playTone(580,0.05,'sine',0.07),
    select: () => playTone(460,0.07,'triangle',0.09),
    success: () => { playTone(520,0.09,'sine',0.09); setTimeout(()=>playTone(700,0.12,'sine',0.09),70); },
    remove: () => { playTone(880,0.04,'sine',0.05); setTimeout(()=>playTone(1100,0.06,'triangle',0.04),30); },
    prune: () => playTone(170,0.1,'sawtooth',0.06,85),
    error: () => playTone(200,0.16,'square',0.08,130),
    complete: () => { playTone(523,0.1,'sine',0.09); setTimeout(()=>playTone(659,0.1,'sine',0.09),100); setTimeout(()=>playTone(784,0.18,'sine',0.1),200); },
    badge: () => { playTone(660,0.1,'sine',0.1); setTimeout(()=>playTone(880,0.15,'sine',0.1),100); },
  };

  // ---------- UI ----------
  function showToast(msg, type='') {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className='toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.className = `toast show ${type}`;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 1900);
  }
  function openModal(data) {
    if (!data) return;
    modalIcon.textContent = data.icon || '⚠️';
    modalTitle.textContent = data.title || '';
    modalBody.textContent = data.body || '';
    eduModal.classList.add('open');
    eduModal.setAttribute('aria-hidden','false');
    sfx.click();
  }
  function closeModal() {
    eduModal.classList.remove('open');
    eduModal.setAttribute('aria-hidden','true');
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) el.innerHTML = val;
    });
    document.querySelectorAll('#btn-lang, #btn-lang-start').forEach(b => b.textContent = state.lang.toUpperCase());
    document.querySelectorAll('#btn-sound, #btn-sound-start').forEach(b => {
      b.textContent = state.soundOn ? '🔊' : '🔇';
      b.classList.toggle('muted', !state.soundOn);
    });
    const tut = (I18N[state.lang] || I18N.id || FALLBACK_I18N.id).tutorial;
    if (tut) {
      const titleEl = $('#tutorial-title');
      if (titleEl) titleEl.textContent = tut.title;
      const ol = $('#tutorial-steps');
      if (ol) ol.innerHTML = (tut.steps||[]).map(s => `<li>${s}</li>`).join('');
      const closeBtn = $('#btn-tutorial-close');
      if (closeBtn) closeBtn.textContent = tut.btn;
    }
    if (state.level && LEVELS[state.level-1]) {
      const tasks = t('tasks');
      if (Array.isArray(tasks)) taskText.textContent = tasks[state.level-1] || '';
    }
    updateToolHint();
  }

  function updateToolHint() {
    if (!toolHint) return;
    if (!state.selectedTool) { toolHint.textContent = t('toolHint'); return; }
    const names = { hand:t('toolHand'), tweezers:t('toolTweezers'), gloves:t('toolGloves'), brush:t('toolBrush'), shears:t('toolShears') };
    toolHint.textContent = t('toolHintActive').replace('{tool}', names[state.selectedTool] || state.selectedTool);
  }

  function updateUI() {
    if (levelNum) levelNum.textContent = state.level;
    if (scoreEl) scoreEl.textContent = state.score;
    if (safetyFill) safetyFill.style.width = Math.max(0, state.safety) + '%';
    const lv = LEVELS[state.level-1];
    if (!lv) return;
    const total = lv.hazards.length + lv.pruneCount;
    const done = (lv.hazards.length - state.hazardsLeft) + state.pruned;
    if (taskProgress) taskProgress.textContent = done + '/' + total;
    if (btnHint) btnHint.textContent = `${t('btnHint')} (${state.hintsLeft})`;

    if (state.hazardsClean && state.pruned >= state.pruneNeeded) {
      state.levelComplete = true;
      if (btnNext) btnNext.classList.remove('hidden');
      setTimeout(showComplete, 400);
    }
  }

  // ---------- Achievements ----------
  function unlockBadge(id) {
    if (state.unlockedBadges.includes(id)) return null;
    state.unlockedBadges.push(id);
    localStorage.setItem('ss-badges', JSON.stringify(state.unlockedBadges));
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach) { sfx.badge(); return ach; }
    return null;
  }
  function checkLevelBadges() {
    const earned = [];
    if (state.level === 1) { const b = unlockBadge('first_clear'); if (b) earned.push(b); }
    if (state.mistakesThisLevel === 0) { const b = unlockBadge('zero_mistake'); if (b) earned.push(b); }
    if (!state.usedHintThisLevel) {
      state.levelsWithoutHint++;
      if (state.levelsWithoutHint >= 3) { const b = unlockBadge('hint_saver'); if (b) earned.push(b); }
    } else state.levelsWithoutHint = 0;
    if (state.level === 5) {
      const b = unlockBadge('perfect_prune'); if (b) earned.push(b);
      const all = unlockBadge('all_done'); if (all) earned.push(all);
      if (state.safety >= 80) { const sm = unlockBadge('safety_master'); if (sm) earned.push(sm); }
    }
    return earned;
  }

  function showComplete() {
    sfx.complete();
    const lv = LEVELS[state.level-1];
    const fs = $('#final-score'); if (fs) fs.textContent = state.score;
    const fsa = $('#final-safety'); if (fsa) fsa.textContent = Math.max(0, state.safety) + '%';
    const cm = $('#complete-msg'); if (cm) cm.textContent = state.safety >= 80 ? t('completeGood') : t('completeOk');
    const lt = $('#lesson-text'); if (lt && lv) lt.textContent = lv.lesson[state.lang] || lv.lesson.id;

    const earned = checkLevelBadges();
    const badgeBox = $('#badge-earned');
    if (badgeBox) {
      if (earned.length) {
        badgeBox.classList.remove('hidden');
        badgeBox.innerHTML = earned.map(b => `${b.icon} ${b.title[state.lang]||b.title.id}`).join('<br>');
      } else badgeBox.classList.add('hidden');
    }
    if (state.level > state.highestLevel) {
      state.highestLevel = state.level;
      localStorage.setItem('ss-highest', state.highestLevel);
    }
    completeOverlay.classList.add('active');
  }

  // ---------- SVG ----------
  function createPlantSVG(lv) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 280 320');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // ground
    const ground = document.createElementNS(ns, 'ellipse');
    ground.setAttribute('cx', '140'); ground.setAttribute('cy', '300');
    ground.setAttribute('rx', '118'); ground.setAttribute('ry', '14');
    ground.setAttribute('fill', '#14532D'); ground.setAttribute('opacity', '0.35');
    svg.appendChild(ground);

    // pot
    const pot = document.createElementNS(ns, 'path');
    pot.setAttribute('d', 'M88 255 L98 300 Q140 310 182 300 L192 255 Z');
    pot.setAttribute('fill', '#B45309'); pot.setAttribute('stroke', '#78350F'); pot.setAttribute('stroke-width', '2');
    svg.appendChild(pot);
    const rim = document.createElementNS(ns, 'ellipse');
    rim.setAttribute('cx', '140'); rim.setAttribute('cy', '255');
    rim.setAttribute('rx', '54'); rim.setAttribute('ry', '10');
    rim.setAttribute('fill', '#D97706'); rim.setAttribute('stroke', '#78350F'); rim.setAttribute('stroke-width', '1.5');
    svg.appendChild(rim);

    // bare lower trunk
    const trunk = document.createElementNS(ns, 'path');
    trunk.setAttribute('d', 'M132 255 Q138 228 140 198');
    trunk.setAttribute('stroke', '#5C3A1E');
    trunk.setAttribute('stroke-width', '18');
    trunk.setAttribute('fill', 'none');
    trunk.setAttribute('stroke-linecap', 'round');
    svg.appendChild(trunk);

    const shape = lv.shape || 'neat';

    // Strict shape test — clear silhouettes
    function insideShape(px, py) {
      if (shape === 'triangle') {
        // Sharp triangle: tip (140,50), base from (55,200) to (225,200)
        const topY = 50, baseY = 200, tipX = 140, leftX = 55, rightX = 225;
        if (py < topY || py > baseY) return false;
        const t = (py - topY) / (baseY - topY);
        const L = tipX + (leftX - tipX) * t;
        const R = tipX + (rightX - tipX) * t;
        return px >= L && px <= R;
      }
      if (shape === 'heart') {
        // Clear heart: two lobes + pointed bottom
        const leftLobe = Math.hypot(px - 112, py - 92) <= 36;
        const rightLobe = Math.hypot(px - 168, py - 92) <= 36;
        // lower triangle-ish point
        if (py >= 100 && py <= 200) {
          const half = (200 - py) * 0.72;
          if (Math.abs(px - 140) <= half) return true;
        }
        return leftLobe || rightLobe;
      }
      if (shape === 'round') {
        return Math.hypot(px - 140, py - 125) <= 82;
      }
      if (shape === 'oval') {
        const dx = (px - 140) / 68;
        const dy = (py - 125) / 92;
        return (dx * dx + dy * dy) <= 1;
      }
      // neat: tidy round bush
      return Math.hypot(px - 140, py - 125) <= 68;
    }

    // Bounding box for sampling outer leaves (messy full plant before prune)
    function inCanopyBox(px, py) {
      return px >= 35 && px <= 245 && py >= 40 && py <= 205;
    }

    const leafColors = ['#14532D', '#166534', '#15803D', '#16A34A', '#22C55E', '#4ADE80', '#3F6212', '#365314'];
    const foliage = document.createElementNS(ns, 'g');
    foliage.setAttribute('id', 'foliage');

    let excessCount = 0;

    function makeLeaf(x, y, rx, ry, rot, forcePrune) {
      const e = document.createElementNS(ns, 'ellipse');
      e.setAttribute('cx', x);
      e.setAttribute('cy', y);
      e.setAttribute('rx', rx);
      e.setAttribute('ry', ry);
      e.setAttribute('fill', leafColors[(Math.random() * leafColors.length) | 0]);
      e.setAttribute('opacity', String(0.84 + Math.random() * 0.16));
      e.setAttribute('transform', `rotate(${rot} ${x} ${y})`);
      e.classList.add('leaf');
      const keep = forcePrune ? false : insideShape(x, y);
      e.dataset.prune = keep ? '0' : '1';
      if (!keep) excessCount++;
      e.style.cursor = 'pointer';
      foliage.appendChild(e);
      return e;
    }

    // 1) DENSE fill INSIDE the shape (these stay — form the final silhouette)
    let insidePlaced = 0;
    let attempts = 0;
    while (insidePlaced < 130 && attempts < 800) {
      attempts++;
      let x, y;
      if (shape === 'triangle') {
        // sample inside triangle
        const u = Math.random(), v = Math.random();
        const uu = u, vv = v * (1 - u); // barycentric-ish
        const topY = 50, baseY = 200;
        y = topY + Math.random() * (baseY - topY);
        const t = (y - topY) / (baseY - topY);
        const L = 140 + (55 - 140) * t;
        const R = 140 + (225 - 140) * t;
        x = L + Math.random() * (R - L);
      } else if (shape === 'heart') {
        x = 70 + Math.random() * 140;
        y = 55 + Math.random() * 145;
        if (!insideShape(x, y)) continue;
      } else if (shape === 'oval') {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random();
        x = 140 + Math.cos(a) * 68 * r;
        y = 125 + Math.sin(a) * 92 * r;
      } else {
        // round / neat
        const a = Math.random() * Math.PI * 2;
        const r = Math.random();
        const rad = shape === 'neat' ? 68 : 82;
        x = 140 + Math.cos(a) * rad * r;
        y = 125 + Math.sin(a) * rad * r;
      }
      if (!insideShape(x, y)) continue;
      makeLeaf(x, y, 7 + Math.random() * 6, 5.5 + Math.random() * 5, Math.random() * 70 - 35, false);
      insidePlaced++;
    }

    // 2) Messy OUTER leaves (must be pruned to reveal shape) — clearly outside
    let outsidePlaced = 0;
    attempts = 0;
    while (outsidePlaced < 100 && attempts < 900) {
      attempts++;
      // sample in a wide blob then reject if inside shape
      const a = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 95;
      const x = 140 + Math.cos(a) * r * (0.7 + Math.random() * 0.5);
      const y = 125 + Math.sin(a) * r * 0.85 + (Math.random() * 20 - 10);
      if (!inCanopyBox(x, y)) continue;
      if (insideShape(x, y)) continue; // only outside
      makeLeaf(x, y, 7 + Math.random() * 8, 5 + Math.random() * 6, Math.random() * 90 - 45, true);
      outsidePlaced++;
    }

    // 3) Extra fringe blobs at corners for "belum rapi" look
    const fringeSpots = [
      [55, 70], [220, 75], [50, 150], [230, 155], [90, 45], [190, 48],
      [70, 180], [210, 185], [140, 42], [40, 110], [240, 120]
    ];
    fringeSpots.forEach(([fx, fy]) => {
      for (let i = 0; i < 5; i++) {
        const x = fx + (Math.random() * 24 - 12);
        const y = fy + (Math.random() * 24 - 12);
        if (!inCanopyBox(x, y)) continue;
        if (insideShape(x, y)) continue;
        makeLeaf(x, y, 6 + Math.random() * 7, 5 + Math.random() * 5, Math.random() * 80 - 40, true);
      }
    });

    svg.appendChild(foliage);
    svg.dataset.excess = String(Math.max(excessCount, 1));

    // hazards on top
    const hGroup = document.createElementNS(ns, 'g');
    lv.hazards.forEach((h, i) => hGroup.appendChild(drawHazard(ns, h, i)));
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
      // sharp irregular shard — clearly glass (cyan glass look, white edge, shine)
      const poly = document.createElementNS(ns, 'polygon');
      const pts = [
        [x, y - s * 1.1],
        [x + s * 0.95, y - s * 0.15],
        [x + s * 0.55, y + s * 0.85],
        [x - s * 0.4, y + s * 0.7],
        [x - s * 0.85, y + s * 0.1],
      ].map(p => p.join(',')).join(' ');
      poly.setAttribute('points', pts);
      poly.setAttribute('fill', 'rgba(125, 211, 252, 0.55)');
      poly.setAttribute('stroke', 'rgba(255, 255, 255, 0.95)');
      poly.setAttribute('stroke-width', '1.8');
      poly.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      g.appendChild(poly);
      // inner shine facet
      const shine = document.createElementNS(ns, 'polygon');
      shine.setAttribute('points', `${x - 1},${y - s * 0.7} ${x + s * 0.35},${y - s * 0.2} ${x - s * 0.15},${y + s * 0.15}`);
      shine.setAttribute('fill', 'rgba(255, 255, 255, 0.65)');
      shine.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      shine.style.pointerEvents = 'none';
      g.appendChild(shine);
      // thin dark edge for contrast against green leaves
      const edge = document.createElementNS(ns, 'polygon');
      edge.setAttribute('points', pts);
      edge.setAttribute('fill', 'none');
      edge.setAttribute('stroke', 'rgba(14, 116, 144, 0.5)');
      edge.setAttribute('stroke-width', '0.8');
      edge.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      edge.style.pointerEvents = 'none';
      g.appendChild(edge);
    } else if (h.type === 'wood') {
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', x - s * 0.7); rect.setAttribute('y', y - s * 0.25);
      rect.setAttribute('width', s * 1.4); rect.setAttribute('height', s * 0.5); rect.setAttribute('rx', '2');
      rect.setAttribute('fill', '#A16207'); rect.setAttribute('stroke', '#78350F'); rect.setAttribute('stroke-width', '1.2');
      rect.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      g.appendChild(rect);
    } else if (h.type === 'thorn') {
      const poly = document.createElementNS(ns, 'polygon');
      poly.setAttribute('points', `${x},${y - s} ${x + s * 0.4},${y + s * 0.55} ${x - s * 0.4},${y + s * 0.55}`);
      poly.setAttribute('fill', '#3F6212'); poly.setAttribute('stroke', '#1A2E05'); poly.setAttribute('stroke-width', '1.2');
      poly.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      g.appendChild(poly);
    } else if (h.type === 'mud') {
      const ellipse = document.createElementNS(ns, 'ellipse');
      ellipse.setAttribute('cx', x); ellipse.setAttribute('cy', y);
      ellipse.setAttribute('rx', s * 0.85); ellipse.setAttribute('ry', s * 0.55);
      ellipse.setAttribute('fill', '#78350F'); ellipse.setAttribute('opacity', '0.9');
      ellipse.setAttribute('transform', `rotate(${h.rot} ${x} ${y})`);
      g.appendChild(ellipse);
    }
    return g;
  }

  // ---------- Tools & Interaction ----------
  function renderTools(toolList) {
    const icons = {hand:'🖐️',tweezers:'🔧',gloves:'🧤',brush:'🧹',shears:'✂️'};
    const labels = {hand:t('toolHand'),tweezers:t('toolTweezers'),gloves:t('toolGloves'),brush:t('toolBrush'),shears:t('toolShears')};
    toolsEl.innerHTML = '';
    toolList.forEach(tool => {
      const btn = document.createElement('button');
      btn.type='button'; btn.className='tool'; btn.dataset.tool=tool;
      btn.innerHTML = `<span class="tool-icon" aria-hidden="true">${icons[tool]}</span><span class="tool-name">${labels[tool]}</span>`;
      btn.addEventListener('click', () => selectTool(tool));
      toolsEl.appendChild(btn);
    });
  }
  function selectTool(tool) {
    state.selectedTool = tool;
    toolsEl.querySelectorAll('.tool').forEach(b => b.classList.toggle('active', b.dataset.tool===tool));
    updateToolHint();
    sfx.select();
  }

  function handleHazardClick(el) {
    if (state.levelComplete) return;
    const type = el.dataset.type;
    const need = requiredTool[type];
    if (!state.selectedTool) { showToast(t('toastSelect')); return; }
    if (state.selectedTool === need) {
      el.classList.add('removed');
      state.hazardsLeft--;
      state.score += 25;
      sfx.remove();
      showToast(t('toastRemove'),'success');
      if (state.hazardsLeft <= 0) {
        state.hazardsClean = true;
        setTimeout(() => openModal(tEdu('successClean')), 300);
      }
      updateUI();
    } else {
      state.safety = Math.max(0, state.safety-15);
      state.score = Math.max(0, state.score-8);
      state.mistakesThisLevel++;
      sfx.error();
      updateUI();
      showToast(t('toastWrong'),'danger');
      if (type==='glass' && state.selectedTool==='hand') openModal(tEdu('glassHand'));
      else if (type==='thorn' && state.selectedTool==='hand') openModal(tEdu('thornHand'));
      else if (type==='mud' && state.selectedTool==='hand') openModal(tEdu('mudHand'));
      else openModal(tEdu('wrongTool'));
    }
  }

  function handleLeafClick(leaf) {
    if (state.levelComplete) return;
    if (!state.hazardsClean) {
      sfx.error();
      openModal(tEdu('hazardFirst'));
      showToast(t('toastHazardFirst'), 'danger');
      return;
    }
    if (state.selectedTool !== 'shears') {
      sfx.error();
      openModal(tEdu('wrongPrune'));
      return;
    }
    // only excess leaves (outside target shape) fall off
    if (leaf.dataset.prune === '1' && !leaf.classList.contains('removed')) {
      leaf.classList.add('removed');
      state.pruned++;
      state.score += 15;
      sfx.prune();
      showToast(t('toastPrune'), 'success');
      updateUI();
    } else if (leaf.dataset.prune === '0') {
      // leaf that should stay — subtle feedback, no penalty
      showToast(state.lang === 'id' ? 'Daun ini sebaiknya dipertahankan' : 'Better keep this leaf');
    }
  }

  function useHint() {
    if (state.hintsLeft <= 0) { showToast(t('toastNoHint')); return; }
    state.hintsLeft--; state.usedHintThisLevel = true; updateUI();
    // if hazards remain, pulse those; else pulse a few excess leaves
    const hazards = plantArea.querySelectorAll('.hazard:not(.removed)');
    if (hazards.length) {
      hazards.forEach(el => { el.classList.add('hint-pulse'); setTimeout(() => el.classList.remove('hint-pulse'), 2000); });
      const need = requiredTool[hazards[0].dataset.type];
      if (need) selectTool(need);
    } else {
      selectTool('shears');
      const excess = [...plantArea.querySelectorAll('.leaf[data-prune="1"]:not(.removed)')].slice(0, 8);
      excess.forEach(el => { el.classList.add('hint-pulse'); setTimeout(() => el.classList.remove('hint-pulse'), 2000); });
    }
    showToast(t('toastHintUsed').replace('{n}', state.hintsLeft), 'success');
    sfx.click();
  }

  function loadLevel(id) {
    const lv = LEVELS[id-1];
    if (!lv) return;
    state.level=id; state.hazardsLeft=lv.hazards.length; state.pruneNeeded=0;
    state.pruned=0; state.hazardsClean=false; state.levelComplete=false;
    state.selectedTool=null;
    state.usedHintThisLevel=false; state.mistakesThisLevel=0;

    const tasks = t('tasks');
    if (Array.isArray(tasks)) taskText.textContent = tasks[id-1] || '';
    btnNext.classList.add('hidden');
    completeOverlay.classList.remove('active');

    renderTools(lv.tools);
    updateToolHint();

    plantArea.innerHTML = '';
    const svg = createPlantSVG(lv);
    plantArea.appendChild(svg);

    const excess = parseInt(svg.dataset.excess || '20', 10);
    // almost all outer leaves must go so the silhouette is clearly visible
    state.pruneNeeded = Math.max(12, Math.floor(excess * 0.88));

    svg.querySelectorAll('.hazard').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); handleHazardClick(el); }));
    svg.querySelectorAll('.leaf').forEach(leaf => {
      leaf.addEventListener('click', e => { e.stopPropagation(); handleLeafClick(leaf); });
    });
    updateUI();
  }

  // ---------- Events ----------
  function toggleLang() {
    state.lang = state.lang==='id' ? 'en' : 'id';
    localStorage.setItem('ss-lang', state.lang);
    applyLanguage();
    if (state.level) {
      renderTools(LEVELS[state.level-1].tools);
      if (state.selectedTool) toolsEl.querySelectorAll('.tool').forEach(b => b.classList.toggle('active', b.dataset.tool===state.selectedTool));
    }
    sfx.click();
  }
  function toggleSound() {
    state.soundOn = !state.soundOn;
    localStorage.setItem('ss-sound', state.soundOn?'on':'off');
    applyLanguage();
    if (state.soundOn) sfx.select();
  }

  $('#btn-start')?.addEventListener('click', () => {
    ensureAudio();
    tryAutoMusic();
    state.hintsLeft = 3;
    state.score = 0;
    state.safety = 100;
    startScreen.classList.remove('active');
    app.classList.remove('hidden');
    loadLevel(1);
    sfx.success();
  });
  $('#btn-tutorial')?.addEventListener('click', () => {
    startScreen.classList.remove('active');
    tutorialOverlay.classList.add('active');
  });
  $('#btn-tutorial-close')?.addEventListener('click', () => {
    tutorialOverlay.classList.remove('active');
    app.classList.remove('hidden');
    ensureAudio();
    tryAutoMusic();
    state.hintsLeft = 3;
    state.score = 0;
    state.safety = 100;
    loadLevel(1);
    sfx.success();
  });
  $('#modal-close')?.addEventListener('click', closeModal);
  eduModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
  $('#btn-hint')?.addEventListener('click', useHint);
  $('#btn-reset')?.addEventListener('click', () => {
    state.score = Math.max(0, state.score-10);
    loadLevel(state.level);
    showToast(t('toastReset'));
    sfx.click();
  });
  $('#btn-next')?.addEventListener('click', () => {
    if (state.level < LEVELS.length) {
      loadLevel(state.level+1); sfx.click();
    } else {
      renderBadgesList();
      completeOverlay.classList.remove('active');
      badgesOverlay.classList.add('active');
    }
  });
  $('#btn-continue')?.addEventListener('click', () => {
    completeOverlay.classList.remove('active'); sfx.click();
  });
  $('#btn-badges-close')?.addEventListener('click', () => {
    badgesOverlay.classList.remove('active');
    startScreen.classList.add('active');
    app.classList.add('hidden');
  });

  function renderBadgesList() {
    const list = $('#badges-list');
    if (!list) return;
    list.innerHTML = ACHIEVEMENTS.map(a => {
      const unlocked = state.unlockedBadges.includes(a.id);
      return `<div class="badge-item ${unlocked?'unlocked':''}">
        <span class="b-icon">${a.icon}</span>
        <div class="b-info">
          <div class="b-title">${a.title[state.lang]||a.title.id}</div>
          <div class="b-desc">${a.desc[state.lang]||a.desc.id}</div>
        </div>
      </div>`;
    }).join('');
  }

  $('#btn-lang')?.addEventListener('click', toggleLang);
  $('#btn-lang-start')?.addEventListener('click', toggleLang);
  $('#btn-sound')?.addEventListener('click', toggleSound);
  $('#btn-sound-start')?.addEventListener('click', toggleSound);
  document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });


  // ---------- Background Music ----------
  const bgm = document.getElementById('bgm');
  let musicPlaying = false;

  function updateMusicButtons() {
    const icon = musicPlaying ? '⏸' : '▶';
    document.querySelectorAll('#btn-music, #btn-music-start').forEach((b) => {
      if (b) b.textContent = icon;
    });
  }

  function playMusic() {
    if (!bgm) return;
    bgm.loop = true;
    bgm.volume = 0.45;
    const p = bgm.play();
    if (p && p.then) {
      p.then(() => { musicPlaying = true; updateMusicButtons(); })
       .catch(() => { musicPlaying = false; updateMusicButtons(); });
    } else {
      musicPlaying = true;
      updateMusicButtons();
    }
  }

  function pauseMusic() {
    if (!bgm) return;
    bgm.pause();
    musicPlaying = false;
    updateMusicButtons();
  }

  function toggleMusic() {
    if (musicPlaying) pauseMusic();
    else playMusic();
  }

  document.getElementById('btn-music')?.addEventListener('click', toggleMusic);
  document.getElementById('btn-music-start')?.addEventListener('click', toggleMusic);

  // Try autoplay after first user gesture (start / tutorial)
  function tryAutoMusic() {
    if (!musicPlaying) playMusic();
  }

  // Boot — always leave loading screen
  loadData();
})();
