/**
 * Parses FMHY "single-page" markdown (https://api.fmhy.net/single-page) into
 * categorized resource rows aligned with VALID_CATEGORIES in server/validation.ts.
 */

export interface FmhySeedItem {
  title: string;
  url: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  status: string;
  votes: number;
  submittedBy: null;
  warning: null;
}

/** Highest priority — match only FMHY heading trail (helps untangle ambiguous link text). */
const TRAIL_RULES: Array<{ re: RegExp; category: string; subcategory: string }> = [
  { re: /\b(torrenting|torrents?|magnet)\b/i, category: "General Tools", subcategory: "Download Tools" },
  { re: /\b(streaming|watch online|movies?|television|tv shows?)\b/i, category: "Entertainment", subcategory: "Movies & TV" },
  { re: /\b(anime|animanga)\b/i, category: "Entertainment", subcategory: "Anime" },
  { re: /\b(music|audio|listen|podcast)\b/i, category: "Entertainment", subcategory: "Music" },
  { re: /\b(game|gaming|retro|roms?)\b/i, category: "Entertainment", subcategory: "Gaming" },
  { re: /\b(reading|ebooks?|magazines?|novels?|light novels?)\b/i, category: "Books", subcategory: "Programming Books" },
  { re: /\b(image|photos?|wallpaper|gallery)\b/i, category: "Design & UI", subcategory: "Icons & Assets" },
  { re: /\b(android|iphone|ios|mobile apps?)\b/i, category: "General Tools", subcategory: "Mobile Apps" },
  { re: /\b(linux distros?|gnu\/linux)\b/i, category: "Reference", subcategory: "Language Guides" },
  { re: /\b(self[- ]?hosted|homeserver|nas|homelab)\b/i, category: "Programming", subcategory: "Build & Deploy" },
  { re: /\b(ai|machine learning)\b/i, category: "AI & ML", subcategory: "ML Learning" },
  { re: /\b(storage|drive|backup|cloud)\b/i, category: "General Tools", subcategory: "Storage & Cloud" },
  { re: /\b(forums?|discussion|reddit|discord mirrors?)\b/i, category: "Community", subcategory: "Forums & Q&A" },
];

