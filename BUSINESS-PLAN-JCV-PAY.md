# Business plan JCV Pay

**Produit :** JCV Pay — application de finances d’église  
**Première organisation :** Église Jésus Christ Victoire, Abidjan (Côte d’Ivoire)  
**Date du document :** 30 septembre 2026  
**Statut :** plan de travail. Les montants sont des hypothèses chiffrées, pas des comptes réels.  
**Devise :** franc CFA (XOF). 1 000 F = 1 000 FCFA.

---

## 1. Résumé exécutif

JCV Pay est le logiciel qui permet à une église de collecter, tracer et justifier chaque franc : dîme, offrande, cotisation, projet, événement et épargne. Le fidèle paie depuis son téléphone (Wave, Orange Money, MTN MoMo, Moov Money, carte) ou déclare un versement en espèces ou par virement. Le trésorier confirme, la caisse se met à jour, le reçu est émis.

Le premier client est l’Église Jésus Christ Victoire à Abidjan. Le produit est déjà structuré pour elle : paroisse, matricule, Temple de la Victoire, guichet trésorerie, rôles de fidèle, trésorier et administrateur. L’application tourne sur téléphone (Android, iOS) et sur le web, via Expo.

Le plan tient en deux temps.

1. **Année 1 — preuve sur le Temple.** Finir le produit, le brancher sur un vrai paiement (GeniusPay) et un vrai serveur, et faire passer la vie financière de l’église dans l’application. Objectif : plus de 70 % des versements récurrents tracés, un reçu pour chaque encaissement validé, un journal de caisse tenu sans cahier parallèle.
2. **Années 2 et 3 — même outil pour d’autres églises.** Vendre JCV Pay en abonnement aux églises d’Abidjan, puis de Côte d’Ivoire et des pays voisins francophones. JCV Pay reste un logiciel. L’argent transite par un prestataire de paiement agréé. JCV Pay ne garde pas les fonds des églises.

**Chiffre d’affaires visé (hypothèse centrale, détaillée en section 12)**

| Année | Églises payantes en fin d’année | Chiffre d’affaires | Résultat |
| --- | ---: | ---: | ---: |
| Année 1 | 17 | 2,9 millions F | −8,6 millions F |
| Année 2 | 55 | 23,3 millions F | −1,9 million F |
| Année 3 | 140 | 69,5 millions F | +11,7 millions F |

Le besoin à réunir avant le démarrage est de **16 millions F** : les pertes des deux premières années et un coussin de 5 millions. Le détail des calculs, des prix et des cas où le plan casse est en section 12.

---

## 2. L’organisation

### 2.1 Qui est servi en premier

L’Église Jésus Christ Victoire (JCV), Abidjan, autour du Temple de la Victoire. Les comptes de démonstration du produit portent déjà cette identité : paroisse « Église Jésus Christ Victoire - Abidjan », matricules `JCV-MBR`, `JCV-TRS`, `JCV-ADM`, guichet au Temple, virement indiqué sur un compte NSIA.

JCV Pay n’est pas une banque de l’église. C’est l’outil du conseil, du trésorier et des fidèles pour que l’argent de l’église soit visible, séparé par caisse, et justifiable.

### 2.2 Ce que l’église fait aujourd’hui sans outil complet

Une église de cette taille encaisse en continu :

- la **dîme** et les **offrandes** du culte ;
- des **cotisations** (département, chorale, membres) ;
- des **projets** (construction, équipement, mission, social) ;
- des **événements** (séminaires, conventions, places payantes) ;
- parfois une **épargne** interne des membres.

Une partie passe en enveloppes au secrétariat, une partie en Wave ou Orange Money sur un numéro personnel ou un numéro d’église, une partie par virement. Le reçu, quand il existe, est manuel. Le fidèle de la diaspora ou celui qui n’était pas au culte n’a pas de canal propre.

### 2.3 Mission du produit

Donner à chaque franc une origine, une destination, un responsable et une preuve.

- Le fidèle voit ce qu’il a versé, ce qui reste dû, et son reçu.
- Le trésorier voit la caisse principale, les caisses de projet, les versements en attente et le journal.
- L’administrateur crée les comptes, les projets, les caisses et les rôles.
- Le pasteur et le conseil peuvent lire un solde sans toucher à l’argent.

---

## 3. Le problème, en concret

### 3.1 Pour le fidèle

- Il ne sait pas toujours si son enveloppe a été comptée.
- Il n’a pas d’historique de dîme utilisable en fin d’année.
- Payer un projet ou une place d’événement demande d’être sur place, ou d’envoyer de l’argent à un particulier.
- Un paiement mobile « réussi » sur le téléphone de l’opérateur ne crée pas automatiquement un reçu d’église.

### 3.2 Pour le trésorier

- Le dimanche, les espèces, les captures d’écran Wave et les virements arrivent en même temps.
- Rapprocher un nom, un montant et un motif prend des heures.
- Les caisses de projet se mélangent avec la caisse du fonctionnement.
- Une sortie (achat, aide, travaux) est notée tard, ou seulement dans un cahier.
- En cas de question du conseil, la preuve est dispersée.

### 3.3 Pour le conseil

- Le solde annoncé et le solde réel divergent.
- Un projet affiche un objectif, mais le montant collecté n’est pas à jour.
- Personne ne voit, membre par membre, qui est à jour.
- Changer de trésorier fait perdre la mémoire de la caisse.

### 3.4 Coût de ne rien changer

Sur une église qui collecte **20 millions F par mois** (ordre de grandeur d’un temple actif à Abidjan, pas un chiffre comptable de JCV) :

