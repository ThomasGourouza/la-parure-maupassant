/* Phrases clés cliquables : analyse tirée des explications de texte des deux livrets.
   quote : extrait exact du paragraphe (les espaces typographiques sont normalisés à la recherche). */
window.ANNOTATIONS = [
  { id: "a1", par: 1, quote: "C’était une de ces jolies et charmantes filles", titre: "Une héroïne typique", notions: ["reel"],
    analyse: "Le démonstratif « ces » et le pronom « une » présentent Mathilde comme un type social, un exemple parmi d’autres. Elle n’est pas encore nommée : son prénom n’apparaîtra qu’au § 23." },
  { id: "a2", par: 1, quote: "comme par une erreur du destin", titre: "Le regard de Mathilde", notions: ["focalisation"],
    analyse: "L’incise adopte le point de vue de Mathilde, qui se croit victime d’une injustice. « Comme par » garde une distance ironique : le narrateur ne dit pas que le destin s’est trompé." },
  { id: "a3", par: 1, quote: "connue, comprise, aimée, épousée", titre: "Une gradation de l’impossible", notions: ["gradation"],
    analyse: "Quatre participes passés passifs, de la rencontre au mariage : Mathilde attend tout des autres. Allitération en [k] et assonance en [e]." },
  { id: "a4", par: 1, quote: "elle se laissa marier", titre: "Un mariage subi", notions: [],
    analyse: "La tournure pronominale passive souligne l’absence de volonté. « Petit commis » est péjoratif : on voit le mari à travers le mépris de sa femme." },
  { id: "a5", par: 2, quote: "les femmes n’ont point de caste ni de race", titre: "La voix du narrateur-moraliste", notions: ["verite"],
    analyse: "Le présent de vérité générale fait entendre le narrateur. L’idée est ambiguë : une noblesse naturelle des femmes, mais réduite à la beauté et au charme." },
  { id: "a6", par: 3, quote: "Elle souffrait de la pauvreté de son logement, de la misère des murs, de l’usure des sièges, de la laideur des étoffes", titre: "L’anaphore de la souffrance", notions: ["anaphore", "enumeration"],
    analyse: "Répétition du verbe et énumération de quatre compléments construits sur le même modèle : un rythme obsessionnel. Les objets du quotidien deviennent des blessures." },
  { id: "a7", par: 3, quote: "dont une autre femme de sa caste ne se serait même pas aperçue", titre: "Une souffrance relative", notions: ["ironie"],
    analyse: "Le narrateur relativise : la souffrance de Mathilde vient de son imagination plus que de sa situation réelle (elle a d’ailleurs une bonne)." },
  { id: "a8", par: 3, quote: "Elle songeait aux antichambres muettes", titre: "L’anaphore du rêve", notions: ["anaphore", "bovarysme"],
    analyse: "« Elle songeait » revient quatre fois (§ 3–4). Le rêve s’organise en longues phrases riches en adjectifs et en pluriels : un monde d’abondance, à l’opposé de la réalité." },
  { id: "a9", par: 4, quote: "Ah ! le bon pot-au-feu ! je ne sais rien de meilleur que cela…", titre: "Le contraste comique", notions: ["antithese"],
    analyse: "Seule parole du mari dans la partie I, au discours direct : simple et heureux, il s’oppose au rêve muet de sa femme (truite, gélinotte, argenteries)." },
  { id: "a10", par: 5, quote: "Elle n’avait pas de toilettes, pas de bijoux, rien.", titre: "Le retour brutal au réel", notions: ["gradation"],
    analyse: "Après les longues phrases du rêve, une phrase courte et sèche, en gradation descendante jusqu’au mot « rien ». Les bijoux sont déjà mentionnés : le thème du conte apparaît." },
  { id: "a11", par: 5, quote: "Elle eût tant désiré plaire", titre: "Un désir irréel", notions: [],
    analyse: "Subjonctif plus-que-parfait à valeur de conditionnel passé : le regret d’un désir qui ne se réalisera pas… sauf pendant une seule nuit." },
  { id: "a12", par: 27, quote: "il réservait juste cette somme pour acheter un fusil", titre: "Le sacrifice silencieux", notions: ["focalisation"],
    analyse: "Le narrateur omniscient entre dans les pensées de Loisel : il sacrifie son propre désir sans rien dire. Ce détail prépare ses sacrifices futurs." },
  { id: "a13", par: 48, quote: "demeura en extase devant elle-même", titre: "Le narcissisme", notions: [],
    analyse: "Vocabulaire de la passion (cœur qui bat, désir, mains tremblantes, extase). C’est elle-même parée qu’elle admire, devant le miroir." },
  { id: "a14", par: 54, quote: "dans le triomphe de sa beauté, dans la gloire de son succès", titre: "Le temps suspendu", notions: ["anaphore", "enumeration"],
    analyse: "Une seule forme conjuguée (« dansait ») puis une longue phrase sans verbe : les compléments s’accumulent comme une valse, le temps semble suspendu." },
  { id: "a15", par: 60, quote: "comme s’ils eussent été honteux de leur misère pendant le jour", titre: "Le fiacre, double de Mathilde", notions: ["personnification"],
    analyse: "La voiture, personnifiée, cache sa pauvreté le jour : comme Mathilde, qui fuit le bal pour ne pas être vue dans ses vêtements modestes." },
  { id: "a16", par: 62, quote: "afin de se voir encore une fois dans sa gloire", titre: "Le miroir et la punition", notions: ["ironie"],
    analyse: "Au moment précis où elle veut contempler son triomphe, elle découvre la perte : le miroir, symbole du narcissisme, devient le lieu de la catastrophe." },
  { id: "a17", par: 84, quote: "Cela nous donnera le temps de nous retourner.", titre: "Le choix décisif : mentir", notions: ["ironie"],
    analyse: "S’ils avaient avoué la perte, ils auraient appris que le bijou était faux. Le malheur vient du hasard, mais surtout du choix de mentir." },
  { id: "a18", par: 87, quote: "Loisel, vieilli de cinq ans", titre: "Une hyperbole", notions: ["hyperbole"],
    analyse: "En une semaine, l’angoisse le vieillit : le temps psychologique s’accélère et annonce le vieillissement réel des dix ans de misère." },
  { id: "a19", par: 98, quote: "Si elle s’était aperçue de la substitution, qu’aurait-elle pensé ?", titre: "Les craintes de Mathilde", notions: ["dil", "ironie"],
    analyse: "Discours indirect libre : questions sans verbe introducteur. Ironie dramatique : si Mme Forestier avait ouvert l’écrin, elle aurait trouvé un vrai collier à la place de son faux." },
  { id: "a20", par: 99, quote: "Il fallait payer cette dette effroyable. Elle payerait.", titre: "La décision héroïque", notions: ["dil"],
    analyse: "Discours indirect libre : la volonté de Mathilde se fait entendre. « Héroïquement » est à la fois sérieux (courage) et ironique (cause dérisoire)." },
  { id: "a21", par: 103, quote: "Et cette vie dura dix ans.", titre: "Dix ans en une phrase", notions: ["ellipse"],
    analyse: "Un paragraphe d’une seule phrase pour dix années : sommaire et accélération du récit vers la scène finale." },
  { id: "a22", par: 105, quote: "la femme forte, et dure, et rude, des ménages pauvres", titre: "Une métamorphose", notions: ["polysyndete"],
    analyse: "La répétition de « et » insiste sur la transformation. Les « ongles roses » sont devenus des « mains rouges »." },
  { id: "a23", par: 106, quote: "Comme il faut peu de chose pour vous perdre ou vous sauver !", titre: "Le hasard", notions: ["dil", "verite"],
    analyse: "Passage polyphonique : la rêverie de Mathilde se mêle à la voix du narrateur-moraliste (présent de vérité générale, « vous » généralisant)." },
  { id: "a24", par: 107, quote: "toujours jeune, toujours belle, toujours séduisante", titre: "L’anaphore de l’immobilité", notions: ["anaphore"],
    analyse: "Rythme ternaire : la riche, que le temps n’atteint pas, s’oppose à Mathilde transformée. « Séduisante » rappelle le rêve de Mathilde (§ 5)." },
  { id: "a25", par: 108, quote: "Allait-elle lui parler ? Oui, certes.", titre: "Une délibération intérieure", notions: ["dil"],
    analyse: "Discours indirect libre : question et réponse. Libérée de sa dette, Mathilde se sent l’égale de son amie… et prépare, sans le savoir, sa défaite." },
  { id: "a26", par: 111, quote: "cette bourgeoise", titre: "Un mot ironique", notions: ["ironie"],
    analyse: "Vu par Mme Forestier, le mot est ironique : Mathilde est devenue une femme du peuple." },
  { id: "a27", par: 127, quote: "Et elle souriait d’une joie orgueilleuse et naïve.", titre: "Le dernier moment de l’illusion", notions: ["oxymore", "ironie"],
    analyse: "« Orgueilleuse » : elle est fière d’avoir payé et trompé son amie ; « naïve » : elle ignore ce que le lecteur va découvrir. L’ironie dramatique est à son comble." },
  { id: "a28", par: 129, quote: "Mais la mienne était fausse. Elle valait au plus cinq cents francs !…", titre: "La chute", notions: ["chute", "reel"],
    analyse: "« Mais » introduit le renversement. 500 francs contre 36 000 et dix ans de vie. Le texte s’arrête sur cette réplique, sans commentaire : le silence laisse au lecteur l’amertume de l’ironie du sort." }
];

