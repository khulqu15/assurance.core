import { IsOptional, IsString } from 'class-validator';

export class SubmitClaimDto {
    @IsOptional()
    @IsString()
    note?: string;
}