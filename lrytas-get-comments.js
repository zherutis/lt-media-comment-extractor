// imports
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var request = require('request');
var cheerio = require('cheerio');

// helper functions
function extractSingleComment($comment, article, portal) {
	var time = $comment.find('.comment-time').text();
	var ip = $comment.find('.comment-ip').text();
	var commentText = $comment.find('p[class^="text"]').text();

	return {
		portal: portal,
		article: article,
		time: convertToDate(time),
		ip: ip,
		text: commentText
	};
}

function convertToDate(date) {
	// TODO: use timezone too
	return new Date(date);
}

function extractComments(portal, article, $elements, $) {	
	return $elements.map(function(i, el) {		
		return extractSingleComment($(el), article, portal);
	});
}	

// exportable object
var LrytasArticleCommentExtractor = function(hostname, portalName, newerThan) {
	this.hostname = hostname;
	this.portalName = portalName;
	this.newerThan = newerThan;
}

util.inherits(LrytasArticleCommentExtractor, EventEmitter);

LrytasArticleCommentExtractor.prototype.stop = function() {
	this.stopSignal = true;
};

LrytasArticleCommentExtractor.prototype.getComments = 
								function getComments(article, queryString) {	
		var self = this;		

		var fullUrl = 
					queryString.indexOf('http://') > -1 ? 
					queryString : 
					this.hostname + queryString;
		
		request(fullUrl, function(err, resp, body) {
			if (!err) {
				var $ = cheerio.load(body);

				var comments = extractComments(self.portalName, article, $('div.comment'), $);		

				var allNew = !comments.some(function(element, index, array) {
					element < self.newerThan;
				});		

				if (!allNew) {
					comments = comments.filter(function(element) {
						element.time > self.newerThan;
					});
				}
	
				self.emit('comments', comments);

				var $pager = $('.str-pages-div');
				
				var nextLink = $pager.children().last().attr('href');	

				var shouldReadNext = nextLink != undefined && 
									 nextLink != null 
									 && queryString !== nextLink 
									 && allNew && !this.stopSignal;			

				if (shouldReadNext) {
					getComments.call(self, article, nextLink);
				} else {					
					self.emit('end');
				}
			} else {				
				self.emit('error', err);
			}			
		});
	}

// export
module.exports.LrytasArticleCommentExtractor = LrytasArticleCommentExtractor;