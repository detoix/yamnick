import base64, json, pika, os, sys
from scrapy.crawler import CrawlerProcess, CrawlerRunner
from crawler.spiders.spider import *

def callback(ch, method, props, body):
    print("[x] Received %r" % body)

    results_file = RecursiveSpider.custom_settings['FEED_URI']
    if os.path.exists(results_file):
        os.remove(results_file)

    payload = json.loads(body)
    process = CrawlerProcess()
    process.crawl(RecursiveSpider, payload)
    process.start()

    if (os.path.exists(results_file)):
        with open(results_file) as json_file:
            file_content = json_file.read()
            if file_content:
                results = {}
                results['id'] = payload['id']
                results['results'] = json.loads(file_content)
                content = {}
                content['crawlResults'] = results
                serialized = json.dumps(content)
                print("[x] Pushing ", serialized, " back to caller...")
                channel.basic_publish(
                    exchange='', 
                    routing_key='ClientCommands', 
                    body=serialized, 
                    properties=pika.BasicProperties(reply_to=props.reply_to))
        
    print("[x] Restarting crawler")
    os.execl(sys.executable, sys.executable, *sys.argv)

if __name__ == '__main__':
    url = sys.argv[1]
    params = pika.URLParameters(url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.basic_consume(
        queue='crawl_queue', on_message_callback=callback, auto_ack=True)

    print('[*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()