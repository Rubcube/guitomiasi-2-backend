import { Request, Response } from "express";
import { AddressOnboarding } from "dtos/AddressDTO";
import AddressModel from "models/AddressModel";

const addressModel = new AddressModel();

export default class AddressController {
  create = async (req: Request, res: Response) => {
    try {
      const addressBody: AddressOnboarding = req.body;
      const newAccount = await addressModel.create(addressBody);
      res.status(201).json(newAccount);
    } catch (e) {
      console.log("Failed to onboard address.", e);
      res.status(500).send({
        error: "ADR-01",
        message: "Failed to create address",
      })
    }
  }
}
