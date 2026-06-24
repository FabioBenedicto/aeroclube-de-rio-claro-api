import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';

import { IAzureBlobService } from './azure-blob.service.interface';

@Injectable()
export class AzureBlobService implements IAzureBlobService {
  private readonly containerClient: ContainerClient;

  constructor(private readonly config: ConfigService) {
    const connectionString = config.getOrThrow<string>(
      'AZURE_STORAGE_CONNECTION_STRING',
    );
    const containerName = config.getOrThrow<string>('AZURE_STORAGE_CONTAINER');
    const client = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = client.getContainerClient(containerName);
  }

  async upload(
    blobPath: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const blob = this.containerClient.getBlockBlobClient(blobPath);

    await blob.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });

    return blob.url;
  }

  async download(blobPath: string): Promise<Buffer> {
    return this.containerClient.getBlockBlobClient(blobPath).downloadToBuffer();
  }

  async delete(blobPath: string): Promise<void> {
    await this.containerClient.getBlockBlobClient(blobPath).deleteIfExists();
  }

  buildBlobPath(
    prefix: string,
    id: number | string,
    originalname: string,
  ): string {
    const ext = extname(originalname).toLowerCase();
    return `${prefix}/${id}-${Date.now()}${ext}`;
  }

  blobPathFromUrl(url: string): string {
    const prefix = this.containerClient.url + '/';
    return url.startsWith(prefix) ? url.slice(prefix.length) : url;
  }
}
