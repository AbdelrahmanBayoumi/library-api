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

	async findAll(): Promise<Borrower[]> {
		return this.repo.find();
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
