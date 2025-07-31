import { BadRequestException, Injectable } from '@nestjs/common';
import { BooksService } from '../books/books.service';
import { BorrowingsRepository } from './borrowings.repository';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { Borrowing } from './entities/borrowing.entity';

@Injectable()
export class BorrowingsService {
	constructor(
		private readonly borrowingsRepo: BorrowingsRepository,
		private readonly booksService: BooksService
	) {}

	/** Checkout a book: decrement quantity, create borrowing */
	async create(dto: CreateBorrowingDto): Promise<Borrowing> {
		const book = await this.booksService.findOne(dto.bookId);
		if (book.availableQuantity < 1) {
			throw new BadRequestException('Book not available');
		}
		// Decrement book quantity
		await this.booksService.update(dto.bookId, {
			availableQuantity: book.availableQuantity - 1,
		});

		// Compute dates
		const today = new Date().toISOString().split('T')[0];
		const due = new Date();
		due.setDate(due.getDate() + 14); // TODO: make configurable
		const dueDate = due.toISOString().split('T')[0];

		return this.borrowingsRepo.create(dto, today, dueDate);
	}

	/** Return a book: set returnDate */
	returnBook(id: number, returnDate: string): Promise<Borrowing> {
		return this.borrowingsRepo.updateReturn(id, returnDate);
	}

	/** List current (not yet returned) loans for a borrower */
	findLoansForBorrower(borrowerId: number): Promise<Borrowing[]> {
		return this.borrowingsRepo.findByBorrower(borrowerId);
	}

	/** List all overdue loans */
	findOverdue(): Promise<Borrowing[]> {
		return this.borrowingsRepo.findOverdue();
	}
}