/** Ordered: first matching rule wins (put specific patterns first). */
const SECTION_RULES: Array<{
  re: RegExp;
  category: string;
  subcategory: string;
}> = [
  // Adblocking / DNS hygiene (match before broad "AI" tokens that appear in unrelated filter names)
  { re: /\b(adblock|ublock|ad block|sponsorblock|filterlists?|dns adblock|dns filter|hosts file|easyprivacy|easylist|phishtank|blocklist)\b/i, category: "General Tools", subcategory: "VPN & Privacy" },
  // ── Cybersecurity ───────────────────────────────────────────
  { re: /\b(antivirus|anti[\s-]?malware|malware\s*removal|rootkit|ransomware|sandbox)\b/i, category: "Cybersecurity", subcategory: "Security References" },
  { re: /\b(vpn|privacy tools|privacy[\s\-]guides|encryption|cryptography fundamentals|surveillance)\b/i, category: "Cybersecurity", subcategory: "Web Security Training" },
  { re: /\b(pentest|penetration|burp\s*suite|owasp|vulnerability\s*scanner|ctf|capture\s+the\s+flag|hackthebox|tryhackme|pwning|reverse\s+engineer)\b/i, category: "Cybersecurity", subcategory: "CTF Platforms" },
  { re: /\b(wargames?|bandit|nmap|wireshark|packet\s*capture)\b/i, category: "Cybersecurity", subcategory: "Wargames" },
  // ── AI & ML ──────────────────────────────────────────────────
  {
    re: /\b(llms?|gpt-\d|chatgpt|openai|claude|anthropic|hugging\s*face|huggingface|mistral|groq|colab\.research|jupyter|pytorch|tensorflow|keras|sklearn|scikit|machine learning|deep learning|neural net|stable diffusion|sdxl|ollama|local\s*llm)\b/i,
    category: "AI & ML",
    subcategory: "LLM Development",
  },
  // ── Learning ─────────────────────────────────────────────────
  { re: /\b(course|courses|tutorial|tutorials|mooc|bootcamp|curriculum|e-?learning|learn\s+to\s+code|lecture\s+notes)\b/i, category: "Learning", subcategory: "Courses & Curricula" },
  { re: /\b(youtube|video\s+lecture|lecture\s+series)\b/i, category: "Learning", subcategory: "Video & Lectures" },
  // ── Practice ─────────────────────────────────────────────────
  { re: /\b(leetcode|hackerrank|codewars|codeforces|atcoder|kaggle\s*competition|interview\s*prep|system\s*design\s*interview|sql\s*practice|exercism)\b/i, category: "Practice", subcategory: "Algorithm Challenges" },
  // ── Programming ──────────────────────────────────────────────
  { re: /\b(github|gitlab|snippet|gist|changelog|devtools|compiler|debugger|jetbrains|vscode|visual studio code)\b/i, category: "Programming", subcategory: "Editors & IDEs" },
  { re: /\b(git\b|svn\b|mercurial|gitlab)\b/i, category: "Programming", subcategory: "Version Control" },
  { re: /\b(postgresql|mysql|mongodb|sqlite|redis|neo4j|cassandra)\b/i, category: "Programming", subcategory: "Databases" },
  { re: /\b(react|vue|angular|svelte|next\.js|nuxt|rails|django|spring boot|dotnet|\.net|express\b|nestjs|fastapi|flask|laravel)\b/i, category: "Programming", subcategory: "Frameworks & Ecosystems" },
  { re: /\b(ci\/cd|github actions|gitlab ci|jenkins|travis|circleci)\b/i, category: "Programming", subcategory: "Build & Deploy" },
  { re: /\b(jest|cypress|playwright|selenium|pytest|mocha|vitest)\b/i, category: "Programming", subcategory: "Testing Tools" },
  // ── Dev Tools ────────────────────────────────────────────────
  { re: /\b(api\s*tool|openapi|swagger|graphql|postman\b|hoppscotch|insomnia\b|tunnel|ngrok|cloudflare workers)\b/i, category: "Dev Tools", subcategory: "API Tools" },
  { re: /\b(json|yaml|toml|xml|converter|formatter|beautifier)\b/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  { re: /\b(regex|regexp|regexpal|regex101)\b/i, category: "Dev Tools", subcategory: "Regex & Text Tools" },
  { re: /\b(profiler|devtools|benchmark|lighthouse\b|performance\s*audit)\b/i, category: "Dev Tools", subcategory: "Performance & Debugging" },
  // ── Design & UI ─────────────────────────────────────────────
  { re: /\b(figma|sketch\b|photoshop|illustrator|ui kit|tailwind|palette|gradient|fonts?\.google)\b/i, category: "Design & UI", subcategory: "Design Tools" },
  { re: /\b(icon|icons8|flaticon|heroicons|lucide|svg repo|undraw)\b/i, category: "Design & UI", subcategory: "Icons & Assets" },
  { re: /\b(color picker|colour scheme|typography|font\s*pairing)\b/i, category: "Design & UI", subcategory: "Colors & Theming" },
  // ── Books ───────────────────────────────────────────────────
  { re: /\b(book|pdf|textbook|ebook|manual)\b/i, category: "Books", subcategory: "Programming Books" },
  // ── Community ───────────────────────────────────────────────
  { re: /\b(reddit|discord|slack|telegram|mastodon|stackoverflow|hackernews|news\.ycombinator)\b/i, category: "Community", subcategory: "Forums & Q&A" },
  { re: /\b(podcast|rss\b|engineering blog)\b/i, category: "Community", subcategory: "Tech News & Feeds" },
  // ── Reference ───────────────────────────────────────────────
  { re: /\b(mdn|documentation|manual|spec\b|RFC \d+|caniuse)\b/i, category: "Reference", subcategory: "Documentation" },
  { re: /\b(cheatsheet|cheat sheet|quick.?ref)\b/i, category: "Reference", subcategory: "Cheatsheets" },
  // ── Entertainment (FMHY media sections) ─────────────────────
  { re: /\b(stream|streaming|movies?|series|television)\b/i, category: "Entertainment", subcategory: "Movies & TV" },
  { re: /\b(anime|animanga)\b/i, category: "Entertainment", subcategory: "Anime" },
  { re: /\b(game|gaming|gog\.com|itch\.io|emulator|steam)\b/i, category: "Entertainment", subcategory: "Gaming" },
  { re: /\b(music|spotify\s*alternative|listen)\b/i, category: "Entertainment", subcategory: "Music" },
  { re: /\b(video editor|subtitle|mux|ffmpeg front)\b/i, category: "Entertainment", subcategory: "Video Tools" },
  // ── Storage / Downloads / Networking utilities ──────────────
  { re: /\b(storage|drive|backup|nas|syncthing|nextcloud)\b/i, category: "General Tools", subcategory: "Storage & Cloud" },
  { re: /\b(download manager|wget|curl front|youtube-?dl|yt-?dlp)\b/i, category: "General Tools", subcategory: "Download Tools" },
  { re: /\b(file convert|compression|archive|zip|rar|7z|extract)\b/i, category: "General Tools", subcategory: "File Tools" },
  // ── Linux/macOS/mobile tips often reference-like ────────────
  { re: /\b(windows tweak|software site|opensource alternative|foss|package manager)\b/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  // ── Fallback ─────────────────────────────────────────────────
  { re: /./, category: "General Tools", subcategory: "Converters & Utilities" },
];

/** Extra split pass: items classified as General Tools get re-tested on URL + title. */
const SPLIT_FROM_GENERAL_TOOLS: Array<{
  re: RegExp;
  category: string;
  subcategory: string;
}> = [
  { re: /\.(gov|edu)\b|developer\.mozilla|mdn\b|readme\.dev|ietf\.org|w3\.org/i, category: "Reference", subcategory: "Web Standards" },
  { re: /stackoverflow\.com|stackexchange\.com|askubuntu|superuser\.com/i, category: "Community", subcategory: "Forums & Q&A" },
  { re: /github\.com|gitlab\.com|gist\.github|codeberg\.org/i, category: "Programming", subcategory: "Version Control" },
  { re: /npmjs\.com|pnpm\.io|yarnpkg\.com|pypi\.org/i, category: "Programming", subcategory: "Frameworks & Ecosystems" },
  { re: /readthedocs\.io|gitbook\.com|devtools|webkit\.org/i, category: "Reference", subcategory: "Documentation" },
  { re: /arxiv\.org|aclweb\.org|paperswithcode/i, category: "AI & ML", subcategory: "ML Learning" },
  { re: /medium\.com|dev\.to|substack\.com|hashnode\.com/i, category: "Community", subcategory: "Engineering Blogs" },
  { re: /youtube\.com|youtu\.be|vimeo\.com/i, category: "Learning", subcategory: "Video & Lectures" },
  { re: /reddit\.com|news\.ycombinator|lobste\.rs|mastodon/i, category: "Community", subcategory: "Forums & Q&A" },
  { re: /leetcode|hackerrank|codewars|codility|prepinsta|interviewing\.io|frontendmentor/i, category: "Practice", subcategory: "Interview Prep" },
  { re: /cryptography|owasp|mitre\.org|nist\.gov|cisecurity/i, category: "Cybersecurity", subcategory: "Security References" },
  { re: /regex101|regexp|glot\.io|rubular/i, category: "Dev Tools", subcategory: "Regex & Text Tools" },
  { re: /jsonformatter|jwt\.io|transform\.tools|beautifier/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  { re: /figma\.com|canva\.com|dribbble|behance/i, category: "Design & UI", subcategory: "Design Tools" },
  { re: /font|typography|googlefonts/i, category: "Design & UI", subcategory: "Fonts & Typography" },
  { re: /huggingface|openai|anthropic|ollama|groq/i, category: "AI & ML", subcategory: "Open-Source AI" },
  { re: /wikipedia\.org|wikidata|archive\.org\/details/i, category: "Reference", subcategory: "Documentation" },
  { re: /cloudflare\.com|fastly|imgur|ibb\.co/i, category: "Dev Tools", subcategory: "Performance & Debugging" },
];

export const SKIP_LINE_SECTION_PATTERNS = [
  "non-english",
  "phishing",
  "18+",
  "nsfw",
  "porn",
];

const SKIP_PARENT_SECTION_REGEX = /\b(non-english|discord request|sms|phishing)\b/i;

function normalizeHeading(raw: string): string {
  return raw
    .replace(/^[#►▶▸▷?\s]+/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    // ASCII word chars + common punctuation (avoids TS target issues with \p{} classes)
    .replace(/[^\w\s/+.\-&:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function categorizeFromContext(sectionTrail: string, lineText: string): { category: string; subcategory: string } {
  const trail = sectionTrail.toLowerCase();
  const hay = `${sectionTrail} ${lineText}`.slice(0, 2000);
  for (const rule of TRAIL_RULES) {
    if (rule.re.test(trail)) return { category: rule.category, subcategory: rule.subcategory };
  }
  for (const rule of SECTION_RULES) {
    if (rule.re.test(hay)) return { category: rule.category, subcategory: rule.subcategory };
  }
  return { category: "General Tools", subcategory: "Converters & Utilities" };
}

export function refineSplitGeneralTools(item: FmhySeedItem): FmhySeedItem {
  if (item.category !== "General Tools") return item;
  const blob = `${item.title} ${item.url} ${item.subcategory}`;
  for (const r of SPLIT_FROM_GENERAL_TOOLS) {
    if (r.re.test(blob)) {
      return { ...item, category: r.category, subcategory: r.subcategory };
    }
  }
  return item;
}

/** Third pass — keyword / host heuristics for stragglers still in General Tools. */
const GENERAL_KEYWORD_FALLBACK: Array<{ re: RegExp; category: string; subcategory: string }> = [
  { re: /pastebin|hastebin|privatebin|0x0\.st|file\.io\/|uploadfiles/i, category: "Dev Tools", subcategory: "Code Sharing & Snippets" },
  { re: /uuid|guid generator|nanoid|random user/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  { re: /cron( expr)?|crontab gui|ttl calculator/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  { re: /diff( tool)?|merg(e|ing)|beyond compare/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  { re: /minif(y|ier)|beautif(y|ier)|formatter/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  { re: /regex|regexp/i, category: "Dev Tools", subcategory: "Regex & Text Tools" },
  { re: /json lint|yaml lint|toml lint|protobuf/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  { re: /jwt|oauth|openid|saml tool/i, category: "Dev Tools", subcategory: "API Tools" },
  { re: /ssl( checker)?|certificate( check)?|tls test|dns.?lookup|whois/i, category: "Dev Tools", subcategory: "Performance & Debugging" },
  { re: /speed test|ping test|latency|benchmark/i, category: "Dev Tools", subcategory: "Performance & Debugging" },
  { re: /calculator|unit converter|currency convert|epoch convert|time.?zone/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  { re: /qr code|barcode generator/i, category: "Dev Tools", subcategory: "Online Toolkits" },
  { re: /markdown( editor|viewer)|asciidoc|latex editor/i, category: "Reference", subcategory: "Documentation" },
  { re: /cheatsheet|cheat sheet|quick ref/i, category: "Reference", subcategory: "Cheatsheets" },
  { re: /wikipedia|wikibooks|fandom\.com|encyclopedia/i, category: "Reference", subcategory: "Documentation" },
  { re: /khan academy|coursera|edx\.org|mit ocw|open\.edu|freecodecamp|theodinproject/i, category: "Learning", subcategory: "Courses & Curricula" },
  { re: /udemy|skillshare|pluralsight|linkedin learning/i, category: "Learning", subcategory: "Video & Lectures" },
  { re: /scholar|researchgate|semanticscholar|ieee|acm\.org/i, category: "Reference", subcategory: "Documentation" },
  { re: /discord\.gg|discord\.com\/invite|t\.me\/|telegram\.me/i, category: "Community", subcategory: "Forums & Q&A" },
  { re: /slack\.com|matrix\.org|element\.io/i, category: "Community", subcategory: "Forums & Q&A" },
  { re: /blog\.|engineering\.|tech blog|hackernoon|smashing magazine/i, category: "Community", subcategory: "Engineering Blogs" },
  { re: /docker\.com|kubernetes|k8s|helm\.sh|terraform/i, category: "Programming", subcategory: "Build & Deploy" },
  { re: /ansible|vagrantup|packer\.io|nomad/i, category: "Programming", subcategory: "Build & Deploy" },
  { re: /npm |yarn add|pnpm dlx|pip install|cargo install|composer require/i, category: "Programming", subcategory: "Frameworks & Ecosystems" },
  { re: /vscode|visual studio code|jetbrains|sublime text|vim |neovim|emacs/i, category: "Programming", subcategory: "Editors & IDEs" },
  { re: /leetcode|hackerrank|codewars|codility|codeforces|atcoder/i, category: "Practice", subcategory: "Algorithm Challenges" },
  { re: /interview|system design primer|behavioral prep/i, category: "Practice", subcategory: "Interview Prep" },
  { re: /sql( bolt|zoo|pad)|mode\.com\/sql|sqlite tutorial/i, category: "Practice", subcategory: "SQL Practice" },
  { re: /codecademy|scrimba|sololearn|datacamp/i, category: "Learning", subcategory: "Interactive Platforms" },
  { re: /codecanyon|envato|freepik|vecteezy/i, category: "Design & UI", subcategory: "Icons & Assets" },
  { re: /behance|dribbble|artstation/i, category: "Design & UI", subcategory: "Design Tools" },
  { re: /unsplash|pexels|pixabay/i, category: "Design & UI", subcategory: "Icons & Assets" },
  { re: /font(s|share)?\.google|dafont|1001fonts/i, category: "Design & UI", subcategory: "Fonts & Typography" },
  { re: /coolors|huemint|paletton|adobe color/i, category: "Design & UI", subcategory: "Colors & Theming" },
  { re: /remove\.bg|photopea|gimp|inkscape|krita/i, category: "Design & UI", subcategory: "Design Tools" },
  { re: /malwarebytes|kaspersky|bitdefender|eset|sophos|defender/i, category: "Cybersecurity", subcategory: "Security References" },
  { re: /wireshark|tcpdump|burp suite|metasploit|nessus|openvas/i, category: "Cybersecurity", subcategory: "CTF Platforms" },
  { re: /password manager|bitwarden|keepass|1password/i, category: "Cybersecurity", subcategory: "Web Security Training" },
  { re: /tor project|i2p|freenet/i, category: "Cybersecurity", subcategory: "Security References" },
  { re: /spotify|soundcloud|bandcamp/i, category: "Entertainment", subcategory: "Music" },
  { re: /netflix|disney\+|prime video|hulu\b/i, category: "Entertainment", subcategory: "Movies & TV" },
];

export function refineGeneralToolsKeywords(item: FmhySeedItem): FmhySeedItem {
  if (item.category !== "General Tools") return item;
  const hay = `${item.title} ${item.url}`.toLowerCase();
  for (const r of GENERAL_KEYWORD_FALLBACK) {
    if (r.re.test(hay)) return { ...item, category: r.category, subcategory: r.subcategory };
  }
  return item;
}

export function refineFmhyItem(item: FmhySeedItem): FmhySeedItem {
  return refineGeneralToolsKeywords(refineSplitGeneralTools(item));
}

export interface ParseFmhyOptions {
  maxLinks?: number;
  skipParentSectionPatterns?: string[];
}

/**
 * Parses FMHY single-page markdown. Handles `#`, `##`, and `###` headings
 * (the upstream index mixes `#` and `##` as major sections).
 */
export function parseFmhySinglePageMarkdown(markdown: string, options: ParseFmhyOptions = {}): FmhySeedItem[] {
  const maxLinks = Math.min(options.maxLinks ?? 8500, 20000);
  const skipParent = SKIP_LINE_SECTION_PATTERNS;

  const lines = markdown.split("\n");
  const urlSet = new Set<string>();
  const out: FmhySeedItem[] = [];

  let mainSec = "";
  let subSec = "";
  let leafSec = "";

  function buildTrail(): string {
    return [mainSec, subSec, leafSec].filter(Boolean).join(" › ");
  }

  let skipSubtree = false;

  for (const rawLine of lines) {
    const line = rawLine.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");

    let m = line.match(/^(#{1,3})\s+(.+)\s*$/);
    if (m) {
      const level = m[1].length;
      const name = normalizeHeading(m[2]);
      if (!name) continue;

      if (level === 1) {
        mainSec = name;
        subSec = "";
        leafSec = "";
        skipSubtree = SKIP_PARENT_SECTION_REGEX.test(mainSec.toLowerCase());
      } else if (level === 2) {
        subSec = name;
        leafSec = "";
      } else {
        leafSec = name;
      }
      continue;
    }

    if (skipSubtree) continue;

    const parentSectionLc = mainSec.toLowerCase();
    if (skipParent.some((p) => parentSectionLc.includes(p))) continue;

    const linkRe = /\[([^\]]{1,200})\]\((https:\/\/[^)\s]{5,512})\)/g;
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(line)) !== null) {
      if (out.length >= maxLinks) return out.map(refineFmhyItem);

      const title = match[1].replace(/\*+/g, "").replace(/↪️/g, "").trim();
      const url = match[2].trim().split(/[\s"'’]/)[0];

      if (title.length < 2 || !url.startsWith("https://")) continue;
      if (urlSet.has(url)) continue;
      urlSet.add(url);

      const afterIdx = line.indexOf(match[0]) + match[0].length;
      let rest = line.slice(afterIdx).replace(/^\s*[-—]\s*/, "").trim();
      rest = rest
        .replace(/\*+/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .replace(/↪️/g, "")
        .trim()
        .slice(0, 500);

      const trail = buildTrail();
      const ctx = categorizeFromContext(trail, `${title} ${rest}`);
      const desc = rest.length > 3 ? rest : `${title} — curated from the FMHY index (fmhy.net).`;

      out.push({
        title: title.slice(0, 200),
        url,
        description: desc,
        category: ctx.category,
        subcategory: ctx.subcategory.slice(0, 100),
        tags: ["fmhy"],
        status: "approved",
        votes: 0,
        submittedBy: null,
        warning: null,
      });
    }
  }

  return out.map(refineFmhyItem);
}

export async function fetchFmhySinglePageText(timeoutMs = 120000): Promise<string> {
  const resp = await fetch("https://api.fmhy.net/single-page", {
    headers: { "User-Agent": "4everRooted/1.0 (community resource index importer; +https://github.com/G0D-D3M0N/4everRooted)" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!resp.ok) throw new Error(`FMHY API error: ${resp.status}`);
  const text = await resp.text();
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    throw new Error("FMHY API returned HTML instead of markdown.");
  }
  return text;
}

export async function buildFmhySeedItems(parseOpts?: ParseFmhyOptions): Promise<FmhySeedItem[]> {
  const md = await fetchFmhySinglePageText();
  return parseFmhySinglePageMarkdown(md, parseOpts);
}
