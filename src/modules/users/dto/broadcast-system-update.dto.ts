import { IsString } from "class-validator";

export class BroadcastSystemUpdateDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;
}