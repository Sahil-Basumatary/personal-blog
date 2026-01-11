import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, getBucketName } from "../lib/s3Client.js";
import { requireSignedInOwner } from "../lib/authHelpers.js";

export async function uploadImage(req, res) {
  const gate = requireSignedInOwner(req, {
    unauthStatus: 401,
    unauthMessage: "Sign in required to upload images.",
    forbiddenStatus: 403,
    forbiddenMessage: "Only the blog owner can upload images.",
  });

  if (!gate.ok) {
    return res.status(gate.status).json({ message: gate.message });
  }

  const ext = req.file.detectedExt;
  const key = `${uuidv4()}.${ext}`;

  const s3 = getS3Client();
  const bucket = getBucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.detectedMime,
  });

  try {
    await s3.send(command);
  } catch (err) {
    console.error("S3 upload failed:", err.message);
    return res.status(500).json({ message: "Image upload failed." });
  }

  const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return res.status(201).json({
    url,
    key,
    originalName: req.file.originalname,
  });
}


