import { Request, Response } from "express";
import { UserLogin } from "dtos/UsersDTO";
import { compare } from "bcrypt";
import { getUserAuthInfo } from "models/UserModel";
import { sign } from "jsonwebtoken";

export async function loginUser(req: Request, res: Response) {
  const { document, password }: UserLogin = res.locals.parsedBody;

  try {
    const fetchedUser = await getUserAuthInfo(document);

    if (fetchedUser === null) {
      return res.status(404).json("User doesn't exist");
    }

    const passwordIsCorrect = await compare(
      password,
      fetchedUser.bcrypt_user_password,
    );
    if (passwordIsCorrect) {
      const jwtToken = sign(
        { id: fetchedUser.id },
        process.env.SECRET_JWT as string,
        { expiresIn: 60 },
      );
      return res.status(200).json(jwtToken);
    } else {
      return res.status(403).json("Password is incorrect");
    }
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
}
