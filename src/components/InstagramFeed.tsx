"use client";

import { InstagramPost } from "@/lib/social";
import Image from "next/image";

interface InstagramFeedProps {
  posts: InstagramPost[];
}

export function InstagramFeed({ posts }: InstagramFeedProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl font-semibold text-white">From our socials</h2>
        <a
          href="https://www.instagram.com/medicaps_scienceclub/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1"
        >
          Follow us
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          {posts.map((post) => (
            <InstagramPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <InstagramPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

function InstagramPostCard({ post }: { post: InstagramPost }) {
  return (
    <a
      href={post.instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex-shrink-0 w-[280px] md:w-full rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-cyan-400/40 transition-all"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-900">
        <Image
          src={post.imageUrl}
          alt={post.caption}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 280px, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Instagram icon overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1.5">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="p-3">
        <p className="text-xs text-zinc-300 line-clamp-2 group-hover:text-white transition-colors">
          {post.caption}
        </p>
        {post.date && (
          <p className="text-xs text-zinc-500 mt-1">
            {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        )}
        <div className="mt-2 text-xs text-cyan-300 group-hover:text-cyan-200 transition-colors flex items-center gap-1">
          View on Instagram
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </a>
  );
}


