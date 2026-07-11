export type Difficulty = "easy" | "medium" | "hard";

export interface Profile { id: string; username: string; display_name: string; total_xp: number; level: number; created_at: string; }
export interface Chapter { id: number; title: string; description: string; domain: string; order_num: number; icon: string; color_accent: string; }
export interface PublicChallenge { id: number; chapter_id: number; title: string; description: string; xp_reward: number; difficulty: Difficulty; max_hints: number; file_url: string | null; order_num: number; }
export interface Progress { id: number; user_id: string; challenge_id: number; is_solved: boolean; hints_used: number; attempts: number; solved_at: string | null; }
export interface Badge { id: number; chapter_id: number | null; name: string; description: string; icon: string; required_level: number; }
export interface EarnedBadge { id: number; name: string; description: string; icon: string; }
export interface UserBadge { user_id: string; badge_id: number; earned_at: string; }
export interface LeaderboardEntry { rank: number; username: string; display_name: string; total_xp: number; level: number; }

export interface ApiSuccess<T> { success: true; data: T; }
export interface ApiFailure { success: false; error: string; }
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface SubmitFlagResult { correct: boolean; xp_earned: number; total_xp: number; level: number; badge: EarnedBadge | null; message: string; }
export interface HintResult { hint: string; hints_used: number; hints_remaining: number; }
export interface WriteupResult { summary: string; real_world_connection: string; key_concepts: string[]; }

export type TerminalCommand = "help" | "clear" | "ls" | "cat" | string;
export interface TerminalScript { challengeId: number; welcomeMessage: string[]; files: Record<string, string>; commands: Record<TerminalCommand, string | string[]>; }
