export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  instagramUrl: string; // Link to the post on Instagram
  date?: string; // Optional date
}

// Manual configuration for Instagram posts
// Update this array with your actual Instagram post URLs and details
export const instagramPosts: InstagramPost[] = [
  {
    id: "1",
    imageUrl: "/Core_Reveal.png",
    caption: "And here’s the magical team that made your attended event memorable ✨✨",
    instagramUrl: "https://www.instagram.com/reel/DTvE4DyEj7L/?igsh=eHJjdXNvcHY3ZGs2",
    
  },
  {
    id: "2",
    imageUrl: "/Ocean.png",
    caption: "Cosmic eyes. ✨",
    instagramUrl: "https://www.instagram.com/reel/DPbK4NTkRNf/",
   
  },
  {
    id: "3",
    imageUrl: "/Recap.png",
    caption: "Memory Lane of Science Club, team of 2024-25 ❤️✨🥹",
    instagramUrl: "https://www.instagram.com/reel/DMfa-JptjnH/",
    
  },
  {
    id: "4",
    imageUrl: "/Picture.jpeg",
    caption: "Bollywood runs in your veins! ❤️🎬",
    instagramUrl: "https://www.instagram.com/reel/DUGisD7DQw2/",
    
  },
];

// Get Instagram posts (for future API integration)
export function getInstagramPosts(): InstagramPost[] {
  return instagramPosts;
}

