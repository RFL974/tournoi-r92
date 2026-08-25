# Structure du Google Sheet

Le Google Sheet sert de **base de données** du tournoi. Il contient **12 onglets** :

- **8 de travail** — `Config`, `Equipes`, `Poules`, `Matchs`, `Historique` *(le journal de
  saison)*, `ClubsInvites` *(les clubs invités)*, `Sponsors` *(les partenaires)* et `Mesures`
  *(les relevés de visibilité)* ;
- **4 de référence FFR**, remplis à la main — `RefFFR_Formes`, `RefFFR_Dates`, `RefFFR_Regles`,
  `RefFFR_Temps`.

> 📖 Le rôle de chacun, et lequel est créé automatiquement, sont dans
> [`architecture.md`](architecture.md) §1.

> URL du Sheet :
> https://docs.google.com/spreadsheets/d/17jcZMNHJywE6e1qEXMnp_g6rsVeLo05vbQ-0njdlL7U/edit

**Règle importante :** la **première ligne de chaque onglet contient les en-têtes de colonnes**
(exactement les noms indiqués ci-dessous, en minuscules, sans accents). Le backend s'appuie sur
ces noms pour lire/écrire les données — il ne faut donc pas les renommer.

> 🛠️ **Création automatique.** Ces onglets et en-têtes sont créés automatiquement par la fonction
> `setupSheet()` du fichier [`../backend/Code.gs`](../backend/Code.gs), à lancer une fois depuis
> l'éditeur Apps Script. Pas besoin de les saisir à la main.

---

## Onglet `Config`

Cet onglet contient deux zones : **Zone A** (réglages globaux, en haut, paires
`parametre`/`valeur`), une ligne vide, un titre `— Réglages par catégorie —`, puis la **Zone B**
(en-têtes + une ligne par catégorie). Le backend repère les zones **par leur contenu** (nom du
paramètre, ou ligne dont la 1re cellule vaut `categorie`), donc les numéros de ligne peuvent varier.

Tout l'onglet `Config` est au **format texte** (pour éviter que `09:00` devienne une heure
et `1,2` un nombre décimal).

### Zone A — Réglages globaux de la journée

Deux colonnes : `parametre` et `valeur`.

| parametre | valeur (exemple) | Signification |
|---|---|---|
| `heure_debut` | `09:00` | Heure de début du tournoi |
| `heure_fin` | `17:00` | Heure de fin — **calculée automatiquement** si `heure_fin_auto = oui` |
| `heure_fin_auto` | `oui` | Si `oui`, l'heure de fin = fin du dernier match (recalculée à chaque génération) |
| `battement_terrain_min` | `5` | Temps (min) pour libérer un terrain entre 2 matchs |
| `pause_dejeuner_debut` | `12:30` | Début de la pause déjeuner |
| `pause_dejeuner_duree_min` | `60` | Durée de la pause déjeuner, en minutes |
| `heure_rdv` | `07:45` | Heure de RDV / accueil des équipes (dossier club). **Optionnel.** Pré-remplie côté admin à `heure_debut − 1h15`, modifiable |
| `heure_fin_communiquee` | `17:30` | Heure de fin **communiquée aux clubs** (dossier club). **Optionnel.** **Vide = automatique** : le dossier affiche `heure_fin` (fin du dernier match) **+ la marge** ci-dessous et suit chaque régénération ; une valeur saisie prime et ne bouge plus |
| `marge_fin_communiquee_min` | `75` | Marge (min) ajoutée à la fin du dernier match pour l'heure de fin **automatique** annoncée aux clubs : couvre le **retour aux vestiaires** puis la **remise des trophées** (l'événement se termine à l'issue de la remise). Réglable dans le formulaire « Horaires » de l'admin. **Vide = 75** (1 h 15) |

Paramètres ajoutés **automatiquement** (pas à saisir à la main) :

