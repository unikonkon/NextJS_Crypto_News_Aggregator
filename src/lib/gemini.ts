interface GeminiAnalysis {
  summary: string
  sentiment: 'Positive' | 'Neutral' | 'Negative'
  trending_score: number
}

export class GeminiAnalyzer {
  private apiKey: string
  private apiUrl: string

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY!
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`
  }

  async analyzeArticle(content: string): Promise<GeminiAnalysis> {
    const prompt = `You are a crypto news analyzer.

Your goal is to:
1. Summarize the article in one short paragraph.
2. Classify the sentiment of the article into: Positive, Neutral, or Negative.
3. Estimate the "Trending Score" of the article from 0 to 100 based on:
   - Relevance to current market events (Bitcoin, ETH, SEC news, ETF, etc.)
   - Mention of major influencers or high-volume tokens
   - Urgency and importance of the content

Output JSON:
{
  "summary": "...",
  "sentiment": "Positive | Neutral | Negative",
  "trending_score": 0-100
}

Article:
${content}`

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const text = data.candidates[0]?.content?.parts[0]?.text

      if (!text) {
        throw new Error('No response from Gemini API')
      }

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Gemini response')
      }

      const analysis = JSON.parse(jsonMatch[0])

      return {
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        trending_score: Math.min(100, Math.max(0, parseInt(analysis.trending_score)))
      }
    } catch (error) {
      console.error('Error analyzing with Gemini:', error)
      // Return default values if analysis fails
      return {
        summary: 'Analysis failed - please try again later',
        sentiment: 'Neutral',
        trending_score: 50
      }
    }
  }
}

export const geminiAnalyzer = new GeminiAnalyzer() 