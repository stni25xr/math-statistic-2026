import {
  CategoryDefinition,
  CategorySlug,
  CrashPlanDay,
  StudyQuestion,
} from "@/lib/types";

export const categoryDefinitions: CategoryDefinition[] = [
  {
    slug: "standardization",
    title: "Standardization",
    shortDescription: "Convert to Z-scores to use normal tables fast.",
    explanation:
      "When a random variable follows a normal model, standardization turns values into a standard normal variable Z = (X - mu)/sigma so one table works for many questions.",
    keyFormulas: [
      "Z = (X - mu) / sigma",
      "P(X <= x) = Phi((x - mu)/sigma)",
      "For continuous X: P(X = a) = 0",
      "If linear combination of independent normal variables: aX + bY is also normal",
    ],
    commonPatterns: [
      "Question states X ~ N(mu, sigma^2)",
      "Need probability above/below a cutoff",
      "Comparing weighted sums such as A - 2B",
      "Need percentiles by back-solving a Z value",
    ],
    commonMistakes: [
      "Using variance instead of standard deviation in denominator",
      "Forgetting symmetry: Phi(-z) = 1 - Phi(z)",
      "Treating continuous distributions as if point probabilities were non-zero",
    ],
    methodRecognition: [
      "If you see N(mu, sigma^2), think: convert to Z first.",
      "If expression is linear in normal variables, first find mean and variance of that expression.",
      "If question asks P(X = exact value) for continuous model, answer is 0 immediately.",
    ],
    priorityRank: 1,
  },
  {
    slug: "poisson-process",
    title: "Poisson process",
    shortDescription: "Arrivals over time, thinning, binomial and distribution type checks.",
    explanation:
      "Use Poisson process tools when events arrive randomly in time. Counts in intervals are Poisson, waiting times are exponential, and thinning keeps Poisson with rate lambda * p.",
    keyFormulas: [
      "N(t) ~ Poi(lambda t)",
      "P(N(t)=k) = exp(-lambda t) * (lambda t)^k / k!",
      "T_first ~ Exp(lambda), P(T <= t) = 1 - exp(-lambda t)",
      "Thinning: if each arrival kept with probability p, new rate is lambda p",
      "If n fixed trials with success probability p, X ~ Bin(n,p)",
    ],
    commonPatterns: [
      "Question gives average arrivals per minute/hour",
      "Asks waiting time to next event",
      "Asks purchases among visits (thinning)",
      "Asks to distinguish discrete count vs continuous waiting time",
    ],
    commonMistakes: [
      "Mixing up Poisson count and exponential wait",
      "Using memoryless property in the wrong place",
      "Forgetting time-unit conversion (hours to minutes)",
    ],
    methodRecognition: [
      "Arrivals in time interval -> Poisson count.",
      "Time until next arrival -> exponential.",
      "Given fixed number of visitors and purchase probability -> binomial, not Poisson.",
    ],
    priorityRank: 2,
  },
  {
    slug: "bayes-total-probability",
    title: "Law of Total Probability and Bayes' Rule",
    shortDescription: "Reverse conditional probabilities after test or classification output.",
    explanation:
      "When information is observed indirectly (test result, witness statement, AI classification), combine priors and conditional accuracies with total probability, then invert using Bayes.",
    keyFormulas: [
      "P(B) = sum_k P(B|A_k) P(A_k)",
      "P(A_m|B) = P(B|A_m)P(A_m) / sum_k P(B|A_k)P(A_k)",
      "Two-event form: P(A|B) = P(B|A)P(A) / [P(B|A)P(A) + P(B|A^c)P(A^c)]",
    ],
    commonPatterns: [
      "Witness/test/classifier says one label, ask for true label probability",
      "Very low base rate but high sensitivity",
      "Need posterior after positive result",
    ],
    commonMistakes: [
      "Confusing P(A|B) with P(B|A)",
      "Ignoring base rates (priors)",
      "Missing false-positive branch in denominator",
    ],
    methodRecognition: [
      "If direction is reversed after an observation, it is a Bayes problem.",
      "If denominator needs all ways to observe the evidence, use total probability first.",
      "Always build a branch table before plugging numbers.",
    ],
    priorityRank: 3,
  },
  {
    slug: "combinatorics",
    title: "Combinatorics",
    shortDescription: "Count favorable hands and divide by total equally likely hands.",
    explanation:
      "Card-hand questions are counting problems. Build numerator by condition constraints and denominator by all possible hands of fixed size.",
    keyFormulas: [
      "Combinations: C(n,k) = n!/(k!(n-k)!)",
      "Hypergeometric-style hand probability: favorable / C(52,5) or favorable / C(52,13)",
      "Use disjoint-case split when conditions have two structural cases",
    ],
    commonPatterns: [
      "Exactly k cards of some suit",
      "No cards from one suit and no aces/kings",
      "Bridge-hand multi-constraint counts",
    ],
    commonMistakes: [
      "Counting order when order is irrelevant",
      "Double-counting overlapping cases",
      "Forgetting to update available cards after forced selections",
    ],
    methodRecognition: [
      "Fixed-size hand from deck almost always means combinations.",
      "Phrase 'exactly' means choose that count in each constrained group.",
      "If one condition can happen in two ways, split into cases and add.",
    ],
    priorityRank: 4,
  },
  {
    slug: "confidence-intervals",
    title: "Two-sided confidence intervals",
    shortDescription: "Estimate unknown proportion/mean with uncertainty range.",
    explanation:
      "Confidence intervals give a range of plausible values for parameters. Use one-sample or two-sample formulas depending on question setup.",
    keyFormulas: [
      "One proportion: p_hat +/- z * sqrt(p_hat(1-p_hat)/n)",
      "Difference in proportions: (p_hat - q_hat) +/- z * sqrt(p_hat(1-p_hat)/n + q_hat(1-q_hat)/m)",
      "Interpretation rule: if 0 (or target value) is outside interval, evidence of difference",
    ],
    commonPatterns: [
      "Opinion poll with yes/no outcomes",
      "Compare two polls over time",
      "Decision based on whether 0.5 or 0 lies inside interval",
    ],
    commonMistakes: [
      "Using wrong critical value (z vs t)",
      "Forgetting interval is symmetric around estimate",
      "Claiming certainty instead of confidence statement",
    ],
    methodRecognition: [
      "Binary data with large n -> proportion CI with z = 1.96 for 95%.",
      "Two polls -> CI for difference, not two separate CIs.",
      "Policy claim like 'at least half' means compare lower bound to 0.5.",
    ],
    priorityRank: 5,
  },
  {
    slug: "central-limit-theorem",
    title: "The Central Limit Theorem",
    shortDescription: "Approximate sums/counts with normal when sample is large.",
    explanation:
      "CLT lets you approximate distribution of sums or large binomial counts using normal distributions, which makes difficult probabilities table-friendly.",
    keyFormulas: [
      "If Xi i.i.d. with mean mu and variance sigma^2, then S_n approx N(n*mu, n*sigma^2)",
      "For Bin(n,p): X approx N(np, np(1-p)) when np and n(1-p) are large",
      "Standardize approximation: Z = (value - mean)/sd",
    ],
    commonPatterns: [
      "Large count (n around 100 or 1000)",
      "Sum of many independent waiting times",
      "Approximate probability around threshold",
    ],
    commonMistakes: [
      "Applying CLT for very small n",
      "Wrong variance scaling for sums",
      "Mixing exact Poisson/binomial formulas with CLT steps inconsistently",
    ],
    methodRecognition: [
      "If exact calculation is huge and n is large, check CLT conditions.",
      "For event time of k-th Poisson arrival, use sum of k exponential waits then CLT.",
      "For many Bernoulli outcomes, use binomial mean and variance before standardizing.",
    ],
    priorityRank: 7,
  },
  {
    slug: "hypothesis-tests",
    title: "Hypothesis tests",
    shortDescription: "Build H0/H1, compute test statistic, compare with cutoff or p-value.",
    explanation:
      "Hypothesis testing turns a claim into a formal decision. The key is choosing correct direction, correct test statistic (z or t), and reading p-values correctly.",
    keyFormulas: [
      "Z-test (known sigma): Z = (X_bar - mu0)/(sigma/sqrt(n))",
      "t-test (unknown sigma): T = (X_bar - mu0)/(s/sqrt(n))",
      "Reject left-tail test if statistic < -critical",
      "p-value = probability under H0 of a result at least as extreme",
    ],
    commonPatterns: [
      "Claim says 'below' or 'above' threshold",
      "One-sample mean with normal assumption",
      "Need choose z-table or t-table",
    ],
    commonMistakes: [
      "Using two-sided critical value for one-sided claim",
      "Putting claimed value in H1 instead of H0",
      "Interpreting p-value as probability H0 is true",
    ],
    methodRecognition: [
      "Known variance -> z test. Unknown variance with small sample -> t test.",
      "Claim 'less than' gives left-tailed H1: mu < mu0.",
      "Compare statistic to critical value with same tail direction.",
    ],
    priorityRank: 6,
  },
  {
    slug: "maximum-likelihood-estimation",
    title: "Maximum Likelihood Estimation",
    shortDescription: "Estimate parameters by maximizing likelihood (or log-likelihood).",
    explanation:
      "MLE picks parameter values that make observed data most likely. Many exam tasks combine estimation with approximate normal confidence intervals.",
    keyFormulas: [
      "Likelihood: L(theta) = product_i f_theta(x_i)",
      "Log-likelihood: ell(theta) = log L(theta)",
      "Solve d ell(theta)/d theta = 0 and check maximum",
      "Approximate CI from estimator: theta_hat +/- z * SE(theta_hat)",
    ],
    commonPatterns: [
      "Parameterized pdf with unknown theta",
      "Given closed-form estimator and asked CI",
      "Infer mu and sigma from empirical tail frequencies",
    ],
    commonMistakes: [
      "Maximizing L directly without taking log and making algebra errors",
      "Forgetting domain constraints on theta",
      "Using wrong quantile values when inverting normal CDF",
    ],
    methodRecognition: [
      "If unknown parameter appears inside pdf/pmf, think MLE.",
      "If estimator asymptotic distribution is given, use it for CI quickly.",
      "Tail-frequency equations often mean solve quantile equations for parameters.",
    ],
    priorityRank: 8,
  },
];

