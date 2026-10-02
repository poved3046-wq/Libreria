import { ObjectId } from "mongodb";
import { Book, BookDTO } from "./model";
import { BookRepository } from "./repository";
import {
    BadRequestError,
    NotFoundError
} from "../../shared/errors/AppError";

export class BookService {
    private readonly bookRepository = new BookRepository();

    async create(data: BookDTO): Promise<Book> {
        const title = this.requireString(data?.title, "title");
        const isbn = this.requireString(data?.isbn, "isbn");

        if (!data.authorId || !ObjectId.isValid(data.authorId)) {
            throw new BadRequestError(
                "El campo 'authorId' debe ser un ObjectId válido"
            );
        }

        const authorId = new ObjectId(data.authorId);

        const isbnExists = await this.bookRepository.existsByIsbn(isbn);

        if (isbnExists) {
            throw new BadRequestError(
                "Ya existe un libro con ese ISBN"
            );
        }

        let year: number | undefined;

        if (data.year !== undefined) {
            if (
                typeof data.year !== "number" ||
                !Number.isInteger(data.year)
            ) {
                throw new BadRequestError(
                    "El campo 'year' debe ser un número entero"
                );
            }

            year = data.year;
        }

        const now = new Date();

        return this.bookRepository.create({
            title,
            isbn,
            authorId,
            year,
            available: true,
            createdAt: now,
            updatedAt: now
        });
    }

    async findAll(): Promise<Book[]> {
        return this.bookRepository.findAll();
    }

    async findById(id: string): Promise<Book> {
        const objectId = this.toObjectId(id);

        const book = await this.bookRepository.findById(objectId);

        if (!book) {
            throw new NotFoundError("Libro no encontrado");
        }

        return book;
    }

    async update(id: string, data: BookDTO): Promise<Book> {
        const objectId = this.toObjectId(id);

        const changes: Partial<Book> = {};

        if (data.title !== undefined) {
            changes.title = this.requireString(data.title, "title");
        }

        if (data.isbn !== undefined) {
            const isbn = this.requireString(data.isbn, "isbn");

            const existingBook =
                await this.bookRepository.existsByIsbn(isbn);

            if (existingBook) {
                const currentBook =
                    await this.bookRepository.findById(objectId);

                if (!currentBook || currentBook.isbn !== isbn) {
                    throw new BadRequestError(
                        "Ya existe un libro con ese ISBN"
                    );
                }
            }

            changes.isbn = isbn;
        }

        if (data.authorId !== undefined) {
            if (!ObjectId.isValid(data.authorId)) {
                throw new BadRequestError(
                    "El campo 'authorId' debe ser un ObjectId válido"
                );
            }

            changes.authorId = new ObjectId(data.authorId);
        }

        if (data.year !== undefined) {
            if (
                typeof data.year !== "number" ||
                !Number.isInteger(data.year)
            ) {
                throw new BadRequestError(
                    "El campo 'year' debe ser un número entero"
                );
            }

            changes.year = data.year;
        }

        if (data.available !== undefined) {
            if (typeof data.available !== "boolean") {
                throw new BadRequestError(
                    "El campo 'available' debe ser booleano"
                );
            }

            changes.available = data.available;
        }

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError(
                "No se enviaron campos para actualizar"
            );
        }

        changes.updatedAt = new Date();

        const updated = await this.bookRepository.update(
            objectId,
            changes
        );

        if (!updated) {
            throw new NotFoundError("Libro no encontrado");
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        const objectId = this.toObjectId(id);

        const book = await this.bookRepository.findById(objectId);

        if (!book) {
            throw new NotFoundError("Libro no encontrado");
        }

        const deleted = await this.bookRepository.delete(objectId);

        if (!deleted) {
            throw new NotFoundError("Libro no encontrado");
        }
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || value.trim() === "") {
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