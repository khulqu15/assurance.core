import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAttachmentDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    fileName!: string;

    @IsString()
    @IsNotEmpty()
    fileUrl!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    fileMimeType!: string;

    @IsString()
    @IsNotEmpty()
    fileSize!: string;
}