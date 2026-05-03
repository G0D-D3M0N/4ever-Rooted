/**
 * sync-roadmaps.ts
 * 
 * Fetches the latest roadmap list from roadmap.sh's GitHub and adds any new
 * roadmaps not already in the database.  Safe to run repeatedly — skips
 * anything that already exists.
 * 
 * Usage:
 *   npm run sync:roadmaps
 */

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { roadmaps } from "../shared/schema";
import { config } from "dotenv";

config({ path: "./.env" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client);

const GITHUB_API = "https://api.github.com/repositories/85077558/contents/src/data/roadmaps";
const ROADMAP_BASE_URL = "https://roadmap.sh";

// Map slug → human-readable category
const CATEGORY_MAP: Record<string, string> = {
  "frontend": "Frontend Developer",
  "backend": "Backend Developer",
  "fullstack": "Full Stack Developer",
  "devops": "DevOps",
  "android": "Mobile",
  "ios": "Mobile",
  "react-native": "Mobile",
  "flutter": "Mobile",
  "machine-learning": "Machine Learning",
  "mlops": "Machine Learning",
  "ai-engineer": "AI Engineering",
  "ai-data-scientist": "AI Engineering",
  "ai-agents": "AI Engineering",
  "prompt-engineering": "AI Engineering",
  "python": "Python",
  "javascript": "JavaScript",
  "typescript": "TypeScript",
  "react": "React",
  "vue": "Vue",
  "angular": "Angular",
  "nodejs": "Node.js",
  "golang": "Go",
  "java": "Java",
  "rust": "Rust",
  "cpp": "C++",
  "ruby": "Ruby",
  "php": "PHP",
  "swift-ui": "iOS/Swift",
  "kotlin": "Kotlin",
  "scala": "Scala",
  "cyber-security": "Cyber Security",
  "devsecops": "Cyber Security",
  "docker": "DevOps",
  "kubernetes": "DevOps",
  "terraform": "DevOps",
  "aws": "Cloud",
  "cloudflare": "Cloud",
  "postgresql-dba": "Database",
  "mongodb": "Database",
  "redis": "Database",
  "elasticsearch": "Database",
  "sql": "Database",
  "system-design": "System Design",
  "software-architect": "System Design",
  "software-design-architecture": "System Design",
  "computer-science": "Computer Science",
  "datastructures-and-algorithms": "Computer Science",
  "linux": "Linux",
  "git-github": "Tools",
  "shell-bash": "Linux",
  "game-developer": "Game Development",
  "server-side-game-developer": "Game Development",
  "blockchain": "Blockchain",
  "ux-design": "Design",
  "design-system": "Design",
  "qa": "QA & Testing",
  "technical-writer": "Technical Writing",
  "product-manager": "Product Management",
  "devrel": "Developer Relations",
  "engineering-manager": "Engineering Management",
  "data-analyst": "Data Science",
  "data-engineer": "Data Science",
  "bi-analyst": "Data Science",
  "api-design": "Backend Developer",
  "graphql": "Backend Developer",
  "django": "Python",
  "laravel": "PHP",
  "spring-boot": "Java",
  "aspnet-core": ".NET",
  "nextjs": "React",
  "ruby-on-rails": "Ruby",
  "wordpress": "CMS",
  "leetcode": "Computer Science",
  "code-review": "Best Practices",
  "vibe-coding": "AI Engineering",
};

// Map slug → icon name (lucide-react icons)
const ICON_MAP: Record<string, string> = {
  "frontend": "Monitor", "backend": "Server", "devops": "GitBranch",
  "fullstack": "Layers", "machine-learning": "Brain", "python": "Code",
  "javascript": "FileCode", "typescript": "Code2", "react": "Atom",
  "nodejs": "Server", "golang": "Zap", "cyber-security": "Shield",
  "docker": "Box", "kubernetes": "Network", "system-design": "Network",
  "computer-science": "Cpu", "datastructures-and-algorithms": "GitMerge",
  "linux": "Terminal", "git-github": "GitCommit", "sql": "Database",
  "postgresql-dba": "Database", "mongodb": "Database", "redis": "Database",
  "ai-engineer": "Cpu", "ai-agents": "Bot", "aws": "Cloud",
  "game-developer": "Gamepad2", "blockchain": "Link", "ux-design": "Palette",
  "data-analyst": "BarChart", "data-engineer": "Database", "qa": "CheckSquare",
  "android": "Smartphone", "ios": "Smartphone", "react-native": "Smartphone",
  "flutter": "Smartphone", "rust": "Code", "java": "Coffee",
  "api-design": "Globe", "graphql": "GitMerge", "terraform": "GitBranch",
  "engineering-manager": "Users", "product-manager": "Clipboard",
};

function slugToTitle(slug: string): string {
  const overrides: Record<string, string> = {
    "frontend": "Frontend Developer",
    "backend": "Backend Developer", 
    "devops": "DevOps Engineer",
    "fullstack": "Full Stack Developer",
    "nodejs": "Node.js Developer",
    "golang": "Go Developer",
    "cpp": "C++ Developer",
    "php": "PHP Developer",
    "qa": "QA Engineer",
    "aws": "AWS Cloud",
    "ai-engineer": "AI Engineer",
    "ai-data-scientist": "AI Data Scientist",
    "ai-agents": "AI Agents",
    "ai-red-teaming": "AI Red Teaming",
    "ai-product-builder": "AI Product Builder",
    "aspnet-core": "ASP.NET Core",
    "postgresql-dba": "PostgreSQL DBA",
    "mlops": "MLOps Engineer",
    "devrel": "Developer Relations",
    "devsecops": "DevSecOps",
    "bi-analyst": "BI Analyst",
    "ux-design": "UX Design",
    "git-github": "Git & GitHub",
    "git-github-beginner": "Git & GitHub (Beginner)",
    "shell-bash": "Shell & Bash Scripting",
    "swift-ui": "SwiftUI",
    "frontend-beginner": "Frontend (Beginner)",
    "backend-beginner": "Backend (Beginner)",
    "devops-beginner": "DevOps (Beginner)",
    "vibe-coding": "Vibe Coding (AI)",
    "claude-code": "Claude Code",
    "openclaw": "OpenClaw Game Dev",
    "datastructures-and-algorithms": "Data Structures & Algorithms",
    "software-design-architecture": "Software Design & Architecture",
    "server-side-game-developer": "Server-Side Game Developer",
    "ruby-on-rails": "Ruby on Rails",
    "spring-boot": "Spring Boot",
    "react-native": "React Native",
  };
  if (overrides[slug]) return overrides[slug];
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function slugToDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    "frontend": "Master HTML, CSS, JavaScript, and modern frameworks to build beautiful web interfaces.",
    "backend": "Build robust server-side applications, APIs, and databases.",
    "devops": "CI/CD, infrastructure as code, containers, and cloud-native engineering.",
    "fullstack": "End-to-end web development from database to polished UI.",
    "machine-learning": "From Python fundamentals to neural networks and production ML systems.",
    "python": "Learn Python for web development, automation, data science, and more.",
    "javascript": "Deep dive into JavaScript — the language of the web.",
    "typescript": "Add type safety to JavaScript with TypeScript.",
    "react": "Build modern UIs with React, hooks, and the React ecosystem.",
    "nodejs": "Server-side JavaScript with Node.js, Express, and related tools.",
    "golang": "Learn Go for fast, concurrent, and cloud-native applications.",
    "cyber-security": "Understand threats, ethical hacking, defense strategies, and security engineering.",
    "docker": "Containerize applications with Docker and Docker Compose.",
    "kubernetes": "Container orchestration with Kubernetes — pods, deployments, and services.",
    "system-design": "Design scalable, reliable systems — architecture patterns and trade-offs.",
    "computer-science": "Core CS fundamentals — algorithms, data structures, and theory.",
    "linux": "Master the Linux command line, system administration, and scripting.",
    "aws": "Amazon Web Services — compute, storage, databases, and serverless.",
    "ai-engineer": "Build AI-powered applications with LLMs, RAG, and agents.",
    "sql": "Master relational databases, SQL queries, and schema design.",
    "datastructures-and-algorithms": "Essential algorithms and data structures for coding interviews.",
    "git-github": "Version control with Git and collaborative development on GitHub.",
    "data-analyst": "Data analysis, visualization, SQL, and business intelligence.",
    "data-engineer": "Build data pipelines, warehouses, and ETL systems.",
    "ux-design": "User experience design — research, wireframing, and usability.",
    "blockchain": "Decentralized applications, smart contracts, and Web3 development.",
    "android": "Native Android development with Kotlin and Jetpack Compose.",
    "ios": "iOS app development with Swift and SwiftUI.",
    "flutter": "Cross-platform mobile apps with Flutter and Dart.",
    "react-native": "Cross-platform mobile development with React Native.",
    "rust": "Systems programming with Rust — memory safety without garbage collection.",
    "java": "Enterprise Java development with Spring and the JVM ecosystem.",
    "game-developer": "Game development fundamentals, engines, and design patterns.",
    "qa": "Quality assurance, test automation, and software testing strategies.",
  };
  return descriptions[slug] || `A comprehensive learning roadmap for ${slugToTitle(slug)}.`;
}

