import clsx from 'clsx';
import { avatarColorFor } from '@/lib/avatar-colors';

const SIZE_CLASSES = {
  sm: 'h-7 w-7 text-[0.65rem]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
} as const;

/**
 * Anonymised students have no photo and no name to take initials from, so
 * this shows the numeric tail of their external ID (e.g. "STU0037" -> "37")
 * in a deterministically-coloured circle — a stable per-row visual anchor
 * instead of a blank cell.
 */
export function StudentAvatar({
  externalId,
  size = 'md',
}: {
  externalId: string;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const { bg, text } = avatarColorFor(externalId);
  const digits = externalId.match(/\d+/)?.[0];
  const label = digits ? digits.slice(-2) : externalId.slice(0, 2).toUpperCase();

  return (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold',
        bg,
        text,
        SIZE_CLASSES[size],
      )}
    >
      {label}
    </span>
  );
}
