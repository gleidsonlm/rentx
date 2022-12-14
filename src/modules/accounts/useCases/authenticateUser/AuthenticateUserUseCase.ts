import { IUsersRepository } from "../../repositories/IUsersRepository";
import { inject, injectable } from "tsyringe";
import { compare } from 'bcryptjs'
import { sign } from "jsonwebtoken";
import { AppError } from "../../../../errors/AppError";

interface IRequest {
    email:string;
    password:string;
}

interface IResponse {
    user: {
        name: string;
        email: string;
    };
    token: string;
}

@injectable()
class AuthenticateUserUseCase {
    constructor(
        @inject("UsersRepository")
        private usersRepository: IUsersRepository
    ){}

    async execute({email,password}:IRequest):Promise<IResponse>  {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            throw new AppError("Incorrect User or Password"),401;
        }
        
        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
            throw new AppError("Incorrect User or Password"),401;
        }

        const token = sign({}, process.env.JWT_SECRET, {
            subject: user.id,
            expiresIn: "1d"
            }
        );

        return {
            user: {
                name : user.name,
                email : user.email
            },
            token
        };
    }
}

export { AuthenticateUserUseCase }