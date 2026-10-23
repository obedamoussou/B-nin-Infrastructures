# Bénin · Infrastructures — Cartographie culture & tourisme

Carte interactive des infrastructures culturelles et touristiques du Bénin, organisée par **zone** (les 6 pôles économiques).

> Le fonctionnement détaillé (source des données, structure du code, règles de calcul, mise en ligne) est décrit dans [docs/FONCTIONNEMENT.md](docs/FONCTIONNEMENT.md).

## Démarrer

```bash
npm install      # une seule fois
npm run dev      # développement → http://localhost:5173
npm run build    # version de production dans dist/
```

## Fonctionnalités

### Carte
- Carte du Bénin découpée en **6 zones** colorées : Grand Nokoué, Sud Est, Sud Ouest, Centre, Nord Est, Nord Ouest.
- Chaque zone est dessinée à partir des communes qui la composent ; les limites des communes restent visibles en filigrane.
- Une étiquette par zone indique son nom et son nombre d'infrastructures.
- Survol d'une zone : mise en surbrillance et infobulle (nombre d'infrastructures et de communes).
- **Zoom** libre (molette, pincement, boutons + / −) jusqu'au niveau de la rue ; les noms des communes apparaissent en zoomant.
- **Trois fonds de carte** au choix : Sombre, Plan, Satellite (le choix est mémorisé).
- Chaque infrastructure est un **marqueur** dont la couleur et le pictogramme indiquent la catégorie, et la pastille l'état.
- Les marqueurs proches sont **regroupés** (avec leur nombre) et se séparent en zoomant.

### Zones
- Panneau de gauche : liste des zones avec, pour chacune, le nombre d'infrastructures, de communes et la répartition par catégorie.
- **Clic sur une zone** (carte ou liste) : la carte se centre sur la zone, les autres s'estompent, et la liste de ses infrastructures s'affiche, **regroupées par ville**.
- Bouton « Toutes les zones » pour revenir à la vue d'ensemble.
- Les infrastructures sans ville ni pôle sont rassemblées dans « Sans zone ».

### Fiche d'une infrastructure
Clic sur un marqueur ou sur un élément de la liste : la carte zoome sur le site et une fiche s'ouvre à droite avec :
- nom, catégorie, ville, zone ;
- **état** du site (Bon → Critique) avec jauge visuelle ;
- dates de **dernière** et **prochaine évaluation** (avec « il y a… / dans… » et alerte si l'évaluation est en retard) ;
- **actions à entreprendre** ;
- **projets** rattachés au site : objectif, maître d'ouvrage, maître d'œuvre, montant, dates, résultats attendus, statut, commentaires, barre d'avancement ;
- **autres informations** : toute colonne ajoutée plus tard aux données s'affiche automatiquement ;
- boutons « Centrer sur la carte » et « Voir la zone ».

### Recherche et filtres
- **Recherche** (en haut à droite) sur les infrastructures, les zones et les villes, sans tenir compte des accents ; navigation au clavier (↑ ↓ Entrée).
- **Filtres** par catégorie et par état, cumulables ; ils s'appliquent à la carte, aux compteurs et aux listes.

### Données
- Lecture **en direct** des données à l'ouverture, puis **toutes les 5 minutes** et via le bouton « Actualiser ».
- Si la source est injoignable, une **copie locale** intégrée prend le relais (indicateur « Hors ligne · copie locale »).
- Chiffres clés en haut : infrastructures, zones, villes, projets.

### Confort
- Raccourcis : `/` pour rechercher, `Échap` pour fermer la fiche puis revenir à toutes les zones.
- Interface adaptée au **mobile** (panneau et fiche en bas de l'écran, bouton ☰ pour la liste).
