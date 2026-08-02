const allowedReceiptMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxReceiptFileSizeBytes = 10 * 1024 * 1024;

type ReceiptOcrResult = {
  confidence: "high" | "low" | "medium";
  lines: Array<{
    description: string;
    lineTotal?: number | null;
    quantity?: number | null;
    unitPrice?: number | null;
  }>;
  merchantName?: string | null;
  purchaseDate?: string | null;
  rawText?: string | null;
  totalCost?: number | null;
  warnings: string[];
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json"
    },
    status
  });
}

function getStringFromResponsePayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeOutputText = (payload as { output_text?: unknown }).output_text;

  if (typeof maybeOutputText === "string") {
    return maybeOutputText;
  }

  const output = (payload as { output?: unknown }).output;

  if (!Array.isArray(output)) {
    return null;
  }

  for (const outputItem of output) {
    const content = (outputItem as { content?: unknown }).content;

    if (!Array.isArray(content)) {
      continue;
    }

    for (const contentItem of content) {
      const text = (contentItem as { text?: unknown }).text;

      if (typeof text === "string") {
        return text;
      }
    }
  }

  return null;
}

function parseReceiptResult(value: string): ReceiptOcrResult {
  const parsed = JSON.parse(value) as Partial<ReceiptOcrResult>;

  return {
    confidence:
      parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
        ? parsed.confidence
        : "low",
    lines: Array.isArray(parsed.lines) ? parsed.lines : [],
    merchantName: parsed.merchantName ?? null,
    purchaseDate: parsed.purchaseDate ?? null,
    rawText: parsed.rawText ?? null,
    totalCost: parsed.totalCost ?? null,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : []
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:${file.type};base64,${btoa(binary)}`;
}

async function isAuthenticatedRequest(request: Request): Promise<boolean> {
  const authorization = request.headers.get("Authorization");
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!authorization?.startsWith("Bearer ") || !supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  const response = await fetch(`${supabaseUrl.replace(/\/+$/g, "")}/auth/v1/user`, {
    headers: {
      Authorization: authorization,
      apikey: supabaseAnonKey
    }
  }).catch(() => null);

  return Boolean(response?.ok);
}

export const config = {
  runtime: "edge"
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  if (!(await isAuthenticatedRequest(request))) {
    return jsonResponse({ error: "Receipt OCR requires a signed-in purchaser session." }, 401);
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonResponse({ error: "Receipt OCR is not configured for this environment." }, 503);
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("receipt");

  if (!(file instanceof File)) {
    return jsonResponse({ error: "Receipt photo is required." }, 400);
  }

  if (!allowedReceiptMimeTypes.has(file.type)) {
    return jsonResponse({ error: "Receipt OCR supports JPEG, PNG, or WebP images." }, 400);
  }

  if (file.size <= 0) {
    return jsonResponse({ error: "Receipt photo is empty." }, 400);
  }

  if (file.size > maxReceiptFileSizeBytes) {
    return jsonResponse({ error: "Receipt photo must be 10 MB or smaller." }, 400);
  }

  const model = process.env.OPENAI_RECEIPT_OCR_MODEL ?? "gpt-4.1-mini";
  const imageUrl = await fileToDataUrl(file);

  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: [
        {
          content: [
            {
              text: "Extract this purchase receipt for finance review. Return only JSON matching the schema. Do not guess missing values. Use YYYY-MM-DD for dates. Lines are suggestions for human review and must not imply inventory mutation.",
              type: "input_text"
            },
            {
              detail: "high",
              image_url: imageUrl,
              type: "input_image"
            }
          ],
          role: "user"
        }
      ],
      model,
      text: {
        format: {
          name: "receipt_ocr_result",
          schema: {
            additionalProperties: false,
            properties: {
              confidence: {
                enum: ["high", "medium", "low"],
                type: "string"
              },
              lines: {
                items: {
                  additionalProperties: false,
                  properties: {
                    description: { type: "string" },
                    lineTotal: { type: ["number", "null"] },
                    quantity: { type: ["number", "null"] },
                    unitPrice: { type: ["number", "null"] }
                  },
                  required: ["description", "lineTotal", "quantity", "unitPrice"],
                  type: "object"
                },
                type: "array"
              },
              merchantName: { type: ["string", "null"] },
              purchaseDate: { type: ["string", "null"] },
              rawText: { type: ["string", "null"] },
              totalCost: { type: ["number", "null"] },
              warnings: {
                items: { type: "string" },
                type: "array"
              }
            },
            required: [
              "confidence",
              "lines",
              "merchantName",
              "purchaseDate",
              "rawText",
              "totalCost",
              "warnings"
            ],
            type: "object"
          },
          strict: true,
          type: "json_schema"
        }
      }
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    return jsonResponse({ error: "Receipt OCR provider failed." }, 502);
  }

  const payload = (await response.json()) as unknown;
  const outputText = getStringFromResponsePayload(payload);

  if (!outputText) {
    return jsonResponse({ error: "Receipt OCR returned no readable output." }, 502);
  }

  try {
    return jsonResponse({ result: parseReceiptResult(outputText) });
  } catch {
    return jsonResponse({ error: "Receipt OCR returned invalid structured output." }, 502);
  }
}
