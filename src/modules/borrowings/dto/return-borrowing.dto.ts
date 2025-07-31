import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ReturnBorrowingDto {
	@ApiProperty({
		example: '2025-08-10',
		description: 'Date when the book was returned (YYYY-MM-DD)',
	})
	@IsDateString()
	returnDate: string;
}
