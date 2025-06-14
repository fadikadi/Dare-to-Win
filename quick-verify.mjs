// quick-verify.mjs - A simple script to check MIME types
// Run with: node quick-verify.mjs

// Check the Vercel deployment
const url = 'https://dare-to-win.vercel.app';
const jsUrl = `${url}/assets/index-CNrVkIUW.js`;

console.log(`🔍 Checking MIME types for: ${jsUrl}`);
console.log('Please wait...');

// Using the fetch API to check headers
fetch(jsUrl, { method: 'HEAD' })
  .then(response => {
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    // Get the Content-Type header
    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType || 'Not specified'}`);
    
    // Check if it's the correct type for JavaScript
    const isCorrect = contentType && contentType.includes('application/javascript');
    console.log(`Correct MIME type: ${isCorrect ? '✅' : '❌'}`);
    
    if (!isCorrect) {
      console.log(`
⚠️ MIME type issue detected!
The JavaScript files are not being served with the correct MIME type.
This can cause ES modules to fail loading in the browser.

Your current settings in vercel.json should be working. If not, try these troubleshooting steps:

1. Make sure your vercel.json headers configuration looks like this:
   "headers": [
     {
       "source": "/(.*)\\.js",
       "headers": [
         { "key": "Content-Type", "value": "application/javascript" }
       ]
     }
   ]

2. Check if Vercel has deployed the latest configuration.
3. Try adding these to your build command:
   - Add type="module" to your script tags
   - Use .mjs extension instead of .js
   
If all else fails, contact Vercel support for assistance.
`);
    } else {
      console.log('✅ MIME types are correctly configured!');
    }
  })
  .catch(error => {
    console.error(`❌ Error: ${error.message}`);
    console.log('Make sure the URL is correct and the deployment is available.');
  });