| parametre | valeur (exemple) | Signification |
|---|---|---|
| `tournoi_id` | `2026-11-11 21:37:00` | Identifiant du tournoi, posé à chaque génération (clé de l'onglet `Historique`). ⚠️ **Ne PAS s'en servir comme identifiant d'une ÉDITION** — voir l'avertissement sous ce tableau |
| `tournoi_publie` | `oui` | `oui` = la page publique est visible ; sinon écran « à venir ». Piloté par le bouton **« Publier le tournoi »** de l'admin. Ce témoin commande AUSSI la carte « Tournoi » des actualités du site vitrine : il doit rester dans les listes blanches `live` **et** `invitation` de `CONFIG_PUBLIQUE_VUES` (Code.gs), sans quoi la vitrine conclut « non publié » en silence |
| `tournoi_nom` | `Challenge Marc Chevalier` | Nom affiché sur la carte + la page d'article du site vitrine |
| `tournoi_date` | `2026-11-11` | Date du tournoi (carte, article, agenda .ics) |
| `tournoi_lieu` | `Stade Paul Langevin` | Lieu (article + itinéraire + agenda .ics) |
| `tournoi_adresse` | `11 av. Paul Langevin, 92350…` | Adresse postale complète du lieu (dossier club) — carte « Infos du tournoi » de l'admin |
| `tournoi_description` | `Le Challenge…` | Description (carte + article) |
| `tournoi_affiche_id` | `1-3DZBDd…` | Identifiant du fichier **Google Drive** de l'affiche (affichée via `lh3.googleusercontent.com/d/{id}`) |
| `terrains_physiques` | `[{"nom":"Rugby 1","type":"rugby","L":100,"W":70,"enBut":6,"pos":"CG"},…]` | JSON — les **grands terrains** réels déclarés (onglet admin « Terrains & répartition »). `L` va d'une **ligne de poteaux à l'autre** ; `enBut` = profondeur de l'**en-but** derrière **chaque** ligne de but (m, `0`/absent = non déclaré) : les mini-terrains n'y vont pas, la **table de marque** oui quand la surface de jeu est pleine |
| `dimensions_categories` | `{"U8":{"l":30,"w":20},…}` | JSON — taille de mini-terrain par catégorie (`plein:true` = grand terrain entier) |
| `couloir_terrain_m` | `5` | Couloir de circulation entre mini-terrains (m) |
| `tm_longueur_m` / `tm_largeur_m` | `4` | Taille de la table des marques (m) |
| `planning_visible_clubs` | `non` | `oui` = les **dossiers des clubs** affichent poules et matchs. **Vide/absent = `non`** (défaut FERMÉ). Remis à `non` automatiquement par **toute génération ou réorganisation des poules** ; repassé à `oui` par le bouton « Rendre le planning visible par les clubs » (carte *Poules & planning*). ⚠️ **Indépendant de `tournoi_publie`**, qui commande le site public |
| `repartition_grands_terrains` | `{"Rugby 1":["1","2"],…}` | JSON — **composition de chaque grand terrain** (numéros de mini-terrains), écrite quand la répartition est **appliquée** ; alimente le filtre « Grand terrain » de la page Saisie. ⚠️ **Survit à la réinitialisation** — voir **R-101** |

> ⚠️ **`tournoi_id` n'identifie PAS une édition, et il ne faut pas s'en servir pour cela**
> *(risque **R-106**, chantier **M1-B2**)*.
>
> La description ci-dessus est exacte : il est **posé à chaque génération de poules et planning**.
> ⭐ Or régénérer est un geste **normal et répété** pendant la préparation — on corrige les poules,
> on ajoute une équipe, on relance. **Un seul tournoi réel produit donc plusieurs `tournoi_id`**, et
> les lignes de `Historique` se répartissent entre eux. ⚠️ Il n'est pas non plus effacé par la
> réinitialisation : l'ancien survit jusqu'à la génération suivante.
>
> ⭐ **Il identifie une GÉNÉRATION DE PLANNING, pas une édition.** Un identifiant stable d'édition
> — `edition_id`, créé à l'ouverture et jamais renouvelé — est prévu par **M1-B2 / B2-1**
> *(décision **D-050**)*.

> ⚠️ **Le plan des terrains survit à la réinitialisation** *(risque **R-101**)* : `terrains_physiques`,
> `couloir_terrain_m`, `dimensions_categories`, `tm_longueur_m`, `tm_largeur_m` et
> `repartition_grands_terrains` ne figurent dans **aucune** liste d'effacement. ⭐ La donnée est
> **mixte** — l'existence des grands terrains est **permanente**, leur **découpage** en
> mini-terrains est **propre à une édition**. La séparation est prévue par **M1-B2 / B2-3**.

Paramètres **Contacts & sécurité** (écrits par la carte « Contacts &amp; sécurité » de la page
admin — destinés au futur **générateur de dossier club**, tous **optionnels**) :

| parametre | valeur (exemple) | Signification |
|---|---|---|
| `referent_nom` | `Camille Dupont` | Nom du référent tournoi |
| `referent_tel` | `0612345678` | Téléphone du référent (10 chiffres, normalisé : espaces/points/tirets retirés) |
| `securite_secours_oui` | `oui` | `oui` = un poste de secours est présent sur place |
| `securite_secours_precisions` | `Local à côté du club-house` | Précisions sur le poste de secours (utile seulement si `securite_secours_oui = oui`) |
| `securite_referent_identique` | `oui` | `oui` (défaut, y compris si vide) = le référent sécurité est le référent tournoi |
| `securite_referent_nom` | `Dominique Martin` | Nom du référent sécurité distinct (si `securite_referent_identique = non`) |
| `securite_referent_tel` | `0698765432` | Téléphone du référent sécurité distinct (10 chiffres, normalisé) |

Paramètres du **dossier d'INVITATION** (écrits par les cartes « Modalités d'inscription »,
« Parking &amp; accès » et « Encadrement &amp; assurance » de la page admin, action backend
`enregistrerInvitation` — tous **optionnels**, lus par `frontend/dossier-club.html`) :

| parametre | valeur (exemple) | Signification |
|---|---|---|
| `date_limite_confirmation` | `2026-10-15` | Date limite de confirmation demandée aux clubs (section « Modalités d'inscription » du dossier, affichée en date longue) |
| `tarif_engagement_oui` | `non` | `oui` = un tarif d'engagement est demandé (défaut `non`). À `non`, le dossier n'affiche **rien** sur le tarif |
| `tarif_engagement_montant` | `50 € par équipe` | Montant du tarif (affiché seulement si `tarif_engagement_oui = oui`) |
| `tarif_engagement_modalites` | `Chèque à l'ordre de…` | Modalités de paiement (affichées seulement si `tarif_engagement_oui = oui`) |
| `parking_texte` | `Parking gratuit rue des Sports` | Texte de la section « Parking & accès » |
| `parking_photo_id` | `1-3DZBDd…` | Identifiant du fichier **Google Drive** de la photo du parking (même mécanisme que `tournoi_affiche_id`, action `enregistrerPhotoParking`) |
| `encadrement_ratio` | `1 éducateur pour 8 joueurs` | Ratio éducateurs/joueurs demandé (section « Encadrement & assurance ») |
| `encadrement_diplomes` | `Brevet fédéral EDR minimum` | Diplômes exigés des éducateurs |
| `assurance_attestation_requise` | `non` | `oui` = le dossier affiche « Attestation d'assurance du club à fournir » |

Paramètres **Phase 1** (invitation légère `frontend/invitation-club.html`). Cartes admin
« Sur place » (action `enregistrerSurPlace`) et « Réponse à l'invitation » (action
`enregistrerReponseInvitation`) :

