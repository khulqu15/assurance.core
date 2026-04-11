import { IsOptional, IsString } from 'class-validator';

export class ReviewClaimDto {
    @IsOptional()
    @IsString()
    note?: string;
}