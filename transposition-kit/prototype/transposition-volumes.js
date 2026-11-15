/* Jeux de volumes de l'application Transposition, au format du fichier de données (versionFormat 1).
   Contenu fictif, aux volumes des sorties de la chaîne au 13/11/2026 :
   - depart : 61 lignes du manuel, toutes hors de l'ordre ; un arbre, celui de F22.1 (90 fonctions, 9 niveaux,
     2 696 lignes, 13 DataWindows, 192 appels non résolus, 11 appels en différé) ; une fiche, F04.1.a
     (14 règles métier, 35 exemples, 14 tests unitaires, 29 dossiers témoins, 5 questions) ; 15 dépendances
     proposées, toutes de F22.1 ; un socle de 38 objets.
   - intermediaire : les mêmes lignes, 31 dans l'ordre d'extraction sur six rangs, et les arbres de l'exemple.
   Ce fichier tient lieu de convertisseur : il calcule tailles, rangs et dépendances manquantes, que l'application lit sans les recalculer. */
(function () {
  'use strict';

  var V = (window.TranspositionVolumes = {});
  var clone = function (x) { return JSON.parse(JSON.stringify(x)); };

  /* ───────────── Le manuel : 61 lignes ─────────────
     identifiant, titre, page, signature mère, correspondance, confiance */
  var MANUEL = [
    ['F01.1', "Création du dossier administratif du patient", 6, 'w_dossier.ue_creer_dossier', 'cli', 'haute'],
    ['F01.2', "Recherche d'un dossier par nom, date de naissance ou numéro", 9, 'w_recherche_dossier.ue_rechercher', 'cli', 'haute'],
    ['F01.3', "Fusion de deux dossiers d'un même patient", 11, 'w_fusion_dossiers.ue_fusionner', 'cli', 'moyenne'],
    ['F02.1', "Saisie de la couverture par l'assurance maladie", 12, 'w_couverture.ue_enregistrer', 'cli', 'haute'],
    ['F02.2', "Saisie de la mutuelle et du contrat complémentaire", 15, 'w_mutuelle.ue_enregistrer_contrat', 'cli', 'haute'],
    ['F03.1', "Calcul du forfait journalier", 18, 'w_sejour.ue_forfait_journalier', 'cli', 'haute'],
    ['F03.2', "Exonérations du forfait journalier", 20, 'w_exonerations.ue_forfait_journalier', 'cli', 'moyenne'],
    ['F04.1', "Calcul du ticket modérateur", 22, 'w_sejour.ue_ticket_moderateur', 'cli', 'haute'],
    ['F05.1', "Participation forfaitaire sur les actes coûteux", 24, 'w_actes.ue_participation_forfaitaire', 'cli', 'moyenne'],
    ['F06.1', "Mouvements du patient entre les services", 25, 'w_mouvements.ue_enregistrer_mouvement', 'cli', 'haute'],
    ['F07.1', "Recalcul des frais de séjour", 27, 'w_sejour.ue_recalcul_sejour', 'cli', 'haute'],
    ['F07.2', "Permissions de sortie et absences de courte durée", 30, 'w_mouvements.ue_permission_sortie', 'repli', 'moyenne'],
    ['F08.1', "Saisie des actes et des consultations", 32, 'w_actes.ue_enregistrer_acte', 'cli', 'haute'],
    ['F08.2', "Contrôle de cohérence des actes saisis", 35, 'w_actes.ue_controler_actes', 'cli', 'moyenne'],
    ['F09.1', "Calcul des GHS", 49, 'w_sejour.ue_calcule_ghs', 'cli', 'moyenne'],
    ['F10.1', "Suppléments pour réanimation, soins intensifs et soins continus", 38, 'w_supplements.ue_calculer', 'cli', 'moyenne'],
    ['F11.1', "Médicaments et dispositifs médicaux facturés en sus", 41, 'w_produits_en_sus.ue_valoriser', 'cli', 'haute'],
    ['F12.1', "Prise en charge par la mutuelle", 44, 'uo_mutuelle.uf_prise_en_charge', 'cli', 'haute'],
    ['F13.1', "Contrôle des droits de l'assuré", 47, 'w_couverture.ue_controler_droits', 'cli', 'haute'],
    ['F14.1', "Honoraires des praticiens salariés", 52, 'w_honoraires.ue_calculer_salaries', 'cli', 'moyenne'],
    ['F14.2', "Honoraires des praticiens libéraux et redevances", 54, 'w_honoraires.ue_calculer_liberaux', 'repli', 'moyenne'],
    ['F15.1', "Édition du bordereau de facturation", 61, 'w_bordereau.ue_editer', 'repli', 'basse'],
    ['F15.2', "Réédition d'un bordereau", 63, 'w_bordereau.ue_reediter', 'repli', 'basse'],
    ['F16.1', "Facturation des consultations externes", 65, 'w_consultations.ue_facturer', 'cli', 'haute'],
    ['F16.2', "Forfaits des passages aux urgences sans hospitalisation", 68, 'w_urgences.ue_facturer_passage', 'cli', 'moyenne'],
    ['F17.1', "Acomptes et versements du patient", 71, 'w_acomptes.ue_enregistrer_versement', 'cli', 'haute'],
    ['F17.2', "Remboursement d'un trop-perçu", 74, 'w_remboursements.ue_rembourser', 'repli', 'moyenne'],
    ['F18.1', "Avoir sur une facture émise", 76, 'w_avoir.ue_creer_avoir', 'cli', 'haute'],
    ['F18.2', "Annulation et refacturation d'un séjour", 79, 'w_avoir.ue_annuler_refacturer', 'cli', 'moyenne'],
    ['F19.1', "Facturation des transports sanitaires", 82, null, 'sans-correspondance', 'basse'],
    ['F19.2', "Facturation des chambres mère-enfant et des accompagnants", 84, 'w_accompagnants.ue_facturer', 'repli', 'basse'],
    ['F20.1', "Numérotation des factures", 87, 'u_numerotation.uf_numero_definitif', 'cli', 'haute'],
    ['F20.2', "Clôture mensuelle de la facturation", 89, 'w_cloture.ue_cloturer_mois', 'cli', 'moyenne'],
    ['F21.1', "Prestations hôtelières : téléphone, télévision, repas", 92, 'w_prestations_hotelieres.ue_facturer', 'repli', 'moyenne'],
    ['F21.2', "Facturation des prestations pour exigence particulière", 94, 'w_exigences.ue_facturer', 'repli', 'basse'],
    ['F22.1', "Facturation du dossier à la sortie du patient", 96, 'w_facturation.ue_facturer_dossier', 'cli', 'haute'],
    ['F22.2', "Facturation intermédiaire d'un séjour long", 101, 'w_facturation_intermediaire.ue_facturer', 'cli', 'moyenne'],
    ['F23.1', "Contrôle des factures avant envoi", 104, 'w_controle_factures.ue_controler', 'cli', 'haute'],
    ['F23.2', "Liste des dossiers en attente de facturation", 107, 'w_liste_attente.ue_charger_liste', 'cli', 'haute'],
    ['F24.1', "Télétransmission des factures à l'assurance maladie", 110, 'w_teletransmission.ue_envoyer_lot', 'cli', 'haute'],
    ['F24.2', "Traitement des retours et des rejets de télétransmission", 114, 'w_teletransmission.ue_integrer_retours', 'cli', 'moyenne'],
    ['F24.3', "Relance des factures sans retour", 118, null, 'sans-correspondance', 'basse'],
    ['F25.1', "Envoi des factures aux mutuelles", 120, 'w_envoi_mutuelles.ue_envoyer', 'repli', 'moyenne'],
    ['F25.2', "Suivi des accords de prise en charge", 123, 'w_accords.ue_suivre_accords', 'repli', 'basse'],
    ['F26.1', "Encaissement d'un règlement", 126, 'w_caisse.ue_encaisser', 'cli', 'haute'],
    ['F26.2', "Lettrage des règlements et des factures", 129, 'w_lettrage.ue_lettrer', 'cli', 'haute'],
    ['F26.3', "Remise en banque des chèques", 132, 'w_caisse.ue_remise_banque', 'cli', 'moyenne'],
    ['F27.1', "Relances des patients débiteurs", 134, 'w_relances.ue_generer_relances', 'cli', 'moyenne'],
    ['F27.2', "Transmission des impayés au contentieux", 137, null, 'sans-correspondance', 'basse'],
    ['F27.3', "Admission en non-valeur", 140, 'w_contentieux.ue_non_valeur', 'repli', 'basse'],
    ['F28.1', "Écritures comptables de facturation", 142, 'w_ecritures.ue_generer_ecritures', 'cli', 'haute'],
    ['F28.2', "Export vers la comptabilité générale", 146, 'w_export_compta.ue_exporter', 'cli', 'moyenne'],
    ['F29.1', "Tarifs des prestations et périodes de validité", 149, 'w_tarifs.ue_enregistrer_tarif', 'cli', 'haute'],
    ['F29.2', "Mise à jour annuelle des tarifs de GHS", 152, 'w_tarifs.ue_importer_tarifs_ghs', 'repli', 'moyenne'],
    ['F29.3', "Coefficients de l'établissement", 155, 'w_coefficients.ue_enregistrer', 'cli', 'haute'],
    ['F30.1', "Statistiques d'activité par service", 157, null, 'sans-correspondance', 'basse'],
    ['F30.2', "État des restes à recouvrer", 160, 'w_restes_a_recouvrer.ue_calculer', 'cli', 'moyenne'],
    ['F30.3', "Journal des factures et des avoirs", 163, 'w_journal_factures.ue_editer', 'repli', 'moyenne'],
    ['F31.1', "Paramètres de l'établissement", 166, 'w_parametres.ue_enregistrer', 'cli', 'haute'],
    ['F31.2', "Gestion des utilisateurs et des habilitations", 169, null, 'sans-correspondance', 'basse'],
    ['F31.3', "Archivage et purge des dossiers soldés", 172, null, 'sans-correspondance', 'basse']
  ];
  var IDS = MANUEL.map(function (l) { return l[0]; });
  var rangManuel = function (id) { var i = IDS.indexOf(id); return i < 0 ? 999 : i; };
  var trierManuel = function (ids) { return ids.slice().sort(function (a, b) { return rangManuel(a) - rangManuel(b); }); };

  /* ───────────── L'arbre de F22.1 ─────────────
     Une ligne par appel, deux espaces par niveau. La première occurrence d'une fonction la développe et porte
     ses lignes, ses appels non résolus (nr) et ses DataWindows (dw) ; les suivantes sont des renvois.
     Un point initial abrège w_facturation ; fa, de, ta, pe et ec abrègent les objets ci-dessous ;
     un nom sans point est une fonction globale. */
  var SIGNATURE = 'w_facturation.ue_facturer_dossier';
  var ALIAS = { fa: 'u_facture', de: 'u_debiteurs', ta: 'u_tarification', pe: 'u_periodes', ec: 'n_cst_ecritures' };
  var ARBRE = [
    '.ue_facturer_dossier 107 nr=12 dw=d_dossier_facture',
    '  u_bandeau.uf_affiche',
    '  f_lit_parametre 31 dw=d_parametres',
    '  f_droit_utilisateur 22 nr=1',
    '    f_utilisateur_courant 12',
    '    f_lit_parametre',
    '  .uf_verrouille_dossier 24 nr=2',
    '    f_utilisateur_courant',
    '    f_pose_verrou 27 nr=1',
    '      f_date_serveur 8',
    '      f_base_ouverte 11',
    '    u_journal.uf_trace',
    '    f_message_erreur 18 nr=1',
    '      f_derniere_erreur 7',
    '  w_attente.uf_avance',
    '  .uf_controle_dossier 58 nr=7',
    '    f_date_vide 6',
    '    .uf_controle_identite 31 nr=3',
    '      f_cle_nir 38',
    '        f_est_numerique 9',
    '        f_modulo_97 9',
    '      f_age_patient 16',
    '        f_date_vide',
    '        f_date_serveur',
    '      f_date_vide',
    '      f_message_erreur',
    '    .uf_controle_couverture 44 nr=5 dw=d_couvertures',
    '      f_date_vide',
    '      u_droits_assure.uf_droits_ouverts',
    '      f_code_regime 21',
    '        f_complete_zeros 8',
    '      f_lit_parametre',
    '      f_message_erreur',
    '    .uf_controle_mouvements 37 nr=4 dw=d_mouvements',
    '      uf_time_convertdatetimeinseconds 23',
    '        f_date_vide',
    '      f_nb_jours 14',
    '        f_date_vide',
    '      pe.uf_chevauche 12',
    '        uf_time_convertdatetimeinseconds',
    '      f_code_service 17 nr=1',
    '        f_lit_parametre',
    '      f_message_erreur',
    '    f_message_erreur',
    '  .uf_charge_sejour 52 nr=7 dw=d_lignes_sejour',
    '    f_lit_parametre',
    '    pe.uf_decoupe_periodes 43 nr=3',
    '      pe.uf_chevauche',
    '      pe.uf_fusionne 19',
    '        pe.uf_chevauche',
    '        f_min_date 6',
    '      pe.uf_nb_jours_periode 8',
    '        f_nb_jours',
    '        uf_time_convertdatetimeinseconds',
    '      f_date_vide',
    '    w_sejour.ue_recalcul_sejour',
    '    u_pmsi.uf_resume_sejour',
    '    .uf_periode_tarifaire 28 nr=2',
    '      f_date_vide',
    '      f_jour_ferie 29',
    '        f_lit_parametre',
    '      f_nb_jours',
    '    f_message_erreur',
    '  .uf_charge_actes 41 nr=5 dw=d_actes',
    '    f_date_vide',
    '    u_honoraires.uf_actes_du_sejour',
    '    u_stock_pharmacie.uf_sorties_du_sejour',
    '    f_libelle_prestation 15 dw=d_prestations',
    '    f_message_erreur',
    '  fa.uf_initialise 26 nr=2',
    '    f_nom_etablissement 10',
    '      f_lit_parametre',
    '    f_exercice_comptable 19 nr=1',
    '      f_date_serveur',
    '      f_lit_parametre',
    '    fa.uf_numero_provisoire 14 nr=1',
    '      u_numerotation.uf_reserve_numero',
    '      f_utilisateur_courant',
    '      f_message_erreur',
    '  .uf_calcule_prestations 433 nr=24 dw=d_lignes_sejour,d_facture_lignes',
    '    w_attente.uf_avance',
    '    f_lit_parametre',
    '    .uf_calcule_sejour 118 nr=13',
    '      w_sejour.ue_forfait_journalier',
    '      u_calcul_ghs.uf_calcule',
    '      u_supplements_soins.uf_supplements_du_sejour',
    '      .uf_ligne_prestation 46 nr=4',
    '        ta.uf_tarif_prestation 39 nr=3 dw=d_tarifs',
    '          ta.uf_cherche_tarif 27 nr=2',
    '            ta.uf_periode 14',
    '              ta.uf_valide_a_la_date 11',
    '                ta.uf_compare_dates 8',
    '                  uf_time_convertdatetimeinseconds',
    '                f_date_vide',
    '              pe.uf_chevauche',
    '            f_tarif_produit 42 nr=1 dw=d_tarifs',
    '              f_lit_parametre',
    '            f_message_erreur',
    '          ta.uf_tarif_a_la_date 21 nr=1',
    '            ta.uf_cherche_tarif',
    '            f_jour_ferie',
    '            f_date_vide',
    '          ta.uf_coefficient 17 nr=1 dw=d_coefficients',
    '            f_lit_parametre',
    '            f_arrondi 9',
    '          ta.uf_majoration 19 nr=2',
    '            f_jour_ferie',
    '            f_arrondi',
    '          f_message_erreur',
    '        ta.uf_prix_unitaire 15',
    '          f_arrondi',
    '        f_libelle_prestation',
    '        fa.uf_ajoute_ligne 33 nr=3',
    '          fa.uf_cherche_ligne 17',
    '            f_date_vide',
    '          .uf_cumule_ligne 22 nr=1',
    '            f_arrondi',
    '          f_taux_tva 13 nr=1',
    '            f_lit_parametre',
    '          fa.ue_ligne_ajoutee 11 post',
    '            fa.uf_total_facture 21 nr=1',
    '              fa.uf_total_debiteur 15',
    '                fa.uf_ecart_arrondi 12',
    '                  f_arrondi',
    '                f_arrondi',
    '              f_arrondi',
    '            .ue_affiche_totaux 14 post',
    '              f_formate_montant 14',
    '                f_arrondi',
    '      f_nb_jours',
    '      f_arrondi',
    '      f_message_erreur',
    '    .uf_calcule_actes 64 nr=8',
    '      f_date_vide',
    '      u_honoraires.uf_calcule_honoraires',
    '      u_produits_en_sus.uf_valorise',
    '      .uf_ligne_prestation',
    '      f_libelle_prestation',
    '      f_arrondi',
    '      f_message_erreur',
    '    fa.uf_regroupe_lignes 38 nr=3',
    '      fa.uf_tri_lignes 9',
    '      f_arrondi',
    '    .ue_controle_differe 18 nr=1 post',
    '      f_message_erreur',
    '      u_journal.uf_trace',
    '    f_nb_jours',
    '    f_message_erreur',
    '  .uf_calcule_parts 72 nr=11 dw=d_debiteurs',
    '    de.uf_liste_debiteurs 28 nr=2 dw=d_couvertures',
    '      de.uf_ordre_debiteurs 13',
    '      f_code_regime',
    '      f_date_vide',
    '      f_message_erreur',
    '    u_ticket_moderateur.uf_calcule',
    '    u_participation_forfaitaire.uf_calcule',
    '    de.uf_part_organisme 36 nr=4',
    '      de.uf_plafonne 14',
    '        f_lit_parametre',
    '        f_arrondi',
    '      f_code_regime',
    '      f_arrondi',
    '    uo_mutuelle.uf_prise_en_charge',
    '    de.uf_part_complementaire 31 nr=3',
    '      f_date_vide',
    '      f_lit_parametre',
    '      f_arrondi',
    '    de.uf_part_assure 27 nr=2',
    '      de.uf_reste_a_charge 12',
    '        f_arrondi',
    '      u_acomptes.uf_acomptes_verses',
    '      f_arrondi',
    '    .uf_repartit_debiteurs 38 nr=4',
    '      fa.uf_ecart_arrondi',
    '      de.ue_debiteur_modifie 10 post',
    '        fa.uf_total_facture',
    '      f_arrondi',
    '    f_message_erreur',
    '  .uf_controle_totaux 27 nr=3',
    '    f_lit_parametre',
    '    fa.uf_total_facture',
    '    fa.uf_ecart_arrondi',
    '    f_formate_montant',
    '    f_message_erreur',
    '  .uf_enregistre_facture 61 nr=10 dw=d_facture_entete,d_facture_lignes',
    '    f_date_serveur',
    '    fa.uf_valide 24 nr=2',
    '      f_lit_parametre',
    '      f_date_vide',
    '      f_message_erreur',
    '    u_numerotation.uf_numero_definitif',
    '    fa.uf_enregistre 47 nr=6',
    '      f_base_ouverte',
    '      f_date_serveur',
    '      f_utilisateur_courant',
    '      f_derniere_erreur',
    '      f_message_erreur',
    '    ec.of_prepare_ecritures 56 nr=9 dw=d_ecritures',
    '      f_date_serveur',
    '      ec.of_compte_tiers 18 nr=1',
    '        f_code_regime',
    '        f_lit_parametre',
    '      ec.of_ecriture_debiteur 29 nr=2',
    '        f_formate_montant',
    '        f_arrondi',
    '      ec.of_equilibre 16',
    '        f_arrondi',
    '        f_message_erreur',
    '      ec.ue_ecritures_pretes 11 post',
    '        u_journal.uf_trace',
    '    f_derniere_erreur',
    '    f_message_erreur',
    '  .uf_arrete_compte 23 nr=2',
    '    f_lit_parametre',
    '    u_acomptes.uf_solde_patient',
    '    f_arrondi',
    '    f_formate_montant',
    '    f_message_erreur',
    '  .uf_deverrouille_dossier 13 nr=1',
    '    f_libere_verrou 15',
    '      f_base_ouverte',
    '    f_message_erreur',
    '  u_teletransmission.ue_preparer_flux post',
    '  w_bordereau.ue_editer post',
    '  u_messagerie_interne.uf_notifie post',
    '  .ue_apres_facturation 19 nr=2 post',
    '    .ue_rafraichir_liste 16 nr=1 post',
    '      f_formate_montant',
    '    f_date_serveur',
    '    f_message_erreur',
    '  w_attente.uf_ferme post'
  ];

  /* Les arrêts de l'arbre : quatre objets techniques, treize objets d'autres fonctionnalités (quinze dépendances),
     deux objets que le manuel ne décrit pas. objet, classe, confiance, lignes du manuel visées, raison */
  var ARRETS = [
    ['u_bandeau', 'technique', 90, [], "Bandeau de titre affiché en tête de fenêtre, sans règle de facturation."],
    ['u_journal', 'technique', 95, [], "Trace technique des traitements, sans règle de facturation."],
    ['w_attente', 'technique', 95, [], "Fenêtre d'attente qui montre l'avancement du traitement, sans règle de facturation."],
    ['u_messagerie_interne', 'technique', 85, [], "Prévient le service par la messagerie interne, sans règle de facturation."],
    ['w_sejour', 'autreFonctionnalite', 'haute', ['F03.1', 'F07.1'], "Calcule le forfait journalier et les frais de séjour, décrits pages 18 et 27 du manuel."],
    ['u_ticket_moderateur', 'autreFonctionnalite', 95, ['F04.1'], "Calcule le ticket modérateur du séjour, décrit page 22 du manuel."],
    ['u_participation_forfaitaire', 'autreFonctionnalite', 90, ['F05.1'], "Applique la participation forfaitaire sur les actes coûteux, décrite page 24 du manuel."],
    ['u_calcul_ghs', 'autreFonctionnalite', 95, ['F09.1'], "Calcule le tarif du séjour selon son groupe homogène, décrit page 49 du manuel."],
    ['u_supplements_soins', 'autreFonctionnalite', 90, ['F10.1'], "Calcule les suppléments pour réanimation, soins intensifs et soins continus, décrits page 38 du manuel."],
    ['u_produits_en_sus', 'autreFonctionnalite', 85, ['F11.1'], "Valorise les médicaments et les dispositifs médicaux facturés en sus, décrits page 41 du manuel."],
    ['uo_mutuelle', 'autreFonctionnalite', 'haute', ['F12.1'], "Détermine la part du séjour prise en charge par la mutuelle, décrite page 44 du manuel."],
    ['u_droits_assure', 'autreFonctionnalite', 90, ['F13.1'], "Contrôle les droits de l'assuré à la date des soins, contrôle décrit page 47 du manuel."],
    ['u_honoraires', 'autreFonctionnalite', 80, ['F14.1', 'F14.2'], "Calcule les honoraires des praticiens salariés et libéraux, décrits pages 52 et 54 du manuel."],
    ['w_bordereau', 'autreFonctionnalite', 'haute', ['F15.1'], "Édite le bordereau de facturation, décrit page 61 du manuel."],
    ['u_acomptes', 'autreFonctionnalite', 90, ['F17.1'], "Lit les acomptes et les versements du patient, décrits page 71 du manuel."],
    ['u_numerotation', 'autreFonctionnalite', 'haute', ['F20.1'], "Attribue le numéro de la facture, numérotation décrite page 87 du manuel."],
    ['u_teletransmission', 'autreFonctionnalite', 75, ['F24.1'], "Prépare la télétransmission de la facture à l'assurance maladie, décrite page 110 du manuel."],
    ['u_pmsi', 'autreFonctionnalite', 60, [], "Lit le résumé de séjour du PMSI, que le manuel de facturation ne décrit pas."],
    ['u_stock_pharmacie', 'autreFonctionnalite', 55, [], "Lit les sorties de stock de la pharmacie, que le manuel de facturation ne décrit pas."]
  ];
  var HORS_MANUEL = ['u_pmsi', 'u_stock_pharmacie'];

  var FICHIERS = {
    w_facturation: 'facturation/facturation.pbl.src/w_facturation.srw',
    u_facture: 'facturation/facturation.pbl.src/u_facture.sru',
    u_debiteurs: 'facturation/debiteurs.pbl.src/u_debiteurs.sru',
    u_tarification: 'commun/tarifs.pbl.src/u_tarification.sru',
    u_periodes: 'commun/outils.pbl.src/u_periodes.sru',
    n_cst_ecritures: 'comptabilite/ecritures.pbl.src/n_cst_ecritures.sru',
    u_bandeau: 'commun/presentation.pbl.src/u_bandeau.sru',
    u_journal: 'commun/journal.pbl.src/u_journal.sru',
    w_attente: 'commun/presentation.pbl.src/w_attente.srw',
    u_messagerie_interne: 'commun/messagerie.pbl.src/u_messagerie_interne.sru',
    w_sejour: 'admin/sejour.pbl.src/w_sejour.srw',
    u_ticket_moderateur: 'admin/sejour.pbl.src/u_ticket_moderateur.sru',
    u_participation_forfaitaire: 'admin/actes.pbl.src/u_participation_forfaitaire.sru',
    u_calcul_ghs: 'commun/taa.pbl.src/u_calcul_ghs.sru',
    u_supplements_soins: 'commun/taa.pbl.src/u_supplements_soins.sru',
    u_produits_en_sus: 'pharmacie/produits_en_sus.pbl.src/u_produits_en_sus.sru',
    uo_mutuelle: 'admin/mutuelle.pbl.src/uo_mutuelle.sru',
    u_droits_assure: 'admin/couverture.pbl.src/u_droits_assure.sru',
    u_honoraires: 'honoraires/honoraires.pbl.src/u_honoraires.sru',
    w_bordereau: 'facturation/editions.pbl.src/w_bordereau.srw',
    u_acomptes: 'caisse/acomptes.pbl.src/u_acomptes.sru',
    u_numerotation: 'facturation/facturation.pbl.src/u_numerotation.sru',
    u_teletransmission: 'teletransmission/flux_b2.pbl.src/u_teletransmission.sru',
    u_pmsi: 'pmsi/resumes.pbl.src/u_pmsi.sru',
    u_stock_pharmacie: 'pharmacie/stock.pbl.src/u_stock_pharmacie.sru',
    f_tarif_produit: 'commun/tarifs.pbl.src/f_tarif_produit.srf',
    uf_time_convertdatetimeinseconds: 'commun/horaires.pbl.src/uf_time_convertdatetimeinseconds.srf'
  };
  var PREMIERE_LIGNE = { w_facturation: 212, u_facture: 64, u_debiteurs: 48, u_tarification: 56, u_periodes: 40, n_cst_ecritures: 72 };

  function hachage(s) {
    var h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
    return h;
  }
  function identifiant(mot) {
    if (mot.charAt(0) === '.') return 'w_facturation' + mot;
    var i = mot.indexOf('.');
    if (i < 0) return mot + '.' + mot;
    var tete = mot.slice(0, i);
    return (ALIAS[tete] || tete) + mot.slice(i);
  }
  function objetDe(id) { return id.slice(0, id.lastIndexOf('.')); }
  function natureDe(id) {
    var objet = objetDe(id), nom = id.slice(objet.length + 1);
    return nom === objet ? 'fonctionGlobale' : /^ue_/.test(nom) ? 'evenement' : 'fonctionObjet';
  }
  function fichierDe(objet) { return FICHIERS[objet] || 'commun/outils.pbl.src/' + objet + '.srf'; }

  /* Lit le texte de l'arbre : registre des fonctions et appels imbriqués, au format du fichier. */
  function lireArbre() {
    var bloques = {};
    ARRETS.forEach(function (a) { bloques[a[0]] = true; });
    var fonctions = {}, curseurs = {}, racine = null, pile = [];
    ARBRE.forEach(function (brut) {
      var niveau = /^ */.exec(brut)[0].length / 2;
      var mots = brut.trim().split(/\s+/);
      var id = identifiant(mots[0]), objet = objetDe(id);
      var n = { fonction: id, post: false, enfants: [], mode: 'developpement' };
      var def = { lignes: null, nr: 0, dw: [] };
      mots.slice(1).forEach(function (m) {
        if (m === 'post') n.post = true;
        else if (m.indexOf('nr=') === 0) def.nr = Number(m.slice(3));
        else if (m.indexOf('dw=') === 0) def.dw = m.slice(3).split(',');
        else def.lignes = Number(m);
      });
      if (bloques[objet]) {
        n.mode = 'arret';
        if (!fonctions[id]) fonctions[id] = { objet: objet, nature: natureDe(id), fichier: fichierDe(objet) };
      } else if (fonctions[id]) {
        n.mode = 'reference';
      } else {
        var f = { objet: objet, nature: natureDe(id), fichier: fichierDe(objet) };
        if (f.nature === 'fonctionGlobale') f.debut = 1;
        else {
          f.debut = curseurs[objet] || PREMIERE_LIGNE[objet] || 40;
          curseurs[objet] = f.debut + def.lignes + 5 + (hachage(id) % 23);
        }
        f.lignes = def.lignes;
        if (def.dw.length) f.datawindows = def.dw;
        if (def.nr) f.nonResolus = def.nr;
        fonctions[id] = f;
      }
      if (niveau === 0) racine = n; else pile[niveau - 1].enfants.push(n);
      pile[niveau] = n;
      pile.length = niveau + 1;
    });

    /* Ligne de chaque appel : dans le corps de l'appelant, dans l'ordre des appels. */
    (function poser(n) {
      var f = fonctions[n.fonction], k = n.enfants.length, precedente = f.debut + 1;
      n.enfants.forEach(function (x, i) {
        var pas = (f.lignes - 4) / (k + 1);
        var ligne = Math.round(f.debut + 2 + (i + 1) * pas + ((hachage(x.fonction + i) % 7) - 3) * Math.min(1, pas / 8));
        x.ligne = Math.max(precedente + 1, Math.min(ligne, f.debut + f.lignes - 2));
        precedente = x.ligne;
        if (x.mode === 'developpement') poser(x);
      });
    })(racine);

    var appels = function (n) {
      return n.enfants.map(function (x) {
        var a = { fonction: x.fonction, ligne: x.ligne, mode: x.mode };
        if (x.post) a.post = true;
        if (x.mode === 'developpement' && x.enfants.length) { a.taille = null; a.appels = appels(x); }
        return a;
      });
    };
    var arbre = {
      taille: null,
      arrets: ARRETS.map(function (a) {
        var x = { objet: a[0], classe: a[1], raison: a[4], etat: 'candidate', confiance: a[2] };
        if (a[3].length) x.fonctionnalites = a[3];
        return x;
      }),
      appels: appels(racine)
    };
    return { fonctions: fonctions, arbre: arbre };
  }

  /* Taille au sens du format : les fonctions atteintes depuis une fonction en suivant les appels développés,
     les renvois et les autres arbres, directs ou en différé, sans franchir un arrêt. Chaque fonction compte une fois.
     Écrit la taille de chaque arbre et de chaque appel développé qui a des appels. */
  function mesurer(fonctions, arbres) {
    var dev = {};
    Object.keys(arbres).forEach(function (sig) {
      var t = (dev[sig] = {});
      t[sig] = arbres[sig].appels || [];
      (function voir(liste) {
        (liste || []).forEach(function (a) {
          if (a.mode === 'developpement') { t[a.fonction] = a.appels || []; voir(a.appels); }
        });
      })(arbres[sig].appels);
    });
    var profondeur = function (liste) {
      var p = 0;
      (liste || []).forEach(function (a) {
        p = Math.max(p, 1 + (a.mode === 'developpement' && a.appels && a.appels.length ? profondeur(a.appels) : 0));
      });
      return p;
    };
    var taille = function (sig, id, liste) {
      var vues = {}, dws = {}, arrets = {};
      var t = { fonctions: 0, lignes: 0, profondeur: profondeur(liste), datawindows: 0, nonResolus: 0, arrets: 0, posts: 0 };
      (function visiter(fn, arbre) {
        if (vues[fn]) return;
        vues[fn] = true;
        var f = fonctions[fn] || {};
        t.fonctions++;
        t.lignes += f.lignes || 0;
        t.nonResolus += f.nonResolus || 0;
        (f.datawindows || []).forEach(function (d) { dws[d] = true; });
        ((dev[arbre] || {})[fn] || []).forEach(function (a) {
          if (a.post) t.posts++;
          if (a.mode === 'arret') { arrets[(fonctions[a.fonction] || {}).objet] = true; return; }
          if (a.mode === 'autreArbre') visiter(a.fonction, a.fonction);
          else visiter(a.fonction, arbre);
        });
      })(id, sig);
      t.datawindows = Object.keys(dws).length;
      t.arrets = Object.keys(arrets).length;
      return t;
    };
    Object.keys(arbres).forEach(function (sig) {
      arbres[sig].taille = taille(sig, sig, arbres[sig].appels);
      (function ecrire(liste) {
        (liste || []).forEach(function (a) {
          if (a.mode === 'developpement' && a.appels && a.appels.length) { a.taille = taille(sig, a.fonction, a.appels); ecrire(a.appels); }
        });
      })(arbres[sig].appels);
    });
  }
  V.mesurer = mesurer;

  /* ───────────── La fiche de F04.1.a : 14 règles métier, 35 exemples ───────────── */

  function tableau(lignes, retrait) {
    var largeurs = [];
    lignes.forEach(function (l) { l.forEach(function (c, i) { largeurs[i] = Math.max(largeurs[i] || 0, String(c).length); }); });
    return lignes.map(function (l) {
      return retrait + '| ' + l.map(function (c, i) { c = String(c); return c + new Array(largeurs[i] - c.length + 1).join(' '); }).join(' | ') + ' |';
    });
  }
  function gherkin(entete, titre, pas, exemples) {
    var out = [entete + ': ' + titre];
    pas.forEach(function (p) { if (typeof p === 'string') out.push('  ' + p); else out = out.concat(tableau(p, '    ')); });
    if (exemples) out = out.concat(['', '  Exemples:'], tableau(exemples, '    '));
    return out.join('\n') + '\n';
  }
  /* Un exemple : titre, version française, pas du scénario, tests qui le prouvent, explication hors « conforme ». */
  function sc(titre, francais, pas, tests, explication) {
    return { titre: titre, francais: francais, gherkin: gherkin('Scénario', titre, pas), tests: tests || [], explication: explication };
  }
  function plan(titre, francais, pas, exemples, tests, explication) {
    return { titre: titre, francais: francais, gherkin: gherkin('Plan du scénario', titre, pas, exemples), tests: tests || [], explication: explication };
  }

  var SEJOUR = "Étant donné un séjour de médecine du 03/02/2025 au 06/02/2025";
  var PRIX = "Et un prix de journée de 900 €";
  var TAUX = "Et un régime au taux de 20 %";
  var CALCUL = "Quand on calcule le ticket modérateur";
  var SANS_CAS = "Aucun dossier de la recette ne porte ce cas.";

  var REGLES = [
    {
      enonce: "Le ticket modérateur est la part des frais de séjour laissée à la charge du patient, au taux de son régime.",
      code: [['u_ticket_moderateur.uf_calcule', 152, 198], ['u_ticket_moderateur.uf_base', 390, 421], ['u_ticket_moderateur.uf_taux_regime', 470, 512]],
      exemples: [
        sc("Trois journées au taux de 20 %", "Pour trois journées de médecine à 900 € et un régime au taux de 20 %, le ticket modérateur est de 540 €.",
          [SEJOUR, PRIX, TAUX, CALCUL, "Alors la base du ticket modérateur est de 2 700 €", "Et le ticket modérateur est de 540 €"], ['U-01', 'dossier-25-1204']),
        sc("Régime au taux de 10 %", "Pour les mêmes trois journées et un régime au taux de 10 %, le ticket modérateur est de 270 €.",
          [SEJOUR, PRIX, "Et un régime au taux de 10 %", CALCUL, "Alors le ticket modérateur est de 270 €"], ['dossier-25-1377']),
        sc("Cinq journées de chirurgie", "Pour cinq journées de chirurgie à 1 200 € et un régime au taux de 20 %, le ticket modérateur est de 1 200 €.",
          ["Étant donné un séjour de chirurgie du 10/03/2025 au 15/03/2025", "Et un prix de journée de 1 200 €", TAUX, CALCUL, "Alors la base du ticket modérateur est de 6 000 €", "Et le ticket modérateur est de 1 200 €"], ['dossier-25-2051'])
      ]
    },
    {
      enonce: "Le forfait journalier et les suppléments demandés par le patient n'entrent pas dans la base du ticket modérateur.",
      code: [['u_ticket_moderateur.uf_calcule', 199, 214], ['u_ticket_moderateur.uf_base', 422, 452]],
      exemples: [
        sc("Chambre particulière hors de la base", "Un séjour de 2 700 € de frais, avec 150 € de suppléments pour chambre particulière, donne un ticket modérateur de 540 € : les suppléments ne comptent pas.",
          [SEJOUR, "Et les lignes facturées suivantes :",
            [['produit', 'libellé', 'quantité', 'prix unitaire', 'montant'], ['PJ', 'Prix de journée', '3', '900 €', '2 700 €'], ['SH3', 'Chambre particulière', '2', '75 €', '150 €']],
            TAUX, CALCUL, "Alors la base du ticket modérateur est de 2 700 €", "Et le ticket modérateur est de 540 €"], ['U-02', 'dossier-25-1204']),
        sc("Forfait journalier hors de la base", "Les trois forfaits journaliers du séjour, soit 60 €, s'ajoutent à la facture sans changer le ticket modérateur de 540 €.",
          [SEJOUR, PRIX, "Et un forfait journalier à 20 €", TAUX, CALCUL, "Alors le forfait journalier facturé est de 60 €", "Et le ticket modérateur est de 540 €"], ['dossier-25-1204'])
      ]
    },
    {
      enonce: "Un patient pris en charge pour une affection de longue durée ne doit pas de ticket modérateur pour les soins liés à cette affection.",
      code: [['u_ticket_moderateur.uf_calcule', 215, 241], ['u_ticket_moderateur.uf_exoneration', 541, 588], ['u_ticket_moderateur.uf_exoneration', 589, 612]],
      exemples: [
        sc("Séjour en rapport avec l'affection", "Un patient en affection de longue durée, hospitalisé trois journées pour cette affection, ne doit aucun ticket modérateur.",
          [SEJOUR + ", en rapport avec l'affection", "Et une prise en charge de l'affection ouverte du 01/01/2024 au 31/12/2026", PRIX, CALCUL, "Alors le ticket modérateur est de 0 €", "Et le motif d'exonération est « affection de longue durée »"], ['U-03', 'dossier-25-871']),
        sc("Séjour sans rapport avec l'affection", "Le même patient, hospitalisé trois journées pour une autre cause, doit 540 € de ticket modérateur.",
          [SEJOUR + ", sans rapport avec l'affection", "Et une prise en charge de l'affection ouverte du 01/01/2024 au 31/12/2026", PRIX, TAUX, CALCUL, "Alors le ticket modérateur est de 540 €"], ['dossier-25-902']),
        sc("Droits fermés pendant le séjour", "Quand la prise en charge de l'affection s'arrête le 4 février, les journées des 3 et 4 février sont exonérées et celle du 5 février ne l'est pas : le ticket modérateur est de 180 €.",
          [SEJOUR + ", en rapport avec l'affection", "Et une prise en charge de l'affection ouverte jusqu'au 04/02/2025", PRIX, TAUX, CALCUL, "Alors les journées sont réparties ainsi :",
            [['journée', 'exonérée', 'base', 'ticket modérateur'], ['03/02/2025', 'oui', '900 €', '0 €'], ['04/02/2025', 'oui', '900 €', '0 €'], ['05/02/2025', 'non', '900 €', '180 €']],
            "Et le ticket modérateur est de 180 €"], ['dossier-26-118'],
          "La recette exonère tout le séjour : elle lit les droits à la date d'entrée.")
      ]
    },
    {
      enonce: "Une patiente hospitalisée pendant la période de prise en charge de sa maternité ne doit pas de ticket modérateur.",
      code: [['u_ticket_moderateur.uf_exoneration', 613, 651], ['u_ticket_moderateur.uf_exoneration', 652, 664]],
      exemples: [
        sc("Accouchement", "Une patiente hospitalisée du 12 au 16 mai 2025 pour son accouchement ne doit aucun ticket modérateur.",
          ["Étant donné un séjour de maternité du 12/05/2025 au 16/05/2025", "Et une prise en charge de la maternité ouverte du 01/04/2025 au 25/05/2025", CALCUL, "Alors le ticket modérateur est de 0 €", "Et le motif d'exonération est « maternité »"], ['U-04', 'dossier-25-1533']),
        sc("Hospitalisation avant la période", "Une patiente hospitalisée trois journées en février, alors que la prise en charge de sa maternité commence le 1er avril, doit 540 € de ticket modérateur.",
          [SEJOUR, "Et une prise en charge de la maternité ouverte à partir du 01/04/2025", PRIX, TAUX, CALCUL, "Alors le ticket modérateur est de 540 €"], ['dossier-25-1602'])
      ]
    },
    {
      enonce: "Un séjour qui fait suite à un accident du travail ou à une maladie professionnelle ne donne lieu à aucun ticket modérateur.",
      code: [['u_ticket_moderateur.uf_exoneration', 665, 692], ['u_ticket_moderateur.uf_exoneration', 693, 701]],
      exemples: [
        sc("Accident du travail", "Un patient hospitalisé trois journées après un accident du travail du 28 janvier 2025 ne doit aucun ticket modérateur.",
          [SEJOUR, "Et un accident du travail déclaré le 28/01/2025", "Et un séjour rattaché à cet accident", CALCUL, "Alors le ticket modérateur est de 0 €", "Et le motif d'exonération est « accident du travail »"], ['U-05', 'dossier-25-640']),
        sc("Maladie professionnelle", "Un patient hospitalisé pour une maladie professionnelle reconnue ne doit aucun ticket modérateur.",
          [SEJOUR, "Et une maladie professionnelle reconnue le 15/11/2024", "Et un séjour rattaché à cette maladie", CALCUL, "Alors le ticket modérateur est de 0 €"], ['U-05'])
      ]
    },
    {
      enonce: "Au-delà de la durée d'hospitalisation fixée par le régime, les journées suivantes sont exonérées du ticket modérateur.",
      code: [['u_ticket_moderateur.uf_calcule', 242, 270], ['u_ticket_moderateur.uf_calcule', 271, 279], ['u_ticket_moderateur.uf_exoneration', 702, 748], ['u_ticket_moderateur.uf_journees', 940, 968]],
      exemples: [
        sc("Séjour de trente-cinq journées", "Pour un séjour du 1er mars au 5 avril 2025 et une exonération à partir de la 31e journée, le ticket modérateur porte sur trente journées, soit 5 400 €.",
          ["Étant donné un séjour de médecine du 01/03/2025 au 05/04/2025", PRIX, "Et un régime au taux de 20 %, qui exonère à partir de la 31e journée", CALCUL, "Alors les périodes facturées sont :",
            [['du', 'au', 'journées', 'exonérée', 'ticket modérateur'], ['01/03/2025', '30/03/2025', '30', 'non', '5 400 €'], ['31/03/2025', '04/04/2025', '5', 'oui', '0 €']]], ['U-06', 'dossier-25-1988']),
        sc("Séjour de trente journées", "Pour un séjour du 1er au 31 mars 2025, aucune journée n'est exonérée : le ticket modérateur est de 5 400 €.",
          ["Étant donné un séjour de médecine du 01/03/2025 au 31/03/2025", PRIX, "Et un régime au taux de 20 %, qui exonère à partir de la 31e journée", CALCUL, "Alors 30 journées sont comptées", "Et le ticket modérateur est de 5 400 €"], ['dossier-25-2004']),
        sc("Deux séjours reliés par un transfert", "Un patient transféré après vingt journées dans un autre établissement, puis hospitalisé quinze journées, est exonéré à partir de la onzième : le ticket modérateur est de 1 800 €.",
          ["Étant donné un premier séjour de vingt journées dans un autre établissement", "Et un transfert le 21/03/2025", "Et un séjour de médecine du 21/03/2025 au 05/04/2025", PRIX, "Et un régime au taux de 20 %, qui exonère à partir de la 31e journée", CALCUL, "Alors 10 journées sont comptées", "Et le ticket modérateur est de 1 800 €"], [], SANS_CAS)
      ]
    },
    {
      enonce: "Quand le séjour comporte un acte dont le tarif atteint le seuil des actes coûteux, une participation forfaitaire remplace le ticket modérateur.",
      code: [['u_ticket_moderateur.uf_calcule', 369, 375], ['u_ticket_moderateur.uf_participation_forfaitaire', 830, 871], ['u_ticket_moderateur.uf_participation_forfaitaire', 872, 889]],
      exemples: [
        sc("Acte au-dessus du seuil", "Un séjour de trois journées avec un acte à 320 € donne une participation forfaitaire de 24 € et aucun ticket modérateur, pour un seuil de 120 €.",
          [SEJOUR, PRIX, "Et un acte au tarif de 320 € le 04/02/2025", "Et un seuil des actes coûteux à 120 €", "Et une participation forfaitaire à 24 €", CALCUL, "Alors le ticket modérateur est de 0 €", "Et la participation forfaitaire est de 24 €"], ['U-07', 'dossier-25-731']),
        sc("Acte au-dessous du seuil", "Avec un acte à 95 €, le ticket modérateur reste dû : 559 €, soit 20 % de 2 795 €.",
          [SEJOUR, PRIX, "Et un acte au tarif de 95 € le 04/02/2025", "Et un seuil des actes coûteux à 120 €", TAUX, CALCUL, "Alors la base du ticket modérateur est de 2 795 €", "Et le ticket modérateur est de 559 €", "Et aucune participation forfaitaire n'est facturée"], ['dossier-25-744']),
        sc("Acte au seuil exact", "Un acte à 120 € atteint le seuil : la participation forfaitaire de 24 € remplace le ticket modérateur.",
          [SEJOUR, PRIX, "Et un acte au tarif de 120 € le 04/02/2025", "Et un seuil des actes coûteux à 120 €", "Et une participation forfaitaire à 24 €", CALCUL, "Alors le ticket modérateur est de 0 €", "Et la participation forfaitaire est de 24 €"], ['dossier-26-52'],
          "La recette facture 564 € de ticket modérateur : sa version ne déclenche la participation qu'au-dessus de 120 €."),
        sc("Deux actes sous le seuil", "Deux actes à 80 € ne se cumulent pas pour atteindre le seuil : le ticket modérateur est de 572 €, soit 20 % de 2 860 €.",
          [SEJOUR, PRIX, "Et les actes suivants :",
            [['date', 'acte', 'tarif'], ['04/02/2025', 'Échographie', '80 €'], ['05/02/2025', 'Radiographie', '80 €']],
            "Et un seuil des actes coûteux à 120 €", TAUX, CALCUL, "Alors le ticket modérateur est de 572 €", "Et aucune participation forfaitaire n'est facturée"], ['dossier-25-760'])
      ]
    },
    {
      enonce: "La participation forfaitaire n'est due qu'une fois par séjour, quel que soit le nombre d'actes coûteux.",
      code: [['u_ticket_moderateur.uf_calcule', 280, 296], ['u_ticket_moderateur.uf_participation_forfaitaire', 890, 921]],
      exemples: [
        sc("Trois actes coûteux dans le séjour", "Un séjour avec trois actes à 320 €, 180 € et 450 € donne une seule participation forfaitaire de 24 €.",
          [SEJOUR, "Et les actes suivants :",
            [['date', 'acte', 'tarif'], ['04/02/2025', 'Endoscopie digestive', '320 €'], ['04/02/2025', 'Scanner abdominal', '180 €'], ['05/02/2025', 'Intervention sous anesthésie', '450 €']],
            "Et un seuil des actes coûteux à 120 €", "Et une participation forfaitaire à 24 €", CALCUL, "Alors une seule participation forfaitaire est facturée, pour 24 €"], ['U-08', 'dossier-25-815']),
        sc("Deux séjours le même mois", "Deux séjours distincts, chacun avec un acte coûteux, donnent deux participations forfaitaires de 24 €.",
          ["Étant donné un séjour du 03/02/2025 au 06/02/2025 avec un acte à 320 €", "Et un séjour du 17/02/2025 au 19/02/2025 avec un acte à 180 €", "Et une participation forfaitaire à 24 €", CALCUL + " de chaque séjour", "Alors chaque séjour porte une participation forfaitaire de 24 €"], ['dossier-25-816'])
      ]
    },
    {
      enonce: "Un nouveau-né hospitalisé dans les premiers jours qui suivent sa naissance ne doit pas de ticket modérateur.",
      code: [['u_ticket_moderateur.uf_exoneration', 530, 540], ['f_age_patient.f_age_patient', 1, 16]],
      exemples: [
        sc("Hospitalisation à huit jours", "Un enfant né le 2 mars 2025 et hospitalisé du 10 au 14 mars ne doit aucun ticket modérateur, pour une exonération de trente jours.",
          ["Étant donné un patient né le 02/03/2025", "Et un séjour de pédiatrie du 10/03/2025 au 14/03/2025", "Et une exonération des nouveau-nés pendant 30 jours", CALCUL, "Alors le ticket modérateur est de 0 €", "Et le motif d'exonération est « nouveau-né »"], ['U-09', 'dossier-25-1120']),
        sc("Hospitalisation à quarante-cinq jours", "Le même enfant, hospitalisé trois journées à partir du 16 avril, doit 540 € de ticket modérateur.",
          ["Étant donné un patient né le 02/03/2025", "Et un séjour de pédiatrie du 16/04/2025 au 19/04/2025", PRIX, TAUX, "Et une exonération des nouveau-nés pendant 30 jours", CALCUL, "Alors le ticket modérateur est de 540 €"], [], SANS_CAS)
      ]
    },
    {
      enonce: "Quand le prix de journée change pendant le séjour, chaque journée est comptée au tarif en vigueur ce jour-là.",
      code: [['u_ticket_moderateur.uf_calcule', 297, 318], ['u_ticket_moderateur.uf_tarif_du_jour', 1030, 1051], ['u_ticket_moderateur.uf_tarif_du_jour', 1052, 1072], ['u_tarification.uf_tarif_a_la_date', null, null]],
      exemples: [
        sc("Changement de tarif au 1er mars", "Pour un séjour du 26 février au 4 mars 2025, trois journées sont comptées à 900 € et trois à 930 € : le ticket modérateur est de 1 098 €.",
          ["Étant donné un séjour de médecine du 26/02/2025 au 04/03/2025", "Et un prix de journée de 900 € jusqu'au 28/02/2025", "Et un prix de journée de 930 € à partir du 01/03/2025", TAUX, CALCUL, "Alors la base du ticket modérateur est de 5 490 €", "Et le ticket modérateur est de 1 098 €"], ['U-10', 'dossier-25-391']),
        plan("Séjours autour du changement de tarif", "Un séjour terminé le 1er mars est compté à 900 €, un séjour commencé le 1er mars à 930 €, un séjour à cheval aux deux tarifs.",
          ["Étant donné un prix de journée de 900 € jusqu'au 28/02/2025", "Et un prix de journée de 930 € à partir du 01/03/2025", "Et le dossier témoin \"<dossier>\"", "Et un séjour de médecine du <entrée> au <sortie>", TAUX, CALCUL, "Alors <à 900 €> journées sont comptées à 900 €", "Et <à 930 €> journées sont comptées à 930 €", "Et le ticket modérateur est de <ticket modérateur>"],
          [['dossier', 'entrée', 'sortie', 'à 900 €', 'à 930 €', 'ticket modérateur'], ['25-377', '20/02/2025', '01/03/2025', '9', '0', '1 620 €'], ['25-391', '26/02/2025', '04/03/2025', '3', '3', '1 098 €'], ['25-402', '01/03/2025', '04/03/2025', '0', '3', '558 €']],
          ['dossier-25-377', 'dossier-25-391', 'dossier-25-402']),
        sc("Séjour sur trois périodes tarifaires", "Pour un séjour du 27 décembre 2024 au 4 mars 2025, les journées se répartissent sur trois tarifs et la facture porte une ligne par période : le ticket modérateur est de 12 058 €.",
          ["Étant donné un séjour de médecine du 27/12/2024 au 04/03/2025", "Et un patient sans motif d'exonération", "Et un régime au taux de 20 %, sans exonération de durée", "Et les mouvements suivants :",
            [['service', 'chambre', 'du', 'au'], ['Médecine', '214', '27/12/2024', '19/01/2025'], ['Médecine', '108', '20/01/2025', '04/03/2025']],
            "Et les prix de journée suivants :",
            [['service', 'du', 'au', 'prix de journée'], ['Médecine', '01/01/2024', '31/12/2024', '880 €'], ['Médecine', '01/01/2025', '28/02/2025', '900 €'], ['Médecine', '01/03/2025', '', '930 €']],
            CALCUL, "Alors les lignes facturées sont :",
            [['ligne', 'produit', 'service', 'du', 'au', 'journées', 'prix de journée', 'base', 'taux', 'ticket modérateur', 'part assurance maladie', 'débiteur du ticket'],
              ['1', 'PJ', 'Médecine', '27/12/2024', '31/12/2024', '5', '880 €', '4 400 €', '20 %', '880 €', '3 520 €', 'Patient'],
              ['2', 'PJ', 'Médecine', '01/01/2025', '28/02/2025', '59', '900 €', '53 100 €', '20 %', '10 620 €', '42 480 €', 'Patient'],
              ['3', 'PJ', 'Médecine', '01/03/2025', '03/03/2025', '3', '930 €', '2 790 €', '20 %', '558 €', '2 232 €', 'Patient']],
            "Et la base du ticket modérateur est de 60 290 €", "Et le ticket modérateur est de 12 058 €", "Et la part de l'assurance maladie est de 48 232 €", "Et aucune journée n'est exonérée", "Et le ticket modérateur est facturé au patient"], ['dossier-26-207'],
          "La recette compte la dernière période à 900 € : sa table des tarifs n'a pas reçu la mise à jour du 1er mars.")
      ]
    },
    {
      enonce: "Le ticket modérateur est arrondi au centime le plus proche, ligne par ligne.",
      code: [['u_ticket_moderateur.uf_arrondit_ligne', 1085, 1102], ['f_arrondi.f_arrondi', 1, 9]],
      exemples: [
        sc("Deux lignes arrondies", "Pour deux lignes de 333,33 € et 166,67 €, les tickets modérateurs sont de 66,67 € et 33,33 €, soit 100,00 € au total.",
          ["Étant donné les lignes facturées suivantes :", [['ligne', 'base'], ['1', '333,33 €'], ['2', '166,67 €']], TAUX, CALCUL, "Alors les tickets modérateurs sont :", [['ligne', 'ticket modérateur'], ['1', '66,67 €'], ['2', '33,33 €']], "Et le ticket modérateur de la facture est de 100,00 €"], ['U-11']),
        sc("Somme des lignes différente du total arrondi", "Pour trois lignes de 33,33 €, chaque ticket modérateur est de 6,67 € : la facture porte 20,01 €, et non 20,00 €.",
          ["Étant donné trois lignes facturées de 33,33 € chacune", TAUX, CALCUL, "Alors le ticket modérateur de chaque ligne est de 6,67 €", "Et le ticket modérateur de la facture est de 20,01 €"], ['dossier-26-64'],
          "La recette arrondit le total de la facture et obtient 20,00 €.")
      ]
    },
    {
      enonce: "Le jour de sortie n'est pas compté, sauf quand le patient décède ou est transféré vers un autre établissement.",
      code: [['u_ticket_moderateur.uf_calcule', 319, 334], ['u_ticket_moderateur.uf_journees', 969, 991], ['u_ticket_moderateur.uf_journees', 992, 1016]],
      exemples: [
        sc("Retour à domicile", "Pour un séjour du 3 au 6 février 2025 terminé par un retour à domicile, trois journées sont comptées : le ticket modérateur est de 540 €.",
          [SEJOUR, "Et une sortie vers le domicile", PRIX, TAUX, CALCUL, "Alors 3 journées sont comptées", "Et le ticket modérateur est de 540 €"], ['dossier-25-1204']),
        sc("Décès du patient", "Quand le patient décède le 6 février, la journée du 6 est comptée : quatre journées, soit 720 € de ticket modérateur.",
          [SEJOUR, "Et une sortie par décès", PRIX, TAUX, CALCUL, "Alors 4 journées sont comptées", "Et le ticket modérateur est de 720 €"], ['U-12', 'dossier-26-233'],
          "Le code extrait compte trois journées au lieu de quatre : le mode de sortie « décès » n'y est pas traité."),
        sc("Transfert vers un autre établissement", "Quand le patient est transféré le 6 février, la journée du 6 est comptée : quatre journées, soit 720 € de ticket modérateur.",
          [SEJOUR, "Et une sortie par transfert vers un autre établissement", PRIX, TAUX, CALCUL, "Alors 4 journées sont comptées", "Et le ticket modérateur est de 720 €"], ['dossier-25-1750'])
      ]
    },
    {
      enonce: "Le ticket modérateur d'un patient qui bénéficie de la complémentaire santé solidaire est facturé à l'organisme qui la gère.",
      code: [['u_ticket_moderateur.uf_calcule', 335, 352], ['u_ticket_moderateur.uf_debiteur', 1115, 1146], ['u_ticket_moderateur.uf_debiteur', 1147, 1179]],
      exemples: [
        sc("Bénéficiaire à la date d'entrée", "Pour un bénéficiaire de la complémentaire santé solidaire, les 540 € de ticket modérateur sont facturés à son organisme et le patient ne doit rien.",
          [SEJOUR, PRIX, TAUX, "Et des droits à la complémentaire santé solidaire ouverts du 01/07/2024 au 30/06/2025", CALCUL, "Alors les parts facturées sont :",
            [['débiteur', 'part', 'montant'], ['Assurance maladie', 'Part obligatoire', '2 160 €'], ['Organisme complémentaire', 'Ticket modérateur', '540 €'], ['Patient', 'Reste à charge', '0 €']]], ['U-13', 'dossier-25-1299']),
        sc("Droits fermés avant l'entrée", "Quand les droits à la complémentaire santé solidaire se sont arrêtés le 31 janvier 2025, le ticket modérateur du séjour de février est facturé au patient.",
          [SEJOUR, PRIX, TAUX, "Et des droits à la complémentaire santé solidaire fermés le 31/01/2025", CALCUL, "Alors le ticket modérateur de 540 € est facturé au patient"], ['dossier-25-1312'])
      ]
    },
    {
      enonce: "Quand plusieurs motifs d'exonération s'appliquent au même séjour, un seul est retenu, selon l'ordre de priorité de l'établissement.",
      code: [['u_ticket_moderateur.uf_calcule', 353, 368], ['u_ticket_moderateur.uf_motif_prioritaire', 760, 789], ['u_ticket_moderateur.uf_motif_prioritaire', 790, 811]],
      exemples: [
        sc("Affection de longue durée et maternité", "Pour une patiente en affection de longue durée hospitalisée pour son accouchement, le motif retenu est la maternité.",
          ["Étant donné un séjour de maternité du 12/05/2025 au 16/05/2025", "Et une prise en charge de la maternité ouverte du 01/04/2025 au 25/05/2025", "Et une prise en charge d'une affection de longue durée ouverte du 01/01/2024 au 31/12/2026", "Et l'ordre de priorité « accident du travail, maternité, affection de longue durée »", CALCUL, "Alors le ticket modérateur est de 0 €", "Et le seul motif d'exonération retenu est « maternité »"], ['U-14', 'dossier-25-1533']),
        sc("Accident du travail et affection de longue durée", "Pour un patient en affection de longue durée hospitalisé après un accident du travail, le motif retenu est l'accident du travail.",
          [SEJOUR + ", rattaché à un accident du travail", "Et une prise en charge d'une affection de longue durée ouverte du 01/01/2024 au 31/12/2026", "Et l'ordre de priorité « accident du travail, maternité, affection de longue durée »", CALCUL, "Alors le ticket modérateur est de 0 €", "Et le seul motif d'exonération retenu est « accident du travail »"], [], SANS_CAS)
      ]
    }
  ];

  /* Tests de la fiche : identifiant, libellé, verdict, explication */
  var UNITAIRES = [
    ['U-01', "Taux du régime appliqué aux frais de séjour", 'ok'],
    ['U-02', "Base sans forfait journalier ni supplément", 'ok'],
    ['U-03', "Exonération pour affection de longue durée", 'ok'],
    ['U-04', "Exonération pour maternité", 'ok'],
    ['U-05', "Exonération pour accident du travail ou maladie professionnelle", 'ok'],
    ['U-06', "Exonération à partir de la 31e journée", 'ok'],
    ['U-07', "Participation forfaitaire au-dessus du seuil", 'ok'],
    ['U-08', "Une seule participation forfaitaire par séjour", 'ok'],
    ['U-09', "Exonération du nouveau-né", 'ok'],
    ['U-10', "Tarif en vigueur à la date de la journée", 'ok'],
    ['U-11', "Arrondi ligne par ligne", 'ok'],
    ['U-12', "Jour du décès compté", 'echec', "Attendu : 4 journées ; obtenu : 3."],
    ['U-13', "Ticket modérateur facturé à l'organisme complémentaire", 'ok'],
    ['U-14', "Priorité entre deux motifs d'exonération", 'ok']
  ];
  var DOSSIERS = [
    ['dossier-25-1204', "Médecine, trois journées, retour à domicile", 'identique'],
    ['dossier-25-1377', "Médecine, régime au taux de 10 %", 'identique'],
    ['dossier-25-2051', "Chirurgie, cinq journées", 'identique'],
    ['dossier-25-871', "Affection de longue durée, séjour en rapport", 'identique'],
    ['dossier-25-902', "Affection de longue durée, séjour sans rapport", 'identique'],
    ['dossier-26-118', "Affection de longue durée, droits fermés pendant le séjour", 'ecartExplique', "La recette exonère les trois journées, le code extrait deux : la recette lit les droits à la date d'entrée."],
    ['dossier-25-1533', "Maternité, accouchement", 'identique'],
    ['dossier-25-1602', "Maternité, hospitalisation avant la période", 'identique'],
    ['dossier-25-640', "Accident du travail", 'identique'],
    ['dossier-25-1988', "Médecine, trente-cinq journées", 'identique'],
    ['dossier-25-2004', "Médecine, trente journées", 'identique'],
    ['dossier-25-731', "Acte à 320 €", 'identique'],
    ['dossier-25-744', "Acte à 95 €", 'identique'],
    ['dossier-26-52', "Acte à 120 €", 'ecartExplique', "La recette facture 564 € de ticket modérateur, le code extrait 24 € de participation forfaitaire : le seuil de la recette est strict."],
    ['dossier-25-760', "Deux actes à 80 €", 'identique'],
    ['dossier-25-815', "Trois actes coûteux", 'identique'],
    ['dossier-25-816', "Deux séjours, un acte coûteux chacun", 'identique'],
    ['dossier-25-1120', "Nouveau-né de huit jours", 'identique'],
    ['dossier-25-377', "Séjour terminé le 1er mars", 'identique'],
    ['dossier-25-391', "Séjour à cheval sur le 1er mars", 'identique'],
    ['dossier-25-402', "Séjour commencé le 1er mars", 'identique'],
    ['dossier-26-207', "Séjour sur trois périodes tarifaires", 'ecartExplique', "La recette compte la dernière période à 900 €, le code extrait à 930 € : la table des tarifs de la recette n'a pas reçu la mise à jour du 1er mars."],
    ['dossier-26-64', "Trois lignes de 33,33 €", 'ecartExplique', "La recette porte 20,00 €, le code extrait 20,01 € : la recette arrondit le total de la facture."],
    ['dossier-26-233', "Décès le jour de la sortie", 'ecart', "Attendu : 720 € de ticket modérateur ; obtenu : 540 €."],
    ['dossier-25-1750', "Transfert vers un autre établissement", 'identique'],
    ['dossier-25-1299', "Complémentaire santé solidaire", 'identique'],
    ['dossier-25-1312', "Complémentaire santé solidaire, droits fermés", 'identique'],
    ['dossier-26-140', "Séjour sans régime renseigné", 'nonComparable', "L'attendu de la recette n'est pas fiable : la facture témoin a été corrigée à la main."],
    ['dossier-26-171', "Séjour facturé deux fois", 'nonComparable', "L'attendu de la recette n'est pas fiable : le dossier porte deux factures pour la même période."]
  ];
  var QUESTIONS = [
    ["Le seuil des actes coûteux se lit-il à la date de l'acte ou à la date d'entrée ?", [7]],
    ["Deux séjours reliés par un transfert se cumulent-ils pour l'exonération de durée ?", [6]],
    ["Quel motif retenir quand deux motifs d'exonération ont la même priorité ?", [14]],
    ["Le jour du décès est-il compté quand le patient est entré le même jour ?", [12]],
    ["Faut-il arrondir le ticket modérateur de chaque ligne, ou seulement le total de la facture ?", [11]]
  ];

  /* Verdict de synthèse, règle de lecture du format. */
  function synthese(verdicts) {
    var a = function (liste) { return verdicts.some(function (v) { return liste.indexOf(v) >= 0; }); };
    if (a(['echec', 'ecart', 'erreur', 'delai'])) return 'echec';
    if (a(['ecartExplique'])) return 'ecartExplique';
    if (a(['ok', 'identique'])) return 'conforme';
    return 'nonVerifie';
  }
  function compter(liste) {
    var c = { total: liste.length };
    liste.forEach(function (t) { c[t.verdict] = (c[t.verdict] || 0) + 1; });
    return c;
  }

  function ficheTicketModerateur(fonctions) {
    var INFIX = 'TICKETMOD';
    var liste = UNITAIRES.map(function (t) { return t.concat(['unitaire']); }).concat(DOSSIERS.map(function (t) { return t.concat(['integration']); })).map(function (t) {
      var nature = t[t.length - 1], x = { id: t[0], nature: nature, libelle: t[1], verdict: t[2] };
      if (t.length > 4) x.explication = t[3];
      return x;
    });
    var parId = {};
    liste.forEach(function (t) { parId[t.id] = t; });
    var g = 0;
    var regles = REGLES.map(function (r, i) {
      return {
        id: 'RM-' + INFIX + '-' + (i + 1),
        enonce: r.enonce,
        code: r.code.map(function (c) {
          var f = fonctions[c[0]] || {}, debut = c[1] == null ? f.debut : c[1], fin = c[2] == null ? f.debut + f.lignes - 1 : c[2];
          return { regle: 'G-' + INFIX + '-' + (++g), fonction: c[0], debut: debut, fin: fin };
        }),
        exemples: r.exemples.map(function (e) {
          var x = { titre: e.titre, francais: e.francais, gherkin: e.gherkin };
          if (e.tests.length) x.tests = e.tests;
          x.verdict = synthese(e.tests.map(function (id) { return parId[id].verdict; }));
          if (e.explication) x.explication = e.explication;
          return x;
        })
      };
    });
    return {
      id: 'F04.1.a',
      mere: 'F04.1',
      titre: "Ticket modérateur des frais de séjour",
      page: 22,
      infix: INFIX,
      reperage: { signature: 'u_ticket_moderateur.uf_calcule', delimitation: 'retenue' },
      extraction: 'extracted',
      decoupage: { gardees: 47, coupees: 8, couvertes: g, techniques: 6, sansTest: 3 },
      regles: regles,
      questions: QUESTIONS.map(function (q, i) {
        return { id: 'Q-' + INFIX + '-' + (i + 1), texte: q[0], regles: q[1].map(function (n) { return 'RM-' + INFIX + '-' + n; }) };
      }),
      tests: {
        verdict: synthese(liste.map(function (t) { return t.verdict; })),
        unitaires: compter(liste.filter(function (t) { return t.nature === 'unitaire'; })),
        integration: compter(liste.filter(function (t) { return t.nature === 'integration'; })),
        liste: liste
      }
    };
  }

  var AUTEUR = 'DURAND Claire';
  var SAISIES_TICKET = {
    regles: {
      'RM-TICKETMOD-1': { avis: 'validee', auteur: AUTEUR, date: '2026-11-14' },
      'RM-TICKETMOD-2': { avis: 'validee', auteur: AUTEUR, date: '2026-11-14' },
      'RM-TICKETMOD-3': { avis: 'aRevoir', commentaire: "L'exonération suit bien les droits jour par jour, mais l'énoncé ne le dit pas : il faut l'écrire.", auteur: AUTEUR, date: '2026-11-14' },
      'RM-TICKETMOD-4': { avis: 'validee', auteur: AUTEUR, date: '2026-11-14' },
      'RM-TICKETMOD-5': { avis: 'validee', auteur: AUTEUR, date: '2026-11-14' },
      'RM-TICKETMOD-6': { avis: 'validee', commentaire: "Le cumul avec un séjour précédent reste à préciser : voir la question sur les transferts.", auteur: AUTEUR, date: '2026-11-15' },
      'RM-TICKETMOD-7': { avis: 'aRevoir', commentaire: "Le seuil se lit à la date de l'acte, et non à la date d'entrée.", auteur: AUTEUR, date: '2026-11-15' },
      'RM-TICKETMOD-8': { avis: 'validee', auteur: AUTEUR, date: '2026-11-15' }
    },
    questions: {
      'Q-TICKETMOD-1': { reponse: "À la date de l'acte.", auteur: AUTEUR, date: '2026-11-15' },
      'Q-TICKETMOD-5': { reponse: "Ligne par ligne : c'est ce que contrôle l'assurance maladie.", auteur: AUTEUR, date: '2026-11-15' }
    }
  };

  /* ───────────── Le socle : 38 objets ─────────────
     objet, nombre de lignes du manuel qui l'atteignent, origine. Les 27 premiers sont dans l'arbre de F22.1. */
  var SOCLE = [
    ['f_lit_parametre', 47, 'fanIn'], ['f_message_erreur', 44, 'fanIn'], ['f_date_vide', 41, 'fanIn'], ['f_arrondi', 36, 'fanIn'],
    ['f_utilisateur_courant', 33, 'fanIn'], ['f_date_serveur', 30, 'fanIn'], ['f_base_ouverte', 28, 'fanIn'], ['f_derniere_erreur', 27, 'fanIn'],
    ['f_formate_montant', 24, 'fanIn'], ['f_droit_utilisateur', 21, 'fanIn'], ['f_nb_jours', 19, 'fanIn'], ['f_complete_zeros', 15, 'fanIn'],
    ['f_code_service', 14, 'fanIn'], ['f_age_patient', 12, 'fanIn'], ['f_code_regime', 11, 'fanIn'], ['f_tarif_produit', 11, 'jugement'],
    ['f_est_numerique', 10, 'fanIn'], ['u_periodes', 9, 'jugement'], ['f_jour_ferie', 8, 'fanIn'], ['f_nom_etablissement', 7, 'fanIn'],
    ['u_tarification', 6, 'jugement'], ['f_pose_verrou', 5, 'jugement'], ['f_libere_verrou', 5, 'jugement'], ['f_cle_nir', 4, 'jugement'],
    ['f_modulo_97', 3, 'jugement'], ['f_min_date', 3, 'jugement'], ['uf_time_convertdatetimeinseconds', 3, 'jugement'],
    ['u_transaction', 23, 'jugement'], ['n_cst_chaine', 18, 'jugement'], ['f_date_vers_chaine', 17, 'fanIn'], ['f_chaine_vers_date', 13, 'fanIn'],
    ['f_confirme', 13, 'fanIn'], ['f_curseur_attente', 10, 'fanIn'], ['f_premier_jour_mois', 8, 'fanIn'], ['f_dernier_jour_mois', 7, 'fanIn'],
    ['f_sans_accent', 6, 'jugement'], ['f_remplace', 4, 'jugement'], ['f_nb_occurrences', 2, 'jugement']
  ];
  var SOCLE_EXEMPLE = { f_date_vide: ['F03.1', 'F07.1'], f_lit_parametre: ['F03.1', 'F07.1', 'F09.1', 'F12.1'], f_arrondi: ['F07.1', 'F09.1', 'F12.1'], f_tarif_produit: ['F03.1', 'F07.1'] };
  var PAS = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  function socle() {
    return SOCLE.map(function (s, k) {
      var pris = {}, n = 0, i = (k * 5 + 3) % IDS.length;
      var prendre = function (id) { if (!pris[id]) { pris[id] = true; n++; } };
      if (k < 27) prendre('F22.1');
      (SOCLE_EXEMPLE[s[0]] || []).forEach(prendre);
      while (n < s[1]) { prendre(IDS[i]); i = (i + PAS[k % PAS.length]) % IDS.length; }
      return { objet: s[0], origine: s[2], fonctionnalites: IDS.filter(function (id) { return pris[id]; }) };
    });
  }

  /* ───────────── État de départ : tout est hors de l'ordre ───────────── */

  function ligneDuManuel(l) {
    var rep = {};
    if (l[3]) rep.signature = l[3];
    rep.correspondance = { statut: l[4], confiance: l[5] };
    rep.delimitation = 'aucune';
    rep.ordre = { statut: 'signalee', extractible: false, causes: [l[0]] };
    return { id: l[0], titre: l[1], page: l[2], reperage: rep, extraction: 'notExtracted' };
  }
  function aretesDeF22(etat) {
    var out = [];
    ARRETS.forEach(function (a) {
      a[3].forEach(function (cible) {
        out.push({ source: 'F22.1', cible: cible, objet: a[0], origine: a[2] === 'haute' ? 'signatureMere' : 'jugement', etat: etat, confiance: a[2] });
      });
    });
    return out.sort(function (x, y) { return rangManuel(x.cible) - rangManuel(y.cible); });
  }

  V.depart = function () {
    var lu = lireArbre();
    var arbres = {};
    arbres[SIGNATURE] = lu.arbre;
    mesurer(lu.fonctions, arbres);
    var fonctionnalites = [];
    MANUEL.forEach(function (l) {
      fonctionnalites.push(ligneDuManuel(l));
      if (l[0] === 'F04.1') fonctionnalites.push(ficheTicketModerateur(lu.fonctions));
    });
    var aretes = aretesDeF22('candidate');
    var f22 = fonctionnalites.filter(function (f) { return f.id === 'F22.1'; })[0];
    var cibles = aretes.map(function (a) { return a.cible; });
    f22.reperage.delimitation = 'candidate';
    f22.reperage.ordre = { statut: 'signalee', extractible: false, manquantes: cibles, causes: ['F22.1'].concat(cibles), horsManuel: HORS_MANUEL };
    return {
      versionFormat: 1,
      produitLe: '2026-11-13',
      application: 'Facturation clinique',
      fonctions: lu.fonctions,
      arbres: arbres,
      fonctionnalites: fonctionnalites,
      dependances: { socle: socle(), aretes: aretes },
      saisies: clone(SAISIES_TICKET)
    };
  };

  /* ───────────── État intermédiaire : 31 fonctionnalités sur six rangs ─────────────
     Extraction de chaque fonctionnalité ordonnée : E extraite, S extraite sans ses dépendances, N non extraite. */
  var ETATS = {
    'F01.1': 'E', 'F02.1': 'E', 'F03.1': 'E', 'F06.1': 'E', 'F08.1': 'E', 'F12.1': 'N', 'F20.1': 'N', 'F29.1': 'E',
    'F09.1': 'S', 'F13.1': 'E', 'F03.2': 'N', 'F10.1': 'E', 'F11.1': 'E', 'F14.1': 'E', 'F08.2': 'N', 'F17.1': 'S',
    'F07.1': 'N', 'F04.1': 'E', 'F14.2': 'N', 'F16.1': 'N', 'F07.2': 'N', 'F19.2': 'N',
    'F05.1': 'N', 'F22.2': 'N', 'F16.2': 'N', 'F26.1': 'N',
    'F26.2': 'N', 'F17.2': 'N', 'F21.2': 'N',
    'F27.1': 'N', 'F30.2': 'N'
  };
  var EXTRACTION = { E: 'extracted', S: 'extractedSansDependances', N: 'notExtracted' };
  var PROPOSES = ['F07.1', 'F22.2', 'F21.2'];   /* périmètre proposé : leurs dépendances le sont aussi */
  var PARTIELLES = ['F16.1', 'F26.1'];          /* leur frontière garde un objet à juger */
  /* source, cible, objet qui porte la dépendance, confiance (« haute » : la fonction bloquée est la signature mère de la cible) */
  var ARETES = [
    ['F09.1', 'F12.1', 'uo_mutuelle', 'haute'],
    ['F13.1', 'F02.1', 'u_couverture', 95],
    ['F03.2', 'F03.1', 'w_sejour', 'haute'], ['F03.2', 'F02.1', 'u_couverture', 90],
    ['F10.1', 'F06.1', 'u_mouvements', 90], ['F10.1', 'F29.1', 'u_tarifs', 85],
    ['F11.1', 'F29.1', 'u_tarifs', 90],
    ['F14.1', 'F08.1', 'u_actes', 95],
    ['F08.2', 'F08.1', 'u_actes', 95],
    ['F17.1', 'F01.1', 'u_dossier', 85], ['F17.1', 'F20.1', 'u_numerotation', 'haute'],
    ['F07.1', 'F09.1', 'u_calcul_ghs', 95], ['F07.1', 'F12.1', 'uo_mutuelle', 'haute'],
    ['F04.1', 'F13.1', 'u_droits_assure', 90], ['F04.1', 'F29.1', 'u_tarifs', 85],
    ['F14.2', 'F14.1', 'u_honoraires', 90],
    ['F16.1', 'F08.2', 'u_controle_actes', 80], ['F16.1', 'F13.1', 'u_droits_assure', 90],
    ['F07.2', 'F10.1', 'u_supplements_soins', 85], ['F07.2', 'F06.1', 'u_mouvements', 95],
    ['F19.2', 'F03.2', 'w_exonerations', 'haute'],
    ['F05.1', 'F04.1', 'u_ticket_moderateur', 90], ['F05.1', 'F08.1', 'u_actes', 95],
    ['F22.2', 'F07.1', 'w_sejour', 'haute'], ['F22.2', 'F20.1', 'u_numerotation', 'haute'],
    ['F16.2', 'F16.1', 'w_consultations', 'haute'],
    ['F26.1', 'F17.1', 'u_acomptes', 90], ['F26.1', 'F16.1', 'w_consultations', 'haute'],
    ['F26.2', 'F26.1', 'u_reglements', 90],
    ['F17.2', 'F26.1', 'u_reglements', 85], ['F17.2', 'F17.1', 'u_acomptes', 90],
    ['F21.2', 'F05.1', 'u_participation_forfaitaire', 75], ['F21.2', 'F22.2', 'u_facture_intermediaire', 70],
    ['F27.1', 'F26.2', 'u_lettrage', 90],
    ['F30.2', 'F26.2', 'u_lettrage', 85], ['F30.2', 'F17.2', 'u_remboursements', 80]
  ];
  /* Hors de l'ordre, mais délimitées : elles atteignent F22.1 ou portent un objet hors manuel. */
  var ARETES_HORS = [
    ['F18.1', 'F20.1', 'u_numerotation', 'haute', 'candidate'], ['F18.1', 'F22.1', 'w_facturation', 'haute', 'candidate'],
    ['F23.1', 'F22.1', 'w_facturation', 'haute', 'retenue']
  ];

  V.intermediaire = function () {
    var d = V.depart();
    var ex = window.TranspositionExemple || null;
    d.produitLe = '2027-01-15';
    var parId = {};
    d.fonctionnalites.forEach(function (f) { parId[f.id] = f; });

    /* Les fonctionnalités de l'exemple gardent leurs arbres, leurs règles et leurs tests. */
    if (ex) {
      var sous = [];
      ex.fonctionnalites.forEach(function (f) {
        var x = clone(f);
        if (x.mere) { sous.push(x); return; }
        var cible = parId[x.id];
        if (!cible) return;
        ['infix', 'decoupage', 'regles', 'questions', 'tests'].forEach(function (k) { if (x[k] != null) cible[k] = x[k]; });
      });
      sous.forEach(function (x) {
        var i = d.fonctionnalites.map(function (f) { return f.id; }).lastIndexOf(x.mere);
        var j = i + 1;
        while (j < d.fonctionnalites.length && d.fonctionnalites[j].mere === x.mere) j++;
        d.fonctionnalites.splice(j, 0, x);
        parId[x.id] = x;
      });
      Object.keys(ex.fonctions).forEach(function (id) { d.fonctions[id] = clone(ex.fonctions[id]); });
      Object.keys(ex.arbres).forEach(function (sig) { d.arbres[sig] = clone(ex.arbres[sig]); });
      Object.keys(ex.saisies.regles).forEach(function (id) { d.saisies.regles[id] = clone(ex.saisies.regles[id]); });
      Object.keys(ex.saisies.questions).forEach(function (id) { d.saisies.questions[id] = clone(ex.saisies.questions[id]); });
    }

    /* Dépendances : celles des fonctionnalités ordonnées, celles de F22.1, celles des délimitées hors de l'ordre. */
    var aretes = ARETES.map(function (a) {
      return { source: a[0], cible: a[1], objet: a[2], origine: a[3] === 'haute' ? 'signatureMere' : 'jugement', etat: PROPOSES.indexOf(a[0]) >= 0 ? 'candidate' : 'retenue', confiance: a[3] };
    }).concat(ARETES_HORS.map(function (a) {
      return { source: a[0], cible: a[1], objet: a[2], origine: 'signatureMere', etat: a[4], confiance: a[3] };
    })).concat(aretesDeF22('candidate'));
    aretes.sort(function (x, y) { return rangManuel(x.source) - rangManuel(y.source) || rangManuel(x.cible) - rangManuel(y.cible); });
    d.dependances.aretes = aretes;

    var cibles = function (id) { return aretes.filter(function (a) { return a.source === id; }).map(function (a) { return a.cible; }); };
    var atteintes = function (id) {
      var vues = {};
      (function voir(x) { cibles(x).forEach(function (c) { if (!vues[c]) { vues[c] = true; voir(c); } }); })(id);
      return trierManuel(Object.keys(vues));
    };
    var rangs = {};
    var rang = function (id) {
      if (rangs[id] == null) rangs[id] = 1 + Math.max.apply(null, [0].concat(cibles(id).map(rang)));
      return rangs[id];
    };

    Object.keys(ETATS).forEach(function (id) {
      var f = parId[id], rep = f.reperage;
      f.extraction = EXTRACTION[ETATS[id]];
      rep.correspondance = { statut: 'cli', confiance: rep.correspondance.statut === 'cli' ? rep.correspondance.confiance : 'moyenne' };
      rep.delimitation = PROPOSES.indexOf(id) >= 0 ? 'candidate' : 'retenue';
    });
    Object.keys(ETATS).forEach(function (id) {
      var f = parId[id];
      var manquantes = atteintes(id).filter(function (x) { return parId[x].extraction !== 'extracted'; });
      var o = { rang: rang(id), statut: PARTIELLES.indexOf(id) >= 0 ? 'partielle' : 'ordonnee', extractible: !manquantes.length };
      if (manquantes.length) o.manquantes = manquantes;
      f.reperage.ordre = o;
    });

    /* Hors de l'ordre : F22.1 garde son périmètre proposé et ses objets hors manuel ; trois lignes sont délimitées. */
    var horsOrdre = function (id, delimitation, causes, horsManuel) {
      var f = parId[id], manquantes = atteintes(id).filter(function (x) { return parId[x].extraction !== 'extracted'; });
      f.reperage.delimitation = delimitation;
      var o = { statut: 'signalee', extractible: false };
      if (manquantes.length) o.manquantes = manquantes;
      o.causes = causes;
      if (horsManuel) o.horsManuel = horsManuel;
      f.reperage.ordre = o;
    };
    horsOrdre('F22.1', 'candidate', ['F22.1', 'F15.1', 'F24.1'], HORS_MANUEL);
    horsOrdre('F18.1', 'candidate', ['F22.1']);
    horsOrdre('F23.1', 'retenue', ['F22.1']);
    horsOrdre('F28.2', 'retenue', ['F28.2'], ['u_interface_comptable']);
    return d;
  };
})();
