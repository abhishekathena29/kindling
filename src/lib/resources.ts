export interface RecommendedResource {
  id: string;
  type: 'video' | 'article';
  title: string;
  sourceName?: string;
  url: string;
  thumbnailUrl?: string;
}

export const VIDEOS: RecommendedResource[] = [
  {
    id: 'vid1',
    type: 'video',
    title: 'Connecting with your Teen',
    url: 'https://youtu.be/zyUURRzH9lI?si=ItI3tknVpwEWqIRS',
    thumbnailUrl: 'https://img.youtube.com/vi/zyUURRzH9lI/hqdefault.jpg',
  },
  {
    id: 'vid2',
    type: 'video',
    title: 'How to talk to your teenagers',
    url: 'https://youtu.be/CiWkg4YmZuY?si=Uvr2XIFHEsSLRdUc',
    thumbnailUrl: 'https://img.youtube.com/vi/CiWkg4YmZuY/hqdefault.jpg',
  },
  {
    id: 'vid3',
    type: 'video',
    title: 'Building a true connection',
    url: 'https://youtu.be/XB9mzXELuAs?si=PvttaQ3Qbfg5buj_',
    thumbnailUrl: 'https://img.youtube.com/vi/XB9mzXELuAs/hqdefault.jpg',
  },
  {
    id: 'vid4',
    type: 'video',
    title: 'Why teens push back',
    url: 'https://youtu.be/AI8jWdD-_Lc?si=setyirpDHrdSlicL',
    thumbnailUrl: 'https://img.youtube.com/vi/AI8jWdD-_Lc/hqdefault.jpg',
  },
  {
    id: 'vid5',
    type: 'video',
    title: 'Listen to understand, not react',
    url: 'https://youtu.be/0vdPxLfAsqo?si=RPwRy_ccw4YVe3I3',
    thumbnailUrl: 'https://img.youtube.com/vi/0vdPxLfAsqo/hqdefault.jpg',
  }
];

export const ARTICLES: RecommendedResource[] = [
  {
    id: 'art1',
    type: 'article',
    title: 'Staying connected with your teen',
    sourceName: 'RaisingChildren.net.au',
    url: 'https://raisingchildren.net.au/pre-teens/communicating-relationships/family-relationships/staying-connected-you-your-teen',
  },
  {
    id: 'art2',
    type: 'article',
    title: '10 tips for meaningful connection',
    sourceName: 'The Gottman Institute',
    url: 'https://www.gottman.com/blog/talking-with-your-teen-10-tips-for-meaningful-connection/',
  },
  {
    id: 'art3',
    type: 'article',
    title: '11 tips for communicating with your teen',
    sourceName: 'UNICEF',
    url: 'https://www.unicef.org/ukraine/en/stories/11-tips-communicating-your-teen',
  },
  {
    id: 'art4',
    type: 'article',
    title: 'Connecting with Teens',
    sourceName: 'RaisingTeenagers.com.au',
    url: 'https://www.raisingteenagers.com.au/connecting-with-teens/',
  },
  {
    id: 'art5',
    type: 'article',
    title: '3 ideas to help you stay connected with your teenager',
    sourceName: 'ParentingPlace.nz',
    url: 'https://parentingplace.nz/resources/3-ideas-to-help-you-stay-connected-with-your-teenager',
  }
];

// Returns exactly 1 random video and 2 random distinct articles.
export function getRandomRecommendations(): RecommendedResource[] {
  const randomVideo = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
  const shuffledArticles = [...ARTICLES].sort(() => 0.5 - Math.random());
  return [randomVideo, shuffledArticles[0], shuffledArticles[1]];
}
