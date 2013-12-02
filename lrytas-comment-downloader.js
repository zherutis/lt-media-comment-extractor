var request = require('request');
var cheerio = require('cheerio');
var ArticleExtractor = require('./lrytas-get-comments').LrytasArticleCommentExtractor;

var extract = function(url, callback) {
	request(url, function(err, resp, body) {
		if (!err) {
			var $ = cheerio.load(body),
					$commentLinks = $('a.k');
					
			var extractorRegistry = {},
				comments = [];		
			
			$commentLinks.each(function(i, el) {			
				var $el = $(el);

				var articleLink = $el.closest('.nw').prev();
				var articleName = articleLink.text().trim();

				var queryString = $el.attr('href');	

				var extractor = new ArticleExtractor(url, 'LRytas', Date.now);

				extractorRegistry[queryString] = extractor;

				extractor.on('end', function() {					
					delete extractorRegistry[queryString];

					if (Object.keys(extractorRegistry).length === 0) {	
						var date = Date.now();
						console.log('finished: ' + date);
						callback(null, comments);
					}
				});

				extractor.on('error', function(error) {
					extractor.removeAllListeners('end');

					var items = Object.keys(extractorRegistry);
					items.forEach(function(item) {
						extractorRegistry[item].stop();
					});

					callback(error, null);
				});

				extractor.on('comments', function(commentBatch) {				
					comments = comments.concat(commentBatch);
				});

				extractor.getComments(articleName, queryString);				
			});
		} else {
			callback(err, null);
		}
	});
};



module.exports.extract = extract;
