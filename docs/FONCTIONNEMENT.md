# Fonctionnement détaillé

Ce document explique comment l'application est construite, d'où viennent les données, comment elles sont interprétées et comment faire évoluer le projet.

---

## 1. Vue d'ensemble

```
Google Sheet « Cartographie Culture »  ──(CSV, lecture seule)──►  Application React  ──►  Carte Leaflet
   ├─ Sites                                    │
   ├─ Villes et Poles                          ├─ limites des 77 communes (fichier local)
   └─ Projets                                  └─ copie de secours (fichier local)
```

- **Aucun serveur** : c'est un site statique. Le navigateur télécharge lui-même les onglets du classeur au format CSV.
- L'interface ne mentionne jamais la source : on y voit seulement « Données à jour · HH:MM » ou « Hors ligne · copie locale ».
- Les zones sont **calculées** à partir des communes listées dans l'onglet « Villes et Poles » : modifier cet onglet redessine les zones.

### Technologies

| Rôle | Outil | Version |
|---|---|---|
| Interface | React | 18.3.1 |
| Construction / serveur de dev | Vite | 8 |
| Carte | Leaflet | 1.9.4 |
| Regroupement des marqueurs | leaflet.markercluster | 1.5.3 |
| Fusion des communes en zones | topojson-client | 3.1.0 |
| Génération du fond communal (script) | topojson-server | 3.0.1 |

---

## 2. ⚠️ Condition indispensable : le partage du classeur

Pour que le site lise les données en direct, le classeur doit être partagé en
**« Tous les utilisateurs disposant du lien » → « Lecteur »**
(Google Sheets → Partager → Accès général).

Tant que ce n'est pas le cas, Google renvoie une page de connexion au lieu des données : l'application bascule automatiquement sur la **copie de secours** (`src/lib/snapshot.js`) et affiche « Hors ligne · copie locale ». Rien ne casse, mais les modifications du classeur ne sont pas visibles.

Le partage en lecture seule ne permet à personne de modifier le classeur.

---

## 3. Les données

Configuration : [src/lib/config.js](../src/lib/config.js) (`SHEET_ID` et `gid` de chaque onglet).

### 3.1 Onglet « Sites » (une ligne = une infrastructure)

La ligne d'en-tête est repérée automatiquement (celle qui contient « Sites »). Les colonnes sont reconnues **par le début de leur titre**, sans tenir compte des accents, majuscules, espaces ni fautes de frappe en fin de mot :

| Colonne attendue | Reconnue si le titre commence par | Utilisation |
|---|---|---|
| Sites | `sites`, `site`, `nom`… | Nom affiché (obligatoire — une ligne sans nom est ignorée) |
| Categorie | `categorie`, `type` | Couleur et pictogramme du marqueur, filtre |
| Pole economique | `pole`, `zone` | Zone de rattachement |
| Niveau de valorisation | `niveaudevalorisation`, `valorisation`, `etat` | Pastille, jauge, filtre |
| Villes | `ville`, `commune` | Position sur la carte et regroupement dans la liste |
| Date de la derniere évaluation | `datedeladerniere` | Fiche (+ « il y a… ») |
| Date de la prochaine évaluation | `datedelaprochaine` | Fiche (+ « dans… », alerte si dépassée) |
| Actions à entreprendre | `actions` | Fiche (une action par ligne ou séparées par « ; » → liste à puces) |
| *(facultatif)* Latitude / Longitude | `latitude`, `longitude` | Position exacte |
| *(facultatif)* Coordonnées GPS | `coordonnees`, `gps` | Position exacte, format `6.3654, 2.4183` |

**Toute autre colonne** ajoutée plus tard apparaît automatiquement dans la carte « Autres informations » de la fiche.

**Catégories** ([src/lib/utils.js](../src/lib/utils.js), `categoryOf`) :

| Le texte contient… | Catégorie | Couleur |
|---|---|---|
| monument, patrimoine | Monuments et patrimoine | jaune |
| musée | Musées | orange |
| hôtel, hébergement | Infrastructures hôtelières | bleu |
| cultur, spectacle, théâtre, cinéma | Infrastructures culturelles | violet |
| autre chose | Autres (le texte d'origine est affiché dans la fiche) | gris |

**Niveaux de valorisation** (`etatOf`) : Bon · Satisfaisant · Moyen · Mauvais · Critique · Non déterminé (case vide, « A préciser » ou « Non déterminé »). Quelques synonymes sont acceptés (Très bon, Correct, Passable, Dégradé, Ruine…).

**Dates** : format `JJ/MM/AAAA` (aussi `JJ-MM-AAAA`, `JJ.MM.AA` ou `AAAA-MM-JJ`). « A préciser » s'affiche comme champ à compléter.

### 3.2 Onglet « Villes et Poles » (définition des zones)

- Colonne **Poles** : nom de la zone, renseigné **uniquement sur la première ville** du groupe.
- Colonne **Villes** : une commune par ligne ; toutes les lignes suivantes appartiennent à la même zone jusqu'au prochain nom de pôle.
- Le préfixe « Pole » / « Pôle » est retiré pour l'affichage (« Pole Nord Est » → « Pôle Nord Est » dans l'interface, « Nord Est » sur la carte).
- Les autres colonnes de l'onglet (par ex. la liste alphabétique en colonne V) sont ignorées.

