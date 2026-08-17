import { useState } from 'react';
import { assetUrl } from '../../lib/images.js';
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
        <img
          src={assetUrl(current.url)}
          alt={current.alt || name}
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
              <img
                src={assetUrl(image.url)}
                alt=""
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
