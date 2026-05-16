const WEBHOOK_URL = "https://discord.com/api/webhooks/1500896639479713852/WNuyLnb9_UZRJbqnFGYb_J8ZbStm4GSL5ORiRTbekiJ-3EsCbAJt9Jz3BNxhkDKL90Bi";
const MIN_COMPLETION_MS = 7000;
const SUBMIT_COOLDOWN_MS = 10000;
const LAST_SUBMIT_KEY = 'printemps:last-submit-at';
const LANG_KEY = 'printemps:lang';
let questionnaireStartedAt = 0;
let npsValue = null; // null = slider not touched
let currentLang = 'fr';

// ─── i18n ───
const I18N = {
  fr: {
    'accueil.title': 'Espace<br><em>Chaussures</em>',
    'accueil.subtitle': 'Votre avis nous guide',
    'accueil.text': "Chère cliente, afin de toujours mieux répondre à vos attentes et d'enrichir notre sélection de marques, nous vous invitons à partager vos impressions.<br><br>Ce questionnaire est <strong style=\"color:var(--green);font-weight:600;\">entièrement anonyme</strong> et ne vous prendra pas plus d'une minute.",
    'accueil.start': 'Commencer →',
    'accueil.mention': 'Anonyme · 1 minute',
    'form.section': 'Espace Chaussures',
    'form.eyebrow': 'Questionnaire satisfaction',
    'form.title': 'Vos <em>impressions</em> nous sont précieuses',
    'q.num1': 'Question 01',
    'q.num2': 'Question 02',
    'q.num3': 'Question 03',
    'q.num4': 'Question 04',
    'q.num5': 'Question 05',
    'q.num6': 'Question 06',
    'q1.label': "Aujourd'hui, vous êtes plutôt à la recherche de…",
    'q1.error': 'Veuillez sélectionner une réponse',
    'q1.opt1': 'Chaussures Premium / de ville',
    'q1.opt2': 'Sneakers',
    'q1.opt3': 'Les deux',
    'q2.label': 'Comment évaluez-vous le choix de marques proposées dans cet espace ?',
    'q2.error': 'Veuillez attribuer une note',
    'q2.t1': 'Pas du tout satisfait',
    'q2.t2': 'Peu satisfait',
    'q2.t3': 'Neutre',
    'q2.t4': 'Satisfait',
    'q2.t5': 'Très satisfait',
    'q2.legLeft': 'Pas du tout satisfait',
    'q2.legRight': 'Très satisfait',
    'q3.label': "Y a-t-il une marque, un style ou une couleur que vous auriez aimé trouver dans notre sélection aujourd'hui ?",
    'q3.error': 'Veuillez renseigner une réponse',
    'q3.placeholder': 'Partagez vos suggestions…',
    'q4.label': "Recommanderiez-vous l'espace chaussures du Printemps à votre entourage ?",
    'q4.error': 'Veuillez déplacer le curseur pour attribuer une note',
    'q4.hint': 'Faites glisser le curseur pour choisir votre note (0 à 10)',
    'q4.labLeft': '0 — Pas du tout',
    'q4.labRight': '10 — Absolument',
    'q5.label': 'Sur quel point pourrions-nous nous améliorer en priorité ?',
    'q5.error': 'Veuillez sélectionner au moins une réponse',
    'q5.opt1': "Le temps d'attente (pour essayer ou en caisse)",
    'q5.opt2': 'La disponibilité des pointures',
    'q5.opt3': "L'aménagement de l'espace (sièges, miroirs, lisibilité des prix…)",
    'q5.opt4': "Le conseil et l'accompagnement",
    'q5.opt5': 'Rien',
    'q5.opt6': 'Autre',
    'q5.otherPlaceholder': 'Précisez votre réponse…',
    'q6.label': 'Souhaitez-vous ajouter un dernier commentaire ? <span class="optional-label">(facultatif)</span>',
    'q6.placeholder': 'Vous pouvez partager ici toute remarque complémentaire…',
    'submit.btn': 'Envoyer mes réponses',
    'submit.mention': 'Questionnaire anonyme · Aucune donnée personnelle collectée',
    'submit.sending': 'Envoi en cours…',
    'submit.cooldown': (s) => `Merci de patienter encore ${s}s.`,
    'submit.tooSoon': (s) => `Merci de prendre quelques secondes supplémentaires (${s}s).`,
    'submit.netError': 'Connexion indisponible. Vérifiez Internet puis réessayez.',
    'confirm.eyebrow': 'Merci infiniment',
    'confirm.title': 'Votre avis a bien<br>été <em>enregistré</em>',
    'confirm.text': "Toute l'équipe de l'espace Chaussures vous remercie pour votre temps et vos précieuses suggestions.<br><br>Nous vous souhaitons une excellente journée et un très beau shopping au Printemps.",
    'confirm.back': 'Revenir au début du questionnaire'
  },
  en: {
    'accueil.title': 'Footwear<br><em>Department</em>',
    'accueil.subtitle': 'Your feedback guides us',
    'accueil.text': "Dear customer, to better meet your expectations and enrich our brand selection, we invite you to share your impressions.<br><br>This survey is <strong style=\"color:var(--green);font-weight:600;\">fully anonymous</strong> and will take no more than a minute.",
    'accueil.start': 'Start →',
    'accueil.mention': 'Anonymous · 1 minute',
    'form.section': 'Footwear Department',
    'form.eyebrow': 'Satisfaction survey',
    'form.title': 'Your <em>impressions</em> matter to us',
    'q.num1': 'Question 01',
    'q.num2': 'Question 02',
    'q.num3': 'Question 03',
    'q.num4': 'Question 04',
    'q.num5': 'Question 05',
    'q.num6': 'Question 06',
    'q1.label': 'Today, you are mainly looking for…',
    'q1.error': 'Please select an answer',
    'q1.opt1': 'Premium / city shoes',
    'q1.opt2': 'Sneakers',
    'q1.opt3': 'Both',
    'q2.label': 'How would you rate the brand selection offered in this department?',
    'q2.error': 'Please give a rating',
    'q2.t1': 'Not satisfied at all',
    'q2.t2': 'Slightly satisfied',
    'q2.t3': 'Neutral',
    'q2.t4': 'Satisfied',
    'q2.t5': 'Very satisfied',
    'q2.legLeft': 'Not satisfied at all',
    'q2.legRight': 'Very satisfied',
    'q3.label': 'Is there a brand, style or colour you would have liked to find in our selection today?',
    'q3.error': 'Please provide an answer',
    'q3.placeholder': 'Share your suggestions…',
    'q4.label': 'Would you recommend the Printemps footwear department to people around you?',
    'q4.error': 'Please move the slider to give a rating',
    'q4.hint': 'Drag the slider to choose your rating (0 to 10)',
    'q4.labLeft': '0 — Not at all',
    'q4.labRight': '10 — Absolutely',
    'q5.label': 'Which area should we improve first?',
    'q5.error': 'Please select at least one answer',
    'q5.opt1': 'Waiting time (fitting or checkout)',
    'q5.opt2': 'Shoe size availability',
    'q5.opt3': 'Department layout (seats, mirrors, price legibility…)',
    'q5.opt4': 'Advice and assistance',
    'q5.opt5': 'Nothing',
    'q5.opt6': 'Other',
    'q5.otherPlaceholder': 'Please specify…',
    'q6.label': 'Any final comment? <span class="optional-label">(optional)</span>',
    'q6.placeholder': 'Feel free to share any additional remark…',
    'submit.btn': 'Submit my answers',
    'submit.mention': 'Anonymous survey · No personal data collected',
    'submit.sending': 'Sending…',
    'submit.cooldown': (s) => `Please wait ${s}s more.`,
    'submit.tooSoon': (s) => `Please take a few more seconds (${s}s).`,
    'submit.netError': 'Connection unavailable. Check your Internet and try again.',
    'confirm.eyebrow': 'Thank you so much',
    'confirm.title': 'Your feedback has<br>been <em>recorded</em>',
    'confirm.text': 'The whole Footwear team thanks you for your time and your valuable suggestions.<br><br>We wish you a lovely day and happy shopping at Printemps.',
    'confirm.back': 'Back to the start of the survey'
  }
};

