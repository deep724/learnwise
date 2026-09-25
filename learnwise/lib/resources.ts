import type { Resource } from "../types";
import { topics } from "../data/topics";
export function resourceErrors(
  resource: Resource,
): Partial<Record<keyof Resource, string>> {
  const errors: Partial<Record<keyof Resource, string>> = {};
  if (!resource.title.trim()) errors.title = "Add a title.";
  else if (resource.title.trim().length > 120)
    errors.title = "Use at most 120 characters.";
  if (!resource.description.trim())
    errors.description = "Describe what this resource teaches.";
  else if (resource.description.trim().length > 600)
    errors.description = "Use at most 600 characters.";
  if (!resource.content.trim())
    errors.content = "Add lesson content or a worked example.";
  if (
    !Number.isInteger(resource.minutes) ||
    resource.minutes < 1 ||
    resource.minutes > 240
  )
    errors.minutes = "Enter a whole number from 1 to 240 minutes.";
  if (!topics.some((t) => t.id === resource.topic))
    errors.topic = "Select a DBMS topic.";
  if (
    !["Lesson", "Worked example", "Practice exercise"].includes(resource.type)
  )
    errors.type = "Select a resource type.";
  if (!["Beginner", "Intermediate"].includes(resource.difficulty))
    errors.difficulty = "Select a difficulty.";
  return errors;
}
