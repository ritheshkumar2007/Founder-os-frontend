import { createFileRoute } from "@tanstack/react-router";
import { processValidationTurn, VALIDATION_QUESTIONS } from "@/lib/founderos/validationEngine";
import type { ValidationState } from "@/lib/founderos/types";

interface Body {
  messages?: { role: "user" | "assistant"; content: string }[];
  page?: string;
  context?: string;
  validationState?: ValidationState;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const messages = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
        if (messages.length === 0) return new Response("Messages are required", { status: 400 });

        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
        const isValidationPage = !body.page || body.page === "idea-validation" || body.page === "workspace/idea-validation";
        const valState = body.validationState || {
          currentQuestion: 1,
          answers: {
            question1: null,
            question2: null,
            question3: null,
            question4: null,
            question5: null,
          },
          completed: false,
          score: null,
        };

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          // Reliable local validation engine fallback
          const localResult = processValidationTurn({
            userMessage: lastUserMsg,
            validationState: valState,
          });
          return Response.json({
            reply: localResult.reply,
            validationState: localResult.updatedState,
            ideaScore: localResult.updatedState.score,
          });
        }

        const currentQNum = Math.min(5, Math.max(1, valState.currentQuestion || 1));
        const currentQText = VALIDATION_QUESTIONS[currentQNum - 1];

        const system = isValidationPage
          ? [
              "You are the FounderOS Idea Validation Coach — a focused, no-fluff startup advisor whose only job right now is to help the founder validate their idea through five structured questions before they're allowed to move to MVP Scoping.",
              "",
              "## CURRENT VALIDATION STATE",
              `- Current Question: Question ${currentQNum} of 5 ("${currentQText}")`,
              `- Previously Accepted Answers:`,
              `  * Question 1: ${valState.answers?.question1 || "Not answered yet"}`,
              `  * Question 2: ${valState.answers?.question2 || "Not answered yet"}`,
              `  * Question 3: ${valState.answers?.question3 || "Not answered yet"}`,
              `  * Question 4: ${valState.answers?.question4 || "Not answered yet"}`,
              `  * Question 5: ${valState.answers?.question5 || "Not answered yet"}`,
              `- Validation Completed: ${valState.completed}`,
              "",
              "## THE 5 QUESTIONS (ask in this exact order, one per turn)",
              "1. What specific problem are you solving, and who has this problem?",
              "2. How are people solving this problem today?",
              "3. How often do customers face this problem, and how painful is it for them?",
              "4. Why would customers choose your solution over existing alternatives?",
              "5. What evidence do you have that customers will actually use or pay for your solution?",
              "",
              "## CONVERSATION RULES",
              "- The founder is answering Question " + currentQNum + ".",
              "- Ask one question at a time. Never dump all 5 at once. Wait for a real answer before moving to the next.",
              "- Evaluate every answer before advancing (is it specific? is it concrete? does it actually answer the question?).",
              "- If an answer is too vague, thin, or generic (e.g. 'everyone needs this', 'huge problem', 'no idea'), push back specifically with a sharper follow-up and stay on Question " + currentQNum + ".",
              "- Only advance once the current answer has real substance.",
              "- If the founder answers Question " + currentQNum + " with substance, acknowledge it briefly and ask Question " + (currentQNum + 1) + ".",
              "",
              "## GATING LOGIC (critical)",
              "- If the founder tries to skip ahead to MVP scope, roadmap, features, tech stack, or says 'let's move on' before all 5 questions are answered, do NOT comply. Respond with: 'Let's finish validating the idea first. We're still on Question " + currentQNum + " because this answer hasn't given us enough evidence yet.\n\n" + currentQText + "'.",
              "",
              body.context ? `Saved venture context:\n${body.context}` : "No venture data saved yet.",
            ].join("\n")
          : [
              "You are the AI Copilot for FounderOS — the operating system for building startups. You talk like a sharp, no-nonsense ops officer embedded inside a founder's workflow, not a customer support bot.",
              `The founder is currently on the "${body.page ?? "workspace"}" page.`,
              body.context ? `Saved venture context:\n${body.context}` : "No venture data saved yet.",
            ].join("\n");

        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-5.6-sol",
              reasoning_effort: "none",
              messages: [{ role: "system", content: system }, ...messages],
            }),
          });

          if (!res.ok) {
            const localResult = processValidationTurn({
              userMessage: lastUserMsg,
              validationState: valState,
            });
            return Response.json({
              reply: localResult.reply,
              validationState: localResult.updatedState,
              ideaScore: localResult.updatedState.score,
            });
          }

          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };

          const replyContent = data.choices?.[0]?.message?.content ?? "";
          const localResult = processValidationTurn({
            userMessage: lastUserMsg,
            validationState: valState,
          });

          return Response.json({
            reply: replyContent || localResult.reply,
            validationState: localResult.updatedState,
            ideaScore: localResult.updatedState.score,
          });
        } catch {
          const localResult = processValidationTurn({
            userMessage: lastUserMsg,
            validationState: valState,
          });
          return Response.json({
            reply: localResult.reply,
            validationState: localResult.updatedState,
            ideaScore: localResult.updatedState.score,
          });
        }
      },
    },
  },
});