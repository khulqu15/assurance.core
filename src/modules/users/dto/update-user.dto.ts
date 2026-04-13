import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleCode } from '../../../common/enums/role.enum';

export class UpdateUserDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsIn([
    RoleCode.USER,
    RoleCode.VERIFIER,
    RoleCode.APPROVER,
    RoleCode.SUPERADMIN,
  ])
  role?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  nik?: string;

  @IsOptional()
  @IsString()
  birthPlace?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}