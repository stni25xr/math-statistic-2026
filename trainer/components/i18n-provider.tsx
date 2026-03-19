"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CategorySlug } from "@/lib/types";

export type Locale = "en" | "sv" | "fr";

type Dict = Record<string, string>;

const dictionaries: Record<Locale, Dict> = {
  en: {
    app_name: "Math Statistics Exam Trainer",
    nav_home: "Home",
    nav_practice: "Practice mode",
    nav_crash: "3-day crash plan",
    dyslexia_on: "Dyslexia Mode On",
    dyslexia_off: "Dyslexia Mode",
    language: "Language",

    home_target: "3-day target: 30 points",
    home_subtitle:
      "Train by topic, learn formulas, and see every step. Questions are grouped by method so you can recognize patterns fast under exam pressure.",
    start_training: "Start training",
    open_crash_plan: "Open 3-day crash plan",
    search_label: "Search by keyword, formula, or topic",
    search_placeholder: "Try: Bayes, z-test, CLT, Poisson",
    search_results: "Search results ({count})",
    no_match_try:
      "No match found. Try a formula keyword like \"Phi\" or \"H0\".",
    topic_categories: "Topic categories",
    organized_by_type:
      "All questions are organized by question type, not by exam date.",
    crash_plan_card_title: "3-day crash plan",
    crash_plan_card_text:
      "Prioritized for fast scoring: Standardization, Poisson process, Bayes/Total Probability, Combinatorics, Confidence intervals, and Hypothesis tests first. Then CLT and MLE.",
    view_daily_plan: "View daily plan",

    progress_overview: "Progress overview",
    completed: "Completed",
    need_review: "Need review",
    understood: "Understood",
    goal_progress: "Goal progress (target: 30 points readiness)",
    progress: "Progress",

    category: "Category",
    how_identify_method: "How to identify the right method",
    hide_formulas: "Hide formulas",
    show_formulas: "Show formulas",
    hide_solution_previews: "Hide solution previews",
    show_solution_previews: "Show solution previews",
    switch_full_list: "Switch to full list",
    one_question_at_a_time: "One question at a time",
    question_bank: "Question bank ({count})",
    question_bank_subtitle:
      "Easy, medium, and exam-like drills from all uploaded exams, grouped by this method.",
    no_questions_match:
      "No questions match these filters. Try a wider keyword or reset formula filter.",
    question_x_of_y: "Question {x} of {y}",
    previous: "Previous",
    next: "Next",
    common_patterns: "Common patterns",
    common_mistakes: "Common mistakes",

    search_keyword: "Search keyword",
    filter_placeholder: "e.g. z-test, Poisson, Bayes",
    difficulty: "Difficulty",
    all: "All",
    easy: "Easy",
    medium: "Medium",
    exam_like: "Exam-like",
    filter_formula_topic: "Filter by formula/topic",
    all_formulas_topics: "All formulas/topics",

    practice_mode: "Practice mode",
    practice_intro:
      "Exam-by-exam, question-by-question order. Filter by category and train in real exam sequence. Reveal answers only after your attempt. Keyboard shortcuts: N next, R reveal, 1/2/3 self-rating, C complete, F flag review.",
    session_progress: "Session progress {value}",
    from_exam_problem: "From {exam} · Problem {problem}",
    next_question: "Next question",
    checkpoint_pending:
      "Complete setup checkpoint in the workspace to unlock next question.",
    checkpoint_passed: "Checkpoint passed. You can proceed to the next question.",
    reveal_answer: "Reveal answer",
    hide_answer: "Hide answer",
    mark_completed: "Mark completed",
    flag_review: "Flag review",
    needs_review: "Needs review",
    open_question: "Open question",
    almost: "Almost",

    quiz_setup: "Practice mode setup",
    quiz_setup_desc:
      "Choose a category. Questions run exam-by-exam, then question-by-question.",
    mode: "Mode",
    all_categories_exam_order: "All categories (exam order)",
    timed_mode: "Timed mode",
    timer_minutes: "Timer (minutes)",

    back_to_category: "Back to category",
    source_problem: "Source: {exam} · Problem {problem}",
    why_method_applies: "Why this method applies",
    pattern_hint: "Pattern recognition hint",
    why_other_wrong: "Why other methods are wrong here",
    hide_full_solution: "Hide full solution",
    show_full_solution: "Show full solution",
    track_question: "Track this question",

    common_mistake: "Common mistake",
    exam_shortcut: "Exam shortcut",
    what_memorize: "What to memorize",
    key_formulas: "Key formulas",

    answer_workspace: "Answer workspace",
    calculator: "Calculator",
    formula_pdf: "Formula PDF",
    table_pdf: "Table PDF",
    your_answer: "Your answer",
    question_type_dropdown: "Question type",
    choose_question_type: "Choose question type...",
    formula_dropdown: "Formula to use",
    choose_formula: "Choose formula...",
    answer_dropdown: "Answer dropdown",
    choose_answer: "Choose answer...",
    check_answer: "Check answer",
    correct: "Correct",
    not_yet_correct: "Not yet correct",
    continue_ok: "Correct. You can continue.",
    write_answer_for: "Write answer text for {parts}.",
    pick_question_type_for: "Pick the correct question type for {parts}.",
    pick_formula_for: "Pick the correct formula for {parts}.",
    pick_dropdown_for: "Pick correct dropdown answer for {parts}.",
    close: "Close",
    sub_question: "Sub-question {label}",
    question: "Question",
    insert_note: "Insert sends result to the active answer field.",
    math_symbols: "Math symbols",

    crash_header: "3-day crash plan",
    crash_title: "Fast route to a 30-point exam result",
    crash_text:
      "This plan is optimized for high-yield methods seen repeatedly in your uploaded exams. Do not study by year. Study by method and pattern.",
    priority_order: "Priority order",
    last24: "Last 24 hours checklist",
    start_timed: "Start timed practice",

    what_to_study: "What to study",
    what_to_memorize: "What to memorize",
    what_to_drill: "What to drill",
    skip_if_short: "Skip if short on time",

    solution_logic: "Solution (logic-first)",
    use_structure: "Use this structure",
    structure_line:
      "Let/define symbols -> Given -> Formula -> Substitute -> Compute -> Answer",
    boxed_final: "Boxed final answer",
  },
  sv: {
    app_name: "Tränare för matematisk statistik",
    nav_home: "Hem",
    nav_practice: "Övningsläge",
    nav_crash: "3-dagars crashplan",
    dyslexia_on: "Dyslexiläge på",
    dyslexia_off: "Dyslexiläge",
    language: "Språk",

    home_target: "3-dagarsmål: 30 poäng",
    home_subtitle:
      "Träna per område, lär dig formler och se alla steg. Frågorna är grupperade efter metod så att du känner igen mönster snabbt under press.",
    start_training: "Starta träning",
    open_crash_plan: "Öppna 3-dagarsplan",
    search_label: "Sök med nyckelord, formel eller ämne",
    search_placeholder: "Testa: Bayes, z-test, CLT, Poisson",
    search_results: "Sökresultat ({count})",
    no_match_try: "Ingen träff. Prova t.ex. \"Phi\" eller \"H0\".",
    topic_categories: "Ämneskategorier",
    organized_by_type: "Alla frågor är organiserade efter frågetyp, inte provdatum.",
    crash_plan_card_title: "3-dagars crashplan",
    crash_plan_card_text:
      "Prioriterad för snabb poäng: standardisering, Poissonprocess, Bayes/total sannolikhet, kombinatorik, konfidensintervall och hypotesprövning först. Sedan CLT och MLE.",
    view_daily_plan: "Visa dagsplan",

    progress_overview: "Översikt framsteg",
    completed: "Klar",
    need_review: "Repetera",
    understood: "Förstått",
    goal_progress: "Målprogression (mål: 30 poängs nivå)",
    progress: "Framsteg",

    category: "Kategori",
    how_identify_method: "Så väljer du rätt metod",
    hide_formulas: "Dölj formler",
    show_formulas: "Visa formler",
    hide_solution_previews: "Dölj lösningsförhandsvisning",
    show_solution_previews: "Visa lösningsförhandsvisning",
    switch_full_list: "Visa hela listan",
    one_question_at_a_time: "En fråga åt gången",
    question_bank: "Frågebank ({count})",
    question_bank_subtitle:
      "Lätta, medel och provlika övningar från alla uppladdade prov, grupperade efter metod.",
    no_questions_match:
      "Inga frågor matchar filtren. Prova bredare sökord eller återställ formelfilter.",
    question_x_of_y: "Fråga {x} av {y}",
    previous: "Föregående",
    next: "Nästa",
    common_patterns: "Vanliga mönster",
    common_mistakes: "Vanliga misstag",

    search_keyword: "Sökord",
    filter_placeholder: "t.ex. z-test, Poisson, Bayes",
    difficulty: "Svårighetsgrad",
    all: "Alla",
    easy: "Lätt",
    medium: "Medel",
    exam_like: "Provlika",
    filter_formula_topic: "Filtrera på formel/ämne",
    all_formulas_topics: "Alla formler/ämnen",

    practice_mode: "Övningsläge",
    practice_intro:
      "Prov för prov, fråga för fråga. Filtrera på kategori och träna i riktig provordning. Visa svar först efter ditt försök. Kortkommandon: N nästa, R visa, 1/2/3 självskattning, C klar, F flagga.",
    session_progress: "Passprogression {value}",
    from_exam_problem: "Från {exam} · Uppgift {problem}",
    next_question: "Nästa fråga",
    checkpoint_pending: "Slutför kontrollen i arbetsytan för att låsa upp nästa fråga.",
    checkpoint_passed: "Kontroll godkänd. Du kan gå vidare till nästa fråga.",
    reveal_answer: "Visa svar",
    hide_answer: "Dölj svar",
    mark_completed: "Markera klar",
    flag_review: "Flagga för repetition",
    needs_review: "Behöver repetition",
    open_question: "Öppna fråga",
    almost: "Nästan",

    quiz_setup: "Inställning övningsläge",
    quiz_setup_desc: "Välj kategori. Frågor går prov för prov, sedan fråga för fråga.",
    mode: "Läge",
    all_categories_exam_order: "Alla kategorier (provordning)",
    timed_mode: "Tidtagning",
    timer_minutes: "Timer (minuter)",

    back_to_category: "Tillbaka till kategori",
    source_problem: "Källa: {exam} · Uppgift {problem}",
    why_method_applies: "Varför metoden passar",
    pattern_hint: "Mönster att känna igen",
    why_other_wrong: "Varför andra metoder är fel här",
    hide_full_solution: "Dölj full lösning",
    show_full_solution: "Visa full lösning",
    track_question: "Följ denna fråga",

    common_mistake: "Vanligt misstag",
    exam_shortcut: "Provtips",
    what_memorize: "Att memorera",
    key_formulas: "Nyckelformler",

    answer_workspace: "Svarsyta",
    calculator: "Kalkylator",
    formula_pdf: "Formel-PDF",
    table_pdf: "Tabell-PDF",
    your_answer: "Ditt svar",
    question_type_dropdown: "Frågetyp",
    choose_question_type: "Välj frågetyp...",
    formula_dropdown: "Formel att använda",
    choose_formula: "Välj formel...",
    answer_dropdown: "Svar i lista",
    choose_answer: "Välj svar...",
    check_answer: "Kontrollera svar",
    correct: "Rätt",
    not_yet_correct: "Inte rätt ännu",
    continue_ok: "Rätt. Du kan fortsätta.",
    write_answer_for: "Skriv svarstext för {parts}.",
    pick_question_type_for: "Välj rätt frågetyp för {parts}.",
    pick_formula_for: "Välj rätt formel för {parts}.",
    pick_dropdown_for: "Välj rätt list-svar för {parts}.",
    close: "Stäng",
    sub_question: "Delfråga {label}",
    question: "Fråga",
    insert_note: "Insert skickar resultat till aktivt svarsfält.",
    math_symbols: "Matematiska symboler",

    crash_header: "3-dagars crashplan",
    crash_title: "Snabb väg till 30 poäng",
    crash_text:
      "Denna plan är optimerad för högutdelande metoder som återkommer i dina uppladdade prov. Studera inte per år, studera per metod och mönster.",
    priority_order: "Prioriteringsordning",
    last24: "Checklista sista 24 timmarna",
    start_timed: "Starta tidtagd träning",

    what_to_study: "Vad du ska studera",
    what_to_memorize: "Vad du ska memorera",
    what_to_drill: "Vad du ska nöta",
    skip_if_short: "Hoppa över vid tidsbrist",

    solution_logic: "Lösning (logik först)",
    use_structure: "Använd denna struktur",
    structure_line:
      "Let/define symbols -> Given -> Formula -> Substitute -> Compute -> Answer",
    boxed_final: "Inramat slutsvar",
  },
  fr: {
    app_name: "Entraîneur d'examen en statistiques mathématiques",
    nav_home: "Accueil",
    nav_practice: "Mode pratique",
    nav_crash: "Plan intensif 3 jours",
    dyslexia_on: "Mode dyslexie activé",
    dyslexia_off: "Mode dyslexie",
    language: "Langue",

    home_target: "Objectif 3 jours : 30 points",
    home_subtitle:
      "Entraînez-vous par thème, apprenez les formules et voyez chaque étape.",
    start_training: "Commencer l'entraînement",
    open_crash_plan: "Ouvrir le plan 3 jours",
    search_label: "Recherche par mot-clé, formule ou thème",
    search_placeholder: "Exemple : Bayes, test z, CLT, Poisson",
    search_results: "Résultats ({count})",
    no_match_try: "Aucun résultat. Essayez \"Phi\" ou \"H0\".",
    topic_categories: "Catégories",
    organized_by_type: "Questions organisées par type, pas par date d'examen.",
    crash_plan_card_title: "Plan intensif 3 jours",
    crash_plan_card_text:
      "Priorité au score rapide : standardisation, processus de Poisson, Bayes, combinatoire, IC puis tests d'hypothèse.",
    view_daily_plan: "Voir le plan",

    progress_overview: "Aperçu des progrès",
    completed: "Terminé",
    need_review: "À revoir",
    understood: "Compris",
    goal_progress: "Progression objectif (niveau 30 points)",
    progress: "Progression",

    category: "Catégorie",
    how_identify_method: "Comment choisir la bonne méthode",
    hide_formulas: "Masquer les formules",
    show_formulas: "Afficher les formules",
    hide_solution_previews: "Masquer l'aperçu de solution",
    show_solution_previews: "Afficher l'aperçu de solution",
    switch_full_list: "Voir toute la liste",
    one_question_at_a_time: "Une question à la fois",
    question_bank: "Banque de questions ({count})",
    question_bank_subtitle: "Exercices faciles, moyens et type examen.",
    no_questions_match: "Aucune question avec ces filtres.",
    question_x_of_y: "Question {x} sur {y}",
    previous: "Précédent",
    next: "Suivant",
    common_patterns: "Schémas fréquents",
    common_mistakes: "Erreurs fréquentes",

    search_keyword: "Mot-clé",
    filter_placeholder: "ex. test z, Poisson, Bayes",
    difficulty: "Difficulté",
    all: "Tous",
    easy: "Facile",
    medium: "Moyen",
    exam_like: "Type examen",
    filter_formula_topic: "Filtrer par formule/thème",
    all_formulas_topics: "Toutes les formules/thèmes",

    practice_mode: "Mode pratique",
    practice_intro:
      "Ordre examen par examen, question par question. Révélez la réponse après votre tentative.",
    session_progress: "Progression de session {value}",
    from_exam_problem: "De {exam} · Problème {problem}",
    next_question: "Question suivante",
    checkpoint_pending: "Complétez la vérification pour débloquer la suite.",
    checkpoint_passed: "Vérification réussie. Vous pouvez continuer.",
    reveal_answer: "Afficher la réponse",
    hide_answer: "Masquer la réponse",
    mark_completed: "Marquer terminé",
    flag_review: "Marquer à revoir",
    needs_review: "À revoir",
    open_question: "Ouvrir la question",
    almost: "Presque",

    quiz_setup: "Paramètres du mode pratique",
    quiz_setup_desc:
      "Choisissez une catégorie. L'ordre suit les examens puis les questions.",
    mode: "Mode",
    all_categories_exam_order: "Toutes les catégories (ordre examen)",
    timed_mode: "Mode chronométré",
    timer_minutes: "Minuteur (minutes)",

    back_to_category: "Retour à la catégorie",
    source_problem: "Source : {exam} · Problème {problem}",
    why_method_applies: "Pourquoi cette méthode",
    pattern_hint: "Indice de reconnaissance",
    why_other_wrong: "Pourquoi les autres méthodes sont incorrectes",
    hide_full_solution: "Masquer la solution complète",
    show_full_solution: "Afficher la solution complète",
    track_question: "Suivre cette question",

    common_mistake: "Erreur fréquente",
    exam_shortcut: "Astuce examen",
    what_memorize: "À mémoriser",
    key_formulas: "Formules clés",

    answer_workspace: "Espace réponse",
    calculator: "Calculatrice",
    formula_pdf: "PDF formules",
    table_pdf: "PDF tables",
    your_answer: "Votre réponse",
    question_type_dropdown: "Type de question",
    choose_question_type: "Choisir le type de question...",
    formula_dropdown: "Formule à utiliser",
    choose_formula: "Choisir la formule...",
    answer_dropdown: "Réponse (liste)",
    choose_answer: "Choisir une réponse...",
    check_answer: "Vérifier la réponse",
    correct: "Correct",
    not_yet_correct: "Pas encore correct",
    continue_ok: "Correct. Vous pouvez continuer.",
    write_answer_for: "Écrivez la réponse pour {parts}.",
    pick_question_type_for: "Choisissez le bon type de question pour {parts}.",
    pick_formula_for: "Choisissez la bonne formule pour {parts}.",
    pick_dropdown_for: "Choisissez la bonne réponse pour {parts}.",
    close: "Fermer",
    sub_question: "Sous-question {label}",
    question: "Question",
    insert_note: "Insert envoie le résultat vers le champ actif.",
    math_symbols: "Symboles mathématiques",

    crash_header: "Plan intensif 3 jours",
    crash_title: "Voie rapide vers 30 points",
    crash_text:
      "Plan optimisé pour les méthodes les plus rentables vues dans vos examens.",
    priority_order: "Ordre de priorité",
    last24: "Checklist des dernières 24h",
    start_timed: "Lancer pratique chronométrée",

    what_to_study: "À étudier",
    what_to_memorize: "À mémoriser",
    what_to_drill: "À entraîner",
    skip_if_short: "À ignorer si peu de temps",

    solution_logic: "Solution (logique d'abord)",
    use_structure: "Utilisez cette structure",
    structure_line:
      "Let/define symbols -> Given -> Formula -> Substitute -> Compute -> Answer",
    boxed_final: "Réponse finale encadrée",
  },
};

