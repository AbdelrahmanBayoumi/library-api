// src/modules/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { createObjectCsvStringifier } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import { BorrowingsRepository } from '../borrowings/borrowings.repository';
import { Borrowing } from '../borrowings/entities/borrowing.entity';

export type ExportFormat = 'csv' | 'xlsx';

export interface BorrowingRecord {
	id: number;
	bookTitle: string;
	borrowerName: string;
	borrowDate: string;
	dueDate: string;
	returnDate: string;
}

export interface AnalyticsReport {
	totalBorrowed: number;
	totalReturned: number;
	totalOverdue: number;
	daily: Array<{ date: string; count: number }>;
	topBooks: Array<{ title: string; count: number }>;
	topBorrowers: Array<{ name: string; count: number }>;
}

@Injectable()
export class ReportsService {
	constructor(private readonly borrowingsRepo: BorrowingsRepository) {}

	/** Compute analytics */
	async getBorrowingReport(start: string, end: string): Promise<AnalyticsReport> {
		const records = await this.borrowingsRepo.findInPeriod(start, end);

		const totalBorrowed = records.length;
		const totalReturned = records.filter((r) => r.returnDate && r.returnDate <= end).length;
		const totalOverdue = records.filter(
			(r) => !r.returnDate && r.dueDate < new Date().toISOString().slice(0, 10)
		).length;

		const daily = this.calculateDailyCounts(records);
		const topBooks = this.calculateTopBooks(records, 10);
		const topBorrowers = this.calculateTopBorrowers(records, 10);

		return { totalBorrowed, totalReturned, totalOverdue, daily, topBooks, topBorrowers };
	}

	/** Export borrowing report as CSV or XLSX */
	async exportBorrowingReport(start: string, end: string, format: ExportFormat): Promise<Buffer> {
		const report = await this.getBorrowingReport(start, end);

		if (format === 'csv') {
			return this.exportAnalyticsAsCsv(report);
		} else {
			return this.exportAnalyticsAsExcel(report);
		}
	}

	/**
	 * Export last month's overdue borrowings
	 */
	async exportLastMonthOverdue(format: ExportFormat): Promise<Buffer> {
		const { startDate, endDate } = this.getLastMonthRange();
		const records = await this.borrowingsRepo.findOverdueInPeriod(startDate, endDate);
		const mappedRecords = this.mapBorrowingRecords(records);

		return this.exportRecords(format, mappedRecords, 'Overdue Last Month');
	}

	/**
	 * Export last month's borrowings
	 */
	async exportLastMonthBorrowings(format: ExportFormat): Promise<Buffer> {
		const { startDate, endDate } = this.getLastMonthRange();
		const records = await this.borrowingsRepo.findInPeriod(startDate, endDate);
		const mappedRecords = this.mapBorrowingRecords(records);

		return this.exportRecords(format, mappedRecords, 'Last Month Borrowings');
	}

