import base64, json, pika, os, sys
from scrapy.crawler import CrawlerProcess
from spiders.spider import *

process = CrawlerProcess()
with open('input.json') as json_file:
    payload = json.load(json_file)
# spiders = SpiderBuilder().build(payload['spiders'])
process.crawl(RecursiveSpider, payload)
process.start()
# guid = sys.argv[2]
    
# push_url = os.getenv('PUSH_URL', default='http://localhost:5000') + '/api/crawlers/' + guid
# with open(GenericSpider.custom_settings['FEED_URI']) as file:
#     content = file.read()
#     payload = json.loads(content)
#     data = json.dumps(payload)
#     response = requests.post(push_url, data=data, headers={'content-type': 'application/json'})
#     print(response)

#     database_url = os.getenv('DATABASE_URL', default='http://localhost:5000')
#     uuid = """{"Id": \"""" + guid + """\""""
#     document = """"Query": """ + data + """}"""
#     command = """UPDATE mt_doc_crawlcommand SET data='{0}, {1}' WHERE id='{2}'""".format(uuid, document, guid)
#     print(command)

#     try:
#         conn = psycopg2.connect(database_url, sslmode='require')
#         # conn = psycopg2.connect("dbname='local' user='postgres' host='localhost' password='postgres'")
#         cur = conn.cursor()
#         cur.execute(command)
#         conn.commit()
#         cur.close()
#     except:
#         print ("I am unable to connect to the database")

#     url = os.environ.get('CLOUDAMQP_URL', 'localhost')
#     params = pika.URLParameters(url)
#     connection = pika.BlockingConnection(params)
#     channel = connection.channel()
#     channel.queue_declare(queue='hello')
#     channel.basic_publish(exchange='', routing_key='hello', body=guid)
#     connection.close()