- 3 % d’espèces mal rapprochées ou contestées = **600 000 F / mois** de flou ;
- 5 à 10 heures de trésorerie bénévole ou salariée par semaine, soit environ **150 000 à 400 000 F / mois** de temps ;
- des projets qui avancent plus lentement parce que les fidèles éloignés ne paient pas.

JCV Pay se vend d’abord sur ce écart : un abonnement de 10 000 à 60 000 F par mois est petit à côté du flou qu’il réduit.

---

## 4. La solution

JCV Pay est une application unique, avec un écran différent selon le rôle.

### 4.1 Rôles déjà prévus dans le produit

| Rôle | Ce qu’il fait |
| --- | --- |
| Fidèle (`MEMBRE`) | Consulte son suivi, déclare ou paie un versement, voit ses reçus, ses projets et le calendrier |
| Responsable (`RESPONSABLE`) | Suit son département, sans tenir la caisse globale |
| Trésorier (`TRESORIER`) | Confirme l’argent, ouvre les caisses, enregistre les espèces et les sorties |
| Administrateur (`ADMINISTRATEUR`) | Crée les comptes, les projets, les caisses, les événements, attribue les rôles |
| Super admin (`SUPER_ADMIN`) | Voit et fait les deux : personnes et argent |

La séparation est déjà dans le code : gérer les gens et gérer l’argent sont deux droits distincts. C’est un contrôle interne, pas un détail d’écran.

### 4.2 Parcours fidèle

1. Il se connecte (compte, puis code à usage unique).
2. L’accueil affiche son suivi : total versé, reste à payer, montants en attente, épargne, projets actifs.
3. Il choisit un versement : dîme, offrande, cotisation, projet, événement, épargne ou libre.
4. Il paie :
   - **immédiat** via GeniusPay : Wave, Orange Money, MTN MoMo, Moov Money, carte Visa ou Mastercard ;
   - **différé** : virement (référence banque, aujourd’hui un RIB NSIA dans l’app) ou espèces au secrétariat du Temple. Il déclare. Le trésorier confirme.
5. Dès validation, un reçu est créé : numéro, montant, frais, total, moyen, code de sécurité, code-barres.

### 4.3 Parcours trésorerie

L’écran Trésorerie est organisé en volets :

- vue globale de l’argent de l’église ;
- caisses (la caisse principale ne se supprime pas ; les caisses de projet peuvent lui transférer) ;
- annuaire des payeurs ;
- journal des entrées et sorties ;
- encaissements ;
- validations (accepter ou rejeter un versement déclaré).

Une entrée de caisse porte : type (entrée ou sortie), montant, motif, date, heure, source (caisse physique, Wave, Orange Money, banque), auteur, et éventuellement le bénéficiaire ou la caisse de projet.

### 4.4 Parcours administration

Le tableau de bord administration couvre :

- validations des paiements ;
- projets et travaux du Temple (construction, équipement, mission, social) avec objectif et montant collecté ;
- caisses ;
- événements (date, lieu, tarif, places) ;
- cotisations ;
- membres (création de compte, rôle, matricule).

### 4.5 Ce qui est déjà construit, et ce qui ne l’est pas

**Déjà dans l’application (interface et logique locale) :** authentification, rôles, accueil fidèle, contributions, payeurs, projets, reçus, calendrier, notifications, paiement, nouvelle contribution, nouvel événement, nouveau projet, nouvelle caisse, historique, préférences d’affichage, guichet de caisse.

**Pas encore un produit exploitable en production :** les données financières de démonstration sont vides, le serveur réel n’est pas le système de vérité, l’encaissement GeniusPay est prévu dans le parcours mais doit être certifié de bout en bout (paiement réussi → transaction `VALIDE` → reçu → mouvement de caisse). Tant que ce chaînon n’est pas fermé, JCV Pay est un prototype avancé, pas un service qu’on fait payer à d’autres églises.

Le business plan suppose que les six premiers mois servent à fermer ce chaînon sur l’église JCV, avant toute vente externe.

---

## 5. Proposition de valeur

### 5.1 Pour le fidèle

« Je donne à mon église comme je paie le reste de ma vie, et je repars avec un reçu. »

### 5.2 Pour le trésorier

« Je ne reconstitue plus le dimanche le lundi. Chaque canal tombe dans une caisse, avec un nom. »

### 5.3 Pour le pasteur

« Je vois l’avancement des projets sans ouvrir le coffre et sans dépendre d’un seul trésorier. »

### 5.4 Phrase de vente

JCV Pay remplace le cahier, l’enveloppe anonyme et le numéro Wave personnel par une caisse d’église : encaissement mobile, espèces déclarées, reçu, et séparation entre celui qui crée les comptes et celui qui valide l’argent.

---

## 6. Marché

Les effectifs ci-dessous sont des **hypothèses de travail** pour décider, pas une étude publiée. Ils devront être revus après 20 visites d’églises.

### 6.1 Terrain

La Côte d’Ivoire compte plusieurs milliers d’églises évangéliques, pentecôtistes, méthodistes, baptistes et indépendantes, plus les paroisses catholiques et autres communautés qui collectent de façon régulière. Abidjan concentre les plus gros temples et la plus forte densité de téléphones avec mobile money.

Le paiement du quotidien passe par **Wave, Orange Money, MTN MoMo et Moov Money**. Une église qui n’accepte que les espèces laisse dehors les fidèles qui n’ont plus d’espèces le dimanche, et ceux qui vivent hors d’Abidjan.

### 6.2 Segments

