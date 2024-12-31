document.addEventListener('DOMContentLoaded', function() {
    // Get current tab URL
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      
      // Check domain against database
      checkDomain(domain);
    });
  });
  
  function checkDomain(domain) {
    // Sample database - Replace with your actual database implementation
    const privacyDatabase = {
      'www.datagrail.io': 'https://preferences.datagrail.io/',
      'www.ruggable.com': 'https://preferences.ruggable.com/'
      // Add more domains and their privacy request URLs
    };

    console.log('domain:', domain);
  
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