export const studyQuestions: StudyQuestion[] = [
  {
    id: "std-2022-normal-probability-pack",
    category: "standardization",
    subcategory: "Normal probability and point probability",
    sourceExam: "MathStat Exam 2022-06 (Problem 1)",
    originalProblemNumber: "1(a,b,e)",
    title: "Normal probabilities when X ~ N(1, 4)",
    question:
      "Let X be normally distributed with mean 1 and variance 4. Compute (i) P(X >= 3), (ii) P(X <= 2), and (iii) P(X = 0).",
    formulasNeeded: [
      "Z = (X - mu)/sigma",
      "P(X <= x) = Phi((x-mu)/sigma)",
      "For continuous X, P(X=a)=0",
    ],
    whyMethodApplies:
      "The distribution is normal with known mean and variance, so every probability is converted to a standard normal table lookup through Z-scores.",
    steps: [
      {
        title: "1) Define parameters",
        detail:
          "From X ~ N(1,4), we have mu = 1 and sigma = sqrt(4) = 2.",
      },
      {
        title: "2) Compute P(X >= 3)",
        detail:
          "Standardize 3: z = (3-1)/2 = 1. Then P(X >= 3) = 1 - Phi(1) = 1 - 0.84 = 0.16.",
      },
      {
        title: "3) Compute P(X <= 2)",
        detail:
          "Standardize 2: z = (2-1)/2 = 0.5. Then P(X <= 2) = Phi(0.5) = 0.69.",
      },
      {
        title: "4) Compute P(X = 0)",
        detail:
          "A normal variable is continuous, so probability at one exact point is zero: P(X=0)=0.",
      },
      {
        title: "5) Interpret",
        detail:
          "About 16% lies at or above 3, about 69% lies at or below 2, and exact-point events have zero probability in continuous models.",
      },
    ],
    finalAnswer: "P(X >= 3) = 0.16, P(X <= 2) = 0.69, P(X = 0) = 0.",
    difficulty: "easy",
    tags: ["normal", "z-table", "continuous-distribution"],
    commonMistake:
      "Using sigma^2 = 4 directly in denominator instead of sigma = 2.",
    examShortcut:
      "As soon as you see normal + exact point probability, write 0 for that part and save time.",
    memorizeThis:
      "Normal table uses Z; convert every cutoff first.",
    patternHint:
      "If question includes N(mu, sigma^2), your first line should almost always be Z=(X-mu)/sigma.",
    alternativeMethodWarning:
      "Do not try to integrate the normal density manually in exam conditions; table method is the intended path.",
  },
  {
    id: "std-2025-fish-linear-combo",
    category: "standardization",
    subcategory: "Linear combinations of normal variables",
    sourceExam: "MathStat Exam 2025-06 (Problem 2a)",
    originalProblemNumber: "2(a)",
    title: "Probability that an A-fish weighs at least twice a B-fish",
    question:
      "A ~ N(20, 0.8^2) and B ~ N(9, 0.6^2), independent. Compute P(A >= 2B).",
    formulasNeeded: [
      "If A and B are independent normal, aA+bB is normal",
      "E(aA+bB) = aE(A)+bE(B)",
      "Var(aA+bB) = a^2Var(A)+b^2Var(B)",
      "Z-standardization",
    ],
    whyMethodApplies:
      "The inequality A >= 2B is equivalent to a linear combination A-2B >= 0, and linear combinations of independent normal variables are normal.",
    steps: [
      {
        title: "1) Rewrite event",
        detail: "P(A >= 2B) = P(A - 2B >= 0). Let W = A - 2B.",
      },
      {
        title: "2) Mean of W",
        detail: "E(W) = E(A) - 2E(B) = 20 - 2*9 = 2.",
      },
      {
        title: "3) Variance of W",
        detail:
          "Var(W) = Var(A) + 4Var(B) = 0.8^2 + 4*0.6^2 = 0.64 + 1.44 = 2.08.",
      },
      {
        title: "4) Distribution and standardization",
        detail:
          "So W ~ N(2, 2.08). Then P(W >= 0) = 1 - Phi((0-2)/sqrt(2.08)) = Phi(1.39).",
      },
      {
        title: "5) Table lookup",
        detail: "Phi(1.39) is about 0.92.",
      },
    ],
    finalAnswer: "P(A >= 2B) approx 0.92.",
    difficulty: "medium",
    tags: ["normal", "linear-combination", "standardization"],
    commonMistake:
      "Using Var(A-2B)=Var(A)-4Var(B). Variances never subtract for independent sums/differences.",
    examShortcut:
      "Write W=A-2B directly and compute mean/variance in one line.",
    memorizeThis:
      "For independent normals, linear combinations stay normal.",
    patternHint:
      "Whenever two normals are compared in one inequality, move all terms to one side.",
    crossReferenceCategory: "central-limit-theorem",
  },
  {
    id: "pp-2025-web-first-and-count",
    category: "poisson-process",
    subcategory: "Poisson count and exponential waiting",
    sourceExam: "MathStat Exam 2025-03/06 (Problem 3a,b)",
    originalProblemNumber: "3(a,b)",
    title: "Web visits at rate 2 per minute",
    question:
      "Visits follow a Poisson process with rate lambda=2 per minute. Compute (i) probability first visit comes within 2 minutes, (ii) probability of exactly 4 visits during interval [3,5].",
    formulasNeeded: [
      "T_first ~ Exp(lambda)",
      "P(T<=t)=1-exp(-lambda t)",
      "N(interval length L) ~ Poi(lambda L)",
      "P(N=k)=exp(-m)m^k/k!",
    ],
    whyMethodApplies:
      "A Poisson process gives both waiting-time and count distributions directly: exponential for first arrival and Poisson for interval counts.",
    steps: [
      {
        title: "1) Identify rate and interval lengths",
        detail: "Given lambda=2/minute. First part uses t=2 minutes. Second part interval [3,5] has length L=2 minutes.",
      },
      {
        title: "2) First arrival within 2 minutes",
        detail:
          "T_first ~ Exp(2). So P(T_first <= 2) = 1 - exp(-2*2) = 1 - exp(-4) approx 0.98.",
      },
      {
        title: "3) Exactly 4 visits in [3,5]",
        detail:
          "N([3,5]) ~ Poi(lambda L)=Poi(2*2)=Poi(4).",
      },
      {
        title: "4) Plug into Poisson pmf",
        detail: "P(N=4)=exp(-4)*4^4/4! approx 0.20.",
      },
      {
        title: "5) Distinguish random variable types",
        detail:
          "First part uses continuous waiting time. Second part uses discrete count. Different formulas are required.",
      },
    ],
    finalAnswer:
      "P(first visit within 2 min) = 1-exp(-4) approx 0.98; P(exactly 4 visits in [3,5]) = exp(-4)*4^4/4! approx 0.20.",
    difficulty: "easy",
    tags: ["poisson-process", "exponential", "counts"],
    commonMistake:
      "Using Poisson pmf for waiting-time part or exponential cdf for count part.",
    examShortcut:
      "Write two reminders at top: 'wait -> Exp', 'count -> Poi'.",
    memorizeThis:
      "In Poisson process: count in length t has mean lambda t.",
    patternHint:
      "Phrases 'within t minutes' often indicate waiting-time cdf.",
  },
  {
    id: "pp-2024-thinning-and-binomial",
    category: "poisson-process",
    subcategory: "Thinning and fixed-n binomial",
    sourceExam: "MathStat Exam 2024-03 (Problem 4a,c)",
    originalProblemNumber: "4(a,c)",
    title: "Purchases from webpage visits",
    question:
      "Visits occur once every 15 seconds on average. 25% of visitors make a purchase. Compute (i) probability of exactly 4 purchases in 2 minutes, (ii) distribution of X purchases if exactly 8 visitors were seen in those 2 minutes.",
    formulasNeeded: [
      "Convert rate: once/15 sec = 4 per minute",
      "Thinned process purchase rate: lambda_p = lambda*0.25",
      "Poisson pmf for counts in time window",
      "Conditional fixed-number model X|N=8 ~ Bin(8,0.25)",
    ],
    whyMethodApplies:
      "Part (i) is count over time with random arrivals and independent purchase chance, so thinning gives a Poisson process. Part (ii) conditions on exactly 8 visitors, making a binomial count.",
    steps: [
      {
        title: "1) Convert visit rate",
        detail: "One visit per 15 sec means 4 visits per minute.",
      },
      {
        title: "2) Thinned purchase rate",
        detail: "Each visit buys with p=0.25, so purchase process rate is lambda_p = 4*0.25 = 1 per minute.",
      },
      {
        title: "3) Part (i) purchase count in 2 minutes",
        detail:
          "Y ~ Poi(lambda_p*2)=Poi(2). Then P(Y=4)=exp(-2)*2^4/4! approx 0.09.",
      },
      {
        title: "4) Part (ii) conditional on 8 visitors",
        detail:
          "Given exactly 8 visitors, each independently buys with probability 0.25. So X ~ Bin(8,0.25).",
      },
      {
        title: "5) Interpret model choice",
        detail:
          "Random number of visitors -> Poisson. Fixed number of visitors -> Binomial.",
      },
    ],
    finalAnswer:
      "(i) P(exactly 4 purchases in 2 min) = exp(-2)*2^4/4! approx 0.09. (ii) X has Binomial distribution Bin(8,0.25).",
    difficulty: "medium",
    tags: ["thinning", "binomial", "discrete-vs-continuous"],
    commonMistake:
      "Using Poisson in part (ii) even though the number of trials is fixed at 8.",
    examShortcut:
      "If problem says 'if there are exactly n visitors', switch to binomial immediately.",
    memorizeThis:
      "Thinning Poisson with keep-probability p multiplies the rate by p.",
    patternHint:
      "Conditioning on an exact count usually changes the model from Poisson to Binomial.",
  },
  {
    id: "bayes-2022-taxi-witness",
    category: "bayes-total-probability",
    subcategory: "Witness reliability and posterior probability",
    sourceExam: "MathStat Exam 2022-03 (Problem 4)",
    originalProblemNumber: "4",
    title: "Taxi color and witness statement",
    question:
      "Taxi company composition: black 10%, blue 40%, green 50%. Witness says 'black'. Reliability: P(says black|black)=0.90, P(says black|blue)=0.10, P(says black|green)=0.05. Compute P(black | says black).",
    formulasNeeded: [
      "Bayes rule with three prior branches",
      "Law of total probability for denominator",
    ],
    whyMethodApplies:
      "We need reverse probability from statement to true color. This is exactly Bayes with multiple mutually exclusive causes.",
    steps: [
      {
        title: "1) Define events",
        detail:
          "B=true black, L=true blue, G=true green, W=witness says black.",
      },
      {
        title: "2) Write Bayes formula",
        detail:
          "P(B|W)=P(W|B)P(B)/[P(W|B)P(B)+P(W|L)P(L)+P(W|G)P(G)].",
      },
      {
        title: "3) Substitute numbers",
        detail:
          "Numerator = 0.90*0.10 = 0.09. Denominator = 0.90*0.10 + 0.10*0.40 + 0.05*0.50 = 0.155.",
      },
      {
        title: "4) Compute posterior",
        detail: "P(B|W)=0.09/0.155 = 18/31 approx 0.58.",
      },
      {
        title: "5) Interpret",
        detail:
          "Even with a black statement, posterior is only about 58% because black taxis are relatively rare.",
      },
    ],
    finalAnswer: "P(black | says black) = 18/31 approx 0.58.",
    difficulty: "medium",
    tags: ["bayes", "total-probability", "classification"],
    commonMistake:
      "Forgetting one denominator branch, especially the green false-black contribution.",
    examShortcut:
      "Make a 3-row branch table first; then Bayes is one fraction.",
    memorizeThis:
      "Posterior = weighted true-positive / total positive probability.",
    patternHint:
      "If question gives class proportions and classifier accuracy by class, Bayes is mandatory.",
  },
  {
    id: "bayes-2025-disease-diagnosis",
    category: "bayes-total-probability",
    subcategory: "Medical test with prior and reverse probability",
    sourceExam: "MathStat Exam 2025-06 (Problem 4)",
    originalProblemNumber: "4(a,b)",
    title: "Disease diagnosis with AI classifier",
    question:
      "Disease prevalence is 5%. Test has sensitivity 90% and specificity 80%. (i) If diagnosed positive, what is P(disease | positive)? (ii) If P(disease|positive)=0.40, solve for prevalence p.",
    formulasNeeded: [
      "P(D|+) = P(+|D)P(D) / [P(+|D)P(D) + P(+|D^c)P(D^c)]",
      "Algebraic solve for p after Bayes equation",
    ],
    whyMethodApplies:
      "Part (i) asks reverse conditional probability after test result. Part (ii) inverts the Bayes formula to recover the prior prevalence.",
    steps: [
      {
        title: "1) Define probabilities",
        detail:
          "P(D)=0.05, P(+|D)=0.90, specificity=0.80 so P(+|D^c)=0.20.",
      },
      {
        title: "2) Part (i): Bayes posterior",
        detail:
          "P(D|+) = 0.90*0.05 / (0.90*0.05 + 0.20*0.95) = 0.045/0.235 approx 0.19.",
      },
      {
        title: "3) Part (ii): set up equation",
        detail:
          "Let prevalence be p. Given 0.40 = 0.90p / (0.90p + 0.20(1-p)).",
      },
      {
        title: "4) Solve algebraically",
        detail:
          "0.40(0.90p + 0.20 - 0.20p) = 0.90p -> 0.28p + 0.08 = 0.90p -> 0.62p = 0.08 -> p = 0.129.",
      },
      {
        title: "5) Final interpretation",
        detail:
          "To reach 40% posterior after a positive test, prevalence must be about 12.9%, much higher than 5%.",
      },
    ],
    finalAnswer:
      "(i) P(disease|positive) approx 0.19. (ii) Required prevalence p = 4/31 approx 0.13.",
    difficulty: "exam-like",
    tags: ["bayes", "medical-test", "inverse-problem"],
    commonMistake:
      "Confusing specificity with false-positive rate; false-positive is 1-specificity.",
    examShortcut:
      "Write sensitivity, specificity, and prevalence as a 2x2 table before computing.",
    memorizeThis:
      "Low prevalence can make many positives false even with high sensitivity.",
    patternHint:
      "Keywords 'if diagnosed positive, actually has disease' always indicate reverse conditioning.",
  },
  {
    id: "comb-2021-poker-no-clubs-no-aces",
    category: "combinatorics",
    subcategory: "Poker hand constrained counting",
    sourceExam: "MathStat Exam 2021-03 (Problem 2c)",
    originalProblemNumber: "2(c)",
    title: "Exactly 2 hearts, no clubs, no aces in a 5-card hand",
    question:
      "From a 52-card deck, draw 5 cards. Give a combinatorial expression for probability of exactly 2 hearts, no clubs, and no aces.",
    formulasNeeded: [
      "Total outcomes C(52,5)",
      "Choose favorable cards by suit under constraints",
    ],
    whyMethodApplies:
      "This is a finite equally likely hand problem with strict suit/rank constraints, so count favorable combinations and divide by total combinations.",
    steps: [
      {
        title: "1) Total number of 5-card hands",
        detail: "Denominator is C(52,5).",
      },
      {
        title: "2) Allowed heart cards",
        detail:
          "No aces allowed, so hearts available are 12 (all hearts except ace of hearts). Choose exactly 2: C(12,2).",
      },
      {
        title: "3) Remaining non-heart cards",
        detail:
          "No clubs and no aces. From spades and diamonds there are 13+13=26 cards, but remove 2 aces (A-spade, A-diamond), leaving 24. Choose remaining 3 cards: C(24,3).",
      },
      {
        title: "4) Build probability",
        detail: "P = [C(12,2) * C(24,3)] / C(52,5).",
      },
      {
        title: "5) Why this avoids overcounting",
        detail:
          "Each valid hand is counted once because we select card sets, not ordered draws.",
      },
    ],
    finalAnswer: "P = C(12,2)*C(24,3) / C(52,5).",
    difficulty: "medium",
    tags: ["combinatorics", "poker", "without-replacement"],
    commonMistake:
      "Using 13 hearts instead of 12 hearts after excluding aces.",
    examShortcut:
      "Write constraints as inventory first (how many valid hearts? how many valid non-hearts?).",
    memorizeThis:
      "Card hands are combinations because order does not matter.",
    patternHint:
      "Phrase 'exactly k' means choose exactly k from that bucket and fill the rest from complement.",
  },
  {
    id: "comb-2025-bridge-two-five-and-aces",
    category: "combinatorics",
    subcategory: "Bridge hand multi-constraint",
    sourceExam: "MathStat Exam 2025-03 (Problem 5b)",
    originalProblemNumber: "5(b)",
    title: "Bridge hand with suit counts and four aces",
    question:
      "In a 13-card bridge hand, find a combinatorial expression for: 2 hearts, 5 spades, 3 clubs, 3 diamonds, and all 4 aces.",
    formulasNeeded: [
      "Total outcomes C(52,13)",
      "Sequential suit-based combination counting",
    ],
    whyMethodApplies:
      "The suit counts are fixed and we also force all four aces. This is direct constrained counting with combinations.",
    steps: [
      {
        title: "1) Total bridge hands",
        detail: "Denominator is C(52,13).",
      },
      {
        title: "2) Force the 4 aces",
        detail: "Choose all aces in C(4,4)=1 way.",
      },
      {
        title: "3) Fill suit counts excluding aces already used",
        detail:
          "After taking each ace, each suit has 12 non-ace cards left. Need extra cards per suit: hearts 1 more (since Ace hearts already included in 2), spades 4 more, clubs 2 more, diamonds 2 more.",
      },
      {
        title: "4) Count favorable hands",
        detail:
          "Numerator = C(4,4)*C(12,1)*C(12,4)*C(12,2)*C(12,2).",
      },
      {
        title: "5) Final probability",
        detail:
          "P = [C(4,4)C(12,1)C(12,4)C(12,2)C(12,2)] / C(52,13).",
      },
    ],
    finalAnswer:
      "P = C(4,4)C(12,1)C(12,4)C(12,2)C(12,2) / C(52,13).",
    difficulty: "exam-like",
    tags: ["bridge", "combinatorics", "multi-constraint"],
    commonMistake:
      "Choosing suit counts from 13 each after already forcing aces; should use 12 remaining non-ace cards per suit.",
    examShortcut:
      "When all aces are required, lock them first and reduce each suit pool by one.",
    memorizeThis:
      "Split constraints into fixed cards first, then residual choices.",
    patternHint:
      "If condition says 'and 4 aces', force those cards before counting anything else.",
  },
  {
    id: "ci-2022-one-proportion",
    category: "confidence-intervals",
    subcategory: "One-sample proportion CI",
    sourceExam: "MathStat Exam 2022-03/2021-03 (Problem 6/5)",
    originalProblemNumber: "6(a,b)",
    title: "95% CI for population proportion from 541/1034",
    question:
      "In a poll, 541 out of 1034 answered yes. Build a 95% confidence interval for p and decide if data supports claim p >= 0.5.",
    formulasNeeded: [
      "p_hat = x/n",
      "CI: p_hat +/- 1.96*sqrt(p_hat(1-p_hat)/n)",
    ],
    whyMethodApplies:
      "This is a large-sample yes/no poll, so normal approximation for a single proportion confidence interval is appropriate.",
    steps: [
      {
        title: "1) Compute sample proportion",
        detail: "p_hat = 541/1034 = 0.5232.",
      },
      {
        title: "2) Compute standard error",
        detail:
          "SE = sqrt(p_hat(1-p_hat)/n) = sqrt(0.5232*0.4768/1034) approx 0.0155.",
      },
      {
        title: "3) Use 95% critical value",
        detail: "z=1.96 gives margin = 1.96*0.0155 approx 0.0304.",
      },
      {
        title: "4) Build interval",
        detail: "CI = 0.5232 +/- 0.0304 = (0.4928, 0.5536).",
      },
      {
        title: "5) Decision for claim p>=0.5",
        detail:
          "Since 0.5 lies inside interval, we cannot conclude with 95% confidence that p is at least 0.5.",
      },
    ],
    finalAnswer:
      "95% CI: (0.4928, 0.5536). At 95% confidence, claim p>=0.5 is not confirmed.",
    difficulty: "easy",
    tags: ["confidence-interval", "proportion", "poll"],
    commonMistake:
      "Saying claim is proven true because p_hat > 0.5, while CI still includes values below 0.5.",
    examShortcut:
      "For yes/no poll with large n, write p_hat +/- 1.96*SE immediately.",
    memorizeThis:
      "If target value is inside CI, no strong confidence conclusion against it.",
    patternHint:
      "Single poll and one proportion parameter p -> one-sample proportion CI.",
  },
  {
    id: "ci-2024-two-proportion-diff",
    category: "confidence-intervals",
    subcategory: "Two-sample proportion CI",
    sourceExam: "MathStat Exam 2024-06 (Problem 7b)",
    originalProblemNumber: "7(b)",
    title: "Confidence interval for increase between two polls",
    question:
      "Poll 1: 584/1023 positive. Poll 2: 609/1128 positive. Compute a 95% CI for p1-p2 and decide if increase is supported.",
    formulasNeeded: [
      "Difference CI: (p_hat1-p_hat2) +/- 1.96*sqrt(p1(1-p1)/n1 + p2(1-p2)/n2)",
    ],
    whyMethodApplies:
      "Two independent polls estimate two proportions, so use the confidence interval for their difference.",
    steps: [
      {
        title: "1) Compute sample proportions",
        detail: "p_hat1 = 584/1023 = 0.571, p_hat2 = 609/1128 = 0.540.",
      },
      {
        title: "2) Point estimate for change",
        detail: "d_hat = p_hat1 - p_hat2 = 0.031.",
      },
      {
        title: "3) Standard error for difference",
        detail:
          "SE = sqrt(0.571*0.429/1023 + 0.540*0.460/1128) approx 0.021.",
      },
      {
        title: "4) Margin and interval",
        detail: "Margin = 1.96*0.021 approx 0.041. CI = 0.031 +/- 0.041 = (-0.010, 0.072).",
      },
      {
        title: "5) Conclusion",
        detail:
          "0 is inside CI, so data does not give 95% confidence evidence of increase.",
      },
    ],
    finalAnswer:
      "95% CI for p1-p2 is about (-0.01, 0.07). Increase is not established at 95% confidence.",
    difficulty: "medium",
    tags: ["two-sample", "difference-in-proportions", "confidence-interval"],
    commonMistake:
      "Comparing overlap of two separate CIs instead of directly building CI for difference.",
    examShortcut:
      "Always test increase/decrease claims with interval for (new-old), not separate one-sample intervals.",
    memorizeThis:
      "For difference intervals, check whether 0 is inside.",
    patternHint:
      "Two groups and question about change means parameter is p1-p2.",
  },
  {
    id: "clt-2025-400th-visit",
    category: "central-limit-theorem",
    subcategory: "CLT for sum of exponential waiting times",
    sourceExam: "MathStat Exam 2025-03/06 (Problem 3c)",
    originalProblemNumber: "3(c)",
    title: "Probability 400th visit occurs within 210 minutes",
    question:
      "Visits follow Poisson process with rate 2 per minute. Approximate P(T_400 <= 210 minutes), where T_400 is time of the 400th visit.",
    formulasNeeded: [
      "Inter-arrival times are i.i.d. Exp(2)",
      "For Exp(2): mean=1/2, variance=1/4",
      "T_400 = sum of 400 i.i.d. waits",
      "CLT: T_400 approx N(n*mu, n*sigma^2)",
    ],
    whyMethodApplies:
      "Exact gamma computations are possible but heavy; exam expects CLT approximation for sum of many independent waiting times (n=400 is large).",
    steps: [
      {
        title: "1) Represent T_400 as a sum",
        detail: "T_400 = W1 + ... + W400 where Wi ~ Exp(2), independent.",
      },
      {
        title: "2) Mean and variance",
        detail:
          "Each Wi has mean 0.5 and variance 0.25. So E(T_400)=400*0.5=200, Var(T_400)=400*0.25=100.",
      },
      {
        title: "3) CLT approximation",
        detail: "T_400 approx N(200, 100), so sd=10.",
      },
      {
        title: "4) Standardize 210",
        detail: "z=(210-200)/10 = 1.",
      },
      {
        title: "5) Lookup",
        detail: "P(T_400<=210) approx Phi(1)=0.84.",
      },
    ],
    finalAnswer: "P(T_400 <= 210) approx 0.84.",
    difficulty: "exam-like",
    tags: ["clt", "poisson-process", "sum-of-exponentials"],
    commonMistake:
      "Using mean 1/lambda correctly but variance as 1/lambda instead of 1/lambda^2.",
    examShortcut:
      "For k-th Poisson event: mean time k/lambda, variance k/lambda^2, then normal approximation.",
    memorizeThis:
      "Exp(lambda): mean 1/lambda and variance 1/lambda^2.",
    patternHint:
      "If question asks about k-th arrival time for large k, think sum + CLT.",
  },
  {
    id: "clt-2024-positive-tests-binomial",
    category: "central-limit-theorem",
    subcategory: "Normal approximation of binomial count",
    sourceExam: "MathStat Exam 2024-03 (Problem 5c)",
    originalProblemNumber: "5(c)",
    title: "At most 180 true condition cases among 1000 positives",
    question:
      "From earlier Bayes result, each positive test has probability 9/47 of truly having the condition. If 1000 people test positive, approximate P(X <= 180).",
    formulasNeeded: [
      "X ~ Bin(n,p) with n=1000, p=9/47",
      "CLT/Binomial normal approximation: X approx N(np, np(1-p))",
      "Standardize to Z",
    ],
    whyMethodApplies:
      "n=1000 is large, so normal approximation to the binomial count is efficient and accurate enough for exam computation.",
    steps: [
      {
        title: "1) Set binomial model",
        detail: "X ~ Bin(1000, 9/47).",
      },
      {
        title: "2) Compute mean and variance",
        detail:
          "Mean np = 1000*(9/47) approx 191.5 (rounded as 192). Variance np(1-p) approx 155.",
      },
      {
        title: "3) Apply normal approximation",
        detail: "X approx N(192, 155). Standard deviation is sqrt(155) approx 12.45.",
      },
      {
        title: "4) Standardize threshold 180",
        detail: "z = (180 - 192)/sqrt(155) = -0.96.",
      },
      {
        title: "5) Table value",
        detail: "P(X <= 180) approx Phi(-0.96) = 1 - Phi(0.96) approx 0.17.",
      },
    ],
    finalAnswer: "Approximate probability is 0.17.",
    difficulty: "medium",
    tags: ["clt", "binomial-approximation", "normal-approximation"],
    commonMistake:
      "Using p=0.5 by habit instead of the computed posterior probability 9/47.",
    examShortcut:
      "Large-n binomial question: write mean=np and variance=np(1-p) immediately.",
    memorizeThis:
      "Normal approximation quality improves when np and n(1-p) are both comfortably larger than 10.",
    patternHint:
      "Count of successes out of large fixed n often invites binomial-to-normal approximation.",
  },
  {
    id: "test-2025-fan-noise-z",
    category: "hypothesis-tests",
    subcategory: "One-sample left-tailed Z-test",
    sourceExam: "MathStat Exam 2025-06 (Problem 8)",
    originalProblemNumber: "8(a,b,c)",
    title: "Is mean fan noise below 60 dB?",
    question:
      "Sample: n=18, x_bar=59.3, known variance sigma^2=1.69. Assume normal data. Test claim mu<60 at alpha=0.05 and compute p-value.",
    formulasNeeded: [
      "H0: mu=60, H1: mu<60",
      "Z = (x_bar - mu0)/(sigma/sqrt(n))",
      "Left-tail critical value at alpha=0.05: -1.64",
      "p-value = Phi(observed z)",
    ],
    whyMethodApplies:
      "Variance is known and normal model assumed, so one-sample Z-test is correct. Claim is 'below', so test is left-tailed.",
    steps: [
      {
        title: "1) State hypotheses",
        detail: "H0: mu=60 versus H1: mu<60.",
      },
      {
        title: "2) Compute standard error",
        detail: "sigma = sqrt(1.69)=1.3, so SE = 1.3/sqrt(18) approx 0.306.",
      },
      {
        title: "3) Compute test statistic",
        detail: "z_obs = (59.3 - 60)/0.306 approx -2.28.",
      },
      {
        title: "4) Compare to critical value",
        detail:
          "Left-tail rejection rule: reject H0 if z < -1.64. Since -2.28 < -1.64, reject H0.",
      },
      {
        title: "5) p-value",
        detail: "p = Phi(-2.28) approx 0.011, well below 0.05.",
      },
    ],
    finalAnswer:
      "Reject H0 at 5%. There is support for mu<60. p-value approx 0.011.",
    difficulty: "medium",
    tags: ["hypothesis-test", "z-test", "p-value"],
    commonMistake:
      "Placing minus sign wrong and getting +2.28, which would reverse the decision.",
    examShortcut:
      "Known sigma means z-test, no discussion needed.",
    memorizeThis:
      "Claim direction determines one-sided alternative and critical region.",
    patternHint:
      "Words 'below', 'under', 'less than' indicate left-tailed test.",
    alternativeMethodWarning:
      "Using t-test here is unnecessary because sigma is treated as known in the problem statement.",
  },
  {
    id: "test-2022-carbon-fiber-t",
    category: "hypothesis-tests",
    subcategory: "One-sample right-tailed t-test",
    sourceExam: "MathStat Exam 2022-03/06 (Problem 7)",
    originalProblemNumber: "7(a,b,c,d)",
    title: "Does mean failure stress exceed 500 MPa?",
    question:
      "n=19, x_bar=563, sample sd s=181. Assume normal population. Test manufacturer claim mu>500 at alpha=0.05. Should z-table or t-table be used?",
    formulasNeeded: [
      "H0: mu=500, H1: mu>500",
      "T = (x_bar - mu0)/(s/sqrt(n)) with df=n-1",
      "Right-tail critical value t_(0.95,18)=1.73",
    ],
    whyMethodApplies:
      "Population variance is unknown and sample size is small, so use one-sample t-test with df=18.",
    steps: [
      {
        title: "1) Hypotheses",
        detail: "H0: mu=500, H1: mu>500.",
      },
      {
        title: "2) Choose table",
        detail: "Use t-distribution, not normal, because sigma is unknown and replaced by sample s.",
      },
      {
        title: "3) Compute statistic",
        detail:
          "T = (563-500)/(181/sqrt(19)) = 63/41.52 approx 1.52.",
      },
      {
        title: "4) Compare with critical value",
        detail:
          "Reject for T > 1.73 (right tail, alpha=0.05, df=18). Since 1.52 < 1.73, do not reject H0.",
      },
      {
        title: "5) Interpret p-value relation",
        detail:
          "Because statistic is not beyond critical boundary, p-value is greater than 0.05.",
      },
    ],
    finalAnswer:
      "Use t-table. T=1.52, not enough for rejection at 5%, so claim mu>500 is not supported at this level.",
    difficulty: "exam-like",
    tags: ["hypothesis-test", "t-test", "unknown-variance"],
    commonMistake:
      "Using z=1.64 cutoff despite unknown sigma and small n.",
    examShortcut:
      "Unknown sigma + one-sample mean + small n -> t-test with df=n-1.",
    memorizeThis:
      "p-value is the smallest alpha that would reject H0.",
    patternHint:
      "If only sample standard deviation is given, expect t-statistic.",
    crossReferenceCategory: "confidence-intervals",
  },
  {
    id: "mle-2022-theta-power-density",
    category: "maximum-likelihood-estimation",
    subcategory: "MLE for theta in f_theta(x)=theta x^(theta-1)",
    sourceExam: "MathStat Exam 2022-03 (Problem 8)",
    originalProblemNumber: "8(a,b)",
    title: "Estimate theta and build approximate 95% CI",
    question:
      "For density f_theta(x)=theta x^(theta-1) on [0,1], derive MLE theta_hat from sample x1,...,xn. Then for x=(0.5,0.8,0.9), n=3, compute estimate and approximate 95% CI using theta_hat approx N(theta, theta^2/n).",
    formulasNeeded: [
      "L(theta)=product theta x_i^(theta-1)",
      "ell(theta)=n ln(theta) + (theta-1) sum ln(x_i)",
      "MLE: d ell/d theta = 0",
      "Approximate CI: theta_hat +/- 1.96*(theta_hat/sqrt(n))",
    ],
    whyMethodApplies:
      "The model has unknown parameter theta in the density, so likelihood maximization is the direct estimation method.",
    steps: [
      {
        title: "1) Build log-likelihood",
        detail:
          "ell(theta)=n ln(theta)+(theta-1)sum ln(x_i).",
      },
      {
        title: "2) Differentiate and solve",
        detail:
          "d ell/d theta = n/theta + sum ln(x_i) = 0 -> theta_hat = -n / sum ln(x_i) = -n/ln(product x_i).",
      },
      {
        title: "3) Plug sample values",
        detail:
          "product x_i = 0.5*0.8*0.9 = 0.36. Then theta_hat = -3/ln(0.36) approx 2.94.",
      },
      {
        title: "4) Compute standard error",
        detail: "SE approx theta_hat/sqrt(n) = 2.94/sqrt(3) approx 1.70.",
      },
      {
        title: "5) 95% interval",
        detail: "theta approx 2.94 +/- 1.96*1.70 = 2.94 +/- 3.33, i.e. approximately (-0.39, 6.27).",
      },
    ],
    finalAnswer:
      "MLE: theta_hat = -n/ln(product x_i). For sample (0.5,0.8,0.9), theta_hat approx 2.94 and approximate 95% CI is 2.94 +/- 3.33.",
    difficulty: "exam-like",
    tags: ["mle", "log-likelihood", "asymptotic-ci"],
    commonMistake:
      "Dropping the negative sign from ln(product x_i), which makes theta_hat negative by mistake.",
    examShortcut:
      "For products in likelihood, log-transform immediately to turn products into sums.",
    memorizeThis:
      "MLE often comes from solving derivative of log-likelihood equal to zero.",
    patternHint:
      "Unknown theta inside power x^(theta-1) is a classic log-likelihood differentiation problem.",
  },
  {
    id: "mle-2025-estimate-mu-sigma-from-tails",
    category: "maximum-likelihood-estimation",
    subcategory: "Parameter estimation from empirical quantiles",
    sourceExam: "MathStat Exam 2025-03 (Problem 9)",
    originalProblemNumber: "9",
    title: "Estimate mu and sigma from exceedance proportions",
    question:
      "Assume bar length X ~ N(mu,sigma). In sample of 20 bars, 18 are longer than 78 cm and 4 are longer than 80 cm. Estimate mu and sigma.",
    formulasNeeded: [
      "p = P(X>=a)=Phi((mu-a)/sigma)",
      "Use observed proportions p_hat and q_hat as estimates",
      "Inverse normal table values: Phi(1.28)=0.90, Phi(0.84)=0.80",
    ],
    whyMethodApplies:
      "The exam solution uses plug-in estimation via normal tail equations, which is a practical parameter-estimation approach when only threshold counts are available.",
    steps: [
      {
        title: "1) Convert counts to proportions",
        detail:
          "p_hat=P(X>=78) approx 18/20 = 0.90. q_hat=P(X>=80) approx 4/20 = 0.20.",
      },
      {
        title: "2) Write model equations",
        detail:
          "P(X>=78)=Phi((mu-78)/sigma)=0.90 and P(X>=80)=Phi((mu-80)/sigma)=0.20.",
      },
      {
        title: "3) Convert second equation using symmetry",
        detail:
          "Phi((mu-80)/sigma)=0.20 implies Phi((80-mu)/sigma)=0.80.",
      },
      {
        title: "4) Read z-values from table",
        detail:
          "(mu-78)/sigma = 1.28 and (80-mu)/sigma = 0.84.",
      },
      {
        title: "5) Solve linear system",
        detail:
          "mu - 1.28 sigma = 78 and mu + 0.84 sigma = 80 -> 2.12 sigma = 2 -> sigma_hat=0.94 and mu_hat=79.2.",
      },
    ],
    finalAnswer: "Estimated parameters: mu_hat approx 79.2, sigma_hat approx 0.94.",
    difficulty: "exam-like",
    tags: ["parameter-estimation", "normal-quantiles", "mle-related"],
    commonMistake:
      "Using q_hat=0.20 directly as Phi(z) without switching tail to CDF form.",
    examShortcut:
      "Translate all tail probabilities to Phi(z) equations, then solve as two linear equations.",
    memorizeThis:
      "For normal tails: P(X>=a)=Phi((mu-a)/sigma).",
    patternHint:
      "When only exceedance counts are given, convert them into quantile equations.",
    alternativeMethodWarning:
      "Attempting full raw-data likelihood is impossible here because raw observations are not provided.",
  },
  {
    id: "std-2024-compare-standardized-fish-sizes",
    category: "standardization",
    subcategory: "Percentile matching with Z-scores",
    sourceExam: "MathStat Exam 2024-03 (Problem 3c)",
    originalProblemNumber: "3(c)",
    title: "Equivalent B-fish and C-fish size to a 14 kg A-fish",
    question:
      "Species A: N(10,2^2), B: N(22,6^2), C: N(30,8^2). If an A-fish weighs 14 kg, what weights for B and C are equally large relative to their own species?",
    formulasNeeded: [
      "Z = (X-mu)/sigma",
      "Match percentile by setting standardized values equal",
      "Back-transform: X = mu + z*sigma",
    ],
    whyMethodApplies:
      "The question asks for equal relative position within different normal distributions, so we match Z-scores across species.",
    steps: [
      {
        title: "1) Standardize the observed A-fish",
        detail: "z_A = (14-10)/2 = 2.",
      },
      {
        title: "2) Match B-fish standardized value",
        detail: "Set (w_B-22)/6 = 2.",
      },
      {
        title: "3) Solve for B-fish weight",
        detail: "w_B = 22 + 2*6 = 34 kg.",
      },
      {
        title: "4) Match C-fish standardized value",
        detail: "Set (w_C-30)/8 = 2.",
      },
      {
        title: "5) Solve for C-fish weight and conclude",
        detail: "w_C = 30 + 2*8 = 46 kg. These correspond to the same relative percentile as 14 kg in species A.",
      },
    ],
    finalAnswer: "Equivalent weights are 34 kg for species B and 46 kg for species C.",
    difficulty: "easy",
    tags: ["standardization", "percentile-matching", "normal"],
    commonMistake:
      "Trying to equate raw weights instead of equating standardized positions.",
    examShortcut:
      "Equal relative size across normal groups means equal Z.",
    memorizeThis:
      "If two observations are equally extreme in their own normals, their Z-scores are equal.",
    patternHint:
      "Words like 'as big within their species' signal standardized comparison.",
  },
  {
    id: "pp-2021-sales-hour-clt",
    category: "poisson-process",
    subcategory: "Thinned Poisson over long interval",
    sourceExam: "MathStat Exam 2021-03 (Problem 6c)",
    originalProblemNumber: "6(c)",
    title: "Sales in one hour with visit rate and purchase probability",
    question:
      "Homepage visits average 8/min and 25% convert to sales. Let S be number of sales in one hour. Find E[S], Var[S], and approximate P(S<=130).",
    formulasNeeded: [
      "Thinning: lambda_sales = lambda_visits * p",
      "Poisson process count in t: S ~ Poi(lambda_sales * t)",
      "For Poisson: E[S]=Var[S]=m",
      "Normal approximation for large Poisson mean m",
    ],
    whyMethodApplies:
      "Sales come from independent Bernoulli thinning of a Poisson visit stream, which gives a Poisson sales process.",
    steps: [
      {
        title: "1) Compute sales rate",
        detail: "Visit rate is 8/min, conversion probability is 0.25, so sales rate is 8*0.25 = 2/min.",
      },
      {
        title: "2) One-hour count model",
        detail: "One hour is 60 minutes, so S ~ Poi(2*60)=Poi(120).",
      },
      {
        title: "3) Mean and variance",
        detail: "For Poisson(m), both mean and variance equal m. Hence E[S]=120 and Var[S]=120.",
      },
      {
        title: "4) Approximate with normal",
        detail: "Since m=120 is large, use S approx N(120,120).",
      },
      {
        title: "5) Standardize and conclude",
        detail: "z = (130-120)/sqrt(120) = 0.91, so P(S<=130) approx Phi(0.91) approx 0.82.",
      },
    ],
    finalAnswer: "E[S]=120, Var[S]=120, and P(S<=130) approx 0.82.",
    difficulty: "medium",
    tags: ["poisson-process", "thinning", "clt-approximation"],
    commonMistake:
      "Using 8 as sales rate directly and forgetting multiplication by 0.25.",
    examShortcut:
      "Poisson with large mean: jump to normal after setting the correct mean.",
    memorizeThis:
      "Thinning a Poisson process keeps Poisson structure and scales rate by p.",
    patternHint:
      "If arrivals + independent conversion are given, think thinning first.",
    crossReferenceCategory: "central-limit-theorem",
  },
  {
    id: "bayes-2024-image-classified-real",
    category: "bayes-total-probability",
    subcategory: "Classifier output probability and posterior",
    sourceExam: "MathStat Exam 2024-06 (Problem 4a,b)",
    originalProblemNumber: "4(a,b)",
    title: "Image classifier: probability classified real and posterior fake",
    question:
      "80% of images are real. Classifier is correct on 87% of real and 78% of fake images. Compute (i) P(classified real), (ii) P(fake | classified real).",
    formulasNeeded: [
      "Total probability: P(Cr)=P(Cr|R)P(R)+P(Cr|F)P(F)",
      "P(Cr|F)=1-P(correct|F)",
      "Bayes: P(F|Cr)=P(Cr|F)P(F)/P(Cr)",
    ],
    whyMethodApplies:
      "Part (i) requires summing all ways to be classified real. Part (ii) reverses conditioning, so Bayes is required.",
    steps: [
      {
        title: "1) Define events",
        detail: "R=real, F=fake, Cr=classified as real. Given P(R)=0.80, P(F)=0.20.",
      },
      {
        title: "2) Compute classifier branch rates",
        detail: "P(Cr|R)=0.87. Since fake is correctly classified 78%, P(Cr|F)=0.22.",
      },
      {
        title: "3) Total probability for Cr",
        detail: "P(Cr)=0.87*0.80 + 0.22*0.20 = 0.696 + 0.044 = 0.74.",
      },
      {
        title: "4) Bayes posterior for fake",
        detail: "P(F|Cr)=0.22*0.20 / 0.74 = 0.044/0.74 approx 0.06.",
      },
      {
        title: "5) Interpret",
        detail: "Only about 6% of images classified as real are actually fake in this setting.",
      },
    ],
    finalAnswer: "P(classified real)=0.74 and P(fake | classified real) approx 0.06.",
    difficulty: "easy",
    tags: ["bayes", "total-probability", "classification"],
    commonMistake:
      "Using 0.78 as P(Cr|F) even though 0.78 is correct fake classification (i.e., classified fake).",
    examShortcut:
      "Write class prior and classifier matrix first; then denominator is automatic.",
    memorizeThis:
      "Posterior needs both prior and classifier error rates.",
    patternHint:
      "If question says 'given classified as ...', Bayes is almost always needed.",
  },
  {
    id: "comb-2024-bridge-twelve-hearts-one-king",
    category: "combinatorics",
    subcategory: "Case split counting",
    sourceExam: "MathStat Exam 2024-06 (Problem 5c)",
    originalProblemNumber: "5(c)",
    title: "Bridge hand: exactly 12 hearts and exactly 1 king",
    question:
      "In a 13-card bridge hand, give a combinatorial expression for probability of exactly 12 hearts and exactly one king.",
    formulasNeeded: [
      "Total hands C(52,13)",
      "Case split by whether king of hearts is included",
      "Add disjoint favorable cases",
    ],
    whyMethodApplies:
      "The king condition interacts with heart count, so splitting into disjoint cases avoids under/over-counting.",
    steps: [
      {
        title: "1) Total outcomes",
        detail: "Denominator is C(52,13).",
      },
      {
        title: "2) Case A: king of hearts is included",
        detail: "Choose KH in C(1,1), choose 11 of remaining 12 hearts in C(12,11), and final non-heart non-king in C(36,1).",
      },
      {
        title: "3) Case B: king of hearts not included",
        detail: "Then all 12 non-king hearts are forced: C(12,12), and choose the single king from the 3 non-heart kings: C(3,1).",
      },
      {
        title: "4) Add disjoint cases",
        detail: "Favorable count = C(1,1)C(12,11)C(36,1) + C(3,1)C(12,12).",
      },
      {
        title: "5) Build probability",
        detail: "P = [C(1,1)C(12,11)C(36,1) + C(3,1)C(12,12)] / C(52,13).",
      },
    ],
    finalAnswer:
      "P = [C(1,1)C(12,11)C(36,1) + C(3,1)C(12,12)] / C(52,13).",
    difficulty: "exam-like",
    tags: ["combinatorics", "bridge", "case-split"],
    commonMistake:
      "Counting all 12 hearts with C(13,12) and then separately choosing one king, which double counts invalid overlaps.",
    examShortcut:
      "When a rank condition overlaps a suit condition, split into 'special card included' vs 'not included'.",
    memorizeThis:
      "Disjoint case split + addition is safer than forcing everything in one formula.",
    patternHint:
      "If one specific card (KH) changes constraints, create two cases.",
  },
  {
    id: "ci-2025-travel-proportion-ci",
    category: "confidence-intervals",
    subcategory: "One-sample proportion with decision vs 0.5",
    sourceExam: "MathStat Exam 2025-06 (Problem 7a)",
    originalProblemNumber: "7(a)",
    title: "95% CI for travel-abroad proportion from 853/1584",
    question:
      "In a poll, 853 of 1584 intend to travel abroad. Find a 95% confidence interval for p and decide whether at least half the population intends to travel.",
    formulasNeeded: [
      "p_hat = x/n",
      "95% CI: p_hat +/- 1.96*sqrt(p_hat(1-p_hat)/n)",
      "Decision rule vs 0.5 uses interval lower bound",
    ],
    whyMethodApplies:
      "This is a single large-sample binary proportion estimate with a policy threshold at 0.5.",
    steps: [
      {
        title: "1) Compute estimate",
        detail: "p_hat = 853/1584 approx 0.54.",
      },
      {
        title: "2) Compute standard error",
        detail: "SE = sqrt(0.54*0.46/1584) approx 0.0128.",
      },
      {
        title: "3) Margin of error",
        detail: "ME = 1.96*0.0128 approx 0.025.",
      },
      {
        title: "4) Confidence interval",
        detail: "CI = 0.54 +/- 0.025 = (0.515, 0.565).",
      },
      {
        title: "5) Conclusion on at least half",
        detail: "Because the lower bound 0.515 is above 0.5, we can conclude at 95% confidence that at least half intend to travel.",
      },
    ],
    finalAnswer:
      "95% CI is approximately (0.515, 0.565); yes, data supports p>=0.5 at 95% confidence.",
    difficulty: "easy",
    tags: ["confidence-interval", "one-proportion", "decision-threshold"],
    commonMistake:
      "Looking only at p_hat and ignoring interval uncertainty.",
    examShortcut:
      "For yes/no with large n: compute p_hat, SE, and check if lower bound exceeds 0.5.",
    memorizeThis:
      "Conclusion for 'at least half' depends on interval lower endpoint.",
    patternHint:
      "Whenever question asks 'can we conclude at least ...', compare threshold to CI bounds.",
  },
  {
    id: "clt-2022-multiple-choice-pass-probability",
    category: "central-limit-theorem",
    subcategory: "Normal approximation for binomial threshold",
    sourceExam: "MathStat Exam 2022-06 (Problem 2c)",
    originalProblemNumber: "2(c)",
    title: "Approximate passing probability in a 100-question test",
    question:
      "Each question has 50% chance you know answer; otherwise you guess among 4 choices. For 100 questions, approximate probability of at least 70 correct.",
    formulasNeeded: [
      "Total success probability per question via total probability",
      "X ~ Bin(n,p) for count of correct answers",
      "Normal approximation: X approx N(np,np(1-p))",
    ],
    whyMethodApplies:
      "After finding per-question success probability, total correct count is binomial with n=100, large enough for normal approximation.",
    steps: [
      {
        title: "1) Compute per-question success probability",
        detail: "p = 1*0.5 + (1/4)*0.5 = 5/8 = 0.625.",
      },
      {
        title: "2) Binomial model",
        detail: "Let X=#correct out of 100. Then X ~ Bin(100,0.625).",
      },
      {
        title: "3) Mean and sd",
        detail: "Mean np = 62.5 and sd = sqrt(np(1-p)) = sqrt(23.4375) approx 4.84.",
      },
      {
        title: "4) Approximate threshold probability",
        detail: "P(X>=70)=1-P(X<=69) approx 1 - Phi((69-62.5)/4.84) = 1 - Phi(1.34).",
      },
      {
        title: "5) Table lookup",
        detail: "Phi(1.34) approx 0.91, giving pass probability approx 0.09.",
      },
    ],
    finalAnswer: "Approximate probability of passing is about 0.09.",
    difficulty: "medium",
    tags: ["clt", "binomial", "normal-approximation"],
    commonMistake:
      "Using p=0.5 instead of including guessing success in the total probability.",
    examShortcut:
      "First line: p(correct)=P(know)+P(guess and right).",
    memorizeThis:
      "Large binomial counts are fast to approximate with normal using mean and sd.",
    patternHint:
      "If you see large n and threshold like >=70, expect normal approximation.",
  },
  {
    id: "test-2024-medicine-left-tail-t-test",
    category: "hypothesis-tests",
    subcategory: "One-sample left-tailed t-test with p-value interval",
    sourceExam: "MathStat Exam 2024-06 (Problem 8)",
    originalProblemNumber: "8(a,b,c)",
    title: "Medicine claim: cholesterol mean below 6",
    question:
      "n=18, x_bar=5.3, sample variance s^2=1.69, normal assumption. Test claim mu<6 at 5% significance and bound the p-value.",
    formulasNeeded: [
      "H0: mu=6, H1: mu<6",
      "T = (x_bar-mu0)/(s/sqrt(n)), df=17",
      "Left-tail rejection cutoff: -t_{0.95,17}",
      "p-value from t-table bounds",
    ],
    whyMethodApplies:
      "Population variance is unknown and sample is small, so use a one-sample t-test; claim is left-tailed.",
    steps: [
      {
        title: "1) Set hypotheses",
        detail: "H0: mu=6 and H1: mu<6.",
      },
      {
        title: "2) Compute test statistic",
        detail: "s=sqrt(1.69)=1.3, SE=1.3/sqrt(18). T=(5.3-6)/(1.3/sqrt(18))=-2.28.",
      },
      {
        title: "3) Critical value check",
        detail: "For df=17 and alpha=0.05 one-sided, t_crit=1.74. Reject if T<-1.74. Since -2.28<-1.74, reject H0.",
      },
      {
        title: "4) p-value interval from table",
        detail: "For df=17, 2.11 corresponds to 0.025 and 2.57 corresponds to 0.01 (one-sided). Since |T|=2.28 is between them, 0.01 < p < 0.025.",
      },
      {
        title: "5) Interpretation",
        detail: "There is support for the medicine claim that mean cholesterol is below 6.",
      },
    ],
    finalAnswer:
      "Reject H0 at 5%; evidence supports mu<6. One-sided p-value is between 0.01 and 0.025.",
    difficulty: "exam-like",
    tags: ["hypothesis-test", "t-test", "left-tailed"],
    commonMistake:
      "Using z-table despite unknown population variance.",
    examShortcut:
      "Unknown sigma + n=18 -> t with df=17 immediately.",
    memorizeThis:
      "For one-sided tests, compare sign and magnitude of T with one-sided critical value.",
    patternHint:
      "Claim 'reduce to under' maps to H1: mu < target.",
  },
  {
    id: "mle-2022-theta-ci-claim",
    category: "maximum-likelihood-estimation",
    subcategory: "Asymptotic CI and threshold claim",
    sourceExam: "MathStat Exam 2022-03 (Problem 8b)",
    originalProblemNumber: "8(b)",
    title: "Use estimator CI to evaluate claim theta < 7",
    question:
      "Given theta_hat = -n/ln(product Xi) and theta_hat approx N(theta, theta^2/n), with sample n=3 and values 0.5, 0.8, 0.9, decide if we can claim theta<7 at ~95% confidence.",
    formulasNeeded: [
      "theta_hat = -n/ln(product Xi)",
      "Approximate SE(theta_hat)=theta_hat/sqrt(n)",
      "Approximate 95% CI: theta_hat +/- 1.96*SE",
      "Claim theta<7 holds if interval upper bound is below 7",
    ],
    whyMethodApplies:
      "The estimator distribution is given directly, so confidence-interval based decision is the intended fast method.",
    steps: [
      {
        title: "1) Compute estimator",
        detail: "product Xi = 0.5*0.8*0.9 = 0.36, so theta_hat = -3/ln(0.36) approx 2.94.",
      },
      {
        title: "2) Compute approximate standard error",
        detail: "SE approx 2.94/sqrt(3) approx 1.70.",
      },
      {
        title: "3) Build 95% interval",
        detail: "theta approx 2.94 +/- 1.96*1.70 = 2.94 +/- 3.33, giving about (-0.39, 6.27).",
      },
      {
        title: "4) Compare with threshold 7",
        detail: "Upper bound 6.27 is below 7.",
      },
      {
        title: "5) Final decision",
        detail: "At approximately 95% confidence, data supports the claim theta < 7.",
      },
    ],
    finalAnswer:
      "Yes. The approximate 95% CI is about (-0.39, 6.27), entirely below 7.",
    difficulty: "medium",
    tags: ["mle", "confidence-interval", "parameter-claim"],
    commonMistake:
      "Checking whether point estimate is below 7 without using uncertainty interval.",
    examShortcut:
      "For one-sided claim theta<k, just check if CI upper endpoint < k.",
    memorizeThis:
      "Asymptotic estimator CI can answer parameter claims quickly.",
    patternHint:
      "If an estimator distribution is provided, use it directly rather than re-deriving likelihood.",
  },
  {
    id: "std-extra-quantile-90",
    category: "standardization",
    subcategory: "Normal quantile back-solving",
    sourceExam: "MathStat Exam 2024-06 (Extra drill)",
    originalProblemNumber: "E1",
    title: "Find x such that P(X<=x)=0.90",
    question: "If X~N(50,10^2), find x such that P(X<=x)=0.90.",
    formulasNeeded: ["x = mu + z*sigma", "Phi(z)=0.90 gives z≈1.28"],
    whyMethodApplies: "This is a percentile question on a normal variable.",
    steps: [
      { title: "1) Get z-value", detail: "From table, Phi(z)=0.90 gives z≈1.28." },
      { title: "2) Back-substitute", detail: "x=50+1.28*10=62.8." },
      { title: "3) State result", detail: "The 90th percentile is 62.8." },
    ],
    finalAnswer: "x≈62.8",
    difficulty: "easy",
    tags: ["standardization", "quantile", "normal"],
    commonMistake: "Using variance 10^2 directly instead of sigma=10.",
    examShortcut: "Percentile -> lookup z -> x=mu+z*sigma.",
    memorizeThis: "90th percentile of Z is about 1.28.",
    patternHint: "Phrase 'find x so that probability equals q' means quantile inversion.",
  },
  {
    id: "std-extra-between-probability",
    category: "standardization",
    subcategory: "Interval probability",
    sourceExam: "MathStat Exam 2025-03 (Extra drill)",
    originalProblemNumber: "E2",
    title: "Compute P(85<=X<=120)",
    question: "If X~N(100,15^2), compute P(85<=X<=120).",
    formulasNeeded: ["P(a<=X<=b)=Phi(z_b)-Phi(z_a)", "z=(x-mu)/sigma"],
    whyMethodApplies: "This is an interval probability under a normal model.",
    steps: [
      { title: "1) Standardize endpoints", detail: "z_a=(85-100)/15=-1, z_b=(120-100)/15=1.33." },
      { title: "2) Use table", detail: "Phi(1.33)≈0.908, Phi(-1)≈0.159." },
      { title: "3) Subtract", detail: "0.908-0.159≈0.749." },
    ],
    finalAnswer: "P(85<=X<=120)≈0.75",
    difficulty: "medium",
    tags: ["standardization", "interval", "z-table"],
    commonMistake: "Forgetting that lower bound must be subtracted.",
    examShortcut: "Always write interval as upper CDF minus lower CDF.",
    memorizeThis: "Phi(-z)=1-Phi(z).",
    patternHint: "Two cutoffs in normal question -> convert both to z-values.",
  },
  {
    id: "std-extra-a-greater-b",
    category: "standardization",
    subcategory: "Difference of independent normals",
    sourceExam: "MathStat Exam 2022-03 (Extra drill)",
    originalProblemNumber: "E3",
    title: "Compute P(A>B)",
    question: "A~N(30,4^2), B~N(26,5^2), independent. Compute P(A>B).",
    formulasNeeded: ["W=A-B is normal", "mu_W=mu_A-mu_B", "var_W=var_A+var_B"],
    whyMethodApplies: "Comparison of two normals is solved via their difference.",
    steps: [
      { title: "1) Define W", detail: "W=A-B, so event is W>0." },
      { title: "2) Mean and sd", detail: "mu_W=4, sigma_W=sqrt(16+25)=6.40." },
      { title: "3) Probability", detail: "P(W>0)=1-Phi((0-4)/6.40)=Phi(0.625)≈0.734." },
    ],
    finalAnswer: "P(A>B)≈0.73",
    difficulty: "medium",
    tags: ["standardization", "linear-combination", "normal"],
    commonMistake: "Subtracting variances instead of adding for A-B.",
    examShortcut: "Two normals in inequality -> move to one side and standardize.",
    memorizeThis: "Independent difference variance is sum of variances.",
    patternHint: "If two random variables are compared, define one new variable.",
  },
  {
    id: "pp-extra-two-in-half-hour",
    category: "poisson-process",
    subcategory: "Poisson counts",
    sourceExam: "MathStat Exam 2024-03 (Extra drill)",
    originalProblemNumber: "E1",
    title: "Exactly two arrivals in 30 minutes",
    question: "Arrivals follow Poisson process with 3 per hour. Compute probability of exactly 2 arrivals in 30 minutes.",
    formulasNeeded: ["N(t)~Poi(lambda t)", "P(N=k)=e^{-m}m^k/k!"],
    whyMethodApplies: "Count in fixed interval from Poisson process is Poisson.",
    steps: [
      { title: "1) Mean count", detail: "m=lambda t=3*(0.5)=1.5." },
      { title: "2) Apply formula", detail: "P(N=2)=e^{-1.5}*1.5^2/2!." },
      { title: "3) Compute", detail: "Value ≈0.251." },
    ],
    finalAnswer: "P(N=2)≈0.251",
    difficulty: "easy",
    tags: ["poisson", "count"],
    commonMistake: "Forgetting time conversion from hour to half-hour.",
    examShortcut: "First line: m=lambda*t.",
    memorizeThis: "Poisson count mean equals lambda*t.",
    patternHint: "Words 'exactly k in interval' -> Poisson PMF.",
  },
  {
    id: "pp-extra-wait-under-10",
    category: "poisson-process",
    subcategory: "Exponential waiting time",
    sourceExam: "MathStat Exam 2025-06 (Extra drill)",
    originalProblemNumber: "E2",
    title: "Wait less than 10 minutes",
    question: "Events happen at 12 per hour. Compute probability first event occurs within 10 minutes.",
    formulasNeeded: ["T~Exp(lambda)", "P(T<=t)=1-e^{-lambda t}"],
    whyMethodApplies: "First waiting time in Poisson process is exponential.",
    steps: [
      { title: "1) Convert rate", detail: "lambda=12/60=0.2 per minute." },
      { title: "2) Plug t", detail: "P(T<=10)=1-e^{-0.2*10}=1-e^{-2}." },
      { title: "3) Compute", detail: "≈0.865." },
    ],
    finalAnswer: "≈0.865",
    difficulty: "easy",
    tags: ["poisson", "exponential", "waiting-time"],
    commonMistake: "Using Poisson count formula instead of exponential CDF.",
    examShortcut: "First-arrival time -> exponential instantly.",
    memorizeThis: "P(T<=t)=1-exp(-lambda t).",
    patternHint: "If asked 'within t time' for next arrival, use waiting-time model.",
  },
  {
    id: "pp-extra-thinning-over-five",
    category: "poisson-process",
    subcategory: "Thinning",
    sourceExam: "MathStat Exam 2022-06 (Extra drill)",
    originalProblemNumber: "E3",
    title: "After thinning, probability more than five",
    question: "Calls arrive as Poisson with rate 20/day. Each call is premium with probability 0.3. Compute P(premium calls > 5 in one day).",
    formulasNeeded: ["Thinning: lambda_new=lambda*p", "Poi tail probability"],
    whyMethodApplies: "Kept events after independent filtering remain Poisson.",
    steps: [
      { title: "1) New rate", detail: "lambda_new=20*0.3=6." },
      { title: "2) Model", detail: "X~Poi(6), need P(X>5)=1-P(X<=5)." },
      { title: "3) Compute", detail: "P(X>5)≈0.554." },
    ],
    finalAnswer: "P(X>5)≈0.55",
    difficulty: "medium",
    tags: ["poisson", "thinning", "tail-probability"],
    commonMistake: "Using binomial with n=20 even though 20 is rate, not fixed trials.",
    examShortcut: "Thinning always starts with lambda*p.",
    memorizeThis: "Poisson + thinning stays Poisson.",
    patternHint: "If each arrival is kept with probability p, think thinning.",
  },
  {
    id: "bayes-extra-factory-defect",
    category: "bayes-total-probability",
    subcategory: "Bayes with two sources",
    sourceExam: "MathStat Exam 2024-06 (Extra drill)",
    originalProblemNumber: "E1",
    title: "Defective item source probability",
    question: "Factory A makes 60% with defect rate 1%. Factory B makes 40% with defect rate 3%. Given item is defective, find probability it came from B.",
    formulasNeeded: ["Bayes rule", "Total probability in denominator"],
    whyMethodApplies: "We reverse conditional direction after observing defect.",
    steps: [
      { title: "1) Numerator", detail: "P(D|B)P(B)=0.03*0.40=0.012." },
      { title: "2) Denominator", detail: "0.01*0.60 + 0.03*0.40 = 0.018." },
      { title: "3) Posterior", detail: "0.012/0.018 = 0.667." },
    ],
    finalAnswer: "P(B|D)≈0.667",
    difficulty: "easy",
    tags: ["bayes", "total-probability"],
    commonMistake: "Forgetting the A branch in denominator.",
    examShortcut: "Write numerator first, then sum all evidence branches below.",
    memorizeThis: "Posterior = matching branch / all branches.",
    patternHint: "Given observed outcome and asked source -> Bayes.",
  },
  {
    id: "bayes-extra-medical-test",
    category: "bayes-total-probability",
    subcategory: "Diagnostic test posterior",
    sourceExam: "MathStat Exam 2025-03 (Extra drill)",
    originalProblemNumber: "E2",
    title: "Positive predictive value",
    question: "Disease prevalence is 2%. Sensitivity is 95% and false-positive rate is 10%. Find P(Disease | Positive).",
    formulasNeeded: ["Bayes with prevalence", "Total probability denominator"],
    whyMethodApplies: "This is classic reverse test probability.",
    steps: [
      { title: "1) Numerator", detail: "0.95*0.02=0.019." },
      { title: "2) Denominator", detail: "0.019 + 0.10*0.98 = 0.117." },
      { title: "3) Posterior", detail: "0.019/0.117≈0.162." },
    ],
    finalAnswer: "≈0.162",
    difficulty: "medium",
    tags: ["bayes", "diagnosis"],
    commonMistake: "Ignoring base rate and overestimating posterior.",
    examShortcut: "Use decimal branch table before formula.",
    memorizeThis: "Low prevalence can keep posterior low despite good sensitivity.",
    patternHint: "Words like sensitivity/specificity almost always imply Bayes.",
  },
  {
    id: "bayes-extra-witness-taxi",
    category: "bayes-total-probability",
    subcategory: "Witness reliability",
    sourceExam: "MathStat Exam 2022-03 (Extra drill)",
    originalProblemNumber: "E3",
    title: "Taxi witness problem",
    question: "In a city, 15% taxis are blue and 85% are green. Witness identifies blue with 80% accuracy. If witness says blue, find probability taxi was actually blue.",
    formulasNeeded: ["Bayes rule", "Two-branch denominator"],
    whyMethodApplies: "Observation from imperfect witness requires posterior update.",
    steps: [
      { title: "1) Numerator", detail: "P(SaysBlue|Blue)P(Blue)=0.8*0.15=0.12." },
      { title: "2) Denominator", detail: "0.12 + P(SaysBlue|Green)P(Green)=0.12+0.2*0.85=0.29." },
      { title: "3) Posterior", detail: "0.12/0.29≈0.414." },
    ],
    finalAnswer: "≈0.414",
    difficulty: "exam-like",
    tags: ["bayes", "witness", "classification"],
    commonMistake: "Using 0.8 directly as posterior probability.",
    examShortcut: "Witness accuracy is P(statement|truth), not posterior.",
    memorizeThis: "Posterior needs priors.",
    patternHint: "If evidence reliability is given, reverse probability with Bayes.",
  },
  {
    id: "comb-extra-two-aces",
    category: "combinatorics",
    subcategory: "Exact count with combinations",
    sourceExam: "MathStat Exam 2024-03 (Extra drill)",
    originalProblemNumber: "E1",
    title: "Exactly two aces in 5-card hand",
    question: "Compute probability of exactly 2 aces in a 5-card hand from a standard deck.",
    formulasNeeded: ["Combinations", "favorable/total"],
    whyMethodApplies: "Fixed-size hand with exact count constraint is combinatorics.",
    steps: [
      { title: "1) Favorable hands", detail: "C(4,2)*C(48,3)." },
      { title: "2) Total hands", detail: "C(52,5)." },
      { title: "3) Ratio", detail: "C(4,2)C(48,3)/C(52,5)≈0.0399." },
    ],
    finalAnswer: "≈0.0399",
    difficulty: "easy",
    tags: ["combinatorics", "cards", "exactly"],
    commonMistake: "Using permutations where order doesn't matter.",
    examShortcut: "Exactly k from group A: C(A,k)*C(rest,n-k).",
    memorizeThis: "Card hands are almost always combination counts.",
    patternHint: "Word 'exactly' means fixed count in each group.",
  },
  {
    id: "comb-extra-no-hearts",
    category: "combinatorics",
    subcategory: "Complement counting",
    sourceExam: "MathStat Exam 2025-06 (Extra drill)",
    originalProblemNumber: "E2",
    title: "No hearts in 5-card hand",
    question: "Compute probability that a 5-card hand contains no hearts.",
    formulasNeeded: ["Combinations", "favorable/total"],
    whyMethodApplies: "This is a pure counting ratio with suit restriction.",
    steps: [
      { title: "1) Favorable choices", detail: "Choose all 5 cards from non-hearts: C(39,5)." },
      { title: "2) Total choices", detail: "C(52,5)." },
      { title: "3) Probability", detail: "C(39,5)/C(52,5)≈0.2215." },
    ],
    finalAnswer: "≈0.2215",
    difficulty: "easy",
    tags: ["combinatorics", "cards", "suits"],
    commonMistake: "Counting ordered draws instead of unordered hands.",
    examShortcut: "No hearts -> only 39-card pool for all picks.",
    memorizeThis: "Use C(n,k) for hand selections.",
    patternHint: "If restriction excludes a suit, reduce source pool first.",
  },
  {
    id: "comb-extra-at-least-one-king",
    category: "combinatorics",
    subcategory: "Complement event",
    sourceExam: "MathStat Exam 2022-06 (Extra drill)",
    originalProblemNumber: "E3",
    title: "At least one king",
    question: "Compute probability of at least one king in a 5-card hand.",
    formulasNeeded: ["Complement rule", "Combinations"],
    whyMethodApplies: "At least one is fastest via complement none.",
    steps: [
      { title: "1) Complement event", detail: "No kings probability = C(48,5)/C(52,5)." },
      { title: "2) Convert", detail: "P(at least one king)=1-P(no kings)." },
      { title: "3) Compute", detail: "≈1-0.659=0.341." },
    ],
    finalAnswer: "≈0.341",
    difficulty: "medium",
    tags: ["combinatorics", "complement"],
    commonMistake: "Trying to add many overlapping king cases directly.",
    examShortcut: "At least one -> 1 minus none.",
    memorizeThis: "Complement often avoids overcounting.",
    patternHint: "For 'at least one', check complement first.",
  },
  {
    id: "ci-extra-one-proportion-400",
    category: "confidence-intervals",
    subcategory: "One-sample proportion CI",
    sourceExam: "MathStat Exam 2024-06 (Extra drill)",
    originalProblemNumber: "E1",
    title: "95% CI for poll proportion",
    question: "In a poll, 232 of 400 support proposal. Compute 95% CI for support proportion.",
    formulasNeeded: ["p_hat +/- 1.96*sqrt(p_hat(1-p_hat)/n)"],
    whyMethodApplies: "Binary outcomes and large sample imply z-based proportion CI.",
    steps: [
      { title: "1) Estimate", detail: "p_hat=232/400=0.58." },
      { title: "2) SE and margin", detail: "SE=sqrt(0.58*0.42/400)=0.0247, ME≈1.96*SE=0.048." },
      { title: "3) Interval", detail: "0.58±0.048 -> (0.532,0.628)." },
    ],
    finalAnswer: "95% CI ≈ (0.532, 0.628)",
    difficulty: "easy",
    tags: ["confidence-interval", "one-proportion"],
    commonMistake: "Using percentage values without converting to decimals.",
    examShortcut: "p_hat first, then SE, then ±1.96*SE.",
    memorizeThis: "95% proportion CI uses z=1.96.",
    patternHint: "Yes/no sample proportion -> one-proportion CI.",
  },
  {
    id: "ci-extra-two-proportion-diff",
    category: "confidence-intervals",
    subcategory: "Two-sample proportion difference CI",
    sourceExam: "MathStat Exam 2025-03 (Extra drill)",
    originalProblemNumber: "E2",
    title: "95% CI for p1-p2",
    question: "Group 1: 171/300 success. Group 2: 140/280 success. Compute 95% CI for p1-p2.",
    formulasNeeded: ["(p1_hat-p2_hat) +/- 1.96*sqrt(p1_hat(1-p1_hat)/n1 + p2_hat(1-p2_hat)/n2)"],
    whyMethodApplies: "Two independent binary samples require difference CI.",
    steps: [
      { title: "1) Point estimate", detail: "p1_hat=0.57, p2_hat=0.50, diff=0.07." },
      { title: "2) SE", detail: "SE≈sqrt(0.57*0.43/300 + 0.5*0.5/280)=0.041." },
      { title: "3) Interval", detail: "0.07±1.96*0.041≈0.07±0.081 -> (-0.011,0.151)." },
    ],
    finalAnswer: "95% CI for p1-p2 ≈ (-0.011, 0.151)",
    difficulty: "medium",
    tags: ["confidence-interval", "two-proportion"],
    commonMistake: "Computing two separate CIs instead of CI for the difference.",
    examShortcut: "Always build CI around p1_hat-p2_hat.",
    memorizeThis: "If 0 in CI, difference is not clearly significant at that level.",
    patternHint: "Two groups + yes/no outcomes -> difference in proportions.",
  },
  {
    id: "ci-extra-mean-known-sigma",
    category: "confidence-intervals",
    subcategory: "Mean CI with known sigma",
    sourceExam: "MathStat Exam 2022-03 (Extra drill)",
    originalProblemNumber: "E3",
    title: "95% CI for mean with known sigma",
    question: "Given n=64, x_bar=12.4, known sigma=3. Compute 95% CI for mu.",
    formulasNeeded: ["x_bar +/- 1.96*(sigma/sqrt(n))"],
    whyMethodApplies: "Known sigma gives z-based mean confidence interval.",
    steps: [
      { title: "1) SE", detail: "SE=sigma/sqrt(n)=3/8=0.375." },
      { title: "2) Margin", detail: "ME=1.96*0.375=0.735." },
      { title: "3) Interval", detail: "12.4±0.735 -> (11.665, 13.135)." },
    ],
    finalAnswer: "95% CI ≈ (11.665, 13.135)",
    difficulty: "easy",
    tags: ["confidence-interval", "mean", "known-sigma"],
    commonMistake: "Using t when sigma is explicitly known.",
    examShortcut: "Known sigma -> z interval directly.",
    memorizeThis: "SE for mean is sigma/sqrt(n).",
    patternHint: "Known variance in statement means z-method.",
  },
  {
    id: "clt-extra-sum-over-120",
    category: "central-limit-theorem",
    subcategory: "CLT on sums",
    sourceExam: "MathStat Exam 2024-03 (Extra drill)",
    originalProblemNumber: "E1",
    title: "Approximate P(S_50>120)",
    question: "Xi are i.i.d with mean 2 and variance 9. For S50 = sum Xi, approximate P(S50>120).",
    formulasNeeded: ["S_n approx N(n*mu, n*sigma^2)", "Standardization"],
    whyMethodApplies: "Large sum of i.i.d variables is approximated by normal using CLT.",
    steps: [
      { title: "1) Mean and sd", detail: "E(S50)=100, sd=sqrt(50*9)=21.21." },
      { title: "2) z-value", detail: "z=(120-100)/21.21=0.94." },
      { title: "3) Tail", detail: "P(S50>120)=1-Phi(0.94)≈0.173." },
    ],
    finalAnswer: "≈0.173",
    difficulty: "medium",
    tags: ["clt", "sum", "normal-approximation"],
    commonMistake: "Using sigma instead of sqrt(n)*sigma for sum SD.",
    examShortcut: "For sums: mean n*mu, variance n*sigma^2.",
    memorizeThis: "CLT converts hard sums to z-table lookup.",
    patternHint: "Large n + sum threshold => CLT candidate.",
  },
  {
    id: "clt-extra-binomial-200",
    category: "central-limit-theorem",
    subcategory: "Normal approximation to binomial",
    sourceExam: "MathStat Exam 2025-06 (Extra drill)",
    originalProblemNumber: "E2",
    title: "Approximate P(X>=90) for Bin(200,0.4)",
    question: "Let X~Bin(200,0.4). Approximate P(X>=90) with normal approximation.",
    formulasNeeded: ["X approx N(np,np(1-p))", "Continuity correction"],
    whyMethodApplies: "Both np and n(1-p) are large, so normal approximation is suitable.",
    steps: [
      { title: "1) Mean and sd", detail: "Mean=80, sd=sqrt(48)=6.93." },
      { title: "2) Continuity correction", detail: "P(X>=90)≈P(Y>=89.5)." },
      { title: "3) z and tail", detail: "z=(89.5-80)/6.93=1.37, tail≈1-Phi(1.37)=0.085." },
    ],
    finalAnswer: "≈0.085",
    difficulty: "exam-like",
    tags: ["clt", "binomial", "continuity-correction"],
    commonMistake: "Skipping continuity correction at integer threshold.",
    examShortcut: "Use 89.5 for >=90.",
    memorizeThis: "Binomial normal approx needs continuity correction.",
    patternHint: "Large binomial count with threshold -> normal approximation.",
  },
  {
    id: "clt-extra-average-range",
    category: "central-limit-theorem",
    subcategory: "Sample mean approximation",
    sourceExam: "MathStat Exam 2022-06 (Extra drill)",
    originalProblemNumber: "E3",
    title: "Approximate P(8<=X_bar<=13)",
    question: "Xi have mean 10 and sd 12. For n=36, approximate P(8<=X_bar<=13).",
    formulasNeeded: ["X_bar approx N(mu, sigma^2/n)", "Standardization"],
    whyMethodApplies: "Sample mean for moderate n is approximately normal.",
    steps: [
      { title: "1) Distribution", detail: "X_bar approx N(10, (12^2)/36), so sd=2." },
      { title: "2) z-values", detail: "z1=(8-10)/2=-1, z2=(13-10)/2=1.5." },
      { title: "3) Probability", detail: "Phi(1.5)-Phi(-1)=0.9332-0.1587=0.7745." },
    ],
    finalAnswer: "≈0.775",
    difficulty: "medium",
    tags: ["clt", "sample-mean", "z-table"],
    commonMistake: "Forgetting to divide sigma by sqrt(n) for sample mean.",
    examShortcut: "Mean problems: SD shrinks by sqrt(n).",
    memorizeThis: "Var(X_bar)=sigma^2/n.",
    patternHint: "Range probability for X_bar points to CLT for means.",
  },
  {
    id: "test-extra-z-right-tail",
    category: "hypothesis-tests",
    subcategory: "One-sample z-test right-tailed",
    sourceExam: "MathStat Exam 2024-06 (Extra drill)",
    originalProblemNumber: "E1",
    title: "Test mu>50 with known sigma",
    question: "n=40, x_bar=51, known sigma=8. Test H0:mu=50 vs H1:mu>50 at alpha=0.05.",
    formulasNeeded: ["Z=(x_bar-mu0)/(sigma/sqrt(n))", "Right-tail critical 1.645"],
    whyMethodApplies: "Known sigma means z-test; claim is right-tailed.",
    steps: [
      { title: "1) Statistic", detail: "Z=(51-50)/(8/sqrt(40))=0.79." },
      { title: "2) Critical rule", detail: "Reject if Z>1.645." },
      { title: "3) Decision", detail: "0.79<1.645, fail to reject H0." },
    ],
    finalAnswer: "Do not reject H0 at 5%.",
    difficulty: "easy",
    tags: ["hypothesis-test", "z-test", "right-tail"],
    commonMistake: "Using t-test although sigma is known.",
    examShortcut: "Known sigma + one sample -> z-test.",
    memorizeThis: "Right-tail alpha=0.05 critical z≈1.645.",
    patternHint: "Claim 'greater than' means right-tailed H1.",
  },
  {
    id: "test-extra-t-left-tail",
    category: "hypothesis-tests",
    subcategory: "One-sample t-test left-tailed",
    sourceExam: "MathStat Exam 2025-03 (Extra drill)",
    originalProblemNumber: "E2",
    title: "Test mu<80 with unknown sigma",
    question: "n=16, x_bar=74, s=10. Test H0:mu=80 vs H1:mu<80 at alpha=0.05.",
    formulasNeeded: ["T=(x_bar-mu0)/(s/sqrt(n))", "Left-tail critical -t_{0.95,15}"],
    whyMethodApplies: "Unknown sigma and small sample imply t-test.",
    steps: [
      { title: "1) Statistic", detail: "T=(74-80)/(10/4)=-2.4." },
      { title: "2) Critical value", detail: "For df=15, t_crit≈1.753; reject if T<-1.753." },
      { title: "3) Decision", detail: "-2.4<-1.753, reject H0." },
    ],
    finalAnswer: "Reject H0; evidence supports mu<80.",
    difficulty: "medium",
    tags: ["hypothesis-test", "t-test", "left-tail"],
    commonMistake: "Using z critical values for n=16 unknown sigma.",
    examShortcut: "Small n + unknown sigma => t directly.",
    memorizeThis: "Left-tail check is statistic less than negative cutoff.",
    patternHint: "Claim with 'below' maps to left-tail test.",
  },
  {
    id: "test-extra-proportion-two-sided",
    category: "hypothesis-tests",
    subcategory: "One-sample proportion z-test",
    sourceExam: "MathStat Exam 2022-03 (Extra drill)",
    originalProblemNumber: "E3",
    title: "Test p=0.5 against p!=0.5",
    question: "In sample n=100, observed p_hat=0.56. Test H0:p=0.5 vs H1:p!=0.5 at alpha=0.05.",
    formulasNeeded: ["Z=(p_hat-p0)/sqrt(p0(1-p0)/n)", "Two-sided critical ±1.96"],
    whyMethodApplies: "Large-sample proportion hypothesis test uses z-statistic under H0.",
    steps: [
      { title: "1) Statistic", detail: "Z=(0.56-0.5)/sqrt(0.25/100)=1.2." },
      { title: "2) Critical comparison", detail: "|1.2|<1.96." },
      { title: "3) Decision", detail: "Fail to reject H0." },
    ],
    finalAnswer: "No significant difference from p=0.5 at 5%.",
    difficulty: "easy",
    tags: ["hypothesis-test", "proportion", "two-sided"],
    commonMistake: "Using p_hat in denominator instead of p0 for test statistic.",
    examShortcut: "For tests, denominator uses H0 value.",
    memorizeThis: "Two-sided 5% critical z is ±1.96.",
    patternHint: "Null equality with proportion points to one-sample z proportion test.",
  },
  {
    id: "mle-extra-exponential-rate",
    category: "maximum-likelihood-estimation",
    subcategory: "MLE for exponential rate",
    sourceExam: "MathStat Exam 2024-06 (Extra drill)",
    originalProblemNumber: "E1",
    title: "Estimate lambda from sample mean",
    question: "For exponential model f(x)=lambda e^{-lambda x}, sample mean is 4. Find MLE of lambda.",
    formulasNeeded: ["lambda_hat = 1/x_bar for exponential rate parametrization"],
    whyMethodApplies: "This is direct MLE formula for exponential rate.",
    steps: [
      { title: "1) Recall MLE", detail: "For Exp(lambda), lambda_hat=1/x_bar." },
      { title: "2) Plug value", detail: "1/4=0.25." },
      { title: "3) State estimate", detail: "Rate estimate is 0.25." },
    ],
    finalAnswer: "lambda_hat=0.25",
    difficulty: "easy",
    tags: ["mle", "exponential", "rate"],
    commonMistake: "Confusing rate lambda with mean 1/lambda.",
    examShortcut: "Exponential rate MLE is reciprocal of sample mean.",
    memorizeThis: "Exp(lambda): E(X)=1/lambda.",
    patternHint: "If model is exponential and asks estimate, think 1/x_bar.",
  },
  {
    id: "mle-extra-bernoulli-p",
    category: "maximum-likelihood-estimation",
    subcategory: "MLE for Bernoulli/binomial probability",
    sourceExam: "MathStat Exam 2025-03 (Extra drill)",
    originalProblemNumber: "E2",
    title: "Estimate p from successes",
    question: "In n=30 Bernoulli trials, 18 are successes. Find MLE of p.",
    formulasNeeded: ["p_hat = x/n"],
    whyMethodApplies: "Bernoulli/binomial likelihood is maximized at sample proportion.",
    steps: [
      { title: "1) Identify x and n", detail: "x=18, n=30." },
      { title: "2) Apply MLE", detail: "p_hat=18/30=0.6." },
      { title: "3) Report", detail: "Estimated success probability is 0.6." },
    ],
    finalAnswer: "p_hat=0.6",
    difficulty: "easy",
    tags: ["mle", "bernoulli", "binomial"],
    commonMistake: "Using x/(n-1) by confusion with unbiased variance formula.",
    examShortcut: "For Bernoulli data, MLE is sample proportion.",
    memorizeThis: "p_hat=x/n.",
    patternHint: "Counts of successes almost always give p_hat directly.",
  },
  {
    id: "mle-extra-normal-variance-known-mean",
    category: "maximum-likelihood-estimation",
    subcategory: "MLE for variance with known mean",
    sourceExam: "MathStat Exam 2022-06 (Extra drill)",
    originalProblemNumber: "E3",
    title: "Estimate sigma^2 with known mu",
    question: "Assume Xi~N(mu,sigma^2) with known mu=4. Observations are 2,4,6. Find MLE of sigma^2.",
    formulasNeeded: ["sigma2_hat = (1/n) sum (xi-mu)^2 when mu known"],
    whyMethodApplies: "MLE for normal variance with known mean uses 1/n factor.",
    steps: [
      { title: "1) Squared deviations", detail: "(2-4)^2=4, (4-4)^2=0, (6-4)^2=4." },
      { title: "2) Sum and divide", detail: "(4+0+4)/3=8/3." },
      { title: "3) Final estimate", detail: "sigma2_hat≈2.667." },
    ],
    finalAnswer: "sigma2_hat=8/3≈2.667",
    difficulty: "medium",
    tags: ["mle", "normal", "variance"],
    commonMistake: "Using 1/(n-1) instead of MLE's 1/n.",
    examShortcut: "MLE variance for normal uses n in denominator.",
    memorizeThis: "Unbiased estimator and MLE are different for variance.",
    patternHint: "Known mu + normal data -> direct sigma^2 MLE formula.",
  },
];

