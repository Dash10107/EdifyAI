document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('summarize-form');
  const urlInput = document.getElementById('video-url');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');
  const resultDiv = document.getElementById('result');
  const videoTitleElement = document.getElementById('video-title');
  const videoThumbnailElement = document.getElementById('video-thumbnail');
  const summaryElement = document.getElementById('summary');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const url = urlInput.value.trim();

    if (!url) {
      showError('Please enter a valid YouTube URL');
      return;
    }

    showLoading();

    chrome.runtime.sendMessage({action: 'summarize', url: url}, function(response) {
      hideLoading();
      if (response.error) {
        showError(response.error);
      } else {
        showResult(response);
      }
    });
  });

  function showLoading() {
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    resultDiv.style.display = 'none';
  }

  function hideLoading() {
    loadingDiv.style.display = 'none';
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    resultDiv.style.display = 'none';
  }

  function showResult(data) {
    videoTitleElement.textContent = data.title;
    videoThumbnailElement.src = data.thumbnail;
    summaryElement.textContent = data.summary;
    resultDiv.style.display = 'block';
  }
});

