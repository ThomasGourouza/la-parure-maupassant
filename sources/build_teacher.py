import re, sys
S = sys.argv[1]
tpl = open(f"{S}/template.html").read()
head = tpl.split("<body>")[0]
head = head.replace('content: "Maupassant · « La Parure » · B2/C1"', 'content: "Livret du professeur · « La Parure » · B2/C1"')
head = head.replace("<title>La Parure — Dossier pédagogique</title>", "<title>La Parure — Livret du professeur</title>")
extra = """
.q { font-family: "Avenir Next", "Helvetica Neue", sans-serif; font-size: 9.6pt; color: #5b5650; font-weight: 500; margin: 4.5mm 0 1.5mm; break-after: avoid; }
.answer, .why, .tip, .model { padding: 2.6mm 4mm; margin: 1.5mm 0 3mm; border-radius: 0 3px 3px 0; break-inside: avoid; }
.answer { border-left: 4px solid #2f6b4f; background: #eef5f0; }
.answer .box-title { color: #2f6b4f; }
.why { border-left: 4px solid var(--gold); background: #faf6ec; }
.why .box-title { color: var(--gold); }
.tip { border-left: 4px solid #3d5a80; background: #eef2f7; }
.tip .box-title { color: #3d5a80; }
.model { border: 1px solid var(--rule); border-left: 4px solid var(--accent); background: #fff; break-inside: auto; font-size: 10.4pt; }
.model .box-title { color: var(--accent); }
.answer p:last-child, .why p:last-child, .tip p:last-child, .model p:last-child, .answer ul:last-child, .why ul:last-child, .tip ul:last-child, .answer ol:last-child { margin-bottom: 0; }
.answer table, .why table { background: #fff; }
.teacher-badge { display: inline-block; margin-top: 2mm; font-family: "Avenir Next", sans-serif; font-weight: 600; font-size: 10pt; letter-spacing: .18em; text-transform: uppercase; color: #fff; background: #2f6b4f; padding: 1.6mm 4mm; border-radius: 1mm; }
.cover .subtitle { margin-top: 8mm; }
h4 { break-after: avoid; }
</style>"""
head = head.replace("</style>", extra, 1)
dossier = open(f"{S}/La_Parure_dossier.html").read()
m = re.search(r'<section class="chapter texte">.*?</section>', dossier, re.S)
texte = m.group(0)
body = "".join(open(f"{S}/teacher_body{i}.html").read() for i in (1, 2, 3)).replace("{{TEXTE}}", texte)
def fix(seg):
    seg = seg.replace("'", "’")
    seg = re.sub(r"«\s+", "«\u00a0", seg); seg = re.sub(r"\s+»", "\u00a0»", seg)
    seg = re.sub(r"\s+([;:!?])", "\u202f\\1", seg)
    seg = re.sub(r"(\d) (\d{3})", "\\1\u202f\\2", seg)
    return seg
parts = re.split(r"(<!--.*?-->|<[^>]+>)", body, flags=re.S)
body = "".join(x if x.startswith("<") else fix(x) for x in parts)
open(f"{S}/La_Parure_livret_professeur.html", "w").write(head + "<body>\n" + body + "\n</body>\n</html>\n")
print("ok")
