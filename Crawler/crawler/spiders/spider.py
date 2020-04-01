# -*- coding: utf-8 -*-
import json, scrapy, re
from scrapy_splash import SplashRequest
from bs4 import BeautifulSoup

class RecursiveSpider(scrapy.Spider):
    name = 'recursive'
    custom_settings = {
        'FEED_URI': 'result.json',
        'FEED_FORMAT': 'json'
    }

    def __init__(self, input):
        self.input = input

    def start_requests(self):
        yield SplashRequest(self.input['visit'], self.run_nested_spiders)

    def run_nested_spiders(self, response):
        for spider_data in self.input['spiders']:
            for result in RecursiveSpider(spider_data).parse(response):
                yield result

    def parse(self, response):
        if self.input['selector'] is not None:
            for extracted in response.css(self.input['selector']).extract():
                result = {}
                result['on'] = response.url
                result['found'] = BeautifulSoup(extracted).get_text().strip() 
                yield result
        elif self.input['visit'] is not None:
            for html in response.css(self.input['visit']).extract():
                visit = re.search('^.+?[^\/:](?=[?\/]|$)', response.url).group(0)
                yield SplashRequest(visit + html.replace(visit, ''), self.run_nested_spiders)