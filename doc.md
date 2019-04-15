## Functions

<dl>
<dt><a href="#asyncRetry">asyncRetry(options)</a> ⇒ <code>Promise.&lt;any&gt;</code></dt>
<dd><p>Retry an async function</p>
</dd>
<dt><a href="#callbackRetry">callbackRetry(options)</a> ⇒ <code>void</code></dt>
<dd><p>Retry a callback based function</p>
</dd>
<dt><a href="#Timeout">Timeout([options])</a> ⇒ <code>function</code></dt>
<dd><p>Create function that generate timeout by <a href="http://dthain.blogspot.com/2009/02/exponential-backoff-in-distributed.html">exponential backoff algorithm</a></p>
</dd>
</dl>

<a name="asyncRetry"></a>

## asyncRetry(options) ⇒ <code>Promise.&lt;any&gt;</code>
Retry an async function

**Kind**: global function  
**Returns**: <code>Promise.&lt;any&gt;</code> - result of async func  
**Throws**:

- [ERR_REACHED_MAX_RETRY](https://www.npmjs.com/package/@u-e-i/err-reached-max-retry)
- [ERR_CANNOT_RETRY](https://www.npmjs.com/package/@u-e-i/err-cannot-retry) when not reached max retry but isRetry() return false.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  |  |
| options.func | <code>function</code> |  | async function to retry |
| [options.thisArg] | <code>object</code> |  | this pointer apply to function |
| [options.args] | <code>Array.&lt;any&gt;</code> |  | arguments of function |
| [options.isRetry] | <code>function</code> |  | (error) => boolean |
| [options.maxRetry] | <code>number</code> | <code>3</code> | max retry times |
| [options.timeout] | <code>number</code> \| <code>function</code> |  | delay between retry operation, default is generated by Timeout. if is function, must match interface : (retry_count, maxRetry, logs) => number |
| [options.activity] | <code>string</code> |  | what is this activity name ? default is func.name |
| [options.actor] | <code>string</code> |  | who do this activity ? default is thisArg.name |

<a name="callbackRetry"></a>

## callbackRetry(options) ⇒ <code>void</code>
Retry a callback based function

**Kind**: global function  
**Errors**: :
* [ERR_REACHED_MAX_RETRY](https://www.npmjs.com/package/@u-e-i/err-reached-max-retry)
* [ERR_CANNOT_RETRY](https://www.npmjs.com/package/@u-e-i/err-cannot-retry) when not reached max retry but isRetry() return false.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  |  |
| options.func | <code>function</code> |  | callback based function to retry |
| [options.thisArg] | <code>object</code> |  | this pointer apply to function |
| [options.args] | <code>Array.&lt;any&gt;</code> | <code>[]</code> | arguments of function |
| options.callback | <code>function</code> |  | callback of function |
| [options.isRetry] | <code>function</code> |  | (error) => boolean |
| [options.maxRetry] | <code>number</code> | <code>3</code> | max retry times |
| [options.timeout] | <code>number</code> \| <code>function</code> | <code>200</code> | delay between retry operation, , default is generated by Timeout. if is function, must match interface : (retry_count, maxRetry, logs) => number |
| [options.activity] | <code>string</code> |  | what is this activity name ? default is func.name |
| [options.actor] | <code>string</code> |  | who do this activity ? default is thisArg.name |

<a name="Timeout"></a>

## Timeout([options]) ⇒ <code>function</code>
Create function that generate timeout by [exponential backoff algorithm](http://dthain.blogspot.com/2009/02/exponential-backoff-in-distributed.html)

**Kind**: global function  
**Returns**: <code>function</code> - generate timeout  

| Param | Type | Default |
| --- | --- | --- |
| [options] | <code>Object</code> |  | 
| [options.minTimeout] | <code>Number</code> | <code>20</code> | 
| [options.maxTimeout] | <code>Number</code> | <code>Infinite</code> | 
| [options.factor] | <code>Number</code> | <code>2</code> | 
| [options.randomize] | <code>Boolean</code> | <code>true</code> | 

<a name="Timeout..generateTimeout"></a>

### Timeout~generateTimeout([retryCount]) ⇒ <code>number</code>
Generate timeout = Math.min(random * minTimeout * Math.pow(factor, retryCount), maxTimeout)

**Kind**: inner method of [<code>Timeout</code>](#Timeout)  
**Returns**: <code>number</code> - timeout  

| Param | Type | Default |
| --- | --- | --- |
| [retryCount] | <code>number</code> | <code>1</code> | 
