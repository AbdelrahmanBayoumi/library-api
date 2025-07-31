import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBorrowerDto {
	@ApiProperty({ example: 'John Doe', description: 'Borrower’s full name' })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ example: 'john.doe@example.com', description: 'Borrower’s email address' })
	@IsEmail()
	email: string;

	@ApiProperty({
		example: '2025-07-31',
		description: 'Date when the borrower was registered (YYYY-MM-DD)',
	})
	@IsDateString()
	registeredDate: string;
}
