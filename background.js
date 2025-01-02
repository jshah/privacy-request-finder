importScripts('database.js');

// Store grayscale icons for reuse
let grayscaleIcons = null;

// Create grayscale icons once on startup
async function initializeGrayscaleIcons() {
    const sizes = [16, 48, 128];
    const iconData = {};

    for (const size of sizes) {
        const canvas = new OffscreenCanvas(size, size);
        const ctx = canvas.getContext('2d');

        try {
            const imageResponse = await fetch(`icons/icon${size}.png`);
            const imageBlob = await imageResponse.blob();
            const imageBitmap = await createImageBitmap(imageBlob);

            ctx.drawImage(imageBitmap, 0, 0, size, size);
            const imageData = ctx.getImageData(0, 0, size, size);
            const data = imageData.data;

            // Convert to grayscale
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;     // red
                data[i + 1] = avg; // green
                data[i + 2] = avg; // blue
            }

            iconData[size] = imageData;
        } catch (error) {
            console.error(`Error creating ${size}x${size} grayscale icon:`, error);
        }
    }

    return iconData;
}

async function checkUrlAndUpdateIcon(urlString, tabId) {
  // Only skip if URL is undefined
  if (!urlString) {
      console.log('URL not ready yet, skipping update');
      return;
  }

  try {
      const url = new URL(urlString);
      const domain = url.hostname;
      const clean_domain = domain.replace('www.','');

      // Log current check with all relevant info
      console.log('URL Check:', {
          originalUrl: urlString,
          domain: domain,
          cleanDomain: clean_domain,
          isInDatabase: clean_domain in privacyDatabase,
          tabId: tabId
      });

      // Special Chrome URLs
      if (urlString.startsWith('chrome://') || urlString.startsWith('chrome-extension://')) {
          console.log('Special URL detected:', urlString);
          await setInactiveIcon(tabId);
          return;
      }

      // Check if domain is in database
      if (privacyDatabase[clean_domain]) {
          console.log('✅ Setting active icon for:', clean_domain);
          await setActiveIcon(tabId);
      } else {
          console.log('⚪ Setting inactive icon for:', clean_domain);
          await setInactiveIcon(tabId);
      }
  } catch (e) {
      console.log('❌ Invalid URL, setting inactive:', urlString);
      await setInactiveIcon(tabId);
  }
}

// Separate functions for setting icon states
async function setActiveIcon(tabId) {
  try {
      await chrome.action.setIcon({
          tabId: tabId,
          path: {
              "16": "icons/icon16.png",
              "48": "icons/icon48.png",
              "128": "icons/icon128.png"
          }
      });
  } catch (e) {
      console.error('Error setting active icon:', e);
  }
}

async function setInactiveIcon(tabId) {
  try {
      if (!grayscaleIcons) {
          grayscaleIcons = await initializeGrayscaleIcons();
      }
      await chrome.action.setIcon({
          tabId: tabId,
          imageData: grayscaleIcons
      });
  } catch (e) {
      console.error('Error setting inactive icon:', e);
  }
}

// Modified listeners with better logging
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Log all relevant information about the update
  console.log('Tab Update Event:', {
      tabId: tabId,
      changeInfo: changeInfo,
      currentUrl: tab.url,
      status: tab.status
  });

  if (changeInfo.url) {
      console.log('🔄 URL changed to:', changeInfo.url);
      checkUrlAndUpdateIcon(changeInfo.url, tabId);
  }
  else if (changeInfo.status === 'complete' && tab.url) {
      console.log('📍 Page load complete:', tab.url);
      checkUrlAndUpdateIcon(tab.url, tabId);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab Activated:', activeInfo);
  chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab && tab.url) {
          console.log('⭐ Switched to tab with URL:', tab.url);
          checkUrlAndUpdateIcon(tab.url, tab.id);
      }
  });
});