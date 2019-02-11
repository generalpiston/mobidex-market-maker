import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import config from '../../config';
import { factory } from '../../logging';

const logger = factory.getLogger('utils.email');

interface IBulkSendOptions {
  cc?: string[] | null;
  bcc?: string[] | null;
  from?: string;
  subject: string;
  templates: {
    text: string;
    html?: string;
  };
  to: string[] | null;
}

export async function bulkSend(context: any, options: IBulkSendOptions) {
  logger.trace(`Sending an email with the options: ${JSON.stringify(options)}`);

  const transporter = nodemailer.createTransport(
    config.get('email:transporter')
  );

  const htmlTemplate = options.templates.html
    ? await new Promise<HandlebarsTemplateDelegate>((resolve, reject) => {
        fs.readFile(options.templates.html, 'utf8', (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(Handlebars.compile(data));
        });
      })
    : null;

  const textTemplate = await new Promise<HandlebarsTemplateDelegate>(
    (resolve, reject) => {
      fs.readFile(options.templates.text, 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(Handlebars.compile(data));
      });
    }
  );

  const html = htmlTemplate(context);
  const text = textTemplate(context);

  transporter.sendMail(
    {
      bcc: options.bcc,
      cc: options.cc,
      from: options.from ? options.from : config.get('email:from'),
      html,
      subject: options.subject,
      text,
      to: options.to
    },
    (err, info) => {
      if (err) {
        logger.error(err.message, err);
      }
    }
  );
}
