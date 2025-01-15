chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'summarize') {
    summarizeVideo(request.url)
      .then(sendResponse)
      .catch(error => sendResponse({error: error.message}));
    return true; // Indicates we will send a response asynchronously
  }
});

async function summarizeVideo(url) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const videoDetails = await fetchVideoDetails(videoId);
    const summary = await generateSummary(videoDetails.title, videoDetails.description);

    return {
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnails.high.url,
      summary: summary
    };
  } catch (error) {
    throw new Error('Failed to summarize video: ' + error.message);
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function fetchVideoDetails(videoId) {
  const apiKey = ''; // Replace with your actual YouTube API key
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`);
  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }
  return data.items[0].snippet;
}

async function generateSummary(title, description) {
  const apiKey = ''; // Replace with your actual Gemini API key
  const prompt = `Please provide a concise summary of this YouTube video titled "${title}". Here's the description: "${description}"`;
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  const data = await response.json();
  if (data.candidates && data.candidates.length > 0) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error('Failed to generate summary');
  }
}


