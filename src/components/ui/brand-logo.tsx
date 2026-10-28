import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

export function BrandLogo({
  iconOnly = false,
  preload = false,
  className,
}: {
  iconOnly?: boolean;
  preload?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={
        iconOnly ? '/images/Infoxem-white-bg-icon.png' : '/images/Infoxem-white-bg-brand-name.png'
      }
      alt="Infoxem"
      width={iconOnly ? 40 : 180}
      height={iconOnly ? 40 : 60}
      sizes={iconOnly ? '40px' : '160px'}
      className={twMerge(
        iconOnly ? 'h-10 w-10 object-contain' : 'h-auto w-[160px] object-contain',
        className,
      )}
      preload={preload}
    />
  );
}