| Segment | Taille utile estimée | Besoin | Offre JCV |
| --- | --- | --- | --- |
| Temple urbain, 800 fidèles et plus | 150 à 400 en Côte d’Ivoire | Multi-caisses, événements, contrôle interne | Offre Temple |
| Église de quartier, 150 à 800 fidèles | 1 500 à 4 000 | Dîme, cotisation, un projet, reçu | Offre Paroisse |
| Assemblée, moins de 150 fidèles | Très nombreuses | Simple suivi, un numéro, un reçu | Offre Essentiel |
| Départements et chorales | Inclus dans l’église | Cotisation de groupe | Pas un client séparé au départ |
| Diaspora du fidèle | Pas un client | Payer le projet du Temple depuis l’étranger | Inclus via carte et mobile money |

**Marché adressable de départ :** les églises d’Abidjan qui ont déjà un trésorier identifié et au moins un numéro mobile money d’église. Hypothèse : **800 églises** réellement approchables en 24 mois, sans compter l’intérieur du pays.

**Cible commerciale à 36 mois :** 140 églises payantes, soit environ 18 % de ce premier cercle. C’est volontairement en dessous d’une « part de marché » ambitieuse.

### 6.3 Extension ensuite

Même langue, mêmes opérateurs ou cousins proches : Burkina Faso, Mali, Sénégal, Bénin, Togo, Guinée. On n’ouvre un pays que lorsqu’un prestataire de paiement local est branché et qu’une église pilote accepte d’être la référence. Pas avant le mois 30.

---

## 7. Concurrence

| Alternative | Ce qu’elle fait bien | Ce qui manque pour une église |
| --- | --- | --- |
| Cahier, Excel, enveloppes | Gratuit, déjà en place | Pas de reçu fiable, pas de paiement, perte au changement de trésorier |
| Numéro Wave ou Orange du trésorier | Encaissement immédiat | L’argent est sur un compte personnel, pas de ventilation dîme / projet, pas d’historique fidèle |
| GeniusPay, CinetPay, Paystack seuls | Page de paiement | Pas de membres, pas de caisses, pas de rôles d’église |
| Tithe.ly, Pushpay, Planning Center Giving | Produits mûrs aux États-Unis | Prix en dollars, anglais, peu adaptés au mobile money ouest-africain et à la caisse espèces du dimanche |
| Logiciels de gestion d’association locaux | Comptabilité | Rarement le parcours fidèle + reçu + Wave dans la même application |

**Position de JCV Pay :** ne pas concurrencer l’opérateur de paiement. S’appuyer sur GeniusPay pour encaisser, et garder la couche que l’opérateur ne fait pas : membre, matricule, type de don, caisse de projet, validation du trésorier, reçu d’église, rôles.

Le vrai concurrent au début est l’habitude : « on a toujours fait avec les enveloppes ». La vente se gagne dans la sacristie, pas sur une publicité.

---

## 8. Modèle économique

JCV Pay a trois revenus. Le troisième (la commission) ne démarre que si la marge après prestataire reste positive. Sinon on le coupe et on vit de l’abonnement.

### 8.1 Abonnement mensuel

Facturé à l’église, pas au fidèle. Le fidèle ne paie pas pour donner.

| Offre | Prix / mois | Limites | Pour qui |
| --- | ---: | --- | --- |
| Essentiel | 10 000 F | 150 fidèles, 1 caisse, reçus, mobile money, espèces à valider | Assemblée |
| Paroisse | 25 000 F | 800 fidèles, caisses de projet, cotisations, événements, annuaire payeurs | Église de quartier |
| Temple | 60 000 F | Fidèles illimités, rôles complets, plusieurs caisses, support sous 24 h ouvrées, export pour le conseil | Temple type JCV |
| Réseau | Sur devis, plancher 150 000 F / mois | Plusieurs lieux de culte, un super admin, caisses séparées par assemblée | Dénomination |

L’Église Jésus Christ Victoire est cliente **Temple**, facturée à partir du mois 7. Les mois 1 à 6 sont gratuits : c’est le pilote qui sert de vitrine.

Paiement de l’abonnement : prélèvement mobile money du trésorier ou virement, annuel avec **deux mois offerts** (10 mois payés sur 12) pour ceux qui s’engagent un an. L’hypothèse de chiffre d’affaires plus bas dans ce document compte les prix mensuels, sans ce rabais. Le rabais annuel sera un outil commercial, pas la base du prévisionnel.

### 8.2 Mise en service

| Prestation | Prix une fois | Contenu |
| --- | ---: | --- |
| Installation Essentiel | 40 000 F | Compte église, import simple des noms (fichier), 2 h avec le trésorier |
| Installation Paroisse | 75 000 F | Import, 2 caisses, cotisations, demi-journée sur place |
| Installation Temple | 150 000 F | Import, caisses, projets en cours, événements, journée au Temple, 30 jours d’accompagnement |

### 8.3 Commission sur encaissement électronique

Uniquement sur Wave, Orange Money, MTN, Moov et carte. **Pas de commission JCV sur les espèces ni sur le virement** : ces flux sont déclarés puis validés, l’argent ne passe pas par JCV Pay.

Prix affiché à l’église, tout compris prestataire :

| Offre | Frais de service JCV affichés sur le flux électronique |
| --- | ---: |
| Essentiel | 1,5 % |
| Paroisse | 1,2 % |
| Temple | 0,9 % |

