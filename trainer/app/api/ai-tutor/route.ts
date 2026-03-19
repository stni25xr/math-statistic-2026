import { NextRequest, NextResponse } from "next/server";

interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

interface TutorRequestBody {
  questionId?: string;
  questionText?: string;
  questionType?: string;
  formulasNeeded?: string[];
  conversation?: TutorMessage[];
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_ITEMS = 10;

const FORMULA_SHEET_STYLE = `
Use this notation style:
- mu, sigma, lambda, Phi should be written as μ, σ, λ, Φ.
- Normal: X ~ N(μ, σ²)
- Binomial: X ~ Bin(n, p)
- Poisson: N(t) ~ Poi(λt)
- Standardization: Z = (X - μ) / σ
- Confidence interval symbols: x̄, p̂, H0, H1
`;

const TABLE_QUICK_REFERENCES = `
Use standard table values when needed:
- Φ(1.28) ≈ 0.900
- Φ(1.64) ≈ 0.949
- Φ(1.65) ≈ 0.950
- Φ(1.96) ≈ 0.975
- 95% two-sided z critical: 1.96
- 90% two-sided z critical: 1.645
If a t critical value is needed, say which df is required.
`;

function sanitizeConversation(input: TutorMessage[] | undefined): TutorMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter(
      (item): item is TutorMessage =>
        (item?.role === "user" || item?.role === "assistant") &&
        typeof item?.content === "string" &&
        item.content.trim().length > 0,
    )
    .slice(-MAX_CONVERSATION_ITEMS)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 },
    );
  }

  let body: TutorRequestBody;
  try {
    body = (await request.json()) as TutorRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const questionText = (body.questionText ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);
  const questionType = (body.questionType ?? "").trim().slice(0, 200);
  const formulasNeeded = Array.isArray(body.formulasNeeded)
    ? body.formulasNeeded
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];
  const conversation = sanitizeConversation(body.conversation);

  if (!questionText) {
    return NextResponse.json(
      { error: "questionText is required" },
      { status: 400 },
    );
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const messages = [
    {
      role: "system",
      content:
        "You are a Mathematical Statistics exam tutor. Be beginner-friendly and exact. " +
        "Always answer using this order: Let/define symbols -> Given -> Formula -> Substitute -> Compute -> Answer. " +
        "Use notation from the formula sheet style and table references provided. " +
        "Do not skip algebra steps. Keep each step short and explicit.",
    },
    {
      role: "system",
      content: `${FORMULA_SHEET_STYLE}\n${TABLE_QUICK_REFERENCES}`,
    },
    {
      role: "system",
      content:
        `Question context:\n` +
        `- Type: ${questionType || "N/A"}\n` +
        `- Question: ${questionText}\n` +
        `- Candidate formulas: ${formulasNeeded.length > 0 ? formulasNeeded.join(" | ") : "N/A"}`,
    },
    ...conversation.map((item) => ({
      role: item.role,
      content: item.content,
    })),
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenAI API error: ${errorText}` },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "Empty model reply" },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
