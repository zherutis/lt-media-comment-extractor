//var extract = require('./lrytas-comment-downloader').extract;
var extract = require('./lrytas-extractor').extract;

var hostname = 'http://www.lrytas.lt';

var ts1 = Date.now();

var options = {
	host: hostname,
	newerThan: new Date('2013-11-19'),
	waitTime: {
		min: 10,
		max: 60
	}
}

extract(options, function(err, comments) {
	if (err) {
		throw err;
	}

	var ts2 = Date.now();

    console.log(comments);

	console.log('# of comments: ' + comments.length);
	console.log(ts2 - ts1);
	console.log('end');
});