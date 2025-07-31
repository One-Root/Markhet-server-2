import * as path from 'path';

import { Injectable } from '@nestjs/common';

import { Storage, Bucket } from '@google-cloud/storage';

import { Metadata } from '../../common/types/file.type';

@Injectable()
export class FileService {
  private bucket: Bucket;

  constructor() {
    const file = process.env.GCP_SERVICE_ACCOUNT_CREDENTIALS;
    const bucket = process.env.GCP_BUCKET_NAME;

    if (!file) {
      throw new Error(
        'GCP service account credentials file path is not set in env variables',
      );
    }

    if (!bucket) {
      throw new Error('GCP bucket name is not set in environment variables');
    }

    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(file);

    const storage = new Storage();

    this.bucket = storage.bucket(bucket);
  }

  async upload(file: Express.Multer.File, meta: Metadata): Promise<string> {
    const { buffer, originalname } = file;
    const { folder } = meta;

    const name = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}-${originalname}`;

    const path = `${folder}/${name}`;

    const blob = this.bucket.file(path);

    const stream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;

          resolve(publicUrl);
        })
        .on('error', (err) => {
          reject(`unable to upload file '${err.message}'`);
        })
        .end(buffer);
    });
  }
}
