import { createServerClient } from "@/lib/supabase/server";
import type { Badge, Chapter, LeaderboardEntry, Profile, Progress, PublicChallenge, UserBadge } from "@/lib/types";
import { getXPProgress, type XPProgress } from "@/lib/xp";

export interface ChapterProgressView extends Chapter {
  solvedCount: number;
  totalChallenges: number;
  isComplete: boolean;
  isLocked: boolean;
}

export interface MissionView extends PublicChallenge { isDaily: boolean; }
export interface BadgeView extends Badge { earned: boolean; isLocked: boolean; earnedAt: string | null; }
export interface RecentSolveView { challengeTitle: string; solvedAt: string; }
export interface DashboardView { profile: Profile; xp: XPProgress; chapters: ChapterProgressView[]; currentMission: MissionView | null; dailyChallenge: MissionView | null; recentSolves: RecentSolveView[]; }
export interface ProfileView { profile: Profile; xp: XPProgress; solvedCount: number; hintsUsed: number; badges: BadgeView[]; }
export interface GameQueryData { profile: Profile; chapters: Chapter[]; challenges: PublicChallenge[]; progress: Progress[]; badges: Badge[]; userBadges: UserBadge[]; }

const emptyProfile = (id: string): Profile => ({ id, username: "operator", display_name: "ผู้เล่นใหม่", total_xp: 0, level: 1, created_at: new Date(0).toISOString() });

export const buildDashboardView = (data: GameQueryData, today: Date = new Date()): DashboardView => {
  const solvedIds = new Set(data.progress.filter((item) => item.is_solved).map((item) => item.challenge_id));
  const chapters = [...data.chapters].sort((a, b) => a.order_num - b.order_num).map((chapter, index, all) => {
    const challenges = data.challenges.filter((challenge) => challenge.chapter_id === chapter.id);
    const solvedCount = challenges.filter((challenge) => solvedIds.has(challenge.id)).length;
    const previous = all[index - 1];
    const previousChallenges = previous ? data.challenges.filter((challenge) => challenge.chapter_id === previous.id) : [];
    const previousComplete = previousChallenges.length > 0 && previousChallenges.every((challenge) => solvedIds.has(challenge.id));
    return { ...chapter, solvedCount, totalChallenges: challenges.length, isComplete: challenges.length > 0 && solvedCount === challenges.length, isLocked: index > 0 && !previousComplete };
  });
  const available = data.challenges.filter((challenge) => {
    const chapter = chapters.find((item) => item.id === challenge.chapter_id);
    return chapter && !chapter.isLocked && !solvedIds.has(challenge.id);
  }).sort((a, b) => a.chapter_id - b.chapter_id || a.order_num - b.order_num);
  const dailyCandidates = data.challenges.filter((challenge) => !solvedIds.has(challenge.id)).sort((a, b) => a.id - b.id);
  const utcDay = Math.floor(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) / 86_400_000);
  const dailyChallenge = dailyCandidates.length ? dailyCandidates[utcDay % dailyCandidates.length] : null;
  const titles = new Map(data.challenges.map((challenge) => [challenge.id, challenge.title]));
  const recentSolves = data.progress.filter((item) => item.is_solved && item.solved_at).sort((a, b) => Date.parse(b.solved_at ?? "") - Date.parse(a.solved_at ?? "")).slice(0, 4).flatMap((item) => {
    const challengeTitle = titles.get(item.challenge_id);
    return challengeTitle && item.solved_at ? [{ challengeTitle, solvedAt: item.solved_at }] : [];
  });
  return { profile: data.profile, xp: getXPProgress(data.profile.total_xp), chapters, currentMission: available[0] ? { ...available[0], isDaily: false } : null, dailyChallenge: dailyChallenge ? { ...dailyChallenge, isDaily: true } : null, recentSolves };
};

export const buildLeaderboardView = (profiles: Profile[]): LeaderboardEntry[] => [...profiles]
  .sort((a, b) => b.total_xp - a.total_xp || Date.parse(a.created_at) - Date.parse(b.created_at))
  .map((profile, index) => ({ rank: index + 1, username: profile.username, display_name: profile.display_name, total_xp: profile.total_xp, level: profile.level }));

export const buildProfileView = (data: GameQueryData): ProfileView => {
  const earned = new Map(data.userBadges.map((badge) => [badge.badge_id, badge.earned_at]));
  return { profile: data.profile, xp: getXPProgress(data.profile.total_xp), solvedCount: data.progress.filter((item) => item.is_solved).length, hintsUsed: data.progress.reduce((sum, item) => sum + item.hints_used, 0), badges: data.badges.map((badge) => ({ ...badge, earned: earned.has(badge.id), isLocked: !earned.has(badge.id), earnedAt: earned.get(badge.id) ?? null })) };
};

const getOwnGameData = async (userId: string): Promise<GameQueryData> => {
  const fallback: GameQueryData = { profile: emptyProfile(userId), chapters: [], challenges: [], progress: [], badges: [], userBadges: [] };
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) return fallback;
    const [profileResult, chaptersResult, challengesResult, progressResult, badgesResult, userBadgesResult] = await Promise.all([
      supabase.from("profiles").select("id, username, display_name, total_xp, level, created_at").eq("id", userId).maybeSingle(),
      supabase.from("chapters").select("id, title, description, domain, order_num, icon, color_accent").order("order_num"),
      supabase.from("challenges_public").select("id, chapter_id, title, description, xp_reward, difficulty, max_hints, file_url, order_num").order("chapter_id").order("order_num"),
      supabase.from("user_progress").select("id, user_id, challenge_id, is_solved, hints_used, attempts, solved_at").eq("user_id", userId),
      supabase.from("badges").select("id, chapter_id, name, description, icon, required_level").order("id"),
      supabase.from("user_badges").select("user_id, badge_id, earned_at").eq("user_id", userId),
    ]);
    return { profile: (profileResult.data as Profile | null) ?? fallback.profile, chapters: (chaptersResult.data as Chapter[] | null) ?? [], challenges: (challengesResult.data as PublicChallenge[] | null) ?? [], progress: (progressResult.data as Progress[] | null) ?? [], badges: (badgesResult.data as Badge[] | null) ?? [], userBadges: (userBadgesResult.data as UserBadge[] | null) ?? [] };
  } catch { return fallback; }
};

export const getDashboardData = async (userId: string): Promise<DashboardView> => buildDashboardView(await getOwnGameData(userId));
export const getProfileData = async (userId: string): Promise<ProfileView> => buildProfileView(await getOwnGameData(userId));

export const getLeaderboard = async (limit: number): Promise<LeaderboardEntry[]> => {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase.from("profiles").select("id, username, display_name, total_xp, level, created_at").order("total_xp", { ascending: false }).order("created_at", { ascending: true }).limit(Math.max(1, Math.min(limit, 100)));
    return buildLeaderboardView((data as Profile[] | null) ?? []);
  } catch { return []; }
};
