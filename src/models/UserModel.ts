import { PrismaClient } from '@prisma/client';
import { UserIn } from 'dtos/UsersDTO';

const prisma = new PrismaClient();

export default class UserModel {

  create = async (user: UserIn) => {
    return await prisma.user.create({
      data: user
    });
  }

  getAll = async () => {
    return await prisma.user.findMany();
  }

  get = async (id: number) => {
    return await prisma.user.findUnique({
      where: {
        id
      }
    });
  }

  delete = async (id: number) => {
    return await prisma.user.delete({
      where: {
        id
      }
    })
  }

  update = async (id: number, user: UserIn) => {
    return await prisma.user.update({
      where: {
        id
      },
      data: {
        ...user
      }
    })
  }
};