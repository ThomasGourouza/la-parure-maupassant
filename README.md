# La Parure — étude interactive (FLE B2–C1)

Site statique pour étudier **« La Parure » de Guy de Maupassant** (1884), réalisé à partir de deux PDF :
le *dossier élève* et le *livret du professeur* (dans `pdf/`).

**Site en ligne :** https://thomasgourouza.github.io/la-parure-maupassant/

## Fonctionnalités

- **Texte intégral annoté** (129 §) : définitions au clic, analyse des phrases clés, calques (champs lexicaux, temps verbaux, discours indirect libre, dialogues), surlignage en couleurs, notes personnelles, lecture à voix haute.
- **Exercices interactifs** : compréhension (31 questions, vrai/faux, schéma narratif), vocabulaire (glossaire filtrable, cartes mémoire, classement, association, phrases à trous), grammaire (conjugaison corrigée et justifiée, subjonctif…).
- **Analyse** : explications linéaires avec citations cliquables synchronisées au texte, axes de lecture, frise, graphiques.
- **Productions** : éditeur avec compteur de mots, copies modèles, grilles d'auto-évaluation, minuteur pour l'oral.
- **Mode professeur** (interrupteur dans la barre d'outils) : réponses détaillées, « Pourquoi ? », conseils pédagogiques, copies modèles, plans C1, clé rapide.
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
data/*.js           texte, lexique, annotations, contenus élève (eleve.js) et professeur (prof.js)
sources/            sources HTML des PDF et scripts de génération
pdf/                dossier élève et livret du professeur
```

`data/texte.js`, `data/eleve.js` et `data/prof.js` sont générés par `python3 sources/build_site.py`
à partir des sources des PDF.

## Lancer en local

```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000. Le site fonctionne aussi en ouvrant directement `index.html`.

Texte : Guy de Maupassant, *Contes du jour et de la nuit*, 1885 (domaine public, Wikisource).
