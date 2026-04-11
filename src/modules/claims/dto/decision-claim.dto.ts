import { IsOptional, IsString } from 'class-validator';

export class DecisionClaimDto {
    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsString()
    rejectionReason?: string;
}