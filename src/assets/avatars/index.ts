// src/assets/avatars/index.ts
export const AVATARS = {
  a01: require('./astronaut.png'),
  a02: require('./couple.png'),
  a03: require('./family.png'),
  a04: require('./unicorn.png'),
} as const;

export type AvatarKey = keyof typeof AVATARS;

export function getAvatarSource(key?: AvatarKey | null) {
  return key ? AVATARS[key] : null;
}

export const DEFAULT_AVATAR_KEY: AvatarKey = 'a01';
