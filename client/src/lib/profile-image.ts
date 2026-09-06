import type { SyntheticEvent } from 'react';

type ResolveProfileImageOptions = {
  cacheKey?: string | number;
};

const apiUrl = import.meta.env.VITE_API_URL ?? '';
const apiOrigin = apiUrl.replace(/\/api\/?$/, '');

export const DEFAULT_PROFILE_IMAGE = `${apiOrigin}/api/images/default.png`;
export const DEFAULT_AUTH_PREVIEW_IMAGE = '/at.jpg';

const appendCacheKey = (url: string, cacheKey?: string | number) => {
  if (!cacheKey || url.startsWith('blob:')) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(String(cacheKey))}`;
};

export const resolveProfileImageUrl = (
  profilePicture: string | null | undefined,
  options?: ResolveProfileImageOptions,
) => {
  if (!profilePicture || profilePicture === 'default.png') {
    return appendCacheKey(DEFAULT_PROFILE_IMAGE, options?.cacheKey);
  }

  if (profilePicture.startsWith('blob:') || /^https?:\/\//.test(profilePicture)) {
    return profilePicture;
  }

  if (
    profilePicture.startsWith('/api/') ||
    profilePicture.startsWith('/uploads/') ||
    profilePicture.startsWith('/images/')
  ) {
    return appendCacheKey(`${apiOrigin}${profilePicture}`, options?.cacheKey);
  }

  if (
    profilePicture.startsWith('api/') ||
    profilePicture.startsWith('uploads/') ||
    profilePicture.startsWith('images/')
  ) {
    return appendCacheKey(`${apiOrigin}/${profilePicture}`, options?.cacheKey);
  }

  if (profilePicture.startsWith('/')) {
    return appendCacheKey(profilePicture, options?.cacheKey);
  }

  return appendCacheKey(profilePicture, options?.cacheKey);
};

export const applyProfileImageFallback = (
  event: SyntheticEvent<HTMLImageElement>,
) => {
  const image = event.currentTarget;

  if (image.dataset.fallbackApplied === 'true') {
    return;
  }

  image.dataset.fallbackApplied = 'true';
  image.src = DEFAULT_PROFILE_IMAGE;
};
