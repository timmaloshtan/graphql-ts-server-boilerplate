import * as mailgun from "mailgun-js";

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY as string,
  domain: process.env.MAILGUN_DOMAIN as string,
});

export const sendEmail = (recipient: string, confirmationLink: string) => {
  const data = {
    from: "Excited User <me@samples.mailgun.org>",
    to: recipient,
    subject: "Hello",
    html: `
      <html>
        <body>
          <p>GraphQL and TS server confirmation link</p>
          <a href="${confirmationLink}">Confirm email</a>
        </body>
      </html>
    `,
    "o:testmode": process.env.NODE_ENV === "test" ? "yes" : "no",
  };

  return new Promise((resolve, reject) => {
    mg.messages().send(data as mailgun.messages.SendData, function (
      error: mailgun.Error,
      body: mailgun.messages.SendResponse,
    ) {
      if (error) {
        reject(error);
      }

      resolve(body);
    });
  });
};
