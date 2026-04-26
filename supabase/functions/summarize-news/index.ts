const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, description, source } = await req.json();

    if (!title || typeof title !== "string") {
      return new Response(JSON.stringify({ error: "Falta el título de la noticia" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY no configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userContent = `Fuente: ${source ?? "desconocida"}
Titular: ${title}
Entradilla: ${description ?? "(sin descripción)"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Eres un periodista español. Analiza la noticia y devuelve un resumen estructurado en tres bloques claros, neutrales y en español de España. Si la información es insuficiente, indícalo brevemente en cada bloque. No incluyas titulares ni introducciones, solo el contenido de cada bloque.",
          },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "summarize_news_blocks",
              description:
                "Devuelve el resumen en tres bloques: qué pasó, por qué importa y qué puede pasar.",
              parameters: {
                type: "object",
                properties: {
                  what_happened: {
                    type: "string",
                    description:
                      "Qué pasó: resumen de los hechos en 2-3 frases breves y concretas.",
                  },
                  why_it_matters: {
                    type: "string",
                    description:
                      "Por qué importa: contexto e implicaciones en 2-3 frases.",
                  },
                  what_could_happen: {
                    type: "string",
                    description:
                      "Qué puede pasar ahora: posibles consecuencias o próximos pasos en 1-2 frases.",
                  },
                  read_seconds: {
                    type: "number",
                    description:
                      "Tiempo estimado de lectura del resumen completo en segundos (entre 30 y 120).",
                  },
                },
                required: [
                  "what_happened",
                  "why_it_matters",
                  "what_could_happen",
                  "read_seconds",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "summarize_news_blocks" },
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Has alcanzado el límite de uso. Inténtalo en unos minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Se han agotado los créditos de IA del workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const text = await response.text();
      console.error("AI gateway error", response.status, text);
      return new Response(JSON.stringify({ error: "Error al generar el resumen" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;

    let parsed: {
      what_happened?: string;
      why_it_matters?: string;
      what_could_happen?: string;
      read_seconds?: number;
    } = {};

    if (argsRaw) {
      try {
        parsed = JSON.parse(argsRaw);
      } catch (e) {
        console.error("No se pudo parsear el tool call", e, argsRaw);
      }
    }

    const fallbackText: string =
      data?.choices?.[0]?.message?.content?.trim() ?? "";

    const blocks = {
      what_happened: parsed.what_happened?.trim() || "",
      why_it_matters: parsed.why_it_matters?.trim() || "",
      what_could_happen: parsed.what_could_happen?.trim() || "",
      read_seconds:
        typeof parsed.read_seconds === "number" && parsed.read_seconds > 0
          ? Math.round(parsed.read_seconds)
          : 60,
    };

    // Texto plano por compatibilidad
    const summaryText =
      [blocks.what_happened, blocks.why_it_matters, blocks.what_could_happen]
        .filter(Boolean)
        .join("\n\n") || fallbackText;

    return new Response(JSON.stringify({ summary: summaryText, blocks }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("summarize-news error", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