const categoryLabels: Record<CategorySlug, Record<Locale, string>> = {
  "standardization": {
    en: "Standardization",
    sv: "Standardisering",
    fr: "Standardisation",
  },
  "poisson-process": {
    en: "Poisson process",
    sv: "Poissonprocess",
    fr: "Processus de Poisson",
  },
  "bayes-total-probability": {
    en: "Law of Total Probability and Bayes' Rule",
    sv: "Lagen om total sannolikhet och Bayes sats",
    fr: "Probabilité totale et règle de Bayes",
  },
  combinatorics: {
    en: "Combinatorics",
    sv: "Kombinatorik",
    fr: "Combinatoire",
  },
  "confidence-intervals": {
    en: "Two-sided confidence intervals",
    sv: "Tvåsidiga konfidensintervall",
    fr: "Intervalles de confiance bilatéraux",
  },
  "central-limit-theorem": {
    en: "The Central Limit Theorem",
    sv: "Centrala gränsvärdessatsen",
    fr: "Théorème central limite",
  },
  "hypothesis-tests": {
    en: "Hypothesis tests",
    sv: "Hypotesprövning",
    fr: "Tests d'hypothèse",
  },
  "maximum-likelihood-estimation": {
    en: "Maximum Likelihood Estimation",
    sv: "Maximum likelihood-skattning",
    fr: "Estimation du maximum de vraisemblance",
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  categoryTitle: (slug: CategorySlug, fallback: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }
    const saved = window.localStorage.getItem("math-stat-locale") as Locale | null;
    if (saved === "en" || saved === "sv" || saved === "fr") {
      return saved;
    }
    return "en";
  });

  useEffect(() => {
    window.localStorage.setItem("math-stat-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string, vars?: Record<string, string | number>) => {
      const base = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
      if (!vars) {
        return base;
      }
      return Object.entries(vars).reduce((acc, [k, v]) => {
        return acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }, base);
    };

    const categoryTitle = (slug: CategorySlug, fallback: string) => {
      return categoryLabels[slug]?.[locale] ?? fallback;
    };

    return {
      locale,
      setLocale,
      t,
      categoryTitle,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
