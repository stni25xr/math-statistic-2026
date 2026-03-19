const distributionMap: Record<string, string> = {
  N: "\\mathcal{N}",
  Poi: "\\mathrm{Poi}",
  Bin: "\\mathrm{Bin}",
  bin: "\\mathrm{Bin}",
  Exp: "\\mathrm{Exp}",
  exp: "\\mathrm{Exp}",
  geom: "\\mathrm{Geom}",
  t: "t",
};

const symbolMap: Array<[RegExp, string]> = [
  [/mu(?=_)/g, "\\mu"],
  [/sigma(?=_)/g, "\\sigma"],
  [/lambda(?=_)/g, "\\lambda"],
  [/Phi(?=_)/g, "\\Phi"],
  [/x_bar/g, "\\bar{x}"],
  [/p_hat/g, "\\hat{p}"],
  [/var(?=_)/g, "\\mathrm{Var}"],
  [/\bmu\b/g, "\\mu"],
  [/\bsigma\b/g, "\\sigma"],
  [/\blambda\b/g, "\\lambda"],
  [/\bPhi\b/g, "\\Phi"],
  [/\bCI\b/g, "\\mathrm{CI}"],
  [/\bH0\b/g, "H_0"],
  [/\bH1\b/g, "H_1"],
  [/<=/g, "\\le"],
  [/>=/g, "\\ge"],
  [/!=/g, "\\ne"],
  [/\*/g, "\\cdot "],
];

export const mathTokenRegex =
  /([A-Za-z]\s*~\s*(?:N|Poi|Bin|bin|Exp|exp|geom|t)\([^)]*\)|(?:N|Poi|Bin|bin|Exp|exp|geom|t)\([^)]*\)|P\([^)]*\)|Phi\([^)]*\)|[A-Za-z]+_[A-Za-z0-9]+|[A-Za-z]\^\d+)/g;

export function normalizeLatex(raw: string): string {
  let out = raw.trim();

  out = out.replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}");
  out = out.replace(/([A-Za-z])\^(\d+)/g, "$1^{$2}");
  out = out.replace(/\b([A-Za-z]+)\(([^()]*)\)/g, (token, name, args) => {
    const latexDist = distributionMap[name];
    if (!latexDist) {
      return token;
    }

    return `${latexDist}(${args})`;
  });

  for (const [pattern, replacement] of symbolMap) {
    out = out.replace(pattern, replacement);
  }

  return out;
}

export function plainToLatex(input: string): string {
  return normalizeLatex(input)
    .replace(/\bmean\b/gi, "\\mathrm{mean}")
    .replace(/\bvariance\b/gi, "\\mathrm{variance}")
    .replace(/\bprobability\b/gi, "\\mathrm{P}");
}