function t(key, ...args) {
  const entry = (I18N[currentLang] && I18N[currentLang][key]) ?? (I18N.fr[key] ?? key);
  return typeof entry === 'function' ? entry(...args) : entry;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
  document.documentElement.lang = currentLang;
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-lang') === currentLang);
  });
}

function setLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  applyTranslations();
  // Refresh dynamic submit button text if it's in default state
  const btn = document.querySelector('.btn-submit');
  if (btn && !btn.disabled) {
    const span = btn.querySelector('span');
    if (span) span.textContent = t('submit.btn');
  }
}

function setNpsIdle(isIdle) {
  const badge = document.getElementById('nps-badge');
  const hint = document.getElementById('nps-hint');
  const slider = document.getElementById('q4-slider');
  if (!badge || !hint || !slider) return;
  badge.classList.toggle('idle', isIdle);
  hint.classList.toggle('idle', isIdle);
  slider.classList.toggle('idle', isIdle);
}

// ─── NPS Slider ───
function updateNPS(val) {
  npsValue = parseInt(val);
  const badge  = document.getElementById('nps-badge');
  const hint   = document.getElementById('nps-hint');
  const slider = document.getElementById('q4-slider');

  badge.textContent = val;
  hint.classList.add('hidden');
  setNpsIdle(false);
  document.getElementById('q4-block').classList.remove('error');

  // Color: 0=red, 5=orange, 10=green
  const pct = npsValue / 10;
  let r, g;
  if (pct < 0.5) { r = 210; g = Math.round(pct * 2 * 140); }
  else { r = Math.round((1 - (pct - 0.5) * 2) * 210); g = 177; }
  const color = `rgb(${r},${g},50)`;

  badge.style.background = color;
  badge.style.boxShadow = `0 4px 16px rgba(${r},${g},50,0.3)`;

  const fillPct = (npsValue / 10) * 100;
  slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${fillPct}%, var(--grey-light) ${fillPct}%, var(--grey-light) 100%)`;

  badge.classList.remove('pulse');
  void badge.offsetWidth;
  badge.classList.add('pulse');

  updateProgress();
}

// ─── Page navigation ───
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
  const page = document.getElementById(id);
  page.style.display = 'flex';
  setTimeout(() => page.classList.add('active'), 10);
  window.scrollTo(0, 0);
  if (id === 'page-questionnaire' && questionnaireStartedAt === 0) questionnaireStartedAt = Date.now();
  if (id !== 'page-questionnaire') setStatus('');
  updateProgress();
}

function setStatus(msg, isError = false) {
  const el = document.getElementById('submit-status');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('error', isError);
}

function goToQuestionnaireStart() {
  window.location.reload();
}

// ─── Radio ───
function selectRadio(el, groupId) {
  document.getElementById(groupId).querySelectorAll('.choice-item').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  el.querySelector('input').checked = true;
  document.getElementById(groupId + '-block').classList.remove('error');
  updateProgress();
}

// ─── Checkbox ───
function selectCheckbox(event, el) {
  if (event) event.preventDefault();
  const cb = el.querySelector('input[type="checkbox"]');
  cb.checked = !cb.checked;
  el.classList.toggle('selected', cb.checked);
  document.getElementById('q5-block').classList.remove('error');
  updateProgress();
}

function toggleAutre(el) {
  const txt = document.getElementById('autre-text');
  if (el.classList.contains('selected')) { txt.classList.add('visible'); txt.focus(); }
  else { txt.classList.remove('visible'); txt.value = ''; }
}

// ─── Progress ───
function updateProgress() {
  let n = 0;
  if (document.querySelector('input[name="q1"]:checked')) n++;
  if (document.querySelector('input[name="q2"]:checked')) n++;
  if (document.getElementById('q3').value.trim()) n++;
  if (npsValue !== null) n++;
  if (document.querySelectorAll('#q5 input[type="checkbox"]:checked').length > 0) n++;
  document.getElementById('progress-fill').style.width = (n / 5 * 100) + '%';
}

function handleQ3Input() {
  const q3 = document.getElementById('q3');
  if (q3 && q3.value.trim()) document.getElementById('q3-block').classList.remove('error');
  updateProgress();
}

function keepFieldVisible(el) {
  if (!el) return;
  const viewport = window.visualViewport;

  const scrollIfHidden = () => {
    const rect = el.getBoundingClientRect();
    const viewportHeight = viewport ? viewport.height : window.innerHeight;
    const safeBottom = viewportHeight - 16;
    if (rect.bottom > safeBottom || rect.top < 0) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  setTimeout(scrollIfHidden, 120);
  if (viewport) {
    viewport.addEventListener('resize', scrollIfHidden, { once: true });
  }
}

// ─── Validation ───
function validate() {
  let ok = true;
  if (!document.querySelector('input[name="q1"]:checked')) { document.getElementById('q1-block').classList.add('error'); ok = false; }
  if (!document.querySelector('input[name="q2"]:checked')) { document.getElementById('q2-block').classList.add('error'); ok = false; }
  if (!document.getElementById('q3').value.trim()) { document.getElementById('q3-block').classList.add('error'); ok = false; }
  if (npsValue === null) { document.getElementById('q4-block').classList.add('error'); ok = false; }
  if (document.querySelectorAll('#q5 input[type="checkbox"]:checked').length === 0) { document.getElementById('q5-block').classList.add('error'); ok = false; }
  if (!ok) { const fe = document.querySelector('.question-block.error'); if (fe) fe.scrollIntoView({behavior:'smooth',block:'center'}); }
  return ok;
}

// ─── Collect ───
function collectAnswers() {
  const q1 = document.querySelector('input[name="q1"]:checked')?.value || '—';
  const q2 = document.querySelector('input[name="q2"]:checked')?.value || '—';
  const q3 = document.getElementById('q3').value.trim() || '(sans réponse)';
  const q4 = npsValue !== null ? String(npsValue) : '—';
  const q5arr = [...document.querySelectorAll('#q5 input[type="checkbox"]:checked')].map(cb => cb.value);
  const autreTxt = document.getElementById('autre-text').value.trim();
  if (autreTxt && q5arr.includes('Autre')) q5arr[q5arr.indexOf('Autre')] = `Autre : ${autreTxt}`;
  const q5 = q5arr.length > 0 ? q5arr.join(', ') : '—';
  const q6 = document.getElementById('q6')?.value.trim() || '(non renseigné)';
  return { q1, q2, q3, q4, q5, q6 };
}

// ─── Build CSV (BOM for Excel) ───
function buildCSV(a, ts) {
  const headers = ['Date','Q1 - Orientation','Q2 - Satisfaction offre','Q3 - Suggestions','Q4 - NPS','Q5 - Axes amélioration','Q6 - Commentaire libre (facultatif)'];
  const row = [ts, a.q1, a.q2+'/5', a.q3, a.q4+'/10', a.q5, a.q6];
  const esc = v => `"${String(v).replace(/"/g,'""')}"`;
  return '\uFEFF' + headers.map(esc).join(';') + '\n' + row.map(esc).join(';');
}

