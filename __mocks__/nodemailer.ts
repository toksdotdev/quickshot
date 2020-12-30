/* eslint-disable @typescript-eslint/no-var-requires */
import Mail from "nodemailer/lib/mailer";

jest.mock("nodemailer");

const nodemailer = jest.requireActual("nodemailer");
nodemailer.createTransport = jest.fn().mockReturnValue({
  sendMail: jest.fn().mockImplementation(async (mailOptions: Mail.Options) => {
    if (mailOptions.subject.includes("THROW_ERROR")) {
      return Promise.reject("Invalid Message");
    }

    return Promise.resolve({ status: "success" });
  }),
});

export default nodemailer;
