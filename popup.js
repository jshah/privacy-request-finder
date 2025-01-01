document.addEventListener('DOMContentLoaded', function() {
    // Get current tab URL
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      
      // Check domain against database
      console.log('domain:', domain);
      clean_domain = domain.replace('www.','')
      checkDomain(clean_domain);
    });
  });
  
  function checkDomain(domain) {  
    const resultDiv = document.getElementById('result');
    
    if (domain in privacyDatabase) {
      const requestUrl = privacyDatabase[domain];
      resultDiv.className = 'found';
      resultDiv.innerHTML = `
        <p>Privacy request URL found for ${domain}!</p>
        <a href="${requestUrl}" target="_blank" class="request-link">
          Submit Privacy Request
        </a>
      `;
    } else {
      resultDiv.className = 'not-found';
      resultDiv.textContent = `No privacy request URL found for ${domain}.`;
    }
  }
