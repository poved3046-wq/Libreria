import { ObjectId } from "mongodb";
import { Loan, LoanDTO } from "./modelo";
import { LoanRepository } from "./repositorio";
import { BookRepository } from "../Libro/repositorio";
import {
    BadRequestError,
    NotFoundError
} from "../../shared/errors/AppError";

export class LoanService {
    private readonly loanRepository = new LoanRepository();
    private readonly bookRepository = new BookRepository();

    async create(data: LoanDTO): Promise<Loan> {
        if (!data.bookId || !ObjectId.isValid(data.bookId)) {
            throw new BadRequestError(
                "El campo 'bookId' debe ser un ObjectId válido"
            );
        }

        const bookId = new ObjectId(data.bookId);

        const book = await this.bookRepository.findById(bookId);

        if (!book) {
            throw new NotFoundError("Libro no encontrado");
        }

        if (!book.available) {
            throw new BadRequestError(
                "El libro no está disponible para préstamo"
            );
        }

        const userName = this.requireString(
            data.userName,
            "userName"
        );

        if (!data.loanDate) {
            throw new BadRequestError(
                "El campo 'loanDate' es obligatorio"
            );
        }

        const loanDate = new Date(data.loanDate);

        if (Number.isNaN(loanDate.getTime())) {
            throw new BadRequestError(
                "El campo 'loanDate' debe contener una fecha válida"
            );
        }

        const now = new Date();

        const loan = await this.loanRepository.create({
            bookId,
            userName,
            loanDate,
            returned: false,
            createdAt: now,
            updatedAt: now
        });

        await this.bookRepository.update(bookId, {
            available: false,
            updatedAt: new Date()
        });

        return loan;
    }

    async findAll(): Promise<Loan[]> {
        return this.loanRepository.findAll();
    }

    async findById(id: string): Promise<Loan> {
        const objectId = this.toObjectId(id);

        const loan = await this.loanRepository.findById(objectId);

        if (!loan) {
            throw new NotFoundError("Préstamo no encontrado");
        }

        return loan;
    }

    async update(id: string, data: LoanDTO): Promise<Loan> {
        const objectId = this.toObjectId(id);

        const currentLoan =
            await this.loanRepository.findById(objectId);

        if (!currentLoan) {
            throw new NotFoundError("Préstamo no encontrado");
        }

        const changes: Partial<Loan> = {};

        if (data.userName !== undefined) {
            changes.userName = this.requireString(
                data.userName,
                "userName"
            );
        }

        if (data.loanDate !== undefined) {
            const loanDate = new Date(data.loanDate);

            if (Number.isNaN(loanDate.getTime())) {
                throw new BadRequestError(
                    "El campo 'loanDate' debe contener una fecha válida"
                );
            }

            changes.loanDate = loanDate;
        }

        if (data.returned === true && !currentLoan.returned) {
            const book = await this.bookRepository.findById(
                currentLoan.bookId
            );

            if (!book) {
                throw new NotFoundError("Libro asociado no encontrado");
            }

            changes.returned = true;
            changes.returnDate = new Date();

            await this.bookRepository.update(currentLoan.bookId, {
                available: true,
                updatedAt: new Date()
            });
        }

        if (data.returned === false && currentLoan.returned) {
            throw new BadRequestError(
                "Un préstamo devuelto no puede volver a estado activo"
            );
        }

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError(
                "No se enviaron campos para actualizar"
            );
        }

        changes.updatedAt = new Date();

        const updated = await this.loanRepository.update(
            objectId,
            changes
        );

        if (!updated) {
            throw new NotFoundError("Préstamo no encontrado");
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        const objectId = this.toObjectId(id);

        const loan = await this.loanRepository.findById(objectId);

        if (!loan) {
            throw new NotFoundError("Préstamo no encontrado");
        }

        const deleted =
            await this.loanRepository.delete(objectId);

        if (!deleted) {
            throw new NotFoundError("Préstamo no encontrado");
        }

        if (!loan.returned) {
            await this.bookRepository.update(loan.bookId, {
                available: true,
                updatedAt: new Date()
            });
        }
    }

    private requireString(
        value: unknown,
        field: string
    ): string {
        if (
            typeof value !== "string" ||
            value.trim() === ""
        ) {
            throw new BadRequestError(
                `El campo '${field}' es obligatorio y debe ser un texto no vacío`
            );
        }

        return value.trim();
    }

    private toObjectId(id: string): ObjectId {
        if (!ObjectId.isValid(id)) {
            throw new BadRequestError(
                `Identificador inválido: ${id}`
            );
        }

        return new ObjectId(id);
    }
}