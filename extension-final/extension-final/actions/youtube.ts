'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyDPfmpsxMP8j47J-PiI5oIOrjDG4cp8Pik');

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Helper function to fetch video transcript
async function fetchTranscript(videoId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${'AIzaSyDpSutFYmAbixTXgVdAC7yEESeTfgeh-Xg'}`
  )
  const data = await response.json()
  return data
}

// Helper function to fetch video details
async function fetchVideoDetails(videoId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${'AIzaSyDpSutFYmAbixTXgVdAC7yEESeTfgeh-Xg'}`
  )
  const data = await response.json()
  return data.items[0]?.snippet
}

export async function summarizeVideo(url: string) {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      throw new Error('Invalid YouTube URL')
    }

    // Fetch video details
    const videoDetails = await fetchVideoDetails(videoId)
    if (!videoDetails) {
      throw new Error('Could not fetch video details')
    }

    // Generate summary using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const prompt = `Please provide a concise summary of this YouTube video titled "${videoDetails.title}". Here's the description: "${videoDetails.description}"`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()

    return {
      success: true,
      data: {
        videoId,
        title: videoDetails.title,
        description: videoDetails.description,
        thumbnail: videoDetails.thumbnails?.high?.url || videoDetails.thumbnails?.default?.url,
        summary
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred while processing the video'
    }
  }
}

