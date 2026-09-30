/*
  ============================================================
   ŠEIT RAKSTI SAVU INFORMĀCIJU
   (This is the ONLY file you need to edit to change text)
  ============================================================

  - Aizvieto tekstu pēdiņās ar savu informāciju.
  - Nekas šeit nav HTML kods, tāpēc droši raksti garus teikumus.
  - Attēliem: ieliec bilžu failus mapē "images/" un šeit norādi
    failu nosaukumu, piem. "images/mana-bilde.jpg"
  - Ja tev vēl nav attēla, atstāj tukšas pēdiņas "" — parādīsies
    vietturis ar taviem iniciāļiem.
*/

const CONTENT = {

  // ------- Vispārīga info (redzama augšā, hero sadaļā) -------
  name: "Vārds Uzvārds",
  role: "Programmēšanas skolēns / audzēknis",          // piem. "Front-end izstrādātājs"
  tagline: "Īss teikums par to, kas tevi interesē programmēšanā un ko tu meklē (piem. praksi).",
  heroImage: "images/portrait.jpg",   // tava bilde, vai atstāj "" ja nav

  // ------- Par mani -------
  about: `Uzraksti 2–4 teikumus par sevi: kas tevi interesē, ko tu mācies,
  kāpēc programmē, un ko tu meklē (piemēram, prakses vietu).`,

  // ------- Prasmes -------
  // Pievieno vai izdzēs rindas pēc vajadzības
  skills: [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Git / GitHub",
  ],

  // ------- Projekti (vismaz 2) -------
  projects: [
    {
      title: "Projekta nosaukums #1",
      description: "Īss apraksts: ko šis projekts dara, kādas tehnoloģijas izmantoji un ko tu no tā iemācījies.",
      image: "images/project1.jpg",   // projekta ekrānšāviņš, vai ""
      github: "https://github.com/tavs-lietotajvards/projekts-1",
      demo: "https://tavs-projekts-1.vercel.app",   // ja nav dzīvas versijas, atstāj ""
      tags: ["HTML", "CSS", "JavaScript"],
    },
    {
      title: "Projekta nosaukums #2",
      description: "Īss apraksts: ko šis projekts dara, kādas tehnoloģijas izmantoji un ko tu no tā iemācījies.",
      image: "images/project2.jpg",
      github: "https://github.com/tavs-lietotajvards/projekts-2",
      demo: "",
      tags: ["React", "JavaScript"],
    },
    // vari pievienot vēl projektus, kopējot augšējo bloku no { līdz },
  ],

  // ------- Kontakti -------
  contactIntro: "Vislabāk mani var sasniegt šeit:",
  contact: [
    { label: "E-pasts", value: "tavs.epasts@example.com", href: "mailto:tavs.epasts@example.com" },
    { label: "GitHub", value: "github.com/tavs-lietotajvards", href: "https://github.com/tavs-lietotajvards" },
    { label: "LinkedIn", value: "linkedin.com/in/tavs-profils", href: "https://linkedin.com/in/tavs-profils" },
  ],

  footerText: "© 2026 Vārds Uzvārds",

  // ------- Papildu ikonas darbvirsmā (Chrome, YouTube, Discord, GitHub) -------
  // Šīs ikonas, kad uz tām dubultklikšķini, atver saiti jaunā cilnē.
  social: {
    chrome: "https://www.google.com",
    youtube: "https://www.youtube.com",
    discord: "https://discord.com/users/tavs-id",   // nomaini uz savu Discord saiti
    github: "https://github.com/tavs-lietotajvards", // nomaini uz savu GitHub profilu
  },
};