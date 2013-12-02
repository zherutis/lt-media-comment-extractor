//var extract = require('./lrytas-comment-downloader').extract;
var extract = require('./lrytas-extractor').extract;

var hostname = 'http://www.lrytas.lt';

// var ts1 = Date.now();

// extract(hostname, function(err, comments) {
// 	if (!err) {
// 		var ts2 = Date.now();


// 		console.log(comments.length);

// 		console.log(ts2 - ts1);
// 		console.log('end');
// 	} else {
// 		throw err;
// 	}
// });

var ts1 = Date.now();

extract(hostname, new Date('2013-11-19'), function(err, comments) {
	if (err) {
		throw err;
	}

	var ts2 = Date.now();

    console.log(comments);

	console.log('# of comments: ' + comments.length);
	console.log(ts2 - ts1);
	console.log('end');
});