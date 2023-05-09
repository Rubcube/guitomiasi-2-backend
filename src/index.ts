import "dotenv/config";
import express from "express";
import onboardingRoute from "routes/OnboardingRoute";
import { authentication } from "middlewares/auth";
import { DateTime } from "luxon";

DateTime.local().setZone("America/Sao_Paulo");

const app = express();

app.use(express.json());
app.get("/", (_, res) => {
  return res.send("Hello World");
});
app.use("/onboarding", authentication, onboardingRoute);
app.listen(process.env.PORT || 3344);
