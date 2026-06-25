FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc curl git \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Build frontend
COPY skin-disease-frontend/ ./skin-disease-frontend/
RUN cd skin-disease-frontend && npm install && npm run build

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py pipeline.py state.py db.py vision_node.py ./
COPY routers/ ./routers/
COPY helpers/ ./helpers/

RUN cp -r skin-disease-frontend/dist ./frontend/dist

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]