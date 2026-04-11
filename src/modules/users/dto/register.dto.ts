import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    fullName!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsOptional()
    @IsString()
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