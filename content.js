

const CONTENT = {

  // ------- General info (shown in the About window) -------
  name: "Didzis Baltājs",
  role: "Computer Science Student",           // e.g. "Front-End Developer"
  tagline: "I like too program, play video games, watch movies and enjoy life.",
  heroImage: "images/portrait.jpg", 

  // ------- About -------
  about: `I am a very like minded person, i like playing games talking to people, i work hard 
  i like learning new things everydayn and i feel good`,


  skills: [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Git / GitHub",
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
    { label: "Email", value: "didzisbaltkajs@gmail.com", href: "didzisbaltkajs@gmail.com" },
    { label: "GitHub", value: "github.com/DidzisWow", href: "https://github.com/DidzisWow" },
  ],

  footerText: "© 2026 Your Name",

  // ------- Extra desktop icons (Chrome, YouTube, Discord, GitHub) -------
  // These are decorative only — double-clicking them does nothing.
  // Feel free to change the URLs if you re-enable them later.
  social: {
    chrome: "https://www.google.com",
    youtube: "https://www.youtube.com",
    discord: "https://discord.com/users/your-id",
    github: "https://github.com/your-username",
  },

  // ------- Desktop icon pictures -------
  // Put your icon images directly in the "images/" folder and point to
  // them here. If a path is empty "" or the file doesn't exist yet,
  // you'll see a blank placeholder with a "+" instead.
  // Recommended size: ~64x64 or 128x128 px.
  icons: {
    about: "images/about.svg",
    skills: "images/skills.svg",
    projects: "images/projects.svg",
    contact: "images/contact.svg",
    chrome: "images/chrome.svg",       // official Google Chrome logo (CC0, via Simple Icons)
    youtube: "images/youtube.svg",     // official YouTube logo (CC0, via Simple Icons)
    discord: "images/discord.svg",     // official Discord logo (CC0, via Simple Icons)
    github: "images/github.svg",       // official GitHub logo (CC0, via Simple Icons)
    terminal: "images/terminal.svg",
    bin: "images/bin.svg",
  },
};