/* ===== La Parure — onglets : contenu des deux PDF rendu interactif ===== */
(function () {
  "use strict";
  const App = window.App, Ex = App.Ex, E = window.ELEVE, X = window.EXPL, T = window.TEXTE;
  const $ = App.$, $$ = App.$$;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, k) => a + k);

  App.tabs = [
    { id: "accueil", label: "Accueil", items: ["visit"] },
    { id: "avant", label: "Avant la lecture", items: ["visit", "q1", "q2", "q3", "q4"] },
    { id: "texte", label: "Le texte", wide: true, items: ["visit", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "calques"] },
    { id: "comprehension", label: "Compréhension", items: ["visit", ...range(1, 31).map((n) => "q" + n), "titres", "vf", "schema"] },
    { id: "vocabulaire", label: "Vocabulaire", items: ["visit", "flash", "ex1", "ex2", "ex3", "ex4", "ex5", "ex6"] },
    { id: "grammaire", label: "Grammaire", items: ["visit", "ex1", "ex2", "ex3", "pqp", "ex4", "ex5", "ex6", "ex7", "ex8", "ex9", "E"] },
    { id: "analyse", label: "Analyse", wide: true, items: ["visit", "exp1", "exp2", "axes"] },
    { id: "ecrit", label: "Production écrite", items: ["visit", "redaction", "grille"] },
    { id: "oral", label: "Production orale", items: ["visit", "timer", "grille"] },
    { id: "corriges", label: "Corrigés", items: ["visit"] },
    { id: "plus", label: "Pour aller plus loin", items: ["visit"] },
    { id: "enseignant", label: "Espace enseignant", hidden: true, items: ["visit"] }
  ];

  /* ---------- Outils DOM ---------- */
  const holder = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d; };
  /** Regroupe les enfants d'un conteneur : startKey(el) → clé ou null ; stop(el) → fin de groupe. */
  function groups(container, startKey, stop) {
    const map = new Map(); let cur = null;
    Array.from(container.children).forEach((el) => {
      const k = startKey(el);
      if (k != null) { cur = k; map.set(k, [el]); return; }
      if (stop && stop(el)) { cur = null; return; }
      if (cur != null) map.get(cur).push(el);
    });
    return map;
  }
  function wrap(nodes, cls = "") { const d = document.createElement("div"); d.className = cls; nodes[0].before(d); nodes.forEach((n) => d.append(n)); return d; }
  const exKey = (el) => { const m = el.textContent.match(/^\s*Exercice\s+(\d+)/); return m && (el.tagName === "H4" || el.tagName === "P") ? "ex" + m[1] : null; };
  const rest = (map, k) => (map.get(k) || []).slice(1);
  const outer = (nodes) => nodes.map((x) => x.outerHTML).join("");

  /* ---------- Explications (livret reformulé pour l'élève), découpées par question / exercice ---------- */
  const XQ = groups(holder(X.comprehension), (el) => {
    if (el.matches("p.q")) { const m = el.textContent.match(/^\s*(\d+)\./); return m ? "q" + m[1] : null; }
    if (el.tagName === "H3" && /Vrai ou faux/.test(el.textContent)) return "vf";
    if (el.tagName === "H3" && /Schéma/.test(el.textContent)) return "schema";
    return null;
  }, (el) => /H[234]/.test(el.tagName));
  const byEx = (html, keyFn) => groups(holder(html), keyFn, (el) => /H[23]/.test(el.tagName));
  const XV = byEx(X.vocabulaire, exKey);
  const XG = byEx(X.grammaire, (el) => exKey(el) || (el.tagName === "H4" && /plus-que-parfait/.test(el.textContent) ? "pqp" : el.tagName === "H4" && /^E\./.test(el.textContent.trim()) ? "E" : null));

  /* Corrigés courts du dossier élève */
  const CORR = { q: {}, voc: {}, gram: {}, den: "" };
  (function () {
    const c = holder(E.corriges);
    $$("ol", c).forEach((ol) => { const st = +(ol.getAttribute("start") || 1); $$(":scope > li", ol).forEach((li, k) => CORR.q[st + k] = li.innerHTML); });
    let sec = null, sub = null;
    Array.from(c.children).forEach((el) => {
      if (el.tagName === "H3") sec = /Vocabulaire/.test(el.textContent) ? "voc" : /Grammaire/.test(el.textContent) ? "gram" : /dénouement/.test(el.textContent) ? "den" : /Compréhension/.test(el.textContent) ? "comp" : null;
      else if (el.tagName === "H4" && sec === "comp") sub = el.textContent.trim()[0];
      else if (el.tagName === "P" && sec === "comp") { if (sub === "C") CORR.vf = el.innerHTML; if (sub === "D") CORR.schema = el.innerHTML; }
      else if (el.tagName === "P" && (sec === "voc" || sec === "gram")) { const m = el.textContent.match(/^\s*(?:Ex\.\s*(\d+)|(E))\./); if (m) CORR[sec][m[1] ? "ex" + m[1] : "E"] = el.innerHTML; }
      else if (sec === "den") CORR.den += el.outerHTML;
    });
  })();

  /* Texte des questions (pour le lecteur) */
  const QTXT = {};
  $$("ol.qlist", holder(E.comprehension)).forEach((ol) => { const st = +(ol.getAttribute("start") || 1); $$(":scope > li", ol).forEach((li, k) => { const c = li.cloneNode(true); $$("table", c).forEach((t) => t.remove()); QTXT[st + k] = c.innerHTML; }); });
  App.qText = (n) => QTXT[n] || "";

  /** Sous une question : réponse libre + « Voir la réponse » (corrigé puis explications). */
  function answerTools(target, { key, tab, item, corr, detail, ph, noText }) {
    const box = App.el(`<div class="qtools-wrap"></div>`);
    if (!noText) box.append(Ex.textarea(key, ph, tab, item));
    const tools = App.el(`<div class="qtools"></div>`); box.append(tools);
    if (corr || (detail && detail.length)) tools.append(Ex.reveal(corr, detail).wrap);
    target.append(box);
    return box;
  }
  /** Barre « Voir la réponse » à la fin d'un exercice. */
  function exTools(group, corr, detail) {
    const tools = App.el(`<div class="qtools"></div>`);
    if (corr || (detail && detail.length)) tools.append(Ex.reveal(corr, detail).wrap);
    group.append(tools);
  }

  /* ================= ACCUEIL ================= */
  App.views.accueil = (v) => {
    const last = App.get("last", "avant").split("/")[0];
    v.innerHTML = `
      <section class="hero">
        <div>
          <div class="kicker">Étude de texte interactive · FLE B2–C1</div>
          <div class="author">Guy de Maupassant</div>
          <h1>La Parure</h1>
          <div class="date">Conte paru dans <i>Le Gaulois</i>, 17 février 1884</div>
          <div class="orn">⁂</div>
          <p>Lisez le texte intégral annoté, cliquez sur les mots et les phrases pour les comprendre, entraînez-vous avec des exercices corrigés et expliqués, et préparez vos productions écrites et orales.</p>
          <div class="cta"><button class="btn" data-go="${last === "accueil" || last === "enseignant" ? "avant" : last}">Commencer / reprendre</button><button class="btn ghost" data-go="texte">Lire le texte</button></div>
        </div>
        <aside class="meta-list">
          <b>Niveau</b>B2 – C1 (CECRL) · lycée, université, adultes
          <b>Durée indicative</b>4 séances de 1 h 30 + travail personnel
          <b>Travailler seul</b>Sous chaque question : « Voir la réponse », puis « Comprendre la réponse » pour l’explication détaillée.
          <b>Source</b><i>Contes du jour et de la nuit</i>, Marpon et Flammarion, 1885 — Wikisource (domaine public)
          <b>Documents</b><a href="pdf/La_Parure_dossier_eleve_B2-C1.pdf" download>Dossier élève (PDF, 37 p.)</a><br><a href="pdf/La_Parure_livret_professeur_B2-C1.pdf" download>Livret du professeur (PDF, 50 p.)</a>
          <b>Enseignants</b><a href="#enseignant">Espace enseignant</a> : mode d’emploi, conseils pédagogiques, clé rapide.
        </aside>
      </section>
      <h3 style="margin-top:0">Votre parcours</h3>
      <div class="cards" id="cards"></div>
      <div id="eleve-accueil"></div>`;
    const desc = { avant: "Biographie, contexte, anticipation", texte: "Texte intégral annoté et cliquable", comprehension: "31 questions, vrai/faux, schéma narratif", vocabulaire: "Glossaire, cartes mémoire, 6 exercices", grammaire: "Temps du récit, discours rapporté, hypothèse", analyse: "Explications linéaires, axes de lecture", ecrit: "3 sujets, éditeur, copies modèles", oral: "Jeux de rôle, débat, monologue, minuteur", corriges: "Tous les corrigés du dossier", plus: "Lectures et ressources" };
    const cards = $("#cards", v);
    App.tabs.filter((t) => t.id !== "accueil" && !t.hidden).forEach((t, k) => {
      const c = App.el(`<button class="card"><div class="k">Étape ${k + 1}</div><div class="t">${App.esc(t.label)}</div><div class="d">${desc[t.id] || ""}</div><div class="pbar"><i style="width:${Math.round(App.tabRatio(t) * 100)}%"></i></div></button>`);
      c.onclick = () => App.go(t.id); cards.append(c);
    });
    $$("[data-go]", v).forEach((b) => b.onclick = () => App.go(b.dataset.go));
    const ea = $("#eleve-accueil", v); ea.innerHTML = E.accueil;
    const map = ["avant", "texte", "comprehension", "vocabulaire", "grammaire", "analyse", "ecrit", "oral", "corriges", "plus"];
    $$(".toc li", ea).forEach((li, k) => { li.tabIndex = 0; li.onclick = () => App.go(map[k]); li.onkeydown = (e) => { if (e.key === "Enter") App.go(map[k]); }; });
    $$("table", ea)[0]?.querySelectorAll("td").forEach((td) => {
      td.innerHTML = td.innerHTML.replace(/(Compréhension|Grammaire|Explication linéaire|Production orale|production écrite|Glossaire|Exercices de vocabulaire)/g, (m) => `<a href="#${{ "Compréhension": "comprehension", "Grammaire": "grammaire", "Explication linéaire": "analyse", "Production orale": "oral", "production écrite": "ecrit", "Glossaire": "vocabulaire", "Exercices de vocabulaire": "vocabulaire" }[m]}">${m}</a>`);
    });
  };

  /* ================= AVANT LA LECTURE ================= */
  App.views.avant = (v) => {
    v.innerHTML = E.avant;
    const xa = groups(holder(X.avant), (el) => (el.tagName === "H4" && /^\s*(\d)\./.test(el.textContent) ? "q" + el.textContent.trim()[0] : null), (el) => el.tagName === "H3");
    $$(".box.gold ol > li", v).forEach((li, k) => answerTools(li, { key: "avant:q" + (k + 1), tab: "avant", item: "q" + (k + 1), detail: rest(xa, "q" + (k + 1)) }));
  };

  /* ================= LE TEXTE ================= */
  App.views.texte = (v) => App.buildReader(v);

  /* ================= COMPRÉHENSION ================= */
  App.views.comprehension = (v) => {
    v.innerHTML = E.comprehension;
    v.querySelector("h2").insertAdjacentHTML("afterend", `<div class="box grey"><div class="box-title">Méthode</div><p>Répondez d’abord par écrit, puis cliquez sur « Voir la réponse ». Si votre réponse est différente, cliquez sur « Comprendre la réponse » : l’explication montre où trouver l’information dans le texte et quelles erreurs éviter.</p></div>`);
    $$("ol.qlist", v).forEach((ol) => {
      const st = +(ol.getAttribute("start") || 1);
      $$(":scope > li", ol).forEach((li, k) => {
        const n = st + k; li.id = "q" + n; li.classList.add("qitem");
        if (n === 4) titres(li);
        const box = answerTools(li, { key: "comp:q" + n, tab: "comprehension", item: "q" + n, corr: CORR.q[n], detail: rest(XQ, "q" + n), noText: n === 4 });
        const pr = window.QUESTIONS_PAR[n];
        if (pr && !(pr[0] === 1 && pr[1] === 129)) {
          const chip = App.el(`<button class="chip">Voir § ${pr[0]}${pr[1] !== pr[0] ? "–" + pr[1] : ""} dans le texte</button>`);
          chip.onclick = () => App.go("texte", "p" + pr[0]); $(".qtools", box).append(chip);
        }
      });
    });
    // Vrai / faux : justifications après vérification, puis explication du barème
    const tVF = $$("table", v).find((t) => /Affirmation/.test(t.textContent));
    const xvf = XQ.get("vf") || [];
    const tX = xvf.find((x) => x.tagName === "TABLE");
    const KEY = ["F", "V", "F", "F", "F", "F", "F", "F", "V", "F"];
    const rows = $$("tr", tVF).slice(1).map((tr, k) => ({ tr, answer: KEY[k], justif: tX ? $$("tr", tX)[k + 1].children[2].innerHTML : "" }));
    const wrapVF = App.el(`<div class="ex" id="vf"></div>`); tVF.before(wrapVF); wrapVF.append(tVF);
    Ex.trueFalse(rows, { key: "comp:vf", tab: "comprehension", item: "vf", container: wrapVF });
    const bar = $(".ex-bar", wrapVF); const why = xvf.filter((x) => x.tagName !== "TABLE" && x.tagName !== "H3");
    if (why.length) bar.append(Ex.reveal(null, why, { label: "Comment bien justifier ?" }).wrap);
    // Schéma narratif
    const sch = $(".schema", v); sch.id = "schema";
    $$(":scope > div", sch).forEach((d, k) => d.append(Ex.textarea("comp:schema" + k, "§ … et résumé", "comprehension", "schema")));
    const wrapS = App.el(`<div class="qtools"></div>`); sch.after(wrapS);
    wrapS.append(Ex.reveal(null, rest(XQ, "schema"), { label: "Voir le schéma corrigé" }).wrap);
  };
  function titres(li) {
    const tbl = $("table", li); if (!tbl) return;
    const saved = App.answers["comp:titres"] || [];
    $$("tr", tbl).slice(1).forEach((tr, k) => {
      const inp = App.el(`<input class="blank" style="width:100%" aria-label="Titre de la partie ${k + 1}">`); inp.value = saved[k] || "";
      inp.oninput = () => { saved[k] = inp.value; App.saveAnswer("comp:titres", saved); if (saved.filter(Boolean).length >= 7) App.done("comprehension", "titres"); App.done("comprehension", "q4"); };
      tr.children[2].innerHTML = ""; tr.children[2].append(inp);
    });
  }

  /* ================= VOCABULAIRE ================= */
  App.views.vocabulaire = (v) => {
    v.innerHTML = E.vocabulaire;
    // Glossaire interactif
    const gl = $$("table", v)[0];
    const G = App.el(`<div class="ex"><div class="subtabs" role="tablist"><button aria-pressed="true" data-s="liste">Liste filtrable</button><button aria-pressed="false" data-s="cartes">Cartes mémoire</button></div><div data-p="liste"><div class="filter"><input type="search" placeholder="Filtrer : un mot, une définition, un n° de §…" aria-label="Filtrer le glossaire"><span class="small cnt"></span></div><div class="table-wrap"><table><thead><tr><th style="width:26%">Mot ou expression</th><th style="width:12%">§</th><th>Sens dans le texte</th><th style="width:6%"></th></tr></thead><tbody></tbody></table></div></div><div data-p="cartes" hidden></div></div>`);
    gl.replaceWith(G);
    const tb = $("tbody", G);
    const fill = (q = "") => {
      const s = App.noAccent(q.toLowerCase()); tb.innerHTML = "";
      const list = window.LEXIQUE.filter((x) => !s || App.noAccent((x.mot + " " + x.def + " " + x.par.join(" ")).toLowerCase()).includes(s));
      list.forEach((x) => {
        const tr = App.el(`<table><tr><td><b>${App.esc(x.mot)}</b></td><td>${x.par.map((p) => `<button class="chip" data-p="${p}">${p}</button>`).join("")}</td><td>${App.esc(x.def)}${x.ex ? `<br><span class="small"><i>${App.esc(x.ex)}</i></span>` : ""}</td><td><button class="tb" aria-label="Écouter">${App.icon("speak")}</button></td></tr></table>`).querySelector("tr");
        $$("[data-p]", tr).forEach((c) => c.onclick = () => App.go("texte", "p" + c.dataset.p));
        $(".tb", tr).onclick = () => App.speak(x.mot.replace(/\(.*?\)/g, ""));
        tb.append(tr);
      });
      $(".cnt", G).textContent = list.length + " / " + window.LEXIQUE.length + " entrées";
    };
    fill(); $(".filter input", G).oninput = (e) => fill(e.target.value);
    let fcDone = false;
    $$(".subtabs button", G).forEach((b) => b.onclick = () => {
      $$(".subtabs button", G).forEach((y) => y.setAttribute("aria-pressed", String(y === b)));
      $$("[data-p='liste'], [data-p='cartes']", G).forEach((p) => p.hidden = p.dataset.p !== b.dataset.s);
      if (b.dataset.s === "cartes" && !fcDone) { fcDone = true; Ex.flashcards($("[data-p='cartes']", G), window.LEXIQUE, { tab: "vocabulaire", item: "flash" }); }
    });
    $$("h3", v)[0].insertAdjacentHTML("afterend", `<p class="small">Le glossaire du dossier, enrichi : ${window.LEXIQUE.length} entrées. Dans « Le texte », chaque mot souligné en pointillé est cliquable.</p>`);

    const exs = groups(v, exKey, (el) => /H[23]/.test(el.tagName));
    const W = {}; exs.forEach((nodes, k) => { W[k] = wrap(nodes, "exgroup"); W[k].id = k; });

    { const g = W.ex1; const cit = $("p.cit", g), tbl = $("table", g);
      const LUXE = ["tentures orientales", "argenteries reluisantes", "fourrures", "bibelots inestimables", "soie ancienne", "torchères de bronze", "truite", "rivière de diamants"];
      const words = cit.textContent.split("·").map((s) => s.trim()).filter(Boolean).map((t) => ({ t, bin: LUXE.includes(App.norm(t)) ? 0 : 1 }));
      const host = App.el(`<div></div>`); cit.replaceWith(host); tbl.remove();
      Ex.bins(host, { words, bins: [{ label: "Le luxe (le rêve)" }, { label: "La pauvreté (la réalité)" }], key: "voc:ex1", tab: "vocabulaire", item: "ex1" }); }
    { const g = W.ex2; const grid = $(".grid2", g); const [ol1, ol2] = $$("ol", grid);
      const host = App.el(`<div></div>`); grid.replaceWith(host);
      Ex.matching(host, { left: $$("li", ol1).map((l) => l.textContent), right: $$("li", ol2).map((l) => l.textContent), key: "voc:ex2", solution: [5, 7, 4, 6, 1, 3, 0, 2], tab: "vocabulaire", item: "ex2" }); }
    { const g = W.ex3; const ACC = [["dot"], ["juraient", "jurent"], ["usurier"], ["pris son parti"], ["écrin"], ["Grisé"], ["nous retourner"], ["parure"]];
      const bankP = $("p.small", g); const words = bankP.textContent.replace(/^.*?:/, "").split("·").map((s) => s.trim());
      const bank = App.el(`<div class="bank">${words.map((w) => `<button class="tok">${App.esc(w)}</button>`).join("")}</div>`); bankP.after(bank);
      let last = null; const items = [];
      $$("ol > li", g).forEach((li, k) => { li.innerHTML = li.innerHTML.replace(/…+/, '<input aria-label="Mot manquant">'); const inp = $("input", li); inp.onfocus = () => last = inp; items.push({ input: inp, accepted: ACC[k] }); });
      bank.onclick = (e) => { const t = e.target.closest(".tok"); if (!t) return; const inp = last || items.find((it) => !it.input.value)?.input; if (inp) { inp.value = t.textContent; inp.dispatchEvent(new Event("input")); inp.focus(); } };
      Ex.checkable(g, items, { key: "voc:ex3", tab: "vocabulaire", item: "ex3" }); }
    { const g = W.ex4; const ACC = [["paré", "parée", "paré(e)"], ["ruiner"], ["un emprunt", "emprunt", "l’emprunt", "un emprunteur", "emprunteur"], ["humilier"], ["l’envie", "envie", "une envie"], ["envieux", "enviable", "envié", "envieuse"], ["le désespoir", "désespoir"], ["séduire"]];
      const items = []; let k = 0;
      $$("td", $("table", g)).forEach((td) => { if (/…/.test(td.textContent)) { td.innerHTML = '<input aria-label="Mot de la même famille">'; items.push({ input: $("input", td), accepted: ACC[k++] }); } });
      Ex.checkable(g, items, { key: "voc:ex4", tab: "vocabulaire", item: "ex4" }); }
    { const g = W.ex5; const saved = App.answers["voc:ex5"] || {};
      $$("tr", $("table", g)).slice(1).forEach((tr, r) => [2, 3].forEach((c) => { const inp = App.el(`<input class="blank" style="width:100%" aria-label="${c === 2 ? "Courant" : "Soutenu"}">`); inp.value = saved[r + "-" + c] || ""; inp.oninput = () => { saved[r + "-" + c] = inp.value; App.saveAnswer("voc:ex5", saved); App.done("vocabulaire", "ex5"); }; tr.children[c].append(inp); })); }
    W.ex6.append(Ex.textarea("voc:ex6", "Vos phrases avec les expressions…", "vocabulaire", "ex6"));
    Object.keys(W).forEach((k) => exTools(W[k], CORR.voc[k], rest(XV, k)));
  };

  /* ================= GRAMMAIRE ================= */
  App.views.grammaire = (v) => {
    v.innerHTML = E.grammaire;
    const key = (el) => exKey(el) || (el.tagName === "H3" && /^\s*B\./.test(el.textContent) ? "pqp" : el.tagName === "H3" && /^\s*E\./.test(el.textContent) ? "E" : null);
    const gs = groups(v, key, (el) => /H[23]/.test(el.tagName));
    const W = {}; gs.forEach((nodes, k) => { W[k] = wrap(nodes, "exgroup"); W[k].id = k; });
    { const g = W.ex1; g.append(Ex.textarea("gram:ex1", "Passé simple : … / Imparfait : … / Effet du § 54 : …", "grammaire", "ex1"));
      const ex = App.el(`<div class="ex"><div class="ex-bar" style="margin-top:0"><label><input type="checkbox"> Colorer les temps dans l’extrait (§ 53–54)</label><span class="small" style="margin-left:auto"><b style="color:var(--ps)">passé simple</b> · <b style="color:var(--imp)">imparfait</b></span></div><div class="extract">${[53, 54].map((i) => App.renderPar(i)).join("")}</div></div>`);
      $("input", ex).onchange = (e) => $(".extract", ex).classList.toggle("L-temps", e.target.checked);
      g.append(ex); }
    { const g = W.ex2; const box = $(".box.grey", g);
      const ACC = [["écoutait"], ["descendait", "descendit"], ["furent"], ["trouvèrent"], ["se mirent"], ["voyaient"], ["descendaient"], ["trouvèrent"], ["ramena"], ["remontèrent"], ["était"], ["songeait"], ["ôta"], ["s’était enveloppé", "s’était enveloppée"], ["poussa"], ["avait"]];
      box.innerHTML = box.innerHTML.replace(/\(([^)]+)\)\s*…+/g, (m, verb) => `(<i>${verb}</i>) <input aria-label="${verb}">`);
      const items = $$("input", box).map((inp, k) => ({ input: inp, accepted: ACC[k], note: k === 1 ? "« descendit » est possible" : k === 13 ? "pas d’accord : COD après le verbe" : "" }));
      const just = rest(XG, "ex2").find((x) => x.querySelector && x.querySelector("table"));
      const jbox = App.el(`<div class="reveal"></div>`); if (just) jbox.append(Ex.detail([just]));
      Ex.checkable(g, items, { key: "gram:ex2", tab: "grammaire", item: "ex2", after: () => jbox.classList.add("show") });
      g.append(jbox); }
    { const g = W.ex9; const ACC = [["soit"], ["s’aperçoive", "ne s’aperçoive"], ["remboursions"], ["ait"], ["ait dit", "ait"]];
      const items = [];
      $$("ol > li", g).forEach((li, k) => { li.innerHTML = li.innerHTML.replace(/…+/, '<input aria-label="Verbe au subjonctif">'); items.push({ input: $("input", li), accepted: ACC[k], note: k === 4 ? "ne lui ait pas dit" : k === 3 ? "ait changé (subjonctif passé)" : "" }); });
      Ex.checkable(g, items, { key: "gram:ex9", tab: "grammaire", item: "ex9" }); }
    ["pqp", "ex4", "ex5", "ex7", "ex8"].forEach((k) => { const g = W[k]; if (!g) return; const ol = $$("ol", g).pop(); $$(":scope > li", ol).forEach((li, j) => li.append(Ex.textarea(`gram:${k}:${j}`, "Votre réponse…", "grammaire", k))); });
    ["ex3", "ex6", "E"].forEach((k) => W[k] && W[k].append(Ex.textarea("gram:" + k, "Votre réponse…", "grammaire", k)));
    Object.keys(W).forEach((k) => exTools(W[k], CORR.gram[k], k === "ex2" ? rest(XG, k).filter((x) => !(x.querySelector && x.querySelector("table"))) : rest(XG, k)));
  };

  /* ================= ANALYSE ================= */
  App.views.analyse = (v) => {
    v.innerHTML = E.analyse;
    const h3s = $$("h3", v);
    const sec = (re) => h3s.find((h) => re.test(h.textContent));
    const take = (h) => { const out = []; let n = h.nextElementSibling; while (n && n.tagName !== "H3") { out.push(n); n = n.nextElementSibling; } return out; };
    const XA = groups(holder(X.analyse), (el) => el.tagName === "H3" ? (/dénouement/.test(el.textContent) ? "den" : /Plans/.test(el.textContent) ? "plans" : /éléments de réponse/.test(el.textContent) ? "rep" : null) : null);

    const split = (h3, paras, id, extras) => {
      const nodes = take(h3); const grid = App.el(`<div class="split" id="${id}"><div class="left"></div><div class="stick"><div class="small">Extrait (§ ${paras[0]}–${paras[paras.length - 1]}) — cliquez sur une citation <span class="cq">soulignée</span> pour la retrouver dans le texte.</div><div class="extract" style="max-height:70vh">${paras.map((i) => App.renderPar(i)).join("")}</div></div></div>`);
      h3.after(grid); nodes.forEach((n) => $(".left", grid).append(n));
      const ext = $(".extract", grid);
      $$("i", grid.querySelector(".left")).forEach((it) => {
        const q = App.norm(it.textContent).replace(/^[«\s]+|[»\s]+$/g, "").replace(/[…]+$/, "").replace(/\[[^\]]*\]/g, "|").split("|")[0].trim();
        if (q.length < 6) return;
        const where = paras.find((i) => App.findInPar(i, q).length);
        if (!where) return;
        it.classList.add("cq"); it.title = "Voir dans l’extrait (§ " + where + ")";
        it.onclick = () => {
          paras.forEach((i) => { const el = $(`#p${i} .pt`, ext); if (el) el.innerHTML = App.renderParText(i); });
          const [s, e] = App.findInPar(where, q)[0];
          const el = $(`#p${where}`, ext); $(".pt", el).innerHTML = App.renderParText(where, [{ s, e, cls: "hit" }]);
          ext.scrollTo({ top: el.offsetTop - ext.offsetTop - 40, behavior: "smooth" });
          App.done("analyse", id);
        };
      });
      $$(".n", ext).forEach((b) => b.onclick = () => App.go("texte", "p" + b.dataset.n));
      if (extras) extras(grid);
      return grid;
    };
    split(sec(/Explication 1/), range(1, 6), "exp1");
    split(sec(/Explication 2/), range(107, 129), "exp2", (grid) => {
      const left = $(".left", grid);
      left.append(App.el(`<h4>À vous : rédigez votre explication</h4>`));
      const MIN = 120;
      const ta = Ex.textarea("ana:den", `Votre explication du dénouement (au moins ${MIN} mots pour débloquer le corrigé rédigé)…`, "analyse", "exp2");
      ta.style.minHeight = "160px"; left.append(ta);
      const tools = App.el(`<div class="qtools"></div>`); left.append(tools);
      tools.append(Ex.reveal(CORR.den, null, { label: "Voir les éléments de réponse" }).wrap);
      const lock = App.el(`<button class="btn sm">Lire l’explication rédigée</button>`); const hint = App.el(`<span class="small"></span>`);
      tools.append(lock, hint);
      const full = Ex.detail(rest(XA, "den")); full.classList.add("reveal"); left.append(full);
      const count = () => (ta.value.match(/[A-Za-zÀ-ÿœŒ]+/g) || []).length;
      const upd = () => { const ok = count() >= MIN; lock.disabled = !ok; lock.style.opacity = ok ? 1 : .5; hint.textContent = ok ? "" : `Se débloque à partir de ${MIN} mots (${count()} pour l’instant).`; };
      ta.addEventListener("input", upd); upd();
      lock.onclick = () => { if (!lock.disabled) { full.classList.toggle("show"); lock.textContent = full.classList.contains("show") ? "Masquer l’explication rédigée" : "Lire l’explication rédigée"; } };
    });
    // Axes en accordéon
    const hAx = sec(/Axes/);
    let cur = null; const accs = [];
    take(hAx).forEach((n) => {
      if (n.tagName === "H4") { cur = App.el(`<details class="acc"><summary>${n.innerHTML}</summary><div></div></details>`); n.replaceWith(cur); accs.push(cur); return; }
      if (n.classList.contains("box") && n.classList.contains("gold")) { cur = null; return; }
      if (cur) cur.querySelector("div").append(n);
    });
    const opened = new Set();
    accs.forEach((d, k) => d.addEventListener("toggle", () => { if (d.open) opened.add(k); if (opened.size >= accs.length) App.done("analyse", "axes"); }));
    const ctl = App.el(`<div class="ex-bar"><button class="btn sm ghost">Tout déplier</button><button class="btn sm ghost">Tout replier</button></div>`);
    const [bo, bc] = $$("button", ctl); bo.onclick = () => accs.forEach((d) => d.open = true); bc.onclick = () => accs.forEach((d) => d.open = false);
    hAx.after(ctl);
    const tl = $(".timeline", v);
    if (tl) {
      const map = [1, 2, 4, 5, 6, 7];
      $$(":scope > div", tl).forEach((d, k) => { d.style.cursor = "pointer"; d.title = "Aller au texte"; d.onclick = () => App.go("texte", "partie" + map[k]); });
      const max = Math.max(...T.parts.map((p) => p.paras.length));
      tl.after(App.el(`<div class="bars"><div class="small">Longueur de chaque partie (nombre de paragraphes)</div>${T.parts.map((p, k) => `<div class="row"><span>Partie ${["I", "II", "III", "IV", "V", "VI", "VII"][k]}</span><span class="bar"><i style="width:${p.paras.length / max * 100}%"></i></span><span>${p.paras.length} §</span></div>`).join("")}<p class="small">La partie IV raconte une seule nuit ; la partie VI, dix ans.</p></div>`));
    }
    const sums = $$("table", v).find((t) => /Somme/.test(t.textContent));
    if (sums) {
      const data = [["10 F (roses)", 10], ["400 F (robe)", 400], ["500 F (le faux)", 500], ["18 000 F (héritage)", 18000], ["36 000 F (la rivière)", 36000]];
      sums.after(App.el(`<div class="bars">${data.map(([l, n]) => `<div class="row"><span>${l}</span><span class="bar"><i style="width:${Math.max(.4, n / 36000 * 100)}%"></i></span><span>${n.toLocaleString("fr-FR")}</span></div>`).join("")}<p class="small">À la même échelle, le vrai prix du bijou (500 F) est presque invisible à côté de la dette (36 000 F).</p></div>`));
      const repN = rest(XA, "rep"); if (repN.length) sums.closest("details")?.querySelector("div").append(Ex.reveal(null, repN, { label: "Voir les éléments de réponse (frise et sommes)" }).wrap);
    }
    const subj = $$(".box.gold", v).pop();
    const st = App.el(`<div></div>`); subj.after(st);
    st.append(Ex.textarea("ana:sujet", "Votre plan ou vos idées pour l’un des sujets…", "analyse", "visit"));
    const tools = App.el(`<div class="qtools"></div>`); tools.append(Ex.reveal(null, rest(XA, "plans").filter((x) => !x.classList.contains("box")).concat(rest(XA, "plans").filter((x) => x.classList.contains("box"))), { label: "Voir des plans détaillés", all: true }).wrap); st.append(tools);
    const notions = $$("table", holder(X.annexes))[1];
    if (notions) { v.append(App.el(`<h3 id="notions">Notions littéraires</h3>`)); const w = App.el(`<div class="table-wrap"></div>`); w.append(notions); v.append(w); }
  };

  /* ================= PRODUCTION ÉCRITE ================= */
  App.views.ecrit = (v) => {
    v.innerHTML = E.ecrit;
    const subj = groups(holder(X.ecrit), (el) => el.tagName === "H3" ? (/Sujet (\d)/.exec(el.textContent) || [])[1] || (/Grille/.test(el.textContent) ? "grille" : null) : null);
    const tools = ["Soudain", "tout à coup", "aussitôt", "le lendemain", "peu à peu", "Certes", "cependant", "en effet", "par conséquent", "d’ailleurs", "ainsi", "en outre", "néanmoins", "En définitive"];
    const lim = [[300, 400], [300, 400], [450, 600]];
    $$(":scope > .box", v).forEach((b, k) => {
      const n = k + 1; const nodes = rest(subj, String(n));
      const iModel = nodes.findIndex((x) => x.classList.contains("model"));
      const criteria = nodes.slice(0, iModel < 0 ? nodes.length : iModel), modelPart = iModel < 0 ? [] : nodes.slice(iModel);
      const host = App.el(`<details class="acc"${App.answers["ecrit:s" + n] ? " open" : ""}><summary>Rédiger le sujet ${n} ici</summary><div></div></details>`);
      b.after(host);
      const inner = $("div", host);
      if (criteria.length) inner.append(Ex.detail(criteria));
      Ex.editor(inner, { key: "ecrit:s" + n, min: lim[k][0], max: lim[k][1], tools, tab: "ecrit", item: "redaction",
        onUnlock: () => { const d = Ex.detail(modelPart); App.openModal("Copie modèle — sujet " + n, d); } });
    });
    const grid = $$("table", v).pop(); Ex.grid(grid, { key: "ecrit:grille", tab: "ecrit", item: "grille" });
    grid.insertAdjacentHTML("beforebegin", `<p class="small">Auto-évaluez votre texte : choisissez les points pour chaque critère.</p>`);
    const gx = rest(subj, "grille"); if (gx.length) { const t = App.el(`<div class="qtools"></div>`); t.append(Ex.reveal(null, gx, { label: "Voir les descripteurs par niveau", all: true }).wrap); v.append(t); }
  };

  /* ================= PRODUCTION ORALE ================= */
  App.views.oral = (v) => {
    v.innerHTML = E.oral;
    const keyFn = (el) => el.tagName === "H3" ? ((/Activité (\d)/.exec(el.textContent) || [])[1] || (/Grille/.test(el.textContent) ? "grille" : null)) : null;
    const xo = groups(holder(X.oral), keyFn);
    const so = groups(v, keyFn);
    const t = App.el(`<div></div>`); v.querySelector("h2").after(t);
    Ex.timer(t, [["10 min", 600], ["30 min", 1800], ["7 min", 420], ["5 min", 300], ["2 min", 120]]);
    t.insertAdjacentHTML("afterbegin", `<p class="small">Minuteur : 10 min de préparation pour les jeux de rôle, 30 min pour le monologue, 5 à 7 min d’exposé.</p>`);
    const labels = { 1: "Conseils de lecture", 2: "Voir des exemples de répliques", 3: "Voir des arguments et citations", 4: "Voir des plans modèles", 5: "Voir des pistes" };
    so.forEach((nodes, k) => {
      const xn = rest(xo, k);
      if (k === "grille") { const tbl = nodes.find((n) => n.tagName === "TABLE"); Ex.grid(tbl, { key: "oral:grille", tab: "oral", item: "grille" }); const tt = App.el(`<div class="qtools"></div>`); tt.append(Ex.reveal(null, xn, { label: "Voir les descripteurs par niveau", all: true }).wrap); tbl.after(tt); return; }
      let anchor = nodes[nodes.length - 1];
      const add = (el) => { anchor.after(el); anchor = el; };
      if (k === "1") { add(App.el(`<div class="ex-bar"><button class="btn sm" id="say-end">${App.icon("speak")} Écouter le dialogue final (§ 110–129)</button></div>`)); add(Ex.detail(xn)); return; }
      if (k === "3") add(Ex.textarea("oral:debat", "Mes trois arguments (avec citations)…", "oral", "visit"));
      if (k === "4") add(Ex.textarea("oral:monologue", "Mon plan d’exposé…", "oral", "visit"));
      const tt = App.el(`<div class="qtools"></div>`); tt.append(Ex.reveal(null, xn, { label: labels[k] || "Voir des pistes", all: true }).wrap); add(tt);
    });
    const se = $("#say-end", v); if (se) se.onclick = () => App.speak(T.paras.slice(109).join(" "));
  };

  /* ================= CORRIGÉS ================= */
  App.views.corriges = (v) => {
    const c = holder(E.corriges); const h2 = $("h2", c);
    v.append(h2, App.el(`<p class="small">Essayez d’abord de répondre dans chaque onglet ! Les corrigés sont repliés : ouvrez une section pour vérifier. Pour les explications détaillées, utilisez « Comprendre la réponse » sous chaque question et chaque exercice.</p>`));
    groups(c, (el) => el.tagName === "H3" ? el.textContent : null).forEach((nodes, title) => {
      const d = App.el(`<details class="acc"><summary>${App.esc(title)}</summary><div></div></details>`);
      nodes.slice(1).forEach((n) => d.querySelector("div").append(n)); v.append(d);
    });
  };

  /* ================= POUR ALLER PLUS LOIN ================= */
  App.views.plus = (v) => { v.innerHTML = E.plus; };

  /* ================= ESPACE ENSEIGNANT (hors navigation) ================= */
  App.views.enseignant = (v) => {
    v.innerHTML = `<h2>Espace enseignant</h2>
      <p>Les élèves trouvent sur le site toutes les réponses et explications du livret, reformulées pour un travail en autonomie. Cette page rassemble ce qui relève de la conduite de classe : mode d’emploi, conseils pédagogiques et clé rapide.</p>
      <div class="ex-bar"><a class="btn" href="pdf/La_Parure_livret_professeur_B2-C1.pdf" download>${App.icon("pdf")} Livret du professeur (PDF)</a><a class="btn ghost" href="pdf/La_Parure_dossier_eleve_B2-C1.pdf" download>${App.icon("pdf")} Dossier élève (PDF)</a></div>
      <div class="subtabs" style="margin-top:18px"><button aria-pressed="true" data-s="mode">Mode d’emploi</button><button aria-pressed="false" data-s="conseils">Conseils pédagogiques</button><button aria-pressed="false" data-s="cle">Clé rapide</button></div>
      <div data-p="mode"></div><div data-p="conseils" hidden></div><div data-p="cle" hidden></div>`;
    $("[data-p='mode']", v).innerHTML = X.accueil.replace(/<h2>.*?<\/h2>/, "");
    // Conseils : toutes les boîtes « Conseil pédagogique », avec leur contexte
    const cons = $("[data-p='conseils']", v);
    const labels = { avant: "Avant la lecture", comprehension: "Compréhension", vocabulaire: "Vocabulaire", grammaire: "Grammaire", analyse: "Analyse", ecrit: "Production écrite", oral: "Production orale" };
    Object.entries(labels).forEach(([id, label]) => {
      const h = holder(X[id]); const tips = $$(".tip", h); if (!tips.length) return;
      const s = App.el(`<section class="ens-section"><h3>${label}</h3></section>`);
      tips.forEach((tip) => {
        let p = tip.previousElementSibling; while (p && !/^(H3|H4)$/.test(p.tagName) && !p.matches("p.q")) p = p.previousElementSibling;
        if (p) s.append(App.el(`<p class="ens-ctx">${App.esc(p.textContent)}</p>`));
        s.append(tip);
      });
      const a = App.el(`<p><a href="#${id}">Ouvrir l’onglet « ${label} » →</a></p>`); s.append(a);
      cons.append(s);
    });
    const cle = $("[data-p='cle']", v);
    cle.innerHTML = X.annexes.replace(/<h2>Annexe 1 — (.*?)<\/h2>/, "<h3>$1</h3>").replace(/<h2[^>]*>Annexe 2 — (.*?)<\/h2>/, '<h3 style="margin-top:30px">$1</h3>');
    const pb = App.el(`<div class="ex-bar no-print"><button class="btn sm">${App.icon("print")} Imprimer la clé</button></div>`); pb.querySelector("button").onclick = () => window.print(); cle.prepend(pb);
    $$(".subtabs button", v).forEach((b) => b.onclick = () => { $$(".subtabs button", v).forEach((y) => y.setAttribute("aria-pressed", String(y === b))); $$("[data-p]", v).forEach((p) => p.hidden = p.dataset.p !== b.dataset.s); });
  };
})();
