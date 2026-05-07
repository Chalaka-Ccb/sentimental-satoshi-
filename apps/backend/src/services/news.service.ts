import axios from 'axios';
import * as cheerio from 'cheerio';

export interface NewsItem {
  headline: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
}

const SOURCES = [
  {
    name: 'Decrypt',
    searchUrl: (s: string) => `https://decrypt.co/?s=${encodeURIComponent(s)}`,
    articleSelector: 'article',
    headlineSelector: 'h3, h2',
    summarySelector: 'p',
    linkSelector: 'a',
    dateSelector: 'time',
  },
  {
    name: 'CoinDesk',
    searchUrl: (s: string) => `https://www.coindesk.com/search?s=${encodeURIComponent(s)}`,
    articleSelector: '[class*="article-card"], article',
    headlineSelector: 'h6, h3, h2',
    summarySelector: 'p',
    linkSelector: 'a',
    dateSelector: 'time',
  },
];

export async function scrapeNews(symbol: string): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  for (const source of SOURCES) {
    try {
      const { data, status } = await axios.get(source.searchUrl(symbol), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SentimentBot/1.0)',
          'Accept': 'text/html',
        },
        timeout: 8000,
      });

      if (status !== 200) continue;

      const $ = cheerio.load(data);
      $(source.articleSelector).slice(0, 8).each((_, el) => {
        const headline = $(el).find(source.headlineSelector).first().text().trim();
        const summary = $(el).find(source.summarySelector).first().text().trim();
        const url = $(el).find(source.linkSelector).first().attr('href') ?? '';
        const publishedAt = $(el).find(source.dateSelector).attr('datetime') ?? '';

        if (headline.length > 10) {
          allItems.push({
            headline,
            summary: summary.slice(0, 300),
            url: url.startsWith('http') ? url : `https://${source.name.toLowerCase().replace(' ', '')}.co${url}`,
            publishedAt,
            source: source.name,
          });
        }
      });

      // Warn if we got zero items — selector likely needs updating
      if (allItems.filter(i => i.source === source.name).length === 0) {
        console.warn(`[News] Zero items from ${source.name} — check selectors`);
      }

    } catch (err) {
      console.warn(`[News] ${source.name} failed:`, (err as Error).message);
    }
  }

  return allItems;
}