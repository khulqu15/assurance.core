import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    commentType!: string;

    @IsString()
    @IsNotEmpty()
    commentText!: string;
}