import { createServerClient } from "@/lib/supabase/server";
import type { Badge, Chapter, LeaderboardEntry, Profile, Progress, PublicChallenge, UserBadge } from "@/lib/types";
import { getXPProgress, type XPProgress } from "@/lib/xp";

export interface ChapterProgressView extends Chapter { solvedCount: number; totalChallenges: number; isComplete: boolean; isLocked: boolean; }
export interface MissionView extends PublicChallenge { isDaily: boolean; isCompleted: boolean; }
export interface BadgeView extends Badge { earned: boolean; isLocked: boolean; earnedAt: string | null; }
export interface RecentSolveView { challengeTitle: string; solvedAt: string; }
export interface DashboardView { profile: Profile; xp: XPProgress; chapters: ChapterProgressView[]; currentMission: MissionView | null; dailyChallenge: MissionView | null; recentSolves: RecentSolveView[]; }
export interface ProfileView { profile: Profile; xp: XPProgress; solvedCount: number; hintsUsed: number; badges: BadgeView[]; }
export interface GameQueryData { profile: Profile; chapters: Chapter[]; challenges: PublicChallenge[]; progress: Progress[]; badges: Badge[]; userBadges: UserBadge[]; }
export interface LeaderboardPageView { entries: LeaderboardEntry[]; currentUser: LeaderboardEntry; }
export type QueryUnavailableReason = "session" | "query";
export type QueryResult<T> = { status: "ready"; data: T } | { status: "unavailable"; reason: QueryUnavailableReason };

const unavailable = <T>(reason: QueryUnavailableReason): QueryResult<T> => ({ status: "unavailable", reason });
const sortChallenges = (left: PublicChallenge, right: PublicChallenge): number => left.chapter_id - right.chapter_id || left.order_num - right.order_num || left.id - right.id;

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
  }).sort(sortChallenges);
  const dailyCandidates = [...data.challenges].sort(sortChallenges);
  const utcDay = Math.floor(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) / 86_400_000);
  const dailyChallenge = dailyCandidates.length ? dailyCandidates[utcDay % dailyCandidates.length] : null;
  const titles = new Map(data.challenges.map((challenge) => [challenge.id, challenge.title]));
  const recentSolves = data.progress.filter((item) => item.is_solved && item.solved_at).sort((a, b) => Date.parse(b.solved_at ?? "") - Date.parse(a.solved_at ?? "")).slice(0, 4).flatMap((item) => {
    const challengeTitle = titles.get(item.challenge_id);
    return challengeTitle && item.solved_at ? [{ challengeTitle, solvedAt: item.solved_at }] : [];
  });
  return {
    profile: data.profile,
    xp: getXPProgress(data.profile.total_xp),
    chapters,
    currentMission: available[0] ? { ...available[0], isDaily: false, isCompleted: false } : null,
    dailyChallenge: dailyChallenge ? { ...dailyChallenge, isDaily: true, isCompleted: solvedIds.has(dailyChallenge.id) } : null,
    recentSolves,
  };
};

export const buildLeaderboardView = (profiles: Profile[]): LeaderboardEntry[] => [...profiles]
  .sort((a, b) => b.total_xp - a.total_xp || Date.parse(a.created_at) - Date.parse(b.created_at) || a.id.localeCompare(b.id))
  .map((profile, index) => ({ rank: index + 1, username: profile.username, display_name: profile.display_name, total_xp: profile.total_xp, level: profile.level }));

export const buildLeaderboardPage = (entries: LeaderboardEntry[], currentProfile: Profile, aheadCount: number): LeaderboardPageView => ({
  entries,
  currentUser: { rank: aheadCount + 1, username: currentProfile.username, display_name: currentProfile.display_name, total_xp: currentProfile.total_xp, level: currentProfile.level },
});

