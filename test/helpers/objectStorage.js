const AWS = require("aws-sdk");

const s3 = new AWS.S3({ region: "eu-central-1" });

module.exports = { upload, getDownloadUrl };

async function upload(fileName, bucketName) {
  s3.getSignedUrl(
    "putObject",
    {
      Bucket: bucketName,
      Key: fileName
    },
    async function (err) {
      if (err) {
        console.error("Amazon S3 upload error.");
        throw err;
      }
    }
  );
}

async function getDownloadUrl(fileName, bucketName) {
  return s3.getSignedUrl("getObject", {
    Bucket: bucketName,
    Key: fileName
  });
}

function getParams(fileName, bucketName) {
  return {
    Bucket: bucketName,
    Key: fileName
  };
}