### 3.3 Onglet « Projets »

| Colonne | Utilisation |
|---|---|
| Sites | Site(s) concerné(s). **Plusieurs sites possibles**, séparés par des virgules : le projet apparaît dans la fiche de chacun. |
| Projets | Intitulé (obligatoire — une ligne sans intitulé est ignorée) |
| Objectif stratégique, MOA, MOE, Date de démarrage, Date de fin, Montant du projet, Résultats attendus, Statut, Commentaires | Affichés dans la fiche |

- Le nom du site doit correspondre à celui de l'onglet « Sites » (accents et majuscules indifférents).
- « Résultats attendus » : un retour à la ligne dans la cellule = une puce.
- Montant en FCFA, affiché en abrégé (12 Md FCFA) avec la valeur complète au survol.
- Si les deux dates sont renseignées, une barre d'avancement est calculée par rapport à aujourd'hui.

### 3.4 Onglet « Notations »

| Colonne | Utilisation |
|---|---|
| Sites | Nom du site (doit correspondre à l'onglet « Sites », accents et majuscules indifférents) |
| Toutes les autres colonnes | **Indicateurs**. Le titre de la colonne sert de libellé dans la fiche ; on peut en ajouter, en retirer ou en renommer. |

Dans la fiche, la carte **Notation** affiche chaque indicateur dans une case :
- titre commençant par « Note » (ex. « Note de satisfaction usagers ») → **cercle** qui se remplit, note **sur 5** ;
- titre commençant par « Niveau » (ex. « Niveau de modernisation ») → **cercle** qui se remplit, valeur **sur 100 %** (`45` ou `45 %`) ;
- autre valeur numérique (ex. « Nombre de visiteurs ») → nombre mis en forme (12 500) ;
- case vide ou « A préciser » → « À préciser ». Un site absent de l'onglet affiche tous ses indicateurs « À préciser ».

Le **niveau de valorisation** d'un site vient uniquement de la colonne « Niveau de valorisation » de l'onglet « Sites ».

---

## 4. Règles de calcul

Tout se passe dans [src/lib/data.js](../src/lib/data.js), fonction `loadData()`.

### 4.1 Zone d'une infrastructure
1. la valeur de sa colonne « Pole economique » ;
2. à défaut, la zone de sa ville d'après l'onglet « Villes et Poles » ;
3. à défaut, elle est classée dans « Sans zone ».

### 4.2 Géométrie des zones
Les limites des 77 communes sont stockées dans `src/data/communes.topo.json`. Pour chaque zone, les communes listées dans « Villes et Poles » sont **fusionnées** (`topojson.merge`) en un seul contour. Les communes qui n'appartiennent à aucune zone sont grisées et hachurées.

Certaines communes s'écrivent différemment dans les données et dans le fond de carte ; une table de correspondance gère ces cas (`COMMUNE_ALIASES`) :

| Dans les données | Dans le fond de carte |
|---|---|
| Akpro-Missérété | Akpo-Misserete |
| Boukoumbé | Boukombe |
| Cobly | Kobli |
| Tori-Bosito | Tori-Bossito |
| Toucoutouna | Toucountouna |

Pour une nouvelle variante, ajouter une entrée (noms en minuscules sans accents ni tirets).

### 4.3 Position des marqueurs
- Si le site a des **coordonnées** (colonnes facultatives, §3.1), elles sont utilisées telles quelles.
- Sinon, le site est placé **dans sa commune** : autour du centre de la commune, en spirale (angle d'or), pour que les sites d'une même ville ne se superposent pas. La fiche l'indique : « Position indicative, au sein de la commune de … ».
- Un site sans ville ni coordonnées n'a pas de marqueur (il reste accessible par la liste et la recherche).

👉 Pour des positions exactes, il suffit d'ajouter une colonne **Coordonnées GPS** (ou Latitude + Longitude) dans l'onglet « Sites » : aucune modification du code n'est nécessaire.

### 4.4 Filtres
Catégories et états se combinent : aucun filtre = tout est affiché ; plusieurs puces d'un même groupe = « ou » ; les deux groupes = « et ».

---

## 5. Lecture des données et actualisation

1. À l'ouverture, les quatre onglets sont téléchargés en parallèle via l'export CSV de Google (`/export?format=csv&gid=…`), avec repli sur l'API de visualisation (`/gviz/tq?tqx=out:csv&sheet=…`).
2. Chaque requête est abandonnée au bout de **8 secondes**.
3. Si un onglet échoue, toute l'application utilise la **copie de secours** (pour rester cohérente).
4. Actualisation automatique toutes les **5 minutes** (`REFRESH_EVERY`) et via le bouton « Actualiser ». La fiche ouverte est mise à jour sur place.

### Mettre à jour la copie de secours
[src/lib/snapshot.js](../src/lib/snapshot.js) contient une photographie des quatre onglets (tableaux de lignes, comme le CSV). À rafraîchir de temps en temps en copiant les lignes du classeur, puis `npm run build`.

---

## 6. Organisation du code

```
├─ index.html                 point d'entrée (titre, polices, icône)
├─ public/favicon.svg
├─ scripts/communes.mjs        régénère src/data/communes.topo.json
├─ src/
│  ├─ main.jsx                 démarrage React
│  ├─ App.jsx                  état global : zone, site, filtres, fond de carte, actualisation
│  ├─ styles.css               tout le style
│  ├─ data/communes.topo.json  limites des 77 communes (TopoJSON, ~45 Ko)
│  ├─ lib/
│  │  ├─ config.js             identifiant du classeur, onglets, couleurs des zones, fonds de carte
│  │  ├─ data.js               lecture, interprétation et assemblage des données
│  │  ├─ snapshot.js           copie de secours
│  │  ├─ utils.js              dates, montants, catégories, états, statuts
│  │  └─ leaflet.js            chargement de Leaflet + regroupement des marqueurs
│  └─ components/
│     ├─ MapView.jsx           carte : zones, communes, étiquettes, marqueurs, zoom
│     ├─ SidePanel.jsx         panneau gauche : zones, filtres, liste par ville
│     ├─ Drawer.jsx            fiche d'une infrastructure
│     ├─ Search.jsx            recherche (sites, zones, villes)
│     └─ ui.jsx                pictogrammes et petits composants
└─ docs/FONCTIONNEMENT.md      ce document
```

### Parcours d'un clic
- **Zone** (carte ou liste) → `selectZone` (App) → la carte appelle `fitZone`, le panneau affiche la liste de la zone, les autres zones s'estompent.
- **Infrastructure** → `selectSite` → la carte zoome (`flyToSite`, niveau 15), la fiche s'ouvre ; la zone correspondante est sélectionnée.
- **Clic dans la zone déjà ouverte** ou hors du Bénin → ferme la fiche.
- **Échap** → ferme la fiche, puis revient à toutes les zones.

---

## 7. Personnalisation courante

| Besoin | Où |
|---|---|
| Changer de classeur | `SHEET_ID` et `gid` dans `src/lib/config.js` (le `gid` est dans l'URL de l'onglet : `…#gid=123`) |
| Couleur d'une zone | `ZONE_COLORS` dans `src/lib/config.js` (clé = nom sans « Pôle », accents ni espaces) |
| Nouvelle catégorie | `CATEGORIES` + `categoryOf` dans `src/lib/utils.js`, pictogramme dans `GLYPHS` (`src/components/ui.jsx`) |
| Nouvel état | `ETATS` + `etatOf` dans `src/lib/utils.js` |
| Fréquence d'actualisation | `REFRESH_EVERY` dans `src/lib/config.js` |
| Fonds de carte | `BASEMAPS` dans `src/lib/config.js` |
| Limites des communes | `npm run communes` (télécharge geoBoundaries et régénère le fichier) |

---

## 8. Mise en ligne

```bash
npm run build
```
Déposer le contenu de `dist/` sur n'importe quel hébergeur statique (GitHub Pages, Netlify, Vercel, serveur Apache/Nginx…). Les chemins sont relatifs : le site fonctionne aussi dans un sous-dossier.

---

## 9. Points d'attention relevés dans les données actuelles

- **Palais royal d'Allada** est rattaché au « Pôle Sud Est » dans « Sites », alors que la commune d'Allada figure dans le « Pôle Sud Ouest » de « Villes et Poles ». Le site est donc compté dans Sud Est, mais son marqueur se trouve géographiquement dans la zone Sud Ouest. Le Pôle Sud Ouest affiche 0 infrastructure.
- **Djidja** et **Ouaké** ne figurent dans aucune zone de « Villes et Poles » : elles apparaissent grisées sur la carte.
- **Musée régional de Natitingou** n'a ni ville ni pôle : il est dans « Sans zone » et n'a pas de marqueur.
- Les dates d'évaluation et les actions à entreprendre ne sont pas encore renseignées : elles s'affichent « À préciser ».
- La dernière ligne de l'onglet « Projets » contient une liste de sites sans intitulé de projet : elle est ignorée.

---

## 10. Sources et licences

- Limites communales : **geoBoundaries** (gbOpen, BEN ADM2), licence CC BY 4.0.
- Fonds de carte : **Esri** (World Dark Gray, World Street Map, World Imagery), attributions affichées en bas de la carte.
- Polices : Fraunces et Inter (Google Fonts).
