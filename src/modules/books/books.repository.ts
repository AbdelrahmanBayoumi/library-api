import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksRepository {
	constructor(
		@InjectRepository(Book)
		private readonly repo: Repository<Book>
	) {}

	async create(dto: CreateBookDto): Promise<Book> {
		try {
			return await this.repo.save(this.repo.create(dto));
		} catch (error) {
			if (error?.code === '23505' && error?.detail?.includes('isbn')) {
				throw new ConflictException(`A book with ISBN ${dto.isbn} already exists.`);
			}
			throw error;
		}
	}

	async findAll(filters?: {
		title?: string;
		author?: string;
		isbn?: string;
		page?: number;
		limit?: number;
		sortBy?: 'title' | 'author' | 'isbn';
		sortOrder?: 'ASC' | 'DESC';
	}): Promise<[Book[], number]> {
		const qb = this.repo.createQueryBuilder('book');

		// Apply filters
		if (filters?.title) {
			qb.andWhere('LOWER(book.title) LIKE LOWER(:title)', {
				title: `%${filters.title}%`,
			});
		}
		if (filters?.author) {
			qb.andWhere('LOWER(book.author) LIKE LOWER(:author)', {
				author: `%${filters.author}%`,
			});
		}
		if (filters?.isbn) {
			qb.andWhere('book.isbn = :isbn', { isbn: filters.isbn });
		}

		// Apply sorting
		if (filters?.sortBy) {
			qb.orderBy(`book.${filters.sortBy}`, filters.sortOrder || 'ASC');
		}

		// Apply pagination
		const page = filters?.page || 1;
		const limit = filters?.limit || 10;
		qb.skip((page - 1) * limit).take(limit);

		// Return both data and total count
		return qb.getManyAndCount();
	}

	async findOne(id: number): Promise<Book> {
		const book = await this.repo.findOne({ where: { id } });
		if (!book) {
			throw new NotFoundException(`Book with id ${id} not found`);
		}
		return book;
	}

	async update(id: number, dto: UpdateBookDto): Promise<Book> {
		await this.repo.update(id, dto);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		const { affected } = await this.repo.delete(id);
		if (affected === 0) {
			throw new NotFoundException(`Book with id ${id} not found`);
		}
	}
}
