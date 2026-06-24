import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export interface PermissionAction {
  key: string;
  action: string;
  action_label: string;
}

export interface PermissionGroup {
  module: string;
  module_label: string;
  actions: PermissionAction[];
}

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PermissionGroup[]> {
    const rows = await this.prisma.permission.findMany({ orderBy: { id: 'asc' } });

    const grouped = new Map<string, PermissionGroup>();
    for (const row of rows) {
      if (!grouped.has(row.module)) {
        grouped.set(row.module, { module: row.module, module_label: row.module_label, actions: [] });
      }
      grouped.get(row.module)!.actions.push({ key: row.key, action: row.action, action_label: row.action_label });
    }

    return [...grouped.values()];
  }
}
