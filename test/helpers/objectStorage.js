var AWS = require("aws-sdk");
var fs = require("fs");

const BUCKET_NAME = "vipfy-ssotests";
const s3 = new AWS.S3({ region: "eu-central-1" });

export const uploadSsoTestResult = async (path, fileName) => {
  try {
    const readStream = fs.createReadStream(path);

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: readStream,
      ContentType: "application/json"
    };

    s3.upload(params, function (err, data) {
      if (err) {
        throw err;
      }

      console.log(`File uploaded successfully. ${data.Location}`);
    });
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Generates a link where we can download the test result file.
 *
 * @export
 * @param {string} billname
 * @param {string} time
 * @returns {string}
 */
export const getInvoiceLink = async (billname, time) => {
  const Key = `${billname}.pdf`;
  const Bucket = process.env.AWS_BUCKET ? "invoices.dev.vipfy.store" : "invoices.vipfy.store";

  try {
    const url = await s3.getSignedUrl("getObject", {
      Bucket,
      Key,
      Expires: 3600
    });

    return url;
  } catch (err) {
    throw new Error(err);
  }
};
