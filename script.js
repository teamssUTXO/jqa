const WEBHOOK_URL = "https://discord.com/api/webhooks/1496117493599834314/Bd3PJ0uKDiarndwiUVan7zEq1JgLBTYi61PigouGC_DFtpTDEaRM_z6umDd-OWBG1IFp";
const MIN_COMPLETION_MS = 7000;
const SUBMIT_COOLDOWN_MS = 10000;
const LAST_SUBMIT_KEY = 'printemps:last-submit-at';
let questionnaireStartedAt = 0;
let npsValue = null; // null = slider not touched

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
    setStatus(`Merci de patienter encore ${Math.ceil((SUBMIT_COOLDOWN_MS - (now - last)) / 1000)}s.`, true); return;
  }
  const started = questionnaireStartedAt || now;
  if (now - started < MIN_COMPLETION_MS) {
    setStatus(`Merci de prendre quelques secondes supplémentaires (${Math.ceil((MIN_COMPLETION_MS-(now-started))/1000)}s).`, true); return;
  }
  if (!validate()) return;

  const btn = document.querySelector('.btn-submit');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Envoi en cours…';

  try {
    await sendToDiscord(collectAnswers());
    localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
    showPage('page-confirmation');
  } catch(err) {
    console.error(err);
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Envoyer mes réponses';
    setStatus("Connexion indisponible. Vérifiez Internet puis réessayez.", true);
  }
}

// ─── Init ───
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
