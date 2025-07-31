import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateBorrowingDto {
	@ApiProperty({
		example: 1,
		description: 'ID of the book to check out',
	})
	@IsInt()
	@Min(1)
	bookId: number;

	@ApiProperty({
		example: 1,
		description: 'ID of the borrower',
	})
	@IsInt()
	@Min(1)
	borrowerId: number;
}
