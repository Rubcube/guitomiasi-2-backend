import "dotenv/config";
import express from "express";
import { authentication } from "middlewares/auth";
import { DateTime } from "luxon";
import OnboardingRoute from "routes/OnboardingRoute";
import LoginRoute from "routes/LoginRoute";
import AccountRoute from "routes/AccountRoute";

DateTime.local().setZone("America/Sao_Paulo");

const app = express();

app.use(express.json());
app.get("/", (_, res) => {
  return res.send("Hello World");
});
app.get("/testLogin", authentication, (_, res) => {
  return res.status(200).json("Authentication successfull!");
});
app.use("/onboarding", OnboardingRoute);
app.use("/login", LoginRoute);
app.use("/account", AccountRoute);
app.listen(process.env.PORT || 3344);
