import re
import json, sys, html
S = sys.argv[1]
paras = json.load(open(f"{S}/paras.json"))
notes = [  # (§, exact substring, note)
 (1,"dot","<b>dot</b> : argent ou biens apportés par la femme au mariage."),
 (1,"espérances","<b>espérances</b> : héritage attendu."),
 (1,"commis","<b>commis</b> : petit employé de bureau."),
 (2,"déclassée","<b>déclassée</b> : qui a perdu son rang social."),
 (3,"Bretonne","<b>la petite Bretonne</b> : la jeune bonne, venue de Bretagne comme beaucoup de domestiques à Paris."),
 (3,"torchères","<b>torchères</b> : grands chandeliers."),
 (3,"calorifère","<b>calorifère</b> : chauffage central."),
 (3,"causerie de cinq heures","<b>la causerie de cinq heures</b> : le thé de l'après-midi, moment mondain."),
 (4,"gélinotte","<b>gélinotte</b> : petit gibier à plumes, mets de luxe."),
 (6,"couvent","<b>couvent</b> : pensionnat religieux où étaient éduquées les jeunes filles."),
 (10,"Ramponneau","<b>Mme Georges Ramponneau</b> : l'épouse du ministre ; nom à consonance comique."),
 (21,"nippée","<b>nippée</b> (fam.) : habillée."),
 (27,"Nanterre","<b>Nanterre</b> : alors campagne à l'ouest de Paris."),
 (45,"croix vénitienne","<b>croix vénitienne</b> : pendentif en forme de croix, travail de Venise."),
 (48,"rivière de diamants","<b>rivière de diamants</b> : collier fait d'une rangée de diamants."),
 (53,"attachés du cabinet","<b>attachés du cabinet</b> : jeunes collaborateurs personnels du ministre."),
 (58,"fiacre","<b>fiacre</b> : voiture à cheval de location."),
 (60,"noctambules","<b>coupés noctambules</b> : voitures qui ne circulent que la nuit."),
 (61,"rue des Martyrs","<b>rue des Martyrs</b> : rue modeste du 9<sup>e</sup> arrondissement, au pied de Montmartre."),
 (81,"Préfecture de police","<b>Préfecture de police</b> : service des objets trouvés."),
 (90,"écrin","<b>écrin</b> : boîte à bijou."),
 (92,"Palais-Royal","<b>Palais-Royal</b> : galeries commerçantes réputées pour leurs bijoutiers."),
 (95,"louis","<b>louis</b> : pièce d'or de 20 francs."),
 (95,"billets","<b>billets</b> : reconnaissances de dette."),
 (95,"usuriers","<b>usuriers</b> : prêteurs à taux excessif."),
 (95,"faire honneur","<b>y faire honneur</b> : payer à l'échéance ce qu'on a signé."),
 (99,"mansarde","<b>mansarde</b> : chambre sous les toits, logement des pauvres."),
 (102,"copie à cinq sous","<b>copie à cinq sous la page</b> : travail de copiste payé à la page (1 sou = 5 centimes)."),
 (104,"taux de l'usure","<b>taux de l'usure</b> : intérêts excessifs."),
 (123,"rudement","<b>rudement</b> (fam.) : très."),
]
from collections import defaultdict
bypar = defaultdict(list)
for n,(p,w,txt) in enumerate(notes,1): bypar[p].append((w,n))
out=[]; num=0; part=1
roman="I II III IV V VI VII".split()
out.append(f'<div class="part">{roman[0]}</div>')
for p in paras:
    if p=="⁂":
        part+=1; out.append(f'<div class="sep">⁂</div><div class="part">{roman[part-1]}</div>'); continue
    num+=1
    h=html.escape(p, quote=False)
    for w,n in bypar.get(num,[]):
        wh=html.escape(w.replace("'","’"),quote=False)
        assert h.count(wh)>=1,(num,w)
        h=h.replace(wh, f'{wh}<sup class="fn">{n}</sup>',1)
    out.append(f'<p class="par"><span class="n">{num}</span>{h}</p>')
assert num==129, num
nt="\n".join(f'<p><b>{n}.</b> {txt.split("</b>",1)[0].replace("<b>","<b>")}</b>{txt.split("</b>",1)[1]}</p>' for n,(p,w,txt) in enumerate(notes,1))
t=open(f"{S}/template.html").read().replace("{{TEXTE}}","\n".join(out)).replace("{{NOTES}}",nt)
open(f"{S}/La_Parure_dossier.html","w").write(t)
print("ok", num, len(notes))
# French typography on body text nodes only
t=open(f"{S}/La_Parure_dossier.html").read()
head,body=t.split("<body>",1)
def fix(seg):
    seg=seg.replace("'", "’")
    seg=re.sub(r"«\s+", "«\u00a0", seg); seg=re.sub(r"\s+»", "\u00a0»", seg)
    seg=re.sub(r"\s+([;:!?])", "\u202f\\1", seg)
    seg=re.sub(r"(\d) (\d{3})", "\\1\u202f\\2", seg)
    return seg
parts=re.split(r"(<[^>]+>)", body)
body="".join(x if x.startswith("<") else fix(x) for x in parts)
open(f"{S}/La_Parure_dossier.html","w").write(head+"<body>"+body)
