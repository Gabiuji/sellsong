/**
 * Funções de validação reutilizáveis para o projeto
 * Evita duplicação de código e garante validação consistente
 */

/**
 * Valida força da senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 */
export const validatePasswordStrength = (
  password: string,
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Senha deve ter no mínimo 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra maiúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Senha deve conter pelo menos um número");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(
      "Senha deve conter pelo menos um caractere especial (!@#$%^&*...)",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida username
 * Requisitos:
 * - Mínimo 3 caracteres
 * - Máximo 30 caracteres
 * - Apenas letras, números, underscores e hífens
 */
export const validateUsername = (
  username: string,
): {
  isValid: boolean;
  error?: string;
} => {
  if (username.length < 3) {
    return {
      isValid: false,
      error: "Username deve ter no mínimo 3 caracteres",
    };
  }

  if (username.length > 30) {
    return {
      isValid: false,
      error: "Username deve ter no máximo 30 caracteres",
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      isValid: false,
      error: "Username pode conter apenas letras, números, underscore e hífen",
    };
  }

  return { isValid: true };
};

/**
 * Valida e sanitiza caption de stories
 * Requisitos:
 * - Mínimo 1 caractere
 * - Máximo 150 caracteres
 */
export const validateCaption = (
  caption: string,
): {
  isValid: boolean;
  error?: string;
} => {
  if (!caption || caption.trim().length === 0) {
    return {
      isValid: false,
      error: "Caption não pode estar vazia",
    };
  }

  if (caption.length > 150) {
    return {
      isValid: false,
      error: "Caption deve ter no máximo 150 caracteres",
    };
  }

  return { isValid: true };
};

/**
 * Valida rating
 * Requisitos:
 * - Número entre 1 e 5
 */
export const validateRating = (
  rating: any,
): {
  isValid: boolean;
  error?: string;
} => {
  const ratingNum = parseFloat(rating);

  if (isNaN(ratingNum)) {
    return {
      isValid: false,
      error: "Rating deve ser um número",
    };
  }

  if (ratingNum < 1 || ratingNum > 5) {
    return {
      isValid: false,
      error: "Rating deve estar entre 1 e 5",
    };
  }

  return { isValid: true };
};

/**
 * Valida posição no Top 4
 * Requisitos:
 * - Número entre 1 e 4
 */
export const validateTopFourPosition = (
  position: any,
): {
  isValid: boolean;
  error?: string;
} => {
  const pos = parseInt(position);

  if (isNaN(pos)) {
    return {
      isValid: false,
      error: "Posição deve ser um número",
    };
  }

  if (pos < 1 || pos > 4) {
    return {
      isValid: false,
      error: "Posição deve estar entre 1 e 4",
    };
  }

  return { isValid: true };
};

/**
 * Sanitiza string removendo possíveis tags HTML/XSS
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, "") // Remove < e >
    .trim();
};

/**
 * Valida ID (deve ser número positivo)
 */
export const validateId = (
  id: any,
): {
  isValid: boolean;
  error?: string;
} => {
  const idNum = parseInt(id);

  if (isNaN(idNum) || idNum <= 0) {
    return {
      isValid: false,
      error: "ID deve ser um número positivo",
    };
  }

  return { isValid: true };
};
