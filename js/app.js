/* ===== La Parure — noyau : état, routeur, barre d'outils, panneau ===== */
(function () {
  "use strict";
  const App = (window.App = { views: {}, tabs: [] });
  const root = document.documentElement;

  /* ---------- Utilitaires ---------- */
  App.$ = (s, el = document) => el.querySelector(s);
  App.$$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  App.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  App.el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  App.frag = (html) => { const t = document.createElement("template"); t.innerHTML = html; return t.content; };
  /** Normalise les espaces typographiques et apostrophes (même longueur de chaîne). */
  App.norm = (s) => s.replace(/[  ]/g, " ").replace(/'/g, "’");
  /** Comparaison souple pour la correction. */
  App.simplify = (s) => App.norm(String(s)).toLowerCase().replace(/[.,;:!?«»"()]/g, " ").replace(/\s+/g, " ").trim();
  App.noAccent = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  App.icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  const ICONS = {
    minus: '<path d="M5 12h14"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    font: '<path d="M4 20 10 4l6 16M6.5 14h7"/><path d="M17 20v-6m-2 2h4"/>', speak: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>', focus: '<path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>', notes: '<path d="M4 4h16v12H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
    annot: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>', prof: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    pdf: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M12 12v6m-3-3 3 3 3-3"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/>',
    play: '<path d="M6 4l14 8-14 8z"/>', pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>', star: '<path d="m12 3 2.9 6 6.1.6-4.6 4.2 1.3 6.2L12 17l-5.7 3 1.3-6.2L3 9.6 9.1 9z"/>'
  };

  /* ---------- Stockage local ---------- */
  const NS = "parure:";
  App.get = (k, d) => { try { const v = localStorage.getItem(NS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  App.set = (k, v) => { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } };
  App.prefs = App.get("prefs", {});
  App.savePrefs = () => App.set("prefs", App.prefs);
  App.answers = App.get("answers", {});
  App.saveAnswer = (k, v) => { App.answers[k] = v; App.set("answers", App.answers); };

  /* ---------- Progression ---------- */
  App.progress = App.get("progress", {});
  App.done = (tab, item) => {
    const p = (App.progress[tab] = App.progress[tab] || {});
    if (p[item]) return; p[item] = 1; App.set("progress", App.progress); App.updateProgress();
  };
  App.tabRatio = (t) => { const p = App.progress[t.id] || {}; const n = t.items.filter((i) => p[i]).length; return t.items.length ? n / t.items.length : 0; };
  App.updateProgress = () => {
    const tabs = App.tabs.filter((t) => !t.profOnly);
    const r = tabs.reduce((a, t) => a + App.tabRatio(t), 0) / tabs.length;
    const pct = Math.round(r * 100);
    App.$("#gbar").style.width = pct + "%"; App.$("#gpct").textContent = pct + " %";
    App.tabs.forEach((t) => { const d = App.$(`#tab-${t.id} .dot`); if (!d) return; const x = App.tabRatio(t); d.className = "dot" + (x >= 1 ? " done" : x > 0 ? " part" : ""); });
  };

  /* ---------- Toast, panneau, modale ---------- */
  App.toast = (msg) => { const t = App.$("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(App._tt); App._tt = setTimeout(() => t.classList.remove("show"), 2400); };
  App.openPanel = (kicker, html) => {
    App.$("#panel-k").textContent = kicker; const b = App.$("#panel-body"); b.innerHTML = ""; b.append(typeof html === "string" ? App.frag(html) : html);
    const p = App.$("#panel"); p.classList.add("open"); p.setAttribute("aria-hidden", "false");
    if (matchMedia("(max-width: 700px)").matches) App.$("#scrim").classList.add("show");
    b.scrollTop = 0; App.$("#panel-close").focus({ preventScroll: true });
    return b;
  };
  App.closePanel = () => { const p = App.$("#panel"); p.classList.remove("open"); p.setAttribute("aria-hidden", "true"); App.$("#scrim").classList.remove("show"); };
  App.openModal = (title, content) => {
    const m = App.$("#modal"); App.$("#modal-title").textContent = title; const b = App.$("#modal-body"); b.innerHTML = "";
    b.append(typeof content === "string" ? App.frag(content) : content);
    if (!m.open) m.showModal(); return b;
  };
  App.closeModal = () => { const m = App.$("#modal"); if (m.open) m.close(); };

  /* ---------- Téléchargement ---------- */
  App.download = (name, text) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ---------- Routeur ---------- */
  App.go = (tab, sub) => { const h = "#" + tab + (sub ? "/" + sub : ""); if (location.hash === h) App.route(); else location.hash = h; };
  App.route = () => {
    const [id, sub] = decodeURIComponent(location.hash.slice(1) || App.get("last", "accueil")).split("/");
    let tab = App.tabs.find((t) => t.id === id) || App.tabs[0];
    if (tab.profOnly && !root.classList.contains("prof")) tab = App.tabs[0];
    App.current = tab.id; App.set("last", tab.id + (sub ? "/" + sub : ""));
    App.$$("#tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.id === tab.id)));
    const btn = App.$(`#tab-${tab.id}`); if (btn) btn.scrollIntoView({ block: "nearest", inline: "nearest" });
    const main = App.$("#main"); main.innerHTML = ""; main.className = tab.wide ? "wide" : "";
    const view = document.createElement("div"); view.className = "view"; main.append(view);
    App.views[tab.id](view, sub);
    App.addPager(view, tab);
    App.done(tab.id, "visit");
    document.title = tab.label + " — La Parure";
    App.closePanel(); App.hideSel && App.hideSel();
    if (sub) requestAnimationFrame(() => App.scrollToId(sub)); else window.scrollTo({ top: 0 });
  };
  App.scrollToId = (sub) => {
    const t = document.getElementById(sub); if (!t) return;
    t.scrollIntoView({ behavior: "smooth", block: "start" });
    t.classList.add("flash"); setTimeout(() => t.classList.remove("flash"), 1700);
  };
  App.addPager = (view, tab) => {
    const vis = App.tabs.filter((t) => !t.profOnly || root.classList.contains("prof"));
    const i = vis.indexOf(tab); const prev = vis[i - 1], next = vis[i + 1];
    const pg = App.el(`<div class="pager no-print"><span></span><span></span></div>`);
    if (prev) { const b = App.el(`<button class="btn ghost">← ${App.esc(prev.label)}</button>`); b.onclick = () => App.go(prev.id); pg.children[0].replaceWith(b); }
    if (next) { const b = App.el(`<button class="btn">${App.esc(next.label)} →</button>`); b.onclick = () => App.go(next.id); pg.children[1].replaceWith(b); }
    view.append(pg);
  };

  /* ---------- Préférences ---------- */
  App.setFs = (d) => { const fs = Math.min(24, Math.max(14, (App.prefs.fs || 17) + d)); App.prefs.fs = fs; root.style.setProperty("--fs", fs + "px"); App.savePrefs(); App.toast("Taille du texte : " + fs + " px"); };
  App.toggleClass = (cls, key, on) => { const v = on ?? !root.classList.contains(cls); root.classList.toggle(cls, v); App.prefs[key] = v; App.savePrefs(); return v; };

  /* ---------- Barre d'outils ---------- */
  function buildToolbar() {
    const tb = App.$("#toolbar");
    const btn = (id, icon, label, title, extra = "") => `<button class="tb ${extra}" id="${id}" title="${title}" aria-label="${title}">${App.icon(icon)}<span class="lbl">${label}</span></button>`;
    tb.innerHTML = `
      <span class="tb-group">${btn("tb-fsm", "minus", "A−", "Réduire le texte")}${btn("tb-fsp", "plus", "A+", "Agrandir le texte")}</span>
      ${btn("tb-airy", "font", "Police aérée", "Police plus lisible et espacée")}
      <span class="tb-sep"></span>
      ${btn("tb-speak", "speak", "Écouter", "Lire à voix haute la sélection ou le texte")}
      ${btn("tb-stop", "stop", "Stop", "Arrêter la lecture")}
      ${btn("tb-search", "search", "Rechercher", "Rechercher (raccourci /)", "keep")}
      ${btn("tb-mine", "notes", "Mes notes", "Mes mots, surlignages et notes")}
      ${btn("tb-annot", "annot", "Annotations", "Afficher ou masquer les annotations du texte")}
      <span class="tb-sep"></span>
      ${btn("tb-prof", "prof", "Mode professeur", "Afficher les corrigés détaillés, explications et conseils du livret du professeur", "prof")}
      <span class="tb-sep"></span>
      <a class="tb" href="pdf/La_Parure_dossier_eleve_B2-C1.pdf" download title="Télécharger le dossier élève (PDF)">${App.icon("pdf")}<span class="lbl">PDF élève</span></a>
      <a class="tb" href="pdf/La_Parure_livret_professeur_B2-C1.pdf" download title="Télécharger le livret du professeur (PDF)">${App.icon("pdf")}<span class="lbl">Livret prof</span></a>
      ${btn("tb-print", "print", "Imprimer", "Imprimer cette page")}
      ${btn("tb-focus", "focus", "Concentration", "Mode concentration (masque la navigation)", "focus-keep")}
      ${btn("tb-reset", "reset", "Réinitialiser", "Effacer mes réponses et ma progression")}`;
    const press = (id, v) => App.$("#" + id).setAttribute("aria-pressed", String(!!v));
    App.$("#tb-fsm").onclick = () => App.setFs(-1);
    App.$("#tb-fsp").onclick = () => App.setFs(1);
    App.$("#tb-airy").onclick = () => press("tb-airy", App.toggleClass("airy", "airy"));
    App.$("#tb-annot").onclick = () => { const off = App.toggleClass("no-annot", "noAnnot"); press("tb-annot", !off); };
    App.$("#tb-prof").onclick = () => {
      const on = App.toggleClass("prof", "prof"); press("tb-prof", on);
      App.toast(on ? "Mode professeur activé : corrigés détaillés, explications et conseils affichés" : "Mode élève");
      App.route();
    };
    App.$("#tb-focus").onclick = () => { const on = root.classList.toggle("focus"); press("tb-focus", on); };
    App.$("#tb-print").onclick = () => { App.$$(".reveal").forEach((r) => r.classList.add("show")); window.print(); };
    App.$("#tb-speak").onclick = () => App.speakSmart();
    App.$("#tb-stop").onclick = () => App.stopSpeak();
    App.$("#tb-search").onclick = () => App.openSearch();
    App.$("#tb-mine").onclick = () => App.openMine();
    App.$("#tb-reset").onclick = () => {
      const b = App.openModal("Réinitialiser", `<p>Effacer toutes vos réponses, vos surlignages, vos notes, vos mots enregistrés et votre progression sur cet appareil ? Cette action est définitive.</p><div class="ex-bar"><button class="btn" id="do-reset">Tout effacer</button><button class="btn ghost" id="no-reset">Annuler</button></div>`);
      App.$("#no-reset", b).onclick = App.closeModal;
      App.$("#do-reset", b).onclick = () => { ["answers", "progress", "hl", "words", "last"].forEach((k) => App.set(k, k === "last" ? "accueil" : {}));
        App.answers = {}; App.progress = {}; App.closeModal(); App.updateProgress(); App.route(); App.toast("Données effacées"); };
    };
    press("tb-airy", root.classList.contains("airy")); press("tb-annot", !root.classList.contains("no-annot")); press("tb-prof", root.classList.contains("prof"));
  }

  function buildTabs() {
    const nav = App.$("#tabs");
    nav.innerHTML = App.tabs.map((t) => `<button role="tab" id="tab-${t.id}" data-id="${t.id}" class="${t.profOnly ? "prof-only" : ""}" aria-selected="false"><span class="dot"></span>${App.esc(t.label)}</button>`).join("");
    nav.onclick = (e) => { const b = e.target.closest("button"); if (b) App.go(b.dataset.id); };
  }

  /* ---------- Raccourcis clavier ---------- */
  function keys(e) {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === "Escape") { App.closePanel(); App.hideSel && App.hideSel(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); App.openSearch(); }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const vis = App.tabs.filter((t) => !t.profOnly || root.classList.contains("prof"));
      const i = vis.findIndex((t) => t.id === App.current); const n = vis[i + (e.key === "ArrowRight" ? 1 : -1)];
      if (n) App.go(n.id);
    }
  }

  App.start = () => {
    buildTabs(); buildToolbar();
    App.$("#panel-close").onclick = App.closePanel; App.$("#scrim").onclick = App.closePanel;
    App.$("#modal-close").onclick = App.closeModal;
    App.$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") App.closeModal(); });
    document.addEventListener("keydown", keys);
    window.addEventListener("hashchange", App.route);
    App.updateProgress(); App.route();
  };
  window.addEventListener("DOMContentLoaded", () => App.start());
})();
