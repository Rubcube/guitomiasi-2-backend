import "dotenv/config";
import express from "express";
import onboardingRoute from "routes/OnboardingRoute";
import loginRoute from "routes/LoginRoute";
import accountRoute from "routes/AccountRoute";
import { authentication } from "middlewares/auth";
import { DateTime } from "luxon";

DateTime.local().setZone("America/Sao_Paulo");

const app = express();

app.use(express.json());
app.get("/", (_, res) => {
  return res.send("Hello World");
});
app.get("/testLogin", authentication, (_, res) => {
  return res.status(200).json("Authentication successfull!");
});
app.use("/onboarding", onboardingRoute);
app.use("/login", loginRoute);
app.use("/account", accountRoute);
app.listen(process.env.PORT || 3344);
