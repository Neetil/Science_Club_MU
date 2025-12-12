"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GalleryImageSkeleton, Skeleton } from "@/components/Skeleton";

const categories = ["All", "Team", "Astronomy Night", "Outreach Visits", "Observations", "Events", "Workshops"];

interface HeroImage {
  id: string;
  src: string;
  category: string;
  title: string;
  description?: string;
}

interface GalleryImage {
  id: string | number;
  src: string; // Base64 (legacy) or URL
  thumbnail?: string; // Base64 (legacy) or URL
  medium?: string; // Base64 (legacy) or URL
  srcUrl?: string; // Vercel Blob URL (preferred)
  thumbnailUrl?: string; // Vercel Blob URL (preferred)
  mediumUrl?: string; // Vercel Blob URL (preferred)
  category: string;
  title: string;
  description?: string;
}

// Hero images for the featured showcase section - hardcoded
const defaultHeroImages: HeroImage[] = [
  {
    id: "hero-1",
    src: "/images/gallery/IMG_73255.jpg",
    category: "Event",
    title: "Orientation Ceremony",
    description: "Introducing the club, the crew, and the cosmic missions we'll take on.",
  },
  {
    id: "hero-2",
    src: "/images/gallery/IMG_7336.JPEG",
    category: "Event",
    title: "Space Talk 2.0",
    description: "When the universe speaks, we listen - Space Talk 2.0 where curiosity dares to touch the unknown.",
  },
  {
    id: "hero-3",
    src: "/images/gallery/IMG_7347.JPG",
    category: "Team",
    title: "The Operational Backbone",
    description: "The backbone of every event and every discovery. Meet the crew that keeps the universe closer to campus.",
  },
  {
    id: "hero-4",
    src: "/images/gallery/IMG_7315.JPEG",
    category: "Astronomy Night",
    title: "Astronomy Night",
    description: "A night of real exploration - where telescopes reveal what the eye can't. A practical dive into the wonders scattered across the night sky.",
  },
  {
    id: "hero-4a",
    src: "/images/gallery/IMG_7381.JPG",
    category: "Team",
    title: "Team Council",
    description: "Meet the leaders of the club - where vision meets action. Shaping events, inspiring members, and pushing boundaries of discovery.",
  },
  {
    id: "hero-4b",
    src: "/images/gallery/IMG_7382.JPG",
    category: "Team",
    title: "Team Heads",
    description: "Meet the heads of each department - where passion meets precision. Guiding events, managing resources, and leading the club towards new heights.",
  },
  {
    id: "hero-4c",
    src: "/images/gallery/IMG_30044.jpg",
    category: "Team",
    title: "Our Cosmic Family",
    description: "The heart of our club - a community of curious minds united by the stars. Together, we learn, explore and celebrate the wonders of the universe.",
  },
  {
    id: "hero-9",
    src: "/images/gallery/IMG_2997.JPEG",
    category: "Astronomy Night",
    title: "Night Under the Stars",
    description: "The universe doesn't sleep - and neither do we. A night of discovery, learning and bonding under the stars.",
  },
  {
    id: "hero-5",
    src: "/images/gallery/IMG_44811.jpg",
    category: "Observation",
    title: "Satellite Model",
    description: "Exploring how tech reaches space - from tiny components to missions that orbit the earth and how satellites keep us connected with the universe.",
  },
  {
    id: "hero-6",
    src: "/images/gallery/IMG_44800.jpg",
    category: "Observation",
    title: "Rocket Model",
    description: "From fuel to flight, where power meets precision, which makes the rockets reach the unreachable.",
  },
  {
    id: "hero-7",
    src: "/images/gallery/45666.jpg",
    category: "Team",
    title: "Spider Man Moment",
    description: "Multiple Spider Man? Nope just us figuring out who's responsible for the mess. Blame travels faster than the speed of light.",
  },
  {
    id: "hero-8",
    src: "/images/gallery/IMG_73345.jpg",
    category: "Team",
    title: "Club Gathering",
    description: "When the club gathers, even the night sky looks brighter. Stories, laughs and a little bit of chaos. Together, we make the club a family.",
  },
];

