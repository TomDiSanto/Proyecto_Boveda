import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', routes);

// Centralized error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Backend Error:', err.message || err);

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'Ocurrió un error inesperado';

  // Postgres custom exceptions raised by our plpgsql functions
  if (err.message) {
    if (err.message.includes('SALDO_INSUFICIENTE')) {
      statusCode = 409;
      errorCode = 'INSUFFICIENT_FUNDS';
      message = 'El saldo es insuficiente para completar la operación.';
    } else if (err.message.includes('MONTO_INVALIDO')) {
      statusCode = 422;
      errorCode = 'INVALID_AMOUNT';
      message = 'El monto debe ser mayor a cero.';
    } else if (err.message.includes('ORIGEN_Y_DESTINO_IGUALES')) {
      statusCode = 422;
      errorCode = 'SAME_SOURCE_AND_DESTINATION';
      message = 'La cuenta de origen y destino no pueden ser la misma.';
    } else if (err.message.includes('CUENTA_INEXISTENTE')) {
      statusCode = 404;
      errorCode = 'ACCOUNT_NOT_FOUND';
      message = 'La cuenta especificada no existe.';
    }
  }

  // Handle common postgres constraint violations
  if (err.code === '23503') { // foreign_key_violation
    statusCode = 404;
    errorCode = 'ACCOUNT_NOT_FOUND';
    message = 'La cuenta especificada no existe.';
  } else if (err.code === '22P02') { // invalid_text_representation
    statusCode = 400;
    errorCode = 'INVALID_ID_FORMAT';
    message = 'El formato del ID es inválido.';
  } else if (err.code === '23514') { // check_violation
    statusCode = 422;
    errorCode = 'CONSTRAINT_VIOLATION';
    message = 'Violación de restricción de integridad.';
  }

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
    }
  });
};

app.use(errorHandler);

export default app;
