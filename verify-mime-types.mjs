// verify-mime-types.mjs - Script to check if the MIME types are set correctly
import http from 'http';
import https from 'https';
import { URL } from 'url';

// Utility function to make HTTP/HTTPS requests and check MIME types
async function checkMimeType(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.request(
      url,
      { method: 'HEAD' },
      (res) => {
        const contentType = res.headers['content-type'];
        const status = res.statusCode;
        
        console.log(`📄 ${url}`);
        console.log(`   Status: ${status}`);
        console.log(`   Content-Type: ${contentType || 'Not specified'}`);
        
        // Determine if the MIME type is correct based on file extension
        const fileExt = url.split('.').pop().toLowerCase();
        let expectedType = '';
        
        switch (fileExt) {
          case 'js':
            expectedType = 'application/javascript';
            break;
          case 'css':
            expectedType = 'text/css';
            break;
          case 'html':
            expectedType = 'text/html';
            break;
          case 'json':
            expectedType = 'application/json';
            break;
          case 'svg':
            expectedType = 'image/svg+xml';
            break;
          // Add more types as needed
        }
        
        let isCorrect = false;
        if (expectedType && contentType) {
          isCorrect = contentType.includes(expectedType);
        }
        
        if (expectedType) {
          console.log(`   Expected Type: ${expectedType}`);
          console.log(`   Correct: ${isCorrect ? '✅' : '❌'}`);
        }
        
        resolve({
          url,
          status,
          contentType,
          expectedType,
          isCorrect
        });
      }
    );
    
    req.on('error', (error) => {
      console.error(`❌ Error checking ${url}: ${error.message}`);
      reject(error);
    });
    
    req.end();
  });
}

// Main function to check MIME types from different deployment URLs
async function verifyMimeTypes() {
  console.log('🔍 Verifying MIME types for the Millionaire game deployments\n');
  
  const baseUrls = [
    'https://fadikadi.github.io/Dare-to-Win', // GitHub Pages
    'https://dare-to-win.vercel.app',         // Vercel 
    'https://dare-to-win.netlify.app'         // Netlify
  ];
  
  const pathsToCheck = [
    '/index.html',                       // Main HTML file
    '/assets/index-CNrVkIUW.js',         // Main JS bundle
    '/assets/index-C2VVR1sT.css'         // CSS file
  ];
  
  const results = {};
  
  for (const baseUrl of baseUrls) {
    console.log(`\n🌐 Checking ${baseUrl}`);
    
    try {
      // First check if the site is reachable at all
      await checkMimeType(baseUrl);
      results[baseUrl] = { reachable: true, files: {} };
      
      // Then check specific files
      for (const path of pathsToCheck) {
        try {
          const result = await checkMimeType(`${baseUrl}${path}`);
          results[baseUrl].files[path] = result;
        } catch (error) {
          results[baseUrl].files[path] = { error: error.message };
          console.log(`   ❌ Failed to check ${path}`);
        }
      }
    } catch (error) {
      results[baseUrl] = { reachable: false, error: error.message };
      console.log(`   ❌ Site not reachable`);
    }
  }
  
  // Provide a summary
  console.log('\n📊 Summary:');
  for (const [baseUrl, data] of Object.entries(results)) {
    console.log(`\n${baseUrl}:`);
    console.log(`   Reachable: ${data.reachable ? '✅' : '❌'}`);
    
    if (data.reachable && data.files) {
      const jsFiles = Object.values(data.files).filter(f => f.expectedType === 'application/javascript');
      const correctJs = jsFiles.filter(f => f.isCorrect).length;
      
      console.log(`   JavaScript MIME Types: ${correctJs}/${jsFiles.length} correct`);
    }
  }
}

// Run the verification
verifyMimeTypes().catch(console.error);