**Règle de marge.** On ne lance la commission que si, après facture GeniusPay et après frais opérateur, il reste au moins **0,35 point** pour JCV Pay. Exemple : l’église Temple paie 0,9 %, le prestataire coûte 0,50 %, la marge JCV est 0,40 %. Si le coût prestataire dépasse le prix affiché, on renégocie ou on retire la commission et on augmente l’abonnement. On n’absorbe pas une perte par transaction.

Le fidèle voit les frais sur le reçu (`frais` et `total` existent déjà dans le modèle de reçu). L’église choisit au contrat qui porte les frais :

- **Option A — l’église :** le fidèle donne 10 000 F, l’église reçoit 9 910 F sur l’offre Temple ;
- **Option B — le donateur :** le fidèle paie 10 090 F pour qu’un don de 10 000 F arrive.

Par défaut commercial : option A, plus simple à expliquer au culte.

### 8.4 Ce que JCV Pay ne fait pas

- Pas de crédit, pas d’épargne rémunérée, pas de placement de l’argent de l’église.
- Pas de conservation des fonds. Le compte de cantonnement est chez l’établissement de paiement ou à la banque de l’église.
- Pas de don anonyme obligatoire : un versement a un nom et un téléphone, parce que le reçu et l’annuaire en ont besoin. Un versement « libre » reste rattaché à un payeur.
- Pas de mélange entre la caisse de l’église et le compte du fondateur de JCV Pay.

### 8.5 Unité économique d’une église (mois plein)

Exemple d’une église **Paroisse** qui encaisse **3 000 000 F / mois**, dont **60 %** en électronique (1 800 000 F) et 40 % en espèces ou virement.

| Ligne | Montant |
| --- | ---: |
| Abonnement | 25 000 F |
| Commission 1,2 % sur 1 800 000 F | 21 600 F |
| Revenu JCV Pay | 46 600 F |
| Coût prestataire hypothétique 0,5 % sur 1 800 000 F | −9 000 F |
| Marge brute sur cette église | 37 600 F |

À 55 églises de ce profil moyen, la marge brute mensuelle dépasse 2 millions F. C’est le seuil où l’équipe de l’année 2 se paie.

---

## 9. Marché cible et vente

### 9.1 Client qui achète

Ce n’est pas « l’église » en abstrait. Trois personnes décident :

1. le **pasteur principal** dit oui sur le principe ;
2. le **trésorier** dit oui sur l’usage du dimanche ;
3. le **conseil** dit oui sur le prix et sur le fait que l’argent reste sur le compte de l’église.

Si l’un des trois bloque, on ne signe pas. Forcer un trésorier hostile produit un logiciel mort après deux dimanches.

### 9.2 Profil du premier client payant

- Temple ou église de quartier à Abidjan ;
- au moins un culte dominical régulier ;
- un trésorier nommé, joignable sur WhatsApp ;
- déjà un numéro Wave ou Orange Money d’église, ou prêt à en ouvrir un au nom de l’église ;
- un projet visible (toit, sono, bus, mission) qui donne une raison de payer autrement qu’en enveloppe.

### 9.3 Canaux, dans l’ordre

1. **Le Temple JCV comme preuve.** Un dimanche filmé sobrement : un fidèle paie, un reçu s’affiche, le trésorier valide une espèce. Ce film est le support de vente. Pas de publicité payante avant ce film.
2. **Réseau pastoral.** Le pasteur de JCV présente l’outil à 10 pasteurs qu’il connaît. Objectif : 4 rendez-vous, 2 pilotes amis au tarif Essentiel pendant 60 jours.
3. **Présence au Temple un dimanche sur deux** pendant les mois 7 à 12, chez l’église cliente, pour le premier mois. Le chargé de relation églises encaisse les questions sur place.
4. **Bouche-à-oreille trésorier.** Un trésorier qui gagne son dimanche soir en parle à un autre. C’est le canal principal à partir de l’année 2.
5. **WhatsApp.** Un numéro JCV Pay, des réponses en français courant, des captures du reçu. Pas de tunnel publicitaire Facebook tant que le produit perd des paiements.

### 9.4 Cycle de vente

| Étape | Durée | Action |
| --- | --- | --- |
| Contact | Jour 0 | Message du pasteur JCV ou visite |
| Démo | Jour 3 à 10 | 45 minutes : un versement Wave réel de 100 F, un reçu, une validation |
| Essai | 30 jours | Offre Essentiel offerte, données de l’église, maximum 50 fidèles |
| Décision | Fin d’essai | Conseil. Contrat d’un an ou mois par mois |
| Mise en service | 7 à 15 jours | Import, formation, premier dimanche accompagné |

Taux visés après le mois 9 : **40 %** des démos passent en essai, **50 %** des essais signent. Donc **une signature pour cinq démos**.

### 9.5 Message selon l’interlocuteur

- **Pasteur :** « Les fidèles qui ne sont pas au Temple peuvent quand même participer au projet, et vous voyez l’avancement. »
- **Trésorier :** « Les captures d’écran s’arrêtent. Vous validez ou vous rejetez. Le journal se tient seul. »
- **Conseil :** « L’argent arrive sur le compte de l’église. Deux personnes distinctes : une crée les comptes, l’autre valide les montants. »

---

## 10. Plan de mise en œuvre

### 10.1 Mois 1 à 3 — rendre l’argent réel

Livrables obligatoires avant tout fidèle réel :

