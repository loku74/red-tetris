import { type User } from "@app/objects/User";

const users: Map<string, User> = new Map();

export function getUser(socket_id: string): User | undefined {
  return users.get(socket_id);
}

export function getUsers(): Map<string, User> {
  return users;
}

export function setUser(socket_id: string, user: User) {
  users.set(socket_id, user);
}

export function deleteUser(socket_id: string) {
  users.delete(socket_id);
}
