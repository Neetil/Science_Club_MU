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
    imageUrl: "https://via.placeholder.com/400x400?text=Instagram+Post+2",
    caption: "Night sky observation session was incredible! 🌟",
    instagramUrl: "https://www.instagram.com/p/your-post-id-2/",
   
  },
  {
    id: "3",
    imageUrl: "https://via.placeholder.com/400x400?text=Instagram+Post+3",
    caption: "Workshop highlights - Learning together!",
    instagramUrl: "https://www.instagram.com/p/your-post-id-3/",
    
  },
  {
    id: "4",
    imageUrl: "https://via.placeholder.com/400x400?text=Instagram+Post+4",
    caption: "New members welcome event 🎉",
    instagramUrl: "https://www.instagram.com/p/your-post-id-4/",
    
  },
];

// Get Instagram posts (for future API integration)
export function getInstagramPosts(): InstagramPost[] {
  return instagramPosts;
}

