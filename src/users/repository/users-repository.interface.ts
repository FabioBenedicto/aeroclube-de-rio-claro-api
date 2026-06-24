import { Paginated } from '../../common/dto/pagination.dto';
import { FindAllUsersDto } from '../dto/find-all-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ERoles } from '../enums/roles.enum';
import { User } from '../model/user.model';

export const USERS_REPOSITORY = Symbol('IUsersRepository');

export type PaginatedUsers = Paginated<User>;

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: ERoles;
  permissions: string[];
}

export interface IUsersRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(query: FindAllUsersDto): Promise<PaginatedUsers>;
  create(data: CreateUserData): Promise<User | null>;
  update(
    id: number,
    data: Omit<UpdateUserDto, 'permissions'>,
    permissions?: string[],
  ): Promise<User | null>;
  delete(id: number): Promise<{ id: number }>;
}
