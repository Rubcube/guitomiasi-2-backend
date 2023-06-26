import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { handleError } from "handlers/errors/ErrorHandler";
import { Settings } from "luxon";
import { authentication } from "middlewares/auth";
import * as TransferModel from "models/TransferModel";
import cron from "node-cron";
import AccountRoute from "routes/AccountRoute";
import LoginRoute from "routes/LoginRoute";
import OnboardingRoute from "routes/OnboardingRoute";
import UserRoute from "routes/UserRoute";
import VerifyRoute from "routes/VerifyRoute";

// const key = fs.readFileSync("kc/key.pem");
// const cert = fs.readFileSync("kc/cert.pem");

Settings.defaultZone = "America/Sao_Paulo";

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
app.use("/user", UserRoute);
app.use("/verify", VerifyRoute);
app.listen(process.env.PORT || 3344);

app.use(async (error: Error, req: Request, res: Response, _: NextFunction) => {
  handleError(error, res);
});

app.use(cors({ origin: true, credentials: true }));

cron.schedule(
  "0 1 * * * ",
  async function () {
    const allScheduled = await TransferModel.getScheduledTransfers();
    for await (const scheduled of allScheduled) {
      await TransferModel.executeScheduledTransfer(scheduled);
    }
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  },
);
// https
//   .createServer(
//     {
//       key,
//       cert,
//     },
//     app,
//   )
//   .listen(6666);
