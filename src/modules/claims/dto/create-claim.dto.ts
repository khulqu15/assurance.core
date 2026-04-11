import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClaimDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    claimAmount!: number;

    @IsDateString()
    incidentDate!: string;
}