"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureBlobService = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
let AzureBlobService = class AzureBlobService {
    config;
    containerClient;
    constructor(config) {
        this.config = config;
        const connectionString = config.getOrThrow('AZURE_STORAGE_CONNECTION_STRING');
        const containerName = config.getOrThrow('AZURE_STORAGE_CONTAINER');
        const client = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
        this.containerClient = client.getContainerClient(containerName);
    }
    async upload(blobPath, buffer, contentType) {
        const blob = this.containerClient.getBlockBlobClient(blobPath);
        await blob.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: contentType,
            },
        });
        return blob.url;
    }
    async download(blobPath) {
        return this.containerClient.getBlockBlobClient(blobPath).downloadToBuffer();
    }
    async delete(blobPath) {
        await this.containerClient.getBlockBlobClient(blobPath).deleteIfExists();
    }
    buildBlobPath(prefix, id, originalname) {
        const ext = (0, path_1.extname)(originalname).toLowerCase();
        return `${prefix}/${id}-${Date.now()}${ext}`;
    }
    blobPathFromUrl(url) {
        const prefix = this.containerClient.url + '/';
        return url.startsWith(prefix) ? url.slice(prefix.length) : url;
    }
};
exports.AzureBlobService = AzureBlobService;
exports.AzureBlobService = AzureBlobService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AzureBlobService);
//# sourceMappingURL=azure-blob.service.js.map