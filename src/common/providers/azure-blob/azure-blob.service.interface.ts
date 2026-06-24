export const AZURE_BLOB_SERVICE = Symbol('IAzureBlobService');

export interface IAzureBlobService {
  upload(
    blobPath: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string>;
  download(blobPath: string): Promise<Buffer>;
  delete(blobPath: string): Promise<void>;
  buildBlobPath(
    prefix: string,
    id: number | string,
    originalname: string,
  ): string;
  blobPathFromUrl(url: string): string;
}
