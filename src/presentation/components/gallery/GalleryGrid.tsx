import Image from "next/image";
import type { GalleryPhoto } from "@/domain/entities";

export function GalleryGrid({ photos }: { photos: readonly GalleryPhoto[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 lg:grid-cols-4">
      {photos.map((photo) => (
        <li key={photo.id} className="m-0">
          <figure className="m-0 flex flex-col gap-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-white/5">
              <Image
                quality={90}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover object-[center_25%]"
              />
            </div>
            {photo.caption && (
              <figcaption className="text-sm text-muted-on-dark">{photo.caption}</figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  );
}
