import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { Borrower } from '../../borrowers/entities/borrower.entity';

@Entity()
export class Borrowing {
	@ApiProperty({ example: 1, description: 'Unique borrowing record ID' })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({
		example: '2025-07-31',
		description: 'Date when the book was checked out',
	})
	@Column({ type: 'date' })
	borrowDate: string;

	@ApiProperty({
		example: '2025-08-14',
		description: 'Due date for returning the book',
	})
	@Column({ type: 'date' })
	dueDate: string;

	@ApiProperty({
		example: '2025-08-10',
		description: 'Actual return date (if already returned)',
		required: false,
	})
	@Column({ type: 'date', nullable: true })
	returnDate?: string;

	@ApiProperty({
		type: () => Book,
		description: 'The book that was borrowed',
	})
	@ManyToOne(() => Book, (book) => book.borrowings, { onDelete: 'RESTRICT' })
	@JoinColumn({ name: 'book_id' })
	book: Book;

	@ApiProperty({
		type: () => Borrower,
		description: 'The borrower who checked out the book',
	})
	@ManyToOne(() => Borrower, (b) => b.borrowings, { onDelete: 'RESTRICT' })
	@JoinColumn({ name: 'borrower_id' })
	borrower: Borrower;
}
