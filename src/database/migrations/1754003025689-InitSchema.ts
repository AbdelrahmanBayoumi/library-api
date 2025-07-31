import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1754003025689 implements MigrationInterface {
	name = 'InitSchema1754003025689';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "book" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "author" character varying NOT NULL, "isbn" character varying NOT NULL, "availableQuantity" integer NOT NULL DEFAULT '0', "shelfLocation" character varying NOT NULL, CONSTRAINT "UQ_bd183604b9c828c0bdd92cafab7" UNIQUE ("isbn"), CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "borrower" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "registeredDate" date NOT NULL, "deletedAt" TIMESTAMP, CONSTRAINT "UQ_0b2149b696c042d5432bb288001" UNIQUE ("email"), CONSTRAINT "PK_c9737036f657d00897e09029378" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "borrowing" ("id" SERIAL NOT NULL, "borrowDate" date NOT NULL, "dueDate" date NOT NULL, "returnDate" date, "book_id" integer NOT NULL, "borrower_id" integer NOT NULL, CONSTRAINT "PK_5bfeaa4e275c1a2e2ab257f2ee2" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "borrowing" ADD CONSTRAINT "FK_5a5ead47aacc96376e7ab0d1a62" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "borrowing" ADD CONSTRAINT "FK_02cd4db74be6088b8e61b847d98" FOREIGN KEY ("borrower_id") REFERENCES "borrower"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "borrowing" DROP CONSTRAINT "FK_02cd4db74be6088b8e61b847d98"`);
		await queryRunner.query(`ALTER TABLE "borrowing" DROP CONSTRAINT "FK_5a5ead47aacc96376e7ab0d1a62"`);
		await queryRunner.query(`DROP TABLE "borrowing"`);
		await queryRunner.query(`DROP TABLE "borrower"`);
		await queryRunner.query(`DROP TABLE "book"`);
	}
}
