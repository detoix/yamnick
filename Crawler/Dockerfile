FROM python:3.7-alpine

WORKDIR /server
COPY . .
RUN apk add --update --no-cache libressl-dev musl-dev libffi-dev gcc libxml2-dev libxslt-dev
RUN pip install -r requirements.txt
CMD python -u main.py $AMQPURL