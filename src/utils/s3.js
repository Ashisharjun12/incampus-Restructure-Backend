import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';
import logger from "./logger.js";
import { _config } from "../config/config.js";

export const s3Client = new S3Client({

  region: _config.AWS_REGION,
  credentials: {
    accessKeyId: _config.AWS_ACCESS_KEY_ID,
    secretAccessKey: _config.AWS_SECRET_ACCESS_KEY

  }

});



