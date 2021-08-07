import { User } from "../../model/User";
import { IUsersRepository } from "../../repositories/IUsersRepository";

interface IRequest {
  name: string;
  email: string;
}

class CreateUserUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  execute({ email, name }: IRequest): User {
    const userByEmailAlreadyExists = this.usersRepository.findByEmail(email);

    if (userByEmailAlreadyExists) {
      throw new Error("Já existe um usuário com este email!");
    }

    return this.usersRepository.create({ email, name });
  }
}

export { CreateUserUseCase };
