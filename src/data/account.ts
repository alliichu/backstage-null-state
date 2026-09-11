/**
 * Mock account/user shown in the shell. Matches the topbar drawn in Alli's Sketchbook →
 * page `↳ Null State [WIP🚧]` → frame "Backstage null state" (`2363:43327`).
 */

export const ACCOUNT = {
  siteName: "Sydney's Sweets",
  userName: 'Sydney Smith',
  /** prod reads current_user.avatar_url; null renders pds-avatar's initial-less default */
  avatarUrl: null as string | null,
};
