Retry callback based or async function

## Example

* Operation
```js
const BusyService = {
  call_times : 0,
  getHelloAtEach3Times : function (must_be_hi, callback) {
    this.call_times++;
    
    if (this.call_times % 3 === 0) {
      return callback(null, 'hello');
    }

    let BusyError = new Error('Service is busy');
    BusyError.status = 503;

    return callback(BusyError);
  },
  asyncGetHelloAtEach3Times : async function (must_be_hi) {
    this.call_times++;
    
    if (this.call_times % 3 === 0) {
      return 'hello';
    }

    let BusyError = new Error('Service is busy');
    BusyError.status = 503;

    throw BusyError;
  }
};
```

* Async Retry
```js
it ('should retry a async function ok after three times', async () => {
  let message = await asyncRetry({
    func      : BusyService.asyncGetHelloAtEach3Times,
    thisArg   : BusyService,
    args      : ['hi'],
    isRetry   : (error) => !(error.status >= 400 && error.status < 500),
    maxRetry  : 3,
    timeout   : 200
  });

  assert.equal(message, 'hello');
});
```

* Callback Retry
```js
it ('should retry a callback function ok after three times', (done) => {
  callbackRetry({
    func      : BusyService.getHelloAtEach3Times,
    thisArg   : BusyService,
    args      : ['hi'],
    isRetry   : (error) => !(error.status >= 400 && error.status < 500),
    maxRetry  : 3,
    timeout   : 200,
    callback  : (err, message) => (!err && message === 'hello') ? done() : done(err) 
  });
});
```

* See more cases in [test file](./index.spec.js)

## Functions

<dl>
<dt><a href="#asyncRetry">asyncRetry(options)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd><p>Retry an async function</p>
</dd>
<dt><a href="#callbackRetry">callbackRetry(options)</a> ⇒ <code>void</code></dt>
<dd><p>Retry an callback based function</p>
</dd>
</dl>

<a id="asyncRetry"></a>

## asyncRetry(options) ⇒ <code>Promise.&lt;any&gt;</code>
Retry an async function

**Kind**: function  
**Returns**: <code>Promise.&lt;any&gt;</code> - result of async func  
**Throws**:

- [ERR_REACHED_MAX_RETRY](https://www.npmjs.com/package/@u-e-i/err-reached-max-retry)
- [ERR_CANNOT_RETRY](https://www.npmjs.com/package/@u-e-i/err-cannot-retry) when not reached max retry but isRetry() return false.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  |  |
| options.func | <code>function</code> |  | async function to retry |
| [options.thisArg] | <code>object</code> |  | this pointer apply to async func |
| [options.isRetry] | <code>function</code> |  | (error) => boolean |
| [options.maxRetry] | <code>number</code> | <code>3</code> | max retry times |
| [options.timeout] | <code>number</code> \| <code>function</code> | <code>200</code> | delay between retry operation,  if is function, must match interface : (retry_count, maxRetry, logs) => number |
| [options.activity] | <code>activity</code> |  | what is this activity name ? default is func.name |
| [options.actor] | <code>string</code> |  | who do this activity ? default is thisArg.name |

<a id="callbackRetry"></a>

## callbackRetry(options) ⇒ <code>void</code>
Retry an callback based function

**Kind**: function  
**Errors**: :
* [ERR_REACHED_MAX_RETRY](https://www.npmjs.com/package/@u-e-i/err-reached-max-retry)
* [ERR_CANNOT_RETRY](https://www.npmjs.com/package/@u-e-i/err-cannot-retry) when not reached max retry but isRetry() return false.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  |  |
| options.func | <code>function</code> |  | callback based function to retry |
| [options.thisArg] | <code>object</code> |  | this pointer apply to function |
| [options.callback] | <code>function</code> |  | callback of function |
| [options.isRetry] | <code>function</code> |  | (error) => boolean |
| [options.maxRetry] | <code>number</code> | <code>3</code> | max retry times |
| [options.timeout] | <code>number</code> \| <code>function</code> | <code>200</code> | delay between retry operation,  if is function, must match interface : (retry_count, maxRetry, logs) => number |
| [options.activity] | <code>activity</code> |  | what is this activity name ? default is func.name |
| [options.actor] | <code>string</code> |  | who do this activity ? default is thisArg.name |

## Testing

```sh
npm test 
```