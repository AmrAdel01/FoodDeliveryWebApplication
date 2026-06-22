import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

export class CloudinaryImageService {
  constructor(
    client = cloudinary,
    folder = env.cloudinary.folder,
    configured = Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret),
    cloudName = env.cloudinary.cloudName,
  ) {
    this.client = client;
    this.folder = folder;
    this.configured = configured;
    this.cloudName = cloudName;
  }

  assertConfigured() {
    if (!this.configured) {
      throw new ApiError(503, 'Image service is not configured');
    }
    if (!/^[A-Za-z0-9_-]+$/.test(this.cloudName)) {
      throw new ApiError(503, 'CLOUDINARY_CLOUD_NAME is invalid; use the cloud name from the Cloudinary dashboard');
    }
  }

  upload(buffer) {
    this.assertConfigured();
    return new Promise((resolve, reject) => {
      const stream = this.client.uploader.upload_stream(
        { folder: this.folder, resource_type: 'image' },
        (error, result) => {
          if (error) return reject(new ApiError(502, 'Image upload failed'));
          return resolve({ public_id: result.public_id, secure_url: result.secure_url });
        },
      );
      stream.end(buffer);
    });
  }

  async delete(publicId) {
    if (!publicId) return;
    this.assertConfigured();
    const result = await this.client.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
    if (!['ok', 'not found'].includes(result.result)) {
      throw new ApiError(502, 'Image deletion failed');
    }
  }
}

export const imageService = new CloudinaryImageService();
