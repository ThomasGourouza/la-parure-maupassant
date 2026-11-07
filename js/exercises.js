/* ===== La Parure — moteurs d'exercices ===== */
(function () {
  "use strict";
  const App = window.App;
  const Ex = (App.Ex = {});

  /** Une réponse correspond-elle à une des réponses acceptées ? 2 = exacte, 1 = sans les accents, 0 = non. */
  Ex.match = (val, accepted) => {
    const v = App.simplify(val); if (!v) return 0;
    const acc = accepted.map(App.simplify);
    if (acc.includes(v)) return 2;
    if (acc.map(App.noAccent).includes(App.noAccent(v))) return 1;
    return 0;
  };
  Ex.scoreEl = (ok, total) => { const r = ok / total; return `<span class="score ${r >= .8 ? "good" : r >= .5 ? "mid" : "bad"}">${String(ok).replace(".", ",")} / ${total}</span>`; };

  /** Zone de réponse libre, sauvegardée. */
  Ex.textarea = (key, ph = "Votre réponse…", tab, item) => {
    const t = App.el(`<textarea class="ans" aria-label="Votre réponse" placeholder="${App.esc(ph)}"></textarea>`);
    t.value = App.answers[key] || "";
    let to; t.oninput = () => { clearTimeout(to); to = setTimeout(() => { App.saveAnswer(key, t.value); if (tab && t.value.trim().length > 3) App.done(tab, item || key); }, 300); };
    return t;
  };

  /** Bouton « Voir la réponse » + bloc masqué. */
  Ex.reveal = (html, label = "Voir la réponse", onShow) => {
    const wrap = App.el(`<div></div>`);
    const btn = App.el(`<button class="btn sm ghost eleve-only">${label}</button>`);
    const box = App.el(`<div class="reveal answer"><div class="box-title">Corrigé</div></div>`);
    box.append(typeof html === "string" ? App.frag(html) : html);
    btn.onclick = () => { const s = box.classList.toggle("show"); btn.textContent = s ? "Masquer la réponse" : label; if (s && onShow) onShow(); };
    wrap.append(btn, box); return { wrap, btn, box };
  };

  /** Bloc du livret du professeur (visible en mode professeur). */
  Ex.profBlock = (nodes) => {
    const d = App.el(`<div class="prof-block"></div>`);
    if (!nodes) return d;
    if (typeof nodes === "string") d.append(App.frag(nodes)); else nodes.forEach((n) => d.append(n.cloneNode(true)));
    return d;
  };

  /** Champs à compléter avec correction automatique. items: [{input, accepted:[...], note}] */
  Ex.checkable = (container, items, { key, tab, item, after } = {}) => {
    const saved = App.answers[key] || [];
    items.forEach((it, k) => {
      it.input.classList.add("blank"); if (saved[k] != null) it.input.value = saved[k];
      it.input.addEventListener("input", () => { it.input.classList.remove("ok", "ko"); const fb = it.input.nextElementSibling; if (fb && fb.classList.contains("fb")) fb.remove(); save(); });
      it.input.addEventListener("change", save);
    });
    function save() { App.saveAnswer(key, items.map((it) => it.input.value)); }
    const bar = App.el(`<div class="ex-bar"><button class="btn sm">Vérifier</button><button class="btn sm ghost">Afficher les solutions</button><button class="btn sm ghost">Effacer</button><span class="res"></span></div>`);
    const [bCheck, bSol, bClear] = bar.querySelectorAll("button");
    const fbAfter = (inp, html, cls) => { let fb = inp.nextElementSibling; if (!fb || !fb.classList.contains("fb")) { fb = App.el(`<span class="fb"></span>`); inp.after(fb); } fb.className = "fb " + cls; fb.innerHTML = html; };
    bCheck.onclick = () => {
      let ok = 0;
      items.forEach((it) => {
        const m = Ex.match(it.input.value, it.accepted);
        it.input.classList.remove("ok", "ko"); it.input.classList.add(m ? "ok" : "ko");
        if (m === 2) { ok++; fbAfter(it.input, "✓", "ok-t"); }
        else if (m === 1) { ok += .5; fbAfter(it.input, "attention aux accents : " + App.esc(it.accepted[0]), "ko-t"); }
        else fbAfter(it.input, "✗", "ko-t");
      });
      bar.querySelector(".res").innerHTML = Ex.scoreEl(ok, items.length);
      App.done(tab, item); if (after) after(ok, items.length);
    };
    bSol.onclick = () => { items.forEach((it) => fbAfter(it.input, "→ " + App.esc(it.accepted[0]) + (it.note ? " <span class='small'>(" + App.esc(it.note) + ")</span>" : ""), "ok-t")); if (after) after(null); };
    bClear.onclick = () => { items.forEach((it) => { it.input.value = ""; it.input.classList.remove("ok", "ko"); const fb = it.input.nextElementSibling; if (fb && fb.classList.contains("fb")) fb.remove(); }); bar.querySelector(".res").innerHTML = ""; save(); };
    container.append(bar);
    return bar;
  };

  /** Vrai / faux. rows: [{tr, answer:'V'|'F', justif}] */
  Ex.trueFalse = (rows, { key, tab, item, container }) => {
    const saved = App.answers[key] || {};
    rows.forEach((r, k) => {
      const cell = r.tr.children[1]; cell.innerHTML = "";
      const g = App.el(`<span class="vf" role="group" aria-label="Vrai ou faux"><button data-v="V">V</button><button data-v="F">F</button></span>`);
      cell.append(g);
      const set = (v) => { g.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v))); saved[k] = v; App.saveAnswer(key, saved); };
      if (saved[k]) set(saved[k]);
      g.onclick = (e) => { const b = e.target.closest("button"); if (b) { set(b.dataset.v); r.tr.children[2].innerHTML = ""; r.tr.children[1].classList.remove("ok", "ko"); } };
    });
    const bar = App.el(`<div class="ex-bar"><button class="btn sm">Vérifier et voir les justifications</button><span class="res"></span></div>`);
    bar.querySelector("button").onclick = () => {
      let ok = 0;
      rows.forEach((r, k) => {
        const good = saved[k] === r.answer; if (good) ok++;
        r.tr.children[1].classList.remove("ok", "ko"); r.tr.children[1].classList.add(good ? "ok" : "ko");
        r.tr.children[2].innerHTML = `<b>${r.answer}</b> — ${r.justif}`;
      });
      bar.querySelector(".res").innerHTML = Ex.scoreEl(ok, rows.length); App.done(tab, item);
    };
    container.append(bar);
  };

  /** Classement en deux catégories (glisser-déposer ou clic). */
  Ex.bins = (container, { words, bins, key, tab, item }) => {
    const state = App.answers[key] || {};
    const root = App.el(`<div><p class="small eleve-only">Glissez chaque étiquette dans la bonne colonne, ou cliquez sur une étiquette puis sur une colonne.</p><div class="bank" aria-label="Étiquettes à classer"></div><div class="bins">${bins.map((b, k) => `<div class="bin" data-bin="${k}" tabindex="0"><h5>${App.esc(b.label)}</h5></div>`).join("")}</div></div>`);
    const bank = root.querySelector(".bank"); let selected = null;
    const toks = words.map((w) => { const t = App.el(`<button class="tok" draggable="true">${App.esc(w.t)}</button>`); t.dataset.w = w.t; t.dataset.bin = w.bin; return t; });
    const place = (t, b) => { (b == null ? bank : root.querySelector(`[data-bin="${b}"]`)).append(t); state[t.dataset.w] = b; App.saveAnswer(key, state); t.classList.remove("ok", "ko"); };
    toks.forEach((t) => {
      if (state[t.dataset.w] != null) root.querySelector(`[data-bin="${state[t.dataset.w]}"]`).append(t); else bank.append(t);
      t.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", t.dataset.w); });
      t.onclick = (e) => { e.stopPropagation(); toks.forEach((x) => x.classList.remove("sel")); if (selected === t) { selected = null; if (t.parentElement !== bank) place(t, null); return; } selected = t; t.classList.add("sel"); };
    });
    root.querySelectorAll(".bin").forEach((b) => {
      b.addEventListener("dragover", (e) => { e.preventDefault(); b.classList.add("over"); });
      b.addEventListener("dragleave", () => b.classList.remove("over"));
      b.addEventListener("drop", (e) => { e.preventDefault(); b.classList.remove("over"); const t = toks.find((x) => x.dataset.w === e.dataTransfer.getData("text/plain")); if (t) place(t, +b.dataset.bin); });
      const act = () => { if (selected) { place(selected, +b.dataset.bin); selected.classList.remove("sel"); selected = null; } };
      b.onclick = act; b.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } };
    });
    container.append(root);
    const bar = App.el(`<div class="ex-bar"><button class="btn sm">Vérifier</button><button class="btn sm ghost">Recommencer</button><span class="res"></span></div>`);
    const [bc, br] = bar.querySelectorAll("button");
    bc.onclick = () => { let ok = 0; toks.forEach((t) => { const p = t.parentElement.dataset.bin; const good = p != null && +p === +t.dataset.bin; if (good) ok++; t.classList.remove("ok", "ko"); if (p != null) t.classList.add(good ? "ok" : "ko"); }); bar.querySelector(".res").innerHTML = Ex.scoreEl(ok, toks.length); App.done(tab, item); };
    br.onclick = () => toks.forEach((t) => place(t, null));
    container.append(bar);
  };

  /** Association mot → définition par listes déroulantes. */
  Ex.matching = (container, { left, right, key: answerKey, solution, tab, item }) => {
    const saved = App.answers[answerKey] || {};
    const root = App.el(`<div></div>`);
    const sels = left.map((l, k) => {
      const row = App.el(`<div class="match-row"><span class="w">${k + 1}. ${App.esc(l)}</span><select class="blank" aria-label="Définition de ${App.esc(l)}"><option value="">— choisir —</option>${right.map((r, j) => `<option value="${j}">${String.fromCharCode(97 + j)}. ${App.esc(r)}</option>`).join("")}</select></div>`);
      const s = row.querySelector("select"); if (saved[k] != null) s.value = saved[k];
      s.onchange = () => { saved[k] = s.value; App.saveAnswer(answerKey, saved); s.classList.remove("ok", "ko"); };
      root.append(row); return s;
    });
    container.append(root);
    const bar = App.el(`<div class="ex-bar"><button class="btn sm">Vérifier</button><button class="btn sm ghost">Afficher les solutions</button><span class="res"></span></div>`);
    const [bc, bs] = bar.querySelectorAll("button");
    bc.onclick = () => { let ok = 0; sels.forEach((s, k) => { const g = +s.value === solution[k] && s.value !== ""; if (g) ok++; s.classList.remove("ok", "ko"); s.classList.add(g ? "ok" : "ko"); }); bar.querySelector(".res").innerHTML = Ex.scoreEl(ok, sels.length); App.done(tab, item); };
    bs.onclick = () => { sels.forEach((s, k) => { s.value = solution[k]; s.classList.remove("ko"); s.classList.add("ok"); saved[k] = String(solution[k]); }); App.saveAnswer(answerKey, saved); };
    container.append(bar);
  };

  /** Cartes mémoire. */
  Ex.flashcards = (container, cards, { tab, item }) => {
    const known = App.get("known", {});
    let deck = cards.filter((c) => !known[c.id]); if (!deck.length) deck = cards.slice();
    let i = 0;
    const root = App.el(`<div class="flash-wrap"><div class="small"><span class="cnt"></span></div><div class="fcard" tabindex="0" role="button" aria-label="Retourner la carte"><div class="in"><div class="f"></div><div class="b"></div></div></div>
      <div class="ex-bar"><button class="btn sm ghost" data-a="prev">←</button><button class="btn sm ghost" data-a="flip">Retourner</button><button class="btn sm green" data-a="know">Je sais</button><button class="btn sm" data-a="again">À revoir</button><button class="btn sm ghost" data-a="say">${App.icon("speak")}</button><button class="btn sm ghost" data-a="shuffle">Mélanger</button></div></div>`);
    const card = root.querySelector(".fcard");
    const show = () => {
      const c = deck[i]; card.classList.remove("flip");
      root.querySelector(".f").innerHTML = `${App.esc(c.mot)}<small>§ ${c.par.join(", ")}</small>`;
      root.querySelector(".b").innerHTML = `<div>${App.esc(c.def)}</div>${c.ex ? `<small><i>${App.esc(c.ex)}</i></small>` : ""}`;
      root.querySelector(".cnt").textContent = `Carte ${i + 1} / ${deck.length} · maîtrisées : ${Object.keys(known).length} / ${cards.length}`;
    };
    card.onclick = () => card.classList.toggle("flip");
    card.onkeydown = (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); card.classList.toggle("flip"); } };
    root.querySelector(".ex-bar").onclick = (e) => {
      const a = e.target.closest("button")?.dataset.a; if (!a) return;
      if (a === "flip") card.classList.toggle("flip");
      if (a === "prev") { i = (i - 1 + deck.length) % deck.length; show(); }
      if (a === "know") { known[deck[i].id] = 1; App.set("known", known); App.done(tab, item); i = (i + 1) % deck.length; show(); }
      if (a === "again") { delete known[deck[i].id]; App.set("known", known); i = (i + 1) % deck.length; show(); }
      if (a === "say") App.speak(deck[i].mot.replace(/\(.*?\)/g, ""));
      if (a === "shuffle") { deck.sort(() => Math.random() - .5); i = 0; show(); }
    };
    container.append(root); show();
  };

  /** Éditeur de production écrite avec compteur de mots. */
  Ex.editor = (container, { key, min, max, tools, tab, item, onUnlock }) => {
    const root = App.el(`<div class="editor ex"><div class="toolbox-chips"></div><textarea aria-label="Votre texte" placeholder="Rédigez votre texte ici. Il est enregistré automatiquement sur cet appareil."></textarea>
      <div class="wc"><span class="n">0 mot</span><span class="meter"><i></i></span><span class="small">objectif : ${min}–${max} mots</span></div>
      <div class="ex-bar"><button class="btn sm ghost" data-a="export">Exporter (.txt)</button><button class="btn sm ghost" data-a="copy">Copier</button><button class="btn sm" data-a="model">Comparer avec une copie modèle</button><span class="small hint"></span></div></div>`);
    const ta = root.querySelector("textarea"); ta.value = App.answers[key] || "";
    const tb = root.querySelector(".toolbox-chips");
    (tools || []).forEach((t) => { const c = App.el(`<button class="chip" title="Insérer">${App.esc(t)}</button>`); c.onclick = () => { const s = ta.selectionStart, e = ta.selectionEnd; ta.setRangeText((s && !/\s$/.test(ta.value.slice(0, s)) ? " " : "") + t + " ", s, e, "end"); ta.focus(); ta.dispatchEvent(new Event("input")); }; tb.append(c); });
    const modelBtn = root.querySelector('[data-a="model"]'), hint = root.querySelector(".hint");
    const count = () => {
      const n = (ta.value.match(/[A-Za-zÀ-ÿœŒ0-9]+(?:[’'-][A-Za-zÀ-ÿœŒ]+)*/g) || []).length;
      root.querySelector(".n").textContent = n + (n > 1 ? " mots" : " mot");
      const m = root.querySelector(".meter"); m.querySelector("i").style.width = Math.min(100, (n / max) * 100) + "%";
      m.classList.toggle("okk", n >= min && n <= max); m.classList.toggle("over", n > max * 1.1);
      const unlocked = n >= min || document.documentElement.classList.contains("prof");
      modelBtn.disabled = !unlocked; modelBtn.style.opacity = unlocked ? 1 : .5;
      hint.textContent = unlocked ? "" : `La copie modèle se débloque à partir de ${min} mots.`;
      if (n >= min) App.done(tab, item);
      return n;
    };
    let to; ta.oninput = () => { count(); clearTimeout(to); to = setTimeout(() => App.saveAnswer(key, ta.value), 300); };
    root.querySelector(".ex-bar").onclick = (e) => {
      const a = e.target.closest("button")?.dataset.a;
      if (a === "export") App.download(key.replace(/[:]/g, "-") + ".txt", ta.value);
      if (a === "copy") { navigator.clipboard?.writeText(ta.value).then(() => App.toast("Texte copié"), () => App.toast("Copie impossible")); }
      if (a === "model" && !modelBtn.disabled) onUnlock && onUnlock();
    };
    container.append(root); count();
  };

  /** Grille d'évaluation interactive (lignes du tableau : critère / points / descripteur). */
  Ex.grid = (table, { key, tab, item }) => {
    const saved = App.answers[key] || {};
    table.classList.add("grid-eval");
    let maxTotal = 0; const sels = [];
    App.$$("tr", table).slice(1).forEach((tr, k) => {
      const cell = tr.children[1]; const m = cell.textContent.match(/\/\s*(\d+)/); if (!m) return;
      const max = +m[1]; maxTotal += max;
      const s = App.el(`<select class="blank" aria-label="Points">${Array.from({ length: max * 2 + 1 }, (_, j) => j / 2).map((v) => `<option value="${v}">${String(v).replace(".", ",")}</option>`).join("")}</select>`);
      s.value = saved[k] ?? 0; cell.innerHTML = ""; cell.append(s, App.el(`<span class="small"> / ${max}</span>`)); sels.push(s);
      s.onchange = () => { saved[k] = s.value; App.saveAnswer(key, saved); total(); App.done(tab, item); };
    });
    const out = App.el(`<p class="grid-total"></p>`); table.after(out);
    const total = () => { const t = sels.reduce((a, s) => a + +s.value, 0); out.textContent = `Total : ${String(t).replace(".", ",")} / ${maxTotal}`; };
    total();
  };

  /** Minuteur. */
  Ex.timer = (container, presets) => {
    const root = App.el(`<div class="timer"><span class="clock">00:00</span><span class="tb-group">${presets.map(([l, s]) => `<button class="btn sm ghost" data-s="${s}">${l}</button>`).join("")}</span><button class="btn sm" data-a="go">${App.icon("play")} Démarrer</button><button class="btn sm ghost" data-a="reset">Remise à zéro</button></div>`);
    let left = presets[0][1], tick = null; const clock = root.querySelector(".clock"), go = root.querySelector('[data-a="go"]');
    const draw = () => { const m = Math.floor(left / 60), s = left % 60; clock.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"); };
    const stop = () => { clearInterval(tick); tick = null; go.innerHTML = App.icon("play") + " Démarrer"; };
    root.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.s) { stop(); left = +b.dataset.s; root.classList.remove("done"); draw(); }
      if (b.dataset.a === "reset") { stop(); left = presets[0][1]; root.classList.remove("done"); draw(); }
      if (b.dataset.a === "go") {
        if (tick) { stop(); return; }
        App.done("oral", "timer");
        go.innerHTML = App.icon("pause") + " Pause";
        tick = setInterval(() => { left--; draw(); if (left <= 0) { stop(); root.classList.add("done"); App.toast("Temps écoulé !"); } }, 1000);
      }
    };
    draw(); container.append(root);
  };
})();