- serveur qui enregistre utilisateurs, transactions, reçus, caisses, projets, événements ;
- compte GeniusPay de l’église (ou du prestataire retenu) en mode production, avec webhook : paiement confirmé → transaction `VALIDE` → reçu → entrée de caisse ;
- échec de paiement → transaction `REJETE` ou `ANNULE`, sans reçu ;
- espèces et virement → `EN_ATTENTE` jusqu’à validation trésorier ;
- code à usage unique par SMS pour la connexion ;
- sauvegarde quotidienne et export du journal ;
- un dimanche test avec 20 fidèles volontaires, montants réels, puis rapprochement avec le relevé Wave et le comptage des espèces.

Critère de sortie : **zéro écart** entre la somme des reçus validés du jour et la somme (relevé opérateur + espèces comptées + virements vus à la banque) sur deux dimanches de suite.

### 10.2 Mois 4 à 6 — toute l’église JCV

- ouverture à l’ensemble des fidèles qui ont un téléphone ;
- guichet secrétariat : le trésorier saisit l’espèce pendant que la personne est devant lui, le reçu part par SMS ou s’affiche ;
- projets ouverts dans l’application avec objectif et date de fin ;
- cotisations des départements ;
- premier événement avec places et tarif ;
- rapport mensuel d’une page pour le conseil : entrées par type, sorties, solde caisse principale, solde par projet, versements en attente de plus de 7 jours.

Critère de sortie : **70 %** du montant collecté sur le mois passe par JCV Pay (électronique validé + espèces saisies + virements confirmés).

### 10.3 Mois 7 à 12 — premières églises clientes

- contrat, facture, espace séparé par église (les données d’une église ne sont pas visibles par une autre) ;
- 17 églises payantes en décembre (voir prévisionnel) ;
- une personne dont le métier est la relation églises, plus le fondateur produit ;
- procédure écrite : qui valide, sous quel délai, que faire si un webhook n’arrive pas.

### 10.4 Année 2 — fiabilité et réseau

- export comptable mensuel (liste des mouvements, pas un bilan) ;
- rappel d’échéance de cotisation ;
- reçu annuel PDF par fidèle ;
- offre Réseau pour une dénomination qui a plusieurs temples ;
- 55 églises en fin d’année.

### 10.5 Année 3 — élargir sans se disperser

- 140 églises ;
- un second pays seulement si une église pilote et un prestataire local sont signés ;
- on ne lance pas d’application « pour les associations » tant que le cœur église n’est pas rentable.

---

## 11. Équipe

### 11.1 Année 1 (équipe minimale)

| Rôle | Qui | Charge | Coût mensuel chargé |
| --- | --- | --- | --- |
| Produit et relation pastorale JCV | Fondateur | Plein temps | 200 000 F à partir du mois 4, 0 avant (apport en travail) |
| Développement serveur, paiement, mobile | Développeur | Plein temps, mois 1 à 12 | 450 000 F |
| Relation églises et dimanches pilotes | Chargé d’accompagnement | Mi-temps mois 6, plein temps mois 7 à 12 | 180 000 F puis 300 000 F |
| Conseil juridique paiement et données | Cabinet, ponctuel | — | 400 000 F une fois au mois 2 |

Le fondateur peut être le développeur. Dans ce cas on retire 450 000 F de coût et on allonge le calendrier d’environ deux mois. Le prévisionnel ci-dessous suppose **deux personnes distinctes** : un fondateur qui vend et un développeur qui ferme le paiement. C’est le scénario qui tient le délai de six mois.

### 11.2 Année 2

On ajoute : un second développeur (400 000 F), le chargé d’accompagnement déjà là (300 000 F), un support WhatsApp (200 000 F). Fondateur à 350 000 F. Total masse : environ **1,7 million F / mois**.

### 11.3 Année 3

Équipe d’environ 8 personnes : produit, 3 développeurs, 2 accompagnements églises, support, administration. Masse d’environ **3,2 millions F / mois**.

### 11.4 Gouvernance de l’argent

- Compte bancaire JCV Pay (la société) distinct du compte de l’Église Jésus Christ Victoire.
- Les flux des fidèles ne transitent pas par le compte de la société, sauf la commission et l’abonnement, virés par le prestataire ou payés par l’église.
- Deux signatures au-dessus de 500 000 F de dépense de la société.
- Chaque église cliente a son propre compte de cantonnement ou son propre sous-compte chez le prestataire.

### 11.5 Forme juridique à créer avant la première facture

Société à responsabilité limitée de droit ivoirien, objet : édition de logiciel et intermédiation technique de paiement, **sans** activité d’établissement de monnaie électronique.

Avant d’encaisser pour le compte des églises, confirmation écrite du conseil (avocat + prestataire) que le schéma « logiciel + GeniusPay + compte de l’église » ne constitue pas un service de paiement soumis à agrément BCEAO. Si la réponse est que l’agrément est nécessaire, on ne touche pas aux fonds : l’église branche son propre contrat prestataire, JCV Pay ne facture que l’abonnement. Ce point est un **jalon bloquant du mois 2**, pas une note de bas de page.

Protection des données : registre des traitements, accès par rôle, durée de conservation des reçus alignée sur le besoin comptable de l’église (hypothèse de travail : 10 ans pour les pièces, à valider avec le conseil).

---

## 12. Plan financier

Tous les chiffres de cette section sont une **hypothèse centrale**. Ils ne viennent pas d’une comptabilité. La section 12.6 montre ce qui casse le plan si la réalité est moins bonne.

### 12.1 Rythme d’acquisition

