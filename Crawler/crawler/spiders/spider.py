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
        self.counter = 0
        self.max_count = 50
        self.startUrl = input['startUrl']
        self.collect = input['collect']
        self.follow = input['follow']
        self.base_url = re.search('^.+?[^\/:](?=[?\/]|$)', self.startUrl).group(0)

    def start_requests(self):
        if self.startUrl:
            yield SplashRequest(self.startUrl, self.go)

    def go(self, response):
        if self.collect:
            for selector in self.collect:
                if selector:
                    for extracted in response.css(selector).extract():
                        if self.counter < self.max_count:
                            self.counter = self.counter + 1
                            referer = response.request.headers.get('referer')
                            result = {}
                            result['on'] = response.url
                            if referer is not None:
                                result['from'] = referer.decode('utf-8')
                            result['found'] = BeautifulSoup(extracted).get_text().strip() 
                            yield result

        if self.counter < self.max_count:
            if self.follow:
                for selector in self.follow:
                    if selector:
                        for extracted in response.css(selector + '::attr(href)').extract():
                            yield SplashRequest(self.base_url + extracted.replace(self.base_url, ''), self.go)