interface GitHubEntry { name: string; type: string; }

async function fetchRoadmapSlugs(): Promise<string[]> {
  console.log("📡 Fetching roadmap list from roadmap.sh GitHub...");
  const res = await fetch(GITHUB_API, {
    headers: { "User-Agent": "4ever-rooted-sync" },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data: GitHubEntry[] = await res.json();
  return data.filter(d => d.type === "dir").map(d => d.name);
}

async function syncRoadmaps() {
  console.log("🔄 Syncing roadmaps from roadmap.sh\n");

  const slugs = await fetchRoadmapSlugs();
  console.log(`Found ${slugs.length} roadmaps on roadmap.sh\n`);

  const existing = await db.select().from(roadmaps);
  const existingTitles = new Set(existing.map(r => r.title.toLowerCase()));

  let added = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const title = slugToTitle(slug);
    if (existingTitles.has(title.toLowerCase())) {
      skipped++;
      continue;
    }

    const roadmapData = {
      title,
      description: slugToDescription(slug),
      category: CATEGORY_MAP[slug] || "General",
      icon: ICON_MAP[slug] || "BookOpen",
    };

    await db.insert(roadmaps).values(roadmapData);
    added++;
    console.log(`  ✅ Added: ${title}`);
  }

  console.log(`\n✨ Sync complete!`);
  console.log(`   Added: ${added} new roadmaps`);
  console.log(`   Skipped: ${skipped} (already exist)`);
  console.log(`   Total roadmaps in DB: ${existing.length + added}`);
  console.log(`\n💡 Run 'npm run seed' to populate roadmaps with detailed steps.`);
  process.exit(0);
}

syncRoadmaps().catch(err => {
  console.error("Sync failed:", err);
  process.exit(1);
});