| Mois | Nouvelles églises | Parc fin de mois | Mix en fin de mois |
| --- | ---: | ---: | --- |
| 1 à 6 | 0 (pilote JCV gratuit) | 1 gratuite | JCV seule |
| 7 | 2 | 2 payantes + JCV gratuite | 2 Essentiel |
| 8 | 2 | 4 | 4 Essentiel |
| 9 | 3 | 7 | 6 Essentiel, 1 Paroisse |
| 10 | 3 | 10 | 8 Essentiel, 2 Paroisse |
| 11 | 4 | 14 | 10 Essentiel, 3 Paroisse, 1 Temple |
| 12 | 3 | 17 | 12 Essentiel, 4 Paroisse, 1 Temple |
| Fin année 2 | — | 55 | 30 Essentiel, 20 Paroisse, 5 Temple |
| Fin année 3 | — | 140 | 70 Essentiel, 50 Paroisse, 18 Temple, 2 Réseau |

JCV passe en cliente Temple payante au mois 7 et est comptée dans le « 1 Temple » du mois 11-12. Aucune église ne résilie dans l’hypothèse centrale en année 1. En année 2, **8 %** de résiliation annuelle est déjà déduite du parc de 55 (on signe plus que 55 pour finir à 55). En année 3, résiliation **10 %**, parc affiché de 140 après résiliations.

### 12.2 Chiffre d’affaires année 1, mois par mois

**Abonnements**

| Mois | Calcul | Abonnement |
| --- | --- | ---: |
| 7 | 2 × 10 000 | 20 000 |
| 8 | 4 × 10 000 | 40 000 |
| 9 | 6 × 10 000 + 1 × 25 000 | 85 000 |
| 10 | 8 × 10 000 + 2 × 25 000 | 130 000 |
| 11 | 10 × 10 000 + 3 × 25 000 + 1 × 60 000 | 235 000 |
| 12 | 12 × 10 000 + 4 × 25 000 + 1 × 60 000 | 280 000 |
| **Total** | | **790 000** |

**Mises en service** (encaissées le mois de la signature)

| Mois | Calcul | Installation |
| --- | --- | ---: |
| 7 | 2 × 40 000 | 80 000 |
| 8 | 2 × 40 000 | 80 000 |
| 9 | 2 × 40 000 + 1 × 75 000 | 155 000 |
| 10 | 2 × 40 000 + 1 × 75 000 | 155 000 |
| 11 | 2 × 40 000 + 1 × 75 000 + 1 × 150 000 | 305 000 |
| 12 | 2 × 40 000 + 1 × 75 000 | 155 000 |
| **Total** | | **930 000** |

**Commission.** Volume électronique moyen par église payante : 1 000 000 F au mois 7-8, 1 500 000 F au mois 9-10, 2 000 000 F au mois 11-12. Taux moyen appliqué : 1,3 % (le parc est surtout en Essentiel à 1,5 %, un peu de Paroisse à 1,2 %).

| Mois | Volume électronique | Commission 1,3 % |
| --- | ---: | ---: |
| 7 | 2 × 1 000 000 = 2 000 000 | 26 000 |
| 8 | 4 × 1 000 000 = 4 000 000 | 52 000 |
| 9 | 7 × 1 500 000 = 10 500 000 | 136 500 |
| 10 | 10 × 1 500 000 = 15 000 000 | 195 000 |
| 11 | 14 × 2 000 000 = 28 000 000 | 364 000 |
| 12 | 17 × 2 000 000 = 34 000 000 | 442 000 |
| **Total** | **93 500 000** | **1 215 500** |

**Chiffre d’affaires année 1 : 790 000 + 930 000 + 1 215 500 = 2 935 500 F.**

Coût prestataire retiré de la marge, pas du chiffre d’affaires : 0,50 % × 93 500 000 = **467 500 F**.  
Marge brute année 1 : 2 935 500 − 467 500 = **2 468 000 F**.

### 12.3 Charges année 1

| Poste | Calcul | Montant |
| --- | --- | ---: |
| Développeur | 450 000 × 12 | 5 400 000 |
| Fondateur | 200 000 × 9 (mois 4 à 12) | 1 800 000 |
| Accompagnement | 180 000 (mois 6) + 300 000 × 6 | 1 980 000 |
| Juridique | forfait mois 2 | 400 000 |
| Hébergement, noms de domaine, outils | 40 000 × 12 | 480 000 |
| SMS de connexion et reçus | 25 000 × 6 puis 60 000 × 6 | 510 000 |
| Déplacements dimanches (Abidjan) | 40 000 × 6 | 240 000 |
| Téléphones de test, imprévus matériel | — | 250 000 |
| **Total charges** | | **11 060 000** |

**Résultat année 1 : 2 468 000 − 11 060 000 = −8 592 000 F.**  
La perte retenue est **8,6 millions F**, avec le fondateur payé à partir du mois 4. S’il ne se paie pas la première année, la perte baisse de 1,8 million, à environ 6,8 millions. Le besoin de financement garde le cas où il est payé : la société ne repose pas sur un travail gratuit durable.

### 12.4 Année 2

Parc moyen sur l’année : montée de 17 à 55, moyenne retenue **36 églises payantes**.

Mix moyen : 60 % Essentiel, 32 % Paroisse, 8 % Temple.

- Abonnement moyen : 0,60 × 10 000 + 0,32 × 25 000 + 0,08 × 60 000 = **18 000 F**.
- Abonnements : 36 × 18 000 × 12 = **7 776 000 F**.
- Nouvelles églises signées dans l’année (pour finir à 55 après 8 % de départ) : environ 42. Installation moyenne 60 000 F × 42 = **2 520 000 F**.
- Volume électronique : 36 églises × 2 500 000 F / mois × 12 = **1 080 000 000 F**.
- Commission moyenne 1,2 % = **12 960 000 F**.
- **Chiffre d’affaires année 2 : 23 256 000 F.**
- Coût prestataire 0,50 % × 1 080 000 000 = **5 400 000 F**.
- Marge brute : **17 856 000 F**.

