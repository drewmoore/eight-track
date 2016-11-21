EightTrack
==========
Cache HTTP requests in the Meteor framework. Based on the popular [VCR](https://github.com/vcr/vcr) package
for other frameworks, such as Rails. This typically is used in testing code that involves outgoing http requests for APIs and such. By caching, the chance of maxing out requests is drastically reduced. Plus, it is more considerate to your API providers, as well :).

## Installation
`meteor add drewmoore:eight-track`
- It is recommended that you add `eight-track-cassettes/` to your project's `.gitignore`.

## Usage
In any server-only code (for the time being), wrap an http response in the following manner:
```
EightTrack.useCassette('myCachedResponse', function () {
  result = HTTP.get('https://jsonplaceholder.typicode.com/posts/1');
});
```

- This will first find or create a directory in the project root called `eight-track-cassettes/`.
- This will then find or create a file named `myCachedResponse.json` in the directory.
- If the file does not exist or it is determined to be expired (see below), `myCachedResponse.json` will store a replica of the http response.
- If the file exists and is not expired, the json file will be parsed and the original http response simulated, complete with headers and all.

## Cache Expiration
Currently, all cassettes are set to expire 24 hours after creation, according to EightTrack's `reRecordInterval`. In the near future, I plan on allowing this to be customized through a config file.

## Client-Side Caching
This is currently a wish list feature.

## Bug Reporting / Suggestions
Please feel free to create new issues on the repo. Pull requests always welcome!
