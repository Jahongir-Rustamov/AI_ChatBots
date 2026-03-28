import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(12)
  @IsNotEmpty()
  password!: string;
}
