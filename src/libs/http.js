/**
 * @module      http
 * @description A function that wraps fetch api for semantically creating
 *              and dispatching an http request with functional chaining.
 */
import 'libs/fetch';

class HttpRequest {
    constructor (url, opts) {
        this.url = url;
        this.opts = opts || {};
    }

    /*************************************************************
     * REQUEST BUILDER - CHAINABLE FUNCTIONS
     *************************************************************/
    withCreds () {
        Object.assign(this.opts, {
            credentials: 'same-origin'
        });
        return this;
    }
    
    withJsonBody (body) {
        // Merge Headers nested object
        var headers = Object.assign({}, this.opts.headers || {}, {
            'Content-Type': 'application/json'
        });

        // Merge object
        Object.assign(this.opts, {
            body: JSON.stringify(body),
            headers: headers
        });
        return this;
    }
    
    acceptJson () {
        // Merge Headers nested object
        var headers = Object.assign({}, this.opts.headers || {}, {
            Accept: 'application/json',
        });

        // Merge object
        Object.assign(this.opts, {
            headers: headers
        });
        return this;
    }
    
    post () {
        this.opts.method = 'POST';
        return this;
    }
    
    put () {
        this.opts.method = 'PUT';
        return this;   
    }
    
    /*************************************************************
     * REQUESTS (DISPATCH HTTP REQUEST AND RETURN PROMISE)
     *************************************************************/
    request () {
        var promisePlus = fetch(this.url, this.opts);
        var abort = promisePlus.abort;
        promisePlus = promisePlus.then(checkHttpStatus);
        promisePlus.abort = abort;
        return promisePlus;
    }
    
    requestJson () {
        // Set Accept header to json
        this.acceptJson();
        
        var promisePlus = fetch(this.url, this.opts);
        var abort = promisePlus.abort;
        promisePlus = promisePlus.then(checkHttpStatus).then(res => res.json());
        promisePlus.abort = abort;
        return promisePlus;
    }
}

/**
 * Throw HTTP errors in the promise chain to get expected behavior
 */
function checkHttpStatus (response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

export default function http (url, opts) {
    return new HttpRequest(url, opts); 
}