export const buildProfileView = (data: GameQueryData): ProfileView => {
  const earned = new Map(data.userBadges.map((badge) => [badge.badge_id, badge.earned_at]));
  return { profile: data.profile, xp: getXPProgress(data.profile.total_xp), solvedCount: data.progress.filter((item) => item.is_solved).length, hintsUsed: data.progress.reduce((sum, item) => sum + item.hints_used, 0), badges: data.badges.map((badge) => ({ ...badge, earned: earned.has(badge.id), isLocked: !earned.has(badge.id), earnedAt: earned.get(badge.id) ?? null })) };
};

const getOwnGameData = async (userId: string): Promise<QueryResult<GameQueryData>> => {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) return unavailable("session");
    const [profileResult, chaptersResult, challengesResult, progressResult, badgesResult, userBadgesResult] = await Promise.all([
      supabase.from("profiles").select("id, username, display_name, total_xp, level, created_at").eq("id", userId).maybeSingle(),
      supabase.from("chapters").select("id, title, description, domain, order_num, icon, color_accent").order("order_num"),
      supabase.from("challenges_public").select("id, chapter_id, title, description, xp_reward, difficulty, max_hints, file_url, order_num").order("chapter_id").order("order_num"),
      supabase.from("user_progress").select("id, user_id, challenge_id, is_solved, hints_used, attempts, solved_at").eq("user_id", userId),
      supabase.from("badges").select("id, chapter_id, name, description, icon, required_level").order("id"),
      supabase.from("user_badges").select("user_id, badge_id, earned_at").eq("user_id", userId),
    ]);
    if (profileResult.error || chaptersResult.error || challengesResult.error || progressResult.error || badgesResult.error || userBadgesResult.error || !profileResult.data) return unavailable("query");
    return { status: "ready", data: { profile: profileResult.data as Profile, chapters: (chaptersResult.data as Chapter[] | null) ?? [], challenges: (challengesResult.data as PublicChallenge[] | null) ?? [], progress: (progressResult.data as Progress[] | null) ?? [], badges: (badgesResult.data as Badge[] | null) ?? [], userBadges: (userBadgesResult.data as UserBadge[] | null) ?? [] } };
  } catch { return unavailable("query"); }
};

export const getDashboardData = async (userId: string): Promise<QueryResult<DashboardView>> => {
  const result = await getOwnGameData(userId);
  return result.status === "ready" ? { status: "ready", data: buildDashboardView(result.data) } : result;
};

export const getProfileData = async (userId: string): Promise<QueryResult<ProfileView>> => {
  const result = await getOwnGameData(userId);
  return result.status === "ready" ? { status: "ready", data: buildProfileView(result.data) } : result;
};

export const getLeaderboardData = async (userId: string, limit: number): Promise<QueryResult<LeaderboardPageView>> => {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) return unavailable("session");
    const { data: currentProfile, error: currentProfileError } = await supabase.from("profiles").select("id, username, display_name, total_xp, level, created_at").eq("id", userId).maybeSingle();
    if (currentProfileError || !currentProfile) return unavailable("query");
    const profile = currentProfile as Profile;
    const requestedLimit = Math.max(1, Math.min(limit, 100));
    const [entriesResult, higherXPResult, earlierAccountResult, matchingAccountResult] = await Promise.all([
      supabase.from("profiles").select("id, username, display_name, total_xp, level, created_at").order("total_xp", { ascending: false }).order("created_at", { ascending: true }).order("id", { ascending: true }).limit(requestedLimit),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gt("total_xp", profile.total_xp),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("total_xp", profile.total_xp).lt("created_at", profile.created_at),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("total_xp", profile.total_xp).eq("created_at", profile.created_at).lt("id", profile.id),
    ]);
    if (entriesResult.error || higherXPResult.error || earlierAccountResult.error || matchingAccountResult.error || higherXPResult.count === null || earlierAccountResult.count === null || matchingAccountResult.count === null) return unavailable("query");
    return { status: "ready", data: buildLeaderboardPage(buildLeaderboardView((entriesResult.data as Profile[] | null) ?? []), profile, higherXPResult.count + earlierAccountResult.count + matchingAccountResult.count) };
  } catch { return unavailable("query"); }
};
