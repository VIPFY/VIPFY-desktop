const ClientClass = require("@sendgrid/client").Client;
const dotenv = require("dotenv");

dotenv.config();

const Client = new ClientClass();
Client.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
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
    }).catch(function (err) {
      console.error("Sendgrid mail request error.");
      console.error(JSON.stringify(err, null, "\t"));
    });
  }
};
