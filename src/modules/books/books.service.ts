import { Injectable } from '@nestjs/common';
import { BooksRepository } from './books.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
	constructor(private readonly booksRepo: BooksRepository) {}

	create(dto: CreateBookDto): Promise<Book> {
		return this.booksRepo.create(dto);
	}

	findAll(title?: string, author?: string, isbn?: string): Promise<Book[]> {
		return this.booksRepo.findAll({ title, author, isbn });
	}

	findOne(id: number): Promise<Book> {
		return this.booksRepo.findOne(id);
	}

	update(id: number, dto: UpdateBookDto): Promise<Book> {
		return this.booksRepo.update(id, dto);
	}

	remove(id: number): Promise<void> {
		return this.booksRepo.remove(id);
	}
}
