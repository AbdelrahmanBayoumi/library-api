import { ConflictException, Injectable } from '@nestjs/common';
import { BorrowersRepository } from './borrowers.repository';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import { Borrower } from './entities/borrower.entity';

@Injectable()
export class BorrowersService {
	constructor(private readonly borrowersRepo: BorrowersRepository) {}

	async create(dto: CreateBorrowerDto): Promise<Borrower> {
		try {
			return await this.borrowersRepo.create(dto);
		} catch (error) {
			if (
				error?.code === '23505' || // Postgres unique violation
				error?.detail?.includes('already exists')
			) {
				throw new ConflictException(`A borrower with email ${dto.email} already exists.`);
			}
			throw error;
		}
	}

	findAll(): Promise<Borrower[]> {
		return this.borrowersRepo.findAll();
	}

	findOne(id: number): Promise<Borrower> {
		return this.borrowersRepo.findOne(id);
	}

	update(id: number, dto: UpdateBorrowerDto): Promise<Borrower> {
		return this.borrowersRepo.update(id, dto);
	}

	remove(id: number): Promise<void> {
		return this.borrowersRepo.remove(id);
	}
}
