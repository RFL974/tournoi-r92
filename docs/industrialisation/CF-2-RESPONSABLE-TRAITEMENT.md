# CF-2 — QUI DÉCIDERA DE L'USAGE DES DONNÉES ?

## Dossier de décision, à présenter le moment venu

> 📋 **Livrable de l'étape CF-2 du chantier Confiance.** Rédigé le **2026-08-19**.
>
> ⛔ **CE DOSSIER NE DÉCIDE RIEN. IL PRÉPARE UNE DÉCISION FUTURE.**
>
> 🔗 Les textes officiels cités le sont par leur identifiant — **[R1]**, **[R20]**, **[R21]** — dont
> le contenu vit dans **[`REFERENTIELS.md`](REFERENTIELS.md)**, source unique *(`CLAUDE.md`
> §8 quinquies)*. ⛔ **Rien n'est recopié ici.**

---

## SOMMAIRE

- [0. ⚠️ À lire avant tout — où en est réellement Maxilou](#0--à-lire-avant-tout--où-en-est-réellement-maxilou)
- [1. La question à décider](#1-la-question-à-décider)
- [2. Pourquoi cette question existe](#2-pourquoi-cette-question-existe)
- [3. ⭐ Où passe vraiment la frontière](#3--où-passe-vraiment-la-frontière)
- [4. Les trois configurations possibles](#4-les-trois-configurations-possibles)
- [5. Tableau comparatif des conséquences](#5-tableau-comparatif-des-conséquences)
- [6. Les rôles possibles de Romain](#6-les-rôles-possibles-de-romain)
- [7. Ce qui ne change pas, quelle que soit l'option](#7-ce-qui-ne-change-pas-quelle-que-soit-loption)
- [8. Les questions à poser pour trancher](#8-les-questions-à-poser-pour-trancher)
- [9. 🔲 LA DÉCISION À OBTENIR — volontairement NON PRISE](#9--la-décision-à-obtenir--volontairement-non-prise)

---

## 0. ⚠️ À LIRE AVANT TOUT — OÙ EN EST RÉELLEMENT MAXILOU

**Ce dossier ne constate aucun manquement. Il n'y a rien à réparer.**

| Fait | Établi par |
|---|---|
| Maxilou est **développé personnellement par Romain**, de sa propre initiative | Précision de Romain, 2026-08-19 |
| ⛔ **L'École de Rugby du Racing Club de France et l'association Génération R92 n'ont ni commandé, ni étudié, ni validé, ni adopté Maxilou** | idem |
| Le tournoi en base est **fictif** — vrais noms de clubs, engagements inventés | `ETAT.md` **I-04** |
| Le classeur **ne contient aucune donnée personnelle de tiers** — seules adresses présentes : Romain et son épouse, pour tester les envois | `ETAT.md` **I-03** |
| **Aucune journée réelle n'a jamais été jouée** avec cette application | `RAPPORT-AUDIT.md` §7 |
| ⛔ **Aucune date** de tournoi réel, d'invitation ou de mise en production n'existe | Précision de Romain |

> 🏉 **En langage de terrain.** Ce dossier ne dit pas *« vous avez un problème »*. Il dit : *« le
> jour où de vraies familles enverront de vraies informations, il faudra savoir qui en répond.
> Voici la question, et voici comment y répondre — quand vous le déciderez. »*

### Le parcours prévu, et où ce dossier se situe

```
 ① construire et fiabiliser  ← 🔵 NOUS SOMMES ICI (données fictives)
 ② atteindre un état jugé suffisamment propre
 ③ présenter à l'EDR et/ou à Génération R92    ← 📋 CE DOSSIER SERT ICI
 ④ recueillir validation et retours            ⛔ elles peuvent refuser
 ⑤ implémenter les retours validés             (toujours données fictives)
 ⑥ retester
 ⑦ recontrôler la confiance si les retours changent quoi que ce soit
 ⑧ 🔴 JALON EXPLICITE : passage aux données réelles
```

> ⛔ **Ce dossier ne sera présenté qu'à l'étape ③.** Le présenter aujourd'hui reviendrait à demander
> à des responsables associatifs de décider du sort d'un logiciel **qu'ils n'ont pas vu**.

---

## 1. LA QUESTION À DÉCIDER

> # 🔲 **Qui décide de l'utilisation des données traitées par Maxilou pour l'organisation des tournois ?**

C'est **une seule question**, et elle porte sur **le pouvoir de décision** — pas sur qui possède
l'ordinateur, pas sur qui a écrit le programme, pas sur qui tape sur le clavier.

---

## 2. POURQUOI CETTE QUESTION EXISTE

### 2.1 — En langage simple

Quand une organisation enregistre des informations sur des personnes — le nom et le courriel du
contact d'un club, le téléphone d'un responsable sécurité, le nom d'un médecin — **la loi demande
qu'une organisation identifiée en réponde**.

Cette organisation doit pouvoir dire :

- **pourquoi** elle garde ces informations ;
- **combien de temps** ;
- **qui** peut les consulter ;
- et **à qui** s'adresser pour les corriger ou les faire effacer.

> 🏉 **L'analogie du tournoi.** Le jour du tournoi, il y a un **responsable sécurité**. Ce n'est ni
> celui qui a monté les buts, ni celui qui tient la table de marque : c'est **la personne désignée
> qui répond si quelque chose arrive**. Pour les informations sur les personnes, c'est pareil — il
> faut **une organisation désignée**, et elle doit l'être **avant**, pas le jour où on la cherche.

### 2.2 — Ce que dit le texte

**[R1]** définit le responsable du traitement comme celui qui *« détermine les finalités et les
moyens »* — autrement dit **le pourquoi et le comment**.

⭐ **Et ce point est décisif** : **[R20]** précise que ces notions sont **fonctionnelles** — elles
répartissent les responsabilités *« en fonction des **rôles réels joués** par les parties »*.
⛔ **Ni un contrat, ni un titre, ni la propriété d'un logiciel ne suffisent.**

### 2.3 — Pourquoi il faut y répondre AVANT le premier vrai tournoi

Quatre choses **dépendent de cette réponse**, et aucune ne peut être écrite sans elle :

| Ce qui dépend de la réponse | Pourquoi |
|---|---|
| **Le texte d'information des clubs** *(chantier **CF-5**)* | Il doit **nommer** l'organisation responsable et donner **son** adresse de contact |
| **Le registre des traitements** *(**CF-6**)* | C'est le responsable qui le tient |
| **Les mentions légales** *(**CF-4**)* | Elles nomment l'éditeur |
| **Le compte Google institutionnel** *(**CF-3**)* | Il doit être ouvert **au nom** de l'organisation responsable |

> ✅ **La bonne nouvelle** : les textes de **CF-5** sont **déjà rédigés**
> *(`docs/textes-information-donnees.md`)*, avec l'organisation à nommer laissée **entre crochets**.
> Le jour où la réponse arrive, **on remplit les crochets — on ne réécrit rien.**

---

## 3. ⭐ OÙ PASSE VRAIMENT LA FRONTIÈRE

> ⚠️ **La section la plus importante du dossier — et celle où deux erreurs symétriques guettent.**
>
> | L'erreur | Ce que disent les textes |
> |---|---|
> | Croire que **celui qui détient ou a écrit le logiciel** est automatiquement responsable | ⛔ **Faux** — **[R20]** : le choix d'un logiciel est un moyen **non essentiel** |
> | Croire qu'**adopter un logiciel tout fait dispense de responsabilité** | ⛔ **Faux aussi** — **[R21]** : *« traitement sur étagère »*, voir ci-dessous |

### 3.1 — Les moyens ESSENTIELS et les moyens NON ESSENTIELS

**[R20]** coupe les « moyens » en deux, et c'est **cette coupure** qui décide de tout :

| | Ce que c'est | Les exemples **du texte** | Qui décide |
|---|---|---|---|
| ⭐ **Moyens ESSENTIELS** | *« étroitement liés à la finalité et à la portée du traitement »* | **quelles données** · **combien de temps** · **qui y a accès** · **de qui** | 🔴 **Réservés au responsable — par nature** |
| **Moyens NON ESSENTIELS** | Les *« aspects plus pratiques de la mise en œuvre »* | le **choix d'un logiciel** ou d'un matériel · les **mesures de sécurité détaillées** | ✅ **Peuvent être laissés à un prestataire** |

> ⚠️ **Attention à ne PAS sur-lire la case en bas à droite** — c'est le piège de cette section.
>
> **Ce que [R20] dit** : *« le choix d'un logiciel »* est un **moyen NON essentiel**. ➡️ Les
> **modalités techniques** peuvent donc être déléguées.
>
> ⛔ **Ce que cela ne dit PAS**, et **[R21]** le corrige explicitement :
>
> > *« Même si un acteur choisit un **"traitement sur étagère"**, défini à l'avance, **il peut être
> > considéré comme responsable du traitement dès lors qu'il effectue ce choix au regard de ses
> > besoins**. »*

**La formulation exacte, qui tient les deux bouts :**

| | |
|---|---|
| ✅ **Concevoir techniquement Maxilou, ou choisir un logiciel, ne suffit pas à soi seul à déterminer la responsabilité** | **[R20]** — moyen non essentiel |
| 🔴 **En revanche, l'acteur qui décide d'utiliser Maxilou POUR SES PROPRES FINALITÉS et détermine les moyens essentiels peut être responsable du traitement — même si les choix techniques détaillés sont délégués** | **[R21]** — *« traitement sur étagère »* |

> ⭐ **Autrement dit** : ce n'est pas **l'outil** qui décide, c'est **l'usage qu'on décide d'en
> faire**. Une structure qui adopterait Maxilou pour organiser **ses** tournois ne pourrait pas
> dire *« c'est un logiciel tout fait, je n'y suis pour rien »*.

### 3.2 — Les quatre gestes, et ce que chacun emporte

| Le geste | Ce que c'est concrètement, sur Maxilou | Ce que ça emporte |
|---|---|---|
| **① CONCEVOIR** *(sans accès aux données réelles)* | Écrire le programme, choisir comment les écrans sont faits, puis **livrer** | ⛔ **Rien à soi seul.** Moyen **non essentiel** *([R20])* · ⭐ **[R21]** confirme par l'exemple inverse : *« les fabricants de matériels (logiciels…) ne sont pas des sous-traitants puisqu'ils **n'ont pas accès** »* |
| **② ADMINISTRER TECHNIQUEMENT** | Déployer le serveur, gérer les clés, sauvegarder — **en accédant aux données** | ⚠️ **Cela dépend de l'ACCÈS et du CADRE.** **[R21]** est explicite : *« le développeur d'une application doit être qualifié de **sous-traitant** lorsqu'il réalise des opérations sur des données […] à des fins de **maintenance ou d'infogérance** »* — ⚠️ **sauf s'il agit en interne** *(voir ③)* |
| **③ SAISIR OU INTERVENIR SUR INSTRUCTION** | Entrer un club, corriger un contact, à la demande d'une structure | ⚠️ **Deux cas, à ne pas confondre** : **en interne**, sous l'autorité directe → **art. 29 [R1]**, ni responsable ni sous-traitant · **de l'extérieur, comme prestation autonome** → **sous-traitance à examiner** *([R21])* |
| **④ DÉCIDER** | *« On demande le courriel du contact »* · *« On garde le carnet 3 éditions »* · *« Les clubs voient leur planning »* · ⭐ *« On adopte Maxilou pour NOS tournois »* | 🔴 **C'est CELA, être responsable du traitement** — **[R20]** et **[R21]** |

> ⭐ **La frontière principale passe entre ③ et ④** : en dessous, on **exécute** ; au-dessus, on
> **décide**. **Le RGPD attribue la responsabilité à la décision.**
>
> ⚠️ **Mais une seconde frontière traverse ② et ③**, et elle est tout aussi importante : **agir en
> interne** *(art. 29)* ou **de l'extérieur pour le compte d'autrui** *(sous-traitance)*. ⭐ **Ce
> qui la départage n'est ni le métier ni le titre : c'est l'ACCÈS EFFECTIF aux données et le CADRE
> dans lequel on intervient.**

### 3.3 — Ce que cela donne aujourd'hui, sur les décisions déjà prises

⚠️ **Constat de fait, pas de qualification juridique.** Plusieurs décisions relevant des **moyens
essentiels** ont déjà été prises pendant le développement, et **elles l'ont été par Romain seul** :

| Décision déjà prise | Nature au sens de [R20] | Où elle est tracée |
|---|---|---|
| Quelles données sont demandées à un club *(nom, prénom, courriel du contact, effectifs)* | ⭐ **Moyen essentiel** | Structure du classeur |
| Combien de temps on les garde *(les 7 durées)* | ⭐ **Moyen essentiel** | **D-020** · `conservation-donnees.md` |
| Qui y a accès *(la liste blanche des vues publiques, le jeton par club)* | ⭐ **Moyen essentiel** | `architecture.md` §2.1 |
| De qui *(des adultes contacts de clubs — ⭐ **aucune donnée nominative d'enfant**)* | ⭐ **Moyen essentiel** | `textes-information-donnees.md` §2 |

> ⚠️ **Ce que ce constat NE dit PAS.** Il ne dit **pas** que Romain est responsable du traitement.
> **Aucun traitement de données réelles n'existe** *(§0)* : on ne peut pas être responsable d'un
> traitement qui n'a pas commencé. **Ce sont des choix de conception faits sur des données
> fictives.**
>
> ⭐ **Ce qu'il dit, en revanche, et c'est utile** : ces choix **redeviendront des décisions au sens
> du RGPD** le jour où de vraies données entreront. **Il faudra alors qu'une structure les
> reprenne à son compte — ou les change.** ✅ **C'est une bonne nouvelle : elles sont toutes
> écrites, donc toutes révisables.**

---

## 4. LES TROIS CONFIGURATIONS POSSIBLES

> ⛔ **Aucune n'est recommandée ici.** Le choix appartient aux structures, et il dépend de faits que
> ce dossier ne connaît pas — voir **§8**.

### 🅰️ Configuration A — l'EDR du Racing Club de France, seule

**Ce que cela signifie** : l'EDR décide seule quelles données sont demandées, pourquoi, pour combien
de temps et qui y accède.

| | |
|---|---|
| **Qualification** | **EDR = responsable du traitement** — **art. 4(7) [R1]** |
| **Qui porte les obligations** | **L'EDR**, seule : information des personnes, registre, sécurité, réponse aux demandes, gestion d'un incident |
| **Rôle possible de Génération R92** | ⚠️ **Trois possibilités, selon les faits** : ⛔ **aucun rôle** *(elle n'intervient pas)* · **personnes agissant sous l'autorité de l'EDR** si ses bénévoles saisissent sur instruction *(art. 29)* · **sous-traitante** si elle traite **pour le compte** de l'EDR avec sa propre organisation *(art. 4(8) — exige alors un **contrat art. 28**)* |
| **Rôle possible de Romain** | Voir **§6** — dépend de son accès réel aux données |
| **Compte Google institutionnel** | ⭐ **À ouvrir au nom de l'EDR** *(ou de la structure juridique dont elle relève — voir la réserve ci-dessous)* |
| **Mentions et informations** | Nomment **l'EDR** et donnent **son** adresse de contact |

> ⚠️ **Une question de fait à établir — et surtout PAS une conclusion.**
>
> **Ce que le texte dit** : **[R1]** art. 4(7) vise *« la personne physique ou morale, l'autorité
> publique, **le service ou un autre organisme** »*, et **[R20]** en tire qu'*« en principe, il
> n'existe **aucune limitation quant au type d'entité** »* pouvant être responsable.
>
> ⛔ **Il ne faut donc PAS conclure qu'une École de Rugby sans personnalité morale propre serait
> écartée d'office.** Le RGPD raisonne de façon **fonctionnelle** : c'est le pouvoir réel de
> décision qui compte. ⚠️ *(La portée exacte du mot « organisme » pour une entité sans personnalité
> juridique a été soulevée en consultation publique du CEPD et **reste discutée** — raison de plus
> pour ne rien présumer.)*
>
> ✅ **La bonne réserve, et elle est pratique autant que juridique** : ⭐ **la structure juridique
> exacte qui porte l'École de Rugby doit être identifiée avant toute qualification définitive** —
> parce qu'il faudra une entité capable de **signer** *(un accord art. 26, un contrat)*, d'**ouvrir
> un compte**, et de **répondre** aux personnes.
>
> ❓ **INDÉTERMINÉ** — non déterminable depuis le dépôt, à établir avec les structures *(question
> **Q-I** au §8)*.

---

### 🅱️ Configuration B — l'association Génération R92, seule

**Ce que cela signifie** : Génération R92 décide seule des mêmes points.

| | |
|---|---|
| **Qualification** | **Génération R92 = responsable du traitement** — **art. 4(7) [R1]** |
| **Qui porte les obligations** | **Génération R92**, seule |
| **Rôle possible de l'EDR** | ⚠️ Mêmes trois possibilités que ci-dessus, symétriquement — ⛔ **et si l'EDR décide en réalité une partie des finalités, on bascule en configuration C, quel que soit ce qui aura été écrit** *([R21] : la CNIL peut requalifier sur les pratiques réelles)* |
| **Rôle possible de Romain** | Voir **§6** |
| **Compte Google institutionnel** | ⭐ **À ouvrir au nom de Génération R92** |
| **Mentions et informations** | Nomment **Génération R92** |

> ✅ **Un élément de fait, et rien de plus** : le site vitrine existant porte **déjà** une page de
> confidentialité qui nomme *Génération R92* et l'adresse `generationr92@gmail.com`
> *(constat du chantier C-005)*. ⛔ **Cela ne détermine rien** : c'est le responsable **de ce
> site-là**, pas celui du traitement de Maxilou. ⚠️ **Ce constat ne doit jamais être lu comme une
> décision déjà prise** — voir **D-038**.
>
> ✅ **Mais c'est un élément pratique réel** : si cette configuration était retenue, une partie du
> dispositif d'information existerait déjà.

---

### 🅲 Configuration C — les deux ensemble

**Ce que cela signifie** : l'EDR et Génération R92 déterminent **conjointement** les finalités
et/ou les moyens essentiels. Par exemple : l'EDR décide quels clubs sont invités et quelles données
leur sont demandées, Génération R92 décide de la conservation du carnet et répond aux demandes.

| | |
|---|---|
| **Qualification** | 🔴 **Responsables CONJOINTS** — **art. 26 [R1]** |
| ⚠️ **Ce que cela ajoute** | **Un accord écrit entre les deux structures devient OBLIGATOIRE.** C'est la seule configuration qui crée une obligation supplémentaire |
| **Ce que l'accord devrait organiser** *(art. 26 §1)* | ⛔ **Ce dossier ne le rédige pas** — il liste seulement ce qu'il devrait couvrir : **qui informe** les personnes *(art. 13-14)* · **qui répond** aux demandes d'accès, de correction et d'effacement · **qui déclare** un incident à la CNIL et sous quel délai · **qui tient** le registre · **qui détient** le compte Google · **qui décide** d'ajouter ou retirer une donnée · **le point de contact** publié |
| ⚠️ **Le point à connaître avant de choisir** | **art. 26 §3** : *« la personne concernée peut exercer ses droits à l'égard de **ET CONTRE CHACUN** des responsables »*. ➡️ **Un club pourra s'adresser à l'une OU à l'autre, indifféremment — même si l'accord interne dit autre chose.** L'accord répartit le travail **entre elles**, il ne se distribue pas aux tiers |
| **Rôle possible de Romain** | Voir **§6** |
| **Compte Google institutionnel** | ⚠️ **Un seul compte, détenu par UNE des deux structures**, désignée dans l'accord. ⛔ **Un compte « à deux » n'existe pas** |
| **Mentions et informations** | Nomment **les deux**, et indiquent **le point de contact unique** |

> 🎯 **Ce qu'il faut comprendre de la configuration C, en une phrase.** Elle n'est **pas** plus
> sévère que les autres — mais elle **ne se laisse pas improviser** : elle exige un document signé
> entre deux structures, ce qui prend du temps. **La choisir tôt coûte peu ; la découvrir tard
> coûte cher.**

---

## 5. TABLEAU COMPARATIF DES CONSÉQUENCES

> 📋 **Cartographie des effets — pas leur exécution.** Rien de ce qui suit n'est fait, ni décidé.

| Sujet | 🅰️ EDR seule | 🅱️ Génération R92 seule | 🅲 Les deux |
|---|---|---|---|
| **Responsable du traitement** | EDR *(⚠️ entité juridique porteuse à identifier — Q-I)* | Génération R92 | **Les deux, conjointement** |
| **Responsables conjoints** | ❌ Non | ❌ Non | ✅ **OUI — accord art. 26 obligatoire** |
| **Personnes autorisées** *(art. 29)* | Bénévoles et marqueurs de l'EDR | idem, côté G-R92 | Des **deux** structures — l'accord dit qui autorise |
| **Sous-traitants éventuels** | Google *(via [R13])* · ⚠️ l'autre structure **si** elle traite pour le compte de l'EDR | symétrique | Google · ⛔ **les deux structures ne sont PAS sous-traitantes l'une de l'autre** |
| **Registre des traitements** | Tenu par l'EDR | Tenu par G-R92 | ⚠️ **Chacune tient le sien** pour sa part |
| **Information des personnes** | Nomme l'EDR | Nomme G-R92 | ⚠️ Nomme **les deux** + le point de contact — *l'accord désigne qui rédige* |
| **Exercice des droits** | Auprès de l'EDR | Auprès de G-R92 | ⚠️ **Auprès de l'une OU de l'autre**, au choix de la personne *(art. 26 §3)* |
| **Gestion des incidents** | L'EDR notifie sous **72 h** | G-R92 notifie | ⚠️ **L'accord doit désigner qui notifie — sinon les deux sont exposées** |
| **Compte Google institutionnel** | ⭐ **Au nom de l'EDR** | ⭐ **Au nom de G-R92** | ⭐ **Au nom de la structure désignée** — un seul |
| **Propriété du Sheet** | Suit le compte | Suit le compte | Suit le compte |
| **Propriété du Drive** *(affiches, photos)* | Suit le compte | Suit le compte | Suit le compte |
| **Propriété et déploiement Apps Script** | Suit le compte ; ⚠️ **qui a le droit de redéployer doit être écrit** | idem | idem, **désigné dans l'accord** |
| **Boîte d'envoi des courriels** | Adresse de l'EDR | Adresse de G-R92 | ⚠️ **Une seule adresse d'envoi** — les clubs doivent savoir qui leur écrit |
| **Mentions légales** *(**CF-4**)* | Éditeur = EDR | Éditeur = G-R92 | ⚠️ **À trancher : un éditeur, ou les deux ?** |
| **Documentation de passation** | `passation.md` : cible = EDR | cible = G-R92 | cible = structure désignée |
| **Données partenaires** *(si la mesure est conservée — **CF-7**)* | L'EDR décide de la finalité et du destinataire de la fiche | G-R92 décide | ⚠️ **À désigner dans l'accord** — c'est une finalité **distincte** de l'organisation du tournoi |
| **En cas de désaccord entre les structures** | *(sans objet)* | *(sans objet)* | ⚠️ **L'accord devrait prévoir comment on tranche** — sinon le blocage est possible |

### Quelle structure aurait « vocation » à détenir l'environnement Google ?

⚠️ **Ce n'est pas une recommandation de choisir A, B ou C** — c'est une conséquence mécanique :

> ⭐ **Le compte Google institutionnel a vocation à appartenir à la structure DÉSIGNÉE RESPONSABLE
> DU TRAITEMENT** — quelle qu'elle soit.

**Pourquoi**, et ce n'est pas une préférence :

1. **[R13]** pose que le client Workspace est *« controller »* et Google *« processor »*. ⭐ **Le
   contrat de sous-traitance ne se forme qu'avec le titulaire du compte** — si le compte n'appartient
   pas au responsable, **il n'y a pas de contrat entre le responsable et Google** ;
2. le titulaire du compte contrôle de fait les **moyens essentiels** — qui accède, ce qu'on garde,
   ce qu'on supprime ;
3. `docs/passation.md` **décrit déjà la procédure de transfert**, étape par étape : ce n'est pas un
   chantier neuf, c'est **l'exécution d'un plan écrit**.

⛔ **Aucun compte n'est créé. Aucune démarche n'est engagée. CF-3 n'est pas lancée.**

---

## 6. LES RÔLES POSSIBLES DE ROMAIN

> ⚠️ **Aucune qualification n'est retenue ici, et surtout pas la plus intuitive.** Chaque rôle est
> présenté avec **ses conditions**, ce qui est **déjà vérifié**, et ce qui **dépend encore d'une
> décision future**. Le principe directeur vient de **[R20]** : *« le rôle ne découle pas de la
> nature d'une entité mais de ses **activités concrètes dans un contexte spécifique** »*.

> ⭐ **Deux critères commandent tout ce tableau**, et aucun n'est une question de titre :
> **① l'ACCÈS effectif aux données réelles** · **② le CADRE de l'intervention** *(interne, ou
> extérieur pour le compte d'autrui)*.

### 🅐 Fournisseur d'un outil — **sans accès aux données réelles**

| | |
|---|---|
| **Conditions** | Il écrit et livre le logiciel, mais **n'accède pas** aux données réelles : pas d'accès au classeur, pas de clé administrateur en service |
| ✅ **Vérifié** | **[R20]** range le *« choix d'un logiciel »* dans les **moyens NON essentiels** · ⭐ **[R21]** le confirme par l'exemple : *« les **fabricants** de matériels (**logiciels**…) **ne sont pas des sous-traitants** puisqu'ils **n'ont pas accès** et ne traitent pas de données personnelles »* |
| ⏳ **Dépend d'une décision future** | Que l'accès aux données réelles lui soit **effectivement retiré** — ce qui suppose que le compte Google et les clés soient passés à la structure *(**CF-3**)* |
| **Qualification** | ⛔ **Ni responsable, ni sous-traitant** |
| ⚠️ **Ce que ce rôle ne dit PAS** | Il ne dit **rien** de la structure qui **utilise** l'outil : celle-ci peut parfaitement être responsable *(§3.1, « traitement sur étagère »)* |

### 🅑 Personne agissant sous l'autorité du responsable — **art. 29**

| | |
|---|---|
| **Conditions** | ⭐ **Deux, cumulatives** : ① il saisit, corrige ou intervient **sur instruction** d'une structure, **sans décider** des finalités ni des moyens essentiels ; ② ⚠️ **il agit DANS le cadre de cette structure**, et non comme intervenant extérieur |
| ✅ **Vérifié** | **Art. 29 [R1]** : *« ne peut pas traiter ces données, excepté sur instruction du responsable »*. **[R20]** confirme que les personnes qui accèdent aux données **au sein** d'un organisme **ne sont ni responsable ni sous-traitant** |
| ⏳ **Dépend d'une décision future** | Qu'une structure lui donne **effectivement des instructions** · qu'il **cesse de décider seul** des moyens essentiels *(§3.3)* · ⚠️ **et que son intervention soit bien INTERNE** — sinon on bascule en 🅓 |
| **Qualification** | ⛔ **Ni responsable, ni sous-traitant** |
| ⭐ **Situation que Romain décrit comme probable** | *« Si je suis amené à saisir ou manipuler moi-même certaines données, ce sera à la demande de l'EDR et/ou de Génération R92 »* — ⚠️ **mais « à la demande de » ne suffit pas** : encore faut-il que ce soit **en interne**, et non comme prestation |

### 🅒 Administration technique, maintenance, infogérance — ⚠️ **le rôle le plus délicat**

| | |
|---|---|
| **Conditions** | Il détient les clés, redéploie le serveur, sauvegarde, dépanne — **en accédant aux données réelles** |
| ✅ **Vérifié** | 🔴 **[R21] est explicite, et c'est exactement ce cas** : *« le **développeur d'une application** doit être qualifié de **sous-traitant** lorsqu'il réalise des opérations sur des données hébergées sur le serveur de l'application à des fins de **maintenance ou d'infogérance** »*. **[R20]** va dans le même sens pour le prestataire informatique qui **y a systématiquement accès** |
| ⏳ **Dépend d'une décision future** | ⚠️ **Le point charnière** : agit-il **en interne** *(→ 🅑, art. 29)* ou **de l'extérieur pour le compte de la structure** *(→ 🅓, sous-traitance)* ? ⭐ **Cela dépend de l'organisation retenue, pas de la technique employée** |
| **Qualification** | ⚠️ **INDÉTERMINÉE — 🅑 ou 🅓** · ⛔ **et le défaut prudent penche vers 🅓** : c'est l'hypothèse que **[R21]** vise nommément |

### 🅓 Sous-traitant — **art. 4(8) et 28**

| | |
|---|---|
| **Conditions** | Il traite des données **pour le compte** d'une structure, **de l'extérieur**, avec sa propre organisation, en accédant aux données réelles — ⭐ **la maintenance et l'infogérance en sont l'exemple type** *([R21])* |
| ⚠️ **Ce que cela déclencherait** | 🔴 **Un contrat écrit obligatoire** *(art. 28 §3)* : instructions documentées, confidentialité, sécurité, sort des données en fin de contrat |
| ⏳ **Dépend d'une décision future** | Une **relation de prestation** entre Romain et une structure. ⛔ **Elle n'existe pas aujourd'hui** : *« l'EDR et Génération R92 ne m'ont pas commandé ce logiciel »* |
| **Qualification** | ⚠️ **Aujourd'hui SANS OBJET** — ⭐ **mais c'est le rôle qui deviendrait le plus probable si Romain continuait d'administrer techniquement Maxilou après son adoption par une structure** |

### 🅔 Responsable, ou responsable conjoint — ⚠️ **à ne pas écarter par confort**

| | |
|---|---|
| **Conditions** | Il **détermine lui-même** une finalité, ou des **moyens essentiels** — quelles données sont demandées, combien de temps on les garde, qui y accède |
| ⚠️ **Le fait qui oblige à poser ce rôle** | ⭐ **§3.3** : plusieurs moyens essentiels **ont déjà été arrêtés pendant le développement**. Tant qu'aucune structure ne les reprend à son compte, **personne d'autre ne les a décidés** |
| ⏳ **Dépend d'une décision future** | Que la structure **reprenne, valide ou modifie** ces choix — ce qui les fait passer sous **sa** décision. ⛔ **Si elle ne le fait pas et que le traitement démarre quand même, ce rôle redevient une question ouverte** |
| **Qualification** | ⚠️ **SANS OBJET aujourd'hui** *(aucun traitement de données réelles n'existe)* — ⛔ **mais à réexaminer si le traitement démarrait sans que les moyens essentiels aient été repris** |

> ⛔ **CE RÔLE SE LIT DANS LE TEMPS, ET JAMAIS AUTREMENT.** Trois moments, à ne pas confondre :
>
> | Quand | Ce qui est vrai |
> |---|---|
> | 🔵 **Aujourd'hui** | **Développement personnel sur données fictives.** ⛔ **Aucun traitement réel n'est effectué pour l'EDR ou pour Génération R92.** ➡️ **Ce rôle est SANS OBJET** |
> | 🟡 **Avant toute utilisation réelle** | **La structure compétente devra reprendre, valider ou modifier** les choix relatifs aux **finalités** et aux **moyens essentiels**. ✅ **C'est le geste normal, et il suffit** |
> | 🔴 **Si cette reprise n'a PAS lieu** | ⚠️ **La qualification des acteurs devra être réexaminée AVANT tout traitement réel** |
>
> ⛔ **Ce qu'il ne faut donc JAMAIS en conclure** : que l'existence actuelle de ces choix de
> conception ferait de Romain, **aujourd'hui**, le responsable du traitement. ⭐ **On ne peut pas
> être responsable d'un traitement qui n'a pas commencé.** Ce sont des **choix de conception sur
> données fictives**, faits **avant** que la question ne se pose — et **c'est précisément pour
> qu'elle se pose au bon moment que ce dossier existe.**

### 🎯 Ce qu'il faut retenir de cette section

> ⛔ **Aucun de ces cinq rôles n'est choisi.** Et **aucun ne se déduit du métier ou du titre** : ils
> se départagent sur **l'accès aux données** et sur **le cadre de l'intervention**.

| | Rôle | Qualification |
|---|---|---|
| 🅐 | Fournir l'outil, sans accès | ⛔ Ni responsable ni sous-traitant |
| 🅑 | Intervenir **en interne**, sur instruction | ⛔ Ni responsable ni sous-traitant |
| 🅒 | Administrer / maintenir **avec accès** | ⚠️ **Indéterminé — 🅑 ou 🅓** |
| 🅓 | Prestation **autonome** avec accès | 🔴 **Sous-traitant — contrat art. 28 obligatoire** |
| 🅔 | Décider soi-même des moyens essentiels | 🔴 **Responsable, ou conjoint** |

> ⚠️ **Deux rôles seulement sont hors du champ des obligations** — 🅐 et 🅑. **Les trois autres en
> créent.**
>
> ⭐ **Et le point décisif est celui-ci** : la **même personne**, faisant les **mêmes gestes
> techniques**, relève de 🅑 **ou** de 🅓 **selon l'organisation retenue**. ➡️ **Ce n'est donc pas
> une question technique. C'est une question d'organisation — et elle se décide, elle ne se
> constate pas.**

### ⚠️ CE TABLEAU EST UNE GRILLE D'ANALYSE — PAS UN MÉCANISME DE QUALIFICATION AUTOMATIQUE

> ⛔ **Aucun de ces cinq rôles ne s'applique par simple lecture du tableau.** On ne coche pas une
> case pour obtenir une qualification.
>
> **La qualification définitive dépendra toujours** :
>
> - des **faits réels** — qui accède effectivement aux données, dans quel cadre, sur quelles
>   instructions ;
> - de l'**organisation effectivement retenue** — et non de celle qu'on aurait imaginée ;
> - ⚠️ **appréciés au moment où le traitement existe**, pas par anticipation.
>
> ⭐ **Et c'est exactement ce que disent les référentiels eux-mêmes** : **[R20]** pose que ces
> notions sont **fonctionnelles**, réparties *« en fonction des **rôles réels joués** par les
> parties »* ; **[R21]** rappelle que la qualification s'apprécie **sur les pratiques réelles, pas
> sur les étiquettes** — et que la CNIL peut **requalifier** un acteur.
>
> 🎯 **Ce tableau sert donc à POSER LES BONNES QUESTIONS, pas à donner les réponses.** Les réponses
> viendront des faits — et les faits, aujourd'hui, n'existent pas encore.

---

## 7. CE QUI NE CHANGE PAS, QUELLE QUE SOIT L'OPTION

| ⛔ Ce qui ne décide RIEN | Pourquoi |
|---|---|
| **Le fait que Romain ait développé Maxilou** | **[R20]** : le *« choix d'un logiciel »* est un **moyen NON essentiel** — ⚠️ **cela ne dit rien de celui qui décidera de l'UTILISER** *(voir §3.1)* |
| **Le fait qu'il publie aujourd'hui le site** | ⚠️ **Deux sujets différents** : l'édition d'un site relève de **[R10]** *(mentions légales)*, la responsabilité du traitement de **[R1]**. **Le premier ne détermine pas le second** |
| **Le fait que le classeur soit sur son compte Google** | Détenir le support n'est pas décider de l'usage. ⭐ C'est **une raison de changer de compte** *(CF-3)*, pas une qualification |
| **Ce que dirait un contrat ou un titre** | **[R21]** : la CNIL apprécie **les pratiques réelles** et peut **requalifier** |
| **Le fait que le site vitrine nomme déjà une association** | C'est le responsable **de ce site**, pas celui du traitement de Maxilou *(D-038)* |

| ✅ Ce qui reste vrai dans les trois cas | |
|---|---|
| **Maxilou ne demande aucune donnée nominative d'enfant** | Ni nom, ni date de naissance, ni licence. **Aucun champ n'est prévu pour cela** — les enfants n'y sont que des **effectifs** |
| **Un club invité ne peut saisir aucun texte libre** | Sa page de réponse ne contient que des nombres et des choix |
| **Les 7 durées de conservation sont déjà décidées et écrites** | **D-020** — ⭐ **la structure retenue pourra les reprendre ou les changer**, mais elle n'aura pas à les inventer |
| **Le travail technique déjà fait reste valable** | Liste blanche des vues publiques, jeton par club, verrou d'écriture, anti-force-brute |
| **Google restera sous-traitant** | **[R13]** — ce qui change, c'est **avec qui** le contrat se forme |

---

## 8. LES QUESTIONS À POSER POUR TRANCHER

> 📐 **Construites depuis les référentiels**, et non depuis l'intuition. Les questions **Q-A à Q-D**
> viennent des **moyens essentiels** de **[R20]** ; **Q-E à Q-H** des questions pratiques de
> **[R21]** ; **Q-I à Q-K** des obligations qui découlent du rôle.

### Les 4 questions qui décident, au sens de [R20]

> ⭐ **Celui qui répond à ces quatre questions EST le responsable du traitement.** Ce sont
> exactement les quatre **moyens essentiels**.

| # | La question | Le moyen essentiel visé |
|---|---|---|
| **Q-A** | **Qui décide quelles informations sont demandées aux clubs** — le courriel du contact ? son téléphone ? les effectifs ? | *« quelles données ? »* |
| **Q-B** | **Qui décide combien de temps** on garde le carnet des clubs, les contacts de la demande fédérale, les effectifs ? | *« combien de temps ? »* |
| **Q-C** | **Qui décide qui peut consulter** ces informations — quels bénévoles, quels dirigeants, avec quelles clés ? | *« qui y a accès ? »* |
| **Q-D** | **Qui décide de qui on enregistre les informations** — contacts de clubs, responsables sécurité, médecin ? | *« de qui ? »* |

### Les 4 questions pratiques, au sens de [R21]

| # | La question | Ce qu'elle révèle |
|---|---|---|
| **Q-E** | **Qui décide POURQUOI** le tournoi est organisé et les données collectées ? | La **finalité** — le critère premier |
| **Q-F** | **Qui répond à un club** qui demande *« effacez mes informations »* ? | Le responsable **de fait** |
| **Q-G** | **Le tournoi pourrait-il avoir lieu sans la participation active des deux structures ?** | ⭐ **La question qui départage A/B de C.** Si la réponse est **non**, on est probablement en **responsabilité conjointe** |
| **Q-H** | **Qui décide de garder ou de supprimer une fonctionnalité** qui traite des données — par exemple la mesure de visibilité des partenaires ? | Le pouvoir réel sur le périmètre |

### Les 3 questions de fait, nécessaires pour appliquer la réponse

| # | La question | Pourquoi elle est indispensable |
|---|---|---|
| **Q-I** | ⚠️ **Quelle entité juridique porte réellement l'École de Rugby** — est-elle une association distincte, ou une section d'un club ? | ⛔ **Ce n'est PAS une condition d'exclusion** : **[R1]** vise aussi *« le service ou un autre organisme »*, et **[R20]** dit qu'*« il n'existe aucune limitation quant au type d'entité »*. ⭐ **Mais il faut une entité capable de signer, d'ouvrir un compte et de répondre** — d'où la question |
| **Q-J** | **Chaque structure est-elle déclarée et inscrite au Journal Officiel des Associations ?** | Condition d'éligibilité à **[R14]** *(compte Google gratuit)* — et élément d'identification pour **[R10]** |
| **Q-K** | **Qui, dans la structure retenue, sera le point de contact** dont l'adresse figurera dans les textes d'information ? | **[R1]** art. 13-14 : l'information doit donner un **contact utilisable** |

> ⚠️ **Ces questions ne sont pas un questionnaire à faire remplir.** Ce sont les points sur lesquels
> la discussion devra aboutir. ⭐ **Et [R21] impose de tracer le raisonnement** qui aura conduit à la
> qualification : **les réponses devront être écrites**, pas seulement échangées.

---

## 9. 🔲 LA DÉCISION À OBTENIR — volontairement NON PRISE

> ⛔ **CETTE CASE EST VIDE, ET ELLE DOIT LE RESTER** jusqu'à ce que les structures concernées aient
> étudié Maxilou et décidé.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   QUI DÉCIDE DE L'UTILISATION DES DONNÉES TRAITÉES PAR MAXILOU ?         │
│                                                                          │
│      🔲  A — L'EDR du Racing Club de France, seule                       │
│              (entité juridique porteuse à identifier — voir Q-I)         │
│                                                                          │
│      🔲  B — L'association Génération R92, seule                         │
│                                                                          │
│      🔲  C — Les deux, conjointement                                     │
│              ⚠️ déclenche un accord écrit obligatoire (art. 26)          │
│                                                                          │
│      🔲  D — Aucune des deux ne souhaite utiliser Maxilou                │
│              ⭐ C'est une réponse possible, et elle clôt le sujet.       │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────      │
│                                                                          │
│   DÉCIDÉ LE : ______________     PAR : ________________________          │
│                                                                          │
│   ⛔ NON DÉCIDÉ À CE JOUR — 2026-08-19                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Quand cette décision doit être prise

> 🔴 **Avant le passage aux données réelles** — l'étape ⑧ du parcours *(§0)*, et **pas avant**
> l'étape ③.

⚠️ **Elle n'est pas urgente** : aucune date de mise en service n'existe. ⭐ **Mais elle conditionne
quatre chantiers** — **CF-3** *(compte Google)*, **CF-4** *(mentions légales)*, **CF-5**
*(information des personnes)*, **CF-6** *(registre)*.

### Ce qui peut avancer sans elle

✅ **CF-4, CF-5 et CF-6 se préparent dès maintenant, avec l'organisation laissée entre crochets** —
c'est la forme déjà retenue par le chantier **C-005**. ⭐ **Le jour où la case est cochée, on remplit
les crochets ; on ne réécrit rien.**

---

> ⚠️ **Rappel final, et il vaut pour toute session qui lira ce dossier.**
> ⛔ **Aucune des options ci-dessus n'a été retenue.** ⛔ **Ni l'EDR du Racing Club de France, ni
> l'association Génération R92 n'ont commandé, étudié, validé ou adopté Maxilou.** ⛔ **Aucune des
> deux n'a été contactée au sujet de ce dossier.** Ce document **prépare** une décision ; il ne la
> constate pas, et ne la présume pas.
