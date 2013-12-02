var request = require('request');
var cheerio = require('cheerio');
var util = require('util');

function getNextLink(queryString, $) {
	var nextLink = $('.str-pages-div')
					.children()
					.last()
					.attr('href');
	
	var shouldReadNext = nextLink !== undefined && 
						 nextLink !== null &&
						 queryString !== nextLink;	
						 
	return shouldReadNext ? nextLink : null;
}

function anyUndefined(options) {
	if (!options.articleUrl || 
		!options.articleName ||
		!options.commentsUrl ||
		!options.portalName ||
		!options.newerThan) {		
		return new Error('All options must be specified');
	}
}

var fetch = function fetch(options, callback) {
	// closure variables
	var getFullUrl = options.getFullUrl,
		commentArray = [];	

	// closure functions
	function getCommentsRecursive(queryString) {

		var fullUrl = getFullUrl(options.host, queryString);
		
		request(fullUrl, function(err, resp, body) {
			if (err) {
				return callback(err, null);
			}

			var $ = cheerio.load(body);

			var hasOld = extractComments($),
				moreCommentsLink = getNextLink(queryString, $);			

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
						articleUrl: options.articleUrl,
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