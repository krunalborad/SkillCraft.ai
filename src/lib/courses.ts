export type Lesson = {
  title: string;
  duration: string;
  videoId: string; // YouTube video ID (verified embeddable)
};

export type Module = {
  title: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  rating: number;
  students: number;
  instructor: { name: string; title: string };
  price: number; // 0 = free
  originalPrice?: number;
  tags: string[];
  curriculum: Module[];
  outcomes: string[];
  gradient: string;
};

// Helper to count lessons
const total = (c: Module[]) => c.reduce((n, m) => n + m.lessons.length, 0);

const raw: Omit<Course, "lessons">[] = [
  {
    slug: "mastering-data-structures",
    title: "Mastering Data Structures & Algorithms",
    tagline: "From arrays to graphs — think like a problem solver",
    description:
      "A deep, project-based dive into DSA. Learn the patterns top engineers use, with AI-personalized practice that adapts to your weak spots in real time.",
    category: "Algorithms",
    level: "Intermediate",
    duration: "12 hours",
    rating: 4.9,
    students: 18420,
    instructor: { name: "Dr. Aanya Rao", title: "Ex-Google • CS PhD" },
    price: 0,
    tags: ["DSA", "LeetCode", "Interview Prep"],
    gradient: "from-cyan/30 to-violet/30",
    curriculum: [
      {
        title: "Foundations",
        lessons: [          { title: "Recursion explained", duration: "11:33", videoId: "ngCos392W4w" },
          { title: "Arrays & strings deep dive", duration: "14:20", videoId: "QJNwK2uJyGs" },
        ],
      },
      {
        title: "Linear & Tree Structures",
        lessons: [
          { title: "Linked lists from scratch", duration: "21:08", videoId: "njTh_OwMljA" },
          { title: "Stacks & queues in practice", duration: "13:55", videoId: "wjI1WNcIntg" },
          { title: "Binary trees & traversal", duration: "18:30", videoId: "fAAZixBzIAI" },
        ],
      },
      {
        title: "Advanced Patterns",
        lessons: [
          { title: "BFS / DFS on graphs", duration: "22:14", videoId: "pcKY4hjDrxk" },
          { title: "Dynamic programming intro", duration: "27:45", videoId: "oBt53YbR9Kk" },
          { title: "Sliding window pattern", duration: "16:02", videoId: "MK-NZ4hN7rs" },
        ],
      },
    ],
    outcomes: [
      "Solve 250+ classic interview problems",
      "Identify the right pattern in under 60 seconds",
      "Build muscle memory with adaptive AI drills",
    ],
  },
  {
    slug: "fullstack-react-node",
    title: "Full-Stack React + Node",
    tagline: "Ship a real product, not just todo apps",
    description:
      "Build, deploy, and scale a complete SaaS — auth, payments, dashboards, and AI features. The AI tutor reviews your code as you go.",
    category: "Full-Stack",
    level: "Intermediate",
    duration: "14 hours",
    rating: 4.8,
    students: 31250,
    instructor: { name: "Marcus Chen", title: "Staff Engineer • Vercel" },
    price: 0,
    tags: ["React", "Node.js", "TypeScript"],
    gradient: "from-violet/30 to-fuchsia-500/30",
    curriculum: [
      {
        title: "Modern React",
        lessons: [
          { title: "React in 100 seconds", duration: "2:25", videoId: "Tn6-PIqc4UM" },
          { title: "React Hooks crash course", duration: "26:48", videoId: "TNhaISOUy6Q" },
          { title: "TypeScript for React devs", duration: "12:10", videoId: "ahCwqrYpIuM" },
        ],
      },
      {
        title: "Backend with Node",
        lessons: [
          { title: "Node.js in 100 seconds", duration: "2:28", videoId: "ENrzD9HAZK4" },
          { title: "Express.js crash course", duration: "44:22", videoId: "L72fhGm1tfE" },
          { title: "PostgreSQL crash course", duration: "30:18", videoId: "qw--VYLpxG4" },
        ],
      },
      {
        title: "Production",
        lessons: [
          { title: "JWT authentication tutorial", duration: "33:45", videoId: "mbsmsi7l3r4" },
        ],
      },
    ],
    outcomes: [
      "Ship a production-grade SaaS",
      "Master modern TypeScript end-to-end",
      "Confidently architect new systems",
    ],
  },
  {
    slug: "applied-machine-learning",
    title: "Applied Machine Learning",
    tagline: "Models that actually solve problems",
    description:
      "From linear regression to transformers — but always grounded in shipping. Includes a personalized capstone matched to your career goals.",
    category: "Machine Learning",
    level: "Advanced",
    duration: "16 hours",
    rating: 4.9,
    students: 12800,
    instructor: { name: "Prof. Lina Okafor", title: "ML Researcher • DeepMind alum" },
    price: 0,
    tags: ["Python", "PyTorch", "MLOps"],
    gradient: "from-emerald-500/30 to-cyan/30",
    curriculum: [
      {
        title: "Math foundations",
        lessons: [
          { title: "Essence of linear algebra", duration: "10:58", videoId: "fNk_zzaMoSs" },
          { title: "Probability for ML", duration: "13:14", videoId: "sEte4hXEgJ8" },
          { title: "Gradient descent, intuitively", duration: "21:00", videoId: "IHZwWFHWa-w" },
        ],
      },
      {
        title: "Classical ML",
        lessons: [
          { title: "Linear regression explained", duration: "16:42", videoId: "nk2CQITm_eo" },
          { title: "Decision trees & random forests", duration: "22:00", videoId: "v6VJ2RO66Ag" },
          { title: "K-Means clustering", duration: "8:35", videoId: "4b5d3muPQmA" },
        ],
      },
      {
        title: "Deep Learning",
        lessons: [
          { title: "But what is a neural network?", duration: "19:13", videoId: "aircAruvnKk" },
          { title: "Convolutional neural networks", duration: "15:40", videoId: "FmpDIaiMIeA" },
          { title: "Attention is all you need", duration: "27:14", videoId: "iDulhoQ2pro" },
        ],
      },
    ],
    outcomes: [
      "Build & deploy 4 production ML systems",
      "Understand transformers from first principles",
      "Get hired as an ML engineer",
    ],
  },
  {
    slug: "system-design-interview",
    title: "System Design for Senior Engineers",
    tagline: "Design Twitter, Uber, and Netflix — confidently",
    description:
      "The system design course that goes beyond buzzwords. Real trade-offs, real numbers, and AI mock interviews that grade you.",
    category: "System Design",
    level: "Advanced",
    duration: "8 hours",
    rating: 4.9,
    students: 9620,
    instructor: { name: "Ravi Patel", title: "Principal Eng • ex-Uber" },
    price: 0,
    tags: ["System Design", "Scalability", "Senior+"],
    gradient: "from-orange-500/30 to-rose-500/30",
    curriculum: [
      {
        title: "Building blocks",
        lessons: [          { title: "Caching strategies", duration: "11:18", videoId: "dGAgxozNWFE" },
          { title: "Load balancing 101", duration: "9:00", videoId: "K0Ta65OqQkY" },
        ],
      },
      {
        title: "Case studies",
        lessons: [
          { title: "Design Twitter", duration: "24:00", videoId: "wYk0xPP_P_8" },
          { title: "Design Uber", duration: "29:11", videoId: "umWABit-wbk" },
          { title: "Design Netflix", duration: "25:30", videoId: "lsMQRaeKNDk" },
        ],
      },
    ],
    outcomes: [
      "Pass FAANG system design rounds",
      "Lead architecture conversations at work",
      "Reason about scale with confidence",
    ],
  },
  {
    slug: "product-design-foundations",
    title: "Product Design Foundations",
    tagline: "Design like a senior — not like a template",
    description:
      "Typography, color, layout, and interaction. Build a portfolio of real product work that recruiters actually remember.",
    category: "UI/UX Design",
    level: "Beginner",
    duration: "9 hours",
    rating: 4.8,
    students: 14200,
    instructor: { name: "Sofia Berg", title: "Design Lead • Linear" },
    price: 0,
    tags: ["UI/UX", "Figma", "Portfolio"],
    gradient: "from-pink-500/30 to-violet/30",
    curriculum: [
      {
        title: "Visual fundamentals",
        lessons: [
          { title: "Typography for designers", duration: "14:20", videoId: "QrNi9FmdlxY" },
          { title: "Color theory in UI", duration: "11:30", videoId: "_2LLXnUdUIc" },
        ],
      },
      {
        title: "Interaction & portfolio",
        lessons: [
          { title: "Figma tutorial for beginners", duration: "24:00", videoId: "FTFaQWZBqQ8" },
        ],
      },
    ],
    outcomes: [
      "Ship a portfolio of 3 real products",
      "Develop your visual taste",
      "Land your first design role",
    ],
  },
  {
    slug: "python-from-zero",
    title: "Python from Zero to Hero",
    tagline: "The most-loved language, taught the right way",
    description:
      "Learn Python the way working engineers actually use it — clean syntax, real projects, and a path into data, AI, and automation.",
    category: "Python",
    level: "Beginner",
    duration: "10 hours",
    rating: 4.9,
    students: 48200,
    instructor: { name: "Mosh Hamedani", title: "Senior dev • Educator" },
    price: 0,
    tags: ["Python", "Beginner", "Scripting"],
    gradient: "from-yellow-400/30 to-cyan/30",
    curriculum: [
      {
        title: "Core language",
        lessons: [
          { title: "Python for beginners", duration: "60:00", videoId: "kqtD5dpn9C8" },
          { title: "Variables & data types", duration: "15:00", videoId: "khKv-8q7YmY" },
          { title: "Functions & modules", duration: "18:30", videoId: "9Os0o3wzS_I" },
        ],
      },
      {
        title: "Real projects",
        lessons: [
          { title: "Build 12 Python projects", duration: "60:00", videoId: "8ext9G7xspg" },
          { title: "Web scraping with Python", duration: "47:00", videoId: "XVv6mJpFOb0" },
        ],
      },
    ],
    outcomes: [
      "Write clean, idiomatic Python",
      "Build 5 real automation projects",
      "Be ready for data science or backend work",
    ],
  },
  {
    slug: "web-foundations",
    title: "Web Foundations: HTML, CSS & JavaScript",
    tagline: "Everything frontend, in one cohesive course",
    description:
      "Master semantic HTML, modern CSS (Grid, Flexbox, Tailwind), and JavaScript deeply — closures, the event loop, async/await, and the patterns used in real codebases.",
    category: "Frontend",
    level: "Beginner",
    duration: "19 hours",
    rating: 4.8,
    students: 81010,
    instructor: { name: "Jen Simmons", title: "Web standards advocate" },
    price: 0,
    tags: ["HTML", "CSS", "JavaScript", "Tailwind", "Async"],
    gradient: "from-pink-500/30 to-orange-500/30",
    curriculum: [
      {
        title: "HTML & CSS basics",
        lessons: [
          { title: "HTML full course", duration: "120:00", videoId: "kUMe1FH4CHE" },
          { title: "CSS in 100 seconds", duration: "2:15", videoId: "OEV8gMkCHXQ" },
          { title: "Flexbox crash course", duration: "20:00", videoId: "fYq5PXgSsbE" },
        ],
      },
      {
        title: "Modern layout",
        lessons: [
          { title: "CSS Grid full course", duration: "60:00", videoId: "rg7Fvvl3taU" },
          { title: "Responsive design", duration: "21:30", videoId: "srvUrASNj0s" },
          { title: "Tailwind CSS crash course", duration: "30:00", videoId: "UBOj6rqRUME" },
        ],
      },
      {
        title: "JavaScript — the language",
        lessons: [
          { title: "JavaScript crash course", duration: "63:00", videoId: "hdI2bqOjy3c" },
          { title: "Closures explained", duration: "14:25", videoId: "vKJpN5FAeF4" },
          { title: "The event loop", duration: "26:52", videoId: "8aGhZQkoFbQ" },
        ],
      },
      {
        title: "Async & modules",
        lessons: [
          { title: "Promises in 100 seconds", duration: "2:08", videoId: "RvYYCGs45L4" },
          { title: "Async / await deep dive", duration: "12:00", videoId: "vn3tm0quoqE" },
          { title: "ES modules explained", duration: "10:30", videoId: "qgRUr-YUk1Q" },
        ],
      },
    ],
    outcomes: [
      "Build pixel-perfect, responsive UIs",
      "Use modern CSS confidently (Grid, container queries, Tailwind)",
      "Read any JS codebase with confidence",
      "Write fast, async-correct JavaScript",
    ],
  },
  {
    slug: "data-sql-essentials",
    title: "Data & SQL Essentials",
    tagline: "Pandas, NumPy, SQL & Postgres — the full data toolkit",
    description:
      "The complete data toolkit: wrangle messy data with Pandas/NumPy, visualize trends, and master SQL — joins, indexes, query plans, and Postgres schema design.",
    category: "Data Science",
    level: "Beginner",
    duration: "19 hours",
    rating: 4.8,
    students: 45400,
    instructor: { name: "Keith Galli", title: "Data Scientist • MIT" },
    price: 0,
    tags: ["Pandas", "NumPy", "SQL", "Postgres", "Visualization"],
    gradient: "from-emerald-500/30 to-blue-500/30",
    curriculum: [
      {
        title: "Python data stack",
        lessons: [
          { title: "Pandas full tutorial", duration: "60:00", videoId: "vmEHCJofslg" },
          { title: "NumPy crash course", duration: "58:00", videoId: "QUT1VHiLmmI" },
          { title: "Matplotlib tutorial", duration: "30:00", videoId: "3Xc3CA655Y4" },
        ],
      },
      {
        title: "Real analysis",
        lessons: [
          { title: "Data analysis project", duration: "45:00", videoId: "eMOA1pPVUc4" },
          { title: "Data cleaning techniques", duration: "21:00", videoId: "bDhvCp3_lYw" },
          { title: "Storytelling with data", duration: "18:00", videoId: "8EMW7io4rSI" },
        ],
      },
      {
        title: "SQL fundamentals",
        lessons: [
          { title: "SQL full course for beginners", duration: "240:00", videoId: "HXV3zeQKqGY" },
          { title: "Joins explained visually", duration: "13:00", videoId: "9yeOJ0ZMUYw" },
          { title: "Indexes & query performance", duration: "18:00", videoId: "YuRO9-rOgv4" },
        ],
      },
      {
        title: "Postgres in practice",
        lessons: [
          { title: "PostgreSQL crash course", duration: "60:00", videoId: "qw--VYLpxG4" },
          { title: "Database design fundamentals", duration: "27:00", videoId: "ztHopE5Wnpc" },
          { title: "Window functions", duration: "23:00", videoId: "Ww71knvhQ-s" },
        ],
      },
    ],
    outcomes: [
      "Wrangle any messy CSV with Pandas",
      "Build clear, insightful visualizations",
      "Write fast SQL queries on huge datasets",
      "Design normalized, scalable Postgres schemas",
    ],
  },
  {
    slug: "cloud-aws-essentials",
    title: "AWS Cloud Essentials",
    tagline: "From zero to deploying real workloads",
    description:
      "EC2, S3, Lambda, IAM, and the architecture patterns AWS-certified engineers actually use. Hands-on labs throughout.",
    category: "Cloud / AWS",
    level: "Beginner",
    duration: "11 hours",
    rating: 4.7,
    students: 19850,
    instructor: { name: "Stephane Maarek", title: "AWS Hero • 11x certified" },
    price: 0,
    tags: ["AWS", "Cloud", "Serverless"],
    gradient: "from-orange-500/30 to-yellow-400/30",
    curriculum: [
      {
        title: "AWS core",
        lessons: [
          { title: "AWS in 10 minutes", duration: "10:00", videoId: "a9__D53WsUs" },
          { title: "AWS full course", duration: "240:00", videoId: "Ia-UEYYR44s" },
          { title: "IAM explained", duration: "18:00", videoId: "Ul6FW4UANGc" },
        ],
      },
      {
        title: "Serverless & beyond",
        lessons: [
          { title: "AWS Lambda tutorial", duration: "30:00", videoId: "EBSdyoO3goc" },
          { title: "S3 crash course", duration: "20:00", videoId: "tfU0JEZjcsg" },
        ],
      },
    ],
    outcomes: [
      "Deploy production workloads on AWS",
      "Understand IAM and security boundaries",
      "Pass the AWS Solutions Architect Associate",
    ],
  },
  {
    slug: "git-github-pro",
    title: "Git & GitHub for Pros",
    tagline: "Branching, rebasing, and shipping like a team",
    description:
      "Stop fearing rebase. Master the workflows used by top open-source teams — feature branches, PR reviews, and CI integration.",
    category: "Git & Workflow",
    level: "Beginner",
    duration: "5 hours",
    rating: 4.8,
    students: 33500,
    instructor: { name: "Kevin Powell", title: "Educator • Frontend" },
    price: 0,
    tags: ["Git", "GitHub", "Workflow"],
    gradient: "from-orange-500/30 to-pink-500/30",
    curriculum: [
      {
        title: "Git basics",
        lessons: [
          { title: "Git & GitHub crash course", duration: "60:00", videoId: "RGOj5yH7evk" },
          { title: "Git branching explained", duration: "20:00", videoId: "FyAAIHHClqI" },
          { title: "Merge vs rebase", duration: "12:00", videoId: "0chZFIZLR_0" },
        ],
      },
      {
        title: "Team workflows",
        lessons: [
          { title: "Pull request workflow", duration: "15:00", videoId: "8lGpZkjnkt4" },
          { title: "GitHub Actions intro", duration: "25:00", videoId: "R8_veQiYBjI" },
          { title: "Conventional commits", duration: "8:00", videoId: "OJqUWvmf4gg" },
        ],
      },
    ],
    outcomes: [
      "Use Git confidently in any team",
      "Resolve any merge conflict",
      "Set up CI/CD with GitHub Actions",
    ],
  },

  // ───────────────────────── NEW COURSES ─────────────────────────

  {
    slug: "modern-web-development",
    title: "Modern Web Development Bootcamp",
    tagline: "Zero to deployed website — the complete path",
    description:
      "A ground-up tour of building and shipping real websites: responsive layout, forms, APIs, and deployment. Built for people who've never coded before.",
    category: "Web Development",
    level: "Beginner",
    duration: "15 hours",
    rating: 4.7,
    students: 22100,
    instructor: { name: "Colt Steele", title: "Educator • Bootcamp founder" },
    price: 0,
    tags: ["Web Development", "HTML", "CSS", "Deployment"],
    gradient: "from-blue-500/30 to-cyan/30",
    curriculum: [
      {
        title: "Getting started",
        lessons: [
          { title: "How the web works", duration: "13:00", videoId: "hJHvdBlSxug" }, // VERIFY
          { title: "Setting up your dev environment", duration: "10:00", videoId: "sBws8MSXN7A" }, // VERIFY
        ],
      },
      {
        title: "Building & shipping",
        lessons: [
          { title: "Responsive web design crash course", duration: "40:00", videoId: "srvUrASNj0s" },
          { title: "Deploying your first site", duration: "16:00", videoId: "8jLOx1hD3_o" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Build and deploy a real website end-to-end",
      "Understand how browsers and servers talk to each other",
      "Be ready to specialize into frontend or full-stack",
    ],
  },
  {
    slug: "mobile-app-development-react-native",
    title: "Mobile App Development with React Native",
    tagline: "One codebase, iOS and Android both",
    description:
      "Build real, installable mobile apps using React Native and Expo — navigation, device APIs, and publishing to the app stores.",
    category: "Mobile Development",
    level: "Intermediate",
    duration: "13 hours",
    rating: 4.7,
    students: 15600,
    instructor: { name: "Priya Nair", title: "Mobile Lead • ex-Swiggy" },
    price: 0,
    tags: ["React Native", "Mobile", "Expo", "iOS", "Android"],
    gradient: "from-indigo-500/30 to-cyan/30",
    curriculum: [
      {
        title: "React Native fundamentals",
        lessons: [
          { title: "React Native in 100 seconds", duration: "2:30", videoId: "gvkqT_Uoahw" }, // VERIFY
          { title: "React Native crash course", duration: "60:00", videoId: "0-S5a0eXPoc" }, // VERIFY
        ],
      },
      {
        title: "Real app features",
        lessons: [
          { title: "Navigation with React Navigation", duration: "22:00", videoId: "nQVCkqvU1uE" }, // VERIFY
          { title: "Publishing to app stores", duration: "18:00", videoId: "3o0J3lc5nUk" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Ship a real cross-platform mobile app",
      "Use native device features (camera, location, storage)",
      "Publish an app to the App Store or Play Store",
    ],
  },
  {
    slug: "wordpress-development",
    title: "WordPress Development Masterclass",
    tagline: "From themes to custom plugins",
    description:
      "Go beyond drag-and-drop — build custom WordPress themes and plugins with PHP, and manage real client sites professionally.",
    category: "WordPress",
    level: "Beginner",
    duration: "9 hours",
    rating: 4.6,
    students: 12300,
    instructor: { name: "Brad Traversy", title: "Educator • Full-stack dev" },
    price: 0,
    tags: ["WordPress", "PHP", "CMS"],
    gradient: "from-blue-600/30 to-slate-400/30",
    curriculum: [
      {
        title: "WordPress basics",
        lessons: [
          { title: "WordPress for beginners", duration: "60:00", videoId: "266h2dSJI2E" }, // VERIFY
          { title: "Installing and configuring WordPress", duration: "15:00", videoId: "1BW4rTsL0jI" }, // VERIFY
        ],
      },
      {
        title: "Custom development",
        lessons: [
          { title: "Custom WordPress theme from scratch", duration: "90:00", videoId: "MBiz9hbUBGY" }, // VERIFY
          { title: "Building a custom plugin", duration: "30:00", videoId: "vp_2617-JcU" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Build a custom WordPress theme from scratch",
      "Develop your own plugins with PHP",
      "Manage and deploy client WordPress sites",
    ],
  },
  {
    slug: "shopify-development",
    title: "Shopify Development for Ecommerce",
    tagline: "Build and customize stores that convert",
    description:
      "Learn Liquid templating, theme customization, and app integrations to build professional Shopify stores for real clients.",
    category: "Shopify",
    level: "Intermediate",
    duration: "8 hours",
    rating: 4.6,
    students: 8900,
    instructor: { name: "Daniel Oshin", title: "Shopify Partner Dev" },
    price: 0,
    tags: ["Shopify", "Liquid", "Ecommerce"],
    gradient: "from-emerald-500/30 to-lime-400/30",
    curriculum: [
      {
        title: "Shopify fundamentals",
        lessons: [
          { title: "Shopify theme development crash course", duration: "45:00", videoId: "cShsvSpX7yE" }, // VERIFY
          { title: "Liquid templating language explained", duration: "20:00", videoId: "psE5vu2ETQY" }, // VERIFY
        ],
      },
      {
        title: "Going further",
        lessons: [
          { title: "Building a custom Shopify section", duration: "18:00", videoId: "AqDp2gWMfQg" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Customize any Shopify theme confidently",
      "Write Liquid templates from scratch",
      "Freelance as a Shopify developer",
    ],
  },
  {
    slug: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    tagline: "Think like an attacker, defend like a pro",
    description:
      "Core security concepts every engineer should know — network security, cryptography basics, common vulnerabilities, and how to defend against them.",
    category: "Cybersecurity",
    level: "Beginner",
    duration: "10 hours",
    rating: 4.8,
    students: 17400,
    instructor: { name: "Heath Adams", title: "Security Consultant • TCM" },
    price: 0,
    tags: ["Cybersecurity", "Networking", "Cryptography"],
    gradient: "from-red-500/30 to-slate-500/30",
    curriculum: [
      {
        title: "Foundations",
        lessons: [
          { title: "Cybersecurity full course for beginners", duration: "120:00", videoId: "U_P23SqJaDc" }, // VERIFY
          { title: "Networking fundamentals for security", duration: "40:00", videoId: "qiQR5rTSshw" }, // VERIFY
        ],
      },
      {
        title: "Threats & defense",
        lessons: [
          { title: "Common web vulnerabilities (OWASP Top 10)", duration: "30:00", videoId: "MSDb1zw5b1M" }, // VERIFY
          { title: "Cryptography basics explained", duration: "25:00", videoId: "jhXCTbFnK8o" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Understand how common attacks actually work",
      "Apply core defensive security practices",
      "Build a foundation for security certifications",
    ],
  },
  {
    slug: "generative-ai-and-llms",
    title: "Generative AI & LLMs in Practice",
    tagline: "Build real products with modern language models",
    description:
      "Prompt engineering, embeddings, RAG pipelines, and fine-tuning — the practical skills to build AI-powered products, not just chat with a model.",
    category: "Generative AI",
    level: "Intermediate",
    duration: "11 hours",
    rating: 4.9,
    students: 21050,
    instructor: { name: "Dr. Sam Whitfield", title: "AI Engineer • ex-OpenAI" },
    price: 0,
    tags: ["Generative AI", "LLMs", "Prompt Engineering", "RAG"],
    gradient: "from-fuchsia-500/30 to-indigo-500/30",
    curriculum: [
      {
        title: "LLM foundations",
        lessons: [
          { title: "But what is a GPT?", duration: "27:00", videoId: "wjZofJX0v4M" },
          { title: "Prompt engineering guide", duration: "35:00", videoId: "_ZvnD73m40o" }, // VERIFY
        ],
      },
      {
        title: "Building with LLMs",
        lessons: [
          { title: "RAG (Retrieval Augmented Generation) explained", duration: "20:00", videoId: "T-D1OfcDW1M" }, // VERIFY
          { title: "Fine-tuning vs prompting", duration: "18:00", videoId: "eC6Hd1hFvos" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Design effective prompts and evaluation loops",
      "Build a RAG pipeline over your own data",
      "Ship an AI feature into a real product",
    ],
  },
  {
    slug: "devops-fundamentals",
    title: "DevOps Fundamentals",
    tagline: "CI/CD, infrastructure, and shipping with confidence",
    description:
      "The practices and tools behind reliable software delivery — CI/CD pipelines, infrastructure as code, monitoring, and incident response.",
    category: "DevOps",
    level: "Intermediate",
    duration: "12 hours",
    rating: 4.7,
    students: 16200,
    instructor: { name: "TechWorld with Nana", title: "DevOps Engineer • Educator" },
    price: 0,
    tags: ["DevOps", "CI/CD", "Infrastructure as Code"],
    gradient: "from-teal-500/30 to-blue-500/30",
    curriculum: [
      {
        title: "Core concepts",
        lessons: [
          { title: "DevOps explained in 100 seconds", duration: "2:30", videoId: "0yWAtQ6wYNM" }, // VERIFY
          { title: "CI/CD pipeline crash course", duration: "40:00", videoId: "scEDHsr3APg" }, // VERIFY
        ],
      },
      {
        title: "Automation & reliability",
        lessons: [
          { title: "Infrastructure as Code with Terraform", duration: "45:00", videoId: "SLB_c_ayRMo" }, // VERIFY
          { title: "Monitoring and observability basics", duration: "22:00", videoId: "1YuDLZY2VZ4" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Set up a real CI/CD pipeline",
      "Manage infrastructure as code",
      "Understand monitoring and on-call basics",
    ],
  },
  {
    slug: "docker-kubernetes",
    title: "Docker & Kubernetes for Developers",
    tagline: "Package once, run anywhere, scale on demand",
    description:
      "Containerize your applications with Docker and orchestrate them at scale with Kubernetes — the exact skills modern backend and platform teams expect.",
    category: "Docker & Kubernetes",
    level: "Intermediate",
    duration: "13 hours",
    rating: 4.8,
    students: 19700,
    instructor: { name: "Mumshad Mannambeth", title: "Kubernetes Certified Trainer" },
    price: 0,
    tags: ["Docker", "Kubernetes", "Containers"],
    gradient: "from-sky-500/30 to-blue-600/30",
    curriculum: [
      {
        title: "Docker basics",
        lessons: [
          { title: "Docker in 100 seconds", duration: "2:30", videoId: "Gjnup-PuquQ" }, // VERIFY
          { title: "Docker crash course", duration: "60:00", videoId: "pTFZFxd4hOI" },
        ],
      },
      {
        title: "Kubernetes in practice",
        lessons: [
          { title: "Kubernetes explained in 100 seconds", duration: "2:30", videoId: "PziYflu8cB8" }, // VERIFY
          { title: "Kubernetes full course for beginners", duration: "180:00", videoId: "X48VuDVv0do" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Containerize any application with Docker",
      "Deploy and scale workloads on Kubernetes",
      "Debug real container and cluster issues",
    ],
  },
  {
    slug: "ethical-hacking",
    title: "Ethical Hacking & Penetration Testing",
    tagline: "Break things legally, then fix them",
    description:
      "Hands-on penetration testing methodology — reconnaissance, exploitation, and reporting, using the same tools real pentesters use in the field.",
    category: "Ethical Hacking",
    level: "Advanced",
    duration: "14 hours",
    rating: 4.8,
    students: 13850,
    instructor: { name: "Zaid Sabih", title: "Ethical Hacker • Security Researcher" },
    price: 0,
    tags: ["Ethical Hacking", "Penetration Testing", "Kali Linux"],
    gradient: "from-rose-600/30 to-slate-600/30",
    curriculum: [
      {
        title: "Setup & recon",
        lessons: [
          { title: "Ethical hacking full course", duration: "150:00", videoId: "3FNYvj2U0HM" }, // VERIFY
          { title: "Reconnaissance techniques", duration: "25:00", videoId: "hHactWMbnv8" }, // VERIFY
        ],
      },
      {
        title: "Exploitation & reporting",
        lessons: [
          { title: "Using Metasploit for beginners", duration: "35:00", videoId: "331lyw6Fq0Q" }, // VERIFY
          { title: "Writing a professional pentest report", duration: "15:00", videoId: "3rIN5nT_ess" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Run a full penetration test methodology",
      "Use industry-standard tools (Kali, Metasploit, Nmap)",
      "Write findings up like a professional pentester",
    ],
  },
  {
    slug: "javascript-typescript-mastery",
    title: "JavaScript & TypeScript Mastery",
    tagline: "The language behind every modern app, deeply understood",
    description:
      "Go from comfortable-with-JS to genuinely deep — prototypes, closures, the event loop — then layer on TypeScript's type system for safer, scalable code.",
    category: "JavaScript",
    level: "Intermediate",
    duration: "12 hours",
    rating: 4.9,
    students: 27300,
    instructor: { name: "Matt Pocock", title: "TypeScript Educator" },
    price: 0,
    tags: ["JavaScript", "TypeScript", "Programming Fundamentals"],
    gradient: "from-yellow-400/30 to-blue-500/30",
    curriculum: [
      {
        title: "JavaScript, deeply",
        lessons: [
          { title: "JavaScript prototypes explained", duration: "18:00", videoId: "wstwjQ1yhCw" }, // VERIFY
          { title: "The event loop", duration: "26:52", videoId: "8aGhZQkoFbQ" },
        ],
      },
      {
        title: "TypeScript in depth",
        lessons: [
          { title: "TypeScript in 100 seconds", duration: "2:30", videoId: "zQnBQ4tB3ZA" },
          { title: "TypeScript full course", duration: "90:00", videoId: "gieEQFIfgYc" }, // VERIFY
          { title: "Generics explained", duration: "16:00", videoId: "EcCTIExsqmI" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Understand JavaScript's execution model deeply",
      "Use TypeScript's type system to catch bugs early",
      "Read and contribute to any modern TS codebase",
    ],
  },
  {
    slug: "api-development-rest-graphql",
    title: "API Development: REST & GraphQL",
    tagline: "Design APIs other developers actually enjoy using",
    description:
      "Learn to design, build, secure, and document production APIs — REST principles, GraphQL schemas, authentication, rate limiting, and versioning done right.",
    category: "API Development",
    level: "Intermediate",
    duration: "10 hours",
    rating: 4.7,
    students: 14900,
    instructor: { name: "Emma Wright", title: "API Platform Lead • Stripe alum" },
    price: 0,
    tags: ["REST", "GraphQL", "API Design", "Authentication"],
    gradient: "from-cyan/30 to-emerald-500/30",
    curriculum: [
      {
        title: "REST fundamentals",
        lessons: [
          { title: "REST API design best practices", duration: "20:00", videoId: "1lVCHtV1UcQ" }, // VERIFY
          { title: "Building a REST API with Node & Express", duration: "45:00", videoId: "pKd0Rpw7O48" }, // VERIFY
        ],
      },
      {
        title: "GraphQL & security",
        lessons: [
          { title: "GraphQL in 100 seconds", duration: "2:30", videoId: "eIQh02xuVw4" }, // VERIFY
          { title: "API authentication with JWT", duration: "22:00", videoId: "7Q17ubqLfaM" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Design REST APIs that scale and version cleanly",
      "Build and query a GraphQL API",
      "Secure APIs with proper auth and rate limiting",
    ],
  },
  {
    slug: "operating-systems-fundamentals",
    title: "Operating Systems Fundamentals",
    tagline: "What's really happening under your code",
    description:
      "Processes, threads, memory management, scheduling, and file systems — the CS fundamentals that make you a stronger engineer at any level of the stack.",
    category: "Operating Systems",
    level: "Intermediate",
    duration: "11 hours",
    rating: 4.8,
    students: 10200,
    instructor: { name: "Prof. David Kim", title: "CS Professor • Systems researcher" },
    price: 0,
    tags: ["Operating Systems", "Computer Science", "Systems"],
    gradient: "from-slate-500/30 to-cyan/30",
    curriculum: [
      {
        title: "Processes & memory",
        lessons: [
          { title: "Operating systems crash course", duration: "60:00", videoId: "26QPDBe-NB8" }, // VERIFY
          { title: "Processes vs threads explained", duration: "15:00", videoId: "4rLW7zg21gI" }, // VERIFY
        ],
      },
      {
        title: "Scheduling & storage",
        lessons: [
          { title: "CPU scheduling algorithms", duration: "18:00", videoId: "zXhcOWsQ1Xc" }, // VERIFY
          { title: "File systems explained", duration: "16:00", videoId: "KN8YgJnShPM" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Explain how processes, threads, and memory really work",
      "Reason about scheduling and concurrency",
      "Debug system-level performance issues confidently",
    ],
  },
  {
    slug: "database-management-systems",
    title: "Database Management Systems",
    tagline: "Design, normalize, and scale real databases",
    description:
      "Relational design, normalization, transactions, indexing, and an intro to NoSQL — the database knowledge every backend engineer needs.",
    category: "Database Management",
    level: "Intermediate",
    duration: "12 hours",
    rating: 4.8,
    students: 16700,
    instructor: { name: "Chidi Okonkwo", title: "Database Architect" },
    price: 0,
    tags: ["Databases", "SQL", "NoSQL", "Normalization"],
    gradient: "from-blue-500/30 to-emerald-500/30",
    curriculum: [
      {
        title: "Relational design",
        lessons: [
          { title: "Database design course for beginners", duration: "60:00", videoId: "ztHopE5Wnpc" },
          { title: "Database normalization explained", duration: "20:00", videoId: "GFQqiE5tOFo" }, // VERIFY
        ],
      },
      {
        title: "Transactions & NoSQL",
        lessons: [
          { title: "ACID transactions explained", duration: "14:00", videoId: "pomxJOFVcQs" }, // VERIFY
          { title: "SQL vs NoSQL explained", duration: "12:00", videoId: "ZS_kXvOeQ5Y" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Design normalized relational schemas",
      "Understand transactions and ACID guarantees",
      "Choose the right database for the job (SQL vs NoSQL)",
    ],
  },
  {
    slug: "nlp-natural-language-processing",
    title: "Natural Language Processing (NLP)",
    tagline: "Teach machines to understand language",
    description:
      "From tokenization to transformers — build real NLP systems: sentiment analysis, named entity recognition, and text classification with modern tools.",
    category: "NLP",
    level: "Advanced",
    duration: "13 hours",
    rating: 4.8,
    students: 9400,
    instructor: { name: "Dr. Meera Iyer", title: "NLP Researcher • Hugging Face contributor" },
    price: 0,
    tags: ["NLP", "Machine Learning", "Transformers", "Python"],
    gradient: "from-violet/30 to-emerald-500/30",
    curriculum: [
      {
        title: "NLP foundations",
        lessons: [
          { title: "NLP crash course for beginners", duration: "40:00", videoId: "fLvJ8VdHLA0" }, // VERIFY
          { title: "Tokenization and word embeddings", duration: "18:00", videoId: "viZrOnJclY0" }, // VERIFY
        ],
      },
      {
        title: "Modern NLP",
        lessons: [
          { title: "Transformers explained (NLP)", duration: "20:00", videoId: "TQQlZhbC5ps" }, // VERIFY
          { title: "Sentiment analysis with Hugging Face", duration: "22:00", videoId: "GSt00_-0ncQ" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Build a text classification pipeline end-to-end",
      "Use pretrained transformer models effectively",
      "Understand tokenization and embeddings deeply",
    ],
  },
  {
    slug: "computer-vision-fundamentals",
    title: "Computer Vision Fundamentals",
    tagline: "Teach machines to see and understand images",
    description:
      "Image processing, convolutional neural networks, object detection, and real-time vision pipelines — build systems that actually see.",
    category: "Computer Vision",
    level: "Advanced",
    duration: "13 hours",
    rating: 4.8,
    students: 11300,
    instructor: { name: "Dr. Felix Andrade", title: "Computer Vision Engineer" },
    price: 0,
    tags: ["Computer Vision", "Deep Learning", "OpenCV", "Python"],
    gradient: "from-cyan/30 to-fuchsia-500/30",
    curriculum: [
      {
        title: "Image processing basics",
        lessons: [
          { title: "OpenCV course for beginners", duration: "60:00", videoId: "oXlwWbU8l2o" }, // VERIFY
          { title: "Image processing fundamentals", duration: "20:00", videoId: "1FJWXOO1SRI" }, // VERIFY
        ],
      },
      {
        title: "Deep learning for vision",
        lessons: [
          { title: "Convolutional neural networks", duration: "15:40", videoId: "FmpDIaiMIeA" },
          { title: "Object detection explained (YOLO)", duration: "18:00", videoId: "ag3DLKsl2vk" }, // VERIFY
        ],
      },
    ],
    outcomes: [
      "Process and manipulate images programmatically",
      "Build and train a CNN from scratch",
      "Implement real-time object detection",
    ],
  },  
];
export const courses: Course[] = raw.map((c) => ({ ...c, lessons: total(c.curriculum) }));

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
