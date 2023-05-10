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
      res.status(404).json("User doesn't exist").end();
      return;
    }

    const passwordIsCorrect = await compare(password, fetchedUser.bcrypt_user_password);
    if (passwordIsCorrect) {
      const jwtToken = sign({ id: fetchedUser.id }, process.env.SECRET_JWT as string, { expiresIn: 604800 });
      res.status(200).json({ auth: true, token: jwtToken });
    } else {
      res.status(403).json("Password is incorrect").end();
    }
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}