Charges année 2 :

| Poste | Montant |
| --- | ---: |
| Masse salariale (fondateur, 2 développeurs, accompagnement, support) ≈ 1 700 000 × 12 | 20 400 000 |
| Hébergement et SMS | 1 800 000 |
| Déplacements et démos | 1 200 000 |
| Juridique, comptable | 600 000 |
| **Total** | **24 000 000** |

**Résultat année 2 si l’équipe passe trop tôt à 1,7 million F / mois : 17 856 000 − 24 000 000 = −6 144 000 F.**

Cette masse n’est pas retenue. L’année 2 se tient avec **1 350 000 F / mois** : pas de second développeur avant le mois 18, support à mi-temps.

**Variante retenue pour le besoin de fonds (équipe tenue) :**

- Masse 1 350 000 × 12 = 16 200 000
- Autres charges 3 600 000
- Charges totales 19 800 000
- **Résultat année 2 : 17 856 000 − 19 800 000 = −1 944 000 F**

On retient **−1,9 million F** comme perte année 2 dans le besoin de financement. C’est le chiffre de l’équipe tenue, pas celui de l’équipe élargie trop tôt.

### 12.5 Année 3

Parc moyen : **95 églises**. Mix : 50 % Essentiel, 36 % Paroisse, 13 % Temple, 1 % Réseau (le Réseau est compté à 150 000 F).

- Abonnement moyen ≈ 0,50 × 10 000 + 0,36 × 25 000 + 0,13 × 60 000 + 0,01 × 150 000 = **22 800 F**.
- Abonnements : 95 × 22 800 × 12 = **25 992 000 F**.
- Installations : environ 95 nouvelles signatures nettes d’une croissance 55 → 140 plus remplacement des résiliations, retenu **90 × 65 000 = 5 850 000 F**.
- Volume : 95 × 3 000 000 × 12 = **3 420 000 000 F** électroniques.
- Commission 1,1 % (le mix glisse vers Paroisse et Temple) = **37 620 000 F**.
- **Chiffre d’affaires : 69 462 000 F.**
- Coût prestataire 0,45 % (meilleur tarif au volume) × 3 420 000 000 = **15 390 000 F**.
- Marge brute : **54 072 000 F**.
- Charges : masse 3 200 000 × 12 = 38 400 000, autres 4 000 000, total **42 400 000 F**.
- **Résultat année 3 : +11 672 000 F.**

Le résultat de l’année 3 compte déjà le coût du prestataire de paiement. C’est ce chiffre, **+11,7 millions F**, qui est repris dans le résumé. Synthèse :

| Année | Chiffre d’affaires | Marge brute | Charges | Résultat |
| --- | ---: | ---: | ---: | ---: |
| 1 | 2,9 M | 2,5 M | 11,1 M | −8,6 M |
| 2 | 23,3 M | 17,9 M | 19,8 M | −1,9 M |
| 3 | 69,5 M | 54,1 M | 42,4 M | +11,7 M |

Cumul des résultats sur 3 ans : **+1,2 million F**. La société ne « rapporte » vraiment qu’en année 3. Les deux premières années achètent la preuve et le parc.

### 12.6 Besoin de financement

| Usage | Montant |
| --- | ---: |
| Perte année 1 | 8 600 000 |
| Perte année 2 | 1 900 000 |
| Coussin (3 mois de charges année 2) | 5 000 000 |
| **Total à réunir avant le mois 1** | **15 500 000 F** |

Arrondi de décision : **16 millions F**.

Origine proposée :

| Source | Montant | Contrepartie |
| --- | ---: | --- |
| Apport du fondateur | 2 000 000 | Capital |
| Avance ou don affecté de l’église JCV, traité comme prêt sans intérêt à 36 mois, seulement si le conseil le vote en connaissance de cause | 4 000 000 | Remboursement à partir du mois 30, 400 000 F / mois pendant 10 mois |
| Deux partenaires (pasteurs ou opérateurs) à 5 000 000 chacun | 10 000 000 | 15 % du capital chacun, fondateur 70 %. Pacte : pas de salaire exceptionnel, information mensuelle, pas de mise en garantie de l’argent des fidèles |

Si l’église ne prête pas, le trou de 4 millions se comble par un apport supplémentaire ou par le décalage du salaire fondateur (1,8 million) plus un report du chargé d’accompagnement plein temps au mois 9 (économie d’environ 0,6 million) plus une réduction du coussin. On ne comble pas ce trou en prenant une commission plus haute que le tableau : au-dessus de 1,5 %, les églises restent aux enveloppes.

### 12.7 Seuil de rentabilité mensuel (année 2, équipe tenue)

Charges mensuelles ≈ 19 800 000 / 12 = **1 650 000 F**.  
Marge par église moyenne ≈ 17 856 000 / 36 / 12 ≈ **41 300 F / mois**.  
Nombre d’églises pour couvrir les charges : 1 650 000 / 41 300 ≈ **40 églises**.

En dessous de 40 églises avec cette équipe, le mois est déficitaire. C’est le chiffre à regarder sur le tableau de bord, pas le chiffre d’affaires brut.

### 12.8 Cas où le plan ne tient pas

