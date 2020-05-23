import AWS from "aws-sdk";

const {
  VUE_APP_BUCKETEER_AWS_ACCESS_KEY_ID: accessKeyId,
  VUE_APP_BUCKETEER_AWS_SECRET_ACCESS_KEY: secretAccessKey,
  VUE_APP_BUCKETEER_BUCKET_NAME: bucketName,
  VUE_APP_BUCKETEER_AWS_REGION: region
} = process.env;

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Credentials.html
AWS.config.credentials = new AWS.Credentials(accessKeyId, secretAccessKey);

// Create a new service object
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region
});

/**
 * Get an object from a s3 bucket
 *
 * @param  {string} key - Object location in the bucket
 * @return {object}     - A promise containing the json parsed response
 */
const getObject = key => {
  return new Promise((resolve, reject) => {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
    s3.getObject(
      {
        Bucket: bucketName,
        Key: `dviz/${key}`
      },
      (err, data) => {
        if (err) reject(err);
        else resolve(JSON.parse(data.Body));
      }
    );
  });
};

export default getObject;
