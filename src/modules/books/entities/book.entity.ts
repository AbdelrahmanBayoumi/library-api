import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Borrowing } from '../../borrowings/entities/borrowing.entity';

@Entity()
export class Book {
	@ApiProperty({ example: 1 })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ example: 'Clean Code' })
	@Column()
	title: string;

	@ApiProperty({ example: 'Robert C. Martin' })
	@Column()
	author: string;

	@ApiProperty({ example: '9780132350884' })
	@Column({ unique: true })
	isbn: string;

	@ApiProperty({ example: 5 })
	@Column('int', { default: 0 })
	availableQuantity: number;

	@ApiProperty({ example: 'A3-12' })
	@Column()
	shelfLocation: string;

	@OneToMany(() => Borrowing, (b) => b.book)
	borrowings: Borrowing[];
}
