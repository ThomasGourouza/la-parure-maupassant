/* ===== La Parure — outils : voix, recherche, « mes notes » ===== */
(function () {
  "use strict";
  const App = window.App;
  const T = window.TEXTE;

  /* ---------- Lecture à voix haute ---------- */
  const synth = window.speechSynthesis;
  let voice = null;
  const pickVoice = () => { if (!synth) return; const vs = synth.getVoices().filter((v) => /^fr/i.test(v.lang)); voice = vs.find((v) => /fr-FR/i.test(v.lang) && /(Thomas|Amélie|Audrey|Google|Marie|Daniel)/i.test(v.name)) || vs.find((v) => /fr-FR/i.test(v.lang)) || vs[0] || null; };
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
  App.speak = (text, onend) => {
    if (!synth) { App.toast("La synthèse vocale n’est pas disponible dans ce navigateur."); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(App.norm(text).replace(/—/g, ""));
    u.lang = "fr-FR"; if (voice) u.voice = voice; u.rate = App.prefs.rate || .95;
    if (onend) u.onend = onend;
    synth.speak(u);
  };
  App.stopSpeak = () => { App._reading = false; if (synth) synth.cancel(); App.$$(".par.speaking").forEach((p) => p.classList.remove("speaking")); };
  App.readFrom = (i) => {
    if (!synth) { App.toast("La synthèse vocale n’est pas disponible dans ce navigateur."); return; }
    App._reading = true;
    const step = (k) => {
      if (!App._reading || k > T.paras.length) { App.stopSpeak(); return; }
      App.$$(".par.speaking").forEach((p) => p.classList.remove("speaking"));
      const el = document.getElementById("p" + k);
      if (el) { el.classList.add("speaking"); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
      App.speak(T.paras[k - 1], () => { if (App._reading) step(k + 1); });
    };
    step(i);
    App.toast("Lecture en cours — bouton Stop pour arrêter");
  };
  App.speakSmart = () => {
    const s = window.getSelection().toString().trim();
    if (s) { App.speak(s); return; }
    if (App.current === "texte") {
      const pars = App.$$("#reader .par"); const vis = pars.find((p) => p.getBoundingClientRect().top > 120) || pars[0];
      App.readFrom(+vis.dataset.i); return;
    }
    App.toast("Sélectionnez un passage à écouter, ou ouvrez « Le texte ».");
  };

  /* ---------- Recherche ---------- */
  const strip = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent.replace(/\s+/g, " "); };
  let index = null;
  function buildIndex() {
    const lab = Object.fromEntries(App.tabs.map((t) => [t.id, t.label]));
    index = [];
    T.paras.forEach((p, k) => index.push({ where: "Le texte · § " + (k + 1), text: p, go: () => App.gotoPar(k + 1) }));
    window.LEXIQUE.forEach((x) => index.push({ where: "Lexique", text: x.mot + " — " + x.def, go: () => { const b = App.openPanel("Vocabulaire", App.lexHtml(x)); App.$$("[data-goto]", b).forEach((c) => c.onclick = () => App.gotoPar(+c.dataset.goto)); } }));
    Object.entries(window.ELEVE).forEach(([id, html]) => { if (lab[id]) splitSentences(strip(html)).forEach((s) => index.push({ where: lab[id], text: s, tab: id })); });
    Object.entries(window.EXPL).forEach(([id, html]) => { if (!lab[id] || id === "accueil") return; const d = document.createElement("div"); d.innerHTML = html; d.querySelectorAll(".tip").forEach((x) => x.remove()); splitSentences(d.textContent.replace(/\s+/g, " ")).forEach((s) => index.push({ where: lab[id] + " · explications", text: s, tab: id })); });
  }
  const splitSentences = (txt) => txt.split(/(?<=[.!?…])\s+/).filter((s) => s.length > 12);

  App.openSearch = (initial = "") => {
    if (!index) buildIndex();
    const b = App.openModal("Rechercher", `<input class="search-input" type="search" placeholder="Un mot, une expression, une notion… (ex. : rivière, ironie, passé simple)" aria-label="Rechercher"><div class="small" style="margin-top:6px">Recherche dans le texte, le lexique, toutes les sections et les explications détaillées.</div><div class="results"></div>`);
    const inp = App.$("input", b), res = App.$(".results", b);
    const run = () => {
      const q = App.noAccent(App.norm(inp.value.trim()).toLowerCase());
      if (q.length < 2) { res.innerHTML = ""; return; }
      const hits = index.filter((x) => App.noAccent(App.norm(x.text).toLowerCase()).includes(q)).slice(0, 60);
      res.innerHTML = hits.length ? "" : `<p class="small">Aucun résultat.</p>`;
      hits.forEach((h) => {
        const t = App.norm(h.text), pos = App.noAccent(t.toLowerCase()).indexOf(q);
        const a = Math.max(0, pos - 70), snip = (a ? "…" : "") + App.esc(t.slice(a, pos)) + "<mark>" + App.esc(t.slice(pos, pos + q.length)) + "</mark>" + App.esc(t.slice(pos + q.length, pos + q.length + 110)) + "…";
        const btn = App.el(`<button class="result"><div class="w">${App.esc(h.where)}</div><div>${snip}</div></button>`);
        btn.onclick = () => { App.closeModal(); if (h.go) h.go(); else { App.go(h.tab); setTimeout(() => App.findInView(t.slice(pos, pos + q.length + 30)), 120); } };
        res.append(btn);
      });
    };
    inp.value = initial; inp.oninput = run; run(); setTimeout(() => inp.focus(), 30);
  };

  /** Fait défiler la vue jusqu'au premier élément qui contient le texte cherché. */
  App.findInView = (needle) => {
    const n = App.noAccent(App.norm(needle).toLowerCase()).slice(0, 40);
    // ouvrir les blocs repliés qui contiennent le texte
    App.$$("#main details").forEach((d) => { if (App.noAccent(App.norm(d.textContent).toLowerCase()).includes(n)) d.open = true; });
    App.$$("#main .reveal").forEach((d) => { if (App.noAccent(App.norm(d.textContent).toLowerCase()).includes(n)) d.classList.add("show"); });
    const walker = document.createTreeWalker(App.$("#main"), NodeFilter.SHOW_ELEMENT);
    let best = null;
    while (walker.nextNode()) {
      const el = walker.currentNode;
      if (/SCRIPT|STYLE|BUTTON/.test(el.tagName)) continue;
      if (App.noAccent(App.norm(el.textContent).toLowerCase()).includes(n)) best = el; // le plus profond
    }
    if (best) { best.scrollIntoView({ behavior: "smooth", block: "center" }); best.classList.add("hit"); setTimeout(() => best.classList.remove("hit"), 2200); }
  };

  /* ---------- Mes mots, surlignages, réponses ---------- */
  App.openMine = () => {
    const words = App.get("words", {}); const hl = App.get("hl", {});
    const hls = Object.entries(hl).flatMap(([p, arr]) => arr.map((h) => ({ p: +p, ...h }))).sort((a, b) => a.p - b.p || a.s - b.s);
    const nAns = Object.values(App.answers).filter((v) => (typeof v === "string" ? v.trim() : v && Object.keys(v).length)).length;
    const b = App.openModal("Mes notes", `
      <div class="subtabs"><button aria-pressed="true" data-s="w">Mes mots (${Object.keys(words).length})</button><button aria-pressed="false" data-s="h">Surlignages et notes (${hls.length})</button></div>
      <div data-p="w">${Object.keys(words).length ? Object.values(words).sort((a, b) => a.par - b.par).map((w) => `<div class="mine-item"><div class="txt"><b>${App.esc(w.word)}</b> <span class="small">§ ${w.par}</span><div class="small"><i>${App.esc(w.sentence)}</i></div></div><button data-del-w="${App.esc(w.word.toLowerCase())}" aria-label="Supprimer">×</button></div>`).join("") : `<p class="small">Aucun mot enregistré. Dans « Le texte », cliquez sur un mot puis sur « Ajouter à mes mots ».</p>`}</div>
      <div data-p="h" hidden>${hls.length ? hls.map((h) => `<div class="mine-item"><div class="txt"><button class="chip" data-goto="${h.p}">§ ${h.p}</button> <span class="hl c${h.c}">${App.esc(T.paras[h.p - 1].slice(h.s, h.e))}</span>${h.note ? `<div class="small">📝 ${App.esc(h.note)}</div>` : ""}</div><button data-del-h="${h.p}:${h.id}" aria-label="Supprimer">×</button></div>`).join("") : `<p class="small">Aucun surlignage. Dans « Le texte », sélectionnez un passage pour le surligner ou l’annoter.</p>`}</div>
      <p class="small" style="margin-top:14px">Réponses enregistrées dans les exercices : ${nAns}.</p>
      <div class="ex-bar"><button class="btn sm" id="exp-all">Tout exporter (.txt)</button></div>`);
    App.$$(".subtabs button", b).forEach((x) => x.onclick = () => { App.$$(".subtabs button", b).forEach((y) => y.setAttribute("aria-pressed", String(y === x))); App.$$("[data-p]", b).forEach((p) => p.hidden = p.dataset.p !== x.dataset.s); });
    App.$$("[data-goto]", b).forEach((x) => x.onclick = () => { App.closeModal(); App.gotoPar(+x.dataset.goto); });
    App.$$("[data-del-w]", b).forEach((x) => x.onclick = () => { delete words[x.dataset.delW]; App.set("words", words); App.openMine(); });
    App.$$("[data-del-h]", b).forEach((x) => x.onclick = () => { const [p, id] = x.dataset.delH.split(":"); App.hl[p] = (App.hl[p] || []).filter((h) => h.id !== id); App.set("hl", App.hl); App.refreshPar(+p); App.openMine(); });
    App.$("#exp-all", b).onclick = () => {
      let out = "LA PARURE — mes notes\n\n== Mes mots ==\n" + Object.values(words).map((w) => `- ${w.word} (§ ${w.par}) : ${App.norm(w.sentence)}`).join("\n");
      out += "\n\n== Surlignages et notes ==\n" + hls.map((h) => `- § ${h.p} : « ${App.norm(T.paras[h.p - 1].slice(h.s, h.e))} »${h.note ? "\n  Note : " + h.note : ""}`).join("\n");
      out += "\n\n== Mes réponses ==\n" + Object.entries(App.answers).map(([k, v]) => `[${k}]\n${typeof v === "string" ? v : JSON.stringify(v)}`).join("\n\n");
      App.download("la-parure-mes-notes.txt", out);
    };
  };
})();
