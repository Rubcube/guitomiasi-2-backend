import "dotenv/config";
import express from "express";
import usersRoutes from "routes/UserRoute";
import addressRoutes from "routes/AddressRoute";
import accountRoutes from "routes/AccountRoute";
import { authentication } from "middlewares/auth";
import { DateTime } from "luxon";

DateTime.local().setZone("America/Sao_Paulo");

const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  return res.send("Hello World");
});
app.use("/users", authentication, usersRoutes);
app.use("/address", authentication, addressRoutes);
app.use("/account", authentication, accountRoutes);
app.listen(process.env.PORT || 3344);
