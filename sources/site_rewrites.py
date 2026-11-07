"""Reformulations appliquées au contenu du livret du professeur pour le site :
les explications s'adressent directement à l'élève qui travaille seul.
Le livret PDF n'est pas modifié. Chaque remplacement doit s'appliquer exactement une fois."""

REWRITES = [
    # Avant la lecture
    ("Le jeu sonore est un point d'entrée efficace vers la problématique du conte (l'apparence contre la réalité). Signalez honnêtement qu'il s'agit d'une parenté de sens et de son, pas d'étymologie : les apprenants avancés apprécient la nuance.",
     "Ce jeu sonore mène droit à la problématique du conte (l'apparence contre la réalité). Attention : il s'agit d'une parenté de sens et de son, pas d'étymologie."),
    ('<div class="box-title">Réponses attendues</div><p>Réponses libres. Hypothèses fréquentes : une femme pauvre vole ou emprunte un bijou ; un bijou est perdu ou volé ; un mariage d\'argent. Notez les hypothèses au tableau : on y reviendra après la lecture pour les comparer au texte.',
     '<div class="box-title">Pistes de réponse</div><p>Réponses libres. Hypothèses fréquentes : une femme pauvre vole ou emprunte un bijou ; un bijou est perdu ou volé ; un mariage d\'argent. Notez vos hypothèses : après la lecture, comparez-les au texte.'),
    # Compréhension
    ("Faites remarquer que M. Loisel n'a pas de prénom", "Remarquez que M. Loisel n'a pas de prénom"),
    (" Une carte de Paris projetée en classe aide beaucoup.", " Repérez ces lieux sur une carte de Paris : c'est très parlant."),
    ("les apprenants confondent la durée de l'action avec la place qu'elle occupe dans le texte. C'est l'occasion d'introduire la distinction",
     "on confond la durée de l'action avec la place qu'elle occupe dans le texte. D'où l'importance de la distinction"),
    ("Refusez les titres qui dévoilent la fin pour les parties I à VI (« Le faux bijou »), et les titres-phrases trop longs. Faites remarquer la symétrie",
     "Évitez les titres qui dévoilent la fin pour les parties I à VI (« Le faux bijou ») et les titres-phrases trop longs. Remarquez la symétrie"),
    ('<div class="box-title">Critères de correction</div>', '<div class="box-title">Pour vous auto-corriger</div>'),
    ("Les apprenants comprennent souvent mal « espérances » (faux ami du sens moderne). Expliquez le contexte : au",
     "Le mot « espérances » est souvent mal compris (faux ami du sens moderne). Le contexte : au"),
    ("Point de vue personnel attendu, argumenté. Pistes :", "Donnez votre point de vue, en l'argumentant. Pistes :"),
    ("Faites remarquer le <b>présent de vérité générale</b>", "Remarquez le <b>présent de vérité générale</b>"),
    ("Faites observer le déséquilibre", "Observez le déséquilibre"),
    ("Les apprenants jugent souvent le mari « ennuyeux » ; amenez-les à voir aussi sa bonté", "On juge souvent le mari « ennuyeux » ; voyez aussi sa bonté"),
    (" Point de grammaire à signaler aux B2.", " Une construction utile à retenir."),
    ("Notez la mécanique du désir", "Remarquez la mécanique du désir"),
    ("Faites établir ce lien de cause à effet", "Retenez ce lien de cause à effet"),
    ("Faites comparer avec Mathilde à la fin", "Comparez avec Mathilde à la fin"),
    ("Faites calculer : 36 000", "Calculez : 36 000"),
    ("Attendez une justification par le texte :", "Justifiez toujours par le texte :"),
    ("Valorisez les réponses nuancées (<i>« à la fois… et… »</i>).", "La meilleure réponse est nuancée (<i>« à la fois… et… »</i>)."),
    ('<div class="box-title">Critère de correction</div><p>Un point pour V/F, un point pour une justification par citation exacte entre guillemets avec le §. Une paraphrase sans citation vaut un demi-point.',
     '<div class="box-title">Barème</div><p>Un point pour V/F, un point pour une justification par citation exacte entre guillemets avec le §. Une paraphrase sans citation ne vaut qu\'un demi-point : citez le texte !'),
    ("si l'apprenant considère l'invitation", "si l'on considère l'invitation"),
    ("Faites remarquer que la situation finale", "Remarquez que la situation finale"),
    # Vocabulaire
    ("Faites distinguer les suffixes", "Distinguez bien les suffixes"),
    ("Signalez l'adjectif <i>emprunté</i>", "Retenez aussi l'adjectif <i>emprunté</i>"),
    # Grammaire
    ("Les apprenants écriront souvent « enveloppée » : signalez que la règle est subtile, même pour les francophones.",
     "On écrit souvent « enveloppée » par erreur : la règle est subtile, même pour les francophones."),
    (" : à présenter aux C1 ; le PQP est accepté.", " (niveau C1) ; le plus-que-parfait est aussi accepté."),
    ("(piège : les apprenants le transforment souvent en plus-que-parfait)", "(piège fréquent : le transformer en plus-que-parfait)"),
    ("Pour les C1, présentez l'<b>hypothèse mixte</b>", "Niveau C1 : l'<b>hypothèse mixte</b>"),
    ("Les apprenants doivent savoir <b>reconnaître</b> ces formes, pas les produire.", "Il suffit de savoir <b>reconnaître</b> ces formes, pas de les produire."),
    # Analyse
    ("<h3>Réponses attendues : frise et tableau des sommes</h3>", "<h3>Frise et tableau des sommes : éléments de réponse</h3>"),
    ('<div class="box-title">Pour animer la discussion</div>', '<div class="box-title">Pour aller plus loin</div>'),
    ("faites mesurer la longueur de chaque partie", "mesurez la longueur de chaque partie"),
    ("Gardez la prudence : les apprenants aiment convertir en euros, mais les conversions sont très approximatives.", "Prudence avec les conversions en euros : elles sont très approximatives."),
    # Production orale
    ('<div class="tip"><div class="box-title">Conseils à donner</div>', '<div class="why"><div class="box-title">Conseils de lecture</div>'),
    ("beaucoup d'apprenants préfèrent le mari (bonté, sacrifice silencieux). Encouragez une lecture plus nuancée de Mathilde",
     "beaucoup de lecteurs préfèrent le mari (bonté, sacrifice silencieux). Essayez aussi une lecture plus nuancée de Mathilde"),
]

def apply(text):
    for old, new in REWRITES:
        n = text.count(old)
        assert n == 1, f"{n} occurrence(s) pour : {old[:70]}"
        text = text.replace(old, new)
    return text
