import { v4 as uuidV4 } from "uuid";

class User {
  id: string;

  name: string;

  admin: boolean;

  email: string;

  createdAt: Date;

  updatedAt: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
      this.admin = false;
    }
  }
}

export { User };
