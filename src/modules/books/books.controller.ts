// src/modules/books/books.controller.ts

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';

import { Throttle } from '@nestjs/throttler';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@ApiTags('Books')
@Controller('books')
export class BooksController {
	constructor(private readonly booksService: BooksService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new book' })
	@ApiCreatedResponse({
		description: 'The book has been successfully created.',
		type: Book,
	})
	@ApiBadRequestResponse({ description: 'Invalid input data.' })
	@ApiBody({ type: CreateBookDto })
	create(@Body() dto: CreateBookDto): Promise<Book> {
		return this.booksService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all books (with optional filters)' })
	@ApiOkResponse({
		description: 'Paginated list of books',
		schema: {
			properties: {
				data: {
					type: 'array',
					items: { $ref: '#/components/schemas/Book' },
				},
				total: {
					type: 'number',
					description: 'Total number of records',
				},
			},
		},
	})
	@ApiQuery({ name: 'page', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({
		name: 'sortBy',
		required: false,
		enum: ['title', 'author', 'isbn'],
	})
	@ApiQuery({
		name: 'sortOrder',
		required: false,
		enum: ['ASC', 'DESC'],
	})
	@ApiQuery({
		name: 'title',
		required: false,
		description: 'Partial match on title',
		type: String,
	})
	@ApiQuery({
		name: 'author',
		required: false,
		description: 'Partial match on author',
		type: String,
	})
	@ApiQuery({
		name: 'isbn',
		required: false,
		description: 'Exact match on ISBN',
		type: String,
	})
	@Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests per minute
	async findAll(
		@Query('title') title?: string,
		@Query('author') author?: string,
		@Query('isbn') isbn?: string,
		@Query('page') page?: number,
		@Query('limit') limit?: number,
		@Query('sortBy') sortBy?: 'title' | 'author' | 'isbn',
		@Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
	): Promise<{ data: Book[]; total: number }> {
		return this.booksService
			.findAll({ title, author, isbn, page, limit, sortBy, sortOrder })
			.then(([data, total]) => ({ data, total }));
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a book by its ID' })
	@ApiOkResponse({ description: 'The found book', type: Book })
	@ApiNotFoundResponse({ description: 'Book not found.' })
	@ApiParam({
		name: 'id',
		description: 'Numeric ID of the book to retrieve',
		type: Number,
	})
	findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
		return this.booksService.findOne(id);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Update an existing book' })
	@ApiOkResponse({ description: 'The updated book', type: Book })
	@ApiBadRequestResponse({ description: 'Invalid input data.' })
	@ApiNotFoundResponse({ description: 'Book not found.' })
	@ApiParam({
		name: 'id',
		description: 'ID of the book to update',
		type: Number,
	})
	@ApiBody({ type: UpdateBookDto })
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto): Promise<Book> {
		return this.booksService.update(id, dto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a book by its ID' })
	@ApiNoContentResponse({ description: 'Book successfully deleted.' })
	@ApiNotFoundResponse({ description: 'Book not found.' })
	@ApiParam({
		name: 'id',
		description: 'ID of the book to delete',
		type: Number,
	})
	remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.booksService.remove(id);
	}
}
