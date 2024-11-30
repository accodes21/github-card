export interface GitHubRepo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  language: string | null;
  pushed_at: string;
  created_at: string;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
  blog: string | null;
}

export interface CardProps {
  login: string;
  name: string | null;
  followers: number;
  public_repos: number;
  created_at: string;
  location: string | null;
  avatar_url: string;
  bio: string | null;
  blog: string | null;
  totalStars: string | null;
  totalForks: string | null;
  mostActiveDay: string | null;
  topLanguages: string | null;
  isFlipped: boolean;
  cardRef?: React.RefObject<HTMLDivElement>;
}
