// src/modules/reports/reports.controller.ts

import { BadRequestException, Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportFormat, ReportsService } from './reports.service';

interface ExportOptions {
	format: ExportFormat;
	filename: string;
	contentType: string;
}

@ApiTags('Reports')
@Controller('reports/borrowings')
export class ReportsController {
	constructor(private readonly reports: ReportsService) {}

	@Get('analytics')
	@ApiOperation({ summary: 'Get borrowing analytics for a period' })
	@ApiOkResponse({
		schema: {
			properties: {
				totalBorrowed: { type: 'integer' },
				totalReturned: { type: 'integer' },
				totalOverdue: { type: 'integer' },
				daily: {
					type: 'array',
					items: {
						type: 'object',
						properties: { date: { type: 'string' }, count: { type: 'integer' } },
					},
				},
				topBooks: {
					type: 'array',
					items: {
						type: 'object',
						properties: { title: { type: 'string' }, count: { type: 'integer' } },
					},
				},
				topBorrowers: {
					type: 'array',
					items: {
						type: 'object',
						properties: { name: { type: 'string' }, count: { type: 'integer' } },
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Invalid date range' })
	@ApiQuery({ name: 'startDate', description: 'YYYY-MM-DD', required: true })
	@ApiQuery({ name: 'endDate', description: 'YYYY-MM-DD', required: true })
	async getBorrowingsAnalytics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
		this.validateDateRange(startDate, endDate);
		return this.reports.getBorrowingReport(startDate, endDate);
	}

	@Get('analytics/export')
	@ApiOperation({ summary: 'Export borrowing report as CSV or XLSX' })
	@ApiQuery({ name: 'startDate', required: true })
	@ApiQuery({ name: 'endDate', required: true })
	@ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
	async exportBorrowingsAnalytics(
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
		@Query('format') format: ExportFormat = 'csv',
		@Res() res: Response
	) {
		this.validateDateRange(startDate, endDate);
		const buffer = await this.reports.exportBorrowingReport(startDate, endDate, format);
		const options = this.getExportOptions(format, `borrowing-report-${startDate}-to-${endDate}`);
		this.sendFileResponse(res, buffer, options);
	}

	@Get('overdue-last-month')
	@ApiOperation({ summary: "Export last month's overdue borrowings" })
	@ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
	async exportOverdueLastMonth(@Query('format') format: ExportFormat = 'csv', @Res() res: Response) {
		const buffer = await this.reports.exportLastMonthOverdue(format);
		const options = this.getExportOptions(format, 'overdue-last-month');
		this.sendFileResponse(res, buffer, options);
	}

	@Get('last-month')
	@ApiOperation({ summary: 'Export all borrowings of the last month' })
	@ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
	async exportLastMonthBorrowings(@Query('format') format: ExportFormat = 'csv', @Res() res: Response) {
		const buffer = await this.reports.exportLastMonthBorrowings(format);
		const options = this.getExportOptions(format, 'last-month-borrowings');
		this.sendFileResponse(res, buffer, options);
	}

	private validateDateRange(startDate: string, endDate: string): void {
		if (!startDate || !endDate) {
			throw new BadRequestException('startDate and endDate required');
		}
	}

	private getExportOptions(format: ExportFormat, baseFilename: string): ExportOptions {
		const ext = format === 'xlsx' ? 'xlsx' : 'csv';
		const contentType =
			format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';

		return {
			format,
			filename: `${baseFilename}.${ext}`,
			contentType,
		};
	}

	private sendFileResponse(res: Response, buffer: Buffer, options: ExportOptions): void {
		res.status(HttpStatus.OK)
			.header('Content-Disposition', `attachment; filename="${options.filename}"`)
			.header('Content-Type', options.contentType)
			.send(buffer);
	}
}
