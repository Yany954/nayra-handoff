"use client";

import Image from "next/image";
import { useState } from "react";
import { PlayIcon } from "@/presentation/ui/icons";

type Props = {
  videoId: string;
  title: string;
  context: string;
  posterSrc: string;
  posterAlt: string;
};

/**
 * Shows the poster until the visitor presses play, then swaps in the
 * privacy-enhanced YouTube player. Nothing from YouTube loads before that.
 */
export function YouTubeFacade({ videoId, title, context, posterSrc, posterAlt }: Props) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
        title={`Video: ${title}`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 size-full border-0"
      />
    );
  }

  return (
    <>
      <Image
        src={posterSrc}
        alt={posterAlt}
        fill
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-[rgba(15,12,14,0.35)]" />
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Reproducir video: ${title}`}
        className="absolute left-1/2 top-1/2 flex size-[84px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-text-light text-ink"
      >
        <PlayIcon size={30} />
      </button>
      <div className="pointer-events-none absolute bottom-[22px] left-6 right-6 flex flex-col gap-1">
        <span className="font-display text-[22px] font-bold lg:text-[26px]">{title}</span>
        <span className="text-sm text-text-subtle">{context}</span>
      </div>
    </>
  );
}
