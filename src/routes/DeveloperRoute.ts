import { Router } from "express";
import { prisma } from "prisma";

/**
 * Rota para algumas operações de teste durante o desenvolvimento.
 * Essa rota NÃO PODE SER incluída no ambiente de produção.
 * Ignorando padrão MVC pois só contém uma função.
 */
const DeveloperRoute = Router();
DeveloperRoute.delete("/user/:document", async (req, res) => {
  const { document } = req.params;
  const userToBeDeleted = await prisma.userInfo.findUnique({
    where: { document },
  });

  if (!userToBeDeleted) {
    return res.status(404).json({ error: "User not found" });
  }

  const id = userToBeDeleted?.id;

  await prisma.transfer.deleteMany({
    where: {
      OR: [
        {
          debited_account: {
            user: {
              id,
            },
          },
        },
        {
          credited_account: {
            user: {
              id,
            },
          },
        },
      ],
    },
  });

  await prisma.account.deleteMany({
    where: {
      owner_id: id,
    },
  });

  await prisma.address.delete({
    where: {
      owner_id: id,
    },
  });

  await prisma.userInfo.delete({
    where: {
      id,
    },
  });

  await prisma.userAuth.delete({
    where: {
      id,
    },
  });
});

export default DeveloperRoute;
