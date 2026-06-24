import { Exclude } from 'class-transformer';

import { ERoles } from '../enums/roles.enum';

export class User {
  id: number;
  name: string;
  email: string;
  role: ERoles;

  @Exclude({ toPlainOnly: true })
  password: string;

  created_at: Date;
  updated_at: Date;
  permissions: string[];
}
