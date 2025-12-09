export class User {
  constructor(
    public id: string,
    public name: string
  ) {}
}

export const users: Record<string, User> = {};
