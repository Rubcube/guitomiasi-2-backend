import { ZodIssue } from "zod";

type PossibleFieldIssues =
  | "MISSING"
  | "FORMAT"
  | "LENGTH"
  | "VALUE"
  | "UNKNOWN";

export type FieldError = {
  fieldName: string[];
  issue: PossibleFieldIssues;
};

export function fromZodIssue(zIssue: ZodIssue): FieldError {
  if (zIssue.code === "too_big" || zIssue.code === "too_small") {
    if (zIssue.type === "string") {
      return {
        fieldName: zIssue.path,
        issue: "LENGTH",
      } as FieldError;
    }

    if (zIssue.type === "number") {
      return {
        fieldName: zIssue.path,
        issue: "VALUE",
      } as FieldError;
    }
  }

  if (zIssue.code === "invalid_string") {
    return {
      fieldName: zIssue.path,
      issue: "FORMAT",
    } as FieldError;
  }

  if (zIssue.code === "invalid_type" && zIssue.received === "undefined") {
    return {
      fieldName: zIssue.path,
      issue: "MISSING",
    } as FieldError;
  }

  if (zIssue.code === "custom" || zIssue.code === "invalid_enum_value") {
    return {
      fieldName: zIssue.path,
      issue: "VALUE",
    } as FieldError;
  }

  return {
    fieldName: zIssue.path,
    issue: "UNKNOWN",
  } as FieldError;
}