//  Send to Discord ───
async function sendToDiscord(answers) {
  const ts = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

  // Embed
  const embedRes = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: "Questionnaire",
      embeds: [{
        title: "Nouvelle réponse",
        color: 0x00B140,
        fields: [
          { name: "01 · Orientation", value: answers.q1, inline: true },
          { name: "02 · Satisfaction offre", value: `${'⭐'.repeat(parseInt(answers.q2)||0)} (${answers.q2}/5)`, inline: true },
          { name: "\u200b", value: "\u200b", inline: true },
          { name: "03 · Suggestions libres", value: answers.q3 },
          { name: "04 · NPS", value: `**${answers.q4}** / 10`, inline: true },
          { name: "05 · Axes d'amélioration", value: answers.q5 },
          { name: "06 · Dernier commentaire (facultatif)", value: answers.q6 }
        ],
        footer: { text: ts }
      }]
    })
  });

  if (!embedRes.ok) {
    const errText = await embedRes.text();
    throw new Error(`Discord embed rejected (${embedRes.status}) ${errText}`);
  }

  // CSV
  const fdCSV = new FormData();
  fdCSV.append('payload_json', JSON.stringify({ username: "Questionnaire", content: "CSV :" }));
  fdCSV.append('file', new Blob([buildCSV(answers, ts)], { type: 'text/csv;charset=utf-8' }), `reponse_${Date.now()}.csv`);
  const csvRes = await fetch(WEBHOOK_URL, { method: 'POST', body: fdCSV });
  if (!csvRes.ok) {
    const errText = await csvRes.text();
    throw new Error(`Discord CSV rejected (${csvRes.status}) ${errText}`);
  }
}

