/* Copie de secours, utilisée si la source en ligne est injoignable.
   Même forme que les onglets bruts : un tableau de lignes. */
const M = 'Monuments et patrimoine immobilier', MU = 'Musées', H = 'Infrastructures hotelieres', IC = 'Infrastructures culturelles';
const GN = 'Pole Grand Nokoué', CE = 'Pole Centre', NO = 'Pole Nord Ouest', NE = 'Pole Nord Est', SE = 'Pole Sud Est';

export const SNAPSHOT = {
  sites: [
    ['Sites', 'Categorie', 'Pole economique', 'Etat du site', 'Villes', 'Date de la derniere évalutation', 'Date de la prochaine évaluation', 'Actions à entreprendre'],
    ["Arbre de l'Oubli", M, GN, 'Bon', 'Ouidah'],
    ['Arbre du Retour', M, GN, 'Bon', 'Ouidah'],
    ['Arène culturelle de Ouidah', M, GN, 'Bon', 'Ouidah'],
    ["Basilique de l'Immaculée Conception", M, GN, 'Bon', 'Ouidah'],
    ['Bateau de la mémoire', M, GN, 'Bon', 'Ouidah'],
    ['Case Zomai et Mémorial', M, GN, 'Bon', 'Ouidah'],
    ['Cathédrale Notre-Dame de Miséricorde', M, GN, 'Bon', 'Cotonou'],
    ['Cité lacustre de Ganvié', M, GN, 'Bon', 'Abomey-Calavi'],
    ['Forêt sacrée de Kpassè', M, GN, 'Bon', 'Ouidah'],
    ['Fort portugais de São João Baptista de Ajudá', M, GN, 'Bon', 'Ouidah'],
    ['Grande Mosquée de Porto-Novo', M, GN, 'Satisfaisant', 'Porto-Novo'],
    ['Hotel de la Pendjari', H, NO, 'Non déterminé', 'Tanguiéta'],
    ['Hotel Le Trone Abomey', H, CE, 'Non déterminé', 'Abomey'],
    ['Hotel Tata Somba', H, NO, 'Non déterminé', 'Natitingou'],
    ['Jardin des Plantes et de la Nature', M, GN, 'Satisfaisant', 'Porto-Novo'],
    ['Mémorial de Zoungbodji', M, GN, 'Bon', 'Ouidah'],
    ['Monument aux morts', M, GN, 'Bon', 'Cotonou'],
    ['Mur du port', M, GN, 'Bon', 'Cotonou'],
    ['Musée d’Art Contemporain de Cotonou', MU, GN, 'Non déterminé', 'Cotonou'],
    ["Musée d'histoire de Ouidah", M, GN, 'Bon', 'Ouidah'],
    ['Musée Da Silva', M, GN, 'Satisfaisant', 'Porto-Novo'],
    ['Musée des Rois et des Amazones du Danxomè', MU, CE, 'Non déterminé', 'Abomey'],
    ['Musée ethnographique Alfred Adandé', M, GN, 'Satisfaisant', 'Porto-Novo'],
    ["Musée historique d'Abomey", MU, CE, 'Non déterminé', 'Abomey'],
    ['Musée International de la Mémoire et de l’Esclavage', MU, GN, 'Bon', 'Ouidah'],
    ['Musée international du Vodun', MU, GN, 'Bon', 'Porto-Novo'],
    ['Musée régional de Natitingou', MU],
    ['Palais du roi Glèlè', M, CE, 'Non déterminé', 'Abomey'],
    ['Palais du roi Guézo', M, CE, 'Non déterminé', 'Abomey'],
    ["Palais royal d'Allada", M, SE, 'Moyen', 'Allada'],
    ['Palais royal de Honmè (Musée Honmè)', M, GN, 'Satisfaisant', 'Porto-Novo'],
    ['Palais royal de Kétou', M, SE, 'Non déterminé', 'Kétou'],
    ['Palais royal de Nikki', M, NE, 'Bon', 'Nikki'],
    ["Palais royaux d'Abomey", M, CE, 'Mauvais', 'Abomey'],
    ['Parc de la Pendjari', M, NO, 'Non déterminé', 'Tanguiéta'],
    ['Parc W', M, NO, 'Non déterminé', 'Tanguiéta'],
    ['Place Bio Guera', M, GN, 'Bon', 'Cotonou'],
    ['Place Chacha', M, GN, 'Bon', 'Ouidah'],
    ["Place de l'Amazone", M, GN, 'Bon', 'Cotonou'],
    ["Place de l'Étoile Rouge", M, GN, 'Bon', 'Cotonou'],
    ['Place du souvenir', M, GN, 'Non déterminé', 'Cotonou'],
    ['Place Goho', M, CE, 'Critique', 'Abomey'],
    ['Porte du non retour', M, GN, 'Bon', 'Ouidah'],
    ['Quartier culturel et Creatif', IC, GN, 'Bon', 'Cotonou'],
    ['Route des Esclaves', M, GN, 'Bon', 'Ouidah'],
    ['Sofitel Cotonou Marina Hotel', H, GN, 'Bon', 'Cotonou'],
    ['Tata Somba', M, NO, 'Non déterminé', 'Natitingou'],
    ['Temple des Pythons', M, GN, 'Bon', 'Ouidah']
  ],
  zones: [
    ['Poles ', 'Villes'],
    ...[
      ['Grand Nokoué', 'Cotonou', 'Abomey-Calavi', 'Ouidah', 'Porto-Novo', 'Sèmè-Kpodji'],
      ['Pole Nord Est', 'Parakou', 'Banikoara', 'Bembèrèkè', 'Gogounou', 'Kalalé', 'Kandi', 'Karimama', 'Malanville', "N'Dali", 'Nikki', 'Pèrèrè', 'Sègbana', 'Sinendé', 'Tchaourou'],
      ['Pole Sud Est', 'Pobè', 'Adja-Ourèrè', 'Adjarra', 'Adjohoun', 'Aguégués', 'Akpro-Missérété', 'Avrankou', 'Bonou', 'Dangbo', 'Ifangni', 'Kétou', 'Sakété'],
      ['Pole Nord Ouest', 'Natitingou', 'Bassila', 'Boukoumbé', 'Cobly', 'Copargo', 'Djougou', 'Kérou', 'Kouandé', 'Matéri', 'Péhunco', 'Tanguiéta', 'Toucoutouna'],
      ['Pole Centre', 'Abomey', 'Agbangnizoun', 'Bantè', 'Bohicon', 'Covè', 'Dassa-Zoumè', 'Glazoué', 'Ouèssè', 'Ouinhi', 'Savalou', 'Savè', 'Za-Kpota', 'Zagnanado', 'Zogbodomey'],
      ['Pole Sud Ouest', 'Lokossa', 'Allada', 'Aplahoué', 'Athiémé', 'Bopa', 'Comé', 'Djakotomey', 'Dogbo', 'Grand-Popo', 'Houéyogbé', 'Klouékanmè', 'Kpomassè', 'Lalo', 'Sô-Ava', 'Toffo', 'Tori-Bosito', 'Toviklin', 'Zè']
    ].flatMap(([pole, ...villes]) => villes.map((v, i) => [i ? '' : pole, v]))
  ],
  notations: [
    ['Sites', 'Critere 1', 'Critere 2', 'Critere 3', 'Critere 4', 'Critere 5', 'Critere 6', 'Note globale', 'Etat du site'],
    ['Musée international du Vodun', '5', '5', '5', '5', '5', '5', '25', 'Bon']
  ],
  projets: [
    [],
    ['Sites', 'Projets', 'Objectif stratégique', 'MOA', 'MOE', 'Date de démarrage', 'Date de fin', 'Montant du projet', 'Résultats attendus', 'Statut', 'Commentaires'],
    ['Musée international du Vodun', 'Construction du Musée international du Vodun', 'Construire et offrir au monde un musée qui donne les moyens intellectuels et visuels d’une meilleure compréhension du Vodun', 'Agence Nationale des Patrimoines Touristiques', 'Koffi & Diabate', 'A préciser', 'A préciser', '12000000000', 'Un musée est ouvert et donne tous les atouts nécessaires pour une meilleure compréhension du Vodun\nLe public est éduqué et informé aux valeurs du Vodun\nLes arts et la créativité contemporains sont promus à partir des mythes et légendes du Vodun\nLa recherche scientifique est motivée et accompagnée', 'En cours']
  ]
};
