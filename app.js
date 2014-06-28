var http = require("http");
 
http.createServer(function (req, res) {

	var path = req.url.substring(1);
	var method = req.method;
	var split = path.indexOf('http');
	var redirect = path.substr(split);
	
	// Only allow GETs
	// TODO: passthrough HEAD reuqests
	if (method !== 'GET') {
		// Return a 405 Method Not Allowed
		res.writeHead(405);
		res.end();
		return;
	}
	// Check for valid URLs
	if (!redirect || redirect.length <= 10 || !isURL(redirect)) {
		// Return a 400 Bad Request
		res.writeHead(400);
		res.end();
		return;
	}
	
	// Redirect client
	res.writeHead(302, {"Location": redirect});
	res.end();

	// Log request

	// Check for optional metadata in URI
	// Metadata pairs should be / delimted with each pair being : delimited
	// e.g. http://<this_script>/<key1:value1>/<key2:value2>/<Redirect>
	var metadata = {};
	var metadata_uri = path.substring(0, split-1);

	if (metadata_uri) {
		// Split out metadata pairs into key:value
		metadata_uri.split('/').forEach(function(md) {
			tmp = md.split(':');
			metadata[tmp[0]] = tmp[1];
		});
	}

	var client = {
		// Log host for content-switched rules for multiple domains?
		// host: req.headers['host'],
		agent: req.headers['user-agent'],
		referrer: req.headers['referrer'],
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress, 
		method: method,
		metadata: metadata,
		url: redirect
	};

	// Save client to db
	/*
	collection.save(client)
	*/

	// Stream traffic based on metadata
	/*
	if (Object.keys(metadata).length) {
		exchange.publish(metadata)
	}
	*/

}).listen(8080);


var isURL = function (str, options) {
    if (!str || str.length >= 2083) {
        return false;
    }
    var separators = '-?-?_?';
    var url = new RegExp('^(?!mailto:)(?:(?:http|https)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:www.)?)?(?:(?:[a-z\\u00a1-\\uffff0-9]+' + separators + ')*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+' + separators + ')*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::(\\d{1,5}))?(?:(?:/|\\?|#)[^\\s]*)?$', 'i');
    var match = str.match(url)
      , port = match ? match[1] : 0;
    return !!(match && (!port || (port > 0 && port <= 65535)));
};
