import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { HttpError } from "./httpError.js";

type GenerateInput = {
  topic: string;
  tone: string;
  length: "short" | "medium" | "long";
};

const lengthGuide = {
  short: "700-900 words",
  medium: "1200-1600 words",
  long: "2000-2600 words"
};

function fallbackBlogPost(input: GenerateInput) {
  const normalizedTopic = input.topic.trim();
  const tags = Array.from(
    new Set(
      normalizedTopic
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .slice(0, 5)
    )
  );

  return {
    title: `${normalizedTopic}: A Practical Guide`,
    metaDescription: `A ${input.tone} guide to ${normalizedTopic}, with practical steps, examples, and implementation tips.`,
    tags: tags.length ? tags : ["blog", "guide", "productivity"],
    content: `# ${normalizedTopic}: A Practical Guide

## Introduction

${normalizedTopic} is easier to approach when you break the work into clear decisions, small milestones, and measurable outcomes. This draft gives you a strong starting structure that you can refine for your audience.

## Why It Matters

Readers usually care about three things: what problem is being solved, why the approach is trustworthy, and how they can apply it without getting lost. Keep the article focused on those needs.

## A Practical Workflow

1. Define the audience and the exact outcome they want.
2. List the constraints, tools, and assumptions.
3. Walk through the implementation or decision process step by step.
4. Add examples that show the idea in motion.
5. End with next steps and common pitfalls.

## Example Structure

| Section | Purpose |
| --- | --- |
| Introduction | Establish the reader's problem |
| Main steps | Explain the solution clearly |
| Examples | Make the advice concrete |
| Conclusion | Summarize and guide the next action |

## Common Mistakes

- Trying to cover too many unrelated ideas.
- Skipping context before giving instructions.
- Making claims without examples.
- Ending without a clear takeaway.

## Conclusion

Use this as a working draft: tighten the examples, add your own experience, and make the recommendations specific to the reader you want to help.
`
  };
}

export async function generateBlogPost(input: GenerateInput) {
  if (!env.GEMINI_API_KEY) {
    if (env.AI_DEMO_FALLBACK) return fallbackBlogPost(input);
    throw new HttpError(500, "Gemini API key is not configured");
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });

  const prompt = `
You are an expert editorial strategist and technical blog writer.
Generate a high-quality blog post for this topic: "${input.topic}".

Tone: ${input.tone}
Target length: ${lengthGuide[input.length]}

Return strict JSON only, with no markdown fence and no commentary:
{
  "title": "SEO-friendly title under 70 characters",
  "metaDescription": "Compelling meta description under 160 characters",
  "content": "Full GitHub-flavored Markdown article with headings, lists, examples, and a practical conclusion",
  "tags": ["4", "to", "7", "lowercase", "tags"]
}

Content requirements:
- Start with an engaging introduction.
- Use H2 and H3 headings.
- Include concrete examples and practical advice.
- Avoid generic filler and unsupported claims.
- Use tables only when they genuinely improve scanability.
- Do not include frontmatter.
`;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed";
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      if (env.AI_DEMO_FALLBACK) return fallbackBlogPost(input);
      throw new HttpError(
        429,
        "Gemini quota exceeded for this API key. Check Google AI Studio billing/quota, use a different key, or choose another available Gemini model."
      );
    }
    if (message.includes("404") || message.includes("not found")) {
      throw new HttpError(
        502,
        `Gemini model '${env.GEMINI_MODEL}' is not available for this API key. Update GEMINI_MODEL in backend/.env.`
      );
    }
    throw new HttpError(502, "Gemini request failed. Check the API key, model name, and network access.");
  }
  const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, "");

  try {
    return JSON.parse(text) as {
      title: string;
      metaDescription: string;
      content: string;
      tags: string[];
    };
  } catch {
    throw new HttpError(502, "Gemini returned an invalid response");
  }
}