| parametre | valeur (exemple) | Signification |
|---|---|---|
| `buvette_disponible` | `non` | `oui` = pastille « 🥤 Buvette » sur l'invitation (défaut `non` : aucune ligne si décoché) |
| `espace_sandwich_disponible` | `non` | `oui` = pastille « 🥪 Espace sandwich » |
| `boutique_disponible` | `non` | `oui` = pastille « 🛍️ Boutique ». ⚠️ **Renommé le 2026-08-22** *(anciennement `boutique_r92_disponible`)* : un classeur qui porte encore l'ancienne ligne **garde son réglage**, repris automatiquement à la lecture ; le premier enregistrement écrit la nouvelle ligne, et l'ancienne devient une donnée dormante qu'on peut supprimer à la main |
| `perfs_mot_cle_club` | *(vide)* | ⚙️ Mot qui identifie une équipe **du club organisateur** dans son nom, pour la page interne « Perfs du club » *(casse ignorée, espaces de début et de fin retirés ; ex. `massy` pour « MASSY-1 » et « MASSY-2 »)*. ⚠️ **Minimum 3 caractères** une fois normalisé. ⛔ **Vide OU plus court : la page ne calcule RIEN et le dit** — un mot vide correspondrait à **toutes** les équipes, un mot trop court à trop d'entre elles, et le bilan serait faux mais plausible. ⭐ **Se règle depuis l'administration** *(carte « Équipes » → « Identifier mes équipes dans Perfs »)*, écrit par l'action `enregistrerInfosTournoi` : **aucune saisie manuelle dans le classeur n'est nécessaire**, la ligne est créée au premier enregistrement |
| `date_limite_reponse` | `2026-09-15` | Date limite de **réponse** à l'invitation (Phase 1). **Distincte** de `date_limite_confirmation` (effectifs, Phase 2) |
| `contact_reponse_nom` | `Camille Dupont` | Nom du contact référent (section « Réponse attendue » de l'invitation) |
| `contact_reponse_tel` | `0612345678` | Téléphone du contact (10 chiffres, normalisé). **Au moins un** de `contact_reponse_tel` / `contact_reponse_email` est **obligatoire** (validation croisée à l'enregistrement) |
| `contact_reponse_email` | `contact@example.org` | Email du contact (format vérifié). Voir validation croisée ci-dessus |
| `email_expediteur` | *(vide)* | Adresse « Envoyer en tant que » (alias Gmail du compte exécutant). **Vide = l'email part de l'adresse du compte exécutant le script** (`romain.rifleu@gmail.com` en phase de test). Purement informatif : ne bloque rien si vide. **Conservé** par une réinitialisation (config d'infrastructure). Voir `docs/passation.md` §11 |

Paramètres **optionnels lus par le dossier club** (`frontend/dossier-club.html`). Aucun
formulaire admin ne les écrit encore : pour les utiliser, **ajouter la ligne à la main** dans la
Zone A (colonne A = nom, colonne B = valeur). Absents ou vides = la ligne/le bouton correspondant
est simplement masqué dans le dossier :

| parametre | valeur (exemple) | Utilisation dans le dossier |
|---|---|---|
| `logistique_parking` | `Parking gratuit rue des Sports` | Ligne « Parking » des Infos pratiques |
| `logistique_buvette` | `Buvette et restauration sur place` | Ligne « Buvette / restauration » |
| `logistique_vestiaires` | `4 vestiaires, bâtiment B` | Ligne « Vestiaires » |
| `table_marque_organisation` | `Tenue par les bénévoles du club` | Ligne « Table de marque » (Suivi & organisation) |
| `url_tournoi_public` | `https://rfl974.github.io/tournoi-r92/tournoi.html` | Lien + QR code « Scores en direct » (défaut : la page `tournoi.html` publiée à côté du dossier) |
| `url_site_association` | `https://…` | Bouton « Site de l'association » |
| `url_instagram` | `https://instagram.com/…` | Bouton « 📣 Relayer sur les réseaux » (pointe vers le compte configuré ici ; vide ⇒ pas de bouton) |

Paramètres de **conformité et repères internes** (aucune carte admin dédiée — `zone_vacances` est
écrite par la carte « Date & conformité FFR » via `enregistrerInfosTournoi` ; les deux signatures
sont posées automatiquement) :

| parametre | valeur (exemple) | Signification |
|---|---|---|
| `zone_vacances` | `C` | Zone de vacances scolaires, pour le **contrôle de conformité FFR** (conflits de calendrier). **Vide/absent = `C`** (Île-de-France). ⭐ Décrit le **club**, pas l'édition : **conservé** par une réinitialisation |
| `nb_demi_journees` | `2` | Nombre de demi-journées du tournoi — c'est une **clé de la grille de temps FFR** (`RefFFR_Temps`). **Vide/absent = `2`**. ⚠️ **Aucun écran ne l'écrit** : la ligne se saisit à la main dans la Zone A |
| `signature_generation` | *(empreinte)* | Résumé des réglages qui influent sur les horaires, posé à chaque génération. L'admin le recalcule pour afficher « à recalculer ». **Effacé** par une réinitialisation |
| `signature_structure` | *(empreinte)* | Résumé de la composition (équipes, poules), pour « Recalculer les horaires ». ⚠️ **Non effacé** par une réinitialisation — sans effet : `recalculerHoraires` s'arrête avant, faute de matchs |

### Zone A *bis* — Les 36 paramètres `org_*` de la demande d'autorisation FFR

> 🗓️ **Ajoutés à ce document le 2026-08-24** *(chantier **M1**, étape **M1-A**)*. ⚠️ **Ils
> existaient depuis la session 7** : ce document, qui décrit l'onglet `Config`, **n'en mentionnait
> aucun** — y compris ceux qui portent **les données personnelles les plus sensibles du projet**.
> C'est exactement le défaut de périmètre que décrit `CLAUDE.md` **§8 bis**.

Ces paramètres alimentent la **feuille de report** et le **PDF pré-rempli** de la demande
d'autorisation de tournoi École de Rugby. Ils vivent dans la **Zone A**, comme les autres, et sont
créés par `setupSheet()`.

> 🔒 **Confidentialité.** Plusieurs de ces lignes sont des **données personnelles** (noms,
> téléphones, adresses électroniques du président, du représentant, du médecin, de l'antenne de
> secours). ✅ **Aucune d'elles ne figure dans `CONFIG_PUBLIQUE_VUES`** : elles ne sortent que par
> l'action `getDossierAutorisation` (`doPost` + **clé admin**), jamais en public.

> 📖 **Le libellé officiel de chaque champ** — celui qu'emploie le formulaire fédéral — est dans
> [`industrialisation/M1-LIBELLES-OFFICIELS.md`](industrialisation/M1-LIBELLES-OFFICIELS.md).

**Colonne « Réinit. »** : comportement décidé par **D-043**, appliqué par le lot **M1-B**.

> ⚡ **Où en est cette colonne, au 2026-08-24 — et la distinction est capitale** :
>
> | | |
> |---|---|
> | **Dans le dépôt** *(`backend/Code.gs`)* | ✅ **APPLIQUÉE** — `reinitialiserTournoi` vide les 26 champs d'édition et les `org_recompenses_*`, et conserve les 10 permanents. Couvert par des tests automatiques |
> | **Sur le serveur en service chez Google** | ⛔ **PAS ENCORE** — le fichier n'y a pas été recollé. **Une réinitialisation réelle conserve donc encore les 36**, comme avant |
>
> ➡️ Tant que le redéploiement n'a pas eu lieu *(`deploiement.md`)*, la colonne décrit **le code du
> dépôt**, pas le comportement observable en production *(`CLAUDE.md` §13.6)*.

**Familles** *(D-042)* : 🏛️ permanente du club · 🗓️ événementielle · ⚙️ propre à Maxilou.

#### A.1 — Organisateur *(les 10 permanents)*

| parametre | valeur (exemple) | Signification | Famille | 🔒 | Réinit. |
|---|---|---|---|---|---|
| `org_club_nom` | `AS Exemple` | Nom du club ou de la structure organisatrice | 🏛️ | — | ✅ **CONSERVER** |
| `org_code_club` | `1234567` | Code club FFR | 🏛️ | — | ✅ **CONSERVER** |
| `org_representant_nom` | `Camille Dupont` | Représentant du club (M. ou Mme) | 🏛️ | 🔒 | ✅ **CONSERVER** |
| `org_representant_tel` | `0612345678` | Téléphone du représentant | 🏛️ | 🔒 | ✅ **CONSERVER** |
| `org_representant_mail` | `contact@example.org` | Adresse électronique du représentant | 🏛️ | 🔒 | ✅ **CONSERVER** |
| `org_president_nom` | `Dominique Martin` | Président du club | 🏛️ | 🔒 | ✅ **CONSERVER** |
| `org_president_tel` | `0698765432` | Téléphone du président | 🏛️ | 🔒 | ✅ **CONSERVER** |
| `org_president_mail` | `president@example.org` | Adresse électronique du président | 🏛️ | 🔒 | ✅ **CONSERVER** |
| `org_label_edr` | `oui` | École de rugby labellisée. **Vide = `oui`** (défaut documenté) | 🏛️ | — | ✅ **CONSERVER** |
| `org_label_date` | `12/03/2026` | Date du dernier label (JJ/MM/AAAA) | 🏛️ | — | ✅ **CONSERVER** |

#### A.2 / A.4 — Tournoi et participants

| parametre | valeur (exemple) | Signification | Famille | 🔒 | Réinit. |
|---|---|---|---|---|---|
| `org_niveau_tournoi` | `Départemental` | Niveau du tournoi (liste fermée : International / National / Territorial / Départemental) | 🗓️ | — | ❌ **À VIDER** |
| `org_equipes_etrangeres` | `non` | Le tournoi accueille-t-il des équipes étrangères ? **Vide = `non`** (défaut documenté) | 🗓️ | — | ❌ **À VIDER** |
| `org_equipes_etrangeres_liste` | `Club Exemple (Belgique)` | Liste des équipes étrangères (nom du club, pays) | 🗓️ | — | ❌ **À VIDER** |
| `org_nb_participants` | `240` | Nombre de participants — ⚙️ **repli** : utilisé **uniquement** si aucun club n'a déclaré ses effectifs | ⚙️ 🗓️ | — | ❌ **À VIDER** |

#### B.1 — Installations sportives

| parametre | valeur (exemple) | Signification | Famille | 🔒 | Réinit. |
|---|---|---|---|---|---|
| `org_type_terrain` | `Synthétique` | Type de terrain **réellement utilisé** (Gazon / Synthétique / Sable / Neige / Argile). ⚠️ **Repli** : la nature déclarée dans `terrains_physiques` prime | 🗓️ | — | ❌ **À VIDER** *(A1)* |
| `org_nb_vestiaires` | `4` | Nombre de vestiaires **utilisés** ce jour-là | 🗓️ | — | ❌ **À VIDER** *(A1)* |

#### B.2 — Récompenses *(clés dynamiques)*

| parametre | valeur (exemple) | Signification | Famille | 🔒 | Réinit. |
|---|---|---|---|---|---|
| `org_recompenses_<CAT>` | `org_recompenses_U8` = `oui` | Récompenses prévues pour la catégorie. ⚠️ **Une clé par catégorie présente**, créée à l'enregistrement — leur nombre varie | 🗓️ | — | ❌ **À VIDER** *(A3)* |

> ⚠️ **Ces clés deviennent orphelines.** Une réinitialisation **supprime toutes les catégories**
> (Zone B) mais laisse `org_recompenses_U8`, `org_recompenses_U10`… dans la Zone A. Leur effacement
> ne peut pas passer par une liste fixe : il faut **énumérer les clés existantes** et filtrer sur le
> préfixe.

#### B.3 — Arbitrage

| parametre | valeur (exemple) | Signification | Famille | 🔒 | Réinit. |
|---|---|---|---|---|---|
| `org_nb_arbitres` | `6` | Nombre d'arbitres prévus | 🗓️ | — | ❌ **À VIDER** |
| `org_nb_educateurs` | `30` | Total d'éducateurs accompagnants — ⚙️ **repli** : utilisé si aucune des deux sources de la cascade n'est connue | ⚙️ 🗓️ | — | ❌ **À VIDER** |
| `org_nb_educateurs_club` | `8` | Éducateurs **du club organisateur**. ⚙️ **Champ propre à Maxilou** : il n'existe pas au formulaire. Le club organisateur ne s'invitant pas lui-même, ses éducateurs ne sont dans aucune réponse d'invitation — ce nombre **s'ajoute** à la somme déclarée par les clubs | ⚙️ 🗓️ | — | ❌ **À VIDER** *(A2)* |
| `org_nb_doublettes` | `2` | Nombre de doublettes de jeunes arbitres prévues | 🗓️ | — | ❌ **À VIDER** |

#### B.4 — Sécurité

| parametre | valeur (exemple) | Signification | Famille | 🔒 | Réinit. |
|---|---|---|---|---|---|
| `org_medecin_oui` | `non` | Un médecin est-il présent ? | 🗓️ | — | ❌ **À VIDER** |
| `org_medecin_nom` | `Dr Exemple` | Nom du médecin (sans objet si `org_medecin_oui = non`) | 🗓️ | 🔒 | ❌ **À VIDER** |
| `org_medecin_tel` | `0612345678` | Téléphone du médecin | 🗓️ | 🔒 | ❌ **À VIDER** |
| `org_secours_nom` | `Association de secours Exemple` | Nom de l'antenne de secours. ⚠️ Distinct de `securite_secours_oui` / `_precisions` (dossier club) | 🗓️ | 🔒 | ❌ **À VIDER** |
| `org_secours_tel` | `0612345678` | Téléphone de l'antenne de secours | 🗓️ | 🔒 | ❌ **À VIDER** |
| `org_ambulance` | `non` | Une ambulance est-elle prévue ? | 🗓️ | — | ❌ **À VIDER** |

#### B.5 — Logistique

| parametre | valeur (exemple) | Signification | Famille | 🔒 | Réinit. |
|---|---|---|---|---|---|
| `org_droits_oui` | `oui` | Des droits d'inscription sont-ils demandés ? ⚠️ **Repli** : vide, le tarif d'engagement des modalités d'inscription est repris | 🗓️ | — | ❌ **À VIDER** |
| `org_droits_montant` | `50` | Montant par équipe | 🗓️ | — | ❌ **À VIDER** |
| `org_hebergement_oui` | `non` | Un hébergement est-il proposé ? | 🗓️ | — | ❌ **À VIDER** |
| `org_hebergement_structure` | `Gîte Exemple` | Structure d'accueil | 🗓️ | — | ❌ **À VIDER** |
| `org_repas_oui` | `oui` | Des repas sont-ils proposés ? | 🗓️ | — | ❌ **À VIDER** |
| `org_repas_fournisseur` | `Traiteur Exemple` | Fournisseur des repas | 🗓️ | — | ❌ **À VIDER** |
| `org_repas_prix` | `7` | Prix par personne | 🗓️ | — | ❌ **À VIDER** |
| `org_gouters_oui` | `oui` | Des goûters sont-ils proposés ? | 🗓️ | — | ❌ **À VIDER** |
| `org_gouters_fournisseur` | `Boulangerie Exemple` | Fournisseur des goûters | 🗓️ | — | ❌ **À VIDER** |
| `org_gouters_prix` | `2` | Prix par personne | 🗓️ | — | ❌ **À VIDER** |

**Compte : 10 à conserver + 26 à vider = 36**, plus les clés dynamiques `org_recompenses_*`.

> 📐 **Comment revérifier ce compte** *(§8 quater — un chiffre sans sa méthode est un piège)* :
> les 36 clés sont créées par `creerOngletConfig()` dans
> [`../backend/Code.gs`](../backend/Code.gs) et reprises **à l'identique** par la constante
> `CHAMPS_AUTORISATION` (écriture) et par `AUTORISATION_SAISIE`
> ([`../frontend/js/admin-autorisation.js`](../frontend/js/admin-autorisation.js), affichage).
> **Les trois listes ont été comparées le 2026-08-24 : 36 = 36 = 36, aucun écart.**

### Zone B — Réglages par catégorie

Un tableau, **une ligne par catégorie**. En-têtes :

| Colonne | Exemple | Signification |
|---|---|---|
| `categorie` | `U8` | Nom de la catégorie |
| `presente` | `oui` | La catégorie participe-t-elle à cette édition ? (`oui`/`non`) |
| `terrains` | `1,2` | Terrains dédiés à cette catégorie (numéros séparés par des virgules) |
| `terrains_auto` | `oui` | Source des terrains : `oui` (défaut) = attribués par l'onglet **Terrains & répartition** ; `non` = **saisis à la main** dans les réglages (avec vérification en direct). **Vide = `oui`** |
| `nb_poules` | *(vide)* | Nombre de poules. **Vide = Auto** (calculé pour viser ~4 équipes/poule) ; un entier = **forcé** |
| `format_mi_temps` | `2` | Nombre de mi-temps par match (`1` ou `2`) |
| `duree_mi_temps_min` | `10` | Durée d'une mi-temps, en minutes |
| `pause_mi_temps_min` | `2` | Pause entre les deux mi-temps, en minutes (0 si `format_mi_temps = 1`) |
| `recup_entre_matchs_min` | `15` | Temps de récupération minimum d'une équipe entre 2 de ses matchs |
| `format_apresmidi` | `CROISE` | Format de l'après-midi : `CROISE` / `CROISE_DIAGONAL` / `LIBRE` / `COUPE_PLATEAU`. **Vide = `CROISE`** (comportement historique) |
| `param_format` | `{"nbQualifiesCoupe":2}` | Réglages JSON du format. Pour `COUPE_PLATEAU` : nb de qualifiés en Coupe par poule. Vide pour `CROISE`/`CROISE_DIAGONAL`/`LIBRE` |
| `reglement` | `Règles FFR M10` ou `https://…` | **Optionnel** (dossier club). Règlement appliqué à la catégorie : texte libre **ou** URL — une valeur commençant par `http` doit être affichée en **lien cliquable** par les pages qui la consomment |
| `effectif_min` | `8` | **Optionnel** (dossier club). Effectif minimum par équipe (nb de joueurs). Si `effectif_min` et `effectif_max` sont saisis, min ≤ max (vérifié à l'enregistrement) |
| `effectif_max` | `12` | **Optionnel** (dossier club). Effectif maximum par équipe (nb de joueurs) |
| `arbitrage_organisation` | `Éducateurs des clubs` | **Optionnel** (dossier club). Qui arbitre les matchs. ⚠️ Nom volontairement distinct de l'« arbitrage » du code (assistant d'optimisation des horaires) |
| `max_equipes_par_club` | `2` | **Optionnel** (Phase 1). Nombre max d'équipes qu'un club peut engager dans cette catégorie. **Vide = illimité** (affiché « Plusieurs équipes possibles par catégorie » sur l'invitation ; jamais « 0 » ni « illimité ») |
| `forme_jeu` | `RE — 15x15` | **Optionnel** (conformité FFR). Forme de jeu FFR **retenue** par l'organisateur pour cette catégorie ce mois-là. **Vide = non précisée** (historique). Sert à lever l'ambiguïté quand une catégorie a plusieurs formes le même mois |
| `contexte_tournoi` | `SCF` | **Optionnel — U14 uniquement** (session 13). Contexte de jeu : **`SCF`** = Super Challenge de France ; **vide ou `LAMBDA`** = tournoi ordinaire (comportement historique). Ignoré pour toute catégorie autre que l'U14 (au sens FFR M14) : une valeur `SCF` posée ailleurs est sans effet |
| `scf_phase` | `P2` | **Optionnel — U14 en contexte SCF** (session 13). Phase du Super Challenge : **`P2`** (phase 2 : 1 journée, triangulaire/quadrangulaire, 2×15) ou **`P3`** (phase 3 & clôture : 2 journées, triangulaire, 2×11). **Vide = `P2`** (défaut prudent) |
| `pause_echelonnee` | `oui` | **Optionnel** (session 15). **`oui`** = la catégorie joue en **un round-robin planifié en deux vagues** avec un **repos ≥ 60 min garanti** par équipe et l'équité (jamais reposé contre épuisé), au lieu d'une pause déjeuner globale. Utile quand les terrains sont rares. **Vide/`non`** = mode classique. Éligible si effectif **pair ≥ 4** (sinon repli automatique sur la pause classique + avertissement) |

> ℹ️ **Migration automatique** : `format_apresmidi`, `param_format`, `terrains_auto`, puis
> `reglement`, `effectif_min`, `effectif_max`, `arbitrage_organisation`, `max_equipes_par_club`,
> `forme_jeu`, `contexte_tournoi` / `scf_phase` et enfin `pause_echelonnee`
> sont **ajoutées automatiquement** à droite de la Zone B dès la première génération d'après-midi (ou enregistrement
> de catégorie) sur un Sheet déjà en service. Une catégorie sans `format_apresmidi` = **classement
> croisé**, sans `terrains_auto` = **mode Auto**, et sans `contexte_tournoi` = **tournoi ordinaire**,
> comme avant. Les colonnes « dossier club » vides = champ non renseigné (aucun blocage).

> **Durée totale d'un match** (calculée par le backend) :
> `format_mi_temps × duree_mi_temps_min + pause_mi_temps_min` (si 2 mi-temps).
> Exemple U8 : `2 × 8 + 2 = 18 min`.

---

## Onglet `Equipes`

Une ligne par équipe. En-têtes :

| Colonne | Exemple | Rempli par |
|---|---|---|
| `id_equipe` | `E01` | Identifiant unique (généré ou saisi) |
| `nom_equipe` | `Suresnes-1` | Saisi par l'admin. Les équipes créées pour un **club invité** sont TOUJOURS numérotées `{club}-1`, `{club}-2`… (avant le 2026-08-03, une équipe seule portait le nom nu du club, ce qui donnait la paire bancale `MASSY` + `MASSY-1` dès la 2ᵉ). Une équipe héritée au nom nu est **renommée automatiquement** en `{club}-1` — sauf si elle est déjà en poule ou dans des matchs : elle est alors conservée telle quelle, avec une alerte |
| `categorie` | `U8` | Saisi par l'admin |
| `poule` | `A` | **Auto** — rempli par « Générer poules et planning » |
| `source` | `manuel` | **Nouveau (Sprint 6).** `manuel` = équipe ajoutée à la main ; `auto` = équipe **créée à l'enregistrement de la sélection des catégories engagées** d'un club invité (bouton « Enregistrer la sélection »). **Vide = `manuel`** (rétrocompatibilité) |
| `nb_joueurs` | `12` | Saisi par l'admin (ajout d'équipe ou crayon ✏️). **Facultatif** — vide = « non déclaré », ce qui n'est **pas** la même chose que `0` |
| `nb_educateurs` | `2` | Saisi par l'admin, même règle. Éducateurs accompagnant **cette** équipe |

> 🛠️ **Migration douce.** Les colonnes `source`, `nb_joueurs` et `nb_educateurs` sont **ajoutées
> automatiquement** à droite dès le premier ajout/modification d'équipe (ou envoi de dossier final)
> sur un Sheet déjà en service. Les lignes déjà présentes (sans `source`) comptent comme **`manuel`**.

> ⚠️ **Anti-double-compte.** `nb_joueurs` / `nb_educateurs` n'alimentent la demande d'autorisation
> (A.4 participants, B.3 éducateurs) que pour les équipes dont `source` **n'est pas** `auto` : une
> équipe `auto` vient d'une réponse d'invitation dont les totaux (`ClubsInvites.nb_joueurs_total` /
> `nb_educateurs_total`) sont **déjà** comptés — la recompter ici doublerait les effectifs.

---

## Onglet `Poules`

Définit les poules existantes. La **composition** se lit dans `Equipes` (colonne `poule`),
et le **classement se calcule** à partir des scores de l'onglet `Matchs`.

| Colonne | Exemple | Signification |
|---|---|---|
| `id_poule` | `P01` | Identifiant unique de la poule |
| `categorie` | `U8` | Catégorie de la poule |
| `nom_poule` | `A` | Nom court (A, B, C…) |

---

## Onglet `Matchs`

Une ligne par match. En-têtes :

| Colonne | Exemple | Rempli par |
|---|---|---|
| `id_match` | `M001` | Identifiant unique |
| `categorie` | `U8` | Auto (génération) |
| `poule` | `A` | Auto (génération) |
| `terrain` | `1` | Auto (génération) |
| `heure_debut` | `09:00` | Auto (génération) |
| `heure_fin` | `09:22` | Auto (génération) |
| `equipe_A` | `E01` | Auto (génération) — identifiant d'équipe |
| `equipe_B` | `E02` | Auto (génération) — identifiant d'équipe |
| `score_A` | `15` | **Page de saisie des scores** |
| `score_B` | `10` | **Page de saisie des scores** |
| `statut` | `à venir` | `à venir` / `en cours` / `terminé` |
| `phase` | `poule` | Auto — `poule` (matin) ou `classement` (après-midi, **tous formats**) |
| `format` | `COUPE_PLATEAU` | Auto — format de l'après-midi de la ligne (`CROISE`/`CROISE_DIAGONAL`/`LIBRE`/`COUPE_PLATEAU` ; vide pour le matin) |
| `sous_tableau` | `COUPE` | Auto — `COUPE` ou `PLATEAU` (uniquement en `COUPE_PLATEAU` ; vide sinon) |
| `tour` | `DEMI_FINALE` | Auto — tour de bracket (`FINALE`, `DEMI_FINALE`, `PETITE_FINALE`, `QUART_DE_FINALE`…) ; vide hors Coupe |
| `match_suivant` | `M042` | Auto — `id_match` qui reçoit le **vainqueur** de ce match (vide si terminal) |
| `place_suivant` | `A` | Auto — emplacement (`A`/`B`) du match suivant où placer le vainqueur |
| `vainqueur` | `E07` | En cas d'**égalité** en Coupe, `id_equipe` désignée vainqueur (départage manuel par le bénévole) |

> ℹ️ **Migration automatique** : les colonnes `phase` puis `format`, `sous_tableau`, `tour`,
> `match_suivant`, `place_suivant`, `vainqueur` sont **ajoutées automatiquement** à droite dès la
> première génération sur un Sheet déjà en service — aucune manip manuelle. Les `setupSheet()`
> neufs les créent déjà.

Pour les matchs de l'**après-midi** (`phase = classement`), la lecture de la ligne dépend du `format` :
- **CROISE** — la colonne `poule` contient le **niveau** (`N1` = 1ers de poule, `N2` = les 2es, etc.).
- **CROISE_DIAGONAL** — même étiquetage de **niveau** (`N1`, `N2`…) que `CROISE`, mais chaque niveau
  regroupe **deux rangs consécutifs** croisés en diagonale (1ᵉʳ d'une poule vs 2ᵉ d'une autre). Lu et
  classé **exactement comme `CROISE`**.
- **LIBRE** — `poule` vaut `Libre` (matchs amicaux, sans classement ni qualification).
- **COUPE_PLATEAU** — `poule` vaut `Coupe` ou `Plateau` ; en Coupe, `sous_tableau=COUPE` + `tour` +
  `match_suivant`/`place_suivant` décrivent le **bracket à élimination directe** (avec petite finale).
  Un score de Coupe validé **propage automatiquement** le vainqueur dans `match_suivant`.

---

## Onglet `Historique` (journal de saison)

Cet onglet **n'est jamais effacé** par « Générer poules et planning » (qui, lui, vide
l'onglet `Matchs`). Il **accumule tous les matchs terminés de la saison**, tournoi après
tournoi. La page interne **Perfs du club** (`frontend/perfs.html`, onglet « Saison ») s'en
sert pour cumuler les rencontres — utile quand le club croise plusieurs fois la même équipe.

**Alimentation automatique :** dès qu'un score est validé (page saisie), le match est recopié
ici par le backend (`archiverResultat` dans [`../backend/Code.gs`](../backend/Code.gs)). Une
**correction de score met à jour la même ligne** (pas de doublon). Rien à faire à la main.

| Colonne | Exemple | Signification |
|---|---|---|
| `date` | `2026-01-12` | Jour où le score a été validé (≈ date du tournoi) |
| `tournoi_id` | `2026-01-12 09:03:00` | Identifiant du tournoi (posé à chaque génération). Sert de clé avec `id_match` |
| `id_match` | `M001` | Identifiant du match **dans son tournoi** |
| `categorie` | `U8` | Catégorie |
| `phase` | `poule` | `poule` (matin) ou `classement` (après-midi) |
| `equipe_A` | `Racing 92` | **Nom** de l'équipe A (et non son id : les noms sont stables d'un tournoi à l'autre) |
| `equipe_B` | `MASSY` | **Nom** de l'équipe B |
| `score_A` | `20` | Score de l'équipe A |
| `score_B` | `5` | Score de l'équipe B |

> 🛠️ **Création automatique.** L'onglet et son en-tête sont créés tout seuls à la première
> validation de score (fonction `assurerOngletHistorique`) — inutile de les saisir. Les
> `setupSheet()` neufs le créent déjà. Le paramètre `tournoi_id` apparaît aussi dans la
> **Zone A** de l'onglet `Config`.

---

## Onglet `ClubsInvites` (clubs invités)

La liste des clubs invités, gérée par la carte « **Clubs invités** » de la page admin. Sert
aux **deux phases** : invitation légère (Phase 1) puis dossier complet personnalisé envoyé aux
clubs qui **acceptent** (Phase 2).

> 🔒 **Confidentialité.** Cet onglet contient des **emails de contact** : il n'est **jamais**
> inclus dans les données publiques (`getAll`, cache serveur, relais CDN). Il se lit intégralement
> via l'action **`listerClubsInvites`** (`doPost` + **clé admin**). Le dossier Phase 2 public
> (`getClubDossier`, `doGet`) n'expose **que** `club_nom`, `club_contact_prenom` et
> `categories_engagees` — **jamais l'email**.

| Colonne | Exemple | Signification |
|---|---|---|
| `club_nom` | `MASSY` | Nom du club (sert de **clé** : pas de doublon, comparaison sans accents ni casse) |
| `club_contact_nom` | `Camille Dupont` | Nom du contact au club (optionnel) |
| `club_contact_email` | `contact@club.fr` | Email du contact (optionnel, format vérifié). Destinataire de l'envoi automatique Phase 2 |
| `statut` | `Invité` | `Invité` (défaut) / `Accepté` / `Décliné` — modifiable via le menu déroulant de l'admin. ⚠️ **Renommé** : « Confirmé » → « Accepté » (l'ancien libellé reste reconnu à la lecture) |
| `date_ajout` | `2026-07-23` | Posée automatiquement à l'ajout (AAAA-MM-JJ) |
| `club_contact_prenom` | `Camille` | **Nouveau.** Prénom du contact, utilisé dans la politesse du dossier Phase 2 (« Bonjour {prénom}, ») |
| `categories_engagees` | `U8,U10` | **Nouveau.** Catégories réellement engagées par le club (texte séparé par virgules, ou JSON). **Vide** tant que le club n'a pas répondu. Filtre le tableau « Format sportif » du dossier Phase 2 |
| `dossier_envoye` | `2026-07-24` | **Nouveau.** Date (AAAA-MM-JJ) posée **automatiquement** quand l'envoi du **dossier Phase 2** **réussit** (jamais en cas d'échec). Vide par défaut |
| `invitation_envoyee` | `2026-07-24` | **Nouveau (Sprint 5).** Date (AAAA-MM-JJ) posée **automatiquement** quand l'envoi de l'**invitation Phase 1** **réussit** (individuel ou groupé). Sert à exclure un club du prochain envoi groupé (sauf « Renvoyer aussi »). Vide par défaut |
| `club_token` | `a1b2c3d4-…` | **Nouveau (Sprint 6).** Jeton aléatoire unique (UUID) généré à l'ajout du club. Sécurise l'accès à sa page de réponse **et à son dossier** (`?club=…&token=…`). Le club peut le partager à **son encadrement** (bouton « Partager le dossier à mes équipes »). **RENOUVELABLE** : regénérer un dossier déjà envoyé propose un nouveau jeton (`regenererJetonClub`) — l'ancien lien et toutes ses copies meurent aussitôt. **EFFACÉ** par la réinitialisation du tournoi (un nouveau est réattribué au chargement suivant de l'admin) |
| `date_reponse` | `2026-09-10` | **Nouveau (Sprint 6).** Date de la réponse du club en libre-service (Accepté **ou** Décliné). Vide par défaut |
| `nb_equipes_par_categorie` | `{"U8":2,"U10":1}` | **Nouveau (Sprint 6).** JSON du nombre d'équipes engagées par catégorie (saisi par le club). Validé ≤ `max_equipes_par_club` côté backend |
| `nb_joueurs_total` | `24` | **Nouveau (Sprint 6).** Total de joueurs attendus pour toutes les équipes du club (entier, saisi par le club, informatif) |
| `alerte_ecart` | `« MASSY-2 » (U8) conservée : déjà placée en poule A…` | **Nouveau (Sprint 6, révisé « liserés »).** Message posé quand la synchronisation des équipes n'a **pas pu retirer** une équipe excédentaire (créée à la main, déjà en poule, ou présente dans des matchs générés) : un badge ⚠️ explique quoi faire. Les équipes **supprimables** (source `auto`, hors poule, hors matchs), elles, sont retirées automatiquement. Vide sinon |
| `selection_enregistree` | `2026-08-02` | **Nouveau (« liserés d'état »).** Date posée quand l'admin clique « **Enregistrer la sélection** » ; **effacée par toute nouvelle réponse du club** (acceptée ou déclinée). Pilote le liseré de la carte admin : réponse présente **sans** cette marque ⇒ carte **orange « À enregistrer »** ; marque présente ⇒ **verte**. Colonne absente (vieux Sheet) ⇒ orange (défaut prudent) |

> 🛠️ **Création + migration automatiques.** L'onglet et son en-tête sont créés tout seuls au
> premier accès (`assurerOngletClubsInvites`). Les **colonnes nouvelles** (`club_contact_prenom`,
> `categories_engagees`, `dossier_envoye`, `invitation_envoyee`, puis `club_token`, `date_reponse`,
> `nb_equipes_par_categorie`, `nb_joueurs_total`, `alerte_ecart`, `detail_effectifs`,
> `nb_educateurs_total`, `selection_enregistree`) sont ajoutées **à droite** des colonnes existantes
> sur un Sheet déjà en service (`assurerColonnesClubsInvites`) — les 5 premières gardent leur
> position. Les clubs **sans jeton** (fiches d'avant le Sprint 6) en reçoivent un automatiquement à
> l'ouverture de l'admin ou au prochain envoi (`assurerTokensClubs`).
> ✅ La **réinitialisation du tournoi** CONSERVE le carnet d'adresses (noms, contacts, prénoms,
> statuts), mais **remet à zéro** les colonnes propres à l'édition — **`club_token` compris** :
> les liens de l'édition passée (dossiers, pages de réponse, copies partagées aux éducateurs)
> cessent de fonctionner, et chaque club reçoit un jeton neuf au prochain chargement de l'admin.
> Sont aussi vidées : `categories_engagees`, `dossier_envoye`, `invitation_envoyee`, `date_reponse`,
> `nb_equipes_par_categorie`, `nb_joueurs_total`, `selection_enregistree` (les cartes
> repartent donc en **violet « En attente de réponse »**).

> 🔓 **Réponse en libre-service (Sprint 6).** Le club répond lui-même via
> `reponse-invitation.html?tournoi=…&club=…&token=…` : lecture par `getReponseInvitation` (doGet,
> validée par le jeton — jamais l'email exposé) et écriture par `repondreInvitation` (doPost
> **sécurisé par le jeton, pas la clé admin**). Un jeton invalide → « Lien invalide ou expiré ».
> L'envoi du dossier complet reste **toujours manuel** côté admin.

---

## Onglet `Sponsors` (partenaires de la page publique)

Les partenaires affichés sur la page publique des scores, gérés par l'écran « **Partenaires** »
de la page admin. **Aucune donnée personnelle** : un partenaire est une entreprise, et tout, ici,
est destiné à être affiché.

> 🧪 **Prototype.** L'affichage est piloté par les réglages `sponsors_*` de l'onglet `Config`,
> tous exposés à la page publique. ⚠️ **La mesure de visibilité, elle, PASSE par le Sheet** : les
> relevés envoyés par les téléphones des spectateurs (action `mesureSponsors`) sont écrits dans
> l'onglet **`Mesures`**. Voir [`docs/sponsors.md`](sponsors.md).

| Colonne | Exemple | Signification |
|---|---|---|
| `id_sponsor` | `SP4A2E19C7` | Identifiant tiré au sort à la création (**clé** de la fiche) |
| `nom` | `Décathlon Le Plessis` | Nom affiché. Sert aussi de **texte alternatif** au logo (lecteurs d'écran) |
| `logo_id` | `1AbC…` | Id du fichier Drive du logo (public en lecture), comme `tournoi_affiche_id`. Vide ⇒ pastille au nom du partenaire sur sa couleur de marque |
| `url` | `https://…` | Site du partenaire (optionnel). Lien en `rel="noopener sponsored"`, nouvel onglet |
| `accroche` | `Tout l'équipement rugby` | Une ligne (60 car. max) affichée sous le logo |
| `emplacements` | `bandeau,mur` | Où il apparaît, séparés par des virgules : `bandeau` (A) · `rail` (B) · `fil` (C) · `plein` (D) · `mur` (E). Vide ⇒ `mur`. Un jeton inconnu est **ignoré** à l'écriture |
| `poids` | `3` | 1 à 5 — part du partenaire dans la **roue de rotation**. Poids 3 = 3× plus de tours que poids 1. Sans effet sur les emplacements à partenaire unique |
| `visuel_id` | `1XyZ…` | Id Drive d'un **visuel plein écran** fourni par le partenaire (optionnel). Absent ⇒ l'interstitiel se compose depuis logo + accroche + couleur |
| `couleur` | `#0A5AA8` | Couleur de marque (`#RRGGBB`), fond du plein écran auto-composé. Vide ⇒ navy de la charte |
| `actif` | `oui` | `oui` = affiché. Toute autre valeur ⇒ retiré de la page **sans perdre la fiche** |
| `ordre` | `1` | Entier — position dans le **mur des partenaires** uniquement |
| `logo_zoom` | `130` | **Nouveau.** Taille du logo en **% de la taille de référence** (50 à 200 ; vide ⇒ 100). Rattrape les fichiers qui embarquent leurs propres marges blanches. Migration douce : colonne ajoutée **à droite**, complétée automatiquement par `assurerOngletSponsors` |

> ♻️ **Conservé par la réinitialisation**, comme `ClubsInvites` : un partenariat se reconduit
> d'une édition à l'autre, et le remettre à zéro obligerait à re-téléverser tous les logos. Pour
> retirer un partenaire, décocher `actif`.

> 🆕 **Créé à la demande** (`assurerOngletSponsors`) : un classeur antérieur aux partenaires
> reste valide, l'onglet apparaît à la première écriture. Inutile de relancer `setupSheet`, qui
> réécrirait `Config`.

---

## Onglet `Mesures` (relevés de visibilité des partenaires)

Les relevés déposés par les **navigateurs des spectateurs**, qui permettent d'additionner la
visibilité de **tous les appareils** dans la fiche partenaire. Écrit par l'action publique
`mesureSponsors`, lu par l'admin via `lireMesuresSponsors`.

> 🔒 **Aucune donnée personnelle.** Deux identifiants **aléatoires** tirés sur l'appareil et
> remis à zéro chaque jour : ils ne permettent d'identifier personne ni de suivre qui que ce
> soit d'un site à l'autre. Aucun cookie, aucun traceur tiers.

| Colonne | Exemple | Signification |
|---|---|---|
| `horodatage` | `2026-12-14 11:07:32` | Moment de réception du relevé |
| `jour` | `2026-12-14` | Journée (clé de filtrage de la consolidation) |
| `appareil` | `67h2rvuug17a` | Identifiant aléatoire de l'appareil — compte la **portée** (combien de monde) |
| `session` | `k3p9wq2zt5ab` | Identifiant aléatoire de la **visite** (une par ouverture de page) |
| `donnees` | `{"SP1":{"expo":{…},…}}` | JSON des compteurs **cumulés** de la session |

> ⚠️ **Les relevés sont CUMULATIFS**, et une session en dépose plusieurs (20 s après
> l'ouverture, puis toutes les 10 min, plus un à la fermeture). La consolidation prend donc le
> **MAXIMUM par session**, puis **somme les sessions** — jamais la somme des relevés d'une même
> session, qui compterait le même temps autant de fois qu'il y a eu d'envois. C'est aussi ce qui
> rend le total juste quand un relevé se perd ou arrive en double, et ce qui autorise à écrire
> **sans verrou et sans jamais relire**.

> 🧹 **Vidable d'un bouton** depuis l'écran admin (« Repartir de zéro »), et **isolé** : aucune
> autre partie du logiciel ne lit cet onglet.

> 🆕 **Créé à la demande** (`assurerOngletMesures`), comme `Sponsors`.

---

## Système de classement (rappel)

Calculé en direct à partir des matchs `terminé` :
- **Victoire** = 3 points
- **Match nul** = 2 points
- **Défaite** = 1 point

En cas d'égalité de points, départage par la **différence** (points marqués − points encaissés),
puis par les points marqués.
