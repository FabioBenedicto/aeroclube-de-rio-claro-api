import { Injectable } from '@nestjs/common';
import { extname } from 'path';

import { IAzureBlobService } from './azure-blob.service.interface';

@Injectable()
export class FakeAzureBlobService implements IAzureBlobService {
  async upload(blobPath: string): Promise<string> {
    return `https://fake-storage.local/${blobPath}`;
  }

  async delete(): Promise<void> {}

  async download(): Promise<Buffer> {
    return Buffer.alloc(0);
  }

  blobPathFromUrl(url: string): string {
    return url;
  }

  buildBlobPath(
    prefix: string,
    id: number | string,
    originalname: string,
  ): string {
    const ext = extname(originalname).toLowerCase();
    return `${prefix}/${id}-0${ext}`;
  }
}
