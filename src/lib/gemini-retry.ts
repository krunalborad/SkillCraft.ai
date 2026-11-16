// Retries temporary Gemini failures (503 overloaded, 429 rate limit, 500, 504)
// with a short backoff, then falls back to the next model in the list.
// Timeouts and network errors are treated like a temporary failure, so one
// hung request never blocks the whole chain.

const RETRYABLE = new Set([429, 500, 503, 504]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class GeminiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * @param models           Models to try in order, e.g. ["gemini-2.5-flash", "gemini-2.5-flash-lite"]
 * @param makeRequest      Receives a model name and returns the fetch() Response for that model
 * @param retriesPerModel  Extra attempts per model before moving to the next one (default 1)
 */
export async function callGeminiWithFallback(
  models: string[],
  makeRequest: (model: string) => Promise<Response>,
  retriesPerModel = 1,
): Promise<Response> {
  let lastStatus = 500;
  let lastBody = "";

  for (const model of models) {
    for (let attempt = 0; attempt <= retriesPerModel; attempt++) {
      let res: Response;

      try {
        res = await makeRequest(model);
      } catch (err) {
        // Timeout (AbortSignal.timeout) or network failure: move to the next model
        // instead of waiting and retrying the same slow one.
        const name = err instanceof Error ? err.name : "";
        lastStatus = name === "TimeoutError" || name === "AbortError" ? 504 : 500;
        lastBody = err instanceof Error ? err.message : String(err);
        console.error(`Gemini ${model} request error (attempt ${attempt + 1}): ${lastBody}`);
        break;
      }

      if (res.ok) return res;

      lastStatus = res.status;
      lastBody = await res.text().catch(() => "");
      console.error(`Gemini ${model} failed (attempt ${attempt + 1}): ${res.status} ${lastBody}`);

      // Unknown model name: skip straight to the next model in the list.
      if (res.status === 404 && models.length > 1) break;

      // Other non-temporary errors (400, 401, 403) will not fix themselves.
      if (!RETRYABLE.has(res.status)) {
        throw new GeminiError(res.status, lastBody);
      }

      if (attempt < retriesPerModel) {
        await sleep(800 * 2 ** attempt + Math.random() * 300);
      }
    }
  }

  throw new GeminiError(lastStatus, lastBody);
}

export function friendlyGeminiMessage(err: unknown): string {
  const status = err instanceof GeminiError ? err.status : 0;
  if (status === 503) return "The AI is busy right now. Please try again in a minute.";
  if (status === 429) return "AI usage limit reached. Please wait a bit and try again.";
  if (status === 401 || status === 403) return "AI key problem. Check your Gemini API key.";
  if (status === 404) return "AI model not found. Check the model name.";
  if (status === 504) return "The AI took too long to respond. Please try again.";
  return "AI service error. Please try again.";
}