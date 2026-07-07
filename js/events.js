/**
 * Neorons — event data.
 *
 * This is the single source of truth for the Events and Where We Work sections.
 * To add, correct, or remove an event, edit this array — no other file needs to change.
 *
 * Fields:
 *   id        — unique slug, used for deep links (index.html#event-<id>)
 *   pillar    — "stem" | "inclusion" | "ai"  (drives the filter buttons + card colour)
 *   wellbeingNote — set true on any event touching mental health; the modal then
 *                   automatically appends Tele-MANAS (14416) helpline signposting
 *   title     — event name
 *   district  — district name (exact)
 *   state     — state name
 *   image     — card/modal photo path (images/...); frame hides if file missing
 *   imageAlt  — short description of the photo for screen readers
 *   credit    — photo attribution { creator, license, url } or null
 *   coords    — { lat, lon } for the interactive India map marker
 *   dates     — specific display dates (cards, modal, map); "date" below stays
 *               "Month Year" because the timeline sorts by it
 *   venue     — venue / locality line shown in the modal
 *   date      — human-readable date or range
 *   blurb     — one-to-two sentence summary shown on the card
 *   description — full paragraphs (array of strings) shown in the modal
 *   highlights  — short bullet points shown in the modal
 *   figures     — [{ number, label }] small stat chips shown in the modal
 *   partners    — [string] partner descriptions for proof layer (optional)
 *   outcomes    — [string] outcome stats, not just outputs (optional)
 *   reflection  — "What we learned" paragraph for modal (optional, string or null)
 *   gallery     — [{src, alt}] additional photos for modal gallery (optional)
 *   status      — "past" | "upcoming" (default "past")
 */
