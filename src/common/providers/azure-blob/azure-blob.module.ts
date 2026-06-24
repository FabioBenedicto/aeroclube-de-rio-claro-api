import { Global, Module } from '@nestjs/common';

import { AZURE_BLOB_SERVICE } from './azure-blob.service.interface';
import { AzureBlobService } from './azure-blob.service';

@Global()
@Module({
  providers: [{ provide: AZURE_BLOB_SERVICE, useClass: AzureBlobService }],
  exports: [AZURE_BLOB_SERVICE],
})
export class AzureBlobModule {}
