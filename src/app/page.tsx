"use client";
import { useState, useRef, RefObject } from "react";
import { toPng } from "html-to-image";
import { GitHubRepo, GitHubUser } from "./interface/github";
import Card from "./components/Card";

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

  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    console.log("clicked", isFlipped);
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      // Identify front and back faces with proper casting
      const frontFace = cardRef.current.querySelector(
        ".front"
      ) as HTMLElement | null;
      const backFace = cardRef.current.querySelector(
        ".rotate-y-180"
      ) as HTMLElement | null;

      if (!frontFace || !backFace) {
        console.error("Front or Back face element not found.");
        return;
      }

      // Save original visibility states
      const originalFrontFaceVisibility = frontFace.style.visibility || "";
      const originalBackFaceVisibility = backFace.style.visibility || "";

      try {
        // Show only the desired face
        if (isFlipped) {
          frontFace.style.visibility = "hidden"; // Hide front
          backFace.style.visibility = "visible"; // Show back
        } else {
          frontFace.style.visibility = "visible"; // Show front
          backFace.style.visibility = "hidden"; // Hide back
        }

        // Wait for DOM to update
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Capture the visible face
        const dataUrl = await toPng(cardRef.current, { quality: 1 });
        const link = document.createElement("a");
        link.download = `github-card-${data?.userData?.login || "user"}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to download card:", error);
      } finally {
        // Restore original visibility states
        frontFace.style.visibility = originalFrontFaceVisibility;
        backFace.style.visibility = originalBackFaceVisibility;
      }
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
    <main className="max-h-screen max-w-2xl mx-auto px-4 py-4 sm:py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-[#d89838]">
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
                     focus:outline-none focus:ring-2 focus:ring-[#f6b149]
                     dark:focus:ring-[#d89838] font-mono text-[16px]"
          />
          <button
            type="submit"
            disabled={!username || loading}
            className="px-4 sm:px-6 py-2 rounded-lg bg-[#d89838] text-[#eee] font-medium
                     hover:bg-[#d28f2c] disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors text-sm sm:text-base"
          >
            Generate
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6b149] " />
        </div>
      )}

      {data && (
        <div className="flex flex-col items-center">
          <Card
            avatar_url={data.userData.avatar_url}
            name={data.userData.name}
            bio={data.userData.bio}
            blog={data.userData.blog}
            location={data.userData.location}
            login={data.userData.login}
            followers={data.userData.followers}
            public_repos={data.userData.public_repos}
            created_at={data.userData.created_at}
            totalForks={data.stats.totalForks}
            totalStars={data.stats.totalStars}
            mostActiveDay={data.stats.mostActiveDay}
            topLanguages={data.stats.topLanguages}
            isFlipped={isFlipped}
            cardRef={cardRef}
          />

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
            <button
              onClick={handleFlip}
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
                  strokeWidth={1.5}
                  d="M13.4325 20.115L13.695 21.615C14.8146 21.4198 15.8911 21.0288 16.875 20.46L16.125 19.1625C15.2903 19.6355 14.3789 19.958 13.4325 20.115ZM18.315 17.3025L19.5 18.2625C20.2264 17.3903 20.795 16.3978 21.18 15.33L19.7775 14.82C19.4394 15.7269 18.9443 16.5672 18.315 17.3025ZM7.125 20.4375C8.10893 21.0063 9.18539 21.3973 10.305 21.5925L10.5675 20.0925C9.61962 19.9284 8.70814 19.5984 7.875 19.1175L7.125 20.4375ZM4.2525 14.82L2.85 15.33C3.22589 16.3957 3.78421 17.388 4.5 18.2625L4.74 18.0675L5.655 17.3175C5.03631 16.5799 4.5515 15.7397 4.2225 14.835L4.2525 14.82ZM21.75 12C21.7472 10.8634 21.5441 9.73614 21.15 8.67L19.7475 9.18C20.0752 10.0843 20.2452 11.0382 20.25 12H21.75ZM19.5 5.7375C18.5851 4.63603 17.4387 3.74961 16.1425 3.14124C14.8462 2.53286 13.4319 2.21747 12 2.21747C10.5681 2.21747 9.15376 2.53286 7.85752 3.14124C6.56128 3.74961 5.41495 4.63603 4.5 5.7375V3H3V9H9V7.5H5.1075C5.81141 6.42463 6.75685 5.52861 7.86841 4.88336C8.97997 4.23812 10.2269 3.8615 11.5098 3.78355C12.7927 3.7056 14.0761 3.92847 15.2576 4.43439C16.4391 4.9403 17.4861 5.71527 18.315 6.6975L19.5 5.7375Z"
                />
              </svg>
              Flip
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
