import { PrismaClient } from '@prisma/client';
import { UserOnboarding, UserOut } from 'dtos/UsersDTO';

const prisma = new PrismaClient();

export default class UserModel {
  create = async (user: UserOnboarding) => {
    const { bcrypt_user_password, ...userInfo } = user;

    const genUserAuth = await prisma.userAuth.create({
      data: {
        bcrypt_user_password: bcrypt_user_password
      }
    });

    // Use generated UUID to generate the UserInfo entry
    const genUserInfo = await prisma.userInfo.create({
      data: {
        id: genUserAuth.id,
        ...userInfo
      }
    });

    return genUserInfo as UserOut;
  }

  getIDByDocument = async (document: string) => {
    const userReference = await prisma.userInfo.findUnique({
      where: {
        document: document
      }
    })

    return userReference?.id;
  }
};