| Écart | Effet | Décision |
| --- | --- | --- |
| Le webhook paiement n’est pas fiable au mois 6 | On ne vend pas. On ne facture pas d’abonnement | Décaler la vente, ne pas embaucher l’accompagnateur |
| Moins de 8 églises payantes au mois 12 | CA année 1 divisé par deux, année 2 trop lente | Geler les embauches, le fondateur fait les dimanches |
| Coût prestataire ≥ 1 % | La commission à 1,2 % ne laisse presque rien | Basculer le revenu sur l’abonnement (Paroisse à 35 000 F) et afficher des frais au coût, sans marge |
| Une église exige que JCV Pay garde l’argent « en attendant » | Risque d’exercice illégal de service de paiement | Refus écrit. L’argent va sur le compte de l’église |
| Résiliation > 20 % | Le parc de l’année 3 ne paie pas l’équipe | Revenir sur place au premier mois, sortir les églises sans trésorier nommé |

---

## 13. Risques

| Risque | Gravité | Parade déjà dans le produit ou à tenir |
| --- | --- | --- |
| Argent des fidèles confondu avec l’argent de la société | Très haute | Interdit par le modèle. Prestataire + compte église |
| Double validation ou validation par la même personne qui a créé un faux membre | Haute | Droits séparés administrateur / trésorier, déjà dans les rôles |
| Reçu émis alors que l’opérateur n’a pas payé | Haute | Reçu seulement au statut `VALIDE` |
| Webhook perdu, fidèle débité, église non créditée dans l’app | Haute | Rapprochement quotidien numéro de transaction / relevé, file de rejeu |
| Téléphone du trésorier = seul accès | Haute | Deux comptes trésorier possibles, récupération par l’administrateur |
| Fuite de la liste des fidèles (noms, téléphones, montants) | Haute | Accès par rôle, pas d’export ouvert au fidèle, téléphone masqué dans les listes larges |
| Refus des fidèles âgés sans smartphone | Moyenne | Guichet espèces : le trésorier saisit, le reçu peut être montré ou imprimé |
| Dépendance à GeniusPay | Moyenne | Le métier (membre, caisse, reçu) reste à JCV Pay. Le connecteur de paiement est remplaçable |
| Saisonnalité (août, grosses conventions) | Moyenne | L’abonnement lisse. La commission baissera l’été : la trésorerie ne doit pas compter dessus pour les salaires |
| Conflit d’intérêt : l’outil sert l’église du fondateur et est vendu par elle | Moyenne | Contrat écrit, tarif Temple public, les autres églises ne financent pas le fonctionnement de JCV |

---

## 14. Indicateurs

Chaque mois, une page. Pas plus.

| Indicateur | Cible mois 6 | Cible mois 12 | Cible mois 24 |
| --- | ---: | ---: | ---: |
| Part du montant JCV qui passe dans l’app | 70 % | 85 % | 90 % |
| Écart dimanche (reçus vs relevés + espèces) | 0 F sur 2 dimanches | 0 F | 0 F |
| Versements `EN_ATTENTE` de plus de 7 jours | < 5 | < 10 sur tout le parc | < 2 % des déclarations |
| Délai médian reçu après paiement mobile | < 2 minutes | < 2 minutes | < 1 minute |
| Églises payantes | 0 | 17 | 55 |
| Églises actives (au moins 1 versement dans le mois) | 1 | 15 | 50 |
| Démos réalisées dans le mois | 0 | 8 | 12 |
| Signatures / démos | — | 1 / 5 | 1 / 5 |
| Résiliation sur 12 mois glissants | — | < 5 % | < 10 % |
| Marge brute / église / mois | — | > 25 000 F | > 40 000 F |
| Trésorerie société | > 8 M F | > 5 M F | > 3 mois de charges |

Un indicateur rouge deux mois de suite arrête la dépense commerciale et ramène l’équipe sur la fiabilité du paiement.

---

## 15. Calendrier de décision

| Date | Décision | Preuve attendue |
| --- | --- | --- |
| Fin octobre 2026 | Schéma juridique validé ou abonnement seul | Note d’avocat d’une page |
| Fin décembre 2026 | Chaîne de paiement fermée | 1 paiement Wave réel, 1 échec, 1 espèce validée, 1 rejet, 4 reçus cohérents |
| Fin mars 2027 | Ouverture à toute l’église JCV | 70 % des montants du mois dans l’app, écart de caisse nul |
| Fin avril 2027 | Droit de vendre | Deux dimanches sans écart, export du mois remis au conseil |
| Décembre 2027 | Continuer ou geler l’embauche | ≥ 8 églises payantes. En dessous : pas de second salaire commercial |
| Juin 2028 | Second développeur | Parc ≥ 35 et écart de caisse toujours nul |
| Décembre 2028 | Ouvrir ou non un second pays | 55 églises, marge positive sur un trimestre, prestataire local identifié |

---

## 16. Ce que ce plan demande tout de suite

Dans l’ordre, sans parallèle inutile :

1. Faire voter par le conseil de l’Église Jésus Christ Victoire l’usage de JCV Pay comme caisse officielle à partir du pilote, et le principe que les numéros personnels ne sont plus le canal des offrandes.
2. Ouvrir ou confirmer le compte d’encaissement au nom de l’église chez le prestataire, distinct de tout compte privé.
3. Obtenir la note juridique du mois 2.
4. Fermer la chaîne paiement → reçu → caisse sur de vrais francs, avec vingt fidèles, avant d’élargir.
5. Ne pas présenter JCV Pay à d’autres pasteurs tant que le reçu ne correspond pas au relevé.

Le fichier que vous lisez décrit un produit dont les écrans existent déjà. Le business ne commence pas à la rédaction de ce plan. Il commence au premier dimanche où la somme des reçus est égale à la somme encaissée.
