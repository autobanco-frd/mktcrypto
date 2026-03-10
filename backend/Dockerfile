FROM python:3.11-slim

# 1. Herramientas del sistema necesarias para compilar librerías criptográficas y PostgreSQL
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar Poetry de forma robusta
ENV POETRY_VERSION=1.7.1
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

# 3. CONFIGURACIÓN ANTI-ERRORES
# No crear virtualenv (usar el global del contenedor)
RUN poetry config virtualenvs.create false

WORKDIR /app

# 4. Primero solo los archivos de dependencias para usar el cache de Docker
COPY pyproject.toml poetry.lock* ./

# 5. Instalación con flags de estabilidad
RUN poetry install --no-interaction --no-ansi --no-root

# 6. Copiar el resto del código
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
