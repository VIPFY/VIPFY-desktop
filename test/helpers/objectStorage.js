const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

const s3 = new AWS.S3({ region: "eu-central-1" });

async function upload(filePath, fileName, mimeType, bucketName) {
  const fileStream = fs.createReadStream(filePath);

  const params = {
    Key: fileName,
    Body: fileStream,
    ContentType: mimeType,
    Bucket: bucketName
  };

  try {
    await s3.upload(params).promise();

    return true;
  } catch (err) {
    console.error("Amazon S3 upload error.");
    throw err;
  }
}

async function getDownloadUrl(fileName, bucketName) {
  return s3.getSignedUrl("getObject", {
    Key: fileName,
    Bucket: bucketName,
    Expires: 36000
  });
}

module.exports = { upload, getDownloadUrl };
