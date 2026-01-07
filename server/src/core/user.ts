import { type User } from "../objects/User";

export const users: Map<string, User> = new Map();

export function getUser(socket_id: string): User | undefined {
  return users.get(socket_id);
}

export function getUserByUsername(username: string): User | undefined {
  return [...users.values()].find((u) => u.name === username);
}