export default function GalleryPage() {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedImage, setSelectedImage] = useState<(GalleryImage & { description?: string }) | null>(null);
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<Record<string, boolean>>({});
  const [canScrollRight, setCanScrollRight] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [galleryImagesState, setGalleryImagesState] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch gallery data
  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const galleryRes = await fetch(`/api/gallery?page=${page}&limit=20`);

      if (galleryRes.ok) {
        const response = await galleryRes.json();
        // Handle both old format (array) and new format (object with pagination)
        if (Array.isArray(response)) {
          setGalleryImagesState(response);
        } else {
          setGalleryImagesState(response.images || []);
          // TODO: Implement infinite scroll with response.pagination
        }
      }
    } catch (error) {
      console.error("Failed to fetch gallery data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Always use default hero images (they are hardcoded and should not be changed)
  const heroImages = defaultHeroImages;
  const galleryImages = galleryImagesState;

  // Memoize filtered images for expanded modal
  const expandedCategoryImages = useMemo(
    () => expandedCategory ? galleryImages.filter((img) => img.category === expandedCategory) : [],
    [expandedCategory, galleryImages]
  );

  // Memoize category images for lightbox
  const lightboxCategoryImages = useMemo(
    () => selectedImage ? galleryImages.filter((img) => img.category === selectedImage.category) : [],
    [selectedImage, galleryImages]
  );

  // Ensure featuredIndex is valid
  useEffect(() => {
    if (featuredIndex >= heroImages.length && heroImages.length > 0) {
      setFeaturedIndex(0);
    }
  }, [featuredIndex, heroImages.length]);

  // Auto-rotate featured image
  useEffect(() => {
    if (!isAutoPlaying || heroImages.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroImages.length]);

  // Touch swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setFeaturedIndex((prev) => (prev + 1) % heroImages.length);
      setIsAutoPlaying(false);
    }
    if (isRightSwipe) {
      setFeaturedIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
      setIsAutoPlaying(false);
    }
  };

  // Check initial scroll positions for all categories
  useEffect(() => {
    categories.slice(1).forEach((category) => {
      const container = document.getElementById(`scroll-${category}`);
      if (container) {
        const canScrollL = container.scrollLeft > 0;
        const canScrollR = container.scrollLeft < container.scrollWidth - container.clientWidth - 1;
        setCanScrollLeft((prev) => {
          if (prev[category] === canScrollL) return prev;
          return { ...prev, [category]: canScrollL };
        });
        setCanScrollRight((prev) => {
          if (prev[category] === canScrollR) return prev;
          return { ...prev, [category]: canScrollR };
        });
      }
    });
  }, [galleryImages.length]);

  const currentFeatured = heroImages[featuredIndex];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0d14]">
      {/* Dark Background Overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black via-[#0a0d14] to-black" />

      {/* Hero Section - Advanced */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Orbiting Circles */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-indigo-500/20 animate-orbit-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full border border-blue-500/20 animate-orbit-reverse" />
          
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-5xl mx-auto">
          {/* Badge with Advanced Animation */}
          <div className="inline-flex items-center gap-3 rounded-full border border-indigo-500/40 bg-gradient-to-r from-indigo-500/20 via-indigo-500/10 to-indigo-500/20 px-6 py-3 text-xs uppercase tracking-wider text-indigo-200 mb-8 backdrop-blur-sm shadow-lg shadow-indigo-900/30 animate-slide-down-fade">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-400" />
            </span>
            <span className="relative">
              Visual Journey
            </span>
          </div>

          {/* Main Title with Advanced Effects */}
          <div className="relative z-20">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 animate-title-reveal relative z-20">
              <span className="relative inline-block">
                {/* Main text - visible white text with gradient overlay */}
                <span className="relative z-10 text-white" style={{ 
                  background: 'linear-gradient(to right, #c7d2fe, #dbeafe, #c7d2fe)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Gallery
                </span>
              </span>
            </h1>
          </div>

          {/* Subtitle with Typewriter Effect */}
          <div className="relative">
            <p className="text-xl sm:text-2xl md:text-3xl text-zinc-300 max-w-3xl mx-auto leading-relaxed animate-fade-up-delay">
              <span className="inline-block animate-slide-in-word" style={{ animationDelay: "0.2s" }}>
                Moments
              </span>{" "}
              <span className="inline-block animate-slide-in-word" style={{ animationDelay: "0.4s" }}>
                of
              </span>{" "}
              <span className="inline-block text-indigo-300 animate-slide-in-word" style={{ animationDelay: "0.6s" }}>
                discovery
              </span>
              {", "}
              <span className="inline-block text-blue-300 animate-slide-in-word" style={{ animationDelay: "0.8s" }}>
                innovation
              </span>
              {", "}
              <span className="inline-block animate-slide-in-word" style={{ animationDelay: "1s" }}>
                and
              </span>{" "}
              <span className="inline-block text-indigo-300 animate-slide-in-word" style={{ animationDelay: "1.2s" }}>
                cosmic
              </span>{" "}
              <span className="inline-block animate-slide-in-word" style={{ animationDelay: "1.4s" }}>
                exploration
              </span>
            </p>
          </div>

          {/* Animated Underline */}
          <div className="flex justify-center mt-8">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-underline-expand" />
          </div>
        </div>
      </section>

      {/* Featured Image Showcase - Advanced */}
      <section className="px-4 mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative group rounded-3xl overflow-hidden border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-sm shadow-2xl hover:shadow-indigo-900/50 transition-all duration-700">
            <div 
              className="relative aspect-[16/9] overflow-hidden touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Animated Background Layers */}
              <div className="absolute inset-0">
                {heroImages.map((img, index) => (
                  <div
                    key={img.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === featuredIndex
                        ? "opacity-100 z-10 scale-100"
                        : "opacity-0 z-0 scale-110 blur-sm"
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop`;
                      }}
                    />
                    {/* Animated Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer-slow" />
                  </div>
                ))}
              </div>

              {/* Animated Border Glow */}
              <div className="absolute inset-0 border-2 border-indigo-400/0 group-hover:border-indigo-400/60 rounded-3xl transition-all duration-700" />
              <div className="absolute inset-0 border border-indigo-400/30 rounded-3xl animate-pulse-slow pointer-events-none" />
              
              {/* Content Overlay with Slide Animation */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 sm:p-12 pb-10 sm:pb-14 text-white">
                <div className="max-w-2xl transform transition-all duration-700 group-hover:translate-y-0 hidden md:block">
                  <div
                    key={featuredIndex}
                    className="animate-slide-up-fade"
                  >
                    <span className="inline-flex rounded-full bg-indigo-500/30 px-4 py-1.5 text-sm text-indigo-200 ring-1 ring-indigo-500/50 mb-4 backdrop-blur-sm animate-pulse-slow">
                      {currentFeatured.category}
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-3 pb-2 leading-[1.2] bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent animate-text-shimmer">
                      {currentFeatured.title}
                    </h2>
                    <p className="text-lg text-indigo-200 animate-fade-in-delay">{currentFeatured.description}</p>
                  </div>
                </div>
              </div>


              {/* Navigation Dots with Enhanced Animation */}
              <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-30 flex gap-1.5 md:gap-2 backdrop-blur-md bg-black/20 rounded-full px-2 py-1.5 md:px-3 md:py-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFeaturedIndex(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-all duration-500 relative touch-manipulation ${
                      index === featuredIndex
                        ? "md:w-8 w-6 bg-indigo-400 shadow-lg shadow-indigo-400/50"
                        : "bg-indigo-400/40 hover:bg-indigo-400/60 hover:scale-125"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              {/* Enhanced Navigation Arrows */}
              <button
                onClick={() => {
                  setFeaturedIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
                  setIsAutoPlaying(false);
                }}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-indigo-600/90 backdrop-blur-md text-white shadow-2xl shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:scale-125 hover:shadow-indigo-400/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:rotate-[-5deg] touch-manipulation"
                aria-label="Previous"
              >
                <svg className="h-5 w-5 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setFeaturedIndex((prev) => (prev + 1) % heroImages.length);
                  setIsAutoPlaying(false);
                }}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-indigo-600/90 backdrop-blur-md text-white shadow-2xl shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:scale-125 hover:shadow-indigo-400/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:rotate-[5deg] touch-manipulation"
                aria-label="Next"
              >
                <svg className="h-5 w-5 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* Thumbnail Grid - Horizontal Scroll Sections */}
      <section className="px-4 pb-20 relative">
        {/* Dark background for images section */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto space-y-12">
          {categories.slice(1).map((category) => {
            const categoryImages = isLoading ? [] : galleryImages.filter((img) => img.category === category);
            
            // Show skeleton loader while loading
            if (isLoading) {
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton variant="text" width={128} height={32} />
                    <Skeleton variant="text" width={80} height={20} />
                  </div>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
                    {[...Array(4)].map((_, i) => (
                      <GalleryImageSkeleton key={i} />
                    ))}
                  </div>
                </div>
              );
            }
            
            if (categoryImages.length === 0) return null;

            const scrollContainerId = `scroll-${category}`;
            
            const checkScrollPosition = (container: HTMLElement) => {
              const canScrollL = container.scrollLeft > 0;
              const canScrollR = container.scrollLeft < container.scrollWidth - container.clientWidth - 1;
              setCanScrollLeft((prev) => {
                if (prev[category] === canScrollL) return prev;
                return { ...prev, [category]: canScrollL };
              });
              setCanScrollRight((prev) => {
                if (prev[category] === canScrollR) return prev;
                return { ...prev, [category]: canScrollR };
              });
            };

            const scrollLeft = () => {
              const container = document.getElementById(scrollContainerId);
              if (container) {
                const newPosition = container.scrollLeft - 320;
                container.scrollLeft = newPosition;
                setScrollPositions((prev) => ({ ...prev, [category]: newPosition }));
                setTimeout(() => checkScrollPosition(container), 100);
              }
            };

            const scrollRight = () => {
              const container = document.getElementById(scrollContainerId);
              if (container) {
                const newPosition = container.scrollLeft + 320;
                container.scrollLeft = newPosition;
                setScrollPositions((prev) => ({ ...prev, [category]: newPosition }));
                setTimeout(() => checkScrollPosition(container), 100);
              }
            };

            return (
              <div key={category} id={`category-section-${category}`} className="space-y-4 scroll-mt-24">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">{category}</h3>
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer"
                  >
                    {categoryImages.length} photos
                  </button>
                </div>
                <div className="relative">
                  {/* Left Arrow - only show if can scroll left */}
                  {canScrollLeft[category] && (
                    <button
                      onClick={scrollLeft}
                      className="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/90 backdrop-blur-md text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:scale-110 hover:shadow-indigo-400/50"
                      aria-label="Scroll left"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {/* Right Arrow - only show if can scroll right */}
                  {canScrollRight[category] && (
                    <button
                      onClick={scrollRight}
                      className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/90 backdrop-blur-md text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:scale-110 hover:shadow-indigo-400/50"
                      aria-label="Scroll right"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  <div
                    id={scrollContainerId}
                    className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                    style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" }}
                    onScroll={(e) => {
                      const container = e.currentTarget;
                      checkScrollPosition(container);
                    }}
                  >
                    {categoryImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="group relative flex-shrink-0 w-64 md:w-72 snap-start cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-950/40 transition-all duration-500 hover:border-indigo-400/60 hover:shadow-2xl hover:shadow-indigo-900/30 hover:scale-[1.02]">
                          {/* Skeleton loader for individual images */}
                          <div className="absolute inset-0 bg-zinc-800/30 animate-pulse" />
                          <img
                            src={image.mediumUrl || image.medium || image.srcUrl || image.src}
                            alt={image.title}
                            loading={index < 6 ? "eager" : "lazy"}
                            decoding="async"
                            className={`h-full w-full transition-transform duration-700 group-hover:scale-105 ${
                              image.id === 40 ? 'object-contain' : 'object-cover'
                            }`}
                            onLoad={(e) => {
                              // Hide skeleton when image loads
                              const skeleton = e.currentTarget.previousElementSibling as HTMLElement;
                              if (skeleton) skeleton.style.display = 'none';
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const skeleton = target.previousElementSibling as HTMLElement;
                              if (skeleton) skeleton.style.display = 'none';
                              target.src = `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                            <h4 className="text-base font-bold">{image.title}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Scroll indicator */}
                  <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Expanded Grid Modal */}
      <AnimatePresence>
        {expandedCategory && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setExpandedCategory(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="relative max-h-[75vh] max-w-4xl w-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
              }}
            >
              <button
                onClick={() => setExpandedCategory(null)}
                className="absolute top-2 right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/80 text-white shadow-lg transition hover:bg-slate-600 hover:scale-110 border border-slate-600/40"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/40 p-4 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{expandedCategory}</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {expandedCategoryImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-slate-600/30 bg-slate-800/50 cursor-pointer transition-all duration-300 hover:border-slate-500/50 hover:shadow-xl hover:shadow-black/40 hover:scale-[1.02]"
                      onClick={() => {
                        setSelectedImage(image);
                      }}
                    >
                      <img
                        src={image.srcUrl || image.src}
                        alt={image.title}
                        loading="lazy"
                        className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${
                          image.id === 40 || image.id === 41 ? 'object-contain' : 'object-cover'
                        }`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <div className="absolute inset-0 flex flex-col justify-end p-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-4 group-hover:translate-y-0">
                        <h4 className="text-xs font-bold">{image.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      {selectedImage && (() => {
        const currentIndex = lightboxCategoryImages.findIndex((img) => img.id === selectedImage.id);
        const hasPrevious = currentIndex > 0;
        const hasNext = currentIndex < lightboxCategoryImages.length - 1;

        const goToPrevious = () => {
          if (hasPrevious) {
            setSelectedImage(lightboxCategoryImages[currentIndex - 1]);
          }
        };

        const goToNext = () => {
          if (hasNext) {
            setSelectedImage(lightboxCategoryImages[currentIndex + 1]);
          }
        };

        const handleClose = () => {
          setSelectedImage(null);
          // Don't close expandedCategory - let it stay open
        };

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={handleClose}
            style={{ animation: "fadeIn 0.15s ease-out" }}
          >
            <div
              className="relative max-h-[90vh] max-w-6xl w-full"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" && hasPrevious) goToPrevious();
                if (e.key === "ArrowRight" && hasNext) goToNext();
                if (e.key === "Escape") handleClose();
              }}
              tabIndex={0}
              style={{ animation: "scaleIn 0.15s ease-out" }}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute -right-4 -top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg transition hover:bg-cyan-500 hover:scale-110"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/95 backdrop-blur-xl">
                <div className="relative flex items-center justify-center" style={{ minHeight: "70vh" }}>
                  {/* Left Arrow - centered on image */}
                  {hasPrevious && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrevious();
                      }}
                      className="absolute left-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600/90 backdrop-blur-md text-white shadow-2xl shadow-cyan-900/50 transition-all hover:bg-cyan-500 hover:scale-110 hover:shadow-cyan-400/50"
                      aria-label="Previous image"
                    >
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Right Arrow - centered on image */}
                  {hasNext && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="absolute right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600/90 backdrop-blur-md text-white shadow-2xl shadow-cyan-900/50 transition-all hover:bg-cyan-500 hover:scale-110 hover:shadow-cyan-400/50"
                      aria-label="Next image"
                    >
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  <img
                    src={selectedImage.srcUrl || selectedImage.src}
                    alt={selectedImage.title}
                    loading="eager"
                    className="h-auto w-full max-h-[70vh] object-contain"
                    onLoad={(e) => {
                      // Preload full size if medium was used initially
                      const currentSrc = selectedImage.mediumUrl || selectedImage.medium;
                      if (currentSrc && e.currentTarget.src === currentSrc) {
                        const fullImg = new Image();
                        fullImg.src = selectedImage.srcUrl || selectedImage.src;
                        fullImg.onload = () => {
                          e.currentTarget.src = selectedImage.srcUrl || selectedImage.src;
                        };
                      }
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop`;
                    }}
                  />
                </div>
                <div className="border-t border-cyan-500/30 bg-gradient-to-br from-slate-950/95 to-slate-900/95 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-cyan-500/30 px-4 py-1.5 text-sm text-cyan-200 ring-1 ring-cyan-500/50">
                      {selectedImage.category}
                    </span>
                    {lightboxCategoryImages.length > 1 && (
                      <span className="text-sm text-zinc-400">
                        {currentIndex + 1} / {lightboxCategoryImages.length}
                      </span>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{selectedImage.title}</h3>
                  {selectedImage.description && (
                  <p className="text-zinc-300">{selectedImage.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Optimize scrolling performance */
        [id^="scroll-"] {
          will-change: scroll-position;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
        }
        /* GPU acceleration for smooth scrolling */
        [id^="scroll-"] > * {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
