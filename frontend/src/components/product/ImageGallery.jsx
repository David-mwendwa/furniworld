import { useState } from 'react';
import { assetUrl, imageSrcSet } from '../../lib/images.js';
import { cn } from '../../lib/cn.js';

const ImageGallery = ({ images = [], name }) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = images[active];

  if (!current) return <div className="skeleton aspect-[4/3] w-full" />;

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[4/3] cursor-zoom-in overflow-hidden bg-primary-50"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}>
        {/* The main image occupies roughly half the page above `lg` and all of
            it below, so `sizes` says exactly that rather than letting the
            browser assume 100vw everywhere and fetch the 1600w derivative onto
            a phone. */}
        <img
          src={assetUrl(current.url)}
          srcSet={imageSrcSet(current.url)}
          sizes="(min-width: 1024px) 50vw, 100vw"
          alt={current.alt || name}
          fetchPriority="high"
          decoding="async"
          className={cn(
            'h-full w-full object-cover transition-transform duration-700 ease-premium',
            zoomed && 'scale-110'
          )}
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'aspect-square w-20 overflow-hidden border-2 transition-colors',
                index === active ? 'border-primary-800' : 'border-transparent'
              )}>
              {/* An 80px thumbnail was loading the full-size photograph —
                  five of them on a product page, each the same file the main
                  image had already fetched at a different size. 400w is the
                  smallest derivative and still twice the rendered width, which
                  covers a 2x display. */}
              <img
                src={assetUrl(image.url)}
                srcSet={imageSrcSet(image.url)}
                sizes="80px"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
