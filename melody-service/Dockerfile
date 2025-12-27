FROM python:3.11-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Diretório de trabalho
WORKDIR /app

# Copia requirements e instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baixa modelo do Demucs antecipadamente (opcional, para acelerar primeira execução)
# RUN python -c "import demucs.pretrained; demucs.pretrained.get_model('htdemucs')"

# Copia código da aplicação
COPY . .

# Cria diretório de cache
RUN mkdir -p /app/cache

# Expõe porta
EXPOSE 8000

# Comando para iniciar o servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
