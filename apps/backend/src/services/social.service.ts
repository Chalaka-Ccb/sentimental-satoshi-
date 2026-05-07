import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';

const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

export interface SocialPost {
  text: string;
  engagement: number;   // likes + retweets / upvotes
  createdAt: string;
  source: 'twitter' | 'reddit';
}

export async function fetchTweets(symbol: string, maxResults = 100): Promise<SocialPost[]> {
  const query = `(${symbol} OR $${symbol}) crypto lang:en -is:retweet -is:reply`;

  try {
    const result = await twitter.v2.search(query, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': ['created_at', 'public_metrics'],
    });

    return result.data.data?.map(t => ({
      text: t.text,
      engagement: (t.public_metrics?.like_count ?? 0) + (t.public_metrics?.retweet_count ?? 0),
      createdAt: t.created_at ?? new Date().toISOString(),
      source: 'twitter' as const,
    })) ?? [];
  } catch (err) {
    console.warn('[Twitter] Fetch failed:', (err as Error).message);
    return [];
  }
}

export async function fetchRedditPosts(symbol: string): Promise<SocialPost[]> {
  const subreddits = ['CryptoCurrency', 'Bitcoin', 'ethfinance', 'altcoin', 'CryptoMarkets'];
  const posts: SocialPost[] = [];

  for (const sub of subreddits) {
    try {
      const { data } = await axios.get(
        `https://www.reddit.com/r/${sub}/search.json`,
        {
          params: { q: symbol, sort: 'new', limit: 20, t: 'day', restrict_sr: false },
          headers: { 'User-Agent': 'SentimentalSatoshi/1.0 (dev)' },
          timeout: 6000,
        }
      );

      const items = data?.data?.children ?? [];
      posts.push(...items.map((item: any) => ({
        text: `${item.data.title} ${item.data.selftext ?? ''}`.slice(0, 1000).trim(),
        engagement: item.data.score + item.data.num_comments,
        createdAt: new Date(item.data.created_utc * 1000).toISOString(),
        source: 'reddit' as const,
      })));
    } catch (err) {
      console.warn(`[Reddit] r/${sub} failed:`, (err as Error).message);
    }
  }

  return posts;
}

export async function fetchAllSocial(symbol: string): Promise<SocialPost[]> {
  const [tweets, reddit] = await Promise.allSettled([
    fetchTweets(symbol),
    fetchRedditPosts(symbol),
  ]);

  return [
    ...(tweets.status === 'fulfilled' ? tweets.value : []),
    ...(reddit.status === 'fulfilled' ? reddit.value : []),
  ];
}