/* Paragraphes liés aux questions de compréhension (clic sur un n° de §). */
window.QUESTIONS_PAR = {
  1: [1, 129], 2: [1, 129], 3: [103, 104], 4: [1, 129], 5: [1, 129],
  6: [1, 1], 7: [2, 2], 8: [3, 4], 9: [4, 4], 10: [6, 6], 11: [7, 22], 12: [23, 29], 13: [30, 39], 14: [43, 52], 15: [51, 51],
  16: [53, 55], 17: [56, 59], 18: [62, 62], 19: [78, 81], 20: [84, 85], 21: [87, 87], 22: [92, 95], 23: [96, 98],
  24: [99, 102], 25: [105, 105], 26: [99, 99], 27: [107, 107], 28: [110, 114], 29: [117, 127], 30: [129, 129], 31: [128, 129]
};

/* Calques de lecture */
window.CALQUES = {
  luxe: ["délicatesses", "luxes", "antichambres", "capitonnées", "tentures orientales", "torchères de bronze", "valets", "salons", "soie ancienne", "bibelots inestimables", "dîners fins", "argenteries reluisantes", "tapisseries", "plats exquis", "vaisselles merveilleuses", "galanteries", "truite", "gélinotte", "toilettes", "bijoux", "bracelets", "collier de perles", "pierreries", "rivière de diamants", "satin", "fourrures", "élégance", "trésor", "diamants"],
  misere: ["pauvreté", "misère", "usure des sièges", "laideur des étoffes", "humble ménage", "nappe de trois jours", "pot-au-feu", "modestes vêtements", "nécessiteux", "mansarde", "gros travaux", "odieuses besognes", "vaisselle", "poteries grasses", "casseroles", "linge sale", "torchons", "ordures", "panier au bras", "misérable argent", "mains rouges", "jupes de travers", "Mal peignée", "privations", "dette effroyable", "noire misère"],
  ps: ["se laissa", "fut", "rentra", "dit", "déchira", "tira", "jeta", "déclara", "balbutia", "se tut", "bégaya", "répondit", "reprit", "réfléchit", "s’écria", "poussa", "se rendit", "conta", "alla", "prit", "l’apporta", "l’ouvrit", "vit", "découvrit", "se mit", "l’attacha", "demeura", "demanda", "sauta", "l’embrassa", "s’enfuit", "arriva", "eut", "remarqua", "partit", "le sentit", "voulut", "furent", "trouvèrent", "se mirent", "ramena", "remontèrent", "ôta", "se tourna", "se dressa", "cherchèrent", "se rhabilla", "sortit", "rentra", "attendit", "revint", "écrivit", "déclara", "prirent", "se rendirent", "consulta", "allèrent", "prièrent", "firent", "emprunta", "fit", "compromit", "risqua", "n’ouvrit", "connut", "lava", "savonna", "descendit", "monta", "renvoya", "changea", "loua", "dura", "aperçut", "se sentit", "s’approcha", "lui prit"],
  dil: [
    { par: 61, quote: "C’était fini, pour elle." },
    { par: 62, quote: "Elle n’avait plus sa rivière autour du cou !" },
    { par: 94, quote: "Il emprunterait le reste." },
    { par: 98, quote: "Si elle s’était aperçue de la substitution, qu’aurait-elle pensé ? qu’aurait-elle dit ? Ne l’aurait-elle pas prise pour une voleuse ?" },
    { par: 99, quote: "Il fallait payer cette dette effroyable. Elle payerait." },
    { par: 106, quote: "Que serait-il arrivé si elle n’avait point perdu cette parure ? Qui sait ? qui sait ? Comme la vie est singulière, changeante ! Comme il faut peu de chose pour vous perdre ou vous sauver !" },
    { par: 108, quote: "Allait-elle lui parler ? Oui, certes. Et maintenant qu’elle avait payé, elle lui dirait tout. Pourquoi pas ?" }
  ]
};
