require("dotenv").config();

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

/*
 * =========================================================
 * OPENROUTER MODELS
 * =========================================================
 */

const MODEL =
  process.env.OPENROUTER_MODEL ||
  "google/gemma-4-26b-a4b-it:free";

const FALLBACK_MODELS = [
  MODEL,
  "google/gemma-4-31b-it:free",
  "openrouter/free",
];

/*
 * Remove duplicate models while preserving order.
 */
const UNIQUE_MODELS = [
  ...new Set(FALLBACK_MODELS),
];

/*
 * =========================================================
 * EXTRACT TEXT FROM OPENROUTER RESPONSE
 * =========================================================
 */

function getTextFromResponse(data) {
  const content =
    data?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        return (
          part?.text ||
          part?.content ||
          ""
        );
      })
      .join("\n");
  }

  return "";
}

/*
 * =========================================================
 * OPENROUTER REQUEST
 * =========================================================
 */

async function callOpenRouter(
  messages,
  maxTokens = 1000
) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is missing from server/.env"
    );
  }

  if (
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    throw new Error(
      "OpenRouter requires at least one message."
    );
  }

  /*
   * OpenRouter supports model fallback using the
   * "models" array.
   */
  const body = {
    models: UNIQUE_MODELS,

    messages,

    max_tokens: Number(maxTokens) || 1000,
  };

  console.log(
    "[OPENROUTER] Trying models:",
    UNIQUE_MODELS
  );

  let response;

  try {
    response = await fetch(
      OPENROUTER_URL,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json",

          "HTTP-Referer":
            process.env.CLIENT_ORIGIN ||
            "http://localhost:5173",

          "X-Title":
            "Kheti Panel",
        },

        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error(
      "[OPENROUTER] Network error:",
      error.message
    );

    throw new Error(
      `Unable to connect to OpenRouter: ${error.message}`
    );
  }

  /*
   * Safely parse response.
   */
  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error(
      `OpenRouter returned an invalid response (HTTP ${response.status}).`
    );
  }

  /*
   * =======================================================
   * ERROR HANDLING
   * =======================================================
   */

  if (!response.ok) {
    console.error(
      "\n===================================="
    );

    console.error(
      "[OPENROUTER ERROR]"
    );

    console.error(
      "HTTP Status:",
      response.status
    );

    console.error(
      "Response:",
      JSON.stringify(
        data,
        null,
        2
      )
    );

    console.error(
      "====================================\n"
    );

    const errorMessage =
      data?.error?.message ||
      data?.error?.metadata?.raw ||
      data?.message ||
      `OpenRouter request failed with status ${response.status}`;

    throw new Error(
      errorMessage
    );
  }

  /*
   * =======================================================
   * SUCCESS
   * =======================================================
   */

  console.log(
    "[OPENROUTER] Successful model:",
    data?.model || "unknown"
  );

  const text =
    getTextFromResponse(data);

  if (!text.trim()) {
    throw new Error(
      "OpenRouter returned an empty model response."
    );
  }

  return data;
}

/*
 * =========================================================
 * NORMALIZE TEXT REQUEST
 * =========================================================
 *
 * IMPORTANT:
 *
 * This function supports BOTH formats:
 *
 * 1. New format:
 *
 * askHuggingFace(
 *   [
 *     { role: "system", content: "..." },
 *     { role: "user", content: "..." }
 *   ],
 *   700
 * )
 *
 * 2. Old format:
 *
 * askHuggingFace({
 *   system: "...",
 *   userText: "...",
 *   maxTokens: 700
 * })
 *
 * This prevents controller/client mismatch.
 * =========================================================
 */

function normalizeTextRequest(
  messagesOrOptions,
  maxTokens
) {
  /*
   * New controller format
   */
  if (
    Array.isArray(
      messagesOrOptions
    )
  ) {
    return {
      messages:
        messagesOrOptions,

      maxTokens:
        Number(maxTokens) || 1000,
    };
  }

  /*
   * Old object format
   */
  if (
    messagesOrOptions &&
    typeof messagesOrOptions === "object"
  ) {
    const {
      system = "",
      userText = "",
      maxTokens: optionsMaxTokens = 1000,
    } = messagesOrOptions;

    return {
      messages: [
        {
          role: "system",
          content: system,
        },

        {
          role: "user",
          content: userText,
        },
      ],

      maxTokens:
        Number(optionsMaxTokens) || 1000,
    };
  }

  throw new Error(
    "Invalid askHuggingFace request format."
  );
}

/*
 * =========================================================
 * TEXT-ONLY AI REQUEST
 * =========================================================
 */

async function askHuggingFace(
  messagesOrOptions,
  maxTokens
) {
  const {
    messages,
    maxTokens: finalMaxTokens,
  } =
    normalizeTextRequest(
      messagesOrOptions,
      maxTokens
    );

  const data =
    await callOpenRouter(
      messages,
      finalMaxTokens
    );

  return getTextFromResponse(data);
}

/*
 * =========================================================
 * IMAGE + TEXT AI REQUEST
 * =========================================================
 *
 * Used by Disease Scanner.
 * =========================================================
 */

async function askHuggingFaceWithImage({
  system,
  instruction,
  base64Data,
  mediaType,
  maxTokens = 1000,
}) {
  if (!base64Data) {
    throw new Error(
      "Image data is missing."
    );
  }

  if (!mediaType) {
    throw new Error(
      "Image media type is missing."
    );
  }

  const imageDataUrl =
    `data:${mediaType};base64,${base64Data}`;

  const data =
    await callOpenRouter(
      [
        {
          role: "system",
          content:
            system || "",
        },

        {
          role: "user",

          content: [
            {
              type: "text",
              text:
                instruction || "",
            },

            {
              type: "image_url",

              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],

      Number(maxTokens) || 1000
    );

  return getTextFromResponse(data);
}

/*
 * =========================================================
 * LOOSE JSON PARSER
 * =========================================================
 *
 * Handles:
 *
 * {
 *   ...
 * }
 *
 * and:
 *
 * ```json
 * {
 *   ...
 * }
 * ```
 *
 * and model responses containing text around JSON.
 * =========================================================
 */

function parseJSONLoose(text) {
  const raw =
    String(text || "")
      .trim();

  if (!raw) {
    throw new Error(
      "Model returned an empty response."
    );
  }

  /*
   * Remove markdown code fences.
   */
  const cleaned =
    raw
      .replace(
        /```json/gi,
        ""
      )
      .replace(
        /```/g,
        ""
      )
      .trim();

  /*
   * First attempt:
   * entire response is JSON.
   */
  try {
    return JSON.parse(
      cleaned
    );
  } catch (_) {
    // Continue to extraction.
  }

  /*
   * Find the first JSON object.
   */
  const start =
    cleaned.indexOf("{");

  const end =
    cleaned.lastIndexOf("}");

  if (
    start === -1 ||
    end === -1 ||
    end <= start
  ) {
    throw new Error(
      "Model response did not contain a JSON object"
    );
  }

  const jsonText =
    cleaned.slice(
      start,
      end + 1
    );

  try {
    return JSON.parse(
      jsonText
    );
  } catch (error) {
    console.error(
      "[JSON PARSER] Invalid JSON:",
      jsonText
    );

    throw new Error(
      `Model returned invalid JSON: ${error.message}`
    );
  }
}

/*
 * =========================================================
 * EXPORTS
 * =========================================================
 */

module.exports = {
  askHuggingFace,
  askHuggingFaceWithImage,
  parseJSONLoose,
};