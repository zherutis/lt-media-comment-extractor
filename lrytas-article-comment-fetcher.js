var request = require('request');
var cheerio = require('cheerio');
var util = require('util');

function getNextLink(currentUrl, $) {
	var nextLink = $('.str-pages-div')
					.children()
					.last()
					.attr('href');	

	var shouldReadNext = nextLink !== undefined && 
						 nextLink !== null &&
						 currentUrl !== nextLink;
						 
	return shouldReadNext ? nextLink : null;
}

function anyUndefined(options) {
	if (options.articleUrl == undefined|| 
		!options.articleName ||
		!options.commentsUrl ||
		!options.portalName ||
		!options.newerThan) {
		console.log(options);
		return new Error('All options must be specified');
	}
}

function getFullUrl(host, url) {
	return	url.indexOf('http://') > -1 ? 
			url : 
			host + url;
}

var fetch = function fetch(options, callback) {
	// closure variables
	var commentArray = [];	

	// closure functions
	function getCommentsRecursive(url) {

		url = getFullUrl(options.host, url);
		request(url, function(err, resp, body) {
			if (err) {
				return callback(err, null);
			}

			var $ = cheerio.load(body);

			var hasOld = extractComments($),
				moreCommentsLink = getNextLink(url, $);			

			if (!hasOld && moreCommentsLink) {					
				getCommentsRecursive(moreCommentsLink);
			} else {				
				callback(null, commentArray);
			}
		});
	}

	function extractComments($) {
		var $commentElements = $('div.comment'),
		 	containsOldComments = false;		

		$commentElements.each(function(i, el) {
			var $el = $(el);
			var time = new Date($el.find('.comment-time').text());			

			if (time > options.newerThan) {
				var ip = $el.find('.comment-ip').text(),
					commentText = $el.find('p[class^="text"]').text(),
					comment = {
						portal: options.portalName,
						article: options.articleName,
						time: time,
						ip: ip,
						text: commentText
					}; 

				commentArray.push(comment);
			} else {
				containsOldComments = true;
			}		
		});

		return containsOldComments;
	}	

	// function body
	var err = anyUndefined(options);

	if (err){
		return callback(err, null);
	}		
	getCommentsRecursive(options.commentsUrl);
};

module.exports.fetch = fetch;