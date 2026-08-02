import type {
  CreateClassInput,
  CreateTeacherInput,
  SchoolClass,
  Teacher,
} from "./types";

export class ApiError extends Error {}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(body?.error ?? "Something went wrong. Please try again.");
  }

  return body as T;
}

export function getTeachers(): Promise<{ data: Teacher[] }> {
  return request("/teachers");
}

export function getTeacher(id: string): Promise<Teacher> {
  return request(`/teachers/${id}`);
}

export function createTeacher(input: CreateTeacherInput): Promise<Teacher> {
  return request("/teachers", { method: "POST", body: JSON.stringify(input) });
}

export function updateTeacher(id: string, input: CreateTeacherInput): Promise<Teacher> {
  return request(`/teachers/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteTeacher(id: string): Promise<void> {
  return request(`/teachers/${id}`, { method: "DELETE" });
}

export function getClasses(): Promise<{ data: SchoolClass[] }> {
  return request("/classes");
}

export function getClass(id: string): Promise<SchoolClass> {
  return request(`/classes/${id}`);
}

export function createClass(input: CreateClassInput): Promise<SchoolClass> {
  return request("/classes", { method: "POST", body: JSON.stringify(input) });
}

export function updateClass(id: string, input: CreateClassInput): Promise<SchoolClass> {
  return request(`/classes/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteClass(id: string): Promise<void> {
  return request(`/classes/${id}`, { method: "DELETE" });
}
