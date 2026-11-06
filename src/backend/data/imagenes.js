const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

async function urlFirmada(llave) {
    if (!llave || !process.env.BUCKET_IMAGENES) return "";

    const comando = new GetObjectCommand({ Bucket: process.env.BUCKET_IMAGENES, Key: llave });
    return getSignedUrl(s3, comando, { expiresIn: 3600 });
}

module.exports = { urlFirmada };
