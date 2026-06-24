"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeAzureBlobService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
let FakeAzureBlobService = class FakeAzureBlobService {
    async upload(blobPath) {
        return `https://fake-storage.local/${blobPath}`;
    }
    async delete() { }
    async download() {
        return Buffer.alloc(0);
    }
    blobPathFromUrl(url) {
        return url;
    }
    buildBlobPath(prefix, id, originalname) {
        const ext = (0, path_1.extname)(originalname).toLowerCase();
        return `${prefix}/${id}-0${ext}`;
    }
};
exports.FakeAzureBlobService = FakeAzureBlobService;
exports.FakeAzureBlobService = FakeAzureBlobService = __decorate([
    (0, common_1.Injectable)()
], FakeAzureBlobService);
//# sourceMappingURL=fake-azure-blob.service.js.map