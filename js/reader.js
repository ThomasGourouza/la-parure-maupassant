/* ===== La Parure — lecteur annoté ===== */
(function () {
  "use strict";
  const App = window.App;
  const T = window.TEXTE;
  const LETTERS = "A-Za-zÀ-ÖØ-öø-ÿœŒæÆ";
  const isL = (c) => !!c && new RegExp("[" + LETTERS + "]").test(c);
  const NORM = T.paras.map((p) => App.norm(p).toLowerCase());

  /** Toutes les occurrences d'une forme dans un paragraphe (limites de mots). */
  function findAll(i, form) {
    const hay = NORM[i - 1], f = App.norm(form).toLowerCase(), out = [];
    let k = hay.indexOf(f);
    while (k >= 0) {
      if (!isL(hay[k - 1]) && !isL(hay[k + f.length])) out.push([k, k + f.length]);
      k = hay.indexOf(f, k + 1);
    }
    return out;
  }
  App.findInPar = findAll;

  /* Pré-calcul des marques statiques (lexique, annotations, calques) */
  const STATIC = T.paras.map(() => []);
  (function precompute() {
    const add = (i, s, e, cls, data) => STATIC[i - 1].push({ s, e, cls, data });
    // Annotations
    window.ANNOTATIONS.forEach((a) => findAll(a.par, a.quote).slice(0, 1).forEach(([s, e]) => add(a.par, s, e, "anno", { anno: a.id })));
    // Lexique : formes les plus longues d'abord, sans chevauchement
    const forms = [];
    window.LEXIQUE.forEach((x) => x.forms.forEach((f) => forms.push([f, x.id])));
    forms.sort((a, b) => b[0].length - a[0].length);
    const taken = T.paras.map(() => []);
    for (let i = 1; i <= T.paras.length; i++) {
      forms.forEach(([f, id]) => findAll(i, f).forEach(([s, e]) => {
        if (taken[i - 1].some(([a, b]) => s < b && e > a)) return;
        taken[i - 1].push([s, e]); add(i, s, e, "lex", { lex: id });
      }));
    }
    // Calques : champs lexicaux
    const C = window.CALQUES;
    for (let i = 1; i <= T.paras.length; i++) {
      C.luxe.forEach((f) => findAll(i, f).forEach(([s, e]) => add(i, s, e, "c-luxe")));
      C.misere.forEach((f) => findAll(i, f).forEach(([s, e]) => add(i, s, e, "c-misere")));
      C.ps.forEach((f) => findAll(i, f).forEach(([s, e]) => add(i, s, e, "c-ps")));
      const txt = NORM[i - 1];
      const L = "a-zàâäçéèêëîïôöùûüœæ";
      const cond = /^(?:[a-z]’)?(coûterait|dirait|emprunterait|faudrait|laisserait|aurait|payerait|pourrait|reprendrait|serait|trouverait)$/;
      const skipImp = /^(fait|sait|stupéfait)$/;
      const reImp = new RegExp("(?<![" + L + "])((?:[a-z]’)?[" + L + "]+(?:ait|aient))(?![" + L + "])", "g");
      let m;
      while ((m = reImp.exec(txt))) {
        const w = m[1]; if (skipImp.test(w)) continue;
        add(i, m.index, m.index + w.length, cond.test(w) ? "c-cond" : "c-imp");
      }
      const rePqp = new RegExp("(?<![" + L + "])((?:[a-z]’)?(?:avait|avaient|était|étaient)\\s+(?:pas\\s+|point\\s+|plus\\s+|un peu\\s+|tout\\s+|si\\s+)?[" + L + "]+(?:é|ée|és|ées|i|is|ie|u|ue|us|it|ert|eint|ort))(?![" + L + "])", "g");
      const skipPqp = /(c’était fini|était au|était plus jolie|n’était pas aisé|n’était point convaincue|était désolé|n’avait plus|était retrouvé)$/;
      while ((m = rePqp.exec(txt))) { if (!skipPqp.test(m[1])) add(i, m.index, m.index + m[1].length, "c-pqp"); }
      if (/^—/.test(T.paras[i - 1])) STATIC[i - 1].dlg = true;
    }
    C.dil.forEach((d) => findAll(d.par, d.quote).slice(0, 1).forEach(([s, e]) => add(d.par, s, e, "c-dil")));
  })();

  /* Surlignages de l'utilisateur : { par: [{id,s,e,c,note}] } */
  App.hl = App.get("hl", {});
  const saveHl = () => App.set("hl", App.hl);

  /**
   * Rend le texte d'un paragraphe en segments ; chaque segment porte les classes
   * et données de toutes les marques qui le couvrent (pas de problème d'imbrication).
   */
  App.renderParText = (i, extra = []) => {
    const text = T.paras[i - 1];
    const marks = STATIC[i - 1].concat((App.hl[i] || []).map((h) => ({ s: h.s, e: h.e, cls: "hl c" + h.c + (h.note ? " has-note" : ""), data: { hid: h.id } })), extra);
    const cuts = new Set([0, text.length]);
    marks.forEach((m) => { cuts.add(m.s); cuts.add(m.e); });
    const pts = [...cuts].sort((a, b) => a - b);
    let out = "";
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1]; const seg = App.esc(text.slice(a, b));
      const act = marks.filter((m) => m.s <= a && m.e >= b);
      if (!act.length) { out += seg; continue; }
      const cls = new Set(), data = {};
      act.forEach((m) => { m.cls.split(" ").forEach((c) => cls.add(c)); Object.assign(data, m.data || {}); });
      const attrs = Object.entries(data).map(([k2, v]) => ` data-${k2}="${v}"`).join("");
      out += `<span class="${[...cls].join(" ")}"${attrs}>${seg}</span>`;
    }
    return out;
  };
  App.renderPar = (i, extra) => `<p class="par${STATIC[i - 1].dlg ? " dlg" : ""}" id="p${i}" data-i="${i}"><button class="n" data-n="${i}" aria-label="Paragraphe ${i} : questions liées">${i}</button><span class="pt">${App.renderParText(i, extra)}</span></p>`;
  App.refreshPar = (i) => { App.$$(`.par[data-i="${i}"] .pt`).forEach((pt) => { if (pt.closest("#reader")) pt.innerHTML = App.renderParText(i); }); };

  /* ---------- Vue « Le texte » ---------- */
  App.buildReader = (view) => {
    const layersOn = App.get("layers", {});
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII"];
    const partTitles = ["Une femme malheureuse", "L’invitation et la robe", "Le bijou emprunté", "Le bal et la perte", "Le remplacement", "Dix ans de misère", "La révélation"];
    let body = "";
    T.parts.forEach((p, k) => {
      body += (k ? `<div class="part-sep">⁂</div>` : "") + `<div class="part-label" id="partie${k + 1}">Partie ${roman[k]} · ${partTitles[k]}</div>`;
      body += p.paras.map((i) => App.renderPar(i)).join("");
    });
    const layer = (id, label, sw) => `<label><input type="checkbox" data-layer="${id}" ${layersOn[id] ? "checked" : ""}> <span class="sw" style="background:${sw}"></span>${label}</label>`;
    view.innerHTML = `
      <div class="reader">
        <aside class="reader-side no-print">
          <div><h4>Parties</h4><div class="parts">${T.parts.map((p, k) => `<button data-part="${k + 1}">${roman[k]}. ${partTitles[k]} <small>§ ${p.paras[0]}–${p.paras[p.paras.length - 1]}</small></button>`).join("")}</div></div>
          <div class="layers"><h4>Calques</h4>
            ${layer("luxe", "Champ lexical du luxe", "var(--lux)")}
            ${layer("misere", "Champ lexical de la misère", "var(--mis)")}
            ${layer("temps", "Temps verbaux", "var(--ps)")}
            ${layer("dil", "Discours indirect libre", "var(--blue-soft)")}
            ${layer("dialogue", "Dialogues", "var(--gold-soft)")}
            <div class="legend" id="legend-temps" hidden><b style="color:var(--ps)">passé simple</b> · <b style="color:var(--imp)">imparfait</b> · <b style="color:var(--pqp);text-decoration:underline">plus-que-parfait</b> · <i style="color:var(--cond)">conditionnel</i></div>
          </div>
          <div class="legend"><span style="border-bottom:1.5px dotted var(--gold)">mot</span> : cliquez pour la définition.<br><span class="anno">phrase clé</span> : cliquez pour l’analyse.<br>Sélectionnez du texte pour surligner, annoter ou écouter.<br>Cliquez sur un n° de § pour les questions liées.</div>
          <div class="ex-bar"><button class="btn sm" id="read-all">${App.icon("play")} Lire le conte</button></div>
        </aside>
        <article>
          <h2 class="texte-title">LA PARURE</h2>
          <div class="texte-src">Guy de Maupassant · <i>Contes du jour et de la nuit</i>, 1885 · texte intégral</div>
          <div class="texte" id="reader">${body}</div>
        </article>
      </div>`;
    const reader = App.$("#reader", view);
    const applyLayers = () => {
      ["luxe", "misere", "temps", "dil", "dialogue"].forEach((l) => reader.classList.toggle("L-" + l, !!layersOn[l]));
      App.$("#legend-temps", view).hidden = !layersOn.temps;
    };
    applyLayers();
    App.$$("[data-layer]", view).forEach((c) => c.onchange = () => { layersOn[c.dataset.layer] = c.checked; App.set("layers", layersOn); applyLayers(); App.done("texte", "calques"); });
    App.$$("[data-part]", view).forEach((b) => b.onclick = () => App.scrollToId("partie" + b.dataset.part));
    App.$("#read-all", view).onclick = () => App.readFrom(1);
    reader.addEventListener("click", onReaderClick);
    // Progression : chaque partie vue
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) App.done("texte", "p" + en.target.id.replace("partie", "")); }), { rootMargin: "0px 0px -40% 0px" });
    App.$$(".part-label", view).forEach((el) => io.observe(el));
  };

  /* ---------- Clics dans le texte ---------- */
  function sentenceAt(text, pos) {
    const re = /[^.!?…]+(?:[.!?…]+[»\s]*|$)/g; let m;
    while ((m = re.exec(text))) { if (pos >= m.index && pos <= m.index + m[0].length) return m[0].trim(); if (!m[0]) break; }
    return text;
  }
  function wordAtPoint(x, y) {
    let node, off;
    if (document.caretPositionFromPoint) { const c = document.caretPositionFromPoint(x, y); if (!c) return null; node = c.offsetNode; off = c.offset; }
    else if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (!r) return null; node = r.startContainer; off = r.startOffset; }
    if (!node || node.nodeType !== 3) return null;
    const t = node.textContent; let a = off, b = off;
    while (a > 0 && isL(t[a - 1]) || (a > 0 && t[a - 1] === "-" && isL(t[a - 2]))) a--;
    while (b < t.length && (isL(t[b]) || (t[b] === "-" && isL(t[b + 1])))) b++;
    if (a === b) return null;
    return { word: t.slice(a, b), node, a };
  }
  function offsetInPt(pt, node, off) { const r = document.createRange(); r.selectNodeContents(pt); r.setEnd(node, off); return r.toString().length; }

  function onReaderClick(e) {
    const n = e.target.closest(".n"); if (n) { showParQuestions(+n.dataset.n); return; }
    const sel = window.getSelection(); if (sel && !sel.isCollapsed && sel.toString().trim()) return;
    const pt = e.target.closest(".pt"); if (!pt) return;
    const par = +pt.closest(".par").dataset.i;
    const seg = e.target.closest("span[data-lex], span[data-anno], span[data-hid]");
    const w = wordAtPoint(e.clientX, e.clientY);
    let pos = 0; if (w) pos = offsetInPt(pt, w.node, w.a);
    const sentence = sentenceAt(T.paras[par - 1], pos);
    showInfo(par, seg ? seg.dataset : {}, w ? w.word : "", sentence);
  }

  const lexById = Object.fromEntries(window.LEXIQUE.map((x) => [x.id, x]));
  const annoById = Object.fromEntries(window.ANNOTATIONS.map((x) => [x.id, x]));
  App.lexById = lexById; App.annoById = annoById;

  App.lexHtml = (x) => `<h3>${App.esc(x.mot)}</h3><p>${App.esc(x.def)}</p>${x.ex ? `<p class="small"><b>Exemple :</b> <i>${App.esc(x.ex)}</i></p>` : ""}<p class="small">Dans le texte : ${x.par.map((p) => `<button class="chip" data-goto="${p}">§ ${p}</button>`).join("")}</p>`;
  App.annoHtml = (a) => `<h3>${App.esc(a.titre)}</h3><div class="quote">« ${App.esc(a.quote)} » <span class="small">(§ ${a.par})</span></div><p>${App.esc(a.analyse)}</p>${a.notions.length ? `<p class="small"><b>Notions :</b> ${a.notions.map((k) => `<span class="chip" title="${App.esc(window.NOTIONS[k].def)}">${App.esc(window.NOTIONS[k].nom)}</span>`).join("")}</p>${a.notions.map((k) => `<p class="small"><b>${App.esc(window.NOTIONS[k].nom)}</b> : ${App.esc(window.NOTIONS[k].def)}</p>`).join("")}` : ""}`;

  function showInfo(par, data, word, sentence) {
    let html = "";
    if (data.hid) {
      const h = (App.hl[par] || []).find((x) => x.id === data.hid);
      if (h) html += `<div class="box gold"><div class="box-title">Mon surlignage</div><div class="quote">${App.esc(T.paras[par - 1].slice(h.s, h.e))}</div>
        <textarea class="ans" id="hl-note" placeholder="Ma note…">${App.esc(h.note || "")}</textarea>
        <div class="actions"><button class="btn sm" id="hl-save">Enregistrer la note</button><button class="btn sm ghost" id="hl-del">Supprimer le surlignage</button></div></div>`;
    }
    if (data.lex) html += `<div class="box gold"><div class="box-title">Vocabulaire</div>${App.lexHtml(lexById[data.lex])}</div>`;
    if (data.anno) html += `<div class="box"><div class="box-title">Analyse</div>${App.annoHtml(annoById[data.anno])}</div>`;
    if (word && !data.lex) {
      const lw = word.toLowerCase();
      const hits = window.LEXIQUE.filter((x) => x.forms.some((f) => f.toLowerCase().includes(lw)) || x.mot.toLowerCase().includes(lw));
      html += `<div class="box grey"><div class="box-title">Mot</div><h3 style="margin:0 0 6px">${App.esc(word)}</h3>
        ${hits.length ? `<p class="small">Dans le lexique : ${hits.map((x) => `<button class="chip" data-lexid="${x.id}">${App.esc(x.mot)}</button>`).join("")}</p>` : `<p class="small">Ce mot n’est pas dans le lexique du dossier.</p>`}
        <div class="actions"><button class="btn sm" data-say="${App.esc(word)}">${App.icon("speak")} Écouter</button>
        <button class="btn sm ghost" id="save-word">${App.icon("star")} Ajouter à mes mots</button>
        <a class="btn sm ghost" target="_blank" rel="noopener" href="https://fr.wiktionary.org/wiki/${encodeURIComponent(lw)}">Wiktionnaire ↗</a></div></div>`;
    }
    html += `<div class="box grey"><div class="box-title">Phrase · § ${par}</div><div class="quote">${App.esc(sentence)}</div>
      <div class="actions"><button class="btn sm" data-say="${App.esc(sentence)}">${App.icon("speak")} Écouter la phrase</button><button class="btn sm ghost" data-parq="${par}">Questions sur ce §</button></div></div>`;
    const b = App.openPanel("Paragraphe " + par, html);
    wirePanel(b, par, word, sentence, data);
  }

  function wirePanel(b, par, word, sentence, data) {
    App.$$("[data-say]", b).forEach((x) => x.onclick = () => App.speak(x.dataset.say));
    App.$$("[data-goto]", b).forEach((x) => x.onclick = () => App.gotoPar(+x.dataset.goto));
    App.$$("[data-lexid]", b).forEach((x) => x.onclick = () => { const l = lexById[x.dataset.lexid]; const bb = App.openPanel("Vocabulaire", App.lexHtml(l)); wirePanel(bb, par); });
    App.$$("[data-parq]", b).forEach((x) => x.onclick = () => showParQuestions(+x.dataset.parq));
    const sw = App.$("#save-word", b);
    if (sw) sw.onclick = () => { const ws = App.get("words", {}); ws[word.toLowerCase()] = { word, par, sentence, t: Date.now() }; App.set("words", ws); App.toast("« " + word + " » ajouté à mes mots"); App.done("texte", "mots"); };
    const hs = App.$("#hl-save", b), hd = App.$("#hl-del", b);
    if (hs) hs.onclick = () => { const h = App.hl[par].find((x) => x.id === data.hid); h.note = App.$("#hl-note", b).value.trim(); saveHl(); App.refreshPar(par); App.toast("Note enregistrée"); };
    if (hd) hd.onclick = () => { App.hl[par] = App.hl[par].filter((x) => x.id !== data.hid); saveHl(); App.refreshPar(par); App.closePanel(); App.toast("Surlignage supprimé"); };
  }

  App.gotoPar = (i) => {
    App.closePanel();
    if (App.current !== "texte") { App.go("texte", "p" + i); return; }
    App.scrollToId("p" + i);
  };

  function showParQuestions(i) {
    const qs = Object.entries(window.QUESTIONS_PAR).filter(([n, [a, b]]) => i >= a && i <= b && !(a === 1 && b === 129)).map(([n]) => +n);
    let html = `<h3>§ ${i}</h3><div class="quote">${App.esc(T.paras[i - 1])}</div>`;
    if (!qs.length) html += `<p class="small">Aucune question de compréhension ne porte spécifiquement sur ce paragraphe.</p>`;
    qs.forEach((n) => {
      html += `<div class="box grey"><div class="box-title">Question ${n}</div><p>${App.qText ? App.qText(n) : ""}</p>
        <button class="btn sm ghost" data-q="${n}">Répondre dans « Compréhension »</button></div>`;
    });
    const b = App.openPanel("Questions liées", html);
    App.$$("[data-q]", b).forEach((x) => x.onclick = () => { App.closePanel(); App.go("comprehension", "q" + x.dataset.q); });
  }

  /* ---------- Sélection : surligner, noter, écouter ---------- */
  const pop = () => App.$("#selpop");
  App.hideSel = () => pop().classList.remove("show");
  function onSelect() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { App.hideSel(); return; }
    const r = sel.getRangeAt(0);
    const ptA = (r.startContainer.nodeType === 3 ? r.startContainer.parentElement : r.startContainer).closest("#reader .pt");
    const ptB = (r.endContainer.nodeType === 3 ? r.endContainer.parentElement : r.endContainer).closest("#reader .pt");
    const text = sel.toString().trim();
    if (!text) { App.hideSel(); return; }
    const p = pop();
    const inOne = ptA && ptA === ptB;
    p.innerHTML = (inOne ? `<button data-c="1" title="Surligner en jaune"><span class="sw" style="background:var(--hl1)"></span></button><button data-c="2" title="Surligner en vert"><span class="sw" style="background:var(--hl2)"></span></button><button data-c="3" title="Surligner en rose"><span class="sw" style="background:var(--hl3)"></span></button><button data-act="note">Note</button>` : "")
      + `<button data-act="say">${App.icon("speak")}</button><button data-act="lex">Lexique</button>`;
    const rect = r.getBoundingClientRect();
    p.style.left = Math.max(8, Math.min(window.scrollX + rect.left + rect.width / 2 - 110, window.scrollX + document.documentElement.clientWidth - 260)) + "px";
    p.style.top = (window.scrollY + rect.top - 46) + "px";
    p.classList.add("show");
    p.onmousedown = (ev) => ev.preventDefault();
    p.onclick = (ev) => {
      const btn = ev.target.closest("button"); if (!btn) return;
      if (btn.dataset.act === "say") { App.speak(text); App.hideSel(); return; }
      if (btn.dataset.act === "lex") { App.hideSel(); App.openSearch(text); return; }
      if (!inOne) return;
      const par = +ptA.closest(".par").dataset.i;
      const s = offsetInPt(ptA, r.startContainer, r.startOffset), e = offsetInPt(ptA, r.endContainer, r.endOffset);
      if (e <= s) return;
      const h = { id: "h" + Date.now().toString(36), s, e, c: btn.dataset.c ? +btn.dataset.c : 1, note: "" };
      (App.hl[par] = App.hl[par] || []).push(h); saveHl(); sel.removeAllRanges(); App.hideSel(); App.refreshPar(par);
      App.done("texte", "surligner");
      if (btn.dataset.act === "note") showInfo(par, { hid: h.id }, "", sentenceAt(T.paras[par - 1], s));
      else App.toast("Passage surligné — cliquez dessus pour ajouter une note");
    };
  }
  document.addEventListener("mouseup", (e) => { if (e.target.closest && e.target.closest("#selpop")) return; setTimeout(onSelect, 10); });
  document.addEventListener("touchend", (e) => { if (e.target.closest && e.target.closest("#selpop")) return; setTimeout(onSelect, 250); });
  window.addEventListener("scroll", () => { if (!window.getSelection().toString()) App.hideSel(); }, { passive: true });
})();