export const threeDayCrashPlan: CrashPlanDay[] = [
  {
    day: "Day 1",
    focus: "High-yield foundations for quick points",
    goals: [
      "Master Standardization patterns: normal table workflow and linear normal combinations.",
      "Master Poisson process core formulas: counts, waiting times, thinning.",
      "Run Bayes/Total Probability drills for witness and diagnosis setups.",
    ],
    memorize: [
      "Z=(X-mu)/sigma, Phi(-z)=1-Phi(z), continuous point probability = 0.",
      "Poisson count and exponential waiting formulas, plus thinning lambda*p.",
      "Bayes fraction with full denominator branches.",
    ],
    drills: [
      "At least 8 questions from Standardization + Poisson categories.",
      "At least 4 Bayes questions with full branch tables.",
      "One 45-minute mixed timed set (focus on setup speed).",
    ],
    skipIfShortOnTime: [
      "Long derivations for unusual distributions.",
      "Any optional graph interpretation tasks not tied to core formulas.",
    ],
  },
  {
    day: "Day 2",
    focus: "Probability structure + inference blocks",
    goals: [
      "Lock in Combinatorics card-hand counting patterns.",
      "Lock in one-sample and two-sample two-sided confidence intervals.",
      "Practice Hypothesis tests: z-test vs t-test decisions and p-value interpretation.",
    ],
    memorize: [
      "Combination templates for suit/rank constraints.",
      "CI formulas for p and p-q with z=1.96 at 95%.",
      "Hypothesis workflow: H0/H1 -> statistic -> critical or p-value -> conclusion.",
    ],
    drills: [
      "6 combinatorics expression drills.",
      "4 CI drills (include at least 2 two-sample differences).",
      "4 hypothesis-test drills with explicit final decision sentence.",
    ],
    skipIfShortOnTime: [
      "Very long proof-style justification beyond exam scoring needs.",
      "Secondary subparts that repeat same calculation with small parameter changes.",
    ],
  },
  {
    day: "Day 3",
    focus: "Exam simulation and remaining topics",
    goals: [
      "Do CLT approximations for large-sample sums/counts.",
      "Review MLE and parameter estimation templates.",
      "Run full mixed timed practice and review weak points.",
    ],
    memorize: [
      "CLT scaling: sum mean n*mu, variance n*sigma^2.",
      "Binomial normal approximation mean/variance.",
      "MLE pattern: likelihood -> log-likelihood -> derivative zero.",
    ],
    drills: [
      "3 CLT problems + 3 MLE/estimation problems.",
      "One full 90-minute mixed exam simulation.",
      "Final rapid review of formula sheet and your marked review questions.",
    ],
    skipIfShortOnTime: [
      "Low-frequency derivations not seen repeatedly across exams.",
      "Deep theoretical proofs when practical step-by-step method is enough for points.",
    ],
  },
];

export const categoryOrder: CategorySlug[] = [
  "standardization",
  "poisson-process",
  "bayes-total-probability",
  "combinatorics",
  "confidence-intervals",
  "central-limit-theorem",
  "hypothesis-tests",
  "maximum-likelihood-estimation",
];

export const difficultyOrder = ["easy", "medium", "exam-like"] as const;

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return categoryDefinitions.find((category) => category.slug === slug);
}

export function getQuestionsForCategory(slug: CategorySlug): StudyQuestion[] {
  return studyQuestions.filter((question) => question.category === slug);
}

export function getQuestionById(id: string): StudyQuestion | undefined {
  return studyQuestions.find((question) => question.id === id);
}
