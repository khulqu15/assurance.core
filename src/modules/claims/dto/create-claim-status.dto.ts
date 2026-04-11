import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class SaveClaimStatusDto {
    @IsString()
    @IsNotEmpty()
    code!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    sequence!: number;
}