/** Shared utility helpers — avoid duplicating across server actions. */

export const AVATAR_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-red-500',
  'from-indigo-500 to-blue-500',
  'from-teal-500 to-green-500',
  'from-fuchsia-500 to-purple-500',
];

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * Build a Typesense-compatible document from Firestore profile data.
 */
export function toTypesenseDoc(id: string, d: Record<string, unknown>) {
  return {
    id,
    fullName: (d.fullName as string) || '',
    headline: (d.headline as string) || '',
    bio: (d.bio as string) || '',
    company: (d.company as string) || '',
    skills: (d.skills as string[]) || [],
    industries: (d.industries as string[]) || [],
    country: (d.country as string) || '',
    city: (d.city as string) || '',
    availabilityStatus: (d.availabilityStatus as string) || 'available',
    yearsOfExperience: (d.yearsOfExperience as number) || 0,
    reputationScore: (d.reputationScore as number) || 0,
    isVerified: (d.isVerified as boolean) || false,
    accountType: (d.accountType as string) || 'individual',
    subscriptionTier: (d.subscriptionTier as string) || 'free',
    languages: (d.languages as string[]) || [],
    rateMin: (d.rateMin as number) || 0,
    rateMax: (d.rateMax as number) || 0,
    rateCurrency: (d.rateCurrency as string) || 'USD',
  };
}
