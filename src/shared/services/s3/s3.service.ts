import { ConfigService } from '@nestjs/config';
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as path from 'path';

@Injectable()
export class S3Service {
  config: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.config = new S3Client({
      region: this.configService.get('AWS_S3_REGION_KEY'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      },
    });
  }

  async upload(file: Express.Multer.File) {
    try {
      const bucket = this.configService.get('AWS_S3_BUCKET_NAME');
      const filename = await this.generateRandomFileName(
        path.extname(file.originalname),
      );

      const params = {
        Bucket: bucket,
        Key: filename,
        Body: file.buffer,
      };

      if (params.Body.length >= 6 * 1024 * 1024) {
        delete params.Body;

        const multipartUpload = await this.config.send(
          new CreateMultipartUploadCommand({
            ...params,
            ACL: 'public-read',
          }),
        );

        const uploadId = multipartUpload.UploadId;

        const uploadPromises = [];

        const partQtd = params.Body.length / (6 * 1024 * 1024);

        const partSize = Math.ceil(params.Body.length / partQtd);

        for (let i = 0; i < partQtd; i++) {
          const start = i * partSize;
          const end = start + partSize;

          uploadPromises.push(
            this.config
              .send(
                new UploadPartCommand({
                  ...params,
                  UploadId: uploadId,
                  Body: params.Body.subarray(start, end),
                  PartNumber: i + 1,
                }),
              )
              .then((d) => {
                return d;
              }),
          );
        }
        const uploadResults = await Promise.all(uploadPromises);

        await this.config.send(
          new CompleteMultipartUploadCommand({
            ...params,
            UploadId: uploadId,
            MultipartUpload: {
              Parts: uploadResults.map(({ ETag }, i) => ({
                ETag,
                PartNumber: i + 1,
              })),
            },
          }),
        );
      } else {
        await this.config.send(
          new PutObjectCommand({ ...params, ACL: 'public-read' }),
        );
      }

      return `https://${params.Bucket}.s3.${this.configService.get('AWS_S3_REGION_KEY')}.amazonaws.com/${params.Key}`;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async generateRandomFileName(extensao: string) {
    let filename;
    let count = 0;

    do {
      filename = `${nanoid()}${extensao}`;

      count++;
    } while ((await this.fileNameExists(filename)) && count <= 4);

    if (count > 4)
      throw new InternalServerErrorException(
        'Ocorreu um erro ao salvar o arquivo',
      );

    return filename;
  }

  async fileNameExists(filename: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: filename,
      });

      await this.config.send(command);

      return true;
    } catch {
      return false;
    }
  }
}
