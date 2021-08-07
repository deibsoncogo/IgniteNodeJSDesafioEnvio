import { User } from "../../model/User";
import { IUsersRepository } from "../../repositories/IUsersRepository";

interface IRequest {
  userId: string;
}

class ListAllUsersUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  execute({ userId }: IRequest): User[] {
    const user = this.usersRepository.findById(userId);

    if (!user) {
      throw new Error("Não existe um usuário com este ID!");
    }

    if (!user.admin) {
      throw new Error("O usuário não é um administrador!");
    }

    return this.usersRepository.list();
  }
}

export { ListAllUsersUseCase };