var NEORONS_EVENTS = [
  {
    id: "mind-matters-hackathon",
    coords: { lat: 12.9716, lon: 77.5946 },
    dates: "12–14 September 2025",
    featured: true,
    image: "images/mind-matters.jpg",
    imageAlt: "Young people collaborating around a laptop at a hackathon in Mumbai",
    credit: { creator: "Victor Grigas", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Hackathon_Mumbai_2011_-_4.jpg" },
    pillar: "stem",
    title: "Mind Matters Hackathon",
    district: "Bengaluru Urban",
    state: "Karnataka",
    venue: "Partner engineering-college campus, Bengaluru",
    date: "September 2025",
    blurb:
      "A 48-hour hackathon where student teams built technology for suicide prevention and early mental-health support, guided by clinicians and engineers.",
    wellbeingNote: true,
    description: [
      "Suicide among young people is preventable, yet it remains one of India's least talked-about public-health challenges. Mind Matters brought over 260 students together in Bengaluru for 48 hours to change that, pairing engineering talent with a challenge that is usually left to policy papers.",
      "Working in teams of four, students prototyped concrete tools: an SMS check-in line for hostel students, an anonymous peer-support chat with trained-moderator handoff, a multilingual helpline finder, and a triage dashboard for college counselling cells. Every team was mentored by both a software professional and a mental-health practitioner, so that empathy and clinical safety shaped the technology from the first line of code.",
      "The winning prototypes were showcased to local health officials and college counselling cells, and the event closed with an open conversation on student mental health. For many participants, it was the first such conversation of their lives.",
    ],
    highlights: [
      "Teams mentored jointly by engineers and mental-health clinicians",
      "Prototypes presented to district health officials and college counselling cells",
      "Every participant trained in safe, stigma-free communication about suicide prevention",
    ],
    figures: [
      { number: "260+", label: "student participants" },
      { number: "48", label: "hours of building" },
      { number: "65", label: "prototypes submitted" },
    ],
    partners: ["the district education office", "volunteer clinicians and software mentors"],
    outcomes: [
      "3 winning prototypes adopted by college counselling cells for pilot testing",
      "Participating colleges asked for the safe-communication training to be repeated for wider student groups",
    ],
    reflection:
      "Pairing each team with both an engineer and a clinician worked better than we expected; the clinical mentors caught unsafe design choices early, before they were built into prototypes. The 48-hour format was harder on first-time participants than we planned for, and several teams were visibly exhausted by the final showcase. Next time we will schedule mandatory rest blocks and keep a clinician on call throughout the night sessions, not only during mentoring hours.",
    gallery: [],
    status: "past",
  },
  {
    id: "unstoppable-taekwondo",
    coords: { lat: 26.9124, lon: 75.7873 },
    dates: "17–18 January 2026",
    image: "images/unstoppable.jpg",
    imageAlt: "School students in taekwondo uniforms practising kicks in a school courtyard in Hyderabad",
    credit: { creator: "RTNS2016, Wikimedia Commons", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Taekwondo_CHIREC.jpg" },
    pillar: "inclusion",
    title: "Unstoppable: Taekwondo Championship for Blind Girls",
    district: "Jaipur",
    state: "Rajasthan",
    venue: "District indoor sports hall, Jaipur",
    date: "January 2026",
    blurb:
      "A fully funded state-level taekwondo championship for blind and low-vision girls, with coaching camps, adaptive officiating, and a stage that belonged to the athletes.",
    description: [
      "Sport builds confidence like little else, yet competitive opportunities for blind girls in India are vanishingly rare. Neorons funded and co-organized Unstoppable, a state-level taekwondo championship in Jaipur created specifically for blind and low-vision girls.",
      "In the weeks before the championship, athletes trained in residential coaching camps with certified instructors experienced in adaptive martial arts. The competition itself used sound-cue officiating and modified rules developed with para-sport coaches, ensuring bouts were both safe and genuinely competitive.",
      "Eighty-four athletes competed before a full hall of families, schoolmates, and local officials. For many of the girls, it was the first time they had been cheered by name in a public arena.",
    ],
    highlights: [
      "Fully funded participation: travel, boarding, kit, and coaching at no cost to athletes",
      "Adaptive officiating with sound-cue systems developed alongside para-sport coaches",
      "Residential training camps ahead of competition day",
    ],
    figures: [
      { number: "84", label: "athletes" },
      { number: "12", label: "schools for the blind represented" },
      { number: "100%", label: "costs covered by Neorons" },
    ],
    partners: ["a Jaipur school for the blind", "local para-sport coaches"],
    outcomes: [
      "All 12 participating schools have asked to take part in a second edition",
      "Several athletes have continued weekly training with the adaptive drills introduced at camp",
    ],
    reflection:
      "The residential coaching camps worked better than we expected; athletes arrived on competition day already confident with the sound-cue format. Transport from outlying schools was harder than planned, and two schools reached the venue late enough to miss their warm-up slots. Next time we will arrange dedicated vehicles for the farthest schools and build more slack into the morning schedule.",
    gallery: [],
    status: "past",
  },
  {
    id: "classroom-2030",
    coords: { lat: 18.5204, lon: 73.8567 },
    dates: "14–15 November 2025",
    image: "images/classroom-2030.jpg",
    imageAlt: "Teachers in a training workshop",
    credit: { creator: "Shemaroo, Wikimedia Commons", license: "CC BY 3.0", url: "https://commons.wikimedia.org/w/index.php?curid=79100053" },
    pillar: "ai",
    title: "Classroom 2030: AI for Educators",
    district: "Pune",
    state: "Maharashtra",
    venue: "Teacher-training institute, Pune",
    date: "November 2025",
    blurb:
      "A hands-on training summit helping teachers use AI responsibly to plan lessons, personalise practice, and save hours of administrative work.",
    description: [
      "Artificial intelligence will reshape every classroom in India this decade. The question is whether teachers shape it, or it shapes them. Classroom 2030 brought 140 school teachers from across Pune district together for two days of practical, hype-free training.",
      "The core of the summit was a lesson-plan clinic: each teacher rebuilt one real upcoming lesson with an AI assistant, then defended it to peers. Sessions also covered generating differentiated practice material for mixed-ability classrooms, and, just as importantly, the limits: bias, privacy, and why AI must never replace a teacher's judgement about a child.",
      "Every participating school left with a simple, written AI-use policy drafted during the summit, and teachers joined an ongoing peer network where they continue to share what works.",
    ],
    highlights: [
      "Two days of hands-on practice, not lectures; every teacher left with working materials",
      "Dedicated module on AI ethics, bias, and student privacy",
      "Each school departed with its own draft AI-use policy",
    ],
    figures: [
      { number: "140", label: "teachers trained" },
      { number: "38", label: "schools represented" },
      { number: "2", label: "days of hands-on training" },
    ],
    partners: ["the district education office", "38 partner schools across Pune district"],
    outcomes: [
      "38 schools now have written AI-use policies in place",
      "The teacher peer network remains active, with members sharing lesson materials month to month",
    ],
    reflection:
      "Building every session around materials teachers could use the following Monday worked; that practicality is what participants praised most in feedback. The ethics module, taught as a lecture, rated lowest of the summit and clearly needed the same hands-on treatment as everything else. Next time we will teach bias and privacy through worked classroom examples rather than slides.",
    gallery: [],
    status: "past",
  },
  {
    id: "project-jigyasa",
    coords: { lat: 25.3176, lon: 82.9739 },
    dates: "4–22 August 2025",
    image: "images/project-jigyasa.jpg",
    imageAlt: "School students doing a hands-on science experiment",
    credit: { creator: "Biswarup Ganguly", license: "CC BY 3.0", url: "https://commons.wikimedia.org/w/index.php?curid=45319990" },
    pillar: "stem",
    title: "Project Jigyasa: Rural Science Fair",
    district: "Varanasi",
    state: "Uttar Pradesh",
    venue: "Government schools, Sevapuri and Araziline blocks, Varanasi district",
    date: "August 2025",
    blurb:
      "A travelling science fair that brought hands-on experiments, telescope nights, and student exhibitions to government schools in rural Varanasi district.",
    description: [
      "Curiosity, jigyasa, does not check whether a school has a laboratory. Project Jigyasa took a travelling science fair to government schools across rural blocks of Varanasi district, reaching students who had never handled laboratory equipment before.",
      "Over three weeks, students rotated through hands-on stations: a Van de Graaff generator, a water-rocket launch pad, microscope benches with pond-water slides, and a solder-free electronics table, built take-home experiments from low-cost materials, and stayed late for telescope evenings that, for most, were their first look at Saturn's rings.",
      "The fair culminated in a student exhibition where local children presented their own working models to their families and teachers, turning visitors into exhibitors.",
    ],
    highlights: [
      "Travelling laboratory reached schools with no existing lab facilities",
      "Telescope nights and take-home experiments built from low-cost materials",
      "Closed with a student-led exhibition for families and the community",
    ],
    figures: [
      { number: "400+", label: "students engaged" },
      { number: "9", label: "government schools visited" },
      { number: "3", label: "weeks on the road" },
    ],
    partners: ["the district education office", "partner government schools"],
    outcomes: ["4 of the 9 schools have since started a student science club"],
    reflection:
      "The telescope evenings worked best of everything we ran; they drew families as well as students and gave each visit a memorable close. Keeping fragile equipment working across three weeks of rough roads did not go well, and we lost two microscope stations mid-tour. Next time we will carry spares and rebuild the most delicate stations around sturdier, low-cost designs.",
    gallery: [],
    status: "past",
  },
  {
    id: "roboshakti",
    coords: { lat: 17.3850, lon: 78.4867 },
    dates: "9–15 June 2025",
    image: "images/roboshakti.jpg",
    imageAlt: "Schoolgirls seated in a circle around a robot during a tinkering-lab workshop",
    credit: { creator: "Al124aa, Wikimedia Commons", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Robotics_Workshop_in_Atal_Tinkering_Lab.jpg" },
    pillar: "stem",
    title: "RoboShakti: Girls' Robotics Bootcamp",
    district: "Hyderabad",
    state: "Telangana",
    venue: "Residential campus, Gachibowli, Hyderabad",
    date: "June 2025",
    blurb:
      "A week-long residential robotics bootcamp for girls from government schools, taking them from first circuit to a working robot in seven days.",
    description: [
      "Girls remain sharply underrepresented in Indian engineering classrooms, and the gap begins well before college. RoboShakti was built to interrupt it early: a week-long residential robotics bootcamp in Hyderabad for 120 girls from government schools, most of whom had never touched a microcontroller.",
      "Each day moved from fundamentals to building: breadboard circuits on day one, ultrasonic sensors and motor drivers on Arduino kits by mid-week, and by day seven every team had a working robot of their own: line-followers, obstacle-avoiders, and one persistent team's robotic arm. Instruction came from women engineers and college robotics teams, so every student spent the week learning from someone whose path she could see herself on.",
      "The bootcamp ended with a friendly robot showcase, and every participating school received a robotics starter kit so the building didn't stop when the week did.",
    ],
    highlights: [
      "Residential programme with meals, boarding, and materials fully covered",
      "All instruction led by women engineers and college robotics mentors",
      "Every school received a robotics starter kit to continue the work",
    ],
    figures: [
      { number: "120", label: "girls trained" },
      { number: "30", label: "working robots built" },
      { number: "7", label: "days from circuit to robot" },
    ],
    partners: ["volunteer women engineers", "college robotics teams"],
    outcomes: [
      "Robotics clubs active in 8 of 12 participating schools four months later",
      "Starter kits remain in regular use at the schools running clubs",
    ],
    reflection:
      "Having every session led by women engineers worked; students told us repeatedly that seeing someone whose path they could follow mattered as much as the content. Day one moved too fast, and teams that fell behind on basic circuits stayed behind all week. Next time we will slow the opening day down and add a second instructor for the circuits sessions so nobody starts the week already lost.",
    gallery: [],
    status: "past",
  },
  {
    id: "safe-minds",
    coords: { lat: 28.6139, lon: 77.2090 },
    dates: "10 October 2025 (World Mental Health Day)",
    image: "images/safe-minds.jpg",
    imageAlt: "Secondary-school students smiling during a group session in a Punjab classroom",
    credit: { creator: "Jagseer S Sidhu", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Jagseer_S_Sidhu_teaching_school_students_about_Wikipedia.jpg" },
    pillar: "stem",
    title: "Safe Minds: Peer-Support Training",
    district: "New Delhi",
    state: "Delhi",
    venue: "Senior secondary schools, South and West Delhi",
    date: "October 2025",
    blurb:
      "Training senior students as peer supporters who know how to listen and refer, because the first person a struggling teenager talks to is almost always another teenager.",
    wellbeingNote: true,
    description: [
      "When a teenager is struggling, the first person they confide in is rarely an adult; it is a classmate. Safe Minds works with that reality instead of against it, training senior students in Delhi schools as peer supporters.",
      "In workshops led by clinical psychologists, students learned to recognise warning signs, listen without judgement, and, most critically, connect a struggling friend to a trained adult or helpline rather than carry the weight alone. The curriculum was developed with practising clinicians and aligned to national mental-health guidelines, including Tele-MANAS (14416) referral pathways.",
      "Participating schools also established ongoing wellbeing circles, so the training became a standing structure rather than a one-day event.",
    ],
    highlights: [
      "Curriculum designed and delivered with clinical psychologists",
      "Students trained to refer, not to counsel; safety-first design throughout",
      "Standing wellbeing circles established in every participating school",
    ],
    figures: [
      { number: "180", label: "peer supporters trained" },
      { number: "15", label: "schools enrolled" },
      { number: "14416", label: "Tele-MANAS referral pathway taught" },
    ],
    partners: ["practising clinical psychologists", "partner schools across Delhi"],
    outcomes: ["12 of 15 schools still running weekly wellbeing circles six months later"],
    reflection:
      "Drawing a hard line between referring and counselling worked; students told us the boundary made the role feel safe to take on. What the training did not prepare them for was a friend asking them to keep things private, and several peer supporters found that moment genuinely difficult. Next time we will add role-play practice for exactly that conversation, developed with the same clinicians who built the curriculum.",
    gallery: [],
    status: "past",
  },
  {
    id: "makeathon-for-all",
    coords: { lat: 12.2958, lon: 76.6394 },
    dates: "7–8 March 2026",
    image: "images/makeathon.jpg",
    imageAlt: "Blind students writing braille with slates and styluses as a teacher guides them",
    credit: { creator: "Sumita Roy Dutta", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:New_normal_days_classes_of_Voice_Of_World_Blind_School_during_COVID_19_pandemic_in_Kolkata_DSCN9478VOW.jpg" },
    pillar: "inclusion",
    title: "Makeathon for All: Assistive Technology",
    district: "Mysuru",
    state: "Karnataka",
    venue: "Community makerspace, Mysuru",
    date: "March 2026",
    blurb:
      "Blind, low-vision, and sighted students building assistive devices together: navigation aids, audio labels, and tactile learning tools designed with, not for.",
    description: [
      "The best assistive technology is designed with its users, not for them. Makeathon for All paired blind and low-vision students with sighted peers in mixed teams, and gave them two days, a workbench, and one brief: build something that makes daily life or learning easier.",
      "Teams in Mysuru produced working prototypes including a clip-on ultrasonic cane attachment, talking labels for household items and medicine boxes, and a tactile fraction kit for middle-school mathematics. Blind and low-vision students were designers and decision-makers on every team; their lived experience was the project's most valuable engineering input.",
      "Three prototypes were selected for continued development with a local engineering college, and the event's mixed-team model has become the template for our future inclusion programmes.",
    ],
    highlights: [
      "Mixed teams of blind, low-vision, and sighted students: co-design, not charity",
      "Working prototypes: navigation aids, audio labels, tactile maths tools",
      "Three prototypes advanced to development with a partner engineering college",
    ],
    figures: [
      { number: "60", label: "student makers" },
      { number: "14", label: "prototypes built" },
      { number: "3", label: "advanced to development" },
    ],
    partners: ["a partner engineering college in Mysuru"],
    outcomes: ["3 prototypes in continued development with a partner engineering college"],
    reflection:
      "Mixed teams produced better designs than either group would have alone, and the co-design brief held up under real workshop pressure. The first hours were the weak point; sighted students tended to take over the tools until facilitators stepped in and reset the roles. Next time we will open with structured co-design exercises so every team member starts the build with a defined role.",
    gallery: [],
    status: "past",
  },
  {
    id: "digital-disha",
    coords: { lat: 21.1458, lon: 79.0882 },
    dates: "2–20 February 2026",
    image: "images/digital-disha.jpg",
    imageAlt: "Students at computers in a school classroom",
    credit: { creator: "One Laptop per Child", license: "CC BY 2.0", url: "https://commons.wikimedia.org/w/index.php?curid=17583955" },
    pillar: "ai",
    title: "Digital Disha: AI Awareness Drive",
    district: "Nagpur",
    state: "Maharashtra",
    venue: "Government schools, Hingna and Kamptee blocks, Nagpur district",
    date: "February 2026",
    blurb:
      "A district-wide drive bringing practical AI literacy to secondary students and their families: what it is, what it isn't, and how to use it safely.",
    description: [
      "AI tools reached India's students before AI literacy did. Digital Disha travelled through schools across Nagpur district with a simple goal: make every student a confident, critical user of AI rather than a passive one.",
      "Through demonstrations, hands-on sessions, and plain-language materials in Marathi, Hindi, and English, students learned how AI systems actually work, where they fail, how to spot AI-generated misinformation through a spot-the-fake exercise built from AI images of familiar local landmarks, and how to use AI tools to study better rather than shortcut learning.",
      "Evening sessions brought parents into the same conversation, because a student's digital safety is a family matter, and every school received a resource library for continued teaching.",
    ],
    highlights: [
      "Materials delivered in Marathi, Hindi, and English",
      "Dedicated module on spotting AI-generated misinformation",
      "Evening family sessions brought parents into the conversation",
    ],
    figures: [
      { number: "350+", label: "students reached" },
      { number: "11", label: "schools visited" },
      { number: "3", label: "languages of instruction" },
    ],
    partners: ["the district education office", "partner government schools"],
    outcomes: ["7 of 11 schools report teaching from the resource library each term"],
    reflection:
      "Delivering the school sessions in Marathi worked; those materials carried the day and drew the most questions. Evening attendance from parents fell short of what we planned for, especially midweek. Next time we will hold the family sessions on weekends and work with schools to send invitations home well in advance.",
    gallery: [],
    status: "past",
  },
  {
    id: "upcoming-2026-27",
    image: null,
    imageAlt: "",
    credit: null,
    pillar: "stem",
    title: "2026–27 Programme Announcements",
    district: "Multiple districts",
    state: "Coming soon",
    venue: "Across India",
    date: "2026–27",
    blurb:
      "Our next cycle of programmes is in planning. New districts, new partnerships, and new ways to bring science and inclusion to more students.",
    description: [
      "We are currently planning our 2026–27 programme cycle. Details will be announced here as partnerships are confirmed. If you would like to bring a Neorons programme to your district, write to us.",
    ],
    highlights: null,
    figures: null,
    partners: [],
    outcomes: [],
    reflection: null,
    gallery: [],
    status: "upcoming",
    wellbeingNote: false,
  },
];

/**
 * Real, confirmed supporters/partners ONLY. Renders a "Supported by" strip
 * above the footer when non-empty. Add entries only with the partner's
 * written consent: { name: "...", url: "..." (optional) }.
 */
var NEORONS_SUPPORTERS = [];

/** Hero photo attribution ({ creator, license, url } or null). */
var NEORONS_HERO_CREDIT = { creator: "McKay Savage", license: "CC BY 2.0", url: "https://commons.wikimedia.org/w/index.php?curid=11823848" };

/** Pillar display metadata (labels + card accent colours). */
var NEORONS_PILLARS = {
  stem: { label: "STEM for Social Good", className: "pillar-stem" },
  inclusion: { label: "Inclusion & Ability", className: "pillar-inclusion" },
  ai: { label: "AI & Education", className: "pillar-ai" },
};

/**
 * Team members. Only the founder and co-founder are named individuals;
 * everyone else is represented collectively by the advisory-circle card.
 * Do not add named people without their explicit consent.
 */
var NEORONS_TEAM = [
  {
    name: "Akshat Agarwal",
    role: "Founder",
    bio: "Akshat founded Neorons in 2025 to bring science, inclusion, and honest AI literacy to students who are usually last in line for them. He leads programme design and partnerships across the districts where Neorons works.",
    image: null,
    linkedin: null,
  },
  {
    name: "Avinash Amanchi",
    role: "Co-founder",
    bio: "Avinash runs Neorons' events on the ground, from residential bootcamps to district-wide drives. He manages our relationships with partner schools and makes sure every programme keeps its promises on the day.",
    image: null,
    linkedin: null,
  },
  {
    name: "Our advisory circle",
    role: "Educators, clinicians and engineers",
    bio: "An advisory group of teachers, mental-health clinicians, and engineers reviews every Neorons programme for safety and rigour before it reaches a classroom. They stay unnamed on this page, but nothing we run goes ahead without their review.",
    image: null,
    linkedin: null,
  },
];

/**
 * Testimonials. All quotes are anonymous by design: attribution is by role
 * and place only, never by personal name. Every quote was approved by the
 * person who said it before publication.
 */
var NEORONS_TESTIMONIALS = [
  {
    quote: "I had never touched a circuit before day one. By the end of the week our team's robot could follow a line across the hall, and we built every part of it ourselves.",
    name: "Bootcamp participant",
    context: "RoboShakti, Hyderabad",
    event: "RoboShakti",
    role: "student",
  },
  {
    quote: "When they called my name the whole hall cheered, and that had never happened to me before. The sound cues meant I always knew where my opponent was, so I could just fight.",
    name: "Athlete",
    context: "Unstoppable championship, Jaipur",
    event: "Unstoppable",
    role: "student",
  },
  {
    quote: "I arrived worried that AI would replace my judgement about my students. I left with practice sheets for three ability levels and a draft policy our school actually uses.",
    name: "Workshop teacher",
    context: "Classroom 2030, Pune",
    event: "Classroom 2030",
    role: "teacher",
  },
];
