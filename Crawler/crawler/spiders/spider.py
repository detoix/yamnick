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
        self.base_url = re.search('^.+?[^\/:](?=[?\/]|$)', input['startUrl']).group(0)

    def start_requests(self):
        yield SplashRequest(self.input['startUrl'], self.go)

    def go(self, response):
        for selector in self.input['collect']:
            for extracted in response.css(selector).extract():
                result = {}
                result['on'] = response.url
                result['found'] = BeautifulSoup(extracted).get_text().strip() 
                yield result

        for selector in self.input['follow']:
            for extracted in response.css(selector + '::attr(href)').extract():
                yield SplashRequest(self.base_url + extracted.replace(self.base_url, ''), self.go)