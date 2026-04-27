"use server"

import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { createTask } from './task-actions';

const API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

function getEndpoints(): string[] {
  const envEndpoints = process.env.AI_API_URLS;
  if (envEndpoints) {
    return envEndpoints.split(',').map(u => u.trim()).filter(u => u.length > 0);
  }
  const singleUrl = process.env.AI_API_URL || process.env.OPENAI_API_URL;
  if (singleUrl) return [singleUrl];
  throw new Error("AI_API_URLS or AI_API_URL is not configured in .env");
}

function getModels(): string[] {
  const envModels = process.env.AI_MODELS;
  if (envModels) {
    return envModels.split(',').map(m => m.trim()).filter(m => m.length > 0);
  }
  throw new Error("AI_MODELS is not configured in .env");
}

const API_URLS = getEndpoints();
const MODELS = getModels();

function extractJSON(content: string) {
const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim().replace(/```json\n?|```/g, "").trim();

try {
return JSON.parse(cleaned);
} catch {
const start = cleaned.indexOf('{');
const end = cleaned.lastIndexOf('}');
if (start !== -1 && end !== -1 && end > start) {
const jsonSnippet = cleaned.substring(start, end + 1);
try {
return JSON.parse(jsonSnippet);
} catch {
throw new Error("AI returned malformed JSON.");
}
}
throw new Error("Could not find valid JSON in AI response.");
}
}

async function callAI(systemPrompt: string, userPrompt: string) {
if (!API_KEY) throw new Error("AI_API_KEY (or OPENAI_API_KEY) is not configured.");

let lastError: unknown = null;
  
  for (const apiUrl of API_URLS) {
    for (const model of MODELS) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stream: false,
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ]
          }),
        });

        if (response.status === 429) continue;
        if (!response.ok) continue;

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (err) {
        lastError = err;
        continue;
      }
    }
  }
  
  throw new Error(lastError instanceof Error ? lastError.message : "All AI endpoints and models unavailable.");
}

async function getTaskContext(taskId: string) {
const task = await db.query.tasks.findFirst({
where: eq(tasks.id, taskId),
with: {
list: {
with: {
board: {
with: {
workspace: {
with: {
boards: true
}
}
}
}
}
}
}
});
return task;
}

interface TaskContext {
  title: string;
  description: string | null;
  labels: string[] | null;
  dueDate: string | null;
  list: {
    board: {
      id: string;
      name: string;
      workspace: {
        name: string;
        slug: string;
        description: string | null;
        boards: { id: string; name: string }[];
      };
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatContextPrompt(task: any) {
  const t = task as TaskContext;
  const workspace = t.list.board.workspace;
  const board = t.list.board;
  const otherBoards = workspace.boards
    .filter((b: { id: string; name: string }) => b.id !== board.id)
    .map((b: { id: string; name: string }) => b.name)
    .join(', ');

  return `Workspace Context:
  - Name: ${workspace.name}
  - Slug: ${workspace.slug}
  - Description: ${workspace.description || "N/A"}
  - Other Boards in Workspace: ${otherBoards || "None"}

  Board Context:
  - Name: ${board.name}

  Task Context:
  - Title: ${task.title}
  - Current Description: ${task.description || "None"}
  - Current Labels: ${task.labels?.join(', ') || "None"}
  - Due Date: ${task.dueDate || "Not set"}`;
}

export async function aiMakeTaskPerfect(taskId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const task = await getTaskContext(taskId);
    if (!task) return { success: false, error: "Task not found" };

    const systemPrompt = `You are a project optimization expert. Use the provided workspace and board context to tailor your suggestions. Propose a professional title, expanded description, 3-5 labels, and 4-6 sub-tasks.
    Respond with NOTHING except a JSON object:
    {
    "title": "Optimized Title",
    "description": "Expanded description...",
    "labels": ["label1", "label2", ...],
    "subtasks": ["subtask 1", "subtask 2", ...],
    "suggestedDueDate": "YYYY-MM-DD"
    }`;

    const userPrompt = formatContextPrompt(task);
    const response = await callAI(systemPrompt, userPrompt);
    const data = extractJSON(response);

return { success: true, data };
} catch (error: unknown) {
return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
}
}

export async function aiRewriteTask(taskId: string, tone: 'professional' | 'concise' | 'friendly') {
const session = await getSession();
if (!session) return { success: false, error: "Unauthorized" };

try {
const task = await getTaskContext(taskId);
if (!task) return { success: false, error: "Task not found" };

const systemPrompt = `Rewrite this task to be ${tone}. Use the provided workspace and board context for tone and relevance. Respond with NOTHING except JSON: { "title": "...", "description": "..." }`;
const userPrompt = formatContextPrompt(task);
const response = await callAI(systemPrompt, userPrompt);
const data = extractJSON(response);

return { success: true, data };
} catch (error: unknown) {
return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
}
}

export async function aiWriteStatusUpdate(taskId: string) {
const session = await getSession();
if (!session) return { success: false, error: "Unauthorized" };

try {
const task = await getTaskContext(taskId);
if (!task) return { success: false, error: "Task not found" };

const systemPrompt = `Write a professional status update. Use the workspace and board context to make it relevant to the project. Respond with NOTHING except JSON: { "update": "markdown text" }`;
const userPrompt = formatContextPrompt(task);
const response = await callAI(systemPrompt, userPrompt);
const data = extractJSON(response);

return { success: true, update: data.update };
} catch (error: unknown) {
return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
}
}

export async function aiSuggestTags(taskId: string) {
const session = await getSession();
if (!session) return { success: false, error: "Unauthorized" };

try {
const task = await getTaskContext(taskId);
if (!task) return { success: false, error: "Task not found" };

const systemPrompt = `Suggest 4-7 relevant labels. Map urgency to "Red", "Yellow", "Green", "Blue", or "Purple". Use workspace/board context for relevance. Respond with NOTHING except JSON: {"tags": ["Tag1", ...]}`;
const userPrompt = formatContextPrompt(task);
const response = await callAI(systemPrompt, userPrompt);
const { tags } = extractJSON(response);

return { success: true, tags };
} catch (error: unknown) {
return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
}
}

export async function createBatchSubtasks(parentId: string, listId: string, titles: string[]) {
  const session = await getSession();
  if (!session) return { success: false };

  const created = [];
  for (let i = 0; i < titles.length; i++) {
    const res = await createTask(titles[i], listId, i, parentId);
    if (res.success && res.task) created.push(res.task);
  }
  return { success: true, subtasks: created };
}