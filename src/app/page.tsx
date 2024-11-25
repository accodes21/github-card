"use client";
import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import Image from "next/image";
import Tilt from "react-parallax-tilt";

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  language: string | null;
  pushed_at: string;
  created_at: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  location: string | null;
  public_gists: number;
  avatar_url: string | null;
  bio: string | null;
}

async function getGitHubStats(username: string) {
  const headers: HeadersInit = process.env.GITHUB_ACCESS_TOKEN
    ? {
        Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      }
    : {
        Accept: "application/vnd.github.v3+json",
      };

  const [userResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    }),
    fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    ),
  ]);

  if (!userResponse.ok) throw new Error("User not found");

  const userData = (await userResponse.json()) as GitHubUser;
  const reposData = (await reposResponse.json()) as GitHubRepo[];

  // Calculate repository stats
  const totalStars = reposData.reduce(
    (acc: number, repo) => acc + repo.stargazers_count,
    0
  );
  const totalForks = reposData.reduce(
    (acc: number, repo) => acc + repo.forks_count,
    0
  );

  // Calculate most active day
  const pushDays = reposData.map((repo) => new Date(repo.pushed_at).getDay());
  const dayCount = new Array(7).fill(0);
  pushDays.forEach((day) => dayCount[day]++);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const mostActiveDay = days[dayCount.indexOf(Math.max(...dayCount))];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateFilter = thirtyDaysAgo.toISOString().split("T")[0];

  const commitsResponse = await fetch(
    `https://api.github.com/search/commits?q=author:${username}+committer-date:>=${dateFilter}`,
    {
      headers: {
        ...headers,
        Accept: "application/vnd.github.cloak-preview+json",
      },
      next: { revalidate: 3600 },
    }
  );

  const commitsData = await commitsResponse.json();
  const totalCommits = commitsData.total_count;

  // Calculate top languages
  const languages = reposData.reduce((acc: { [key: string]: number }, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([lang]) => lang)
    .join(", ");

  return {
    userData,
    stats: {
      totalRepos: reposData.length,
      totalStars,
      totalForks,
      mostActiveDay,
      totalCommits,
      topLanguages: topLanguages || "NONE",
    },
  };
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current) {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
      const link = document.createElement("a");
      link.download = `github-card-${data?.userData?.login || "user"}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "github-card.png", {
        type: "image/png",
      });

      if (navigator.share) {
        await navigator.share({
          title: "My GitHub Card",
          text: `Check out my GitHub stats for ${data?.userData?.login}!`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username) return;

    setLoading(true);
    setError("");

    try {
      const stats = await getGitHubStats(username);
      setData(stats);
    } catch (err) {
      setError("User not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-zinc-900 dark:text-white">
          GitHub Card
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Generate a card-style summary of your GitHub profile
        </p>
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          <a
            href="https://x.com/ChopkarAarya"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            made by aaryachopkar
          </a>
          <span className="mx-2">|</span>
          <a
            href="https://aaryachopkar.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Portfolio
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-12">
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            autoCapitalize="none"
            autoComplete="off"
            className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 
                     border border-zinc-200 dark:border-zinc-700 
                     text-zinc-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     dark:focus:ring-blue-400 font-mono text-[16px]"
          />
          <button
            type="submit"
            disabled={!username || loading}
            className="px-4 sm:px-6 py-2 rounded-lg bg-blue-500 text-white font-medium
                     hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors text-sm sm:text-base"
          >
            Generate
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {data && (
        <div className="flex flex-col items-center">
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.25}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            perspective={1000}
            transitionSpeed={1000}
            scale={1.05}
            transitionEasing="cubic-bezier(0.19, 1.0, 0.22, 1.0)"
            glareBorderRadius="0rem"
            className="rounded-[-15px]"
          >
            <div
              ref={cardRef}
              className=" aspect-video w-full bg-[#111] flex shadow-2xl shadow-slate-900 dark:shadow-[#2e2e2e]"
            >
              <div className="w-[47.5%] h-full bg-[#1e1e1e] flex flex-col justify-center items-center">
                <Image
                  src={data.userData.avatar_url}
                  // src="/accodes21.png"
                  alt="user-avatar"
                  width={120}
                  height={120}
                />
                <h3>{data.userData.name}</h3>
                <h3>{data.userData.login}</h3>
                <h3 className="truncate w-[90%] hover:w-auto hover:whitespace-normal transition-all">
                  {data.userData.bio}
                </h3>
              </div>
              <div className="w-[5%] h-full bg-[#F7EA35] fold"></div>
              <div className="w-[47.5%] h-full">
                <table className="flex justify-center items-center">
                  <tbody className="p-4 grid grid-cols-2 text-white gap-x-4">
                    <tr>
                      <td>Username</td>
                    </tr>
                    <tr>
                      <td>{data.userData.login}</td>
                    </tr>
                    <tr>
                      <td>REPOS</td>
                    </tr>
                    <tr>
                      <td>{data.userData.public_repos}</td>
                    </tr>
                    <tr>
                      <td>FOLLOWERS</td>
                    </tr>
                    <tr>
                      <td>{data.userData.followers}</td>
                    </tr>
                    <tr>
                      <td>CREATED-AT</td>
                    </tr>
                    <tr>
                      <td>
                        {
                          new Date(data.userData.created_at)
                            .toISOString()
                            .split("T")[0]
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Tilt>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg 
                       text-zinc-900 dark:text-white
                       hover:bg-zinc-100 dark:hover:bg-zinc-700 
                       transition-colors flex items-center gap-2 text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg
                       text-zinc-900 dark:text-white
                       hover:bg-zinc-100 dark:hover:bg-zinc-700 
                       transition-colors flex items-center gap-2 text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
