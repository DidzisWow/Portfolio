/*
  ============================================================
   EDIT YOUR INFO HERE
   (This is the ONLY file you need to edit to change text)
  ============================================================

  - Replace the text inside the quotes with your own information.
  - None of this is HTML, so feel free to write long sentences.
  - For images: put your image files in the "images/" folder and
    point to the filename here, e.g. "images/my-photo.jpg"
  - If you don't have an image yet, leave the quotes empty ""
    and a placeholder with your initials will show instead.
*/

const CONTENT = {

  // ------- General info (shown in the About window) -------
  name: "Your Name",
  role: "Computer Science Student",           // e.g. "Front-End Developer"
  tagline: "A short sentence about what interests you in programming and what you're looking for (e.g. an internship).",
  heroImage: "images/portrait.jpg",   // your photo, or leave "" if none yet
  resume: "",                         // e.g. "images/resume.pdf" -> adds a Resume.pdf icon to the desktop
  status: "Open to internships",      // shown as a green badge in About Me ("" to hide)
  location: "Your City, Country",     // shown in About Me ("" to hide)

  // ------- About -------
  about: `Write 2-4 sentences about yourself: what you're interested in,
  what you're learning, why you code, and what you're looking for (e.g. an internship).`,

  // ------- Skills -------
  // level is optional (1-5) and draws a meter in About Me > Skills.
  // Plain text works too: "HTML", "CSS", ...
  skills: [
    { name: "HTML", level: 5 },
    { name: "CSS", level: 4 },
    { name: "JavaScript", level: 4 },
    { name: "React", level: 3 },
    { name: "Git / GitHub", level: 3 },
  ],

  // ------- Experience & Education (optional) -------
  // Adds an "Experience" tab to About Me. Delete the examples or leave the lists empty [] to hide it.
  experience: [
    { title: "Your Role", place: "Company or Project", when: "2025 - Now", text: "One sentence about what you did there." },
  ],
  education: [
    { title: "Your Programme", place: "Your School", when: "2023 - 2027", text: "" },
  ],

  // ------- Projects (at least 2) -------
  projects: [
    {
      title: "Project Name #1",
      description: "Short description: what this project does, what technologies you used, and what you learned from it.",
      image: "images/project1.jpg",   // project screenshot, or ""
      github: "https://github.com/your-username/project-1",
      demo: "https://your-project-1.vercel.app",   // leave "" if there's no live version
      tags: ["HTML", "CSS", "JavaScript"],
    },
    {
      title: "Project Name #2",
      description: "Short description: what this project does, what technologies you used, and what you learned from it.",
      image: "images/project2.jpg",
      github: "https://github.com/your-username/project-2",
      demo: "",
      tags: ["React", "JavaScript"],
    },
    // you can add more projects by copying the block above from { to },
  ],

  // ------- Contact -------
  contactIntro: "The best way to reach me:",
  contact: [
    { label: "Email", value: "your.email@example.com", href: "mailto:your.email@example.com" },
    { label: "GitHub", value: "github.com/your-username", href: "https://github.com/your-username" },
    { label: "LinkedIn", value: "linkedin.com/in/your-profile", href: "https://linkedin.com/in/your-profile" },
  ],

  footerText: "© 2026 Your Name",

  // ------- Links used by the desktop programs -------
  // github: the GitHub app loads your real profile + repos from this link.
  social: {
    chrome: "https://www.google.com",
    youtube: "https://www.youtube.com",
    discord: "https://discord.com/users/your-id",
    github: "https://github.com/your-username",
  },

  // ------- YouTube app -------
  // id = the part after "watch?v=" in a YouTube link. channel + cat are shown
  // on the YouTube front page (cat becomes a filter chip, e.g. "Gaming").
  // Add as many as you like.
  //
  // youtubeApiKey (optional): paste a YouTube Data API v3 key to turn the YouTube
  // app into the real thing: live search results, a Trending / Explore home,
  // real view counts, upload dates, durations, subscriber counts and channel
  // pages. Leave it "" and the app runs fully offline on the list below.
  //   1. console.cloud.google.com -> create a project -> enable "YouTube Data API v3"
  //   2. APIs & Services -> Credentials -> Create credentials -> API key
  //   3. IMPORTANT: this file is public, so restrict the key. Under "Application
  //      restrictions" choose "Websites" (HTTP referrers) and add your own site,
  //      e.g. https://your-name.github.io/* , and under "API restrictions" allow
  //      only "YouTube Data API v3". A restricted key is useless on other sites.
  //   The free quota is 10,000 units a day (a search costs 100). If the key is
  //   wrong or the quota runs out, the app silently falls back to the list below.
  youtubeApiKey: "",
  videos: [
    { id: "dhxHOvixOpU", title: "FRIDAY NIGHT FUNKIN' IS THE BEST MUSIC GAME. (Part 1)", channel: "CoryxKenshin", cat: "Gaming" },
    { id: "06NiFBgT3bA", title: "Friday Night Funkin' KEEPS GETTING BETTER AND BETTER (Part 2)", channel: "CoryxKenshin", cat: "Gaming" },
    { id: "02PxiJNRN2I", title: "Friday Night Funkin' B-SIDE REMIXES ARE FREAKING INSANE (Part 3)", channel: "CoryxKenshin", cat: "Gaming" },
    { id: "iOztnsBPrAA", title: "WARNING: SCARIEST GAME IN YEARS | Five Nights at Freddy's - Part 1", channel: "Markiplier", cat: "Gaming" },
    { id: "GlZtlTon7_I", title: "Five Nights at Freddy's: Sister Location - Part 1", channel: "Markiplier", cat: "Gaming" },
    { id: "TA5OMtKTbzc", title: "Five Nights at Freddy's: Ultimate Custom Night - Part 1", channel: "Markiplier", cat: "Gaming" },
    { id: "bqNzbkIHYF8", title: "Five Nights At Freddy's 2 Animation | Jacksepticeye Animated", channel: "jacksepticeye", cat: "Animation" },
    { id: "Uil9bh8kJgg", title: "Five Nights At Freddy's 3 & 4 Animation | Jacksepticeye Animated", channel: "jacksepticeye", cat: "Animation" },
    { id: "Y3qM6j3AceU", title: "Five Nights at Freddy's Animated short", channel: "iHasCupquake", cat: "Animation" },
    { id: "_zfN9wnPvU0", title: "AI Slop Is Killing Our Channel", channel: "Kurzgesagt – In a Nutshell", cat: "Education" },
    { id: "GsxdZ-3n0GQ", title: "Ectodermal Dysplasia (We need to talk.)", channel: "CoryxKenshin", cat: "Vlogs" },
    { id: "t44TtAswYug", title: "Chasing My Dream. (The 'Big' Announcement)", channel: "CoryxKenshin", cat: "Vlogs" },
    { id: "4wZ5Sd2LbfA", title: "2020 is the worst year of my life", channel: "CoryxKenshin", cat: "Vlogs" },
    { id: "jNQXAC9IVRw", title: "Me at the zoo", channel: "jawed", cat: "Classics" },
    { id: "dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up (Official Music Video)", channel: "Rick Astley", cat: "Music" },
    { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE M/V", channel: "officialpsy", cat: "Music" },
  ],

  // ------- Desktop icon pictures -------
  // Put your icon images directly in the "images/" folder and point to
  // them here. If a path is empty "" or the file doesn't exist yet,
  // you'll see a blank placeholder with a "+" instead.
  // Recommended size: ~64x64 or 128x128 px.
  icons: {
    about: "images/about.svg",         // pixel-art icons drawn for this site
    skills: "images/skills.svg",
    projects: "images/projects.svg",
    contact: "images/contact.svg",
    chrome: "images/chrome.svg",       // official Google Chrome logo (CC0, via Simple Icons)
    spotify: "images/spotify.svg",     // Spotify-style logo
    youtube: "images/youtube.svg",     // official YouTube logo (CC0, via Simple Icons)
    discord: "images/discord.svg",     // official Discord logo (CC0, via Simple Icons)
    github: "images/github.svg",       // official GitHub logo (CC0, via Simple Icons)
    terminal: "images/terminal.svg",
    bin: "images/bin.svg",
    minesweeper: "images/minesweeper.svg",
    paint: "images/paint.svg",
    resume: "images/resume.svg",
    solitaire: "images/solitaire.svg",
    snake: "images/snake.svg",
    binfull: "images/binfull.svg",
  },
};