// ─── Submit ───
async function submitForm() {
  setStatus('');
  const trap = document.getElementById('website-field');
  if (trap && trap.value.trim()) return;

  const now = Date.now();
  const last = Number(localStorage.getItem(LAST_SUBMIT_KEY) || 0);
  if (last && now - last < SUBMIT_COOLDOWN_MS) {
    setStatus(t('submit.cooldown', Math.ceil((SUBMIT_COOLDOWN_MS - (now - last)) / 1000)), true); return;
  }
  const started = questionnaireStartedAt || now;
  if (now - started < MIN_COMPLETION_MS) {
    setStatus(t('submit.tooSoon', Math.ceil((MIN_COMPLETION_MS-(now-started))/1000)), true); return;
  }
  if (!validate()) return;

  const btn = document.querySelector('.btn-submit');
  btn.disabled = true;
  btn.querySelector('span').textContent = t('submit.sending');

  try {
    await sendToDiscord(collectAnswers());
    localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
    showPage('page-confirmation');
  } catch(err) {
    console.error(err);
    btn.disabled = false;
    btn.querySelector('span').textContent = t('submit.btn');
    setStatus(t('submit.netError'), true);
  }
}

// ─── Init ───
try {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && I18N[saved]) currentLang = saved;
} catch (e) {}
applyTranslations();

document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
document.getElementById('page-accueil').style.display = 'flex';
document.getElementById('page-accueil').classList.add('active');

['q3', 'autre-text'].forEach((fieldId) => {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.addEventListener('focus', () => keepFieldVisible(field));
});

// Slider track init (position milieu, pas encore touché)
document.getElementById('q4-slider').style.background =
  'linear-gradient(to right, var(--green) 0%, var(--green) 50%, var(--grey-light) 50%, var(--grey-light) 100%)';
setNpsIdle(true);
