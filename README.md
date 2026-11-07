# La Parure — étude interactive (FLE B2–C1)

Site statique pour étudier **« La Parure » de Guy de Maupassant** (1884), réalisé à partir de deux PDF :
le *dossier élève* et le *livret du professeur* (dans `pdf/`).

**Site en ligne :** https://thomasgourouza.github.io/la-parure-maupassant/

## Fonctionnalités

- **Texte intégral annoté** (129 §) : définitions au clic, analyse des phrases clés, calques (champs lexicaux, temps verbaux, discours indirect libre, dialogues), surlignage en couleurs, notes personnelles, lecture à voix haute.
- **Exercices interactifs** : compréhension (31 questions, vrai/faux, schéma narratif), vocabulaire (glossaire filtrable, cartes mémoire, classement, association, phrases à trous), grammaire (conjugaison corrigée et justifiée, subjonctif…).
- **Analyse** : explications linéaires avec citations cliquables synchronisées au texte, axes de lecture, frise, graphiques.
- **Productions** : éditeur avec compteur de mots, copies modèles, grilles d'auto-évaluation, minuteur pour l'oral.
- **Travail en autonomie** : sous chaque question et exercice, « Voir la réponse » affiche le corrigé, puis « Comprendre la réponse » l'explication détaillée du livret (reformulée pour l'élève). Copies modèles et explication rédigée du dénouement se débloquent après rédaction.
- **Espace enseignant** (`#enseignant`, lien en pied de page) : mode d'emploi, conseils pédagogiques, clé rapide.
- Barre d'outils : taille du texte, police aérée, recherche (`/`), mode concentration, impression, téléchargement des PDF.
- Progression et réponses enregistrées localement dans le navigateur (aucun serveur).

## Structure

```
index.html          coquille de l'application
css/style.css       charte graphique des PDF (sépia), responsive, impression
js/app.js           état, routeur, barre d'outils, panneau, progression
js/reader.js        lecteur annoté
js/exercises.js     moteurs d'exercices
js/tools.js         voix, recherche, « mes notes »
js/views.js         onglets
data/*.js           texte, lexique, annotations, contenus élève (eleve.js) et explications du livret (explications.js)
sources/            sources HTML des PDF et scripts de génération
pdf/                dossier élève et livret du professeur
```

`data/texte.js`, `data/eleve.js` et `data/explications.js` sont générés par `python3 sources/build_site.py`
à partir des sources des PDF ; `sources/site_rewrites.py` reformule les explications du livret pour l'élève
(le livret PDF reste inchangé).

## Lancer en local

```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000. Le site fonctionne aussi en ouvrant directement `index.html`.

Texte : Guy de Maupassant, *Contes du jour et de la nuit*, 1885 (domaine public, Wikisource).
