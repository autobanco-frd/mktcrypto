FROM python:3.9-slim

RUN apt-get update && apt-get install -y build-essential libssl-dev libffi-dev python3-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
