var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var util = require('util');
var fetch = require('./lrytas-article-comment-fetcher').fetch;

// constants
var PORTAL_NAME = 'LRytas';

function createCommentFetchers(links, options, $) {	
	return links.map(function(i, link) {
		return createSingleFetcher(link, options, $);
	});	
}

function createSingleFetcher(el, options, $) {
	return function(callback) {

		var $el = $(el),
			articleLink = $el.closest('.nw').prev();			

		var fetchOptions = { 
			articleUrl: '',
			articleName: articleLink.text().trim(),
			commentsUrl: $el.attr('href'),
			portalName: 'LRytas',
			newerThan: options.newerThan,
			host: options.host
		}

		fetch(fetchOptions, callback);
	};
}

var extract = function(url, newerThan, callback) {

	request(url, function(err, resp, body) {
		if (err) {
			return callback(err, null);
		}

		var $ = cheerio.load(body),
			$commentLinks = $('a.k'),
			options = {newerThan: newerThan, host: url},
			fetchers = 
				createCommentFetchers($commentLinks, options, $);			

		var parallelCallback = function(err, results){
   			if (err) {
   				return callback(err, null);
   			}

   			var comments = [];
   			
   			results.forEach(function(resultArray) {
   				comments = comments.concat(resultArray);                
   			});            

   			callback(null, comments);
		}	
		
		async.parallel(fetchers, parallelCallback);
	});
}

module.exports.extract = extract;