	private calculateDailyCounts(records: Borrowing[]): Array<{ date: string; count: number }> {
		const byDate = records.reduce(
			(acc, r) => {
				const d = r.borrowDate;
				acc[d] = (acc[d] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);
		return Object.entries(byDate).map(([date, count]) => ({ date, count: count as number }));
	}

	private calculateTopBooks(records: Borrowing[], limit: number): Array<{ title: string; count: number }> {
		const items = records.reduce(
			(m, r) => {
				m[r.book.title] = (m[r.book.title] || 0) + 1;
				return m;
			},
			{} as Record<string, number>
		);

		return Object.entries(items)
			.map(([title, count]) => ({ title, count: count as number }))
			.sort((a, b) => (b.count as number) - (a.count as number))
			.slice(0, limit);
	}

	private calculateTopBorrowers(records: Borrowing[], limit: number): Array<{ name: string; count: number }> {
		const items = records.reduce(
			(m, r) => {
				m[r.borrower.name] = (m[r.borrower.name] || 0) + 1;
				return m;
			},
			{} as Record<string, number>
		);

		return Object.entries(items)
			.map(([name, count]) => ({ name, count: count as number }))
			.sort((a, b) => (b.count as number) - (a.count as number))
			.slice(0, limit);
	}

	private getLastMonthRange(): { startDate: string; endDate: string } {
		const today = new Date();
		const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const lastMonthEnd = new Date(firstOfThisMonth.getTime() - 1);
		const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);

		return {
			startDate: lastMonthStart.toISOString().slice(0, 10),
			endDate: lastMonthEnd.toISOString().slice(0, 10),
		};
	}

	private mapBorrowingRecords(records: Borrowing[]): BorrowingRecord[] {
		return records.map((b) => ({
			id: b.id,
			bookTitle: b.book.title,
			borrowerName: b.borrower.name,
			borrowDate: b.borrowDate,
			dueDate: b.dueDate,
			returnDate: b.returnDate ?? '',
		}));
	}

	private exportAnalyticsAsCsv(report: AnalyticsReport): Buffer {
		const csv = createObjectCsvStringifier({
			header: [
				{ id: 'metric', title: 'Metric' },
				{ id: 'value', title: 'Value' },
			],
		});

		const rows = [
			{ metric: 'Total Borrowed', value: report.totalBorrowed },
			{ metric: 'Total Returned', value: report.totalReturned },
			{ metric: 'Total Overdue', value: report.totalOverdue },
		];

		const content = csv.getHeaderString() + csv.stringifyRecords(rows);
		return Buffer.from(content, 'utf8');
	}

	private async exportAnalyticsAsExcel(report: AnalyticsReport): Promise<Buffer> {
		const wb = new ExcelJS.Workbook();

		// Summary sheet
		const summarySheet = wb.addWorksheet('Summary');
		summarySheet.addRow(['Metric', 'Value']);
		summarySheet.addRow(['Total Borrowed', report.totalBorrowed]);
		summarySheet.addRow(['Total Returned', report.totalReturned]);
		summarySheet.addRow(['Total Overdue', report.totalOverdue]);

		// Daily sheet
		const dailySheet = wb.addWorksheet('Daily');
		dailySheet.addRow(['Date', 'Borrow Count']);
		report.daily.forEach((r) => dailySheet.addRow([r.date, r.count]));

		// TopBooks sheet
		const topBooksSheet = wb.addWorksheet('Top Books');
		topBooksSheet.addRow(['Book Title', 'Count']);
		report.topBooks.forEach((b) => topBooksSheet.addRow([b.title, b.count]));

		// TopBorrowers sheet
		const topBorrowersSheet = wb.addWorksheet('Top Borrowers');
		topBorrowersSheet.addRow(['Borrower', 'Count']);
		report.topBorrowers.forEach((b) => topBorrowersSheet.addRow([b.name, b.count]));

		const arrayBuffer = await wb.xlsx.writeBuffer();
		return Buffer.from(arrayBuffer);
	}

	private async exportRecords(format: ExportFormat, records: BorrowingRecord[], sheetName: string): Promise<Buffer> {
		const headers = [
			{ id: 'id', title: 'ID' },
			{ id: 'bookTitle', title: 'Book Title' },
			{ id: 'borrowerName', title: 'Borrower' },
			{ id: 'borrowDate', title: 'Borrow Date' },
			{ id: 'dueDate', title: 'Due Date' },
			{ id: 'returnDate', title: 'Return Date' },
		];

		if (format === 'csv') {
			const csvStringifier = createObjectCsvStringifier({ header: headers });
			const header = csvStringifier.getHeaderString();
			const content = csvStringifier.stringifyRecords(records);
			return Buffer.from(header + content, 'utf8');
		} else {
			const workbook = new ExcelJS.Workbook();
			const sheet = workbook.addWorksheet(sheetName);

			// Add headers
			sheet.addRow(headers.map((h) => h.title));

			// Add data rows
			records.forEach((r) =>
				sheet.addRow([r.id, r.bookTitle, r.borrowerName, r.borrowDate, r.dueDate, r.returnDate])
			);

			// Auto-adjust column widths
			this.autoAdjustColumnWidths(sheet);

			const arrayBuffer = await workbook.xlsx.writeBuffer();
			return Buffer.from(arrayBuffer);
		}
	}

	private autoAdjustColumnWidths(sheet: ExcelJS.Worksheet): void {
		sheet.columns.forEach((col) => {
			let max = 10;
			col.eachCell({ includeEmpty: true }, (cell) => {
				const len = cell.value?.toString().length ?? 0;
				if (len > max) max = len;
			});
			col.width = max + 2;
		});
	}
}
