import base64, json, pika, os, sys
from scrapy.crawler import CrawlerProcess, CrawlerRunner
from crawler.spiders.spider import *

def callback(ch, method, props, body):
    print("[x] Received %r" % body)

    with open('input.json') as json_file:
        payload = json.load(json_file)
    process = CrawlerProcess()
    process.crawl(RecursiveSpider, payload)
    process.start()

    with open('data.json') as json_file:
        channel.basic_publish(exchange='', routing_key=props.reply_to, body=json_file.read())
    print("[x] Processed %r" % body)

if __name__ == '__main__':
    url = os.environ.get('CLOUDAMQP_URL', 'amqp://wenivnjk:qfIQwrfK2nA8oe9pe_i2F_KsVhZwnXWd@bear.rmq.cloudamqp.com/wenivnjk')
    params = pika.URLParameters(url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.basic_consume(
        queue='crawl_queue', on_message_callback=callback, auto_ack=True)

    print('[*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()