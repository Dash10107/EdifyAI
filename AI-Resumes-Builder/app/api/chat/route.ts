import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { input,course} = body;
    // console.log('messages', messages);
    const { category, chapters } = course.courseOutput;

    let description = `Course: ${course.courseName} (${category})\n\n`;
  
    chapters.forEach((chapter: { chapter_name: string; description: string; duration: string }, index: number) => {
      description += `${index + 1}. ${chapter.chapter_name}\n`;
      description += `   Description: ${chapter.description}\n`;
      description += `   Duration: ${chapter.duration}\n\n`;
    });

    // console.log(input,description);

    try {
    const response = await fetch('http://localhost:5000/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query:input, description }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    return NextResponse.json({
        message: data.result,
    });
}
    // return dummy data
    
        catch (error) {

    console.error('Error calling custom chatbot API:', error);
    return NextResponse.json(
         {message:"Sorry, I am unable to process your request at the moment. Please try again later."})
  }
}

