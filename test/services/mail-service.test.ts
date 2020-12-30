import MailService from "../../src/services/mail.service";
import { mockMailService } from "../common/services";

describe("Mail Service", () => {
  let mailService: MailService;

  beforeEach(() => {
    mailService = mockMailService({});
  });

  test("Should should able to send mail successfully", async (done) => {
    const response = await mailService.send({
      to: "to@toks.com",
      subject: "Hello World",
      html: "<b>hello</b>",
    });

    expect(response).toEqual(true);
    done();
  });

  test("Should throw exception for invalid mail properties", async (done) => {
    const sendMail = await mailService.send({
      to: "to@toks.com",
      subject: "THROW_ERROR", // Check __mock__/nodemailer.ts custom subject
      html: "<b>hello</b>",
    });

    expect(sendMail).toEqual(false);
    done();
  });
});
