import { db } from "../server/db";
import { resources } from "@shared/schema";

const NEW_RESOURCES = [
  // ─── Cloud & DevOps ──────────────────────────────────────────────
  ...([
    ["Cloud Platforms", "AWS Free Tier", "https://aws.amazon.com/free", "Free hands-on access to AWS services including EC2, S3, Lambda, and RDS for 12 months."],
    ["Cloud Platforms", "Google Cloud Free Tier", "https://cloud.google.com/free", "Free tier with $300 credits, always-free products like Cloud Functions, Firestore, and BigQuery."],
    ["Cloud Platforms", "Azure Free Account", "https://azure.microsoft.com/en-us/free", "Free Azure services for 12 months plus $200 credits and 60+ always-free services."],
    ["Cloud Platforms", "Oracle Cloud Free Tier", "https://www.oracle.com/cloud/free/", "Always-free ARM-based VPS, databases, and cloud services. No time limit."],
    ["Containers & Docker", "Docker Docs", "https://docs.docker.com/", "Official Docker documentation with guides, tutorials, and best practices for containerization."],
    ["Containers & Docker", "Play with Docker", "https://labs.play-with-docker.com/", "Free online Docker playground — spin up containers in your browser without installing anything."],
    ["Containers & Docker", "KodeKloud Docker Labs", "https://kodekloud.com/courses/docker-for-the-absolute-beginner/", "Hands-on Docker labs from beginner to advanced. Free tier available."],
    ["Containers & Docker", "Docker Curriculum", "https://docker-curriculum.com/", "Comprehensive free tutorial covering Docker fundamentals, compose, and deployment."],
    ["CI/CD & Automation", "GitHub Actions Docs", "https://docs.github.com/en/actions", "Learn CI/CD with GitHub Actions. Free for public repositories and self-hosted runners."],
    ["CI/CD & Automation", "Jenkins User Documentation", "https://www.jenkins.io/doc/", "Open-source automation server documentation. Free and self-hosted CI/CD."],
    ["CI/CD & Automation", "GitLab CI Docs", "https://docs.gitlab.com/ee/ci/", "GitLab's built-in CI/CD with free tier for both SaaS and self-hosted."],
    ["CI/CD & Automation", "DevOpsPath CI/CD", "https://devopspath.io/", "Free interactive CI/CD tutorials covering GitHub Actions, deployment strategies, and pipelines."],
    ["Monitoring & Logging", "Prometheus Docs", "https://prometheus.io/docs/", "Open-source monitoring and alerting toolkit. Free to self-host."],
    ["Monitoring & Logging", "Grafana Play", "https://play.grafana.org/", "Try Grafana dashboards for free — explore observability without any setup."],
    ["Monitoring & Logging", "OpenTelemetry", "https://opentelemetry.io/docs/", "Industry-standard observability framework. Free and open-source."],
  ] as const).map(([sub, title, url, description]) => ({
    title, url, description, category: "Cloud & DevOps", subcategory: sub,
    tags: ["free", "cloud", "devops"], status: "approved", votes: 0, submittedBy: null, warning: null,
  })),

  // ─── Data Science ────────────────────────────────────────────────
  ...([
    ["Analytics & BI", "Google Data Studio", "https://lookerstudio.google.com/", "Free data visualization and business intelligence platform by Google."],
    ["Analytics & BI", "Metabase", "https://www.metabase.com/", "Open-source BI tool — query databases, build dashboards, and share insights for free."],
    ["Analytics & BI", "Tableau Public", "https://public.tableau.com/", "Free data visualization tool — create and share interactive dashboards publicly."],
    ["Analytics & BI", "Apache Superset", "https://superset.apache.org/", "Open-source data exploration and visualization platform. Self-hosted and free."],
    ["Visualization", "D3.js", "https://d3js.org/", "JavaScript library for producing dynamic, interactive data visualizations in the browser."],
    ["Visualization", "Observable Plot", "https://observablehq.com/plot/", "Free, open-source JavaScript charting library with concise API and rich interactivity."],
    ["Visualization", "Vega-Lite", "https://vega.github.io/vega-lite/", "High-level grammar of interactive graphics. Create visualizations with JSON config."],
    ["Visualization", "RAWGraphs", "https://rawgraphs.io/", "Free data visualization tool that bridges spreadsheets and custom vector graphics."],
    ["Statistics & Math", "Khan Academy Statistics", "https://www.khanacademy.org/math/statistics-probability", "Free comprehensive statistics course covering probability, distributions, and inference."],
    ["Statistics & Math", "Seeing Theory", "https://seeing-theory.brown.edu/", "Interactive visual introduction to probability and statistics. Free and open-source."],
    ["Statistics & Math", "StatQuest", "https://www.youtube.com/@statquest", "YouTube channel making statistics and machine learning concepts easy to understand."],
    ["Statistics & Math", "3Blue1Brown", "https://www.3blue1brown.com/", "Visual math explainers covering linear algebra, calculus, and neural networks."],
    ["Big Data & ETL", "Apache Spark", "https://spark.apache.org/docs/latest/", "Unified analytics engine for large-scale data processing. Free and open-source."],
    ["Big Data & ETL", "dbt Learn", "https://docs.getdbt.com/docs/build/documentation", "Free data transformation tutorials — learn analytics engineering with dbt."],
    ["Big Data & ETL", "Data Engineering Cookbook", "https://github.com/oleg-agapov/data-engineering-cookbook", "Free comprehensive guide to modern data engineering tools and practices."],
  ] as const).map(([sub, title, url, description]) => ({
    title, url, description, category: "Data Science", subcategory: sub,
    tags: ["free", "data", "analytics"], status: "approved", votes: 0, submittedBy: null, warning: null,
  })),

  // ─── Career ──────────────────────────────────────────────────────
  ...([
    ["Job Boards", "LinkedIn", "https://www.linkedin.com/jobs/", "World's largest professional network with millions of job listings and company insights."],
    ["Job Boards", "Indeed", "https://www.indeed.com/", "Free job search aggregator with millions of listings from company sites and job boards."],
    ["Job Boards", "Glassdoor", "https://www.glassdoor.com/", "Job listings with company reviews, salary reports, and interview insights."],
    ["Job Boards", "Remote OK", "https://remoteok.com/", "Curated remote job board with tech and startup positions. Free to browse."],
    ["Job Boards", "Hacker News Who's Hiring", "https://hnjobs.com/", "Monthly HN hiring threads — free job board popular with tech startups."],
    ["Resume & Portfolio", "Monster Resume Builder", "https://resume.monster.com/", "Free AI resume builder with ATS-friendly templates and career advice."],
    ["Resume & Portfolio", "Reactive Resume", "https://rxresu.me/", "Free, open-source resume builder with beautiful templates and JSON export."],
    ["Resume & Portfolio", "FlowCV", "https://flowcv.io/", "Free resume builder with modern templates, AI suggestions, and multiple export formats."],
    ["Resume & Portfolio", "GitHub Pages", "https://pages.github.com/", "Free static site hosting from GitHub repos — build your portfolio site at no cost."],
    ["Interview Prep", "Pramp", "https://www.pramp.com/", "Free mock interview platform — practice coding and system design with peers."],
    ["Interview Prep", "LeetCode", "https://leetcode.com/", "Coding interview prep platform with 3000+ problems, free tier available."],
    ["Interview Prep", "InterviewBit", "https://www.interviewbit.com/", "Free coding interview preparation platform with curated practice paths."],
    ["Interview Prep", "Tech Interview Handbook", "https://www.techinterviewhandbook.org/", "Free comprehensive guide to coding interviews — strategies, questions, and tips."],
    ["Freelancing", "Upwork", "https://www.upwork.com/", "Largest freelancing platform. Free to join, connect with clients worldwide."],
    ["Freelancing", "Freelancer", "https://www.freelancer.com/", "Global freelancing marketplace. Free to sign up and bid on projects."],
    ["Freelancing", "Toptal Blog", "https://www.toptal.com/developers/blog", "Free articles on freelance engineering, rates, client management, and career growth."],
  ] as const).map(([sub, title, url, description]) => ({
    title, url, description, category: "Career", subcategory: sub,
    tags: ["free", "career", "jobs"], status: "approved", votes: 0, submittedBy: null, warning: null,
  })),
];

async function main() {
  console.log(`Seeding ${NEW_RESOURCES.length} resources into new categories...`);
  for (const r of NEW_RESOURCES) {
    try {
      await db.insert(resources).values(r);
    } catch (err: any) {
      if (err?.code !== "SQLITE_CONSTRAINT_UNIQUE" && !err?.message?.includes("UNIQUE")) {
        console.error(`Failed to insert "${r.title}":`, err.message);
      }
    }
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
