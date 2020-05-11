const AWS = require("aws-sdk");
const fs = require("fs");

const BUCKET_NAME = "vipfy-ssotests";
const s3 = new AWS.S3({ region: "eu-central-1" });

module.exports = {
  async uploadSsoTestResult(path, fileName) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName
    };

    const signedUrl = s3.getSignedUrl("putObject", params, async function (err, url) {
      if (err) {
        console.error("Amazon S3 upload error.");
        throw err;
      }

      return await getUrlForSsoTestResult(params);
    });
  }
};

async function getUrlForSsoTestResult(params) {
  return s3.getSignedUrl("getObject", params, function (err, url) {
    if (err) {
      console.error("Amazon S3 error.");
      throw err;
    }

    return url;
  });
}
