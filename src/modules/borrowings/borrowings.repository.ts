import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { Borrowing } from './entities/borrowing.entity';

@Injectable()
export class BorrowingsRepository {
	constructor(
		@InjectRepository(Borrowing)
		private readonly repo: Repository<Borrowing>
	) {}

	/** Create a new borrowing record */
	async create(dto: CreateBorrowingDto, borrowDate: string, dueDate: string): Promise<Borrowing> {
		const borrowing = this.repo.create({
			...dto,
			borrowDate,
			dueDate,
			book: { id: dto.bookId },
			borrower: { id: dto.borrowerId },
		});
		// First save the borrowing
		const saved = await this.repo.save(borrowing);

		// Then fetch it with relations
		return this.repo.findOne({
			where: { id: saved.id },
			relations: ['book', 'borrower'],
		});
	}

	/** Find all active (not returned) loans for a given borrower */
	async findByBorrower(borrowerId: number): Promise<Borrowing[]> {
		return this.repo.find({
			where: { borrower: { id: borrowerId }, returnDate: null },
			relations: ['book', 'borrower'],
		});
	}

	/** Find all overdue loans */
	async findOverdue(): Promise<Borrowing[]> {
		return this.repo
			.createQueryBuilder('b')
			.leftJoinAndSelect('b.book', 'book')
			.leftJoinAndSelect('b.borrower', 'borrower')
			.where('b.returnDate IS NULL')
			.andWhere('b.dueDate < CURRENT_DATE')
			.getMany();
	}

	/** Lookup one borrowing record by ID */
	async findOne(id: number): Promise<Borrowing> {
		const borrowing = await this.repo.findOne({
			where: { id },
			relations: ['book', 'borrower'],
		});
		if (!borrowing) {
			throw new NotFoundException(`Borrowing with id ${id} not found`);
		}
		return borrowing;
	}

	/** Mark a borrowing as returned */
	async updateReturn(id: number, returnDate: string): Promise<Borrowing> {
		const borrowing = await this.findOne(id);
		borrowing.returnDate = returnDate;
		return this.repo.save(borrowing);
	}

	async findOverdueInPeriod(startDate: string, endDate: string): Promise<Borrowing[]> {
		return this.repo
			.createQueryBuilder('b')
			.leftJoinAndSelect('b.book', 'book')
			.leftJoinAndSelect('b.borrower', 'borrower')
			.where('b.returnDate IS NULL')
			.andWhere('b.dueDate BETWEEN :start AND :end', {
				start: startDate,
				end: endDate,
			})
			.getMany();
	}

	/** Find borrowings within date range */
	async findInPeriod(start: string, end: string): Promise<Borrowing[]> {
		return this.repo.find({
			relations: ['book', 'borrower'],
			where: {
				borrowDate: Between(start, end),
			},
		});
	}
}
