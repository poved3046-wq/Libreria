import { ObjectId } from "mongodb";
import { Author, AuthorDTO } from "./modelo";
import { AuthorRepository } from "./repositorio";
import {
    BadRequestError,
    NotFoundError
} from "../../shared/errors/AppError";

export class AuthorService {

    private readonly authorRepository = new AuthorRepository();

    async create(data: AuthorDTO): Promise<Author> {

        const name = this.requireString(data?.name, "name");

        const nationality = this.requireString(
            data?.nationality,
            "nationality"
        );

        let birthYear: number | undefined;

        if (data.birthYear !== undefined) {
            birthYear = this.validateBirthYear(data.birthYear);
        }

        const now = new Date();

        return this.authorRepository.create({
            name,
            nationality,
            birthYear,
            createdAt: now,
            updatedAt: now
        });
    }

    async findAll(): Promise<Author[]> {
        return this.authorRepository.findAll();
    }

    async findById(id: string): Promise<Author> {

        const objectId = this.toObjectId(id);

        const author = await this.authorRepository.findById(objectId);

        if (!author) {
            throw new NotFoundError("Autor no encontrado");
        }

        return author;
    }

    async update(id: string, data: AuthorDTO): Promise<Author> {

        const objectId = this.toObjectId(id);

        const changes: Partial<Author> = {};

        if (data.name !== undefined) {
            changes.name = this.requireString(data.name, "name");
        }

        if (data.nationality !== undefined) {
            changes.nationality = this.requireString(
                data.nationality,
                "nationality"
            );
        }

        if (data.birthYear !== undefined) {
            changes.birthYear = this.validateBirthYear(data.birthYear);
        }

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError(
                "No se enviaron campos para actualizar"
            );
        }

        changes.updatedAt = new Date();

        const updated = await this.authorRepository.update(
            objectId,
            changes
        );

        if (!updated) {
            throw new NotFoundError("Autor no encontrado");
        }

        return updated;
    }

    async delete(id: string): Promise<void> {

        const objectId = this.toObjectId(id);

        const author = await this.authorRepository.findById(objectId);

        if (!author) {
            throw new NotFoundError("Autor no encontrado");
        }

        const booksCount =
            await this.authorRepository.countBooksByAuthor(objectId);

        if (booksCount > 0) {
            throw new BadRequestError(
                "No se puede eliminar el autor porque tiene libros asociados"
            );
        }

        const deleted = await this.authorRepository.delete(objectId);

        if (!deleted) {
            throw new NotFoundError("Autor no encontrado");
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

    private validateBirthYear(value: unknown): number {

        if (
            typeof value !== "number" ||
            !Number.isInteger(value) ||
            value <= 0
        ) {
            throw new BadRequestError(
                "El campo 'birthYear' debe ser un número entero positivo"
            );
        }

        return value;
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