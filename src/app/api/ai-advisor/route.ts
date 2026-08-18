import { NextResponse } from 'next/server';
import { askAiAdvisor } from '../../../lib/ai';

export async function POST(request: Request) {
  try {
    const { question, productName, productSpecs } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const answer = await askAiAdvisor(question, productName, productSpecs);

    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({
      answer: 'KLLYEEIN AI Advisor: All flagship devices feature Grade 5 aerospace titanium, high-frequency OLED displays, and official 1-year brand warranty.'
    });
  }
}
