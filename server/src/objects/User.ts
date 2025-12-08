export class User {
  constructor(public name: string) {}
}

export const users: Record<string, User> = {};
