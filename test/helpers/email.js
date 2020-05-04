//import { Client as ClientClass } from "@sendgrid/client";
const ClientClass = require("@sendgrid/client").Client;
const dotenv = require("dotenv");

dotenv.config();

const Client = new ClientClass();
Client.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  // eslint-disable-next-line import/prefer-default-export
  async sendEmail({ templateId, personalizations, fromName }) {
    await Client.request({
      method: "POST",
      url: "/v3/mail/send",
      body: {
        template_id: templateId,
        personalizations,
        from: {
          email: "noreply@vipfy.store",
          name: fromName
        },
        reply_to: {
          email: "support@vipfy.store",
          name: "Vipfy Support"
        }
      }
    }).catch(function (error) {
      console.error("Mail request failed.");
      console.error(JSON.stringify(error, null, "\t"));
    });
  }
};
