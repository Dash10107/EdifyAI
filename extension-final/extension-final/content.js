// This script runs on YouTube pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVideoInfo') {
      const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent;
      const videoDescription = document.querySelector('#description-inline-expander')?.textContent;
      
      sendResponse({
        title: videoTitle || '',
        description: videoDescription || ''
      });
    }
  });
  
  