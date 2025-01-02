document.addEventListener('DOMContentLoaded', function() {
  // Get current tab URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Check if we have a tab and it has a URL
      if (tabs[0] && tabs[0].url) {
          try {
              const url = new URL(tabs[0].url);
              const domain = url.hostname;
              console.log('Original domain:', domain);

              // Remove www. from domain
              const clean_domain = domain.replace('www.','');
              console.log('Clean domain:', clean_domain);

              checkDomain(clean_domain);
          } catch (e) {
              console.log("Invalid URL:", tabs[0].url);
              const resultDiv = document.getElementById('result');
              resultDiv.className = 'not-found';
              resultDiv.textContent = 'Not checking this page type.';
          }
      } else {
          const resultDiv = document.getElementById('result');
          resultDiv.className = 'not-found';
          resultDiv.textContent = 'No URL to check.';
      }
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