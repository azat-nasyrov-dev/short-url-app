import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateShortUrlDto {
  @IsNotEmpty()
  @IsString()
  readonly originalUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Custom alias must not exceed 20 characters' })
  readonly customAlias?: string;

  @IsOptional()
  readonly expiresAt?: Date;
}
