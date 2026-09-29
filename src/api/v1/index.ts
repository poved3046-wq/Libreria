import { Router } from "express";
import authorRoutes from "../../modules/Autores/rutas";
import bookRoutes from "../../modules/Libro/rutas";
import loanRoutes from "../../modules/Prestamo/rutas";

const router = Router();

router.use("/authors", authorRoutes);
router.use("/books", bookRoutes);
router.use("/loans", loanRoutes);

export default router;