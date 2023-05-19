import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { handleError } from "handlers/errors/ErrorHandler";
import { DateTime } from "luxon";
import { authentication } from "middlewares/auth";
import AccountRoute from "routes/AccountRoute";
import LoginRoute from "routes/LoginRoute";
import OnboardingRoute from "routes/OnboardingRoute";

// const key = fs.readFileSync("kc/key.pem");
// const cert = fs.readFileSync("kc/cert.pem");

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

app.use(async (error: Error, req: Request, res: Response, _: NextFunction) => {
  handleError(error, res);
});

// https
//   .createServer(
//     {
//       key,
//       cert,
//     },
//     app,
//   )
//   .listen(6666);
