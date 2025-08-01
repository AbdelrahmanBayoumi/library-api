import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import { Borrower } from './entities/borrower.entity';

@Injectable()
export class BorrowersRepository {
	constructor(
		@InjectRepository(Borrower)
		private readonly repo: Repository<Borrower>
	) {}

	async create(dto: CreateBorrowerDto): Promise<Borrower> {
		const borrower = this.repo.create(dto);
		return this.repo.save(borrower);
	}

	async findAll(filters?: {
		name?: string;
		email?: string;
		page?: number;
		limit?: number;
		sortBy?: 'name' | 'email' | 'registeredDate';
		sortOrder?: 'ASC' | 'DESC';
	}): Promise<[Borrower[], number]> {
		const qb = this.repo.createQueryBuilder('borrower');

		// Apply filters
		if (filters?.name) {
			qb.andWhere('LOWER(borrower.name) LIKE LOWER(:name)', {
				name: `%${filters.name}%`,
			});
		}
		if (filters?.email) {
			qb.andWhere('LOWER(borrower.email) LIKE LOWER(:email)', {
				email: `%${filters.email}%`,
			});
		}

		// Apply sorting
		if (filters?.sortBy) {
			qb.orderBy(`borrower.${filters.sortBy}`, filters.sortOrder || 'ASC');
		}

		// Apply pagination
		const page = filters?.page || 1;
		const limit = filters?.limit || 10;
		qb.skip((page - 1) * limit).take(limit);

		// Return both data and total count
		return qb.getManyAndCount();
	}

	async findOne(id: number): Promise<Borrower> {
		const borrower = await this.repo.findOne({ where: { id } });
		if (!borrower) {
			throw new NotFoundException(`Borrower with id ${id} not found`);
		}
		return borrower;
	}

	async update(id: number, dto: UpdateBorrowerDto): Promise<Borrower> {
		await this.repo.update(id, dto);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		const { affected } = await this.repo.softDelete(id);
		if (affected === 0) {
			throw new NotFoundException(`Borrower with id ${id} not found`);
		}
	}
}
