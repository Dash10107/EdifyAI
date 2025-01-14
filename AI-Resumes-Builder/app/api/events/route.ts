import { NextResponse } from 'next/server';

interface Event {
  title: string;
  location: string;
  date: string;
  link: string;
  type: 'hackathon' | 'meetup';
}

export async function GET() {
  try {
    const hackathonsResponse = await fetch('http://localhost:5000/hackathons');
    const meetupsResponse = await fetch('http://localhost:5000/meetups');

    const hackathons = await hackathonsResponse.json();
    const meetups = await meetupsResponse.json();

    const events: Event[] = [
      ...hackathons.map((h: any) => ({
        ...h,
        date: h.dates,
        type: 'hackathon' as const,
      })),
      ...meetups.map((m: any) => ({
        ...m,
        type: 'meetup' as const,
      })),
    ];

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

