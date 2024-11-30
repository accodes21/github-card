// import React, { useState } from 'react'
// import { GitHubRepo, GitHubUser } from '../interface/github';

// async function getGitHubStats(username: string) {
//   const headers: HeadersInit = process.env.GITHUB_ACCESS_TOKEN
//     ? {
//         Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
//         Accept: "application/vnd.github.v3+json",
//       }
//     : {
//         Accept: "application/vnd.github.v3+json",
//       };

//   const [userResponse, reposResponse] = await Promise.all([
//     fetch(`https://api.github.com/users/${username}`, {
//       headers,
//       next: { revalidate: 3600 }, // Cache for 1 hour
//     }),
//     fetch(
//       `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
//       {
//         headers,
//         next: { revalidate: 3600 },
//       }
//     ),
//   ]);

//   if (!userResponse.ok) throw new Error("User not found");

//   const userData = (await userResponse.json()) as GitHubUser;
//   const reposData = (await reposResponse.json()) as GitHubRepo[];

//   // Calculate repository stats
//   const totalStars = reposData.reduce(
//     (acc: number, repo) => acc + repo.stargazers_count,
//     0
//   );
//   const totalForks = reposData.reduce(
//     (acc: number, repo) => acc + repo.forks_count,
//     0
//   );

//   // Calculate most active day
//   const pushDays = reposData.map((repo) =>
//     new Date(repo.pushed_at).getDay()
//   );
//   const dayCount = new Array(7).fill(0);
//   pushDays.forEach((day) => dayCount[day]++);

//   const days = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
//   const mostActiveDay = days[dayCount.indexOf(Math.max(...dayCount))];

//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//   const dateFilter = thirtyDaysAgo.toISOString().split("T")[0];

//   const commitsResponse = await fetch(
//     `https://api.github.com/search/commits?q=author:${username}+committer-date:>=${dateFilter}`,
//     {
//       headers: {
//         ...headers,
//         Accept: "application/vnd.github.cloak-preview+json",
//       },
//       next: { revalidate: 3600 },
//     }
//   );

//   const commitsData = await commitsResponse.json();
//   const totalCommits = commitsData.total_count;

//   // Calculate top languages
//   const languages = reposData.reduce(
//     (acc: { [key: string]: number }, repo) => {
//       if (repo.language) {
//         acc[repo.language] = (acc[repo.language] || 0) + 1;
//       }
//       return acc;
//     },
//     {}
//   );

//   const topLanguages = Object.entries(languages)
//     .sort(([, a], [, b]) => b - a)
//     .slice(0, 3)
//     .map(([lang]) => lang)
//     .join(", ");

//   return {
//     userData,
//     stats: {
//       totalRepos: reposData.length,
//       totalStars,
//       totalForks,
//       mostActiveDay,
//       totalCommits,
//       topLanguages: topLanguages || "NONE",
//     },
//   };
// }
// const Search = () => {
//     const [username, setUsername] = useState("");
//     const [data, setData] = useState<any>(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     async function handleSubmit(e: React.FormEvent) {
//       e.preventDefault();
//       if (!username) return;

//       setLoading(true);
//       setError("");

//       try {
//         const stats = await getGitHubStats(username);
//         setData(stats);
//       } catch (err) {
//         setError("User not found");
//       } finally {
//         setLoading(false);
//       }
//     }
//   return (
//     <form onSubmit={handleSubmit} className="mb-12">
//       <div className="flex gap-2 max-w-md mx-auto">
//         <input
//           type="text"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           placeholder="Enter GitHub username"
//           autoCapitalize="none"
//           autoComplete="off"
//           className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800
//                      border border-zinc-200 dark:border-zinc-700
//                      text-zinc-900 dark:text-white
//                      focus:outline-none focus:ring-2 focus:ring-[#f6b149]
//                      dark:focus:ring-[#d89838] font-mono text-[16px]"
//         />
//         <button
//           type="submit"
//           disabled={!username || loading}
//           className="px-4 sm:px-6 py-2 rounded-lg bg-[#d89838] text-[#eee] font-medium
//                      hover:bg-[#d28f2c] disabled:opacity-50 disabled:cursor-not-allowed
//                      transition-colors text-sm sm:text-base"
//         >
//           Generate
//         </button>
//       </div>
//     </form>
//   );
// }

// export default Search
