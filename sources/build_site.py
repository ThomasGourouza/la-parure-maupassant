"""Génère data/texte.js, data/eleve.js et data/explications.js à partir des sources des deux PDF."""
import json, re, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "sources"
sys.path.insert(0, str(SRC))
from site_rewrites import apply as rewrite

def fix(seg):
    seg = seg.replace("'", "’")
    seg = re.sub(r"«\s+", "«\u00a0", seg); seg = re.sub(r"\s+»", "\u00a0»", seg)
    seg = re.sub(r"\s+([;:!?])", "\u202f\\1", seg)
    seg = re.sub(r"(\d) (\d{3})", "\\1\u202f\\2", seg)
    return seg

def typo(html):
    parts = re.split(r"(<!--.*?-->|<[^>]+>)", html, flags=re.S)
    return "".join(x if x.startswith("<") else fix(x) for x in parts)

def split_sections(html):
    out = {}
    for m in re.finditer(r"<!-- =+ (.+?) =+ -->(.*?)(?=<!-- =+ |\Z)", html, re.S):
        name, body = m.group(1).strip(), m.group(2).strip()
        body = re.sub(r"^<section[^>]*>", "", body).strip()
        body = re.sub(r"</section>\s*(</body>\s*</html>\s*)?$", "", body).strip()
        out[name] = typo(body)
    return out

tpl = (SRC / "template.html").read_text()
body = tpl.split("<body>", 1)[1]
eleve = split_sections(body)
prof = split_sections(rewrite("".join((SRC / f"teacher_body{i}.html").read_text() for i in (1, 2, 3))))
keys_e = {"SOMMAIRE / OBJECTIFS": "accueil", "AVANT LA LECTURE": "avant", "1. COMPRÉHENSION": "comprehension",
          "2. VOCABULAIRE": "vocabulaire", "3. GRAMMAIRE": "grammaire", "4. ANALYSE": "analyse",
          "5. PRODUCTION ÉCRITE": "ecrit", "6. PRODUCTION ORALE": "oral", "CORRIGÉS": "corriges",
          "POUR ALLER PLUS LOIN": "plus"}
keys_p = {"MODE D'EMPLOI": "accueil", "0. AVANT LA LECTURE": "avant", "1. COMPRÉHENSION": "comprehension",
          "2. VOCABULAIRE": "vocabulaire", "3. GRAMMAIRE": "grammaire", "4. ANALYSE": "analyse",
          "5. PRODUCTION ÉCRITE": "ecrit", "6. PRODUCTION ORALE": "oral", "ANNEXES": "annexes"}
E = {v: eleve[k] for k, v in keys_e.items()}
P = {v: prof[k] for k, v in keys_p.items()}
paras = json.loads((SRC / "paras.json").read_text())
parts, cur, n = [], {"n": 1, "paras": []}, 0
for p in paras:
    if p == "⁂":
        parts.append(cur); cur = {"n": len(parts) + 1, "paras": []}; continue
    n += 1; cur["paras"].append(n)
parts.append(cur)
texte = [fix(p) for p in paras if p != "⁂"]
assert len(texte) == 129 and len(parts) == 7
(ROOT / "data/texte.js").write_text("window.TEXTE = " + json.dumps({"paras": texte, "parts": parts}, ensure_ascii=False) + ";\n")
(ROOT / "data/eleve.js").write_text("window.ELEVE = " + json.dumps(E, ensure_ascii=False) + ";\n")
(ROOT / "data/explications.js").write_text("window.EXPL = " + json.dumps(P, ensure_ascii=False) + ";\n")
print({k: len(v) for k, v in E.items()}, {k: len(v) for k, v in P.items()})
