FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc curl git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN pip show sentence-transformers || echo "sentence-transformers NOT installed"
RUN pip show langchain-huggingface || echo "langchain-huggingface NOT installed"

RUN mkdir -p /app/data_persist
VOLUME /app/data_persist

COPY . .

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]