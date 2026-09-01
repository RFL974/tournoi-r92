# ÉTAT DE L'INDUSTRIALISATION — Tournoi R92

> **Ce fichier répond à une seule question : où en sommes-nous ?**
> Il est court **volontairement**. Il est mis à jour **à la fin de chaque session**.
> Le détail vit dans `PLAN.md`, `RISQUES.md`, `DECISIONS.md`, `SESSIONS.md`.

> 📕 **Pour une vue d'ensemble du chantier — et non de son avancement — lire
> [`RAPPORT-AUDIT.md`](RAPPORT-AUDIT.md).** C'est la **synthèse close de l'ÉTAPE 2** : les 8
> domaines, les 88 problèmes (R-001 → R-088), les 6 risques de méthode (M-01 → M-06), ce qui s'est
> révélé **sain**, ce qui reste à décider, l'ordre proposé, et **les limites de l'audit**.

> # 🟢 JEU DE TOURNOI FICTIF EN PLACE — ⚡ PUB-4 A CONSOMMÉ SES PREUVES, SON SORT EST À DÉCIDER
>
> ⚡ **CE REPÈRE REMPLACE, LE 2026-08-26, celui intitulé « 🔴 DONNÉES DE TOURNOI À RECRÉER AVANT
> LES PROCHAINS TESTS FONCTIONNELS ».** ⭐ **Il se retire comme sa propre condition l'exigeait** :
> *« il devra alors dire PAR QUOI il a été remplacé »*. Voici par quoi.
>
> **Ce qui est PRÉSENT dans le classeur** *(saisi par Romain le 2026-08-26, dans son navigateur)* :
>
> | | |
> |---|---|
> | **Horaires** | heure de début **`09:00`** · heure de fin en mode **auto** *(le défaut)* |
> | **Catégorie** | **une seule** : **`U10`**, présente · **durée de période `10` min** · terrains attribués automatiquement |
> | **Équipes** | **trois** : **`EQUIPE TEST A`**, **`EQUIPE TEST B`**, **`EQUIPE TEST C`** — ⛔ **sans aucun effectif** *(ni joueurs, ni éducateurs)* |
> | **Terrains** | le **plan par défaut** de l'application *(Rugby 1, Rugby 2, Foot 1, Foot 2)*, enregistré puis réparti |
> | **Planning** | **1 poule**, **3 matchs** du matin · ⛔ **aucun score saisi** |
> | ⛔ **`tournoi_publie`** | **`non`** — ⭐ **et il doit le rester** *(voir l'encadré ci-dessous)* |
> | ⛔ **Ce qu'il n'y a PAS** | aucun **club invité**, aucun **contact**, aucune **personne**, aucun **effectif**, et **« Infos du tournoi » vide** *(ni nom, ni date, ni lieu, ni affiche)* |
>
> ⭐ **Pourquoi ce jeu-là, et pas un autre** : c'est **le strict minimum** que le code exige pour que
> les cinq étapes passent à ✅ — établi par lecture de `calculerEtatsEtapes`, puis **éprouvé en
> réel**. `U10` a été choisi parce qu'il porte une **taille de terrain par défaut**, ce qui évite
> une saisie. ⚠️ **`U10` est un libellé d'âge, ⛔ pas un club ni une personne.**
>
> ---
>
> > ## ✅ L'INTERDICTION EST LEVÉE — PUBLIER N'ATTEINT PLUS AUCUN SITE TIERS
> >
> > ⚡ **Ce bloc portait une INTERDICTION EN VIGUEUR : « NE PAS CLIQUER SUR PUBLIER LE TOURNOI ».
> > Elle était vraie jusqu'au 2026-08-26, et elle est LEVÉE depuis la clôture de PUB-4.**
> >
> > 🔬 **Ce qui a changé** : le site de l'association **n'interroge plus ce serveur** *(commit
> > `9dbdf0a`, publié)*, et la vue `invitation` **n'expose plus** le témoin *(commit `a4ee3bb`,
> > redéployé)*. ⭐ **Publier ne fait donc plus apparaître quoi que ce soit ailleurs que sur la page
> > publique Maxilou** — c'était exactement l'objet du chantier, et c'est **observé**, pas déduit.
> >
> > *Ce que ce bloc disait, et qui reste vrai à sa date* : *« la vitrine interroge EXACTEMENT le
> > même serveur ; publier ferait apparaître, en tête des actualités d'une association réelle,
> > l'annonce d'un tournoi qui n'existe pas »*. ⭐ **C'est précisément ce qui n'est plus possible.**
>
> ---
>
> ✅ **PUB-4 A CONSOMMÉ SES PREUVES le 2026-08-26.** Ce jeu a servi exactement à ce pour quoi il
> était gardé : **« Masquer » jamais grisé** *(condition 5 de R-098)* et les **contrôles §21.10 ter
> 6 et 8** hérités de PUB-2. ⚡ *(Ce bloc disait « NE SUPPRIME PAS CE JEU, il est conservé POUR
> PUB-4 » : vrai jusqu'à cette date.)*
>
> 🔬 **Il est TOUJOURS EN PLACE et INTACT — constaté le 2026-08-26 après le redéploiement** :
> **3 équipes · 1 poule · 3 matchs**, tous au statut *« à venir »*, `tournoi_publie` = **`non`**.
> ⭐ **Le cycle `non → publié → non` a été joué et refermé** : le masquage **cache** le tournoi,
> ⛔ **il ne supprime aucune donnée** — et c'est vérifié.
>
> 🏁 ⚡ **CE JEU N'EXISTE PLUS — IL A ÉTÉ CONSOMMÉ, ET C'ÉTAIT SON RÔLE** *(2026-08-27, suite 3)*.
> Le **reset nominal réel** de B2-1 l'a effacé : **0 équipe · 0 poule · 0 match**, catégorie `U10`
> supprimée, `tournoi_id` vidé, `tournoi_publie` = **`non`**. ⭐ **Ce n'est pas un incident : c'est
> la dernière preuve du lot**, prise après décision explicite de Romain *(**D-058**)*, et **après
> création d'une copie complète du classeur**.
>
> ⛔ **Le classeur est donc VIERGE DE TOURNOI aujourd'hui**, et ⛔ **il n'a pas été reconstruit** :
> aucune session ne le refera sans décision de Romain. ⭐ **Ce qui devait survivre a survécu** —
> `Historique` *(211 lignes)*, les **3 fiches de clubs** et leurs contacts, les partenaires, les
> réglages de terrains, les clés.
>
> ⚡ *(Ce repère a annoncé successivement « NE SUPPRIME PAS CE JEU, il est conservé POUR PUB-4 »,
> puis « TOUJOURS INTACT — et cette fois c'est CONSTATÉ, pas déduit », puis « sa décision devient
> urgente, parce qu'elle en commande une autre ». ⭐ **Chacune était vraie à son heure**, et la
> dernière disait juste : **la décision a bien commandé la preuve**.)*
>
> ✅ ⚡ **LA DÉCISION A ÉTÉ PRISE — CE PARAGRAPHE ÉTAIT DEVENU FAUX, ET IL EST CORRIGÉ ICI**
> *(constaté au reconstat d'ouverture de **B2-2**, le 2026-08-27)*.
>
> *Ce qu'il annonçait, et qui était vrai jusqu'au reset du 2026-08-27* : *« la décision n'est pas
> prise ; le jeu est conservé en l'état jusqu'à ce que Romain tranche entre le garder et le
> réinitialiser ; aucune session ne doit le supprimer sans cette décision. »*
>
> ⭐ **Romain a tranché, et le geste a eu lieu** : le jeu a été **consommé par le reset nominal
> réel**, après **création d'une copie complète du classeur** — c'est **D-058**. ⛔ **Il n'y a donc
> plus rien à décider sur son SORT** ; ce qui reste ouvert est **s'il faut en reconstruire un**,
> et cela appartient à Romain *(voir le tableau ci-dessous)*.
>
> 🎯 **Pourquoi cet écart est signalé au lieu d'être simplement effacé** *(**§8 septies**)* : la
> phrase a été écrite **avant** le geste et n'a pas été relue **après**. Elle a coexisté quelques
> heures avec le bloc 🏁 qui, douze lignes plus haut, disait l'inverse — ⛔ **et c'est exactement le
> décrochage que la règle décrit** : un état qui annonce qu'il *reste* du travail là où il n'en
> reste plus.
>
> ---
>
> *Ce que disait le repère précédent, et qui reste vrai à sa date* : le **2026-08-24**, le classeur
> a été **volontairement réinitialisé** pour la vérification réelle de **M1-B** — **2 catégories,
> 38 équipes, 10 poules, 51 matchs** supprimés, ⛔ **des données d'essai, pas un tournoi réel**.
> ⛔ **Ce n'était pas un incident** : c'était un geste **décidé, annoncé et utilisé comme preuve**.
> Le 2026-08-25, deux **témoins minimaux** ont été créés puis effacés par les resets de **B2-0** ;
> ⛔ **aucun jeu complet n'avait alors été recréé.** ⭐ **C'est chose faite le 2026-08-26.**

**Dernière mise à jour** : 2026-09-01 *(session 33, suite — 🏁🏁 **B2-2 EST CLÔTURÉ**)* —
🏁 **M1-B2 / B2-2 EST CLOS, ET LE NOUVEAU MODÈLE EST EN SERVICE SUR LE VRAI CLASSEUR**
*(décision explicite de Romain, après la phase réelle 2B — **D-060**)*.

> ⭐ **Ce que B2-2 a livré, et qui est désormais en service** : **`Clubs`** porte l'**identité
> durable** *(`club_id` stable, jamais réutilisé)* ; **`Participations`** porte l'**engagement d'une
> édition** ; la **migration explicite** a eu lieu ; la **couche d'adaptation** rend au navigateur
> l'objet plat d'avant, si bien qu'⛔ **aucun écran n'a été réécrit** ; ⛔ **aucune participation
> n'est créée passivement** ; et une **écriture métier ordinaire** atteint désormais `Clubs`.
>
> ⚠️ **`ClubsInvites` N'EST PAS SUPPRIMÉ, et ce n'est pas un oubli** : il est **conservé
> volontairement** *(arbitrage **D-059**)*, intact, comme filet de sécurité et trace historique.
> ⛔ **Il n'est simplement plus la source métier.** Sa suppression est une **dette assumée**, à
> décider séparément — ⛔ elle n'appartenait pas à B2-2.
>
> ⛔ **CE QUE LA CLÔTURE NE DIT PAS, et qui ne doit jamais être arrondi** : **R-104**, **R-105** et
> **R-110** ⛔ **restent OUVERTS avec leurs réserves**. Trois scénarios n'ont **jamais** tourné sur
> des données réelles — la migration d'une ligne legacy **portant** une preuve d'engagement *(cas A
> de D-059, avec ses snapshots)*, le **renommage** d'un club, la **reprise** d'une migration
> partielle. ⭐ **Ils sont couverts par des tests éprouvés par rejeu de mutation**, ⛔ **pas par une
> observation en production** *(`CLAUDE.md` §13.6)*.

*Rappel de la mise à jour précédente* — 2026-09-01 *(session 33, suite — 🏁 **PHASE RÉELLE 2B**)* —
✅ **L'ÉCRITURE MÉTIER POST-MIGRATION EST PROUVÉE SUR LE CLASSEUR RÉEL.**

> 🔬 **LA PREUVE QUI MANQUAIT.** La phase 2A prouvait le **passage** au nouveau modèle et sa
> **lecture** ; ⛔ rien ne prouvait qu'on y **écrit**. Une modification ordinaire depuis
> l'administration — le contact du club fictif `LE TEST RUGBY CLUB`, `TEST` → `TEST-B22-POST`, puis
> retour — l'établit.
>
> | | **P0** | **P1** *(après écriture)* | **P2** *(après retour)* |
> |---|---|---|---|
> | Empreinte globale | `5af6074a…` — ⭐ **96 386 caractères** | `1215f913…` — **96 395 caractères** | ⭐ **`5af6074a…` — 96 386, IDENTIQUE À P0** |
> | `Clubs` · ⭐ **`club_contact_nom` — le SEUL champ modifié** | `TEST` | ✅ **`TEST-B22-POST`** | `TEST` |
> | `club_id` | `47c8d445-…` | ⭐ **inchangé** | ⭐ **inchangé** |
> | `ClubsInvites` | `86a1891a…` | ⭐ **`86a1891a…`** | ⭐ **`86a1891a…`** |
> | `Participations` | 0 | ⭐ **0** | ⭐ **0** |
>
> ⭐ **UNE SEULE LIGNE A CHANGÉ DANS TOUT LE CLASSEUR**, et l'écart global vaut **+9 caractères** —
> exactement la différence de longueur entre les deux valeurs. ⛔ **Aucune écriture secondaire** :
> ni horodatage, ni journal, ni participation.
>
> 🎯 **Ce que P1 établit, et rien d'autre ne le pouvait** : à cet instant, `Clubs` disait
> `TEST-B22-POST` et `ClubsInvites` disait toujours `TEST`. ⛔ **Les deux onglets ne peuvent plus
> être confondus.** ⭐ **Et l'écran affichait `TEST-B22-POST`** — une valeur absente du legacy :
> elle ne pouvait venir que du carnet. **La boucle écriture → stockage → relecture est fermée.**
>
> ⭐ **Le périmètre d'écriture avait été LU DANS LE CODE avant le geste** *(4 colonnes de `Clubs`,
> ligne repérée par `club_id`)*, ⛔ pas déduit des tests — et le réel y correspond exactement.
>
> ⚠️ **UN ÉCART DE LA PHASE 2A A ÉTÉ RATTRAPÉ ICI, et il est signalé plutôt qu'effacé** :
> `PLAN.md` n'avait **pas** été inventorié lors du commit `d0c928f`. Ses fiches de chantier ont donc
> annoncé *« ⏳ passe locale livrée, ⛔ rien n'est en service »* alors que le classeur était migré
> depuis plusieurs heures. 🎯 **§8 septies nomme pourtant explicitement les fiches de `PLAN.md`**
> parmi les sources d'état courant à relire après le geste.

*Rappel de la mise à jour précédente* — 2026-09-01 *(session 33 — 🏁 **PHASE RÉELLE 2A TERMINÉE**)* —
✅ **LA MIGRATION RÉELLE A EU LIEU : LE CLASSEUR EST PASSÉ EN `Clubs` + `Participations`.**
⛔ **B2-2 n'est PAS clos** *(§25 du cadrage : la clôture appartient à Romain)*.

> 🔬 **CE QUI EST CONSTATÉ SUR LE CLASSEUR RÉEL — ⛔ rien n'est déduit.** `migrerClubsMaintenant()`
> exécutée sous **version 161**, puis **deux relances**, puis une **ouverture passive** de
> l'administration. Quatre relevés du **contenu intégral**, comparés par empreinte.
>
> | | **M0** *(avant)* | **M1** *(après migration)* | **M2** *(après 2 relances)* | **après ouverture admin** |
> |---|---|---|---|---|
> | Onglets | 13 | **15** | 15 | 15 |
> | `Clubs` | absent | ⭐ **3 lignes** | 3 | 3 |
> | `Participations` | absent | ⭐ **0 ligne** | **0** | ⭐ **0** |
> | `migration_clubs_b22` | absente | `2026-09-01 14:04:02` | **inchangée** | **inchangée** |
> | `ClubsInvites` | `86a1891a…` | ⭐ **`86a1891a…`** | `86a1891a…` | `86a1891a…` |
> | Empreinte globale | `73ec1d25…` *(95 244 car.)* | `5af6074a…` *(96 386)* | ⭐ **`5af6074a…`** | ⭐ **`5af6074a…`** |
>
> ⭐ **Trois résultats, et le troisième n'était pas au programme.**
> ① **La séparation est en service** : 3 identités durables au carnet, `club_id` UUID v4 valides et
> distincts, ⛔ **aucune donnée d'engagement dans `Clubs`**, et `ClubsInvites` **intact caractère
> pour caractère**.
> ② **Zéro participation** — les trois `club_token` legacy n'en ont fabriqué aucune. ⭐ **Le prédicat
> a été recalculé sur les données du jour AVANT la migration** *(3 clubs / 0 participation)*, puis
> le résultat réel l'a confirmé. **D-059 est vérifié en production.**
> ③ **L'idempotence tient sur des appels RÉPÉTÉS** — trois appels au total, dont un interrompu par
> timeout : ⛔ aucun UUID régénéré, aucune marque réécrite, **empreinte globale identique**.
>
> ✅ **ET LA LECTURE PASSIVE NE CRÉE RIEN** : ouvrir « Clubs invités » affiche les 3 clubs avec
> leurs contacts *(constaté par Romain, l'écran exige la clé)* et laisse le classeur **strictement
> identique**. ⭐ `assurerTokensClubs` ne fabrique plus de participation à partir d'un écran qu'on
> regarde — c'était le risque nommé par **D-059**.
>
> ⚠️ **UN DÉFAUT RÉEL A ÉTÉ DÉCOUVERT, ET IL N'EST PAS CORRIGÉ** — 🆕 **R-110**. La première
> exécution s'est terminée sur `Exceeded maximum execution time` **après 6 minutes**, alors que le
> travail était fini en **8 secondes**. 🎯 **La cause est certaine** : `_b22Journaliser` affiche une
> **boîte de dialogue** *(`SpreadsheetApp.getUi().alert`)* **après** le journal ; personne ne
> cliquant, elle a attendu la limite. ⛔ **Elle n'a rien corrompu** — elle intervient après la
> dernière écriture — ⚠️ **mais elle fait échouer l'exécution EN APPARENCE**, et la tentation
> naturelle est alors de relancer ou de réparer un classeur pourtant sain.

*Rappel de la mise à jour précédente* — 2026-08-27 *(session 32 — 🏁 **PHASE RÉELLE 1 TERMINÉE**)* —
✅ **LA PREUVE DE NON-BASCULE EST ACQUISE SUR LE CLASSEUR RÉEL.** ⛔ **`migrerClubsMaintenant()`
n'a JAMAIS été exécutée, et B2-2 n'est PAS clos.**

> 🔬 **LA CHAÎNE COMPLÈTE, OBSERVÉE — ⛔ rien n'est déduit.** Code B2-2 déployé *(1222/1222 réel)*,
> classeur encore **legacy**, puis une **écriture métier réelle** depuis l'administration sur le
> club fictif `LE TEST RUGBY CLUB` : contact `TEST` → `TEST-B22-TEMOIN`, puis retour.
>
> | | **T0** | **T1** *(après écriture)* | **T2** *(après retour)* |
> |---|---|---|---|
> | Onglets | 13 | **13** | **13** |
> | `Clubs` | absent | ⛔ **absent** | ⛔ **absent** |
> | `Participations` | absent | ⛔ **absent** | ⛔ **absent** |
> | `migration_clubs_b22` | absente | ⛔ **absente** | ⛔ **absente** |
> | Valeur témoin | absente | ✅ **dans `ClubsInvites`** | effacée |
> | `Equipes`/`Poules`/`Matchs` · `Editions` · `Historique` | 0/0/0 · 2 · 211 | identiques | identiques |
> | Contenu intégral | 95 244 car. | 95 255 | ⭐ **95 244 — IDENTIQUE À T0** |
>
> ⭐ **L'écriture n'a changé que DEUX lignes dans tout le classeur**, et **un seul champ sur 17** :
> ⛔ ni `statut`, ni `club_token`, ni aucun engagement. `MASSY` et `LE PUC` **intacts**.
> ⭐ **T2 est identique à T0 caractère pour caractère.**
>
> 🎯 **Ce qui est établi** : *déployer B2-2 ne migre pas le classeur en douce.* ⛔ **Ce qui ne
> l'est pas** : la **séparation** elle-même — le classeur reste legacy jusqu'à la migration.

*Rappel de la mise à jour précédente* — 2026-08-27 *(session 32, phase réelle 1 — **réalignement
Git**)* —
✅ **LE CODE EN SERVICE CHEZ GOOGLE EST DE NOUVEAU CELUI DE `main`.** ⛔ **La preuve de
non-bascule reste à prendre, et `migrerClubsMaintenant()` n'a jamais été exécutée.**

> ⚠️ **L'ÉCART QUI A JUSTIFIÉ CETTE PASSE, et il valait d'être traité avant d'aller plus loin.**
> La correction du transport a été **collée et déployée** chez Google — elle y a produit
> **`R92 — 1222/1222 OK, 0 FAIL`** — ⛔ **mais elle n'avait été ni fusionnée ni poussée**.
> `main` et `origin/main` restaient sur **`41b6cc9`**, c'est-à-dire **le code défectueux de la
> version 160**. 🎯 **Quiconque aurait lu `main` pour savoir ce qui tourne aurait vu le mauvais
> code** — et une session suivante aurait pu recoller la version défectueuse en croyant bien faire.
>
> ✅ **CE QUI EST CONSTATÉ APRÈS LE GESTE** *(§8 septies)* :
>
> | | |
> |---|---|
> | **Intégration** | **Avance rapide pure** `41b6cc9` → **`b7cf62b`**, ⛔ **aucun commit de fusion** |
> | **Poussée** | ✅ **`git ls-remote origin refs/heads/main` = `b7cf62b`** · `HEAD` = `main` = `origin/main` · worktree **propre** |
> | ⭐ **Cohérence Git ↔ Google** | `backend/` est **identique depuis le commit de correction `c1d6309`** *(les deux commits suivants sont purement documentaires)*. ⭐ **Le code collé chez Google EST donc celui de `main`** : `Code.gs` **9893** lignes, `Tests.gs` **6958**, `TRANSPORT_EMAIL` présent, **TR1/TR2/TR3** présents |
> | ⛔ **Aucun redéploiement** | Le code présent dans l'éditeur est **déjà** celui de `main` : recoller n'aurait produit qu'un numéro de version de plus, ⛔ **sans rien changer** |
> | ⭐ **GitHub Pages** | ⛔ **Non déclenché** — `frontend/` n'est pas touché. Dernière exécution : **2026-08-26** sur `8778982` |
> | ✅ **Le classeur** | ⛔ **STRICTEMENT INCHANGÉ** — aucun geste métier durant cette passe |
>
> ⏭️ **La Phase réelle 1 reprendra exactement où elle s'est arrêtée** : l'écriture témoin
> `TEST → TEST-B22-TEMOIN` sur `LE TEST RUGBY CLUB`, puis constat, restauration, et arrêt.

*Rappel de la mise à jour précédente* — 2026-08-27 *(session 32, phase réelle 1)* — ⚠️ **B2-2 EST
DÉPLOYÉ EN VERSION 160, ET LE TEST RÉEL A ÉCHOUÉ : `1203/1210`, 7 FAIL.** ⛔ **La Phase réelle 1 est ARRÊTÉE
avant l'écriture témoin. `migrerClubsMaintenant()` n'a JAMAIS été exécutée.**

> 🔬 **CE QUI EST CONSTATÉ CHEZ GOOGLE** *(relevé par Romain, journal Apps Script)* :
>
> | | |
> |---|---|
> | **Déploiement** | ✅ **version 160**, même déploiement, même URL. Le serveur répond : `ping`, `getConfig`, `getEquipes` / `getPoules` / `getMatchs` = `[]` |
> | ⚠️ **`lancerTestsFFR`** | **`R92 — 1203/1210 OK, 7 FAIL`** — ⛔ le critère `1210/1210` **n'est PAS acquis** |
> | **Les 7 échecs** | **SN2** *(×2)*, **SN3** *(×2)*, **SN4**, **SN5**, **SN9** — ⭐ **tous sur le premier envoi d'invitation** |
> | ✅ **Le classeur** | **INTACT** : 13 onglets, ⛔ ni `Clubs`, ni `Participations`, ⛔ aucune marque — **contenu identique au relevé pré-déploiement, caractère pour caractère** |
> | ⛔ **Non fait** | Aucune écriture témoin · aucune modification de club · **aucune migration** |
>
> ⭐ **LA CAUSE EST TROUVÉE, ET LE CODE MÉTIER N'EST PAS EN FAUTE.** Ces sept tests appelaient le
> **vrai service d'envoi de Google**. La doublure Node le remplaçait par une fonction vide —
> l'envoi « réussissait » toujours ; ⛔ **chez Google il n'y a rien à remplacer**, `MailApp` étant
> un service **natif**. 🎯 **C'est le harnais qui mentait, en réussissant là où la production
> échoue** — nouveau risque **R-109**.
>
> ✅ **CORRIGÉ EN LOCAL** *(branche `claude/b2-2-transport-email`, commit `c1d6309`)* : un point de
> passage unique `TRANSPORT_EMAIL`, et surtout un **harnais durci** dont les doublures d'envoi
> **lèvent**. 🔬 **Rejoué sur le code de la version 160, il reproduit `1203/1210` — les sept mêmes
> assertions, dans le même ordre.** ⭐ **Le nouveau bilan attendu devient `1222/1222`.**
>
> ⚠️ **La version 160 reste en service et n'est PAS dangereuse en usage normal** : elle ne migre
> rien automatiquement, et l'envoi d'invitation y fonctionne — c'est le **test** qui échouait, pas
> l'envoi de l'organisateur.

*Rappel de la mise à jour précédente* — 2026-08-27 *(session 32, phase réelle 1)* — ✅ **B2-2 EST
INTÉGRÉ ET PUBLIÉ SUR GITHUB.**

> ✅ **CE QUI EST CONSTATÉ** *(§8 septies — après le geste, pas avant)* :
>
> | | |
> |---|---|
> | **Intégration** | **Avance rapide pure** `a778ff7` → **`5ee53a2`**, ⛔ **aucun commit de fusion** *(`git log --merges` : 0)*. Les **6** commits B2-2 sont dans `main` |
> | **Poussée** | ✅ **Constatée** : `git ls-remote origin refs/heads/main` = **`5ee53a2`**, `main` = `origin/main`, worktree **propre** |
> | ⭐ **Publication du frontend** | ⛔ **AUCUNE, et c'est VOULU.** Le workflow Pages ne se déclenche que sur `frontend/**` ou sur lui-même — ⛔ **ni l'un ni l'autre n'est touché**. Constaté : la dernière exécution date du **2026-08-26** *(`8778982`)*, ⛔ **aucune sur `5ee53a2`**. **Le site publié est strictement intact** |
> | ⭐ **Sauvegarde fraîche** | **« Tournoi R92 — sauvegarde avant DÉPLOIEMENT B2-2 — 2026-08-27 »**, créée à **18:04:54 UTC**. ⭐ **Vérifiée : identique à l'original CARACTÈRE POUR CARACTÈRE** *(95 244 caractères de part et d'autre)* — ⛔ pas seulement « le fichier existe ». La sauvegarde du 2026-08-27 10:08 est **conservée** |
> | ⛔ **Apps Script** | **RIEN N'EST DÉPLOYÉ.** Le serveur exécute toujours la version **159** *(source `2c5f48f`)* — donc `974/974`, ⛔ pas `1210/1210` |
> | ⛔ **Le classeur** | **13 onglets**, ⛔ **ni `Clubs`, ni `Participations`**, ⛔ **aucune marque `migration_clubs_b22`**. `migrerClubsMaintenant()` ⛔ **NON EXÉCUTÉE** |
>
> ⚠️ **UN ÉCART AU RELEVÉ ATTENDU, ET IL EST INSTRUCTIF.** Le relevé demandait de confirmer que
> *« les 12 colonnes d'engagement sont vides après le reset »*. ⛔ **Elles ne le sont pas toutes** :
> les **trois** clubs portent un **`club_token`** non vide. ⭐ **Ce n'est pas une anomalie** — c'est
> le comportement legacy **documenté** : le reset vide le jeton, puis `assurerTokensClubs` en
> réattribue un au chargement suivant de l'administration *(B2-0 / T6)*.
>
> 🎯 **Et c'est exactement le cas que le prédicat de B2-2 est fait pour traiter** : un jeton seul ne
> prouve **aucune** participation *(**D-059**)*. La migration produira donc **3 clubs et ZÉRO
> participation** — ce que le test **M9** prédit déjà. ⭐ **Le classeur réel confirme le cas
> d'espèce sur lequel le prédicat a été construit.**

*Rappel de la mise à jour précédente* — 2026-08-27 *(session 32, suite)* — ⏳ **M1-B2 / B2-2 —
SECONDE PASSE LOCALE : quatre points verrouillés.** ⛔ **Rien n'est poussé, rien n'est déployé, et le classeur
réel n'est PAS migré.**

> ⚡ **Ce que cette seconde passe a changé** *(arbitrages de Romain, complément de **D-059**)* :
> la migration ne se déclenche **plus** à la première écriture — elle est **explicite seule** ; une
> **marque** de fin de migration, posée après contrôle de cohérence, distingue *partielle* de
> *terminée* et ferme le défaut du **renommage** ; et les 📸 **snapshots** se figent au **premier
> envoi principal RÉUSSI**, ⛔ plus à la création de la participation.
>
> ⚠️ **Trois de ces quatre points corrigeaient un DÉFAUT RÉEL du code de la première passe**, pas
> une imprécision de rédaction. ⭐ **C'est la relecture de Romain qui les a trouvés**, sur la foi
> du rapport — et l'un d'eux *(les snapshots)* était contredit par le code lui-même.
>
> 🔬 **Preuves** : **1210/1210** au harnais serveur *(1134 avant)* · suites Node **inchangées** ·
> ⭐ **17 mutations, 17 interceptées**.

*Rappel de la mise à jour précédente* — 2026-08-27 *(session 32)* — ⏳ **M1-B2 / B2-2 — PREMIÈRE
PASSE LOCALE LIVRÉE.** ⛔ **Rien n'est poussé, rien n'est déployé, et le classeur réel n'est PAS
migré.**

> ⭐ **Ce qui est ÉCRIT ET TESTÉ EN LOCAL** *(branche `claude/b2-2-clubs-participations`, trois
> commits)* : les onglets **`Clubs`** *(carnet durable, `club_id` stable)* et **`Participations`**
> *(une ligne = une édition × un club, + 4 snapshots)*, un **prédicat** qui décide si une ligne
> legacy prouve un engagement **réel**, une **migration idempotente par convergence**, une **couche
> d'adaptation** qui rend au navigateur **exactement** l'objet plat d'aujourd'hui, et la bascule de
> **tous** les lecteurs et écrivains. Arbitrages : **D-059**.
>
> 🔬 **Les preuves LOCALES** : **1134/1134** au harnais serveur *(974 avant)* · **48/48**, **97/97**,
> **41/41**, **45/45** aux quatre suites Node, **inchangées** · ⭐ **neuf mutations** rejouées, **neuf
> attrapées** — dont **une qui était d'abord PASSÉE INAPERÇUE** *(le test manquant a été écrit)* et
> **une qui a révélé un vrai défaut** *(`clubEstActif(null)` levait une erreur)*.
>
> ⭐ **L'épreuve centrale est passée** : les **huit résultats T1 → T8** de B2-0 sont rejoués **mot
> pour mot** sur la structure neuve — l'engagement pris le 2026-08-25 est **tenu**.
>
> ⛔ **CE QUI N'A PAS EU LIEU, et il faut le lire comme tel** : aucune poussée · aucune fusion ·
> **aucun redéploiement** · **aucune migration du classeur réel** · aucune suppression de
> `ClubsInvites` · **pas une ligne de `frontend/`**. ⚠️ Le classeur réel porte toujours
> `ClubsInvites` seul, et **13 onglets**.

*Rappel de la mise à jour précédente* — 2026-08-27 *(session 31, suite 3)* — 🏁 **M1-B2 / B2-1 EST
CLÔTURÉ. ✅ R-106 EST CLOS.** *(décision de Romain — **D-058**)*

> ⭐ **Ce qui est acquis sur le classeur RÉEL, le 2026-08-27** : serveur redéployé *(version 159)*,
> migration exécutée, **idempotence prouvée**, et ⭐ **le critère central atteint** — trois
> régénérations de planning ont produit **trois `tournoi_id` différents** et ⛔ **un seul
> `edition_id`, inchangé**.
>
> ✅ **LA DERNIÈRE PREUVE A ÉTÉ PRISE.** Le **reset nominal réel** a été exécuté le 2026-08-27 :
> l'édition `f21ec93b-…` est passée à **`fermee`** avec sa date de fermeture *(`12:10:36`)*, une
> **édition neuve** `93349afe-…` s'est ouverte au même instant, et le registre porte **2 lignes :
> 1 active, 1 fermée** — ⛔ **jamais deux actives**.
>
> ⚡ **Le jeu de tournoi fictif a donc été CONSOMMÉ** *(voir le repère en tête de ce document)* :
> le classeur est **vierge de tournoi** — `Equipes` / `Poules` / `Matchs` à **0 / 0 / 0**, catégorie
> `U10` supprimée, `tournoi_id` vidé, `tournoi_publie` = `non`. ⛔ **Il n'a pas été reconstruit.**
>
> ⭐ **Et rien de ce qui devait survivre n'a bougé** : `Historique` conserve ses **211 lignes**,
> ⭐ **au contenu strictement identique à la sauvegarde** ; `ClubsInvites` conserve ses **3 lignes**
> et ses **5 colonnes d'identité et de contact**, elles aussi identiques ; les **6 réglages de
> terrains** ont survécu *(R-101, résultat attendu)*.
>
> ⚡ *(Ce bloc a annoncé « Cette passe est **locale** : ⛔ aucun push… » *(vrai jusqu'à l'intégration
> du 2026-08-27)*, puis « Le code est INTÉGRÉ ET PUBLIÉ SUR GITHUB — ⛔ mais il n'est pas EN
> SERVICE » *(vrai jusqu'au déploiement du même jour)*. ⭐ **Trois états successifs en un jour,
> chacun vrai à son heure.**)*

| | |
|---|---|
| ✅ **Ce qui est écrit** | `edition_id` *(UUID)* + l'onglet **`Editions`** *(`edition_id`, `statut`, `date_creation`, `date_fermeture`)*. ⭐ **Une seule ligne `active`**, jamais deux |
| ⭐ **Ce qui ne bouge plus** | L'identifiant survit à une **régénération des poules**, du **planning**, à une **modification d'équipes**, à la **publication** et au **masquage**, à la **saisie** et à la **correction** d'un score — ⭐ **prouvé en appelant les vraies fonctions**, pas en relisant le code |
| ⭐ **Le reset** | Registre **contrôlé en tout premier** *(un refus ne coûte aucune donnée)*, **basculé en tout dernier**, en **une seule écriture**. ⛔ **Aucune demi-bascule n'est représentable** — un échec injecté laisse l'ancienne édition active et n'ouvre rien |
| ⭐ **La migration** | `migrerEditionsMaintenant()` — explicite, **idempotente**, et ⛔ **elle ne touche RIEN d'autre** que l'onglet `Editions` |
| 🔬 **Les preuves locales** | **974/974** au harnais Apps Script *(881 avant)* · **48/48**, **97/97**, **41/41**, **45/45** aux quatre suites Node, **inchangées** · ⭐ **six mutations** rejouées, **six attrapées** |
| ✅ ⚡ **Les preuves RÉELLES chez Google** | ⭐ **`974/974 OK, 0 FAIL` LU DEUX FOIS dans le journal Apps Script** — une fois **avant** toute écriture, une fois **après** la migration et les trois régénérations. ⛔ **Ce n'est plus une prédiction.** ⚡ *(Cette case disait « Le bilan `974/974` reste une PRÉDICTION LOCALE […] chez Google, le bilan est toujours **881/881** » : vrai jusqu'au 2026-08-27.)* |
| ✅ ⚡ **LA BASCULE AU RESET, PROUVÉE EN RÉEL** | Reset nominal exécuté depuis l'administration, deux confirmations comprises. Message final relevé **après disparition de tout état transitoire** *(`CLAUDE.md` §8 octies)* : *« ✅ Tournoi réinitialisé. Supprimés : 1 catégorie(s), 3 équipe(s), 1 poule(s), 3 match(s). Tournoi masqué. »* ⚡ *(Cette case disait « ⛔ **Aucun reset réel n'a été joué** » : vrai jusqu'au 2026-08-27.)* |
| ⛔ **Ce qui reste couvert par le HARNAIS SEUL** | ⭐ **Le cas d'ÉCHEC du reset**, et **c'est délibéré** *(D-058)* : le provoquer exigerait de casser volontairement le classeur. Il est établi par **l'ordre du code** *(la bascule est la dernière instruction)* et par le test `testB21_resetEchecPasDeDemiBascule`, **éprouvé par rejeu de mutation**. ⚠️ **Ne jamais le présenter comme constaté en production** |
| ⛔ **Ce que le lot ne fait PAS** | ⛔ Aucun rattachement *(rien ne porte encore d'`edition_id`)* · ⛔ aucun sélecteur d'édition · ⛔ aucun multi-tournois · ⛔ aucun `club_id` · ⛔ **pas une ligne de `frontend/`** |
| ⚡ **Un écart de plan signalé** | La ligne B2-1 du plan annonçait *« + fin du renouvellement de `tournoi_id` »* ; ⛔ **le cadrage validé dit l'inverse**, et c'est lui qui fait foi — **D-057** explique pourquoi figer `tournoi_id` **détruirait** des lignes de `Historique` |
| ✅ **L'état Git CONSTATÉ** | ⚡ **INTÉGRÉ ET POUSSÉ le 2026-08-27.** `origin/main` a été porté en **avance rapide pure** *(`--ff-only`, ⛔ **aucun commit de fusion**)* : **`58ac4a2` → `3667f70` → `ee5db89`**, puis le constat d'intégration **`2c5f48f`**. La branche **`claude/b2-1-edition-id`** est publiée sur **`ee5db89`**. ⭐ **C'est ici, et ici seulement, que ces repères vivent** *(`CLAUDE.md` §8 quater)*. ⚡ *(Cette case disait « Commit `3667f70` … ⛔ **NON POUSSÉ** » : vrai jusqu'à l'intégration.)* |
| ✅ ⚡ **L'état GOOGLE CONSTATÉ** | ⭐ **Source déployée : commit `2c5f48f`.** `Code.gs` **8847** lignes · `Test.gs` **5554** · déploiement **158 → 159**, ⛔ **même identifiant, même URL, mêmes droits, aucun second déploiement**. ⚡ *(Cette case disait « ⛔ **RIEN N'EST EN SERVICE** — le serveur exécute toujours l'ancien `Code.gs` » : vrai jusqu'au 2026-08-27.)* |
| ✅ ⚡ **La MIGRATION, constatée** | Onglet **`Editions`** créé — le classeur passe de **12 à 13** onglets. **Une** ligne : `edition_id` **`f21ec93b-27d8-429b-b8d2-ba80a801752b`**, `statut` **`active`**, créée le **`2026-08-27 10:29:22`**, ⛔ `date_fermeture` **vide**. ⭐ **Relancée, elle n'a RIEN créé** — même identifiant, même date **à la seconde près** |
| ⭐ ⚡ **LE CRITÈRE CENTRAL, ATTEINT EN RÉEL** | **Trois** régénérations ⇒ **quatre** `tournoi_id` distincts *(`2026-08-26 13:49:11` → `10:41:12` → `10:44:28` → `10:48:03`)* et ⛔ **UN SEUL `edition_id`, jamais modifié**. Une seule ligne `active`, **aucune** ligne `fermee`, jeu fictif **intact**, tournoi **toujours masqué** |
| 🏁 **Ce qui reste** | ⚡ ~~Push~~ ✅ · ~~redéploiement~~ ✅ · ~~migration~~ ✅ · ~~3 régénérations~~ ✅ · ~~reset réel~~ ✅ · ~~clôture~~ ✅ → ⛔ **RIEN. B2-1 est terminé.** ⚡ *(Cette case disait « il ne reste QUE la bascule au reset réel » : vrai jusqu'au 2026-08-27 suite 3.)* |
| ⏳ **Ce qui appartient encore à Romain** | ⭐ **Reconstruire ou non un jeu de tournoi** dans le classeur, aujourd'hui **vierge**. ⛔ **Aucune session ne le fera sans décision.** ⚡ *(Cette case demandait « le sort du jeu de tournoi fictif » et « la clôture de B2-1 et R-106 » : les deux sont tranchés — **D-058**.)* |

### 🏁 LA DERNIÈRE PREUVE A ÉTÉ PRISE — le reset réel du 2026-08-27

⚡ **Ce bloc s'intitulait « LA SEULE PREUVE RESTANTE — et pourquoi elle n'a pas été prise
aujourd'hui ».** Elle a été prise le jour même, après décision de Romain. ⭐ **Le raisonnement qu'il
portait — *le critère n'est pas le contrat* — reste écrit plus bas : c'est lui qui a empêché une
clôture prématurée, et il vaut au-delà de ce lot.**

**Ce qui a été constaté dans le classeur, après le reset :**

| | |
|---|---|
| **Ancienne édition** | `f21ec93b-…` · **`fermee`** · création **inchangée** `10:29:22` · fermeture **`12:10:36`** |
| **Nouvelle édition** | `93349afe-…` · **`active`** · création **`12:10:36`** · fermeture **vide** |
| **Registre** | **2 lignes · 1 active · 1 fermée** — ⛔ **jamais deux actives** |
| **Le tournoi** | `Equipes` / `Poules` / `Matchs` = **0 / 0 / 0** · catégorie `U10` supprimée · `tournoi_id` **vidé** · `tournoi_publie` = **`non`** |
| ✅ **`Historique`** | **211 lignes**, ⭐ **contenu strictement identique à la sauvegarde** |
| ✅ **`ClubsInvites`** | **3 lignes** conservées · **5 colonnes** d'identité et de contact **identiques à la sauvegarde** · les **11 autres** champs d'engagement vidés · les **jetons renouvelés** — ⭐ **exactement le comportement annoncé par le dialogue de l'application** |
| ⚠️ **Terrains** | Les **6 réglages structurels** ont survécu, **identiques à la sauvegarde** — ⭐ **résultat ATTENDU** *(R-101, figé par un test témoin, ⛔ **toujours OUVERT**, il appartient à B2-3)* |
| ⛔ **Drive** | `tournoi_affiche_id` et `parking_photo_id` étaient **vides** avant comme après : ⛔ **aucun fichier n'est parti à la corbeille** |

> ### 🎯 LA LEÇON DE MÉTHODE, ET ELLE RESTE ÉCRITE
>
> **① Le critère n'est pas le contrat.** Les deux critères écrits — *« régénérer 3× ⇒ un seul
> `edition_id` »* *(`PLAN.md` §16.5)* et *« redéploiement + migration + constat réel »*
> *(fiche R-106)* — étaient **littéralement satisfaits AVANT le reset**. ⛔ **On n'a pas clos pour
> autant** : ils avaient été rédigés le **2026-08-24**, avant le contrat détaillé **D-057** du
> **2026-08-27**, qui exige aussi le comportement au reset. ⭐ *Un critère écrit trop tôt peut être
> satisfait avant que le travail ne soit fini.*
>
> **② ⚠️ Une déduction présentée comme un constat a failli coûter cher — et c'est le plus important
> de ce lot.** Le rapport d'audit du reset annonçait `Historique` et `ClubsInvites` **vides**.
> ⛔ **Aucun des deux ne l'était** : **211** et **3** lignes. L'erreur ne venait pas d'une mauvaise
> lecture du code — elle venait du **repère du jeu fictif**, qui décrit *« aucun club invité »* :
> vrai **de ce jeu-là**, ⛔ **pas du classeur**. La déduction avait été écrite entre parenthèses,
> **sans être marquée comme telle** *(`CLAUDE.md` §9)*.
>
> 🔬 **Conséquence directe, et elle est heureuse** : la recommandation *« pas de sauvegarde »* a été
> **retirée**, et une **copie complète du classeur a été créée avant le reset**. ⭐ **C'est elle qui
> permet aujourd'hui d'écrire « strictement identique à la sauvegarde »** au lieu de « probablement
> intact ». ⛔ **Sans l'erreur repérée à temps, cette comparaison n'existerait pas.**

*Rappel de la mise à jour précédente — 2026-08-26 (suite 6)* — 🏁🏁 **M1-PUB EST TERMINÉ. LE CHANTIER ENTIER
EST CLOS** — ses **cinq** micro-lots et les **quatre** conditions de son critère de clôture.

> ⭐ **Ce que M1-PUB a définitivement accompli, en une phrase** : *changer l'état publié / non publié
> dans Maxilou ne provoque plus **aucun** effet ailleurs que sur la page publique Maxilou* — et
> l'administration ne promet plus le contraire.

| | |
|---|---|
| ✅ **PUB-5 est CLOS** | Le **faux aperçu** *(« Aperçu sur le site »)* est **supprimé** : section, 74 lignes de réplique HTML, 179 lignes de CSS, 5 appels et 4 enregistrements d'écran. Commit **`8778982`**, run Pages **`32990028867`** `success` |
| ⚡ **Son objectif a changé en route** | **D-056** : on **supprime**, on ne **remplace** pas. ⭐ *« On ouvre la vraie page publique, on ne la copie pas »* — une réplique **affirme sa propre fidélité** et redevient fausse dès que l'original bouge |
| ⭐ **La preuve visuelle est de ROMAIN** | ⛔ **Pas de Claude** : l'écran d'administration exige la clé. **Romain a validé lui-même**, sur **ordinateur** *(aucun espace mort, aucune colonne orpheline)* **et sur téléphone réel** *(Assistant mobile et Vue classique)* |
| ✅ **Les 4 conditions du critère** | ① les 5 lots · ② le découplage prouvé dans les deux sens · ③ **réécrite par D-056**, aucun aperçu mensonger ne subsiste · ④ **le filet des preuves reportées est vide** |
| 🔴 **Un écart rattrapé à la clôture** | Le tableau de la condition ④ annonçait encore les **trois** preuves reportées comme **OUVERTES**, alors qu'elles avaient été honorées en PUB-4. ⛔ **Ma clôture de PUB-4 ne l'avait pas relevé.** Corrigé, et l'écart est écrit dans `PLAN.md` |
| ▶️ **Conséquence de feuille de route** | La suspension de **M1-C1** est **LEVÉE** — ⛔ **ce qui ne l'autorise pas à démarrer** *(`CLAUDE.md` §12.4)* |
| ⏳ **Toujours à décider par Romain** | Le **sort du jeu de tournoi fictif** — voir le repère en tête de ce document. Il est **intact** : 3 équipes · 1 poule · 3 matchs |
| ⛔ **Ce lot n'a touché aucun applicatif** | La clôture est **exclusivement documentaire**. M9, lui, était **frontend seul** : ⛔ aucun backend, aucun Apps Script, aucun redéploiement Google |

*Rappel de la mise à jour précédente — 2026-08-26 (suite 5)* — 🏁 **M1-PUB / PUB-4 EST TERMINÉ ET CLÔTURÉ :
LE DÉCOUPLAGE EST FAIT, EN SERVICE, ET PROUVÉ DES DEUX CÔTÉS.**
✅ **R-097 et R-098 sont CLOS** *(décision de Romain — **D-055**)*.
⛔ **PUB-5 reste NON COMMENCÉ · B2-1 NON DÉMARRÉ · M1-PUB N'EST PAS TERMINÉ** *(il ne le sera qu'à
la clôture de PUB-5)*. ⚡ *(Vrai jusqu'au 2026-08-26 suite 6 : **PUB-5 et M1-PUB sont CLOS depuis**.
⛔ **B2-1 reste NON DÉMARRÉ**.)*
➡️ **PREMIER POINT À TRAITER DANS PUB-5 : M9** — le bloc *« Aperçu sur le site »* de
`frontend/admin.html` promet encore une **carte d'actualité** et une **page d'événement** sur le
site de l'association. ⛔ **Ces deux choses n'existent plus.** ⭐ **Ce défaut NE ROUVRE PAS PUB-4**
*(D-055)* : le couplage technique est supprimé et prouvé ; ce qui reste est un **texte devenu faux
dans l'administration**.
⏳ **Le sort du jeu de tournoi fictif reste à décider par Romain** — voir le repère en tête de ce
document.

## 🏁 M1-PUB / PUB-4 — CLÔTURÉ *(2026-08-26)*

| | |
|---|---|
| 🎯 **Ce que PUB-4 a fait** | **Deux coupures**, une de chaque côté. ⭐ **Aucune des deux seule n'aurait suffi** : la première supprime le **lecteur**, la seconde supprime la **donnée** |
| ① **Côté site de l'association** | `RFL974/boutique-r92` **n'interroge plus ce serveur**. Sa page « Tournoi » est **statique**, avec un lien explicite vers Maxilou — ⭐ *« le visiteur reste sur le site de l'association tant qu'il ne choisit pas lui-même d'ouvrir Maxilou »* *(D-054 / ③)*. Commit **`9dbdf0a`**, **publié** |
| ② **Côté Maxilou** | La vue **`invitation`** n'expose plus `tournoi_publie`. Commit **`a4ee3bb`**, **redéployé chez Google** |
| ⭐ **Le garde-fou** | La vue **`live`** l'expose **toujours** — ⛔ **impératif** : la page publique du tournoi ne lit que celle-là. Un test tient désormais les **deux** bords |
| 🔬 **Les preuves** | **P1 → P10**, toutes acquises. Détail : `SESSIONS.md` **§29** |
| ✅ **Les deux obligations de PUB-4** | ① le **découplage** prouvé en réel · ② les **trois preuves héritées de PUB-2** *(R-098 condition 5, contrôles §21.10 ter **6** et **8**)* — ⭐ **relevées séparément**, comme le plan l'exigeait |
| ⚠️ **La réserve à ne jamais perdre** | La **condition 5 de R-098** a été honorée **par observation et par lecture du code**, ⛔ **pas par le scénario littéral** *« publié + prérequis volontairement cassés »*, qui **n'a pas été joué**. ⛔ **Ne jamais le présenter comme joué** — `RISQUES.md`, encadré « LA CONDITION 5 » |
| ⛔ **Ce que PUB-4 n'a PAS fait** | ⛔ **Aucune correction du frontend de l'administration** *(M9 — c'est PUB-5)* · ⛔ aucune décision sur le sort du jeu fictif |
| ⏭️ **Prochaine étape** | **PUB-5 — l'aperçu réel**, ⛔ **NON COMMENCÉ**, et il ne commence pas sans décision explicite de Romain *(`CLAUDE.md` §12.4)*. **M9 en est le premier point** ⚡ *(vrai à la clôture de PUB-4 ; **PUB-5 a été mené et clos le même jour** — voir le bloc de tête)* |

*Rappel de la mise à jour précédente — 2026-08-26 (suite 4)* — ⚡ **M1-PUB / PUB-3 : LE PLAN DE DÉCOUPLAGE
EST ÉCRIT.** Livrable unique : [`M1-PUB-3-PLAN-DECOUPLAGE.md`](M1-PUB-3-PLAN-DECOUPLAGE.md) — les
**six livrables** y sont traités *(les deux côtés recontrôlés à la date du jour, l'inventaire
`fichier:ligne`, les **7 gestes numérotés**, les **7 preuves**, le retour arrière)*. ⛔ **Aucune
coupure, aucun clic, aucune preuve produite, aucune modification fonctionnelle.**
✅ **PUB-3 EST CLOS** : les **4 décisions** que le plan avait laissées ouvertes ont été tranchées
par Romain le même jour — **D-054** *(dépôt tiers sous branche · annonce manuelle préservée ·
`tournoi.html` statique et indépendante · preuves après découplage prouvé)*.
⛔ **PUB-4 et PUB-5 non commencés · R-097 et R-098 restent OUVERTS · B2-1 NON DÉMARRÉ.**
⭐ **Reste à soumettre avant PUB-4** : le **texte** de la nouvelle `tournoi.html` *(D-054 / ③)*.
⚡ *(Ces deux lignes étaient vraies au 2026-08-26 suite 4. **PUB-4 est CLOS depuis la suite 5**, le texte de `tournoi.html` a été soumis et validé, et **R-097 / R-098 sont CLOS**.)*

*Rappel de la mise à jour précédente — 2026-08-26 (suite 2)* : 🏁 **M1-PUB / PUB-2 EST TERMINÉ ET CLÔTURÉ**,
son critère de clôture **entièrement satisfait et vérifié dans un vrai navigateur**.
⛔ **R-098 RESTE OUVERT** *(condition 5, nommément reportée à PUB-4)*. ⛔ **M1-PUB N'EST PAS
TERMINÉ · PUB-3 NON DÉMARRÉ · B2-1 NON DÉMARRÉ.**

## 🏁 M1-PUB / PUB-2 — CLÔTURÉ *(2026-08-26)*

> ⚠️ **La distinction la plus importante de ce bloc, et elle doit être lue :**
> ⭐ **PUB-2 est CLOS. ⛔ R-098 est OUVERT.** Ce n'est pas une contradiction : le critère de clôture
> de PUB-2 *(arrêté par **D-052**)* ne porte **que** les preuves obtenables **sans provoquer
> l'effet externe** que M1-PUB doit supprimer. **La condition 5 n'en fait plus partie.**

| | |
|---|---|
| ✅ **Critère de clôture — SATISFAIT** | **R-098 · conditions 1, 2, 3, 4a, 4b** · **contrôles §21.10 ter 1, 2, 3, 4, 5, 7, 9, 10, 11, 12** — ⭐ **tous CONSTATÉS EN RÉEL**, dans un navigateur, sur le site publié |
| ⭐ **La dernière preuve, obtenue le 2026-08-26** | **Condition 4b**, dans **les trois modes** : ⭐ **le bouton « Publier le tournoi » n'est plus grisé** · le message **« 🔒 Avant de publier, il reste : … » a disparu** · le fil affiche **« Tout est prêt — tu peux publier le tournoi. »** |
| ⛔ **OBTENUE SANS CLIQUER** | ⭐ **C'est le cœur de la méthode** : 🔬 `majVerrouPublier` ne fait qu'un `bouton.disabled = …`. La 4b est un **état visuel**, pas un geste. **Romain confirme n'avoir jamais cliqué sur « Publier ».** |
| ⭐ **Le mode qui comptait le plus** | La **« Vue classique »** — c'est celui qui **échappait complètement** au verrou d'avant R-098, et qui laissait publier un tournoi vide sans le moindre frein. ⭐ **Le voir gouverné par la même règle que les deux autres prouve que le garde-fou est bien porté par le BOUTON, et non par l'écran** |
| 🔬 **Le prérequis découvert en préparant la saisie** | La génération **BLOQUE** si la **durée de période** d'une catégorie est vide *(`Code.gs:7845`)* : une catégorie neuve naît **vierge**, et le serveur refuse plutôt que de produire des **matchs de 0 minute**. ⭐ **Trouvé par relecture du code AVANT la saisie**, ⛔ pas par un échec en cours de route |
| ⭐ **Trois corrections au jeu « minimal » annoncé** | **3 équipes** suffisent *(minimum FFR exact)*, ⛔ pas 4 · le **nombre de périodes** est inutile *(vide vaut 1)* · les **terrains sont déjà pré-remplis**. ⭐ **Un champ en plus, trois en moins** |
| 🔻 **Ce qui SORT de PUB-2 et vit désormais en PUB-4** | **R-098 · condition 5** *(« Masquer » jamais grisé)* · **contrôle 6** *(Publier → adresse identique)* · **contrôle 8** *(Masquer → même adresse)*. ⛔ **Ni supprimés, ni réputés acquis** — gardés par la **condition ④** du critère de clôture de M1-PUB |
| 🟢 **Le jeu fictif est CONSERVÉ** | Voir le repère en tête de ce document : il **décrit exactement** ce qui est présent. ⛔ **Ne pas le supprimer** — PUB-4 en a besoin |
| ⛔ **`tournoi_publie`** | **reste `non`** — ⭐ **et doit le rester jusqu'à PUB-4** |
| ⏭️ **Prochaine étape** | ⚡ **PUB-3 est DÉMARRÉE ET SON PLAN EST ÉCRIT** *(2026-08-26, autorisation explicite de Romain)* — [`M1-PUB-3-PLAN-DECOUPLAGE.md`](M1-PUB-3-PLAN-DECOUPLAGE.md). *(Cette case annonçait « NON DÉMARRÉE » : vrai jusqu'au 2026-08-26.)* ⛔ **Elle n'est pas CLOSE pour autant** — 4 décisions restent à Romain |

---

*Rappel de la mise à jour précédente — 2026-08-26 (suite)* : 🔻 **UNE CONTRADICTION DE SÉQUENCE EST TRANCHÉE :
LA PREUVE DE « MASQUER » PASSE DE PUB-2 À PUB-4.** Décision **D-052**. ⛔ **Lot strictement
documentaire — aucun code, aucune donnée, aucune configuration.**

## 🔻 M1-PUB — LA CONTRADICTION DE SÉQUENCE, ET COMMENT ELLE EST TRANCHÉE *(2026-08-26, D-052)*

| | |
|---|---|
| 🔴 **La boucle, telle qu'elle était** | **PUB-2** ne se clôt qu'en vérifiant **« Masquer »** → 🔬 ce bouton **n'existe que si le tournoi est PUBLIÉ** → **publier atteint aujourd'hui le site d'une association tierce** *(**R-097**)* → **c'est précisément ce que PUB-4 doit supprimer** → mais **PUB-4 dépend de PUB-3, qui dépend de PUB-2**. 🎯 **PUB-2 ne pouvait se clore qu'en causant le tort que le chantier doit corriger** |
| 🔬 **Le fait qui tranche ①** | **Les deux sites interrogent le MÊME déploiement**, donc **le même classeur** — établi par **comparaison d'empreintes**, ⛔ sans recopier d'adresse. Le dépôt vitrine est **toujours sur `164bb8e`** |
| 🔴 **Le fait qui tranche ②** | Le jeu de données serait **FICTIF** : publier ferait apparaître, en tête des actualités d'une association **réelle**, **l'annonce d'un tournoi qui n'existe pas**. ⭐ **Ce n'est plus une entorse de doctrine, c'est une fausse information chez un tiers** |
| ⭐ **Le fait qui tranche ③** | 🔬 **La preuve « avant » était obtenable SANS publier — et elle l'a été, EN PRODUCTION** : `tournoi.html` de la vitrine affiche *« Aucun tournoi en cours pour le moment. »* ⭐ **Une seule phrase prouve que la vitrine interroge ce serveur, lit le témoin, et réagit à sa valeur** |
| 🆕 **D-052** | *« Une preuve dangereuse n'est pas supprimée : elle est **déplacée** au premier moment où elle devient inoffensive, et reste **tracée** jusque-là. »* ⛔ **Ni cochée, ni effacée, et toujours comptée** |
| 🔻 **Ce qui est reporté de PUB-2 vers PUB-4** | **R-098 · condition 5** *(« Masquer » jamais grisé)* · **contrôle §21.10 ter 6** *(Publier → adresse identique)* · **contrôle §21.10 ter 8** *(Masquer → même adresse)*. ⭐ **R-098 garde CINQ conditions** |
| ✅ **Ce qui reste dans PUB-2** | conditions **1, 2, 3, 4a** *(acquises)* + **4b** — ⭐ **validable PAR OBSERVATION, sans jamais cliquer** : 🔬 `majVerrouPublier` ne fait que `bouton.disabled = …` |
| ⭐ **Le filet** | 🆕 `PLAN.md`, critère de clôture de **M1-PUB, condition ④** — ⛔ **le chantier ne peut être clos tant qu'une preuve reportée reste ouverte.** ⭐ **Sans lui, un report devient un oubli invisible** : chaque lot aura été déclaré clos dans les formes |
| ⚡ **PUB-3 portait la MÊME contradiction** | Son livrable ④ exigeait *« publier → observer »* **avant** la coupure — ⛔ incompatible avec sa nature **📄 documentaire**. **Reformulé** : PUB-3 **écrit** les preuves, ⛔ **il n'en produit AUCUNE**, et sa preuve « avant » est celle du constat ③ |
| ✅ **Recréer le jeu fictif est SANS effet externe** | 🔬 **Vérifié** : seules **deux** lignes de `backend/Code.gs` écrivent `tournoi_publie` — `publierTournoi` *(:7550)* et le reset *(:7658 → `non`)*. ⛔ **Ni les catégories, ni les équipes, ni la génération n'y touchent.** Le risque tient **au seul clic sur « Publier »** |
| ⏭️ **Trajectoire validée** | ① recréer le jeu fictif minimal → ② valider **4b sans cliquer** → ③ **clôturer PUB-2** *(preuves reportées et tracées)* → ④ **PUB-3** → ⑤ **PUB-4** *(découplage)* → ⑥ publier/masquer en réel → ⑦ fermer la **condition 5**, les contrôles **6** et **8**, et **R-097** |
| 🔴 **Le repère « données à recréer »** | **TOUJOURS ACTIF** — ⛔ **aucune donnée recréée par ce lot** |

---

*Rappel de la mise à jour précédente — 2026-08-26* : 🔴 **LA VALIDATION RÉELLE DE PUB-2 A TROUVÉ UN SECOND
DÉFAUT SUR TÉLÉPHONE — IL EST CORRIGÉ, PUBLIÉ ET REVALIDÉ.** `origin/main` = **`8b66456`**, run
Pages **#228** `success`. **R-098 passe de 1 à 4 conditions de fermeture sur 5.**
⛔ **PUB-2 N'EST PAS CLOS · M1-PUB N'EST PAS TERMINÉ · B2-1 N'EST PAS DÉMARRÉ.**
⚡ *(La condition **5** de R-098 a été **REPORTÉE à PUB-4** le jour même — voir le bloc de tête.
⛔ Le compte « 4 sur 5 » reste exact : une preuve reportée n'est pas une preuve validée.)*

## 🔴 M1-PUB / PUB-2 — R-098 / B5 : LE DÉFAUT TROUVÉ PAR UN DOIGT SUR UN VRAI TÉLÉPHONE *(2026-08-26)*

| | |
|---|---|
| 🎯 **La leçon, avant les faits** | ⭐ **Un diagnostic juste n'est pas une correction complète.** Le correctif R-098 du 24/08 avait écrit la cause **mot pour mot** dans son propre commentaire — et n'en avait traité qu'**un tiers**. ⛔ **57 contrôles d'exécution ne l'ont pas vu** : ils vérifiaient qu'on ne pouvait pas **dépasser** la carte Publication, jamais ce qui se passait **derrière soi** une fois entré |
| 🔴 **Le défaut, CONSTATÉ** | Téléphone, navigation privée, classeur **sans aucune donnée** : ouvrir **« 🌐 Publication »** *(joignable à tout moment, c'est voulu)* **déverrouillait six étapes** — Inviter · Dossier · Équipes · Terrains · Poules · Autorisation — et peignait **« ⏱️ Réglages » EN VERT**, c'est-à-dire *« faite »*, ⚠️ **alors que c'est l'étape qui bloque tout le reste** |
| 🔬 **La cause, à la ligne près** | **`assistantIndex` portait DEUX sens** : la carte **AFFICHÉE** et la **PROGRESSION ATTEINTE**. Identiques **par construction** — on ne pouvait jamais dépasser une étape bloquée — jusqu'à ce que la carte `libre` de PUB-2 ouvre une **porte latérale**. ⛔ **Trois lectures en dépendaient** : le verrou, le grisage, et la marque « faite » |
| ✅ **Le correctif** | 🆕 **`assistantAtteint`** — la progression **légitimement acquise**, ⭐ **MONOTONE par contrat**. Une carte ordinaire la fait monter *(y atterrir le prouve)* ; sur une carte `libre` on **CONSTATE** seulement ce qui était **de toute façon atteignable**. 📐 **5 lignes + un bloc de 12** |
| ⛔ **Ce que le correctif ne touche PAS** | **0 fichier `backend/`** ⇒ ⛔ **aucun redéploiement Apps Script** · **0 `.html`**, **0 `.css`** · **0 ligne** dans `ASSISTANT_ETAPES`, `ASSISTANT_CLES_CERVEAU`, `ASSISTANT_ORDRE_ORIGINE`, `assistantRaisonsEtape`, `quitterAssistant`, `ecrans.js`, `admin-infos-publication.js`, `admin-tableau-bord.js` ⇒ **aucune règle métier, aucune seconde liste de prérequis, vue classique intacte** |
| ⭐ **Le grand écran n'était PAS atteint** | 🔬 `ecransCalculerVerrous` **recalcule les verrous à zéro** à chaque fois : aucun repère de progression à fausser. C'est pourquoi le contrôle **A2 était passé** |
| 🔴 **Ce que R-098 n'avait pas fait** | **Les « 34 contrôles du parcours mobile » du premier correctif n'existaient pas dans le dépôt** — joués, puis jetés. ⭐ **Rien ne surveillait ce comportement, et c'est la vraie raison de la survie du défaut.** 🆕 `tests/frontend-assistant-verrou.test.js` *(**41 contrôles**, dont un **AUTOTEST** qui exige que le code d'avant reproduise le défaut)* **+ 5 mutations** — ⭐ il tourne **avant chaque publication** : si ce comportement se casse, **le site en ligne n'est pas remplacé** |
| ✅ **Gestes CONSTATÉS** | Commit **`8b66456`** *(5 fichiers, un seul parent)* · fusion **fast-forward strict** `be1b376` → `8b66456`, ⛔ **aucun commit de fusion, aucun SHA réécrit** · poussée : `git ls-remote` = `HEAD`, écart **0/0** · publication **run #228** *(id `32956804198`, 26/08 10:09→10:10 UTC)* : `verifier` **`success`** — dont ⭐ la nouvelle étape *« Vérifier le verrou du parcours guidé »* — et `deploy` **`success`** |
| ⚠️ **Un piège évité** | La branche locale `main` avait **36 commits de retard** *(le décrochage de `CLAUDE.md` §12.3)*. Contrôlé qu'elle **ne portait aucun commit propre** avant remise à niveau |
| ⭐ **VALIDÉ EN RÉEL** | 🔬 **Romain, téléphone, navigation privée, site publié par #228 — 11 contrôles sur 11** : les six étapes **restent grisées** · **« Réglages » ne verdit pas** · **seule « Infos » est verte** *(attendu — aucun prérequis, et l'ancien code la peignait déjà)* · ⭐ une **tentative RÉELLE** d'ouvrir « Équipes » laisse sur Publication et **déclenche l'explication** — ⛔ pas un simple grisage constaté à l'œil · **« Résumé » bloqué** · **« Suivant » n'avance pas** |
| 📐 **Bilan des contrôles** | **48/48 + 97/97 + 41/41** de comportement · **45/45** mutations · **30/30** fichiers JS lisibles |
| 🟡 **R-098 — 4 conditions sur 5** | ✅ 1 publication · ✅ 2 grand écran · ✅ 3 mobile · ✅ **4a** *(« Publier » grisé si incomplet)* — ⭐ **la condition 4 se DÉDOUBLE, et sa 1ʳᵉ moitié ne demandait aucune donnée**. ⛔ **Restent 4b** *(« Publier » actif quand tout est prêt)* **et 5** *(« Masquer » jamais grisé)*, toutes deux suspendues à un **tournoi exploitable** |
| ⏭️ **Prochaine étape** | **Trancher 4b et 5.** Le jeu minimal est **établi et chiffré** *(fiche R-098 de `RISQUES.md`)*, ⛔ **et il n'est PAS créé** — la décision appartient à Romain |
| 🔴 **Le repère « données à recréer »** | **TOUJOURS ACTIF** — ⛔ **aucune donnée recréée** de bout en bout |

---

*Rappel de la mise à jour précédente — 2026-08-25* : 🏁 **M1-B2 / B2-0 EST TERMINÉ, INTÉGRÉ, PUBLIÉ ET VALIDÉ
DANS UN VRAI NAVIGATEUR.** Sept commits *(`7f49fc1` → `8dcff2b`)*, backend **v157** en service,
**880/880** chez Google, **48/48 + 97/97** de garde-fous frontend, **40/40** mutations,
`origin/main` = **`8dcff2b`** publié sur GitHub Pages. ⛔ **B2-1 N'EST PAS DÉMARRÉ.**
⚡ *(Deux repères de ce bloc ont bougé le 2026-08-26 : `origin/main` est désormais **`8b66456`**, et
les garde-fous frontend sont **48/48 + 97/97 + 41/41** avec **45/45** mutations. ⛔ Le reste — la
clôture de B2-0, le backend v157, les 880/880 — demeure exact.)*

## 🏁 M1-B2 / B2-0 — SÉCURISATION DU RESET *(clôturé le 2026-08-25)*

| | |
|---|---|
| ✅ **État** | 🏁 **TERMINÉ** — intégré à `main` en **fast-forward strict**, ⛔ **aucun commit de fusion, aucun SHA réécrit** |
| 🔬 **Historique final** | `7f49fc1` *(B2-0)* → `1ed16c9` *(B2-0.1)* → `43e17d9` *(B2-0.2)* → `0d30ac0` *(B2-0.3)* → `380c92b` *(B2-0.4)* → `8b07a94` *(B2-0.5)* → **`8dcff2b`** *(B2-0.5, courses résiduelles)* |
| ✅ **Backend en service** | Apps Script **version 157** · `Code.gs` **8 517 lignes** *(dernière fonction `viderDonnees`, ligne 8512)* · `Tests.gs` **5 133 lignes** *(dernière fonction `testB20_temoinR101TerrainsResteB23`, ligne 5128)* · `lancerTestsFFR` chez Google : **`R92 — 880/880 OK, 0 FAIL`**. ⭐ **Repères opérationnels : la source est [`../deploiement.md`](../deploiement.md)** *(`CLAUDE.md` §8 quater)* |
| ⛔ **Aucun redéploiement pour B2-0.3 / 0.4 / 0.5** | Ces trois lots sont **frontend seul** — 🔬 `git diff 380c92b..8dcff2b -- backend/` est **vide**. **v157 couvre tout le backend de B2-0.** |
| ✅ **Garde-fous durables** | `backend/Tests.gs` **T1 → T8** + **S1 → S3** + témoin R-101 · `tests/frontend-reinitialisation.test.js` **48/48** · `tests/frontend-autorisation-sync.test.js` **97/97** · `tests/mutations-frontend.test.js` **40/40 détectées, 0 passée inaperçue** |
| ✅ **CI et publication** | PR **#192** *(draft, 2 commits)* — run **#226** `pull_request` : `verifier` **success**, `deploy` **skipped**. Puis run **#227** `push`/`main` sur **`8dcff2b`** : `verifier` **success**, `deploy` **success**, ⭐ **Pages a publié `8dcff2b`** *(lu dans le journal de déploiement)* |
| ⭐ **VALIDÉ EN RÉEL — reset** | Reset réel du 2026-08-25 : `Equipes` / `Poules` / `Matchs` **vides** · ⛔ **aucun statut de participation hérité** · ⛔ **aucun effectif, détail ni alerte hérité** · ✅ **carnet durable conservé** · ⛔ `tournoi_id` **effacé** · jeton **neuf** après relecture admin, **différent** de l'ancien |
| ⭐ **VALIDÉ EN RÉEL — T6, l'ancien lien** | Un ancien lien d'invitation ouvert **depuis l'ancien email** affiche **« Lien invalide ou expiré. »** ⇒ ⛔ **ancien jeton réellement inutilisable**. ⭐ **C'est un test de comportement, pas une lecture de cellule** |
| ⭐ **VALIDÉ EN RÉEL — synchronisation** | Témoin **`TOURNOI TEST SYNC B2-0.5`** saisi dans « Infos du tournoi » → **Enregistrer** → ⛔ **aucun rafraîchissement** → navigation vers « Demande d'autorisation » : ✅ **le témoin apparaît immédiatement en A.2**. Puis reset → ⛔ aucun rafraîchissement → ✅ **le témoin a disparu**, **A.2 / A.3 manquants**, **A.4 revenu à l'état vide**, ⭐ **A.1 Organisateur toujours renseigné** |
| ⛔ **R-101 — le témoin attendu** | Les données de **découpage / terrains ont volontairement SURVÉCU** au reset réel. ⭐ **C'est le résultat attendu**, figé par un test témoin. **R-101 RESTE OUVERT** et appartient à **B2-3** |
| ⚠️ **Ce qui n'a PAS été provoqué en réel** | Le rechargement de secours `location.reload()` après un échec de relecture *(B2-0.4)* et les scénarios de **concurrence / panne** de B2-0.5 : ⛔ **prouvés par le harnais uniquement**, ⛔ **jamais induits en production** |
| ⏭️ **Prochaine étape** | **B2-1** — `edition_id` + registre `Editions` + fin du renouvellement de `tournoi_id`. ⛔ **NON DÉMARRÉE** : ni conception, ni implémentation. **Ne démarre qu'après décision explicite de Romain** |

---

*Rappel de la mise à jour précédente — 2026-08-24 (soir, suite 10)* : 🏛️ **LE CHANTIER M1-B2 EST OUVERT ET SON
ARCHITECTURE EST VALIDÉE** *(`PLAN.md` **§16**, décisions **D-050** et **D-051**, risques **R-099 →
R-108**)* — ⛔ **AUCUNE IMPLÉMENTATION N'A COMMENCÉ.** PUB-2 : correctif R-098 fusionné et publié
*(run **#221**)*, validé en réel sur les trois parcours, ⛔ **preuve « Masquer » toujours à obtenir**.

> ⚡ **CORRIGÉ APRÈS LE GESTE** *(`CLAUDE.md` §8 septies)* — ⛔ **le bloc ci-dessous n'est PAS
> réécrit** : il était **vrai à sa date**. Deux de ses affirmations sont devenues fausses le
> **2026-08-25** : *« AUCUNE IMPLÉMENTATION N'A COMMENCÉ »* et *« B2-0 — plan écrit, NON démarré »*.
> **B2-0 est terminé, intégré, publié et validé en réel** — voir le bloc du 2026-08-25 ci-dessus.
> ⭐ **Tout le reste du tableau — la cause, l'architecture, les dix risques, le découpage — demeure
> exact et reste la référence du chantier.**

## 🏛️ M1-B2 — CLUBS, PARTICIPATIONS, ÉDITIONS ET HISTORIQUE *(ouvert le 2026-08-24)*

| | |
|---|---|
| 🔴 **Pourquoi ce chantier existe** | ⭐ **Découvert en essayant, pas planifié.** Pendant la validation réelle de PUB-2, le dossier d'un club **accepté à l'édition précédente** s'est ouvert avec ses données d'alors *(« Éducateurs annoncés : 8 », anciens terrains)* — sur un classeur pourtant **réinitialisé**. ⛔ **Aucun test automatisé ni relecture n'aurait pu le trouver** : le code faisait exactement ce qui était écrit |
| 🔬 **La cause, établie par audit** | `ClubsInvites` répond à **deux questions** avec **une seule structure** : *« qui est ce club ? »* et *« que fait ce club dans ce tournoi ? »*. **R-102 est la cause ; R-099, R-100 et R-101 en sont les effets constatés** |
| ⚠️ **Pourquoi c'est P1** | 🔬 `backend/Code.gs:2811` — la **demande d'autorisation FFR** compte les clubs `Accepté` et cumule leurs effectifs. Sur une édition neuve : **les clubs de l'an dernier**, **0 joueur** *(effacé)*, **les éducateurs de l'an dernier** *(conservés)*. ⭐ Exactement le défaut que **D-043** avait fermé côté `org_*` — resté ouvert côté clubs |
| ✅ **Architecture VALIDÉE** | **D-050** — `Clubs` *(carnet durable)* + `Participations` *(édition)*, **couche d'adaptation** préservant les cartes actuelles · `edition_id` **créé à l'ouverture**, ⛔ jamais renouvelé par une régénération · **D-051** — le classement d'une édition passée est un **fait figé**, ⛔ **jamais recalculé** |
| 🆕 **10 risques inscrits** | **R-099** *(3 colonnes survivantes)* · **R-100** *(statut `Accepté`)* · **R-101** *(découpage terrains)* · **R-102** *(cause structurelle)* · **R-103** *(RGPD messages)* · **R-104** *(migration)* · **R-105** *(colonne future)* · **R-106** *(`tournoi_id` inapte)* · **R-107** *(archivage destructif)* · **R-108** *(double barème — ⛔ **hors M1-B2**)* |
| 🔴 **R-106, découvert au cadrage** | 🔬 `tournoi_id` est **renouvelé à CHAQUE génération de planning** et **n'est pas effacé au reset**. Un tournoi réel produit donc **N identifiants**. ⛔ **En l'état, aucune archive fiable n'est possible** — il identifie *une génération*, pas *une édition* |
| 📋 **Découpage** | **B2-0** *(reset — harnais)* → **B2-1** *(`edition_id` + `Editions`)* → **B2-2** *(migration)* → **B2-3** *(terrains)* → **B2-4** *(UX)* → **B2-5** *(messagerie V1)* → **B2-6** *(archivage + `Arch_Classements`)* |
| ⏭️ **Prochaine étape** | **B2-0** — ⛔ **plan écrit, NON démarré**, en attente de validation |
| ⛔ **Ce que M1-B2 ne fait pas** | aucun multi-tournois actif · aucun sélecteur d'édition · aucune simulation de classement · aucun centre de notifications · aucune relance d'invitation · aucun module futur *(buvette, fréquentation…)* |

| | |
|---|---|
| ✅ **PUB-2 — état CONSTATÉ** | ⚡ **CORRIGÉ après le geste : cette ligne annonçait « ⛔ NON FUSIONNÉ dans `main` · ⛔ NON PUBLIÉ », vrai jusqu'à la fusion du 2026-08-24 (soir)** *(`CLAUDE.md` §8 septies)*. ✅ **FUSIONNÉ dans `main` en FAST-FORWARD STRICT** *(`git merge --ff-only`)* — ⛔ **aucun commit de fusion, aucun SHA réécrit** : `origin/main` **`ec1f486` → `b002a57`**, les **deux seuls** commits ajoutés étant **`f62b322`** *(le contenu)* et **`b002a57`** *(la trace post-geste)*. 🔬 **Poussée constatée** : `git ls-remote origin refs/heads/main` = **`b002a57`** = `HEAD`, écart **0/0**. ✅ **PUBLIÉ sur GitHub Pages** *(run **#220**, voir ligne suivante)*. ⛔ **TOUJOURS PAS VÉRIFIÉ EN RÉEL** |
| ✅ **Publication GitHub Pages — CONSTATÉE** | ⚡ **CORRIGÉ après le geste : cette ligne annonçait « 🔬 Aucune publication déclenchée », vrai tant que rien n'était fusionné.** 🔬 **Run **#220*** *(id `32749980036`)*, événement **`push`**, branche **`main`**, `head_sha` **`b002a57`**, conclusion **`success`** *(2026-08-24 16:17:35 → 16:18:02 UTC)*. **Job `verifier` : `success`** — journal : **« 30 fichiers JavaScript vérifiés, aucun cassé »**, dont les **4 fichiers JS de PUB-2** *(`commun.js`, `admin.js`, `admin-infos-publication.js`, `dossier.js`)*. **Job `deploy` : `success`** *(les 5 étapes, dont « Déployer sur GitHub Pages »)*. ⚠️ **Publié ≠ validé** : voir la ligne « NON VÉRIFIÉ » |
| 📄 **Ce que PUB-2 fait** | Dans la carte « Publier le tournoi » : ① l'**adresse** de la page publique, ② **Copier l'adresse**, ③ **Ouvrir la page**, ④ l'état publié / non publié *(qui existait déjà)*. Ordre visuel : **État → Adresse → Copier/Ouvrir → Publier/Masquer**. ⭐ La note affichée dit **« publier ou masquer ne change pas cette adresse »** — ⛔ **jamais « elle ne change jamais »** |
| ⭐ **Ce que PUB-2 n'invente PAS** | 🔬 **L'adresse publique existait déjà et les clubs la recevaient** — lien « Scores en direct » **et QR code** du dossier club. PUB-2 rend **le même accès** disponible pour l'organisateur, ⛔ **il ne crée pas un second mécanisme** |
| ⛔ **UN tournoi, pas un club** | ⭐ **Maxilou organise volontairement un tournoi à la fois, et PUB-2 reste dans ce modèle** — ⛔ **aucun `tournoi_id`, aucun sélecteur, aucun multi-tournois, aucune table, aucune route, aucun backend**. ⚠️ Le **vocabulaire** dit *« la page publique **du tournoi** »*, ⛔ **jamais *« du club »*** : un même club en organisera un jour plusieurs *(U10 samedi, U8 dimanche)*, chacun avec son adresse *(**D-049**)* |
| 🆕 **D-049** | ⭐ *« Consommer une valeur existante n'est pas administrer cette valeur. »* `url_tournoi_public` est **lu** par PUB-2 ; ⛔ **sa CONFIGURATION reste rattachée à R-096 / M1-D**, et **R-096 reste OUVERT et INCHANGÉ** |
| 🔬 **Source unique** | La règle de résolution vit dans **`urlPagePublique` (`frontend/js/commun.js`)** et **nulle part ailleurs** — **contrôlé** : une seule construction de `tournoi.html` et une seule lecture de `url_tournoi_public` dans tout le frontend |
| ⛔ **Aucun backend** | 🔬 **Aucun fichier `backend/` modifié** — **recontrôlé avant fusion** : `backend/Code.gs` est **strictement identique** entre `ec1f486` et `b002a57` *(diff vide)* ⇒ ⛔ **AUCUN redéploiement Apps Script.** ⚡ *(Cette case annonçait que la publication frontend n'aurait lieu qu'« à la fusion dans `main`, qui n'a pas eu lieu » : la fusion **a eu lieu**, et la publication **aussi** — ligne « Publication GitHub Pages ».)* |
| ⚠️ **NON VÉRIFIÉ EN RÉEL — c'est ce qui reste** | ⛔ **Ce dépôt n'a aucun harnais de test frontend** : le comportement de PUB-2 **ne peut pas** être couvert par un test automatisé. Le `node --check` du workflow Pages *(**30/30 OK**, run #220)* répond à *« ces fichiers se lisent-ils ? »*, ⛔ **jamais à *« les 4 gestes marchent-ils ? »***. ⭐ **Le contrôle manuel sur le site publié reste ENTIER** — sa liste est en `SESSIONS.md` **§21.10 ter** |
| 🔴 **ANOMALIE CONSTATÉE EN RÉEL — la carte est INATTEIGNABLE** | ⚡ **Le contrôle A1 a été TENTÉ sur le site publié le 2026-08-24, et il a ÉCHOUÉ.** Sur un classeur non préparé *(l'état du jour, et aussi celui de tout tournoi neuf)*, l'entrée **« Publication »** de la barre latérale est **🔒 verrouillée** : l'adresse, « Copier » et « Ouvrir » sont **hors d'atteinte**. 🔬 **Cause exacte** : `frontend/js/ecrans.js` — l'écran `publication` a `cles: []` *(il n'exige rien)* mais **pas** `libre: true`, il **hérite** donc du blocage accumulé par Horaires · Catégories · Équipes · Terrains · Poules. ⭐ **Le verrou est ANTÉRIEUR à PUB-2** *(`ecrans.js` créé le 2026-08-16 ; ⛔ PUB-2 n'a touché ni `ecrans.js` ni `assistant.js`)* — **PUB-2 n'a rien cassé**, il a placé derrière une porte tardive une fonction qui doit servir tôt. ⛔ **Ce n'est PAS un effet de la réinitialisation M1-B** : un tournoi **neuf** est dans le même état. ⚠️ **Contradiction avec D-048** : la carte affiche *« tu peux la communiquer dès maintenant »* depuis un endroit inatteignable « maintenant ». ⛔ **PUB-2 n'a jamais analysé ce verrou** *(0 mention de `ecrans.js`, « verrou », « barre latérale » ou « accessible » dans toute sa documentation)* |
| 🆕 **R-098** | ⛔ **OUVERT** — l'anomalie ci-dessus est **inscrite au registre** *(`RISQUES.md`)*, **P1**. ⛔ **Ne se ferme qu'après CINQ conditions** : publication · vérification réelle grand écran · vérification réelle mobile · contrôle de « Publier » · contrôle de « Masquer » |
| 🔧 **Correctif R-098 — FUSIONNÉ et PUBLIÉ, ⛔ PAS VÉRIFIÉ EN RÉEL** | ⚡ **CORRIGÉ après le geste : cette case annonçait « commité et poussé sur branche, ⛔ NON FUSIONNÉ, ⛔ NON PUBLIÉ », vrai jusqu'à la fusion du 2026-08-24 au soir** *(§8 septies)*. ✅ **FUSIONNÉ dans `main` en FAST-FORWARD STRICT** *(`git merge --ff-only`)* — ⛔ **aucun commit de fusion, aucun SHA réécrit** *(`main` et la branche pointent le même objet)* : `origin/main` **`2ef9ce0` → `b8ce265`**, les **deux seuls** commits ajoutés étant **`9bdeb06`** *(le correctif — 9 fichiers, ⛔ 0 backend)* et **`b8ce265`** *(la trace post-geste)*. 🔬 **Poussée constatée** : `git ls-remote origin refs/heads/main` = **`b8ce265`** = `HEAD`, écart **0/0**. ✅ **PUBLIÉ** — run Pages **#221** *(id `32767413339`, `push`, `main`, `b8ce265`, conclusion **`success`**, 19:18:39 → 19:19:11 UTC)* : job **`verifier` `success`** *(« 30 fichiers JavaScript vérifiés, aucun cassé », dont `assistant.js`, `ecrans.js`, `admin-tableau-bord.js`)* · job **`deploy` `success`**. ⛔ **TOUJOURS PAS VÉRIFIÉ DANS UN NAVIGATEUR**. Principe validé par Romain : **déplacer le garde-fou de l'ÉCRAN vers le BOUTON**. ① `ecrans.js` — l'écran `publication` devient `libre` ; ② `assistant.js` — `bloc-publication` **sort de « Résumé »** vers une carte dédiée `libre`, la notion `libre` est ajoutée à `allerA` / `assistantMajVerrou`, et une **liste littérale `ASSISTANT_ORDRE_ORIGINE`** rend la « Vue classique » indépendante du découpage en étapes ; ③ `admin-infos-publication.js` — `majVerrouPublier()` grise **« Publier »** tant que les 5 étapes ne sont pas ✅, en relisant le **même** cerveau `calculerEtatsEtapes()` *(⛔ aucune seconde liste)*. ⭐ **INVARIANT : « Masquer » n'est JAMAIS grisé.** ⭐ **Protège MIEUX qu'avant** : porté par le bouton, il s'applique aussi en **« Vue classique »**, qui échappait au verrou d'écran. ⛔ **« Résumé » n'est PAS libéré** — `bloc-reinitialisation` reste protégé |
| 🔬 **Preuves d'EXÉCUTION** *(⛔ pas de simple relecture)* | **4 harnais, 57 contrôles, 0 échec** — fonctions réelles extraites des fichiers et exécutées, chaque fois comparées **avant / après** : le bouton *(9)* · les verrous des 14 écrans desktop *(3)* · le parcours mobile *(34)* · la restauration de l'ordre des blocs *(11)*. ⚠️ **Deux défauts ont été trouvés PAR ces tests** : un harnais qui ne bloquait jamais *(corrigé — il aurait validé n'importe quoi)*, et ⭐ **un vrai trou : la carte Publication servait de TREMPLIN vers « Résumé »**, donc vers Réinitialiser *(corrigé : le balayage de `allerA` part de 0)*. ⛔ **Aucune de ces preuves ne dit ce qui se passe en production** *(`CLAUDE.md` §13.6)* |
| ⛔ **M1-PUB** | **TOUJOURS PAS TERMINÉ** — son critère de clôture exige **les cinq lots** |
| ⛔ **R-097** | **RESTE OUVERT** — ⭐ **PUB-2 n'y touche pas** : la vitrine **lit toujours** `tournoi_publie`. La coupure appartient à **PUB-3** puis **PUB-4** |
| ⛔ **PUB-3 / PUB-4 / PUB-5** | **NON COMMENCÉS et NON ANTICIPÉS** — ⭐ le **faux aperçu** *(PUB-5)* est **intact**, et c'est voulu : tant que le couplage existe, il décrit encore quelque chose de vrai |
| ⏸️ **M1-C1** | **TOUJOURS SUSPENDUE jusqu'à la CLÔTURE COMPLÈTE de M1-PUB** |
| 🔴 **Le repère « données à recréer »** | **TOUJOURS ACTIF** — ⛔ **aucune donnée de tournoi n'a été recréée** |

---

*Rappel de la mise à jour précédente — 2026-08-24 (soir, suite 3)* : ✅ **PUB-1 EST TERMINÉ ET FUSIONNÉ DANS
`main`.**

| | |
|---|---|
| ✅ **PUB-1** | 🏁 **TERMINÉ ET FUSIONNÉ DANS `main`**, en **fast-forward** — ⛔ **aucun SHA réécrit, aucun commit de fusion créé**. **Deux commits** : **`56dabd3`** *(le contenu — 6 documents, 625 insertions)* · **`6fdffd8`** *(la trace post-geste)*. `origin/main` : **`ebf1b07` → `6fdffd8`**, ⭐ **relevé par interrogation directe de GitHub** |
| ⛔ **Aucun effet ailleurs** | **Aucun run GitHub Actions** — ⭐ **OBSERVÉ**, pas déduit : nos deux SHA sont **absents des runs**, et le plus récent reste **`8dfd28a`** *(M1-B, 2026-08-24 09:32 UTC)*. ⛔ **Aucun redéploiement backend** — aucun fichier `backend/`. ⛔ **Aucun workflow déclenché à la main** |
| ⏭️ **Prochaine étape** | **PUB-2 — Accès autonome à la page publique.** ⛔ **PUB-2 N'EST PAS COMMENCÉE**, et elle ne démarre pas sans validation explicite |
| ⛔ **M1-PUB** | **PAS TERMINÉ.** Son critère de clôture exige **les cinq lots**, le **découplage réellement prouvé** et **PUB-5 livré** *(`PLAN.md` §15.3 bis)* |
| ⛔ **R-097** | **RESTE OUVERT.** ⭐ **PUB-1 a DOCUMENTÉ le problème ; il ne l'a pas supprimé** — la correction appartient à **PUB-3** puis **PUB-4** |
| ⏸️ **M1-C1** | **TOUJOURS SUSPENDUE jusqu'à la CLÔTURE COMPLÈTE de M1-PUB** |
| 🔴 **Le repère « données à recréer »** | **TOUJOURS ACTIF** — ⛔ **aucune donnée de tournoi n'a été recréée** |

---

*Rappel de la mise à jour précédente — 2026-08-24 (soir, suite 2)* : 🌐 **UN CHANTIER INTERMÉDIAIRE EST
OUVERT : M1-PUB — LA PUBLICATION AUTONOME DU TOURNOI.**

Micro-lot **PUB-1**, ⛔ **strictement documentaire : aucun fichier `backend/`, aucun fichier
`frontend/`, aucun test, aucune donnée du classeur, aucun redéploiement, ⛔ aucune touche au dépôt
séparé `boutique-r92`** *(lu en seule lecture, comme source de preuve)*.

| | |
|---|---|
| 🆕 **D-048** | 🎯 **La doctrine : « Publier ouvre une page. Publier ne parle à personne. »** — trois mots distingués une fois pour toutes : **Publication** *(rendre la page accessible)* · **Accès** *(donner son adresse)* · **Diffusion** *(geste volontaire vers un canal externe)* |
| 🆕 **R-097** *(P2)* | **Le témoin `tournoi_publie` sert de signal implicite à un système extérieur.** ⭐ `publierTournoi()` respecte **déjà** la doctrine ; c'est le site `boutique-r92` qui **lit** le témoin et fabrique **tout seul** une carte d'actualité et une page d'événement |
| 🆕 **`PLAN.md` §15.3 bis** | Le chantier **M1-PUB *(= M1-E7)*** et ses **5 micro-lots** — dont ⭐ **l'ORDRE GÉNÉRAL du découplage** *(cadrage architectural)* et le **critère de clôture** |
| 🔬 **Preuve** | Le couplage a été **vérifié DIRECTEMENT** dans le dépôt séparé `boutique-r92` *(commit `164bb8e`)*, ⛔ **et non déduit d'un commentaire de Maxilou**. ⚠️ **Ce qui est prouvé est le CODE des deux dépôts — pas ce qui est servi en ligne** *(`CLAUDE.md` §13.6)* |
| ⏸️ **M1-C1** | **SUSPENDUE JUSQU'À LA CLÔTURE COMPLÈTE DE M1-PUB** — ⛔ **pas jusqu'à son cadrage** : la trajectoire retenue est **on termine M1-PUB avant de reprendre M1-C1** |
| ⛔ **PUB-2 → PUB-5** | **NON COMMENCÉS** — et aucun ne démarre sans validation explicite |
| 🔴 **Le repère « données à recréer »** | **TOUJOURS ACTIF** — ⛔ **aucune donnée de tournoi n'a été recréée par ce lot** |

> 🎯 **Pourquoi ce chantier s'ouvre maintenant, et pas après M1-F.** M1-F est **la clôture** de M1 :
> elle prouve qu'il ne reste plus aucune attribution institutionnelle. ⛔ **Or tant que publier dans
> Maxilou fait apparaître un contenu sur le site d'une association, cette preuve est impossible à
> écrire.** M1-PUB n'est donc pas un détour : c'est **un prérequis de la clôture**.

---

*Rappel de la mise à jour précédente — 2026-08-24 (soir, suite)* : 🏁 **M1-B EST TERMINÉE : LES SEPT ÉTATS SONT
ATTEINTS**, ⭐ **le septième par une réinitialisation RÉELLE**.

🔴 **Le défaut corrigé, en une phrase** : une réinitialisation laissait la demande d'autorisation
**entièrement remplie avec les valeurs de l'édition passée**, marquées *« saisi »*, compteur à
**0 manquant** — un dossier pouvait partir à la Ligue avec un médecin absent et un prix périmé,
**sans aucun signalement**.

| | |
|---|---|
| ✅ **Implémentée** | Allowlist **explicite** des **26** champs d'édition *(`CHAMPS_AUTORISATION_A_REINITIALISER`)* · récompenses `org_recompenses_*` par **préfixe complet** · branchement dans `reinitialiserTournoi` · message de confirmation refait |
| ✅ **Testée** | **796/796 OK, 0 FAIL** — **+81** vérifications, dont un test de **branchement** et les tests **négatifs** de **R-B2**. ⭐ **Constaté CHEZ GOOGLE le 2026-08-24**, `Test.gs` à **4645** lignes *(la valeur avait d'abord été prédite hors ligne)* |
| ✅ **Commitée** | **`dc03488`** — 9 fichiers |
| ✅ **Poussée, puis FUSIONNÉE dans `main`** | ⚡ **Cette ligne annonçait « sur sa branche seule, aucune fusion vers `main` », vrai jusqu'à la fusion du 2026-08-24.** Les **3 commits** *(`dc03488`, `e515fd7`, `8dfd28a`)* sont dans `main` par **fast-forward** — ⛔ aucun SHA réécrit, aucun commit de fusion créé. `origin/main` : **`1c5cd4f` → `8dfd28a`** |
| ✅ **Backend REDÉPLOYÉ** | **Version Apps Script 156, 2026-08-24 à 11:13** *(la 155 datait du 22/08 17:31)* — **même déploiement, même adresse**. Témoins après collage : `CHAMPS_AUTORISATION_A_REINITIALISER` **3**, `reinitialiserDonneesAutorisationTournoi` **2**, fichier à **8423** lignes, `viderDonnees` ligne **8418** |
| ✅ **Frontend PUBLIÉ *et* RÉELLEMENT OBSERVÉ** | Workflow Pages **`success`** sur **`8dfd28a`** *(run 32712062024, 2026-08-24 09:32 UTC)*, **les DEUX jobs** compris. ⭐ **Et le doute a été levé À LA MAIN le 2026-08-24** : la page publiée a été ouverte dans un navigateur, le bouton *« Réinitialiser le tournoi »* cliqué, et **le nouveau dialogue M1-B s'est affiché**. ⚡ **Cette ligne annonçait auparavant que la page servie « n'avait pas pu être observée »** — c'était vrai de l'environnement de travail *(`github.io` refusé, 403)*, ⛔ **plus de la réalité** |
| ✅ **VÉRIFIÉE EN RÉEL** | ⚡ **Cette ligne annonçait « PARTIELLEMENT », le geste destructif n'ayant pas été exercé. Il l'a été le 2026-08-24.** Chaîne complète parcourue : **frontend publié → 1er dialogue → `CONTINUER` → 2e dialogue → `OUI, TOUT EFFACER` → backend v156 → classeur**. L'application a répondu *« Supprimés : 2 catégorie(s), 38 équipe(s), 10 poule(s), 51 match(s). Tournoi masqué. »* ⭐ **Verdict, relevé DANS `Config` avant et après** : **PERMANENTS 10/10 conservés** · **ÉVÉNEMENTIELS 26/26 effacés** · **RÉCOMPENSES 2/2 effacées** *(`org_recompenses_U8`, `_U10`)*. Les 26 clés **existent toujours** — on a vidé la valeur, pas supprimé le paramètre |
| 🔴 **Découverte sur CF-4b/L8** | Le relevé **avant** collage a montré que **la part backend de L8 était DÉJÀ en service** *(voir plus bas)*. ⛔ **M1-B ne l'a donc pas mise en service, contrairement à ce qui était annoncé ici** |
| 🔴 **R-033 n'est pas refermé** | Sa part `org_*` est traitée ; **`detail_effectifs` et `nb_educateurs_total` ne le sont PAS** — ce sont des colonnes de `ClubsInvites`, hors périmètre |

> 🔴 **CE QUE LE RELEVÉ D'AVANT COLLAGE A RÉVÉLÉ — et c'est une correction de doctrine, pas un
> détail.** Le dépôt affirmait depuis le 2026-08-22, en **cinq endroits**, que *« la part backend de
> CF-4b/L8 n'a jamais été redéployée »*. **C'est faux.**
>
> **Constaté le 2026-08-24, AVANT tout collage de M1-B** *(témoins D-040 relevés dans l'éditeur, et
> appel de l'URL publique)* :
>
> | Contrôle | Relevé |
> |---|---|
> | `CHAMPS_AUTORISATION_A_REINITIALISER` · `reinitialiserDonneesAutorisationTournoi` | **0** et **0** — ✅ M1-B n'était bien pas là |
> | `API tournoi en ligne` *(témoin de L8)* | **1** |
> | `API Tournoi R92 en ligne` *(l'ancienne chaîne)* | **0** |
> | `…/exec?action=ping` | **`{"ok":true,"message":"API tournoi en ligne"}`** |
>
> ➡️ **La part backend de L8 était donc déjà présente dans l'éditeur ET déjà servie publiquement.**
>
> ⛔ **La date et le geste de cette mise en service ne sont PAS établis, et rien n'est supposé.**
> `be57f97` (2026-08-22) est le **premier commit publié** portant cette chaîne *(`git log -S`)*,
> ⛔ **mais il ne date PAS le déploiement chez Google** : rien n'interdit qu'un état **local**, pas
> encore commité, ait été collé dans l'éditeur avant. ⭐ **Ce projet en porte justement l'exemple** —
> la fiche de L5 a parlé d'un *« patch appliqué, non commité »*. **Git date le dépôt, jamais le
> chantier** *(`CLAUDE.md` §13.6)*.
>
> 🎯 **Pourquoi c'est le contrôle qui a bien fonctionné, et non celui qui a échoué** : sans le
> relevé **avant** collage, nous aurions écrit que M1-B avait mis L8 en service — **une phrase
> fausse, et flatteuse pour notre propre lot**. C'est précisément ce que **D-040** demande de ne
> jamais supposer.

---

*Rappel de la mise à jour précédente — 2026-08-24 (soir)* : 📏 **UNE RÈGLE PERMANENTE DE PLUS, ET M1-A EST
CLÔTURÉE SANS RELIQUAT INTERNE.**

Micro-lot **méthodologique et documentaire**. ⛔ **Aucun changement fonctionnel : aucun fichier
`backend/`, aucun fichier `frontend/`, aucun test, aucune donnée du classeur, aucun déploiement.**

| | |
|---|---|
| 📏 🆕 **`CLAUDE.md` §8 septies** | **« Règle de l'état constaté APRÈS le geste »** — un état qui décrit un commit, une fusion, une poussée, une publication ou un redéploiement se **contrôle après** l'exécution du geste ; un état écrit avant est **une intention, pas un état**. Elle protège explicitement les **traces historiques** : ce qui était vrai à sa date **ne se réécrit pas** |
| 📏 **`CLAUDE.md` §12.4** | un **point 5 neuf** dans la règle d'arrêt — relire, **après** le geste, ce que les documents d'état en affirment *(les anciens 5, 6 et 7 deviennent 6, 7 et 8 ; ⛔ **les points 1 et 2, les seuls cités ailleurs, ne bougent pas**)*. Et **§12.4 bis** : le rapport de fin de session dit ce qui a été **constaté**, pas ce qui va l'être |
| 🏁 **M1-A** | **CLÔTURÉE, et sans ambiguïté** : la lecture des deux URL en **sort** et devient un **reliquat EXTERNE non bloquant** *(détail plus bas)* |
| ⛔ **M1-B** | **toujours PAS commencée** — et ce reliquat ne la déclenche pas |

> 🎯 **Pourquoi cette règle, et pourquoi maintenant** : **quatre états faux en trois jours**, tous du
> même type — **R-094**, le *« 2 lots sur 8 »* de CF-4b, **L8**, puis **M1-A annoncée non fusionnée
> après sa fusion**. Chacun était **vrai le jour où il a été écrit**, et faux dès le geste suivant.
> ⭐ **Quatre répétitions ne sont plus une inattention : c'est un défaut de méthode**, et il se
> corrige par une règle, pas par un effort d'attention.

---

*Ce qui reste vrai depuis la mise à jour du même jour (fin de journée)* : 🏁 **M1-A EST TERMINÉE,
FUSIONNÉE ET PUBLIÉE DANS `main`.**

**Ses trois commits sont dans l'historique de `main`**, par **fast-forward** — ⛔ **aucun n'a été
réécrit, aucun commit de fusion créé** :

| Commit | Ce qu'il porte |
|---|---|
| **`9abaebc`** | Les 7 documents de M1-A *(dont 🆕 `M1-LIBELLES-OFFICIELS.md`)* |
| **`b65a6b0`** | Le journal de session — `SESSIONS.md` **§17** |
| **`aff6d5f`** | Le correctif : statut de M1-A, et **L5 était bien déployé** |

`origin/main` : **`94cd6a2` → `aff6d5f`** *(effet de CETTE fusion)*. ⚠️ **`origin/main` a avancé
depuis** — l'état publié **du jour** ne se recopie pas ici, il se lit avec `git rev-parse origin/main`
*(§8 quater : un repère volatil n'a qu'une source, et c'est le dépôt lui-même)*.

**L'état exact au terme de M1-A** *(chaque ligne est vérifiée, aucune n'est déduite)* :

| | |
|---|---|
| ✅ **M1-A** | 🏁 **TERMINÉE, FUSIONNÉE, PUBLIÉE — et CLÔTURÉE.** ⛔ **Plus rien n'y est ouvert** |
| ⛔ **M1-B** | **PAS commencée** — et elle ne démarre pas sans autorisation explicite. ⚡ **Cette ligne décrit le 24/08 en fin de journée ; M1-B a été autorisée et ÉCRITE depuis** *(voir le bloc de tête)* |
| 🔻 **Les deux URL du classeur** | **toujours PAS LUES** — la politique réseau de l'environnement refuse `script.google.com` *(403 au `CONNECT`)*. ⭐ **RELIQUAT EXTERNE, NON BLOQUANT** : il est **sorti de M1-A** *(qui est close)* et **tracé au `PLAN.md` §15.8**. ⛔ **Il ne conditionne le statut d'aucune étape** |
| ⛔ **Données du classeur** | **aucune modifiée**, aucune lue |
| ⛔ **Backend M1** | **aucun redéploiement** — M1-A ne touche **aucun** fichier `backend/` |
| ✅ **CF-4b/L8** | ⚡ **CORRIGÉ le 2026-08-24 : cette ligne annonçait « part backend NON redéployée ».** Le relevé d'avant collage l'a démentie — **elle était déjà en service** *(voir le bloc de tête)*. ⛔ **Date et geste de mise en service INCONNUS** — ⚠️ `be57f97` ne les date pas |
| ✅ **CF-4b/L5** | reste **redéployé**, prouvé par un email réellement reçu |
| ✅ **R-094** | **déjà en service** — sa correction est **frontend**, publiée par GitHub Pages le 22/08 à 17:04 UTC |

> ⚠️ **Ce bloc annonçait successivement « non commitée, non poussée » puis « NON FUSIONNÉE dans
> `main` »** — vrai à chaque fois **au moment où c'était écrit**, et faux **dès le geste suivant**.
> ⭐ **C'est le quatrième décrochage du même type en trois jours** *(R-094, le « 2 lots sur 8 » de
> CF-4b, L8, et celui-ci)*, et la cause ne change pas : **un état écrit AVANT le geste, jamais relu
> APRÈS.** C'est **§12.4** appliqué à moitié — le point 1 est fait, mais **trop tôt**.
>
> 🎯 **Ce que quatre répétitions démontrent** : ce n'est plus une inattention, c'est **un défaut de
> séquence**. La documentation de suivi devrait être écrite **après** le commit, pas avant — ou
> alors relue juste après.
>
> ✅ **ARBITRÉ ET FERMÉ le 2026-08-24** : ce défaut est devenu une **règle permanente**,
> **`CLAUDE.md` §8 septies** *(« règle de l'état constaté APRÈS le geste »)*, avec un **point 5
> neuf** dans la règle d'arrêt **§12.4** — la relecture après le geste. Décision **D-046**.

⚡ **M1 a changé de nature.** Ce n'était qu'une opération manuelle *(vider deux URL, remplacer une
affiche)* ; c'est désormais **l'externalisation progressive des données propres à l'organisation**,
en **6 étapes M1-A → M1-F** *(`PLAN.md` **§15**)*. 🎯 **Le motif, et il tient en une phrase** : les
deux URL étaient **le symptôme, pas la cause** — la cause est que **l'application n'a aucun endroit
où un club se décrit**.

🔴 **Le défaut que l'audit a trouvé, et il est métier.** `reinitialiserTournoi` efface **40
paramètres** — ⛔ **et aucun n'est un `org_*` : les 36 sur 36 survivent**, dont **26 purement
événementiels**. Un tournoi neuf rouvre donc la demande d'autorisation **déjà remplie** avec les
valeurs de l'édition passée, marquées *« saisi »*, et le compteur annonce **0 champ manquant**.
⚠️ **Ce n'est pas un problème neuf mais un périmètre sous-estimé** : **R-033** le décrivait depuis
le 2026-08-06 comme *« les contacts de la demande FFR »*. **Sa fiche est élargie, aucun doublon
créé.** Cible fixée par **D-043** ; correction en **M1-B**, ⛔ **NON FAITE**.

⭐ **Quatre décisions fondatrices** : **D-042** *(principe, 7 familles, et le **cycle de vie A/B/C**
— permanente ⇒ lecture directe · proposée ⇒ **copie volontaire, aucun lien vivant** · événementielle
⇒ aucun lien)* · **D-043** *(10 conservés / 26 vidés)* · **D-044** *(profil ≠ répertoire de tiers,
logo ≠ charte graphique)* · **D-045** *(**fidélité aux libellés officiels**, nom officiel ≠ nom
d'usage)*.

🆕 **Un document neuf** : `M1-LIBELLES-OFFICIELS.md`, la table de correspondance **clé technique ↔
libellé officiel FFR ↔ usage**, ⭐ **décodée depuis le PDF du dépôt** *(26 tables `ToUnicode`, 7
flux de page, page par page et police par police — la page 5 en utilise **six**)*. **21 libellés de
Maxilou s'écartent du vocabulaire officiel** : *« Nombre de vestiaires »* là où le formulaire dit
*« Nombre de vestiaires **utilisés** »* — **le mot manquant change la réponse**.

⛔ **Ce que M1-A n'a PAS pu faire, et ce n'est pas un choix** : la **lecture seule** autorisée de
`url_site_association` et `url_instagram` **est impossible depuis cette session** — la politique
réseau de l'environnement refuse `script.google.com` *(403 au CONNECT)*. ⛔ **Aucune valeur du
classeur n'a donc été lue, ni modifiée.**

> 🔻 **CE POINT EST TRANCHÉ le 2026-08-24 *(soir)* — décision `D-047`**, et il faut le lire en
> entier : il a été présenté comme *« une chose reste en attente dans M1-A »*, ce qui rendait la
> clôture de l'étape ambiguë.
>
> | | |
> |---|---|
> | **M1-A** | 🏁 **DÉFINITIVEMENT CLÔTURÉE.** ⛔ **Son statut ne dépend plus de rien** |
> | **La lecture des deux URL** | 🔻 **RELIQUAT EXTERNE**, ⛔ **non bloquant**. Il **sort** du périmètre de M1-A |
> | **Pourquoi « externe »** | Le geste n'est pas empêché par le projet mais par **l'environnement d'exécution** *(blocage réseau vers `script.google.com`)*. **Aucune session ne peut le lever depuis ici** |
> | **Il reste tracé où ?** | `PLAN.md` **§15.8**, ligne dédiée — ⛔ **et il ne doit pas être oublié** |
> | **Quand sera-t-il fait ?** | **Dès qu'un environnement autorisant cette lecture sera disponible** ; à défaut, il est **repris par M1-F**, qui traite déjà les valeurs du classeur |
> | ⛔ **Ce qu'il ne déclenche PAS** | **M1-B ne démarre pas pour autant** — aucune étape ne démarre sans validation explicite *(`PLAN.md` §15.2)* |

📐 **Remesures réelles** *(jamais recopiées — §8 quater)* : `Code.gs` **8342** l. · `Tests.gs`
**4314** l. · **65** actions · **8** pages · **26** fichiers JS · **12** onglets — **tous les comptes
structurels inchangés**. ⚠️ **En revanche 11 comptes de LIGNES de `architecture.md` étaient périmés**
— ⭐ **et ils n'étaient pas FAUX : ils étaient DATÉS**, le document le disait. `admin-autorisation.js`
annonçait **1 011**, exact au 2026-08-09 *(vérifié par `git show`)*, **1013** aujourd'hui. **Le
tableau entier a été remesuré et redaté** : corriger une seule ligne d'un relevé daté l'aurait rendu
**plus trompeur qu'avant**.

---

*Rappel de la mise à jour précédente — 2026-08-22 (suite)* : 🗓️ **LA DATE DU TOURNOI NE DÉPEND PLUS DU
TÉLÉPHONE QUI LA REGARDE.** Lot correctif **R-094**, ⛔ **hors CF-4b** : ce n'est pas une
neutralisation, c'est une **correction de fiabilité P1** ouverte séparément pour ne pas se mélanger
au chantier institutionnel.
✅ **CORRECTION D'ÉTAT, apportée le 2026-08-24** : cette ligne annonçait *« appliqué localement,
non commité »*. **C'est faux depuis le 2026-08-22 à 17 h 04** — le travail **est** le commit
**`94cd6a2`**, et il **est sur `origin/main`**.
🔴 **DEUXIÈME CORRECTION, apportée le 2026-08-24 (suite)** : cette même ligne ajoutait que *« la
mention non redéployé reste vraie, et vaut aussi pour CF-4b/L8 : le serveur en service ignore encore
les deux »*. ⛔ **C'était faux pour R-094, et il faut comprendre pourquoi** : **R-094 ne touche
AUCUN fichier `backend/`** *(son diff porte sur `commun.js`, `commun-dossier.js`,
`admin-infos-publication.js` et de la documentation)*. **Il n'attend donc aucun redéploiement chez
Google** — il n'y a rien à y recopier. Sa part frontend a été **publiée automatiquement** par le
workflow GitHub Pages : exécution **`success`** sur `94cd6a2`, **2026-08-22 17:04:24 UTC**
*(vérifié sur GitHub le 2026-08-24)*. ✅ **La correction de la date civile EST donc en service.**
⚠️ **Ce qui reste vrai** : la part **backend** de **CF-4b/L8** n'est pas redéployée, et le premier
redéploiement de **M1-B** l'emportera.
⭐ **Ce que ce décalage enseigne** : l'état d'un lot avait été écrit **avant** son commit et jamais
relu après — c'est **§12.4** appliqué à moitié.
**9 fichiers** — **3** de code, **2** de documentation active, **1** de règles permanentes
*(`CLAUDE.md`)*, **3** de suivi. *(Chiffre issu de `git diff --name-only`, pas d'une estimation.)*
🔴 **Une date configurée au 13/03/2027 s'affichait « 12 mars 2027 »** dans le dossier du club et
dans l'email — découvert par un **test réel depuis `America/New_York` (EDT, UTC−4)**.
⚡ **Ce défaut est INVISIBLE depuis la France** : il ne se manifeste qu'à l'ouest de Greenwich.
Aucune relecture faite en métropole ne l'aurait vu.
⛔ **Le premier diagnostic était faux** — le correctif demandé *(« le nom du fichier `.ics` »)*
aurait aggravé le défaut : le fichier d'agenda était **sain**, `DTSTART` portait bien le 13.
⭐ **Cause** : `tournoi_date` est une **date civile**, pas un **instant** — devenu le garde-fou
permanent **`CLAUDE.md` §8 sexies**. Corrigé en **un seul point commun**, `dateLocaleDepuisISO`
dans `commun.js`, chargé en rang 1 sur les 4 pages concernées.
🔴 **Le contre-audit a rattrapé une inversion** : sans motif **ancré**, une chaîne horodatée aurait
été tronquée à sa date UTC — le correctif aurait retourné le défaut **contre la France**.
📐 Preuves : **6 fuseaux**, 1 seule valeur par date civile · **12/12 instants identiques** à
l'ancien code · 26 fichiers JS `node --check` sans erreur. ⛔ **Aucun fichier `backend/` touché,
aucune donnée du classeur.**
⚠️ **Dette consignée, non traitée** : le dépôt **séparé** `boutique-r92` porte le même défaut.

---

*Rappel de la mise à jour précédente — 2026-08-22* : ⚙️ **L'APPLICATION NE NOMME PLUS AUCUN CLUB PAR
DÉFAUT.** Le lot **L8** est **commité** *(`be57f97`)* et **poussé sur `origin/main`**,
⛔ **mais NON redéployé chez Google** — le serveur en service ignore encore ce lot.
**22 fichiers** — **17** de code et de documentation active, **5** de suivi —
deux sous-lots contrôlés, **un seul commit**.
⚠️ **Cette ligne annonçait « 20 fichiers — 15 + 5 »** : le décompte avait été figé **avant** les
corrections du contre-audit, qui ont ajouté deux fichiers. ⛔ **Le chiffre n'a pas été recalé en
silence** — c'est le **diff réel** *(`git show --stat be57f97`)* qui fait foi, jamais une annonce
antérieure.
⭐ **Audité par QUATRE agents indépendants** avant écriture, et **trois arbitrages ont été rouverts**
parce que leurs constats ont démontré des prémisses fausses *(**D-041**)* :
🔴 **① `boutique_r92_disponible` n'était PAS un identifiant interne** — `getConfig` est **public**
et recopie les **noms de clés verbatim** : le nom sortait dans une réponse lisible par n'importe qui.
Il devient `boutique_disponible`, avec une **migration douce à la lecture** — ⛔ **aucune
manipulation du classeur, aucune perte du réglage déjà coché**.
🔴 **② « vide par défaut » était l'état le plus DANGEREUX**, pas le plus neutre : `indexOf('')`
renvoie `0`, donc **toutes** les équipes auraient été comptées comme celles du club. ⭐ **Démontré
par exécution** : l'ancienne logique retenait **5 équipes sur 5** avec un mot-clé vide ; la
nouvelle en retient **0** et le dit.
⏸️ **③ Le préfixe `R92 — ` et le menu du classeur sont CONSERVÉS** — invisibles de l'utilisateur, et
le préfixe **est** le repère de preuve de D-040.
⭐ **Une découverte de méthode, et elle dépasse ce lot** : les **703 vérifications ont pu être
exécutées hors Apps Script**, avec des doublures. Le harnais **reproduit exactement `703/703` sur
l'état d'avant** — il est donc validé — et donne **`715/715 OK, 0 FAIL`** après le lot. Le projet
croyait cette exécution impossible.
📐 **Repères D-040 REMESURÉS, jamais recopiés** *(N-3)* : `Code.gs` **8342** lignes *(était 8277)* ·
`Tests.gs` **4314** *(était 4244)* · bilan **715/715** *(était 703/703)* · témoin
`API tournoi en ligne`.
🔧 **M1 reste entier et bloquant.**

---

*Rappel de la mise à jour précédente — 2026-08-22* : 📖 **LA DOCUMENTATION DU DÉPÔT PUBLIC NE S'ATTRIBUE PLUS
À UNE ASSOCIATION.** Le lot **L7** est **TERMINÉ** : **26 points, 8 fichiers**, ⛔ **aucun code,
aucun test, aucun déploiement, aucune donnée du classeur**.
⭐ **Le point le plus visible du chantier tout entier** : la **première phrase du `README.md`**
annonçait encore *« Mini-logiciel […] pour l'association … »*. C'est **la ligne que D-039 citait
nommément**, et elle avait survécu à six lots.
⚡ **Le lot a compté 26 points, et non les 16 annoncés — et l'écart est instructif.** Le plan
annonçait 16 points **sans jamais les énumérer**. Le compte réel se décompose ainsi : **14**
attributions institutionnelles *(le compte annoncé, moins `contact@r92.fr` reporté à L8 et moins les
2 exemples réels conservés)* · **+ 4** références `CF-4` → `CF-4a` · **+ 2** descriptions
*« blason »*, fausses depuis **L4** · et surtout **+ 6 que L0 ne pouvait pas connaître** : le
**bandeau de don**, supprimé par **L3** le 2026-08-20, était encore décrit comme **existant** dans
six documents actifs. 🎯 **Ce ne sont pas des oublis de L3 : ce sont des documents devenus faux
APRÈS son passage.** Les lots qui **retirent** quelque chose de l'application **créent** de la dette
documentaire — et elle atterrit dans le lot suivant sans que personne ne l'y mette.
🔴 **Une découverte reportée à L8, et elle est VISIBLE par un club** : le libellé **« Boutique
R92 »** subsiste dans l'écran organisateur *(`admin.html`)* et dans la **pastille de l'invitation
envoyée aux clubs**. **L2 l'avait manqué** parce que le mot est collé au nom du réglage
`boutique_r92_disponible`. ⛔ **Non corrigé ici** *(code + configuration ⇒ L8)*, mais **désormais
inscrit au périmètre de L8**, avec `contact@r92.fr` *(document ET tests, à changer ensemble)*.
⏸️ **Quatre réserves confirmées par Romain** : les titres *« Tournoi R92 »* rejoignent la réserve du
**nom du dépôt** *(D-039 #13)* · les exemples réels *« RACING 92 »* / *« Racing 92 »* sont **des
équipes qui jouent**, pas une attribution · `contact@r92.fr` **reporté à L8** · le mot *« blason »*
**corrigé** en *« repère visuel »* *(faux depuis L4)*, ⛔ **sans toucher la classe `.inv-blason`**.
🔧 **M1 reste entier, et reste bloquant** : les valeurs du classeur et surtout **l'affiche du
tournoi**. **CF-4b ne peut pas être close sans lui.**
📊 **L0** = préalable · **7 lots d'exécution sur 8 terminés** · ⬜ **L8** · 🔧 **M1** en attente
d'autorisation. **La prochaine étape est L8.**

---

*Rappel de la mise à jour précédente — 2026-08-20 (suite 4)* : 📬 **UN EMAIL REÇU LE PROUVE : LE NOM DE
L'EXPÉDITEUR N'EST PLUS CELUI D'UNE ASSOCIATION.** Le lot **L5** est **TERMINÉ**, ses deux phases
faites — et, pour la première fois du chantier, la preuve finale ne vient **ni du code, ni d'un
test**, mais d'une **boîte de réception**.
✅ **L5-B** : `Code.gs` et `Tests.gs` **recopiés chez Google, enregistrés et contrôlés dans
l'éditeur** *(témoins fixés AVANT le collage)*, **nouvelle version du même déploiement**,
**`R92 — 703/703 OK, 0 FAIL`**, ping conforme.
⭐ **La preuve, et elle est discriminante** : un email réel envoyé au club fictif *LE TEST RUGBY
CLUB* porte l'en-tête brut `From: "L'organisation du tournoi" <romain.rifleu@gmail.com>`
*(20/08/2026, 17:08 UTC)*, là où un message reçu **le matin même**, dans la **même boîte** et depuis
la **même adresse**, portait `From: "Génération R92"`.
⚠️ **La portée exacte, et elle doit être lue** : **une seule des quatre lignes corrigées a été
exercée en réel** — celle de `MailApp` dans `envoyerEmailHtml`. Les **trois autres** *(repli texte,
et la branche `GmailApp` avec alias)* sont **corrigées et vérifiées dans le code**, ⛔ **jamais à la
réception**.
🔴 **Une leçon de méthode en est sortie, et elle vaut au-delà de CF-4b** *(**D-040**)* : le matin,
une version avait été publiée **avec l'ancien `Code.gs`**, ping **vert** et tests **verts** — le
ping parce qu'**un contrôle de vie n'est pas un contrôle de version**, les tests parce qu'⛔ **aucun
d'eux ne couvre le nom d'expéditeur** *(leur bilan était vert et sincère, simplement sans rapport
avec la modification)*. ⛔ **Quel geste avait manqué chez Google n'a PAS été établi** — seule
l'absence du contenu attendu l'est.
🔧 **M1 s'élargit** : l'**affiche du tournoi** enregistrée dans le classeur porte encore des
éléments institutionnels. ⛔ **Aucune donnée n'a été touchée** — c'est un constat inscrit, pas une
correction.
📊 **L0** = préalable · **6 lots d'exécution sur 8 terminés** · ⬜ **L7, L8** · 🔧 **M1** en attente
d'autorisation. **La prochaine étape est L7.**
⛔ **Aucun test modifié, aucun code applicatif touché, aucune donnée du classeur modifiée.**

> ⚠️ **Le rappel ci-dessous décrit l'état à 13 h, et RIEN D'AUTRE.** **Plusieurs de ses
> affirmations ont été dépassées plus tard le même jour** — pas seulement celle sur L5-B : il
> annonce aussi que [`../deploiement.md`](../deploiement.md) *« n'a pas été modifié »*, ce qui a
> cessé d'être vrai avec **D-040**. ⭐ **Il est conservé INTACT comme trace historique** : on ne
> réécrit pas une trace datée.

*Rappel de la mise à jour précédente — 2026-08-20 (suite 3)* : 📤 **LE DÉPÔT NE DEMANDE PLUS D'ENVOYER AU NOM
D'UNE ASSOCIATION — MAIS LE SERVEUR EN SERVICE, LUI, N'A PAS ENCORE CHANGÉ.** Le lot **L5** est
découpé en deux phases, et **seule la première est faite**.
✅ **L5-A** : **4 substitutions littérales** dans `backend/Code.gs` — `name: 'Génération R92'`
devient `name: 'L\'organisation du tournoi'` dans `envoyerEmailAvec` et `envoyerEmailHtml`.
⭐ **Quatre actions serveur en héritent** : `envoyerInvitationClub`, `envoyerInvitationsGroupe`,
`envoyerDossierEmail` et `envoyerFeuilleJour`.
✅ **`backend/Tests.gs` est INTACT** — re-vérifié : **aucun des 703 tests ne couvre le nom
d'expéditeur**. Les deux repères de [`../deploiement.md`](../deploiement.md) restent donc
**`703/703`** et **`4244`**, et ce document n'a pas été modifié.
⛔ **L5-B N'EST PAS FAITE** : le backend **n'a pas été redéployé**. ⚠️ **Un email envoyé aujourd'hui
partirait toujours sous l'ancien nom.**
🎯 **Et même après redéploiement, le code ne prouvera rien du nom réellement affiché** : seul un
message **reçu** peut l'établir. ⛔ **Aucun envoi n'a eu lieu, et aucun n'aura lieu sans autorisation
explicite.**
📊 **L0** = préalable · **5 lots d'exécution sur 8 terminés** · 🚧 **L5 EN COURS** · ⬜ **L7, L8**.
⛔ **Aucun test modifié, aucun frontend touché, aucune configuration, aucun déploiement, aucun
email.**

*Rappel de la mise à jour précédente — 2026-08-20 (suite 2)* : 🛡️ **L'APPLICATION N'AFFICHE PLUS AUCUN LOGO
QUI NE SOIT PAS LE SIEN.** Le lot **L4** a remplacé les logos et blasons par un **repère visuel
neutre et temporaire** — un écusson géométrique portant la seule lettre **T**. ⛔ **Ni ballon, ni 92,
ni R, ni M, ni couronne, ni nom de produit** : ⭐ **le nom « Maxilou » n'apparaît toujours nulle
part.**
🆕 **3 ressources créées, toutes locales** : `logo-tournoi.svg` *(620 o)*, `logo-tournoi.png`
*(1,2 Ko — les clients de messagerie n'affichent pas le SVG)* et `grain.svg`. ⚡ **Le PNG a été
fabriqué sans aucune dépendance** *(zlib + struct)* : aucun convertisseur n'est installé, et le
projet refuse d'en ajouter *(`CLAUDE.md` §10)*.
🗑️ **3 assets institutionnels supprimés — 224 Ko**, après vérification qu'aucun consommateur ne
subsistait.
⭐ **La favicon est posée sur les 8 pages** : **7 n'en avaient aucune** et s'affichaient avec l'icône
par défaut du navigateur. ⛔ **Plus aucune image ne vient d'un site extérieur** — le grain de fond
était encore téléchargé chez la vitrine.
⚠️ **Deux adaptations CSS minimales, et elles étaient nécessaires** : l'ancien logo était un
**bandeau large**, le nouveau est **carré** — `width:100%` l'aurait étiré à **260 px de côté** dans
l'en-tête d'administration.
⏸️ **Une réserve constatée** : les deux **icônes de liens** *(Instagram, site)* **restent** — ce ne
sont pas des images institutionnelles, et elles outillent le mécanisme que **D-039 #7 demande de
conserver**.
📊 **L0** = préalable · **5 lots d'exécution sur 8 terminés** *(L1, L6, L2, L3, L4)* · **3 restants**
*(L5, L7, L8)*.
⛔ **Aucun backend, aucun test, aucun déploiement Google, aucun email.**

*Rappel de la mise à jour précédente — 2026-08-20 (suite)* : 🔗 **L'APPLICATION NE RENVOIE PLUS VERS UNE
ASSOCIATION.** Le lot **L3** a retiré **21 points** : les **4 destinations institutionnelles codées
en dur** *(deux comptes Instagram, deux sites)*, le **retour vers la vitrine**, les liens **« Site de
l'association »** et **« Contact »** du pied, et ⭐ **le bandeau de don, entièrement** — texte, lien,
conteneur, 4 références JavaScript et 5 règles CSS devenues orphelines.
⭐ **Le piège annoncé est démontré, pas supposé** : le même test d'exécution lève
`Cannot set properties of null` sur la version **d'avant** et **rien** sur celle d'après.
⚠️ **Les liens ont été SUPPRIMÉS, jamais remplacés** — ni `#`, ni faux lien générique : un bouton
mort aurait été pire que pas de bouton. ✅ **Les liens fonctionnels sont intacts** *(répondre,
ouvrir son espace, voir en ligne, itinéraire, agenda)*.
⚠️ **Ce qui reste, et c'est attendu** : les **logos** *(L4)* et le **nom d'expéditeur** *(L5)*. Un
email n'est donc pas encore neutre **visuellement**.
📊 **L0** = préalable · **4 lots d'exécution sur 8 terminés** *(L1, L6, L2, L3)* · **4 restants**
*(L4, L5, L7, L8)*.
⛔ **Aucun backend, aucun test, aucun déploiement Google, aucun email, aucune opération sur le
classeur.**

*Rappel de la mise à jour précédente — 2026-08-20* : ✍️ **L'APPLICATION NE SE PRÉSENTE PLUS COMME CELLE D'UNE
ASSOCIATION.** Le lot **L2** de CF-4b a neutralisé **50 points de texte** : onglets du navigateur,
métadonnées de partage, en-têtes et signatures des **deux emails** *(HTML **et** texte)*, **pages
publiques miroirs**, fichier d'agenda, page Perfs, et **4 commentaires** devenus faux.
⭐ **Le piège annoncé était réel et a été traité** : `tournoi.js:394` **réécrivait le titre après le
chargement** — corriger le HTML seul n'aurait rien changé de visible. ✅ **Vérifié par exécution
réelle de `majTitre()`** : nom configuré → le vrai nom · champ vide → *« Le tournoi »*.
⚡ **Le recomptage a donné 50 et non 45** : **3 commentaires** manquaient, et surtout ⭐ **l'`UID` du
fichier `.ics` portait `@generation-r92`** — introuvable par une recherche sur « Génération R92 ».
**Signalé, rattaché à L2 comme relevant du même périmètre textuel.**
✅ **`node --check` sur 30 fichiers, 0 erreur** · **50 insertions / 50 suppressions** — ⛔ **aucune
URL, aucune classe, aucune structure modifiée**.
⚠️ **Dette temporaire assumée** : la page Perfs est textuellement générique, mais **son filtre reste
`'racing'` jusqu'à L8**.
📊 **Comptage exact** : **L0** = préalable documentaire · **3 lots d'exécution sur 8 terminés**
*(L1, L6, L2)* · **5 restants** *(L3, L4, L5, L7, L8)*.
⛔ **Aucun backend, aucun test, aucun déploiement Google, aucun email, aucune opération sur le
classeur.**

*Rappel de la mise à jour précédente — 2026-08-19 (nuit, 4)* : 🧑 **LA PERSONNE PHYSIQUE A QUITTÉ LE DÉPÔT
PUBLIC.** Le lot **L6** de CF-4b a réécrit [`../passation.md`](../passation.md) : le document
planifiait un transfert vers un domaine, une adresse de messagerie et **une personne nommée**
— ⛔ **aucun des trois n'ayant rien accepté**, et le prénom étant une **donnée personnelle publiée**
sans base légale. ✅ **Zéro occurrence institutionnelle restante** *(contrôle en locale UTF-8)*.
⭐ **Et la procédure n'a rien perdu** : structure identique *(§1 à §11.4)*, **25 repères techniques
vérifiés un par un, tous présents** — `SHEET_ID`, `API_URL`, `configurerCles`, les deux nombres de
contrôle, DNS, `CNAME`, alias Gmail… Le document a **grandi** *(277 → 408 lignes)* : il gagne un
**§0 de prérequis** qui le rend **inapplicable tant que CF-14 n'a pas eu lieu**, un
**administrateur décrit et non désigné**, et trois garde-fous qui manquaient — **sauvegarde avant
transfert**, **révocation des anciens accès**, **retour arrière**.
✅ **3 lots sur 8** : **L0**, **L1**, **L6**. ⭐ **Les deux lots qui touchaient un tiers réel sont
faits** ; les six restants ne concernent plus personne d'identifié.
⛔ **Aucun code, aucun test, aucune configuration, aucun déploiement, aucun email, aucune opération
sur le classeur.**

*Rappel de la mise à jour précédente — 2026-08-19 (nuit, 3)* : 🧭 **UNE ÉTAPE S'EST SCINDÉE EN DEUX, ET LA
SECONDE EST OUVERTE.** L'ancienne **CF-4** *(mentions légales)* devient **CF-4a** — ⏸️ **suspendue,
aucune de ses questions abandonnée** — et **CF-4b, la NEUTRALISATION INSTITUTIONNELLE**, prend sa
place en tête. 🎯 **Le motif est simple** : on ne peut pas rédiger des mentions légales exactes sur
un site qui s'attribue par ailleurs à une structure n'ayant rien décidé. Décision : **D-039**,
quinze arbitrages.
⭐ **CF-4b porte DEUX surfaces** — l'**application publiée** et le **dépôt GitHub public actif** ;
la seconde a dû être ajoutée après la première cartographie, qui ne regardait que l'application.
**Volume : 107 points de code · ~46 de documentation · 31 fichiers · 8 logos · 9 liens.**
✅ **Deux lots sur huit sont faits** : **L0** *(ce cadre)* et ⭐ **L1** — le **modèle d'autorisation
de droit à l'image est SUPPRIMÉ du dépôt public** *(commit **`3375061`**)*. ⚠️ **Ce n'était pas un
fichier inerte** : un document juridique **téléchargeable sans clé** qui faisait céder aux clubs des
droits sur l'image de **mineurs** au profit d'une association qui n'a rien décidé. **404 vérifié**
sur GitHub Pages, **absence vérifiée** sur un clone neuf.
⚡ **Une découverte de méthode, et elle vaut pour tout le chantier** : sans locale UTF-8, `grep` a
répondu **« 0 occurrence »** là où il y en avait **10**. ⛔ **Ne jamais conclure « 0 occurrence »
sans avoir vérifié que la recherche gère les accents** — CF-4b aurait pu se clore sur une preuve
vide.
🆕 **`CF-14 — Adoption institutionnelle` est INSCRITE au plan, non rédigée.**
⛔ **Aucun code, aucun test, aucune configuration, aucun déploiement, aucun email.** ⛔ **L'EDR et
Génération R92 n'ont toujours ni commandé, ni étudié, ni validé, ni adopté ce logiciel.**

*Rappel de la mise à jour précédente — 2026-08-19 (nuit, suite)* : 📋 **CF-2 A PRODUIT SON DOSSIER, et
⛔ AUCUNE DÉCISION N'A ÉTÉ PRISE.** Le livrable est
`CF-2-RESPONSABLE-TRAITEMENT.md` : la question, les **3 configurations**, **17 conséquences
comparées**, les **4 rôles possibles de Romain**, **11 questions** pour trancher, et 🔲 **une case de
décision volontairement VIDE**. ⭐ **Deux référentiels sont entrés** — **[R20]** *(CEPD, lignes
directrices 07/2020)* et **[R21]** *(fiche CNIL)* — et le premier apporte le point qui manquait :
la distinction **moyens ESSENTIELS / NON ESSENTIELS**. ⚠️ **Et [R21] en pose aussitôt la limite** :
concevoir ou choisir un logiciel **ne suffit pas à soi seul** à déterminer la responsabilité, mais
*« même si un acteur choisit un traitement sur étagère, il peut être considéré comme responsable dès
lors qu'il effectue ce choix au regard de ses besoins »*. ⭐ **Ce n'est pas l'outil qui décide, c'est
l'usage qu'on décide d'en faire.** ⚠️ **Une question de fait reste ouverte** : quelle **entité
juridique porte** l'École de Rugby ? — ⛔ **et ce n'est PAS un motif d'exclusion** : [R1] vise aussi
*« un autre organisme »*.
⛔ **Aucune structure contactée, aucune option retenue, aucun compte créé.**

*Rappel de la mise à jour précédente — 2026-08-19 (nuit)* : 🛡️ **UN CHANTIER EST OUVERT, ET CE N'EST PAS
C-015** : Romain a **mis C-015 en pause** et ouvert le chantier **CONFIANCE** *(cybersécurité +
juridique de l'existant)*, **hors du plan d'audit** — sa fiche est en `PLAN.md` **§14**, sa décision
fondatrice est **D-038**.
⭐ **Deux étapes sont faites : CF-0 et CF-1.** **CF-0** a vérifié les référentiels **à leur source**
*(18 sources primaires)* et **corrigé 9 hypothèses** : ⚡ **6 référentiels sur 15 étaient faux,
périmés ou mal calibrés** — dont une position de la CNIL **qui n'existe pas**. **3 textes sont
formellement écartés** *(NIS 2, Cyber Resilience Act, RGAA)*. **CF-1** pose le cadre :
🆕 **`REFERENTIELS.md`** *(9ᵉ fichier de suivi)*, la règle **`CLAUDE.md` §8 quinquies**, et le §14 du
plan.
🎯 **Le constat qui commande tout le chantier, et il était déjà dans ce fichier** *(I-03, I-04)* :
**le classeur ne contient aucune donnée personnelle de tiers**, le tournoi en base est **fictif**, et
**aucune journée réelle n'a jamais été jouée**. ➡️ *« La question n'est pas "faut-il réparer", mais
"faut-il préparer". »* ⚡ **Un seul écart est RÉEL et ACTUEL** : les **mentions légales** *(le site
est publié, [R10])*. **Tout le reste est un prérequis.**
⛔ **Aucune ligne de code, aucun test, aucune configuration, aucun déploiement.** ⛔ **L'EDR et
Génération R92 n'ont ni commandé, ni étudié, ni validé, ni adopté Maxilou** — aucune décision ne leur
est attribuée.

*Rappel de la mise à jour précédente — 2026-08-19 (soir)* : ⚡ **LES DEUX DERNIERS PROBLÈMES SANS
RATTACHEMENT SONT ARBITRÉS** *(**D-037**)*, et le registre n'en compte plus aucun :
**R-092 rejoint C-015** *(toute invalidation d'un résultat devra effacer le détail périmé)* ·
⚡ **R-093 devient le chantier C-031**, *« les colonnes du classeur : une seule façon de les
désigner »*, dont le périmètre couvre **au minimum `Matchs` ET `Equipes`** · 🛡️ une **règle de
protection provisoire** entre dans **C-015** *(toute colonne nouvelle s'ajoute **à la fin**)* —
⛔ **elle protège ce chantier, elle ne referme PAS R-093**. ✅ **`PLAN.md` §12 corrigé** : *« 91 sur
91 placés »* était devenu faux — **31 chantiers, 93 problèmes, aucun sans situation connue**.
⏳ **C-015 reste le prochain chantier à ouvrir** : sa conception n'est **pas** commencée.
⚠️ **Aucune ligne de code, aucun test, aucune colonne** — et **R-092 comme R-093 restent NON
CORRIGÉS**.

*Rappel de la mise à jour précédente — 2026-08-19 (fin de journée)* : 🏁 **DEUX CHANTIERS SE SONT SUCCÉDÉ
AUJOURD'HUI, ET LES DEUX SONT TERMINÉS** : **C-012** le matin *(voir le rappel ci-dessous)*, puis
⚡ **une REMISE À NIVEAU DOCUMENTAIRE en 6 lots**, ouverte par Romain **hors du plan d'audit** —
elle n'a **pas** de numéro `C-0XX`. **Les 6 lots sont faits et publiés** ; ⚠️ **l'un d'eux a touché
du code**, par exception assumée, pour porter **D-034**. *(Détail et preuves : `PLAN.md` **§13** ·
historique : `SESSIONS.md` · décisions **D-034 à D-036** : `DECISIONS.md`.)* Après la clôture, une
**micro-correction préventive de `CLAUDE.md`** *(`2706813`)* a élargi **§8 bis**, complété **§12.4**
et ajouté **§8 quater**.
✅ **AUCUN CHANTIER N'EST OUVERT À CE JOUR.**
⚠️ **Ce que rien de tout cela ne referme**, et il faut le lire avant d'ouvrir le suivant : la
réserve 🟠 **V-12 / N-3** de C-012 · **R-092** et **R-093**, **NON CORRIGÉS** et **rattachés à aucun
chantier** · **R-075** *(aucune version publiée)*. **Leur état vit dans `RISQUES.md`.**

*Rappel de la mise à jour précédente — 2026-08-19 (matin)* : 🏁 ⭐ **C-012 EST TERMINÉ : son étape 5 est CLOSE, et
R-042 passe à `TESTÉ`.** Les **3 vérifications qui manquaient sont faites et RÉUSSIES** :
✅ **V-7** *(l'égalité en élimination directe est refusée — et le refus **n'écrit rien**)*,
✅ **V-8** *(le vainqueur arrive **aussitôt** dans le match suivant · les perdants des 2 demies
alimentent la petite finale, **recalculée dans le bon ordre**)*, et ⭐ ✅ **V-10 — dans ses DEUX
branches** : « Annuler » ne modifie **aucune des 4 536 cellules**, « Modifier quand même »
réinitialise la suite du tableau **exactement comme prédit** *(4 matchs, 11 cellules)* — et
⭐ **sans déborder sur l'autre moitié du tableau**. **11 vérifications sur 12.**
⭐ **N-6 — « le mauvais vainqueur propagé », le dernier risque NON VÉRIFIÉ — est ÉCARTÉ**, ainsi que
**N-5**. ⚠️ **RÉSERVE EXPLICITEMENT CONSERVÉE par Romain : 🟠 V-12 / N-3 reste NON CONCLUANTE**
*(critère de substitution **D-C012-5**)*. ⚡ **Ce qui bloquait n'était pas technique mais une
croyance fausse** : `COUPE_PLATEAU` n'a **jamais été supprimé**, seulement **masqué de l'interface**
*(commit `21a4f2b`, qui ne touche **aucun fichier backend**)*. ⭐ **Et aucune des 5 fonctions du
mécanisme n'est couverte par les 703 tests** — V-10 était bien le seul filet. ✅ **Aucun code, aucun
test, aucune configuration, aucun déploiement.** ✅ ⭐ **Routage rétabli sur la PRODUCTION et
vérifié** *(4 tests concordants, dont un test négatif : le quart de finale fabriqué pour V-10 est
**absent**)* · ✅ ⭐ **production vérifiée NON CONTAMINÉE**. ⚠️ **R-092 et R-093 restent NON
CORRIGÉS.** Détail : `C-012-SPECIFICATION.md` **§8 quater**.

*Rappel de la mise à jour précédente — 2026-08-18 (nuit)* : 🚧 **C-012 — son étape 5 était OUVERTE : 9 des 12
vérifications manuelles sont faites.** ✅ **RÉUSSIES : V-1, V-2, V-3, V-4, V-5, V-6, V-9, V-11.**
🟠 **V-12 NON CONCLUANTE.** ⛔ **NON EXÉCUTÉES : V-7, V-8 et ⭐ V-10** — il manque un **tableau final
de Coupe**. ⭐ **V-10 est obligatoire : sans elle, l'étape 5 ne peut pas aboutir.** ⛔ **R-042 reste
OUVERT.** ⚡ **UN NOUVEAU PROBLÈME EST ENTRÉ AU REGISTRE : R-093** *(P2)* — **le serveur ÉCRIT les
colonnes par leur POSITION, mais les LIT par leur NOM** ; constaté **en vrai** pendant **V-4** *(les
8 compteurs du score détaillé décalés d'une colonne, `arbitre` **écrasée**, `drop_B` **perdue** —
**sans aucun message**)*. ⛔ **NON imputable à C-012** *(la ligne existait avant le chantier —
vérifié par `git blame`)*, **NON CORRIGÉ**. 🎯 **Les 703 tests automatiques n'auraient jamais pu le
trouver** : ils ne touchent aucun classeur. **C'est la première fois que les vérifications manuelles
attrapent ce que les tests ne voient pas.** ✅ **Aucun code, aucun test, aucun déploiement.**
Détail : `C-012-SPECIFICATION.md` **§8 ter**.

*Rappel de la mise à jour précédente — 2026-08-18 (soir)* : 🚧 **C-012 — son étape 5 était OUVERTE : 7 des 12
vérifications manuelles sont faites.** *(⚠️ Il s'agit de l'**étape 5 du chantier C-012** — les
vérifications manuelles de sa spécification, §10 — **à ne pas confondre** avec l'**ÉTAPE 5 du
cadre** `CLAUDE.md`, qui est la phase d'implémentation.)* ✅ **RÉUSSIES : V-1, V-2, V-3, V-6, V-9, V-11.** 🟠 **V-12
NON CONCLUANTE** — la validation mesurée a duré **7,099 s**, au-dessus de l'enveloppe de **7 s**
retenue comme critère de substitution *(D-C012-5)* ; les lectures **contemporaines** sont restées
dans leur plage habituelle, **et la cause de cette durée reste INDÉTERMINÉE**. ⛔ **NON EXÉCUTÉES :
V-4, V-5, V-7, V-8 et ⭐ V-10** — les données de test ne contiennent **ni catégorie U14, ni tableau
final de Coupe**. ⭐ **V-10 est déclarée obligatoire : sans elle, l'étape 5 ne peut pas aboutir.**
⛔ **R-042 reste OUVERT.** 🟠 **N-3 reste NON CONCLUANT** — le chemin `match_suivant` n'a jamais été
exécuté, faute de match de Coupe ; **V-12 ne le teste pas**. ⚠️ **Aucune régression C-012 n'est
démontrée**, et **aucune mesure homogène d'une validation avant C-012 n'existe ni ne peut plus être
obtenue** *(limite méthodologique définitive)*. ✅ **Aucun code, aucun test, aucun déploiement,
aucune modification de `main` — le dépôt est resté à `ffe4463` pendant toute l'étape 5.** Les
vérifications ont eu lieu sur une **copie de test** du classeur, **jamais sur la production** :
⭐ **le routage a été restauré en fin de session** et la production vérifiée **intacte** *(la réponse
publique est redevenue identique **octet pour octet** à celle d'avant bascule ; 3 matchs terminés et
211 lignes d'historique, inchangés)*. Détail : `C-012-SPECIFICATION.md` **§8 bis** et `SESSIONS.md`.

*Rappel de la mise à jour précédente — 2026-08-18 (jour)* : (⭐ **C-012 — L'ÉTAPE 4 EST TERMINÉE : le backend est
REDÉPLOYÉ chez Google.** `Code.gs` **et** `Tests.gs` collés *(ce dernier dans `Test.gs`, au
singulier chez Google)*, **nouvelle version du MÊME déploiement** publiée — l'URL publique est
inchangée. ⭐ **`lancerTestsFFR` chez Google : `R92 — 703/703 OK, 0 FAIL`**, et **dernière ligne de
`Test.gs` = 4244** — les **deux** preuves, jamais une seule *(voir `RISQUES.md` **M-04**)*.
Adresse publique vérifiée : `?action=ping` **OK** et `?action=getConfig` **OK** *(contenu réel du
tournoi renvoyé)*. ⏳ **Reste l'étape 5** *(les 12 vérifications manuelles, **V-10 obligatoire**)* —
**non autorisée à ce jour**. ⛔ **R-042 reste OUVERT** : les tests tournent enfin chez Google, mais
**aucune vérification manuelle n'a été faite**. ⚡ **R-092** toujours **NON corrigé**, priorité
**À CONFIRMER**.)

*Rappel de la mise à jour précédente — 2026-08-17* : (⚡ **C-012 — LES TROIS ÉTAPES DE CODE SONT FUSIONNÉES.**
Conception **validée** *(PR #186)*, **étape 1** *(PR #187 — `litSaisieScore` + T-1 à T-5)*,
**étape 2** *(PR #188 — `cascadeAVerifier` + T-14)*, **étape 3** *(PR #189 —
`deciderEnregistrementScore` + T-6 à T-13 et T-15 à T-17)*. ⭐ **Les six garde-fous de la saisie du
score sont enfin sous test.** Suite : **`R92 — 703/703 OK, 0 FAIL`**, `backend/Tests.gs` =
**4 244 lignes**. ⏳ **Restent l'étape 4** *(redéploiement chez Google — **non autorisée**)* **et
l'étape 5** *(les 12 vérifications manuelles)*. ⛔ **R-042 reste OUVERT** : un test qui n'a jamais
tourné chez Google ne prouve rien de l'application en service. ⛔ **Backend PAS redéployé.**
⚡ **R-092** toujours **NON corrigé**, priorité **À CONFIRMER**.)

*Rappel de la mise à jour précédente — 2026-08-16* : (⚡ **C-012 EN COURS — le premier chantier qui modifie
vraiment du code.** Conception **validée** *(PR #186)*, **étape 1 fusionnée** *(PR #187 —
`litSaisieScore` + T-1 à T-5)*, **étape 2 fusionnée** *(PR #188 — `cascadeAVerifier` + T-14)*.
Suite : **`R92 — 661/661 OK, 0 FAIL`**, `backend/Tests.gs` = **4 038 lignes**. ⏳ **Étape 3 NON
commencée** — **R-042 reste OUVERT**. ⛔ **Backend PAS redéployé.** ⚡ **R-092 inscrit au registre**,
**NON corrigé**, priorité **À CONFIRMER**.)

*Rappel de la mise à jour précédente — 2026-08-11* : (**🏁 SIX CHANTIERS CLÔTURÉS** — C-011 et C-013 *(TESTÉS
chez Google)*, **C-005 et C-006** côté travail documentaire le 2026-08-06, **C-007** le 2026-08-09,
et **🆕 C-008 LIVRÉ** le 2026-08-11 : **les 6 commentaires qui disaient le contraire du code sont
réécrits**, et la règle qui empêche le défaut de revenir est posée — `CLAUDE.md` **§8 ter**.
⚠️ **Les problèmes qui dépendent d'un changement de comportement restent OUVERTS** : R-028,
R-030 *(part outillage)*, R-031, R-033.)

*Rappel de la mise à jour précédente — 2026-08-06* : (**🏁 C-011 et C-013 DÉFINITIVEMENT CLÔTURÉS et TESTÉS** —
deux P1 refermés **sans changer une ligne du comportement de l'application** · `R92 — 616/616 OK,
0 FAIL` obtenu **chez Google**). *Session 16 : 🏁 l'ÉTAPE 3 est terminée* : vague 2 écrite,
**C-017 → C-030**, et **la couverture des 91 problèmes est prouvée : 91 sur 91 placés, 0 sans
place**.) *Sessions 13-15 : volets ①, ② et vague 1 du ③.* *Rappel de la veille : session 13 + **4 addendums*** — **ÉTAPE 3 ouverte, volet ①
terminé : les 6 décisions en attente sont TRANCHÉES** · ⚡ **une 7ᵉ décision apportée par Romain
entre au chantier : D-030 — tournoi suspendu / annulé** · ⚡ **I-21 levée par la FFR** · ⚡ **cadre
de la reprise précisé — 6 contraintes / 8 leviers / 5 principes — et trois fiches de chantier
écrites : C-002, C-003, C-004** · ⚡ **D-031 (la réglementation appartient au responsable, pas à
l'app) et D-032 (les deux pauses méridiennes ne coexistent jamais) — 2 problèmes de plus au
registre : R-090, R-091**)
**Commit de référence** : `b5cc9df` sur **`main`** — la session 13 part de là.
**Documentation uniquement — aucun fichier de l'application modifié**, aucun redéploiement requis.

> ✅ **Tout le travail décrit ci-dessous est dans `main`.** Une session qui démarre depuis `main`
> voit donc l'état réel du chantier. *(Ce n'était pas le cas au démarrage de la session 6, où une
> PR non fusionnée avait fait croire que le travail des sessions 4 et 5 n'existait pas — d'où
> cette ligne, désormais tenue à jour à chaque fin de session.)*

---

## 1. EN UNE PHRASE

🛡️ **LE CHANTIER CONFIANCE EST OUVERT — cybersécurité et juridique de l'existant.** Il est **hors du
plan d'audit** *(`PLAN.md` **§14**, décision **D-038**)*, et **C-015 est en pause**. **CF-0**
*(vérification des référentiels)*, **CF-1** *(le cadre documentaire)* et **CF-2** *(le dossier du
responsable du traitement — ⛔ **décision NON PRISE**)* sont **faits**. 🚧 **CF-4b
*(neutralisation institutionnelle)* est OUVERTE** : ✅ **ses 8 lots de code et de documentation sont
TERMINÉS** *(L1 → L8)*, ⛔ **mais elle N'EST PAS CLOSE** — il lui manque **le chantier M1**.
⚡ **CORRIGÉ le 2026-08-24 : cette phrase ajoutait qu'il manquait « le redéploiement de la part
BACKEND de L8 ».** Le relevé d'avant collage de M1-B a montré que **cette part était DÉJÀ en
service** *(bloc de tête)*. ⛔ **Sa date de mise en service reste inconnue.** ⏸️ **CF-4a** *(mentions légales)*
est **suspendue derrière elle**. **CF-3, CF-5 à CF-13 et CF-14 ne sont pas commencées.**

🏛️ **ET UN CHANTIER DE PLUS EST OUVERT DEPUIS LE 2026-08-24 : M1 — le profil du club**
*(`PLAN.md` **§15**)*. Il n'appartient ni au plan d'audit ni au chantier Confiance : il en **sort**,
puisque c'est lui qui permettra de clore CF-4b. 🏁 **Son étape M1-A est TERMINÉE et FUSIONNÉE dans
`main`** *(`9abaebc`, `b65a6b0`, `aff6d5f`)*. 🏁 **Son étape M1-B est TERMINÉE** — ses **sept
états** sont atteints *(`PLAN.md` **§15.8**)* : publiée côté frontend, backend redéployé *(Apps
Script v156)*, fusionnée dans `main`, et **vérifiée par une réinitialisation RÉELLE** le
2026-08-24.

⚡ **Cette ligne annonçait « NON publiée côté frontend, NON redéployée côté backend, et NON vérifiée
en réel ». C'était vrai le 2026-08-24 au matin, et FAUX dès la clôture réelle de M1-B le même
jour** — le bloc de tête le dit depuis, mais ce paragraphe-ci n'avait pas été relu. ⭐ **C'est
exactement le mécanisme de `CLAUDE.md` §8 septies** : un état écrit **avant** le geste, jamais relu
**après**.

🌐 🏁 **LE CHANTIER INTERMÉDIAIRE M1-PUB *(= M1-E7)* EST CLOS** *(`PLAN.md` **§15.3 bis**)* —
ouvert le 2026-08-24, clos le **2026-08-26**. ✅ **Ses CINQ micro-lots sont terminés** : **PUB-1**
*(doctrine)*, **PUB-2** *(accès autonome, vérifié en réel)*, **PUB-3** *(le plan)*, **PUB-4** *(le
découplage, prouvé des deux côtés)* et **PUB-5** *(le faux aperçu supprimé, validé visuellement par
Romain)*. ✅ **Les QUATRE conditions de son critère de clôture sont réunies.**
✅ **R-097 et R-098 sont CLOS** *(**D-055**)* · **D-056** a réécrit la condition ③.
▶️ **La suspension de M1-C1 est LEVÉE** — ⛔ **M1-C → M1-F ne démarrent pas automatiquement**, aucune
étape ne commence sans décision explicite de Romain.

> ⚡ *(Ce paragraphe a annoncé successivement : « ✅ PUB-1 terminé ; ⛔ PUB-2 → PUB-5 non commencés ;
> M1-PUB n'est pas terminé et R-097 reste OUVERT », puis « ✅ QUATRE de ses cinq micro-lots sont
> CLOS ; ⛔ PUB-5 reste NON COMMENCÉ, son premier point est M9 ; ⏸️ M1-C1 est SUSPENDUE jusqu'à la
> clôture complète de M1-PUB ». **Chacune était vraie à sa date.**)*

> ⚡ *(Ce paragraphe annonçait : « PUB-2 est fusionné et publié — **⛔ mais TOUJOURS PAS VÉRIFIÉ EN
> RÉEL** » · « **⛔ PUB-3, PUB-4 et PUB-5 non commencés** » · « **R-097 reste OUVERT** ». **Chacune
> de ces phrases était vraie à sa date** : PUB-2 a été vérifié en réel le 2026-08-26 *(et cette
> vérification a trouvé **R-098**)*, PUB-3 puis PUB-4 ont été menés le même jour. ⛔ **Seule la
> dernière phrase du paragraphe est restée vraie tout du long** : M1-PUB n'est pas terminé.)*
>
> ⚡ *(Et cette annotation-là est à son tour datée : elle a été écrite à la clôture de **PUB-4**, et
> son « M1-PUB n'est pas terminé » n'a tenu que jusqu'à la clôture de **PUB-5**, le même jour.
> ⭐ **Aucune phrase d'état ne reste vraie par nature — pas même celle qui corrige une autre.**)*

> ⚠️ **Cette ligne annonçait « PUB-2 est le prochain, NON COMMENCÉE ».** C'était vrai jusqu'à
> l'implémentation de PUB-2, le 2026-08-24. ⭐ **Relue et corrigée dans le même lot** — c'est
> précisément le paragraphe qui avait déjà décroché une fois *(voir l'encadré ci-dessus)*, et
> **§8 septies** demande de le relire **après** le geste, pas plus tard.

> ⚠️ **Cette ligne annonçait « 2 lots sur 8 », et c'était devenu faux.** Le chiffre datait du jour
> de l'ouverture de CF-4b ; les six lots suivants ont été livrés sans que la phrase d'en-tête soit
> relue. ⭐ **Corrigé le 2026-08-24** — et c'est exactement le mécanisme que **§8 quater** décrit :
> *un chiffre juste est recopié, la source bouge, la copie reste.*

> ⭐ **Ce que ce chantier prépare — et ce qu'il ne fait pas semblant de croire.** Maxilou est en
> **développement personnel**, sur **données fictives**, et **n'a jamais servi de tournoi réel**
> *(I-03, I-04)*. ⛔ **L'EDR du Racing Club de France et Génération R92 n'ont ni commandé, ni
> étudié, ni validé, ni adopté Maxilou.** Le chantier **prépare** une utilisation réelle **sans
> faire semblant qu'elle a commencé**.

*Ce qui restait vrai avant cette ouverture* : 🏁 **l'ÉTAPE 3 est terminée** — **C-012** et la
**remise à niveau documentaire** *(6 lots, hors plan d'audit — `PLAN.md` §13)* sont **tous deux clos
le 2026-08-19**.
⚡ **31 chantiers ont une fiche** (C-001 → **C-031**), et **les 93 problèmes du registre ont tous une
situation connue** — 90 dans un chantier, 3 explicitement écartés *(`PLAN.md` §12, tableau
vérifiable)*. C'était la condition posée par Romain : *« je préfère qu'on
ait la vision complète plutôt que commencer un chantier pour ensuite devoir repasser dessus »* —
**elle a été remplie.**

> ✅ **L'écart des deux problèmes sans rattachement est REFERMÉ le 2026-08-19** *(**D-037**)* :
> **R-092 rejoint C-015**, **R-093 devient le chantier C-031**. `PLAN.md` §12 est corrigé —
> l'ancienne phrase *« 91 sur 91 placés »* était devenue fausse.

L'ordre est établi de bout en bout, et la suite reste la **VALIDATION (ÉTAPE 4)**, chantier par
chantier — ⚠️ **mais le chantier ouvert aujourd'hui n'en fait pas partie** : le chantier Confiance
ne provient pas des huit domaines d'audit.

---

## 1 bis. CE QUI A MENÉ LÀ

> *Ce fichier doit rester court. Le détail de chaque étape vit dans `SESSIONS.md` ; la vue
> d'ensemble de l'audit dans `RAPPORT-AUDIT.md` ; les chantiers dans `PLAN.md`.*

| Quand | Ce qui s'est passé |
|---|---|
| Sessions **2 → 4** | **ÉTAPE 1 — cartographie.** Le projet est compris et décrit : 3 volets, **39 points d'attention** |
| Sessions **5 → 12** | **ÉTAPE 2 — audit des 8 domaines.** **88 problèmes**, 1 P0 *(corrigé et testé)*, 6 risques de méthode. Synthèse close : `RAPPORT-AUDIT.md` |
| Session **13** | **ÉTAPE 3, volet ①.** Les **6 dernières décisions tranchées**, plus aucune inconnue bloquante. ⚡ **D-030/031/032** entrent le même jour, et **3 problèmes hors audit** : R-089, R-090, R-091 |
| Session **14** | **ÉTAPE 3, volet ②** — 6 fiches **sans code** (C-005 → C-010). Correction : **2 des 6 touchent des fichiers source** |
| Sessions **15-16** | **ÉTAPE 3, volet ③** — 20 fiches **avec code** (C-011 → C-030), en 2 vagues, puis **la couverture prouvée** |
| **2026-08-06 → 08-11** | **ÉTAPES 4 et 5 ouvertes.** 6 chantiers validés **et livrés** : **C-011** et **C-013** *(testés chez Google)*, **C-005**, **C-006**, **C-007** *(documentaires)*, **C-008** *(commentaires)* |
| **2026-08-16 → 08-19** | 🏁 **C-012** — le **premier chantier à modifier vraiment du code** : 3 PR *(#187, #188, #189)*, redéploiement chez Google, **11 vérifications manuelles sur 12**. **R-042 → `TESTÉ`**, ⚠️ **avec réserve** |
| **2026-08-19** *(après-midi)* | ⚡ **Remise à niveau documentaire — 6 lots**, **hors plan d'audit**, ouverte par Romain. **D-034**, **D-035**, **D-036**. Détail : `PLAN.md` **§13** |

---

## 2. PHASES

| # | Phase | Statut |
|---|---|---|
| 0 | Mise en place du système de suivi | ✅ **TERMINÉE** (session 1) |
| 1 | **ÉTAPE 1 — Cartographie** (comprendre le projet, ne rien modifier) | ✅ **TERMINÉE** (sessions 2, 3 et 4) |
| 2 | **ÉTAPE 2 — Audit global** (8 domaines, P0→P3) | ✅ **TERMINÉE** (sessions 5 à 12) — A, C, B, D, E, F, G et **H** |
| 3 | **ÉTAPE 3 — Plan d'industrialisation priorisé** | ✅ **TERMINÉE** (sessions 13 → 16) — 30 chantiers alors, **91 problèmes placés sur les 91 connus**. ⚡ **Depuis le 2026-08-19 : 31 chantiers** (C-001 → **C-031**) et **93 problèmes, tous avec une situation connue** *(D-037)* |
| 4 | **ÉTAPE 4 — Validation par Romain** | 🚧 **EN COURS** — 🏁 **7 chantiers validés et clôturés** : C-011, C-013, C-005, C-006, C-007, C-008 et 🏁 **C-012** *(clos le 2026-08-19)* · ordre retenu : *« d'abord ce qui ne peut rien casser »* — **épuisé depuis C-008**, et **C-012 était le premier à en sortir** |
| 5 | **ÉTAPE 5 — Implémentation par petites unités** | 🚧 **EN COURS** — **3 chantiers TESTÉS chez Google** : C-011 (PR #181) · C-013 (PR #182) · 🏁 **C-012** (PR #187, #188, #189 — backend redéployé le 2026-08-18, **`R92 — 703/703 OK, 0 FAIL`**) · **3 chantiers documentaires livrés** : C-005, C-006, C-007 · **1 chantier de commentaires livré** : **C-008** *(fichiers source ouverts, **zéro ligne exécutable**)* |
| 6 | ÉTAPE 6 — Commits atomiques | ⬜ À faire |

> ⚡ **Deux chantiers ne figurent PAS dans ce tableau, et c'est volontaire** : la **remise à niveau
> documentaire** du 2026-08-19 *(6 lots, terminée — **`PLAN.md` §13**)* et 🛡️ le **chantier
> CONFIANCE** *(ouvert le 2026-08-19 — **`PLAN.md` §14**)*. **Aucun des deux n'est issu de
> l'audit**, et les y ranger laisserait croire le contraire.

---

## 3. PHASE TERMINÉE — L'ÉTAPE 2 (audit)

**Ordre validé par Romain** (décision D-010) : **A → C → B → D → E → F → G → H**.

| Domaine | Nom | Statut |
|---|---|---|
| **A** | **Métier / Product Owner** | ✅ **CLOS** (session 5) — 13 problèmes, 0 P0, 5 P1, 7 P2, 1 P3 · **toutes les décisions métier prises** |
| **C** | **Sécurité** | ✅ **CLOS** (session 6) — 14 problèmes, **1 P0**, 5 P1, 6 P2, 2 P3 · **1 décision en attente (D-016)** |
| **B** | **RGPD / Protection des données** | ✅ **CLOS** (session 7) — 13 problèmes, **0 P0**, 3 P1, 9 P2, 1 P3 · 3 décisions **reportées à l'ÉTAPE 3** (D-018, D-019, D-020 — voir **D-023**) |
| **D** | **QA / Tests** | ✅ **CLOS** (session 8) — 10 problèmes, **0 P0**, 4 P1, 5 P2, 1 P3 · **+ M-04** (une preuve du dossier était fausse) · aucune décision de Romain requise pour constater |
| **E** | **UX / UI / Accessibilité** | ✅ **CLOS** (session 9) — 10 problèmes, **0 P0**, 2 P1, 7 P2, 1 P3 · **I-05 levée** · écrans **réellement ouverts et mesurés** dans un navigateur · aucune décision de Romain requise pour constater |
| **F** | **Performance** | ✅ **CLOS** (session 10) — 11 problèmes, **0 P0**, 2 P1, 7 P2, 2 P3 · **2 inconnues ouvertes** (I-18, I-19) · **42 appels réels chronométrés**, poids transféré mesuré, **25 lectures simultanées** essayées · aucune décision de Romain requise pour constater |
| **G** | **Architecture / Maintenabilité** | ✅ **CLOS** (session 11) — 10 problèmes, **0 P0**, 2 P1, 7 P2, 1 P3 · **sa seule décision (D-028) est déjà tranchée** le jour même · **1 inconnue** (I-20), non bloquante · relevés faits **sur le code réel**, et les 2 suspects de l'analyse automatique **ouverts à la main** avant d'être écartés |
| **H** | **Qualité du code** | ✅ **CLOS** (session 12) — 7 problèmes, **0 P0, 0 P1**, 5 P2, 2 P3 · **aucune décision ouverte, aucune inconnue ajoutée** · **179 comparaisons serveur ↔ navigateur exécutées, 0 écart** — ce qui **répond à R-044** · **+ M-06** (trois chiffres du dossier étaient faux) |

> L'**ÉTAPE 1 (cartographie)** est terminée : volets A (session 2), B (session 3) et C (session 4),
> tous dans `CARTOGRAPHIE.md`. Elle a produit les **39 points d'attention** qui servent de matière
> première à l'audit.

---

## 4. PROCHAINE ÉTAPE

### 🧭 Où on en est **au 2026-08-19, nuit**

🛡️ **Le chantier CONFIANCE est ouvert**, et **C-015 est en pause** *(décision de Romain, **D-038**)*.

| Étape | Objet | État |
|---|---|---|
| **CF-0** | Vérification des référentiels **à leur source** | ✅ **TERMINÉE** — 18 sources primaires, **9 hypothèses corrigées**, 3 textes écartés |
| **CF-1** | Le cadre documentaire | ✅ **CLOSE** — commit **`2cb0b12`**, publié et vérifié |
| **CF-2** | Le responsable du traitement | ✅ **DOSSIER PRODUIT** — 📋 `CF-2-RESPONSABLE-TRAITEMENT.md`. ⛔ **La décision, elle, reste NON PRISE** |
| 🆕 **CF-4b** | **Neutralisation institutionnelle** | 🚧 **EN COURS.** ✅ **L0** *(préalable, `D-039`)* · ✅ **L1** *(`3375061`)* · ✅ **L6** *(`eac23ad`)* · ✅ **L2** *(`5bff881`)* · ✅ **L3** *(`6c04f10`)* · ✅ **L4** *(`4bf3e62` + `20cba62`)* · ✅ ⭐ **L5** — **les DEUX phases faites** : dépôt *(`5649f83`)* **et** redéploiement Google, ⭐ **prouvé par un email reçu** *(en-tête brut `From: "L'organisation du tournoi"`, 20/08/2026 17:08 UTC)*. ⚠️ **Une seule des 4 lignes exercée en réel** *(branche `MailApp`)* · ✅ **L7** — **26 points, 8 fichiers**, dont ⭐ la première phrase du `README.md` et **6 descriptions du bandeau de don devenu inexistant** · ✅ **L8** — ⚡ **CORRIGÉ le 2026-08-24 : cette case annonçait « patch appliqué, non commité »**, faux depuis le **2026-08-22**. L8 est **commité** *(`be57f97`)*, **poussé sur `origin/main`**, et sa **part frontend est PUBLIÉE** *(workflow Pages `success`, 2026-08-22 15:24:34 UTC)* : `perfs_mot_cle_club` *(nouvelle clé, garde-fous)* · `boutique_disponible` *(migration douce)* · `org_club_nom` sans défaut · témoin D-040 `API tournoi en ligne` · **715/715** mesuré. ⚡ **CORRIGÉ le 2026-08-24 : cette case annonçait « sa part BACKEND n'est PAS redéployée chez Google ».** Le relevé d'avant collage de M1-B l'a démentie — **elle était déjà en service** *(témoin `API tournoi en ligne` à 1 dans l'éditeur, et servi par l'URL publique)*. ⛔ **Date et geste de cette mise en service INCONNUS** — ⚠️ `be57f97` est le premier commit publié portant la chaîne, il ne date **pas** le collage chez Google · 🔧 **M1** *(6 étapes — `PLAN.md` §15)* en cours : **M1-A close**, **M1-B backend EN SERVICE** *(v156)* **et frontend PUBLIÉ** *(Pages `success` sur `8dfd28a`)* — ⛔ **mais NON vérifiée en réel** |
| 🆕 **CF-4a** | Mentions légales | ⏸️ **SUSPENDUE derrière CF-4b** — ⛔ aucune question abandonnée ; la praticabilité de **[R10] II** sur GitHub Pages reste **INDÉTERMINÉE**, et une demande écrite à GitHub est **prête, non envoyée** |
| **CF-3 · CF-5 → CF-13** | Le reste du chantier | ⬜ **NON lancées** — fiches en `PLAN.md` §14 |
| 🆕 **CF-14** | Adoption institutionnelle | ⬜ **INSCRITE, non rédigée** — le recueil des décisions d'une structure **si** elle souhaitait adopter le logiciel |

**La prochaine étape** est la **validation du diff L8 par Romain**, puis son commit et son **redéploiement chez Google** *(D-040)*. ⚠️ **C'est
le second lot du chantier qui exige un redéploiement chez Google**, et **D-040** y servira
directement : une preuve de version doit être **discriminante**. ⚡ **Son périmètre s'est élargi
pendant L7** — voir `PLAN.md` §CF-4b. ⚠️ **CF-4a**
*(mentions légales)* reste **le seul écart au regard d'un texte extérieur**, et **CF-3** reste
suspendue à la décision préparée par CF-2.

> ⚠️ **CF-2 ne bloque pas le reste** : **CF-7 à CF-13 n'ont aucune dépendance**, et **CF-4a, CF-5 et
> CF-6 se préparent avec l'organisation laissée entre crochets** — la forme déjà retenue par C-005.
> Le dossier CF-2 ne sera présenté aux structures **qu'au moment de la présentation de Maxilou** —
> ⛔ pas avant : **elles n'ont rien étudié**.

**Ce qui est mis en pause, et reste entier :**

| Orientation | État |
|---|---|
| **C-015 — les règles du jour J** *(porte **R-092**)* | ⏸️ **EN PAUSE** — conception **non commencée**. ⛔ Ni poursuivie, ni modifiée, ni anticipée |
| **C-031 — les colonnes du classeur** *(porte **R-093**)* | ⬜ **NON lancé** |

> ⛔ **Condition de démarrage inchangée** *(`CLAUDE.md` §12.3)* : **instruction explicite de
> Romain**.

> ⚡ **Un écart RÉEL et ACTUEL a été trouvé, et il n'en existe qu'un** : les **mentions légales**
> *(`PLAN.md` §14, **CF-4a**)*. ⭐ Il ne dépend d'**aucune** donnée personnelle — il naît de la seule
> publication d'un service en ligne, et les pages **sont publiées**. **Tous les autres sujets du
> chantier sont des prérequis avant une utilisation réelle qui n'a aucune date.**

### Ce qui n'appartient qu'à Romain, et qu'aucune session ne peut faire à sa place

**1. Remplacer les deux mots de passe par des suites aléatoires** — **D-017**. Menu du classeur
**« Tournoi R92 → Configurer les clés »**. Cinq minutes, aucune ligne de code, et R-019 redevient
un problème théorique. La vraie question à trancher n'est pas technique : **où ranger ces clés**,
et **comment transmettre celle des scores aux bénévoles le jour J**.

**2. ✅ FAIT le 2026-08-05 — recoller `Tests.gs` chez Google et relancer** (**I-17**). Romain a
collé le fichier et lancé `lancerTestsFFR` → **`R92 — 589/589 OK, 0 FAIL`**. Contrôle croisé sur
la capture fournie : la dernière ligne du fichier chez Google est la **3711**, et
`backend/Tests.gs` en compte exactement **3 711** — c'est bien la version du dépôt, au caractère
près. **M-04 est refermé**, et le statut TESTÉ de **R-014** retrouve une troisième preuve, cette
fois vraie.

**3. Poser les deux questions sortantes restantes** — **I-10** *(à la FFR, **élargie le
2026-08-05** : le sort d'un match non joué **et celui d'un tournoi entier interrompu ou annulé**)*
et **I-15** *(au club : le droit à l'image)*. Le délai de réponse ne dépend pas de nous, donc les
poser tôt ne coûte rien et peut faire gagner des semaines. Ce sont les seules exceptions à D-024,
avec D-017.

> ✅ **FAIT le 2026-08-05 — I-21 est LEVÉE**, et c'est la réponse la plus favorable possible : **la
> reprise avec adaptation du format et de la durée est AUTORISÉE**, sous deux réserves — ⛔ le
> **temps de jeu maximal** et ⛔ **aucune phase finale**. **Le niveau 2 de D-030 est débloqué**, et
> sa fiche de chantier est écrite (**`PLAN.md` C-003**).

**4. ✅ FAIT le 2026-08-05 — I-18 levée.** Romain a fourni **trois pages** du journal
« Exécutions ». **128 exécutions réelles analysées, 100 % « Terminée », aucun échec.** Le
résultat n'est pas celui qu'on espérait : une lecture occupe le serveur **1,65 s** — alors que
`ping`, qui n'exécute **rien**, en occupe déjà **1,59 s**. Le cache est donc **excellent**
(+0,06 s pour servir tout le tournoi), mais **~1,6 s de démarrage par appel est incompressible**.
**Capacité : 150 à 300 spectateurs, pas 1 300.** Détail complet en `AUDIT.md` **§F.9**.

**5. 🏉 LA question, et toi seul peux y répondre** : **combien de spectateurs viennent
réellement ?** (**I-19**). Le chiffre de **1 300** est écrit dans `docs/relais-cdn.md`, **sans
source**. Depuis que I-18 est levée, **c'est la seule question qui décide** : sous ~150 personnes,
on ne touche à rien ; au-delà, il faut allonger le rafraîchissement (gratuit, double la capacité)
et probablement allumer le relais (**R-061**). Ce n'est pas une question technique : c'est ta
connaissance du terrain.

**6. Deux vérifications de cinq minutes, qui ne concernent que des P2** — **I-08** (mettre une image
à la corbeille du Drive, puis rouvrir son lien en navigation privée : reste-t-elle visible ?) et
**I-09** (l'éditeur Apps Script → « Exécutions » : que garde ce journal, et combien de temps ?).
Elles ferment **R-035**, **R-023** et **R-039**.

**7. ✅ FAIT le 2026-08-05 — les six décisions en attente sont TRANCHÉES** *(session 13, volet ① de
l'ÉTAPE 3)*. Le registre des décisions en attente est **vide**. Ce qu'elles engagent :

| Réf | Ce qui a été décidé | Ce que ça débloque |
|---|---|---|
| **D-025** | **Lot ① seul : les 5 tests du barème et du départage — et ils passent AVANT la correction du départage** | **R-041**, et la contrainte d'ordre la plus importante du chantier |
| **D-020** | **Le tableau des 7 durées de conservation est adopté tel quel** ⚠️ aucun effacement automatique : toute suppression reste déclenchée par un humain | **R-030** (P1), R-031, R-033, R-034 — **9 problèmes** en ordre de marche |
| **D-018** | **Oui** — je rédige les trois textes, dont une **section « Tournoi »** pour la page RGPD **qui existe déjà** sur le site vitrine | **R-028** (P1), R-038 |
| **D-019** | **Voie (a)** : informer, sans bandeau, avec un moyen de dire non | **R-029** (P1) — reste **suspendu** tant que les partenaires sont éteints |
| **D-005** | **Périmètre fermé à `tournoi-r92`** : ce qui est vu ailleurs est **signalé**, jamais corrigé à l'aveugle | **I-16**, et 4 constats inscrits (V-01 → V-04) |
| **D-009** | **D-006 conservé** : la documentation va sur `main` ; une branche imposée y est ramenée avant la fin de session | Rien de fonctionnel — une règle de méthode |

> ⚡ **Ce qui a débloqué D-018, et ça n'a coûté qu'une lecture de page publique.** Les deux
> informations qui manquaient depuis la session 7 — **qui est responsable** et **quelle adresse de
> contact** — sont écrites en clair sur le site vitrine : **Génération R92, association loi 1901**,
> **generationr92@gmail.com**, directeur de la publication **Jérémy Jost**. C'est **I-16 levée**, et
> c'est aussi la réponse à l'essentiel de **I-14**.
>
> ⚠️ **Avec une réserve datée** : l'association est déclarée *« déclaration **en cours** »*, siège
> et numéro RNA *« à définir »*. Une association non déclarée n'a pas d'existence juridique propre :
> **aujourd'hui, c'est Romain qui porte ces données**, comme **D-021** l'avait constaté. Aucune
> conformité juridique n'est prononcée — c'est un **écart de fait**, à corriger quand la déclaration
> aboutira.

### ✅ FAIT — session 14 : **ÉTAPE 3, volet ②** — 6 fiches écrites *(`PLAN.md` §7)*

**Les volets ① et ② sont finis.** Les inconnues sont triées, les décisions sont tranchées, et
**six chantiers ont désormais une fiche complète** : problème, bénéfice, risque, fichiers,
dépendances, comment on prouve que c'est fait.

| Fiche | Chantier | Problèmes | Touche du code ? |
|---|---|---|---|
| **C-005** | 📣 **Les trois textes d'information** | **R-028** (P1), R-038 | ❌ non |
| **C-006** | 🗑️ **La politique de conservation**, écrite là où on la lira | **R-030** (P1), R-031, R-033, R-034 | ❌ non |
| **C-007** | 📄 **Remettre le projet en face de lui-même** | **R-073** (P1), **R-072** *(reliquat)*, R-024 | ❌ non |
| **C-008** | 📝 **Les commentaires qui disent le contraire du code** | R-083 *(6 cas)* | ⚠️ **oui** — fichiers source, 0 ligne exécutable |
| **C-009** | 🧹 **Le code mort qui affirme servir** | R-084, R-087 | ⚠️ **oui** — des lignes supprimées |
| **C-010** | 🏉 **Le barème et le départage pour les clubs** | R-012 | ⚠️ **moitié ① non · moitié ② oui** |

> ⚠️ **Une correction apportée par ce volet, et elle change la route de deux chantiers.** Le volet ②
> avait été annoncé comme *« cinq lots qui ne touchent aucune ligne exécutable »*. **C'est faux pour
> deux d'entre eux** : effacer un commentaire faux et supprimer du code mort, **ce sont des fichiers
> source qu'on ouvre**. Le comportement ne change pas, mais **D-006 impose alors branche + PR**, pas
> un commit direct sur `main`.

> ✅ **Une bonne nouvelle vérifiée dans les fichiers** : **la partie dangereuse de R-072 est déjà
> corrigée.** `docs/deploiement.md` nomme bien les **deux** fichiers du serveur et donne les **deux
> nombres de contrôle** (589 et 3711) — c'était **le mécanisme exact de M-04**, et il est refermé
> *(D-029, session 11)*. Le reliquat *(`passation.md`, deux `README`)* est du **confort**, plus un
> piège.

> 💡 **Quatre chantiers ne dépendent de rien** — **C-005**, **C-006**, **C-007** et la **moitié ①
> de C-010** peuvent commencer **dès que tu les valides**, sans attendre une ligne de code. **Deux
> d'entre eux referment des P1.**

### 🏁 L'ÉTAPE 3 EST TERMINÉE — sessions 13 à 16

**30 chantiers avaient une fiche** (C-001 → C-030) et **les 91 problèmes connus alors étaient tous
placés** — état **au 2026-08-06**, à la clôture de l'ÉTAPE 3 :

| | |
|---|---|
| Placés dans un chantier | **88** |
| Explicitement écartés, avec la raison écrite | **3** — R-011, R-019 *(= l'action D-017)*, R-040 |
| **Sans place** | ✅ **0** *(à cette date)* |

> ⚠️ **Ce tableau décrit le 2026-08-06, pas aujourd'hui** : **R-092** et **R-093** sont entrés après,
> et ont reçu leur rattachement le **2026-08-19** *(D-037)* — le plan compte désormais **31
> chantiers** et **93 problèmes**. **Voir §1.**

> 🎯 **C'était la condition posée par Romain** : *« je préfère qu'on ait la vision complète plutôt
> que commencer un chantier pour ensuite devoir repasser dessus parce qu'une session ultérieure
> devra ajouter, supprimer ou modifier quelque chose sur lequel on a décidé de travailler trop
> tôt. »* **Le tableau de `PLAN.md` §12 est la preuve que c'est rempli** — et il a été produit en
> relisant les fiches, pas de mémoire.

**Les six chantiers les moins risqués, pour situer** :

| Chantier | Risque | Referme |
|---|---|---|
| **C-011** les tests du barème et du départage | ⚪ **nul** — aucune ligne de l'application | **R-041** (P1) |
| **C-024** le miroir qui se vérifie tout seul | ⚪ **nul** | **R-044** (P1) |
| **C-029** savoir quelle version tourne | ⚪ **nul** | R-075 |
| **C-005 · C-006 · C-007** documentation pure | ⚪ **nul** | **R-028, R-030, R-073** (3 P1) |
| **C-013** un contrôle avant publication | 🟢 très faible | **R-043** (P1) |
| **C-022** l'interface sur le terrain | 🟢 faible | R-054 → R-060 |

### 🔜 Puis : l'**ÉTAPE 4 — LA VALIDATION**

L'étape suivante n'est plus une étape d'écriture. C'est **la tienne** : accepter, refuser ou
réordonner les chantiers, **un par un**. Rien ne sera touché dans l'application avant.

> 💡 **Ma recommandation sur la façon de valider** : **ne les prends pas dans l'ordre du
> numéro.** Commence par **ce qui ne peut rien casser** *(C-011, C-013, C-005, C-006, C-007)* — six
> P1 y sont refermés, et **aucun ne touche au comportement de l'application**. Le premier chantier
> qui modifie vraiment quelque chose serait alors **C-012**, et il sera déjà protégé par les tests
> de C-011.

**Trois questions t'attendent à l'ÉTAPE 4**, inscrites dans les fiches :

1. **C-009** — la colonne `pause_echelonnee` par catégorie est morte, mais **D-032 vient de rendre
   le sujet vivant** : faut-il la **supprimer** ou la **brancher** ?
2. **C-020** — *savoir qui a fait quoi* : jusqu'où va-t-on ? Une trace nominative ? De vrais
   comptes ? Un simple prénom saisi ? **Ce chantier change la façon dont tout le monde se connecte
   le jour J** ;
3. **C-003** — les cinq points ouverts de **D-030 §5** *(le Super Challenge, la pause méridienne,
   la « dé-annulation », le classement partiel, le tournoi suspendu qui ne reprend jamais)*.

**Condition de démarrage** : instruction explicite de Romain.

---

## 5. CORRECTIONS DÉJÀ RÉALISÉES DANS CE CADRE

**Sept livrés** — le P0 de sécurité *(session 6)*, puis **six chantiers** validés et livrés :
deux avec preuve d'exécution chez Google *(C-011, C-013)*, **trois purement documentaires**
*(C-005, C-006 le 2026-08-06 ; C-007 le 2026-08-09)*, et **un qui ouvre des fichiers source sans
toucher une ligne exécutable** *(**C-008**, le 2026-08-11)*.

🏁 ⭐ **Et un huitième TERMINÉ, le premier à avoir vraiment modifié du code : C-012** *(clos le 2026-08-19)* — **R-042 est `TESTÉ`**, avec la réserve **V-12 / N-3**.
Il figure dans le tableau ci-dessous avec son état réel — **les 3 étapes de code sont fusionnées, le
backend est redéployé chez Google** *(étape 4 ✅)*, et 🏁 **son étape 5 est CLOSE : 11 des 12
vérifications manuelles sont réussies** *(2026-08-19)*, la douzième restant 🟠 **non concluante** :

| Chantier | Ce qu'il referme | Statut |
|---|---|---|
| **C-011** — les tests du barème et du départage | **R-041** (P1) | ✅ **TESTÉ** — `R92 — 616/616 OK, 0 FAIL` **chez Google**, PR #181 fusionnée |
| **C-013** — un contrôle de syntaxe avant publication | **R-043** (P1) *moitié (a)*, R-049, R-050 | ✅ **TESTÉ** — contrôle **prouvé**, chaînage `needs` **observé** sur un déploiement réel, PR #182 fusionnée |
| **C-005** — les trois textes d'information | **R-028** (P1), R-038 | 🏁 **Travail documentaire TERMINÉ** — `docs/textes-information-donnees.md`. ⚠️ **R-028 reste OUVERT : rien n'est en ligne** |
| **C-006** — la politique de conservation | **R-030** (P1), R-031, R-033, R-034 | 🏁 **Travail documentaire TERMINÉ** — `docs/conservation-donnees.md`, **5 gestes sur 7 vérifiés dans le code**. ⚠️ **R-030 *(part outillage)*, R-031 et R-033 restent OUVERTS** |
| **C-007** — remettre la carte du projet en face du projet | **R-073** (P1), **R-072** (P1, reliquat), R-024 | 🏁 **LIVRÉ le 2026-08-09 — les 3 problèmes sont REFERMÉS.** `docs/architecture.md` réécrit, `docs/dependances-externes.md` créé, `README.md` / `backend/README.md` / `passation.md` corrigés. **Vérification automatique : 65/65 actions, 26/26 fichiers, 8/8 pages, 12/12 onglets, 4/4 bibliothèques** |
| 🏁 ⭐ **C-012** — séparer le cœur de la saisie du score de son écriture | **R-042** (P1) — ✅ ⭐ **`TESTÉ` le 2026-08-19, AVEC RÉSERVE** | 🏁 **TERMINÉ — 5 étapes sur 5.** 📐 Conception **VALIDÉE** *(PR #186)*. ✅ **Étape 1** *(PR #187)* : `litSaisieScore` + **T-1 à T-5**. ✅ **Étape 2** *(PR #188)* : `cascadeAVerifier` + **T-14**. ✅ **Étape 3** *(PR #189)* : `deciderEnregistrementScore` et **les 6 garde-fous** + **T-6 à T-13, T-15 à T-17** — `enregistrerScore` passe de **111 à 50 lignes**. ✅ **Étape 4** *(2026-08-18)* : backend **REDÉPLOYÉ chez Google**, ⭐ **`R92 — 703/703 OK, 0 FAIL`**. 🏁 ⭐ **Étape 5 CLOSE le 2026-08-19 — 11 vérifications sur 12** : ✅ V-1 à V-11 *(V-11 avec réserve)*, dont ⭐ **V-7, V-8 et V-10** — cette dernière **dans ses DEUX branches**, « Annuler » comme « Modifier quand même ». **5 des 6 risques de non-régression écartés**, dont ⭐ **N-6 (« le mauvais vainqueur propagé »)** et **N-5**. ⚠️ 🟠 **V-12 / N-3 reste NON CONCLUANTE — réserve conservée** *(D-C012-5)*. ⚡ **Ce qui bloquait V-7/V-8/V-10 était une croyance fausse** : `COUPE_PLATEAU` **masqué**, jamais supprimé *(`21a4f2b`, aucun fichier backend touché)* ; et ⭐ **aucune des 5 fonctions du mécanisme n'est couverte par les 703 tests**. ✅ **Routage production rétabli et vérifié** · ✅ **production non contaminée**. ⚡ A fait entrer **R-092** et **R-093** au registre — **tous deux NON CORRIGÉS**. Détail : **§8 quater** de la spécification |
| **C-008** — les commentaires qui disaient le contraire du code | **R-083** *(6 cas)* | 🏁 **LIVRÉ le 2026-08-11 — R-083 est REFERMÉ.** Les 6 commentaires réécrits *(5 dans `Code.gs`, 1 dans `admin-reglages.js`)* + **la règle posée : `CLAUDE.md` §8 ter**. **Preuve : les fichiers, commentaires retirés, sont identiques au caractère près** *(`diff` vide — 5 816 et 565 lignes de code)*. ✅ **Parvenu chez Google le 2026-08-18** : ce « prochain redéploiement utile » a eu lieu — c'est l'**étape 4 de C-012**, qui a recollé `Code.gs`. L'éditeur Apps Script ne contient plus les anciennes phrases |

> ⚡ **Et un travail de plus, qui n'est PAS un chantier de ce tableau : la remise à niveau
> documentaire du 2026-08-19.** 🏁 **Terminée en 6 lots.** Elle n'a pas de numéro `C-0XX` parce
> qu'elle **ne vient pas de l'audit** : Romain l'a ouverte hors plan, après C-012. Ce qu'elle a
> fait, en une ligne : **la documentation active affirme de nouveau ce que le dépôt contient.**
>
> **Détail des 6 lots, critères de fin et preuves : `PLAN.md` §13** · **historique : `SESSIONS.md`**
> · **décisions : `DECISIONS.md` D-034 à D-036.**
>
> ⛔ **Ce que « terminé » ne veut pas dire** : ni que le projet soit parfait, ni que les risques
> d'industrialisation soient résolus — **R-075**, **R-092** et **R-093** restent **ouverts au
> registre**.

> ⚠️ **Ce que C-005 et C-006 ne referment pas, et pourquoi c'est écrit ici.** Ces deux chantiers
> **produisent des textes** ; ils ne changent **rien** au comportement de l'application. Un texte
> d'information que personne ne peut lire n'informe personne, et une durée de conservation écrite
> n'efface rien toute seule. **Validation de Romain, mot pour mot** : *« clôturer C-006 côté travail
> documentaire […] sans fermer les problèmes du registre qui dépendent encore d'un changement de
> comportement »*.
>
> ⛔ **Deux constats à conserver pour les futurs chantiers de code** *(demande expresse de Romain)* :
> **1.** la **réinitialisation n'efface PAS** les contacts de la demande fédérale — représentant,
> président, **médecin**, secours : la règle décidée (**D-020**) et le code **divergent** ;
> **2.** **`detail_effectifs` et `nb_educateurs_total` ne sont effacés par RIEN**, et ils sont
> **lus** par le calcul des effectifs.
>
> ❓ **Une lacune de plan signalée, non comblée d'office** : le tableau de couverture (`PLAN.md` §12)
> place R-030, R-031 et R-033 dans C-006 — **vrai pour la documentation, faux pour la correction**.
> **Il manque la fiche du chantier de code qui corrigera l'effacement.** Ajouter un chantier au plan
> appartient à Romain : **question ouverte à l'ÉTAPE 4**.

> 🏉 **Ce que ces deux chantiers ont en commun, et pourquoi ils ont été faits en premier** : **ni
> l'un ni l'autre ne change une seule ligne du comportement de l'application.** L'un ajoute des
> tests, l'autre ajoute un garde-fou avant la publication. **Deux P1 refermés sans qu'un bénévole ne
> voie la moindre différence le jour J.**

---

### Le premier — R-014, le P0 de sécurité *(session 6, commit `c1948fc`, exception validée D-016)*.

| Ce qui a changé | Où | État |
|---|---|---|
| Trois plafonds sur `mesureSponsors`, la seule écriture ouverte sans mot de passe : un plafond **dur** sur la taille de l'onglet des relevés, et deux plafonds de **débit** (global et par appareil) vérifiés **avant** d'ouvrir le classeur | `backend/Code.gs` | ✅ **En service** |
| 9 tests ajoutés (16 vérifications) | `backend/Tests.gs` | ✅ **Passent chez Google** |
| Le diagnostic « Tester la remontée » dit désormais qu'un plafond est atteint, au lieu d'annoncer une écriture réussie suivie d'une relecture introuvable | `frontend/js/admin-sponsors.js` | ✅ **En ligne** |

**✅ Statut : TESTÉ** *(2026-08-04)* — **le premier problème du chantier à l'atteindre**, mais
**une de ses trois preuves est tombée en session 8** (voir l'encadré juste après). Les trois
preuves, telles qu'inscrites au départ :

1. **le backend a été redéployé** chez Google → lève **I-13** ;
2. ~~**573 tests sur 573 passent**~~ → ❌ **preuve annulée en session 8** (573 = le compte du
   fichier ***avant*** la correction) → ✅ **REMPLACÉE LE MÊME JOUR, ET CETTE FOIS ELLE EST
   VRAIE** : Romain a recollé `Tests.gs` chez Google et relancé `lancerTestsFFR` →
   **`R92 — 589/589 OK, 0 FAIL`**. Les 16 vérifications de R-014 ont donc bien tourné **chez
   Google**. **I-17 levée**, **M-04 refermé** ;
3. **la chaîne fonctionne toujours de bout en bout** : écriture ✅, relecture ✅, et **109 relevés**
   présents dans le classeur. C'est la **preuve de non-régression** qui manquait — le plafonnement
   n'a rien cassé.
   > ⚠️ **Corrigé le 2026-08-05** : ces 109 relevés viennent des **propres appareils de Romain**
   > (essais depuis plusieurs appareils, pour vérifier que la remontée ne partait pas du seul
   > navigateur de son ordinateur) — **pas de spectateurs**, comme l'écrivait la version
   > précédente de ce document. **La preuve de non-régression tient entièrement** : des relevés
   > ont bien été écrits puis relus. Seule l'origine était fausse.

> ✅ **La preuve a été refaite, correctement, le 2026-08-05** — **`589/589 OK, 0 FAIL`** dans Apps
> Script. Deux contrôles croisés sur la capture fournie par Romain : le **nombre** (589 = le
> compte du fichier *après* la correction) et la **dernière ligne du fichier** (3711, exactement
> le nombre de lignes de `backend/Tests.gs`). C'est bien la bonne version qui a tourné.
>
> ⚠️ **Ce que ce résultat prouve — et ce qu'il ne prouve pas.** Les tests s'exécutent dans
> l'**éditeur** Apps Script, donc contre le `Code.gs` **enregistré dans le projet**. Ils prouvent
> que **ce** code passe les 589 vérifications, R-014 comprise. Ils ne prouvent pas à eux seuls que
> l'**adresse web publique** sert cette version : Apps Script permet de figer un déploiement sur
> une ancienne version. **M-02 est donc fortement réduit, pas supprimé** — et la vérification qui
> le supprimerait est celle qui existe déjà : le bouton « Tester la remontée » de l'écran
> Partenaires, qui interroge, lui, la vraie adresse publique.

> ⚠️ **Ce qui reste NON VÉRIFIÉ, et le restera** : le chemin de **refus** — ce qui se passe une
> fois un plafond franchi — n'est prouvé que par les tests. Personne n'a envoyé 30 001 relevés
> pour l'observer en vrai, et personne ne le fera. Le bouton de diagnostic ne peut pas non plus
> l'atteindre : il tire un identifiant d'appareil neuf à chaque essai, donc il ne se bloque jamais
> lui-même — c'est voulu.

> ⚠️ Le projet a une longue histoire de corrections **antérieures** à ce cadre (voir `CHANGELOG.md`
> et l'historique Git). Elles ne sont **pas** considérées comme vérifiées par ce chantier tant que
> l'audit ne les a pas reprises.

---

## 6. PROBLÈMES RESTANT À TRAITER

**93 problèmes au registre** (R-001 → R-093) — voir **`RISQUES.md`** pour **l'état de chacun**, et
`AUDIT.md` pour l'explication.

> 📌 **Le décompte par statut n'est PAS recopié ici** *(`CLAUDE.md` §8 quater)* : il change à
> chaque chantier. **`RISQUES.md` est la seule adresse.** ⚠️ **93 n'est pas 88** : **88** est le
> résultat de **l'audit** *(figé)*, **93** l'état du **registre de suivi**, qui continue de vivre.

> ⚡ **Le second problème refermé — après le P0 de sécurité, et à sa date — est R-083** *(C-008,
> 2026-08-11)* — les commentaires qui annonçaient
> l'inverse du code. C'est le **premier problème refermé dans des fichiers source** depuis le P0 de
> sécurité. ✅ **Et il est désormais refermé chez Google aussi** *(2026-08-18)* : le redéploiement de
> l'**étape 4 de C-012** a recollé `Code.gs`, donc l'éditeur Apps Script ne contient plus les
> anciennes phrases. *(Cette ligne annonçait le contraire jusqu'au 2026-08-19 : elle datait d'avant
> le redéploiement, et `§5` disait déjà l'inverse dans le même fichier.)*
>
> 🚨 **UN SUJET EN ATTENTE DE TA DÉCISION, trouvé pendant C-008 et NON corrigé** *(2026-08-11)* :
> **la pause échelonnée et le Super Challenge se marchent dessus.** Dans `calculerPlanning`, la
> branche de la pause échelonnée **sort de la fonction avant** le regroupement Super Challenge, et
> **aucune garde ne l'en empêche**. Une catégorie U14 en SCF, pause échelonnée globale cochée et
> ≥ 4 équipes, serait donc planifiée **ni en triangulaires, ni en 2×15/2×11** — alors que l'écran
> annonce ces temps. **Statut : PROBABLE** *(lu dans le code, jamais exécuté)*. Il touche **C-004**
> et **C-023**. **Faut-il l'inscrire au registre ?** → détail en `SESSIONS.md`, section C-008 §5.

> ⚡ **88 ou 89 ? Les deux chiffres sont vrais, et ils ne disent pas la même chose.**
> **88** = ce que **l'audit** a trouvé. Ce chiffre ne bougera plus : c'est celui de
> `RAPPORT-AUDIT.md`, et l'ÉTAPE 2 est close.
> **89** = l'état du **registre de suivi**, qui continue de vivre. **R-089** — le tournoi suspendu
> ou annulé — n'a été trouvé par **aucun domaine** : il a été **apporté par Romain** le 2026-08-05,
> après la clôture (**D-030**). Le distinguer n'est pas de la comptabilité : c'est éviter de
> laisser croire que l'audit avait vu ce qu'il n'a pas vu — l'erreur que **M-06** cherche à
> empêcher. C'est aussi la démonstration de **M-05** : *l'audit photographie une application qui
> bouge*, et son **périmètre fonctionnel** bouge aussi.

| Priorité | Total | Domaine A (métier) | Domaine C (sécurité) | Domaine B (données) | Domaine D (tests) | Domaine E (expérience) | Domaine F (performance) | Domaine G (architecture) | Domaine H (qualité du code) |
|---|---|---|---|---|---|---|---|---|---|
| **P0** | **1** | — | ✅ **R-014** porte ouverte sans limite — **TESTÉ, en service** *(une preuve remplacée, voir §5)* | — | — | — | — | — | — |
| **P1** | **24** | R-001 forfait ✅ · R-002 blocage après-midi · R-003 planning figé ✅ · R-004 départage ✅ · R-005 score aberrant ✅ · ⚡ **R-089 tournoi suspendu / annulé** ✅ *(hors audit — D-030)* | R-015 scores effacés · R-016 réinitialisation · R-017 mots de passe partagés · R-018 liens des clubs · **R-019 clés devinables** *(monté de P2)* | R-028 personne n'est informé · **R-029 mesure des spectateurs** *(SUSPENDU — partenaires désactivés le 2026-08-05)* · R-030 rien ne s'efface | **R-041 classement/départage non testés** · **R-042 saisie du score non testée** · **R-043 le navigateur part en ligne sans contrôle** · **R-044 règles écrites en double** *(⚠️ **requalifié par le domaine H** : les deux copies sont d'accord — 179 comparaisons, 0 écart. Dette à surveiller, plus défaut possible)* | **R-051 « Rafraîchir » échoue en silence** · **R-052 « Failed to fetch » affiché au bénévole** | **R-061 le relais anti-affluence est éteint** · **R-062 le cache s'éteint tout seul vers 165 matchs** | **R-072 la procédure de redéploiement décrit la moitié du geste** *(le mécanisme même de M-04)* · **R-073 la carte du projet décrit une autre application** | **aucun** |
| **P2** | 55 | R-006 → R-010 · **R-012** ✅ · **R-013** ✅ | R-020 → R-025 | R-031 → R-039 | R-045 → R-049 | R-053 → R-059 | R-063 → R-069 | R-074 → R-080 | R-082 · ✅ **R-083 CORRIGÉ** *(C-008)* · R-084 → R-086 |
| **P3** | 11 | R-011 | R-026 · R-027 | R-040 | R-050 | R-060 | R-070 · R-071 | R-081 | R-087 · R-088 |

**Risques de méthode** : M-01 · M-02 · M-03 *(largement levé en session 8)* · M-04 *(traité en
session 8 — un compte de tests ne dit pas quelle version a été exécutée)* · **M-05** *(session 11 —
l'audit photographie une application qui continue de bouger)* · ⚡ **M-06** *(nouveau, session 12 —
**les chiffres de l'audit ne portent pas leur méthode de mesure**, et trois d'entre eux étaient
faux)*.

> ⚡ **M-05, et pourquoi il compte plus qu'il n'en a l'air.** Le cadre est écrit comme si
> l'application était **stable** pendant qu'on l'audite. Elle ne l'est pas, et **elle ne doit pas
> l'être** : *« c'est une phase de pré-industrialisation, pas une fermeture totale des
> fonctionnalités »* (Romain, 2026-08-05). Le chantier fonctionnalités en est à sa **session 28**,
> déployée la **veille** du démarrage de celui-ci.
>
> **Ce que ça ne change pas** : l'audit reste valable. Un problème constaté ne devient pas faux
> parce qu'on ajoute du code après — il devient **plus grand**.
>
> **Ce que ça change** : six problèmes **grossissent tout seuls** (R-073, R-074, R-076, R-078,
> R-044, R-079), et **un se REDÉCLENCHE** — **R-072** : chaque fonctionnalité serveur est un
> redéploiement, donc **un nouveau tirage du piège de M-04**. → **D-029**.

✅ = la **règle métier est décidée**, le **code n'est pas écrit**. R-002 et R-006 → R-010
n'appelaient aucune décision de Romain : ce sont des choix techniques, réglés à l'ÉTAPE 3.
**Aucun problème du domaine C n'est encore tranché** — seul D-016 (quand corriger le P0) est posé.

**Le fil rouge du domaine A** : l'application est excellente **avant** le coup d'envoi et rigide
**après**. Les 5 P1 apparaissent tous le jour J, quand la réalité s'écarte du plan — forfait,
match non saisi, terrain impraticable, égalité parfaite, faute de frappe.

**Le fil rouge du domaine C**, en deux phrases :

1. **Il n'y a pas de personnes, seulement des mots de passe partagés.** Sept des quatorze
   problèmes en découlent : on ne peut retirer l'accès à personne, on ne sait jamais qui a fait
   quoi, et une contestation de score est inarbitrable.
2. **Les protections sont au bon endroit — sauf les trois plus destructrices.** Le gel des
   réponses à J-16, le refus de réorganiser les poules, la revalidation des relevés : tous tenus
   par le serveur, donc incontournables. Mais effacer tous les scores, tout réinitialiser, et
   limiter la seule porte ouverte : **tenus par personne, ou par la seule page web.**

**Le fil rouge du domaine B**, en deux phrases :

1. **La collecte est exemplaire ; le silence ne l'est pas.** L'application ne demande presque
   rien et **n'identifie aucun enfant** — pas un nom, pas une date de naissance, pas une licence.
   Mais elle ne dit **rien à personne** : ni au contact d'un club dont elle garde l'adresse d'une
   édition à l'autre, ni au spectateur dont le téléphone compte des logos de partenaires.
2. **Rien ne s'efface, et personne ne l'a décidé.** L'absence de durée de conservation n'est pas
   un choix contestable : c'est un **choix qui n'a jamais été fait**. Neuf des treize problèmes
   du domaine disparaissent le jour où ces durées sont écrites — et les écrire ne demande
   **aucune ligne de code**.

**Le fil rouge du domaine D**, en deux phrases :

1. **On teste ce qui a été construit récemment, pas ce qui compte depuis le début.** Le harnais
   suit fidèlement le chantier FFR — conformité, invitations, feuille de report, Super Challenge —
   c'est-à-dire tout ce qui se passe **avant** le tournoi. Le classement, le départage et la saisie
   des scores sont le **cœur historique** : ils marchent depuis si longtemps que personne n'a
   jamais éprouvé le besoin de les protéger. **Ce sont précisément ceux que l'ÉTAPE 5 va
   modifier** (D-011, D-012, D-014, D-015).
2. **L'obstacle n'était pas là où on le croyait.** On pensait les tests prisonniers de Google
   (M-03) : ils tournent ici en une seconde. On croyait le harnais trop petit : il fait 589
   vérifications. Le vrai manque n'est ni technique ni quantitatif — **c'est que rien ne vérifie
   les deux gestes qui décident du classement d'un tournoi.**

**Le fil rouge du domaine E**, en deux phrases :

1. **L'application sait déjà tout faire bien — elle ne l'a pas fait partout.** Les 44 pixels de
   cible tactile, le bouton qui annonce sa progression, la confirmation qui nomme ce qu'elle va
   détruire, l'anti-cache mobile : tout cela **existe dans ce projet**, écrit par la même main,
   souvent avec le commentaire qui explique pourquoi. Ces bons réflexes sont sur les écrans
   **construits récemment**. Les écrans **les plus anciens et les plus utilisés** — la saisie
   simple, la page publique — sont restés en arrière. Il y a peu à **inventer**, beaucoup à
   **propager**.
2. **Le seul vrai défaut de conception est le silence.** La page de saisie ne dit pas qu'elle
   travaille, ne dit pas qu'elle a échoué, et — le plus grave — peut affirmer qu'elle est à jour
   quand elle ne l'est pas. Rendre l'interface *« difficile à utiliser incorrectement »*, ici, ce
   n'est pas la redessiner : **c'est la faire parler**.

> ✅ **Ce que le domaine E a montré de bon** : les contrastes de la page de saisie sont
> **excellents** (de **9,6 à 21** pour 4,5 exigé) ; l'administration mesure **578 textes conformes
> sur 603** (96 %) et **208 cibles cliquables sur 212** au-dessus du seuil ; la saisie détaillée
> U14 est **exemplaire** (boutons de **44 × 44 px**, total en points **calculé et affiché en
> grand**) ; l'administration porte **28 confirmations**, dont deux qui **nomment le nombre exact
> de scores** qui seront effacés **et exigent la re-saisie du mot de passe** ; le **double-clic est
> bloqué** ; une saisie en cours de frappe **n'est jamais écrasée** ; corriger un score validé
> **redemande le mot de passe** ; corriger un score du matin après génération de l'après-midi
> **avertit et donne le remède** ; **aucun débordement horizontal jusqu'à 320 px** ; et les bases
> de l'accessibilité sont là (`lang="fr"`, un seul `h1`, repères de structure, lien « Aller au
> contenu » sur la page publique, animations réduites respectées). La liste complète est dans
> `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain — domaine E »).

> ⚠️ **La limite principale du domaine E, et il faut la dire** : tout a été mesuré **dans un
> navigateur d'ordinateur simulant un téléphone**. **Personne n'a jamais saisi un score dehors**,
> en plein soleil, debout, avec de vrais doigts, sur son propre téléphone. Les contrastes calculés
> sont un **plancher optimiste** : un écran au soleil, à luminosité réduite, fait bien pire.
> **Trente minutes d'essai réel** avec deux ou trois bénévoles vaudraient mieux que tout ce
> domaine — et feraient probablement apparaître des problèmes qu'aucune mesure ne trouve.

> ✅ **Ce que le domaine D a montré de bon** : le harnais est **réel et entretenu** (3 711 lignes,
> 278 tests, **589 vérifications, 0 échec**, en croissance de la session 5 à la 28) ; il est écrit
> en **cœur pur** (données injectées, aucun accès au classeur), donc **rejouable hors de Google** —
> démontré cette session, `589/589` en ~1 seconde avec une vingtaine de lignes de doublures ; il
> est **reproductible** (le tirage au sort est un interrupteur que les tests coupent) ; il est
> **prudent par construction** (des tests vérifient qu'un format inventé retombe sur le chemin
> prudent — c'est rare et c'est excellent) ; les **écritures simultanées sont sérialisées** par un
> verrou, donc le risque de concurrence est traité ; le **double-clic** est bloqué sur la saisie ;
> et **85 fonctions** sont déjà « pures », donc testables **aujourd'hui sans rien changer au
> code**. La liste complète est dans `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain —
> domaine D »).

> ✅ **Ce que la protection des données a montré de bon** : **aucun enfant n'est identifié**
> (recherche sur l'ensemble du dépôt) ; l'email d'un club n'est **jamais** renvoyé, pas même au
> club concerné ; un envoi groupé envoie **un courriel par club**, jamais un courriel commun ; le
> téléphone du contact public a été **volontairement retiré** de la page publique, avec la raison
> écrite ; les documents PDF sont fabriqués **entièrement sur l'appareil** ; et il n'y a **aucun
> cookie, aucun traceur tiers, aucun outil de mesure d'audience extérieur**. La liste complète
> est dans `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain — domaine B »).

> ✅ **Ce que la sécurité a aussi montré, et qu'il faut dire** : le code est **bien meilleur que la
> moyenne** sur ce terrain. Les mots de passe ne sont **nulle part** dans le dépôt (historique
> **complet** relu, 513 enregistrements) ; les textes affichés sont systématiquement neutralisés ;
> les liens des partenaires sont bornés ; l'adresse d'un courriel est toujours relue dans le
> classeur, jamais fournie par le navigateur ; un club ne peut jamais voir la fiche d'un autre.
> La liste complète est dans `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain »).

**Décisions métier prises le 2026-08-04** — les 5 P1 sont tous tranchés :

- **D-011 — forfait** : un **bouton « Forfait » sous chaque équipe** dans la page de saisie.
  L'absent marque **0 point**, le présent **gagne** (3 points), **aucun score n'est attribué**,
  et une **double mise en garde** protège le geste. *(Le réglage que j'avais recommandé a été
  écarté par Romain, à juste titre : il aurait permis de fausser la différence.)* La règle retenue
  doit être **communiquée aux clubs** ;
- **D-012 — scores** : **2 chiffres maximum** (au-delà, refus) et **confirmation avant chaque
  validation** ;
- **D-013 — planning** : **déplacer un match** (heure et/ou terrain) et **décaler toute la journée
  de X minutes**. Le 3ᵉ niveau — redistribuer automatiquement un terrain devenu impraticable — est
  **écarté pour l'instant** : c'est le seul qui touche au moteur de planification ;
- **D-014 — départage** : ajouter la **confrontation directe** (4ᵉ critère) puis l'**ordre
  alphabétique** (5ᵉ), **à la suite** des trois critères existants, sans y toucher.

> L'exigence de transparence posée par D-011 a fait apparaître **R-012** : ni le barème, ni le
> départage ne sont écrits où que ce soit pour les clubs, et le champ « Règlement » du dossier a
> été **retiré de l'écran d'administration**. La règle décidée ne serait donc, en l'état,
> communicable à personne.

- **D-015 — match annulé** : le **même mécanisme que le forfait, avec un libellé distinct**. Un
  match annulé ne compte pour personne et ne bloque pas l'après-midi. **Validé par défaut** : une
  règle fédérale primerait.

**Une seule inconnue subsiste, et elle est extérieure au dépôt** — **I-10** : `AUDIT-TOURNOI-R92.md`
**ne dit rien** du forfait ni de l'annulation. C'est une **question de règle du jeu**, qui
appartient au chantier FFR (D-003) et que Romain doit porter au Directeur EDR du Racing ou au
Comité 92. Sa réponse primerait sur D-011 **et** D-015.

**Le fil rouge du domaine F**, en deux phrases :

1. **Le travail de performance a été fait, puis arrêté juste avant la fin.** Cache serveur,
   anti-ruée, copie de secours, pause en arrière-plan, étalement aléatoire, délai d'abandon,
   verrou court-circuité pour les lectures d'administration : **tout est là, et bien fait**. Le
   relais qui couronne l'édifice est écrit des deux côtés, documenté pas à pas — et **il n'a
   jamais été allumé**. Ce domaine ne demande pas de construire : il demande de **terminer**.
2. **Ce qui est lent n'est pas le code, c'est le lieu.** Une action qui ne fait strictement rien
   met déjà **2,3 secondes** à répondre, parce qu'elle passe par Google Apps Script. Aucune
   optimisation ne descendra sous ce plancher — et c'est pourquoi la vraie réponse à l'affluence
   n'est pas d'accélérer le serveur, mais de **ne plus l'interroger** : c'est exactement ce que
   fait le relais éteint.

> ✅ **Ce que le domaine F a montré de bon** : la page publique est **prête en 527 ms** et pèse
> **59 Ko** hors logo, sur 12 fichiers seulement ; les calculs du navigateur sont **négligeables**
> (réaffichage complet des deux vues en **0,9 ms**) — **il ne faut surtout pas y toucher** ;
> **25 lectures simultanées** ont été servies **25 fois sur 25, sans une erreur**, toutes depuis
> la même copie en cache ; le cache serveur **divise le temps par trois** (1,4-2 s contre 4,4-6,3 s) ;
> la « ruée sur le cache » est **traitée** (un seul reconstructeur élu, copie de secours pour les
> autres) ; la taille du cache est mesurée en **octets réels** et non en caractères, avec le
> commentaire disant que le piège avait déjà été rencontré ; le rafraîchissement **se met en pause
> en arrière-plan**, est **étalé au hasard**, **n'empile jamais** deux requêtes et **abandonne au
> bout de 12 s** ; les lectures d'administration **court-circuitent le verrou** pour ne pas
> concurrencer la saisie le jour J ; et une fausse alerte a été **levée** — le minuteur à 5 s des
> partenaires n'écrit que sur le téléphone, l'envoi réseau est bien espacé de 10 minutes. La liste
> complète est dans `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain — domaine F »).

> ⚠️ **Les limites du domaine F, et il faut les dire** : toutes les mesures viennent d'un
> **ordinateur situé à 16 millisecondes des serveurs Google** — ce sont donc des temps
> **plancher**, jamais des temps réels de téléphone en bord de terrain. **Je n'ai pas simulé
> trois cents spectateurs** : j'en ai simulé **vingt-cinq**, une fois — un vrai test de charge sur
> le service en production n'est pas un geste d'audit. Et **aucune écriture n'a été chronométrée**
> (une écriture exige une clé, et une écriture ratée ferait monter le compteur anti-force-brute) :
> le coût d'une validation de score — **3 à 8 s** — est **reconstitué**, donc **PROBABLE**.

> 🔗 **Le domaine F répond à la question que le domaine E lui avait laissée.** `R-053` demandait
> si l'attente après « Valider » était un détail. **Réponse : non.** La reconstruction de
> l'instantané public, mesurée à **2,5-4,5 s**, se fait **pendant que le verrou d'écriture est
> tenu** (**R-067**) — l'attente est donc réelle et s'allonge quand plusieurs marqueurs valident
> ensemble. Un bouton muet pendant quatre secondes est un bouton sur lequel on reclique.

### Domaine G — architecture et maintenabilité *(session 11)* — **10 problèmes, 0 P0, 2 P1**

> 🟢 **Verdict inhabituel, et il faut le dire tel quel : le code est en bien meilleur état que sa
> documentation.** Le classeur Google n'est ouvert qu'à **8 endroits** dans 8 147 lignes ;
> `calculerPlanning` — **224 lignes**, le cœur qui décide quel match se joue où et quand — ne
> contient **aucune** référence à Google ; l'aiguillage des demandes est séparé du travail ; et les
> commentaires expliquent le **pourquoi**, ce qui est rare. C'est exactement ce qui rend possibles
> les **589 vérifications sans aucun Sheet**.

> ⚠️ **Les deux P1 ne portent pas sur ce que l'application FAIT, mais sur ce que le projet RACONTE
> de lui-même.**
>
> **R-072** — la procédure de redéploiement décrit **la moitié du geste** : le serveur, c'est
> `Code.gs` **et `Tests.gs`** (3 711 lignes, 589 vérifications), or `Tests.gs` n'est cité par
> **aucun** des six documents du projet, et `deploiement.md` dit *« coller `Code.gs` »*, point.
> **Ce n'est pas théorique : c'est le mécanisme exact de M-04**, la preuve fausse entrée au dossier
> en session 6 et refaite seulement le 2026-08-05.
>
> **R-073** — la carte du projet ne décrit plus le projet : `architecture.md` documente **21 des
> 65 actions** du serveur (**68 % d'invisible**) et 4 pages sur 8 ; **tout le parcours d'invitation
> des clubs — le travail du dernier mois — n'y figure nulle part**. Là non plus ce n'est pas
> théorique : le chiffre non sourcé de « 1 000-1 300 spectateurs », écrit dans deux documents, a
> conduit la session 10 à une conclusion trop pessimiste, corrigée par Romain (**I-19**).

> 🔗 **Le domaine G explique trois problèmes déjà ouverts** — c'est peut-être son apport principal :
> **R-043** (aucun test du navigateur) n'est pas un manque de temps mais un manque de **prise** :
> calculer et afficher sont le même geste (**R-079**) ; **R-044** (29 règles écrites deux fois)
> n'est pas de la négligence mais une **contrainte** (aucun moyen de partager du code entre Google
> et le navigateur) — donc la bonne réponse n'est pas « arrêter de recopier » mais **faire se
> confronter les deux copies** ; et **M-04 / I-01** ont une cause commune : le dépôt manuel du
> serveur (**R-081**).

### Domaine H — qualité du code *(session 12)* — **7 problèmes, 0 P0, 0 P1** — 🏁 **le dernier**

> 🟢 **Le code tient ses promesses — sauf quand il parle de lui-même.** Les sept points de contrôle
> de `CLAUDE.md` §6.H ressortent sains, et souvent excellents : la fonction **médiane fait 10
> lignes** (serveur) et **9** (navigateur) ; **zéro bloc de 8 lignes répété** dans les 8 147 lignes
> du serveur ; **1 seule fonction morte sur 277**, **zéro sur 600** côté navigateur ; **89 % et
> 92 %** des fonctions sont précédées d'un bloc d'explication ; imbrication maximale **6 niveaux**.

> ⭐ **LE RÉSULTAT PRINCIPAL : R-044 a sa réponse, et elle est bonne.** Le domaine G avait expliqué
> **pourquoi** 29 règles sont écrites en double (aucun moyen de partager du code entre Google et le
> navigateur) mais ne pouvait pas dire **si les deux copies sont d'accord**. Elles le sont : le
> serveur et douze fichiers du navigateur ont été chargés dans un même bac à sable sur cet
> ordinateur, puis les deux versions de chaque règle appelées **sur les mêmes entrées** —
> **179 comparaisons, 0 écart**, sur 16 familles de règles.
>
> 🏉 **En clair, pour un tournoi réel** : le classement affiché sur la page publique est recalculé
> **par le navigateur, sans redemander au serveur**. Si les deux avaient divergé, deux personnes
> auraient pu voir **deux classements différents du même tournoi**. Ce n'est pas le cas — barème
> (victoire 3 / nul 2 / défaite 1) et départage (points, différence, points marqués) sont écrits
> **identiques au caractère près**.
>
> ⚠️ **Ce que ça ne prouve pas** : que ça le restera. **Rien ne le revérifie automatiquement.**
> R-044 reste ouvert, mais il passe de *« défaut possible »* à *« dette à surveiller »* — et la
> méthode qui vient de le prouver tient en une minute.

> ⚠️ **Les sept problèmes ont tous la même forme, et ce n'est pas un hasard** : ce n'est jamais le
> code qui se trompe, c'est **ce que le code raconte**. Un commentaire qui annonce l'inverse de la
> ligne d'en dessous (**R-083**). Une colonne créée dans ton classeur, documentée, que rien ne lit
> (**R-084**). Un écran qui annonce des matchs de 10 minutes là où 30 seront jouées (**R-082**). Une
> suppression d'image qui répond « c'est fait » sans avoir vérifié (**R-085**). Un message d'erreur
> en anglais montré au bénévole (**R-086**).
>
> 🔗 **C'est exactement le défaut que le domaine G avait trouvé dans la documentation — il a commencé
> à entrer dans le code.** Et toujours au même endroit : **la partie la plus récente** (le Super
> Challenge). `CLAUDE.md` §8 bis protège désormais la documentation ; **il lui manque son pendant
> pour les commentaires**.

> ⚡ **Une correction à porter au dossier — et c'est la deuxième fois.** Trois chiffres inscrits par
> la session 11 étaient faux : `redimensionnerImage` fait **23 lignes** (et non 338),
> `htmlClubEdition` **19** (et non 254), `planRemplissageAutorisation` **113** (et non 239). La plus
> longue fonction du navigateur fait **135 lignes**, aucune n'atteint 150. Le constat de fond du
> domaine G (**R-079** : calculer et afficher sont le même geste) **reste vrai** ; c'est son ampleur
> chiffrée qui était trop grande. → **M-06** : *un chiffre dont la méthode de mesure n'est pas
> écrite n'est pas une preuve.*

> ✅ **Le domaine H n'ajoute AUCUNE décision en attente et AUCUNE inconnue.** Ses 7 problèmes sont
> des constats techniques : ils n'appellent aucun arbitrage métier, aucun ne touche à une règle du
> rugby. Une seule chose est à **savoir** plutôt qu'à décider : **R-082 devient P1 le jour où le club
> accueille réellement un Super Challenge de France** — même logique de déclencheur que **D-022**.

La cartographie a par ailleurs relevé **39 points d'attention**, qui sont des **observations**, pas
des verdicts. Ils seront classés à l'ÉTAPE 2 :

- **A-01 à A-14** (session 2, le squelette) → `CARTOGRAPHIE.md` §A.10 ;
- **B-01 à B-12** (session 3, les fonctionnalités) → `CARTOGRAPHIE.md` §B.12 ;
- **C-01 à C-13** (session 4, les données) → `CARTOGRAPHIE.md` §C.12.

Le plus structurant du volet B est **B-03** : le garde-fou qui empêche d'effacer tous les scores en
regénérant les poules vit **uniquement dans le navigateur**, alors que des protections comparables
(réorganisation des poules, gel des réponses à J-16) sont, elles, tenues par le serveur.

Le plus structurant du volet C est **C-05** : **aucune donnée ne disparaît d'elle-même**. Il
n'existe nulle part de durée de conservation ni de purge automatique — toute suppression est un
geste manuel. À rapprocher de **C-07** (une copie de chaque courriel envoyé reste dans la boîte
Gmail, hors de portée de la réinitialisation) et de **C-03 / C-04** (la réinitialisation laisse
derrière elle des effectifs d'enfants et des contacts de dirigeants, sans que ce soit expliqué).

---

## 7. DÉCISIONS VALIDÉES

| Réf | Décision | Statut |
|---|---|---|
| D-001 | Le cadre de travail est `CLAUDE.md` + `docs/industrialisation/` | ✅ Validée |
| D-002 | Une session = un objectif précis, puis arrêt | ✅ Validée |
| D-003 | Audit FFR et industrialisation restent **deux chantiers séparés** : l'un traite la règle du jeu, l'autre la solidité de l'outil | ✅ Validée |
| D-004 | Messages de commit : convention existante conservée — `type(scope): description en français` | ✅ Validée |
| D-006 | Documentation → commit direct sur `main` ; code de l'application → branche + PR + validation préalable | ✅ Validée |
| D-010 | Ordre d'audit des 8 domaines : **A → C → B → D → E → F → G → H** — « on fait les choses dans l'ordre pour bien les faire » | ✅ Validée (session 5) |
| D-011 | Règle du **forfait** : absent = 0 point, présent gagne, score = paramètre de l'organisateur, règle à communiquer aux clubs | ✅ Validée (session 5) |
| D-012 | **Scores** : 2 chiffres maximum, plus confirmation avant chaque validation | ✅ Validée (session 5) |
| D-013 | **Planning** : déplacer un match, et décaler toute la journée de X minutes | ✅ Validée (session 5) |
| D-014 | **Départage** : confrontation directe, puis ordre alphabétique en dernier recours | ✅ Validée (session 5) |
| D-015 | **Match annulé** : même mécanisme que le forfait, libellé distinct, ne compte pour personne | ✅ Validée (session 5), **par défaut** — une règle FFR primerait |
| **D-027** | **L'attente est annoncée, jamais subie.** Page publique : indicateur de chargement **animé** + courte explication du délai, **sans aucun chiffre** (un délai annoncé devient une promesse — or 4 % des appels dépassent 10 s). Page de saisie : animation en **deux temps**, « c'est pris en compte » → « c'est bon ». ✅ **4 arbitrages validés par Romain** (*« je vais suivre l'ensemble de tes conseils »*) : **délai retenu = 30 s, PAS 60** (le bouton « Rafraîchir » concentre la charge au pic ; 60 s seulement si une mesure le justifie) · une animation **ne doit jamais mentir** (3 issues : ça arrive / c'est arrivé / **ça a échoué**) · **CSS pur**, jamais d'image · **l'animation prime sur l'accélération**, car 60 % du temps d'une validation est incompressible | ✅ **Validée (session 10)** — **conception proposée par Romain** |
| **D-026** | **Mieux vaut faire attendre que ne pas délivrer.** Entre des scores très frais et la certitude que chacun finira par les obtenir, on choisit **la certitude** — allonger le rafraîchissement est donc un geste acceptable. ⚠️ **Mais accepter l'attente INTERDIT le silence** : une attente voulue que l'écran n'annonce pas devient indistinguable d'une panne, et les gens rechargent — ce qui aggrave la charge. **D-026 renforce donc R-051, R-052, R-053 et R-069**, qui deviennent le **préalable** de tout allongement de délai | ✅ **Validée (session 10)** — décision **spontanée** de Romain : *« même s'ils doivent attendre un peu […] la finalité c'est qu'ils l'obtiennent »* |
| **D-024** | **Tous les points en suspens (questions, décisions, inconnues) sont accumulés pendant l'ÉTAPE 2 et traités un par un à l'ÉTAPE 3.** Registre unique en **§10**. Trois exceptions : D-017 (une action, pas une question), les questions **sortantes** (I-10, I-15), et un éventuel **P0** | ✅ **Validée (session 7)** — *« on pourra les traiter une par une, de manière détaillée »* |
| **D-023** | **Les trois décisions du domaine B (D-018/019/020) sont reportées à la fin des audits.** Plus rien ne presse : D-022 fixe le déclencheur, R-029 est suspendu. Et elles **ne dépendent pas de l'hébergement**, contrairement à ce qu'on pouvait croire | ✅ **Validée (session 7)** — *« oui après me semble juste »* |
| D-016 | **Corriger R-014 (le P0) tout de suite**, seul, hors de l'ordre du chantier — puis reprendre les audits | ✅ Validée (session 6) — *« va pour B alors je te suis dans ton raisonnement »* |
| **D-021** | **Phase prototype : tout appartient à Romain, et c'est assumé.** Classeur, Drive, boîte d'envoi et données de test sont sur ses comptes personnels — le bon choix pour un prototype. La question du responsable se repose au déclencheur | ✅ **Validée (session 7)** — *« dans cette phase de test tout est à moi »* |
| **D-022** | **Le déclencheur remplace la date** : le jour où l'email d'un tiers entre dans le classeur, les trois P1 du domaine B doivent être réglés. Tant qu'il n'est pas atteint, **aucune exception** à l'ordre du chantier | ✅ **Validée (session 7)** |
| **D-029** | ⚡ **L'industrialisation n'arrête pas les fonctionnalités — et deux mesures s'appliquent donc TOUT DE SUITE.** *« Une phase de pré-industrialisation, pas une fermeture totale des fonctionnalités »* (Romain). **① La fiche de redéploiement est complète** (`docs/deploiement.md` : le serveur = **deux** fichiers, `Tests.gs` compris, + contrôle par **deux nombres** — 589 et 3711). **② La carte se met à jour dans le même lot** que la fonctionnalité (`CLAUDE.md` **§8 bis**, nouvelle section, valable pour **tous** les chantiers). ⚠️ **Aucune autre exception à D-024** : le critère est **cumulatif** — aucun code touché **ET** un coût d'attente qui court à chaque livraison | ✅ **Validée ET APPLIQUÉE (session 11)** — *« applique les deux »*. Seule décision du chantier à avoir été **exécutée** hors ÉTAPE 3 |
| **D-028** | **Le fichier serveur n'est PAS découpé tant que le dépôt chez Google est manuel.** `Code.gs` fait 8 147 lignes et Apps Script accepte plusieurs fichiers — mais 1 fichier → **5 collages à la main**, soit cinq occasions d'en oublier un : **le mécanisme même de M-04**. ⚠️ **Ce n'est pas un permis d'agrandir le fichier**, et **R-074 reste ouvert au registre**. **Réouverture** : le jour où le dépôt cesse d'être manuel (**R-081**) | ✅ **Validée (session 11)** — *« la 2 »*. Première décision prise **avant** l'ÉTAPE 3, et sans entorse à **D-024** : décider de **ne rien faire** n'engage aucun travail et ne peut pas être invalidé par un constat ultérieur |

### Tranchées à l'ouverture de l'ÉTAPE 3 — **volet ①, session 13, 2026-08-05**

| Réf | Décision | Statut |
|---|---|---|
| **D-025** | **Quels tests, dans quel ordre** : **lot ① seul** — les 5 tests du **barème et du départage** — et ils sont écrits **AVANT** la correction du départage (**D-014**), pas après. *Aucune ligne de l'application n'est modifiée par ce lot : les deux fonctions sont déjà testables telles quelles.* Les lots ②③④ ne sont **pas refusés**, ils sont **différés** — le lot ④ reste le préalable de D-012 et D-015 | ✅ **Validée (session 13)** |
| **D-020** | **Combien de temps garde-t-on quoi** : le **tableau des 7 durées est adopté tel quel** (carnet des clubs = 3 éditions · effectifs = effacés à la réinitialisation · contacts FFR = 1 an · champ « équipes étrangères » = effacé après envoi · relevés de visibilité = effacés après remise de la fiche · `Historique` = conservé · courriels Gmail = 1 an). ⚠️ **Aucun effacement automatique** : toute suppression reste **déclenchée par un humain** | ✅ **Validée (session 13)** |
| **D-018** | **Que dit-on aux gens** : **oui**, les trois textes sont rédigés — bas du courriel d'invitation, bas de la page de réponse du club, et une **section « Tournoi »** pour la page RGPD **qui existe déjà** sur le site vitrine. Responsable : **Génération R92** · contact : **generationr92@gmail.com**. ⚠️ Ils **engagent l'association** : Romain les relit et les fait valider par le bureau ; rien n'est mis en ligne par le chantier | ✅ **Validée (session 13)** |
| **D-019** | **La mesure des partenaires** : **voie (a)** — informer, **sans bandeau**, avec un moyen simple de dire non. Un bandeau devant les scores dégraderait l'usage métier (`CLAUDE.md` §11) ; alléger la mesure ferait perdre la **portée**. ⚠️ À écrire **avant que l'interrupteur des partenaires soit rallumé** | ✅ **Validée (session 13)** |
| **D-005** | **Périmètre** : le chantier reste **`tournoi-r92` seul**. Ce qui est constaté dans `boutique-r92` est **signalé** (V-01 → V-04 dans `DECISIONS.md`), **jamais corrigé à l'aveugle**. Les textes de D-018 sont **livrés** à Romain, qui les porte lui-même | ✅ **Validée (session 13)** |
| **D-009** | **Où atterrit la documentation** : **D-006 conservé** — elle va directement sur `main` ; une branche imposée est **ramenée dans `main` avant la fin de la session**. L'option inverse est exactement ce qui a coûté les sessions 6 et 8 | ✅ **Validée (session 13)** |

### ⚡ Décision apportée par Romain, hors audit — **session 13, addendum**

| Réf | Décision | Statut |
|---|---|---|
| **D-033** | ⚡ **Les durées de conservation sont garanties par un RAPPEL MANUEL** tant qu'aucun outil ne les applique. C'est ce qui autorise à **annoncer publiquement** les durées de D-020 : sans cela il aurait fallu soit les retirer des textes *(l'information que les gens attendent le plus)*, soit construire l'outillage d'abord. ⚠️ **Ce n'est pas une solution définitive** — l'outillage reste souhaitable, et **toute suppression restera déclenchée par un humain** | ✅ **Validée (2026-08-06)** — **couvre R-030** |
| **D-031** | ⚡ **L'application ne porte pas la réglementation : le responsable la renseigne.** *« La réglementation importe au responsable du tournoi, pas à l'app — à lui de renseigner ce que la réglementation impose. »* **Doctrine générale**, valable pour tout le projet. Aucun seuil réglementaire n'est écrit dans le code ; l'application applique **les valeurs saisies**. ⚠️ **Contrepartie obligatoire** : si une valeur manque, l'application **le dit** — elle n'invente pas et ne fait pas comme si le contrôle avait eu lieu (**D-027**). 🚧 **Garde-fou explicite** : le **bouton « Appliquer les valeurs FFR »**, la lecture des onglets `RefFFR_*` et l'écran de conformité **ne sont PAS visés** — *« c'est juste une aide à la saisie qu'il peut modifier »*. Ferme le point ouvert (g) de D-030 | ✅ **Validée (session 13, addendum n° 4)** |
| **D-032** | ⚡ **Les deux pauses méridiennes ne coexistent jamais.** *« Quand la pause échelonnée est cochée, la pause classique ne s'applique pas, et inversement. »* ⚠️ **Le code d'aujourd'hui ne respecte pas cette règle** : sous 4 équipes, une catégorie retombe en pause classique (**R-091**). ✅ **Comportement retenu** : la petite catégorie **garde une pause, mais la sienne** — durée = le repos minimal configuré ; la pause classique globale ne s'applique alors **nulle part**. *Garantit qu'aucun mode ne coexiste **et** qu'aucun enfant n'est sans coupure.* Planifié dans **C-004** | ✅ **Validée (session 13, addendum n° 4)** — **couvre R-091** |
| **D-030** | **Tournoi SUSPENDU / Tournoi ANNULÉ (force majeure)** — deux états au niveau du **tournoi**, un cran au-dessus du match annulé de D-015. **SUSPENDU** : tout est figé, le match en cours est verrouillé et **son score validé à l'instant de la suspension**, la reprise ne le rejoue pas, et le moteur **propose** des scénarios de rattrapage sans jamais **décider** seul d'une modification réglementaire. **ANNULÉ** : définitif pour la journée, matchs à venir grisés et inaccessibles, **aucun classement final** pour un tournoi EDR classique, résultats déjà validés **conservés** comme historique. **Dans les deux cas** : clé administrateur à l'activation **et** à la reprise, état visible en administration, **bandeau public au texte personnalisable**. ⚠️ **Spécification conservée — aucun code écrit.** Implémentation **volet ③**, en **2 niveaux**, après le lot ① des tests et après R-042. ⚡ **I-21 levée le même jour** : la reprise avec **adaptation du format et de la durée est autorisée**, sous réserve du **temps de jeu maximal** et de **l'interdiction des phases finales** → le **niveau 2 est débloqué**. ⚡ **Cadre de la reprise précisé par Romain le même jour** (**D-030 §9**) : **6 contraintes** que le moteur ne franchit jamais *(dont la règle d'équité « jamais une équipe reposée contre une équipe qui ne l'est pas »)*, **8 leviers** ordonnés du moins au plus intrusif, et **5 principes** — dont le plus important : **le moteur n'a pas le droit de conclure « impossible » avant d'avoir parcouru les huit leviers**, et **il ne modifie jamais seul une valeur configurable**. **Trois fiches de chantier écrites** : `PLAN.md` **C-002**, **C-003**, **C-004** | ✅ **Validée (session 13, addendums)** — **couvre R-089** |

### ⚡ Nées de la **remise à niveau documentaire** — **2026-08-19** *(hors plan d'audit)*

> 📌 **Leur spécification vit dans `DECISIONS.md`**, sa source. Ci-dessous, l'objet en une phrase.

| Réf | Objet | Statut |
|---|---|---|
| **D-034** | **`COUPE_PLATEAU` reste PROPOSÉ, mais SIGNALÉ** et **confirmé avant application** : l'application informe, elle n'interdit pas. ⛔ **Remplace** la doctrine *« interdit en EDR, non proposé »*, **jamais publiée**. ⚠️ **Seule décision du chantier à avoir touché du code** | ✅ **Validée (2026-08-19)** — décision **produit** de Romain |
| **D-035** | **Le `CHANGELOG` entre dans la règle de la carte** : `CLAUDE.md` §8 bis passe de **3 à 4** documents | ✅ **Validée (2026-08-19)** — **étend D-029** |
| 🏛️ **D-036** | **Le découpage de la remise à niveau en 6 lots**, inscrit dans `PLAN.md` §13 — **constat** pour les lots 1 à 3, **décision du propriétaire** pour les lots 4 à 6 | ✅ **Validée (2026-08-19)** |

### ⚡ Arbitrage préparatoire, avant l'ouverture du chantier suivant — **2026-08-19**

| Réf | Objet | Statut |
|---|---|---|
| **D-037** | **L'arbitrage de R-092 et R-093**, les deux derniers problèmes du registre sans rattachement. **R-092 → C-015** *(toute invalidation d'un résultat doit effacer le détail périmé)* · **R-093 → nouveau chantier C-031** *(périmètre : au minimum `Matchs` **et** `Equipes`)* · 🛡️ **règle de protection provisoire** dans C-015 : toute colonne nouvelle s'ajoute **à la fin**, jamais au milieu — ⛔ **elle protège C-015, elle ne referme pas R-093** · **C-015 reste le prochain chantier à ouvrir**. ⚠️ **Aucun code écrit, aucune priorité inventée** | ✅ **Validée (2026-08-19)** |

**En attente** (voir `DECISIONS.md`) :

> 🏁 **Le registre des décisions en attente est VIDE.** Les six dernières ont été tranchées au
> volet ① de l'ÉTAPE 3 (session 13). Plus aucune décision n'est requise de Romain pour construire
> le plan.

Reste **une action**, qui n'a jamais été une question :

- **D-017 — Remplacer les deux clés par des suites aléatoires.** *(aucun code : cinq minutes dans
  le menu du classeur « Tournoi R92 → Configurer les clés » — c'est ce qui referme **R-019**, un
  P1)*.

*(Aucune décision du domaine A n'est en attente.)*

---

## 8. POINTS INCONNUS

Ces points sont **INCONNU** au sens de la règle de transparence : impossibles à établir sans
vérification supplémentaire.

| # | Point inconnu | Pourquoi | Comment le lever |
|---|---|---|---|
| I-01 | Le code réellement en service chez Google est-il identique à `backend/Code.gs` ? | Le backend s'exécute chez Google, hors du dépôt | Vérification manuelle par Romain dans Apps Script |
| I-03 | Quelles données personnelles de **tiers** seront présentes dans le Google Sheet une fois de vrais clubs invités ? | ✅ **Rien à ce jour** (précisé par Romain le 2026-08-04) : les seules adresses email présentes sont **la sienne et celle de son épouse**, utilisées pour tester les envois. ✅ L'**inventaire de ce que l'application peut collecter** est désormais **fait** (volet C, session 4) : nom / prénom / email du contact de chaque club, et des **effectifs** d'enfants (jamais leur nom). Ce qui reste ouvert n'est plus « quoi », mais « **que décide-t-on d'en faire** » | Instruction au **domaine B (RGPD)** de l'ÉTAPE 2 — **avant** la première invitation réelle |
| I-10 *(élargie le 2026-08-05)* | La FFR encadre-t-elle le sort d'un match d'École de Rugby **qui n'a pas pu se jouer** (forfait, ou annulation pour intempéries) — ⚡ **et celui d'un TOURNOI ENTIER interrompu ou annulé pour force majeure** ? Existe-t-il une règle de classement imposée (points attribués, match à rejouer, match neutralisé, journée non classée) ? | `AUDIT-TOURNOI-R92.md` **ne contient rien** sur le sujet : aucun de ses 25 points de vérification (Q11→Q25) ne le couvre. C'est une question de **règle du jeu**, donc du chantier FFR (D-003) | Question de Romain au **Directeur EDR du Racing** ou au **Comité 92** — la voie qui a déjà résolu Q23. Une règle fédérale primerait sur D-011, D-015 **et D-030** |
| ~~⚡ **I-21**~~ | ~~En cas de force majeure, peut-on réduire le temps de jeu ?~~ | ✅ **LEVÉE le 2026-08-05** — **oui, la reprise avec adaptation du format et de la durée est autorisée**, sous deux réserves : ⛔ **temps de jeu maximal** · ⛔ **aucune phase finale** | Voir « Points levés » ci-dessous |
| I-08 | Une image mise à la corbeille du Drive (affiche, logo, photo de parking) reste-t-elle visible par un lien déjà diffusé, pendant les ~30 jours avant que Google vide la corbeille ? | Le comportement de la corbeille Drive appartient à Google, il n'est pas dans le code | Test réel : mettre une image à la corbeille, puis rouvrir son lien depuis une navigation privée |
| I-09 | Que conserve le **journal d'exécution** de Google Apps Script, et pendant combien de temps ? | Ce journal vit chez Google, hors du dépôt | Consultation par Romain dans l'éditeur Apps Script (« Exécutions ») |
| **I-14** ✅ *(largement répondue le 2026-08-05)* | **Qui est officiellement responsable** de ces données ? ✅ **Le site vitrine le déclare publiquement : « Génération R92 — association loi 1901 », contact `generationr92@gmail.com`, directeur de la publication Jérémy Jost.** ⚠️ **Avec une réserve** : la déclaration en préfecture est **« en cours »** (siège et n° RNA *« à définir »*), donc **aujourd'hui c'est Romain qui porte ces données de fait** (**D-021**). **Ce qui reste ouvert** : le classeur doit-il rester dans un **compte Google individuel** ? | La partie « qui » est désormais **écrite** (levée avec **I-16**). La partie « quel compte » reste entière : si ce compte est perdu ou bloqué, **l'association perd d'un coup son carnet d'adresses, ses images et son historique** | ✅ **Suffisant pour D-018** (les textes peuvent nommer le responsable). Reste à décider **au déclencheur** (**D-022**) : basculer le classeur vers un compte de l'association — voir **R-039** et `docs/passation.md` §11 |
| **I-15** | **Le droit à l'image des enfants est-il géré ailleurs** — par la licence FFR, un document du club, une consigne aux clubs invités ? | Le mécanisme existait dans l'application et a été **retiré sur décision du club** le 2026-08-03. Le modèle `.docx` reste dans le dépôt, plus rien ne le charge. **Rien n'écrit ce qui l'a remplacé** | Question de Romain au club. Tant que la réponse est inconnue, ce n'est **pas un défaut du code** — voir **R-036** |
| ~~**I-16**~~ | ~~Le site vitrine porte-t-il déjà des mentions légales ou une page « Vos données » ?~~ | ✅ **LEVÉE le 2026-08-05** (session 13) — **oui : « Mentions légales », « CGV », « RGPD », « Statuts »** figurent au pied de page. ⚠️ **Mais la page RGPD ne parle pas du tournoi** | Voir « Points levés » ci-dessous |
| **I-19** | **Combien de spectateurs sont réellement attendus ?** Le chiffre de **1 300** vient de `docs/relais-cdn.md`, **sans source**. C'est lui qui décide s'il faut allumer le relais (**R-061**) ou non | Aucun document du dépôt ne le justifie. C'est une connaissance de terrain, pas une donnée technique | Réponse de Romain — **il est le seul à savoir** combien de familles viennent à ce tournoi |

### Points levés

| # | Point | Réponse | Levé le |
|---|---|---|---|
| ⚡ **I-21** | **En cas de force majeure, peut-on réduire le temps de jeu** pour faire tenir les rencontres restantes — périodes raccourcies, deux périodes ramenées à une ? | ✅ **LEVÉE — OUI, la reprise avec adaptation du format et de la durée est AUTORISÉE**, sous **deux réserves** rapportées par Romain : ⛔ **le temps de jeu maximal** doit être respecté · ⛔ **les phases finales sont interdites**. ⚡ **Trois conséquences, dont une qui n'était pas prévue** : (1) **le niveau 2 de D-030 est débloqué** — sa fiche de chantier est écrite (`PLAN.md` **C-003**) ; (2) ⚠️ **la première réserve n'est pas un branchement, c'est un travail** — `plafond_joueur_min` est aujourd'hui **lu, affiché avec la mention « (sécurité) » et injecté dans un prévisionnel, mais rien dans `calculerPlanning` ne refuse un planning qui le dépasse** *(constaté dans le code)*. Il faut transformer un **indicateur** en **contrôle réel** ; (3) ⚠️ **la réponse ne dit rien d'une durée MINIMALE**, ni du **repos méridien** — écrit **en dur** dans le code (`repos: 60`). ⚡ **Romain a précisé le cadre le même jour** *(voir §7, D-030)* : ce 60 n'est **pas** un verrou, c'est **une valeur d'organisateur** qui n'a jamais eu d'écran pour être saisie. Elle devient un **levier**, mais **seulement par décision explicite** — jamais par le moteur. Détail : `DECISIONS.md` **D-030 §8 et §9** | 2026-08-05, session 13 *(addendums n° 2 et 3)* |
| **I-16** | Le site vitrine `boutique-r92` porte-t-il déjà des mentions légales ou une page « Vos données » ? | ✅ **LEVÉE — OUI.** Lecture des pages publiques (`index.html`, `rgpd.html`, `mentions-legales.html`). Le pied de page porte **« Mentions légales · CGV · RGPD · Statuts »**. ⚡ **Deux gains immédiats** : (1) la page RGPD existe, donc D-018 n'a plus à créer une page — seulement à y **ajouter une section « Tournoi »** ; (2) elle **nomme le responsable** (*Génération R92*) et **l'adresse de contact** (*generationr92@gmail.com*) — les deux informations qui bloquaient D-018 depuis la session 7. ⚠️ **La limite, et elle est nette** : cette page **ne parle pas du tournoi** — ni clubs invités, ni contacts de clubs, ni effectifs d'enfants, ni mesure de visibilité des partenaires. Elle couvre l'adhésion, le don et l'achat. **R-028 reste donc entier** ; seul son **coût de correction** a baissé. 📌 Quatre constats hors périmètre inscrits en **V-01 → V-04** (`DECISIONS.md`, D-005) | 2026-08-05, session 13 |
| **I-06** | Comment le Google Sheet est-il réellement partagé ? | ✅ **LEVÉ — le classeur est PRIVÉ.** Romain a fourni une capture du panneau Drive de « Tournoi R92 - Base de données » : *Qui a accès → **Privé*** (propriétaire seul), et *Limites de sécurité → aucune limite appliquée*. L'identifiant du classeur est donc public dans le dépôt **sans que cela expose les données** : le connaître ne suffit pas à ouvrir le fichier. C'est le réglage attendu. Cela confirme aussi que la Web App s'exécute bien **au nom du propriétaire** — c'est ce qui lui permet de lire un classeur privé au profit de visiteurs qui, eux, n'y ont aucun accès. | 2026-08-04, session 2 |
| **I-07** | Les 4 onglets `RefFFR_*` existent-ils et sont-ils à jour ? | ✅ **LEVÉ — les 4 onglets existent, aux noms exacts attendus.** Capture du bas du classeur fournie par Romain : `RefFFR_Formes`, `RefFFR_Regles`, `RefFFR_Temps`, `RefFFR_Dates` — orthographe **identique** à ce que lit `Code.gs`. Contenu visible cohérent (millésimes 2026-2027, formes de jeu 5x5 / 7x7). Les fichiers Drive `RefFFR-formes-de-jeu` et `RefFFR-dates-federales` sont donc des documents **sources** distincts, sans rôle dans le fonctionnement. | 2026-08-04, session 2 |
| **I-02** | Les tests de `backend/Tests.gs` passent-ils aujourd'hui ? | ✅ **LEVÉ — 573 sur 573 passent.** `lancerTestsFFR` lancé par Romain dans Apps Script, après le redéploiement. Le compte confirme au passage que les 16 vérifications ajoutées pour R-014 étaient bien du lot (564 appels écrits en dur + 9 dans des boucles = 573). ⚠️ **Le risque de méthode M-03 demeure** : rien ne lance ces tests automatiquement, c'est un geste manuel qui peut être oublié. | 2026-08-04, session 6 |
| **I-13** | Le redéploiement du backend a-t-il eu lieu, et la correction de R-014 est-elle active ? | ✅ **LEVÉ — oui.** Le diagnostic « Tester la remontée » confirme la chaîne complète : écriture, relecture, et 109 relevés. ⚠️ **Corrigé le 2026-08-05** : ces relevés viennent des **appareils de Romain**, pas de spectateurs. **La preuve tient quand même** — des relevés ont bien été écrits puis relus. R-014 reste **TESTÉ**. | 2026-08-04, session 6 |
| **I-11** | Comment la Web App est-elle réellement publiée chez Google ? | ✅ **LEVÉ — « Exécuter en tant que : Moi » et « Qui a accès : Tout le monde ».** Capture de l'écran de déploiement fournie par Romain. « Tout le monde » veut dire **sans compte Google, sans rien**. C'est le réglage **nécessaire** (les spectateurs doivent pouvoir lire les scores) : rien à y changer. Mais cela confirme que R-014 n'exigeait aucun préalable — d'où sa correction immédiate. | 2026-08-04, session 6 |
| **I-12** | Les deux clés sont-elles des suites aléatoires ou des mots choisis à la main ? | ⚠️ **LEVÉ — ce sont des MOTS choisis par Romain** : *« pour les MDP c'est moi qui ai choisi ce sont des mots »*. C'est la réponse défavorable : **R-019 passe de P2 à P1**. Le remède ne demande aucun code — remplacer les deux clés par des suites aléatoires (**D-017**). | 2026-08-04, session 6 |
| **I-17** | Les 16 vérifications de R-014 passent-elles **chez Google** ? | ✅ **LEVÉ — OUI, `R92 — 589/589 OK, 0 FAIL`.** Romain a recollé `backend/Tests.gs` dans Apps Script et relancé `lancerTestsFFR` le jour même où le problème a été signalé. Deux contrôles croisés sur la capture : le **nombre** (589 = le compte du fichier *après* la correction ; 573 était celui d'avant) et la **dernière ligne du fichier** (3711 = exactement le nombre de lignes de `backend/Tests.gs`). **M-04 refermé** ; la 2ᵉ preuve du statut TESTÉ de **R-014** est reconstituée. ⚠️ **Portée exacte** : les tests tournent dans l'**éditeur**, donc contre le `Code.gs` **du projet** — pas nécessairement contre la version figée à l'adresse publique. **M-02 fortement réduit, pas supprimé.** | 2026-08-05, session 8 |
| **I-18** | **Combien de temps une demande occupe-t-elle réellement le serveur de Google ?** | ✅ **LEVÉE — 1,59 s pour ne RIEN faire, 1,65 s pour tout servir.** Romain a fourni **trois pages** du journal « Exécutions » : **128 exécutions réelles, 100 % « Terminée », aucun échec**. Lectures : médiane **2,07 s** (max 19,55 s). Écritures : médiane **2,67 s** (max 8,20 s) — ce qui **confirme** l'estimation « PROBABLE 3 à 8 s » de R-067, désormais **CERTAIN**. ⚠️ **Trois conséquences** : (1) **capacité ≈ 150 à 300 spectateurs, pas 1 300** ; (2) le commentaire de `doGet` (« quelques millisecondes ») est **faux de deux ordres de grandeur** — le coût est un **démarrage incompressible de ~1,6 s**, que le code ne peut pas réduire ; (3) **levier gratuit** : porter le rafraîchissement de 15 s à 30 s **double la capacité**. ✅ Au passage, une trace inédite pour **M-02** : les exécutions web portent **« Version 148 »**, l'éditeur **« Head »** — le mécanisme du risque est constaté directement. Détail : `AUDIT.md` §F.9 | 2026-08-05, session 10 |
| **I-05** | Qui utilise l'administration le jour J, et sur quel matériel ? | ✅ **LEVÉE — partiellement, et c'est suffisant pour le domaine E.** Réponses de Romain : **création du tournoi depuis un ordinateur** ; **scores saisis par des bénévoles sur leur propre téléphone** *(à confirmer)* ; **qui** fera quoi le jour J n'est **pas encore décidé** — on raisonne donc sur quelqu'un **qui n'a pas été formé** ; **réseau excellent au Racing** (Plessis-Robinson, Colombes, 5G), **inconnu ailleurs**. ⚠️ **« Leur propre téléphone » est la contrainte la plus lourde** : matériel **inconnu** (petit écran, vieil appareil, plein soleil) — d'où les mesures faites jusqu'à **320 px** de large. | 2026-08-05, session 9 |
| **I-04** | L'application a-t-elle servi un tournoi réel ? | ✅ **LEVÉ — non : le tournoi actuellement en base est un tournoi de TEST.** Romain : « c'est juste un faux tournoi avec de vrais noms ». Les noms d'équipes visibles (Racing 92, Stade Français, Clamart, Meudon, Vélizy, Antony, Sèvres, Issy-les-Moulineaux) sont de vrais clubs, mais les engagements sont fictifs. | 2026-08-04, session 2 |

> ✅ **À retenir de I-03 + I-04** : le classeur ne contient **aucune donnée personnelle de tiers**
> aujourd'hui. Tournoi fictif, et les seuls emails présents sont ceux de Romain et de son épouse,
> saisis pour tester les envois.
>
> **La question n'est donc pas « faut-il réparer », mais « faut-il préparer ».** L'application est
> conçue pour collecter les coordonnées des contacts de clubs : le jour de la première invitation
> réelle, de vraies données personnelles de tiers entreront dans le classeur.
>
> ✅ **Le domaine B a été traité dans cette fenêtre, comme prévu** (session 7). Ce qui reste à
> faire **avant** la première invitation réelle n'est donc plus un audit, mais **trois décisions**
> — D-018, D-019, D-020 — dont **aucune ne demande d'écrire du code**. La fenêtre est encore
> ouverte ; elle ne se rouvrira pas.
>
> Deux protections sont déjà constatées dans le code : le classeur est **privé** (I-06) et l'onglet
> `ClubsInvites` est **exclu** des données publiques (`getAll`) et de tout accès sans clé admin.
> Leur efficacité réelle reste **NON VÉRIFIÉE** — elle sera éprouvée au domaine B.

---

## 9. INVENTAIRE FACTUEL DU DÉPÔT (constaté)

> Relevé chiffré de ce qui existe. Complété en session 2 par la lecture réelle des fichiers.
> L'explication de **ce que tout cela fait** est dans `CARTOGRAPHIE.md`.

| Élément | Constat |
|---|---|
| `backend/Code.gs` | **8 277 lignes** *(relevé le 2026-08-19)*, **281 fonctions** *(compté le 2026-08-17)*, un seul fichier. 📐 **Valeur du jour : `wc -l backend/Code.gs`** — ⚡ **8 517 lignes au 2026-08-25** *(après M1-B2 / B2-0)* |
| `backend/Tests.gs` | ⭐ **4 244 lignes** — **300 fonctions de test, 703 vérifications, 0 échec** *(mesuré le 2026-08-17, après C-012 étapes 1 à 3 : 616 + 33 + 12 + 42)*. ✅ **Exécutables hors d'Apps Script** (démontré en session 8, ~1 s, avec une vingtaine de lignes de doublures). ⭐ **Ce total est CONFIRMÉ CHEZ GOOGLE le 2026-08-18** *(C-012 étape 4)* : `lancerTestsFFR` y donne **`R92 — 703/703 OK, 0 FAIL`**, avec la **dernière ligne de `Test.gs` = 4244** comme seconde preuve. *(Repères précédents, historiques : 4 038 lignes / 661 vérifications au 2026-08-16 ; 3 711 lignes / 589 vérifications, session 8.)* ⚡ **AU 2026-08-25** *(après M1-B2 / B2-0)* : **5 133 lignes**, bilan **`R92 — 880/880 OK, 0 FAIL`** constaté chez Google. ⛔ **Le repère opérationnel du jour ne se lit PAS ici** : sa source unique est [`../deploiement.md`](../deploiement.md) *(`CLAUDE.md` §8 quater)* |
| **Couverture mesurée** (session 8) | **104 fonctions sur 277 traversées = 38 %** · 173 jamais exécutées · **110** reçoivent le classeur (hors de portée par construction) · **85 pures et non testées** = testables aujourd'hui sans rien changer |
| Points d'entrée backend | `doGet` (ligne 313) = **15 actions de lecture** · `doPost` (ligne 2801) = **50 actions** |
| Onglets du Google Sheet | jusqu'à **12** (7 créés par `setupSheet`, `Mesures` à la demande, 4 `RefFFR_*` remplis à la main) |
| `frontend/` | 8 pages HTML, **26 fichiers JS = 17 712 lignes** (+ 4 bibliothèques dans `js/vendor/`), 6 feuilles CSS — **0 test**. Dossier publié : **3,2 Mo**, dont **183 Ko que rien ne charge** (R-080) |
| Frontend — code | **600 fonctions globales** (colonne 0) + 131 imbriquées, et **142 variables globales**, dans un espace unique ; **12 noms en double** (7 fonctions + 5 variables), **sans collision effective aujourd'hui — vérifié page par page** *(chiffre affiné en session 11 : le « 693 » des sessions précédentes mélangeait fonctions globales et imbriquées)* |
| **Qualité du code** *(session 12 — méthode écrite à côté de chaque chiffre en `AUDIT.md` §H)* | **Longueur médiane d'une fonction : 10 lignes** (serveur) et **9** (navigateur) · plus de 100 lignes : **11 sur 277** et **3 sur 600** · la plus longue : **327 l.** (serveur) et **135 l.** (navigateur) · **blocs de 8 lignes répétés : 0** dans `Code.gs`, **2** dans le frontend · **fonctions mortes : 1 sur 277** et **0 sur 600** · variables globales mortes : 0 et **1** · **imbrication maximale : 6 niveaux** des deux côtés · fonctions expliquées : **89 %** et **92 %** · lignes de commentaire : **31 %** et **25 %** · commentaires citant du code disparu : **0** *(25 suspects, tous vérifiés légitimes)* |
| **Miroirs serveur ↔ navigateur** *(session 12)* | **179 comparaisons exécutées** sur **16 familles** de règles, entrées tordues comprises — **0 écart**. Le barème du classement et l'ordre de départage sont **identiques au caractère près**. **1 seul miroir en désaccord**, trouvé à la lecture puis **prouvé par exécution** : le format sportif de la demande d'autorisation pour l'U14 en Super Challenge (**R-082**) |
| Frontend — dépendances internes | **13 paires de fichiers s'appellent mutuellement** ; `admin.js` appelle du code de **9** autres fichiers, dont **8** le rappellent (**R-077**) |
| Backend — couplage au classeur | ✅ `SpreadsheetApp.openById` **8 fois** en 8 147 lignes · **92 fonctions** reçoivent le classeur en paramètre · `calculerPlanning` (224 l., le cœur métier) **n'y touche pas du tout** |
| Backend — rangement | **26 bandeaux de section** dans `Code.gs` · `Tests.gs` : **277 groupes de tests**, **31 préfixes dont 27 sont des n° de session** (**R-076**) |
| Documentation — état | `architecture.md` documente **21 des 65 actions** (**68 % d'invisible**) et 4 pages sur 8 · `README.md` : 6 fichiers JS sur 26 · **`Tests.gs` cité par 0 document sur 6** (**R-072**, **R-073**) |
| Versions | **aucune** : `CHANGELOG.md` est **intégralement** sous `## [Non publié]`, et **`git tag` ne renvoie rien** — **revérifié le 2026-08-19**, après le lot 3 qui a rouvert le journal. ⚠️ **R-075 est donc ENTIER** : *rouvrir un journal n'est pas publier des versions* |
| Outillage | **aucun** `package.json`, aucune étape de construction, aucune vérification automatique, **aucun dépôt automatisé du serveur** (**R-081**) |
| Publication du frontend | `.github/workflows/pages.yml` publie `frontend/` sur Internet **à chaque envoi sur `main`** — **sans lancer aucun test, pas même un contrôle de syntaxe** (R-043) |
| Règles écrites **en double** (serveur + navigateur) | **29 mentions de « miroir »** dans le frontend, dont le **barème et le départage**. Rien ne vérifie qu'elles disent la même chose (R-044) |
| `docs/` | 11 documents existants (architecture, déploiement, guide utilisateur, passation…) |
| `AUDIT-TOURNOI-R92.md` | Audit de conformité FFR, ~129 000 caractères, méthode par sessions propre |
| `CHANGELOG.md` | ~197 000 caractères |
| `.github/workflows/pages.yml` | 1 automatisation de publication |
| `cloudflare/` | 1 dossier |
| Historique Git | **513 enregistrements** au total (relus **en entier** en session 6, à la recherche de mots de passe : **aucune fuite**). Branche de travail `claude/session-6-etape-2-securite-0tul4c`, partie de `dda3987` |
| `frontend/js/vendor/` | **4 bibliothèques extérieures**, **755 341 octets** *(~738 Kio, recompté le 2026-08-09)* : `pdf-lib`, `docxtemplater`, `pizzip`, `qrcode`. ✅ **Inventoriées depuis C-007** — `docs/dependances-externes.md` : taille, licence, date d'entrée, empreinte SHA-256. ⚠️ **Versions « à confirmer »** : aucune n'a pu être établie, et rien n'a été inventé |
| **Mesures de performance** *(session 10, sur l'application EN LIGNE)* | **Page publique** : prête en **527 ms**, chargée en **718 ms**, **59 Ko** transférés hors logo, **12 fichiers**. **Page de saisie** : **47 Ko**. **Administration** : **468 Ko** sur 25 fichiers, dont **207 Ko de `pdf-lib`** (44 %). **Logo** : **229 Ko** à lui seul (chargé en 700×558, affiché en 60×48) — servi par l'autre dépôt |
| **Serveur Google** *(42 appels chronométrés)* | Plancher **2,3 s** (`ping`, qui n'exécute rien) · `getAll` médiane **≈ 2,1 s** · cache chaud **1,36-2,05 s** · cache froid **4,36-6,30 s** · pointes observées **16,8 s** et **20,1 s** (au-delà du délai d'abandon de 12 s) · **25 lectures simultanées → 25/25 servies**, la plus lente à 8,57 s |
| **Instantané public servi** | **30 460 octets** pour **51 matchs / 37 équipes** — **466 o par match**, **142 o par équipe**. **58 % du poids des matchs = des champs vides** (17 champs vides sur 27). Le cache serveur **s'éteint au-delà de 95 000 o**, soit **≈ 165 matchs** (R-062) |

---

## 10. REGISTRE DES POINTS EN SUSPENS

> **À quoi sert cette section.** Décision **D-024** : rien n'est tranché pendant l'ÉTAPE 2. Tout
> ce qui attend une réponse est **accumulé ici**, puis repris **une par une** au début de
> l'ÉTAPE 3. Ce tableau est **mis à jour à la fin de chaque session d'audit** — c'est le seul
> endroit où regarder pour savoir ce qui reste ouvert.

**Dernière mise à jour du registre** : 2026-08-05 (**session 13 — volet ① de l'ÉTAPE 3**).

> 🏁 **CE REGISTRE EST COMPLET, ET IL A ÉTÉ TRAITÉ.** Les huit domaines ont parlé ; plus aucun
> audit ne viendra l'alimenter. Il a été repris **point par point** au volet ① de l'ÉTAPE 3, dans
> l'ordre de **§10.4** :
>
> | | Avant la session 13 | Après |
> |---|---|---|
> | **Décisions en attente** | 6 | ✅ **0** |
> | **Inconnues ouvertes** | 9 | **7** — *I-16 levée, I-14 partiellement · ⚡ I-21 ajoutée **puis levée le jour même**, par la réponse fédérale* |
> | **Inconnues qui BLOQUENT le plan** | *jamais compté* | ✅ **0** |
>
> **Ce qu'il faut retenir des 7 inconnues restantes** : 2 sont des **courriels à envoyer** (I-10 à
> la FFR, I-15 au club), 2 des **vérifications de 5 minutes** ne touchant que des P2 (I-08, I-09),
> 1 ne se lèvera **que le jour du tournoi** (I-19), 1 est **sans effet sur le plan** (I-20), et 1
> est **permanente** (I-01 — le code en service chez Google, c'est **M-02**, on la compense, on ne
> la lève pas).

> ✅ **Le domaine H n'a ajouté NI décision NI inconnue** — le seul des huit dans ce cas. Ses sept
> problèmes sont des constats techniques qui n'appellent aucun arbitrage de Romain pour être
> constatés, seulement pour être **ordonnés**, à l'ÉTAPE 3 (**D-024**).
>
> Il a en revanche **requalifié R-044** (les deux copies des règles sont d'accord : 179
> comparaisons, 0 écart) et **ajouté M-06** (les chiffres de l'audit ne portent pas leur méthode de
> mesure — trois d'entre eux étaient faux).
>
> Une seule chose est à **savoir** : **R-082 devient P1 le jour où le club accueille réellement un
> Super Challenge de France.** Ce n'est pas une question posée à Romain, c'est un **déclencheur** à
> inscrire, comme celui de **D-022**.

> ⚡ **UNE REMARQUE DE ROMAIN A OUVERT LA SEULE QUESTION QUE LE CADRE NE POSAIT PAS.**
>
> *« C'est une phase de pré-industrialisation, pas une fermeture totale des fonctionnalités de
> l'app — il y aura forcément des ajouts de code et de fonctionnalités. »*
>
> **C'est exact, et le cadre n'en disait rien** : ni `CLAUDE.md`, ni `DECISIONS.md` ne prévoient ce
> qui se passe quand du code neuf arrive **pendant** l'audit. Or c'est le cas — chantier
> fonctionnalités à sa **session 28**, déployée la **veille** du démarrage de l'industrialisation.
>
> Conséquence inscrite : **M-05** (risque de méthode) et **D-029** — ✅ **tranchée ET appliquée le
> jour même**. Le point à retenir : **deux problèmes sur 81 coûtaient quelque chose à attendre** —
> **R-072** et **R-073** — et ce sont justement les deux qui ne demandaient **aucune ligne de code**.
>
> ✅ **Ce sont donc les deux SEULES mesures exécutées hors ÉTAPE 3 depuis le début du chantier**
> (avec la correction du P0, R-014, par exception D-016). Le critère qui les a fait passer est
> **cumulatif** : *aucun code touché* **ET** *un coût d'attente qui court à chaque livraison*.
> Aucun autre problème ne remplit les deux.

> ✅ **Le domaine G a ajouté UNE décision (D-028) et UNE inconnue (I-20) — et la décision est déjà
> tranchée.**
>
> ✅ **D-028 — TRANCHÉE le 2026-08-05 : le fichier serveur n'est PAS découpé** tant que le dépôt
> chez Google est manuel. Découper en 5 fichiers transformerait **un** collage en **cinq**, donc
> cinq occasions d'en oublier un — précisément ce qui a produit **M-04**. ⚠️ **Ce n'est pas un
> permis d'agrandir le fichier**, et **R-074 reste ouvert** : le fichier est trop long, c'est
> constaté ; c'est la **correction** qui coûte plus cher que le problème. **Réouverture** : le jour
> où le dépôt cesse d'être manuel (**R-081**).
>
> **I-20 — quelqu'un d'autre reprendra-t-il ce code, et quand ?** Elle ne change **pas la nature**
> de **R-073** (la carte est fausse, que quelqu'un la lise ou non), seulement son **rang** de
> priorité. `docs/passation.md` §11 prévoit déjà une bascule vers les comptes de l'association.
>
> ⚠️ **Et une chose que le domaine G n'ajoute pas mais confirme** : **R-072 est le seul problème
> de tout le chantier qui se redéclenchera au prochain geste technique** — le prochain
> redéploiement du serveur, quel qu'il soit. Cinq lignes de texte le referment.

> ✅ **Le domaine F n'a ajouté AUCUNE décision en attente**, mais **deux inconnues — et les deux
> ont bougé le soir même.**
>
> **I-18 est LEVÉE** : 128 exécutions réelles analysées, la capacité est chiffrée.
>
> **I-19 est REFORMULÉE**, parce que Romain a montré qu'elle était **mal posée** : le nombre de
> spectateurs n'est pas prévisible (il dépend des équipes, des éducateurs, des parents présents
> **et de ceux qui suivent depuis la maison ou le travail** — un public que l'audit avait
> entièrement oublié). Sa remarque a **corrigé une conclusion trop pessimiste** : la capacité se
> compte en **écrans allumés sur la page**, pas en personnes — or la page **se met en pause** dès
> que l'onglet n'est plus visible. **Conduite à tenir qui en découle** : porter le rafraîchissement
> de 15 s à 30 s (**R-064**, un chiffre à changer) suffit jusqu'à ~1 000 personnes qui suivent ;
> le relais (**R-061**) ne devient nécessaire qu'au-delà. Détail : `AUDIT.md` **§F.10**.
>
> ✅ **Le domaine E n'avait ajouté AUCUNE décision en attente et AUCUNE inconnue.** Ses 10 problèmes
> sont des **choix techniques** — ils n'appellent aucun arbitrage de Romain pour être constatés,
> seulement pour être **ordonnés**, à l'ÉTAPE 3 (**D-024**). Il a en revanche **levé I-05**.
>
> Une seule chose lui est **recommandée**, et elle n'est ni une question ni une décision :
> **essayer la saisie pour de vrai**, trente minutes, dehors, avec deux ou trois bénévoles et
> **leurs** téléphones. C'est la seule façon de vérifier ce qu'aucune mesure ne peut établir.

### 10.1 — Ce qui ne doit PAS attendre *(les trois exceptions de D-024)*

| # | Quoi | Pourquoi ça ne peut pas attendre |
|---|---|---|
| **D-017** | **Remplacer les deux clés par des suites aléatoires** | Ce n'est pas une question, c'est une **action** : cinq minutes, aucune réflexion, et elle referme **R-019** (P1). Menu du classeur → « Configurer les clés » |
| **I-10** *(élargie)* | **Question à la FFR** : le sort d'un match qui n'a pas pu se jouer (forfait, intempéries) est-il encadré — ⚡ **et celui d'un tournoi entier interrompu ou annulé** ? | **Question sortante** — Directeur EDR du Racing / Comité 92. Le délai de réponse ne dépend pas de nous. Une règle fédérale primerait sur **D-011**, **D-015** et **D-030** |
| ~~⚡ **I-21**~~ | ~~Peut-on réduire le temps de jeu en cas de force majeure ?~~ | ✅ **LEVÉE le 2026-08-05** — **oui**, sous réserve du **temps de jeu maximal** et de **l'interdiction des phases finales**. Le niveau 2 de D-030 est **débloqué** |
| **I-15** | **Question au club** : le droit à l'image des enfants est-il géré ailleurs (licence FFR, document du club, consigne aux clubs invités) ? | **Question sortante** — même raison. Le mécanisme a été retiré de l'application le 2026-08-03 sur décision du club, sans que rien n'écrive ce qui l'a remplacé (**R-036**) |

| ~~**I-17**~~ | ~~Recoller `Tests.gs` chez Google et relancer~~ | ✅ **FAIT le 2026-08-05 — `589/589 OK, 0 FAIL`.** M-04 refermé |

> Ces trois-là ne coûtent rien à traiter tout de suite, et les garder en réserve ne protégerait
> rien. **Un P0 découvert dans un audit à venir constituerait une quatrième exception** : il
> serait présenté immédiatement, comme R-014 l'a été (**D-016**).

### 10.2 — Décisions en attente

> 🏁 **PLUS AUCUNE DÉCISION N'EST EN ATTENTE.** Les six dernières ont été reprises **une par une**
> au volet ① de l'ÉTAPE 3 (session 13, 2026-08-05) et **toutes tranchées le même jour**. Le détail
> de chacune est en **§7** et dans `DECISIONS.md`.

| Réf | La question | Née en | Statut |
|---|---|---|---|
| ~~**D-029**~~ | ~~Comment les deux chantiers cohabitent~~ | ~~Session 11~~ | ✅ **TRANCHÉE ET APPLIQUÉE le 2026-08-05** — *« applique les deux »*. Voir §7 |
| ~~**D-028**~~ | ~~Faut-il découper le fichier serveur de 8 147 lignes ?~~ | ~~Session 11~~ | ✅ **TRANCHÉE le 2026-08-05** — **non**, tant que le dépôt chez Google est manuel |
| ~~**D-005**~~ | ~~Le site vitrine `boutique-r92` entre-t-il dans le chantier ?~~ | ~~Session 1~~ | ✅ **TRANCHÉE (session 13)** — **non** : périmètre fermé, ce qui est vu ailleurs est **signalé** (V-01 → V-04) |
| ~~**D-009**~~ | ~~Où atterrit la documentation quand une branche est imposée ?~~ | ~~Session 2~~ | ✅ **TRANCHÉE (session 13)** — **D-006 conservé** : la doc va sur `main`, une branche imposée y est ramenée avant la fin de session |
| ~~**D-018**~~ | ~~Que dit-on aux personnes dont on garde les informations ?~~ | ~~Session 7~~ | ✅ **TRANCHÉE (session 13)** — **oui**, trois textes rédigés, dont une **section « Tournoi »** pour la page RGPD existante. Débloquée par **I-16** |
| ~~**D-019**~~ | ~~Que fait-on de la mesure des partenaires ?~~ | ~~Session 7~~ | ✅ **TRANCHÉE (session 13)** — **voie (a)** : informer, sans bandeau, avec un moyen de dire non |
| ~~**D-020**~~ | ~~Combien de temps garde-t-on quoi ?~~ | ~~Session 7~~ | ✅ **TRANCHÉE (session 13)** — **le tableau des 7 durées est adopté tel quel**. ⚠️ Aucun effacement automatique |
| ~~**D-025**~~ | ~~Quels tests écrit-on, et dans quel ordre ?~~ | ~~Session 8~~ | ✅ **TRANCHÉE (session 13)** — **lot ① seul** (barème et départage), **AVANT** la correction du départage. C'est **la contrainte d'ordre la plus importante du chantier** |

> ⚠️ **Reste une ACTION, qui n'a jamais été une question** : **D-017** — remplacer les deux clés par
> des suites aléatoires. Cinq minutes, aucun code, referme **R-019** (P1).

### 10.3 — Inconnues à lever

| Réf | Ce qu'on ne sait pas | Comment le lever | Pour quel domaine |
|---|---|---|---|
| **I-01** | Le code en service chez Google est-il identique à `backend/Code.gs` ? | Vérification de Romain dans Apps Script | Permanent (**M-02**) |
| ~~**I-05**~~ | ~~Qui utilise l'administration le jour J, et sur quel matériel ?~~ | ✅ **LEVÉE le 2026-08-05** (session 9) — voir §8 | ~~E — UX~~ |
| **I-08** | Une image mise à la corbeille du Drive reste-t-elle visible par un lien déjà diffusé pendant ~30 jours ? | Test réel de 5 minutes : corbeille, puis rouvrir le lien en navigation privée | **B** — **R-035** |
| **I-09** | Que conserve le journal d'exécution de Google Apps Script, et combien de temps ? | Consultation dans l'éditeur Apps Script (« Exécutions ») | **B / C** — **R-023**, **R-039** |
| **I-10** *(élargie)* | La FFR encadre-t-elle le sort d'un match non joué — ⚡ **et d'un tournoi entier interrompu ou annulé** ? | **Question sortante** — voir §10.1 | **A** — D-011, D-015, **D-030** |
| ~~⚡ **I-21**~~ | ~~Peut-on **réduire le temps de jeu** en cas de force majeure ?~~ | ✅ **LEVÉE le 2026-08-05** — **oui**, sous réserve du temps de jeu maximal et de l'interdiction des phases finales. Voir §8 et `DECISIONS.md` **D-030 §8** | ~~A~~ |
| **I-14** *(partiellement levée le 2026-08-05)* | ✅ **« Qui » est répondu** : *Génération R92*, contact `generationr92@gmail.com` — trouvé en levant **I-16**, avec la réserve que la **déclaration est en cours**. ❓ **Reste** : le classeur doit-il rester dans un compte Google individuel ? | Réponse de Romain **au déclencheur** — non bloquant aujourd'hui (**D-021**), et **plus du tout bloquant pour D-018** | **B** — **R-039** |
| **I-15** | Le droit à l'image des enfants est-il géré ailleurs ? | **Question sortante** — voir §10.1 | **B** — **R-036** |
| ~~**I-16**~~ | ~~Le site vitrine porte-t-il déjà des mentions légales ou une page de confidentialité ?~~ | ✅ **LEVÉE le 2026-08-05** (session 13) — **oui**, et elle livre le **responsable** et **l'adresse de contact** qui bloquaient D-018. ⚠️ Mais elle **ne parle pas du tournoi** : R-028 reste entier | ~~B~~ |
| ~~**I-18**~~ | ~~Combien de temps une demande occupe-t-elle réellement le serveur de Google ?~~ | ✅ **LEVÉE le 2026-08-05** — 128 exécutions analysées, capacité ≈ 150-300 spectateurs. Voir §8 et `AUDIT.md` §F.9 | ~~F~~ |
| **I-20** | **Quelqu'un d'autre que Romain reprendra-t-il ce code, et quand ?** `docs/passation.md` §11 prévoit une bascule vers les comptes de l'association (dont l'adresse d'envoi, vers le compte de Jérémy) — mais cela concerne les **comptes**, pas forcément le **code** | **Réponse de Romain.** ⚠️ **Non bloquante** : elle ne change pas la nature de **R-073** (la carte est fausse, que quelqu'un la lise ou non), seulement son rang de priorité | **G** — **R-073** |
| **I-19** *(reformulée le 2026-08-05)* | **Quelle part du public regarde son écran au MÊME INSTANT lors d'un pic** (fin de match, annonce du classement) ? ⚠️ **La question d'origine — « combien de spectateurs ? » — était mal posée** : Romain a montré qu'elle n'est pas prévisible (elle dépend des équipes présentes, des éducateurs, des parents sur place **et de ceux qui suivent depuis la maison ou le travail**). Elle est en revanche **calculable** : `Equipes` porte déjà `nb_joueurs` et `nb_educateurs`, remplies par les clubs à leur réponse | Le seul paramètre qui ne se déduit d'aucune donnée. La page se mettant en pause quand l'onglet n'est pas visible, seuls comptent les **écrans allumés sur la page** | **Observation le jour J** : regarder le journal « Exécutions » **pendant** le tournoi | **F** — **R-061**, **R-064** |

### 10.4 — Comment ce registre a été traité

À l'ouverture de l'**ÉTAPE 3**, les points ci-dessus ont été repris **un par un**, dans cet ordre :

1. ✅ **les inconnues d'abord** — on ne décide pas sur du sable. *Fait au volet ① : 9 → 7, et
   **I-16** levée par une simple lecture du site vitrine public, ce qui a débloqué **D-018*** ;
2. ✅ **puis les décisions**, chacune présentée avec : le problème en langage simple, les options,
   ce que chacune coûte et apporte, et une recommandation. *Fait au volet ① : **les 6 tranchées le
   même jour***, dont **D-025** qui fixe la contrainte d'ordre du chantier ;
3. 🔜 **puis seulement** le tableau des chantiers de `PLAN.md` — **volets ② (sans code) et ③ (avec
   code)**, à venir.

> ⚠️ **Chaque session d'audit doit alimenter ce registre avant de se clore.** Une question
> soulevée mais non inscrite ici est une question perdue — c'est exactement ce que **D-001**
> cherche à empêcher.
