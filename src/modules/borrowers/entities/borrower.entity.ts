import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Borrowing } from '../../borrowings/entities/borrowing.entity';

@Entity()
export class Borrower {
	@ApiProperty({ example: 1, description: 'Unique identifier' })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ example: 'John Doe', description: 'Borrower’s full name' })
	@Index()
	@Column()
	name: string;

	@ApiProperty({ example: 'john.doe@example.com', description: 'Borrower’s email address' })
	@Column({ unique: true })
	email: string;

	@ApiProperty({
		example: '2025-07-31',
		description: 'Date when the borrower was registered',
	})
	@Column({ type: 'date' })
	registeredDate: string;

	@Exclude()
	@DeleteDateColumn()
	@ApiHideProperty()
	deletedAt?: Date;

	@OneToMany(() => Borrowing, (b) => b.borrower)
	borrowings: Borrowing[];
}
