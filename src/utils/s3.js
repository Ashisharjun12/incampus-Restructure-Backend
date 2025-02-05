import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';
import logger from "./logger.js";
import { _config } from "../config/config.js";

const s3Client = new S3Client({
  region: _config.AWS_REGION,
  credentials: {
    accessKeyId: _config.AWS_ACCESS_KEY_ID,
    secretAccessKey: _config.AWS_SECRET_ACCESS_KEY

  }

});

export const uploadToS3 = async (file , contentType) => {
  try {
    const key = `${uuidv4()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: _config.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: contentType
    });

    

    await s3Client.send(command);
    return key;
  } catch (error) {
    logger.error("S3 upload error:", error);
    throw error;
  }
};

export const deleteFromS3 = async (mediaKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: _config.AWS_BUCKET_NAME,
      Key: mediaKey
    });

    await s3Client.send(command);
  } catch (error) {
    logger.error("S3 delete error:", error);
    throw error;
  }
};

export const getMediaUrl = async (mediaKey) => {
  try {
    const command = new GetObjectCommand({
      Bucket: _config.AWS_BUCKET_NAME,
      Key: mediaKey
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    logger.error("S3 get URL error:", error);
    throw error;
  }
};

export const generatePresignedPutUrl = async (fileName, contentType) => {
  try {
    const key = `${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: _config.AWS_BUCKET_NAME,
      Key: key,
      ContentType: contentType
    });

    const url = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 
    });
    
    return { key, url };
  } catch (error) {
    logger.error("S3 presigned URL error:", error);
    throw error;
  }
};
