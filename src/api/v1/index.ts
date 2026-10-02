import { Router } from "express";
import authorRoutes from "../../modules/Autores/rutes";
import bookRoutes from "../../modules/Libro/rutes";
import loanRoutes from "../../modules/Prestamo/rutes";

const router = Router();

router.use("/authors", authorRoutes);
router.use("/books", bookRoutes);
router.use("/loans", loanRoutes);

export default router;