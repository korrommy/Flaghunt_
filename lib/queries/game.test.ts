import { describe, expect, it } from "vitest";

import {
  buildDashboardView,
  buildLeaderboardView,
  buildLeaderboardPage,
  buildProfileView,
  type GameQueryData,
} from "@/lib/queries/game";

const baseData: GameQueryData = {
  profile: { id: "user-1", username: "learner", display_name: "Learner", total_xp: 100, level: 2, created_at: "2026-01-02T00:00:00Z" },
  chapters: [
    { id: 1, title: "First", description: "Start", domain: "Intro", order_num: 1, icon: "🔐", color_accent: "#00ff88" },
    { id: 2, title: "Second", description: "Next", domain: "Web", order_num: 2, icon: "🕸️", color_accent: "#d4a84b" },
  ],
  challenges: [
    { id: 11, chapter_id: 1, title: "One", description: "", xp_reward: 100, difficulty: "easy", max_hints: 3, file_url: null, order_num: 1 },
    { id: 12, chapter_id: 1, title: "Two", description: "", xp_reward: 100, difficulty: "easy", max_hints: 3, file_url: null, order_num: 2 },
    { id: 21, chapter_id: 2, title: "Three", description: "", xp_reward: 100, difficulty: "medium", max_hints: 3, file_url: null, order_num: 1 },
  ],
  progress: [],
  badges: [{ id: 1, chapter_id: 1, name: "Starter", description: "", icon: "star", required_level: 3 }],
  userBadges: [],
};

describe("game view mapping", () => {
  it("keeps a new learner's first chapter available with empty progress", () => {
    const dashboard = buildDashboardView(baseData, new Date("2026-07-11T12:00:00Z"));

    expect(dashboard.chapters[0]).toMatchObject({ solvedCount: 0, totalChallenges: 2, isLocked: false });
    expect(dashboard.chapters[1]?.isLocked).toBe(true);
    expect(dashboard.currentMission?.id).toBe(11);
  });

  it("marks completed chapters and unlocks the next chapter", () => {
    const dashboard = buildDashboardView({ ...baseData, progress: [
      { id: 1, user_id: "user-1", challenge_id: 11, is_solved: true, hints_used: 1, attempts: 2, solved_at: "2026-07-10T10:00:00Z" },
      { id: 2, user_id: "user-1", challenge_id: 12, is_solved: true, hints_used: 0, attempts: 1, solved_at: "2026-07-10T11:00:00Z" },
    ] }, new Date("2026-07-11T12:00:00Z"));

    expect(dashboard.chapters[0]).toMatchObject({ isComplete: true, isLocked: false, solvedCount: 2 });
    expect(dashboard.chapters[1]?.isLocked).toBe(false);
  });

  it("orders equal-XP leaderboard entries by account creation date", () => {
    const leaderboard = buildLeaderboardView([
      { id: "late", username: "late", display_name: "Late", total_xp: 500, level: 3, created_at: "2026-02-01T00:00:00Z" },
      { id: "early", username: "early", display_name: "Early", total_xp: 500, level: 3, created_at: "2026-01-01T00:00:00Z" },
    ]);

    expect(leaderboard.map((entry) => entry.username)).toEqual(["early", "late"]);
    expect(leaderboard.map((entry) => entry.rank)).toEqual([1, 2]);
  });

  it("keeps the UTC daily challenge stable after the learner solves it", () => {
    const today = new Date("2026-07-11T12:00:00Z");
    const beforeSolve = buildDashboardView(baseData, today);
    const afterSolve = buildDashboardView({
      ...baseData,
      progress: [{ id: 1, user_id: "user-1", challenge_id: beforeSolve.dailyChallenge?.id ?? 0, is_solved: true, hints_used: 0, attempts: 1, solved_at: "2026-07-11T12:01:00Z" }],
    }, today);

    expect(afterSolve.dailyChallenge?.id).toBe(beforeSolve.dailyChallenge?.id);
  });

  it("does not offer a daily quest from a locked future chapter", () => {
    const dashboard = buildDashboardView(baseData, new Date("1970-01-03T12:00:00Z"));

    expect(dashboard.dailyChallenge?.chapter_id).toBe(1);
  });

  it("keeps a ranked learner below the requested leaderboard page", () => {
    const currentProfile = { id: "learner", username: "learner", display_name: "Learner", total_xp: 0, level: 1, created_at: "2026-01-01T00:00:00Z" };
    const page = buildLeaderboardPage(
      [{ rank: 1, username: "top", display_name: "Top", total_xp: 10_000, level: 10 }],
      currentProfile,
      100,
    );

    expect(page.currentUser).toMatchObject({ username: "learner", rank: 101 });
  });

  it("returns a locked badge for badges not earned by the learner", () => {
    const profile = buildProfileView(baseData);

    expect(profile.badges).toEqual([expect.objectContaining({ id: 1, earned: false, isLocked: true })]);
  });
});
