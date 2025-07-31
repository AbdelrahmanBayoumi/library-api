import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateBookDto {
	@ApiProperty({ example: 'Clean Code', description: 'Book title' })
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({ example: 'Robert C. Martin', description: 'Book author' })
	@IsString()
	@IsNotEmpty()
	author: string;

	@ApiProperty({ example: '9780132350884', description: 'Unique ISBN' })
	@IsString()
	@IsNotEmpty()
	isbn: string;

	@ApiProperty({ example: 5, description: 'Copies available' })
	@IsInt()
	@Min(0)
	availableQuantity: number;

	@ApiProperty({ example: 'A3-12', description: 'Shelf location code' })
	@IsString()
	@IsNotEmpty()
	shelfLocation: string;
}
