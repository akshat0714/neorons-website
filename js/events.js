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
 *   venue     — venue / locality line shown in the modal
 *   date      — human-readable date or range
 *   blurb     — one-to-two sentence summary shown on the card
 *   description — full paragraphs (array of strings) shown in the modal
 *   highlights  — short bullet points shown in the modal
 *   figures     — [{ number, label }] small stat chips shown in the modal
 *   partners    — [string] named partner organizations for proof layer (optional)
 *   outcomes    — [string] outcome stats, not just outputs (optional)
 *   reflection  — "What we learned" paragraph for modal (optional, string or null)
 *   gallery     — [{src, alt}] additional photos for modal gallery (optional)
 *   status      — "past" | "upcoming" (default "past")
 */
var NEORONS_EVENTS = [
  {
    id: "mind-matters-hackathon",
    featured: true,
    image: "images/mind-matters.jpg",
    imageAlt: "Students collaborating on laptops during a hackathon",
    credit: { creator: "TechCrunch", license: "CC BY 2.0", url: "https://www.flickr.com/photos/52522100@N07/10508993796" },
    pillar: "stem",
    title: "Mind Matters Hackathon",
    district: "Bengaluru Urban",
    state: "Karnataka",
    venue: "Bengaluru, Karnataka",
    date: "September 2025",
    blurb:
      "A 48-hour hackathon where student teams built technology for suicide prevention and early mental-health support, guided by clinicians and engineers.",
    wellbeingNote: true,
    description: [
      "Suicide among young people is preventable — yet it remains one of India's least talked-about public-health challenges. Mind Matters brought over 260 students together in Bengaluru for 48 hours to change that, pairing engineering talent with a challenge that is usually left to policy papers.",
      "Working in teams of four, students prototyped tools for early distress detection, anonymous peer support, and faster connection to trained counsellors. Every team was mentored by both a software professional and a mental-health practitioner, so that empathy and clinical safety shaped the technology from the first line of code.",
      "The winning prototypes were showcased to local health officials and college counselling cells, and the event closed with an open conversation on student mental health — for many participants, the first such conversation of their lives.",
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
    partners: ["Department of Public Instruction, Karnataka"],
    outcomes: ["3 winning prototypes adopted by college counselling cells for pilot testing", "[N] prototypes taken up by counselling cells or health officials"],
    reflection: "[What we learned: Pairing each team with both an engineer and a clinician] worked better than we expected. [Specific thing that didn\u2019t — e.g., our safety protocol missed X] didn\u2019t \u2014 [consequence]. Next time we\u2019re [concrete change]. Prompt: Did any team need clinical support during the event itself? What did the safety protocol miss?",
    gallery: [],
    status: "past",
  },
  {
    id: "unstoppable-taekwondo",
    image: "images/unstoppable.jpg",
    imageAlt: "Young athletes practising taekwondo",
    credit: { creator: "Oluwatoyinp", license: "CC0 1.0", url: "https://commons.wikimedia.org/w/index.php?curid=183410747" },
    pillar: "inclusion",
    title: "Unstoppable: Taekwondo Championship for Blind Girls",
    district: "Jaipur",
    state: "Rajasthan",
    venue: "Jaipur, Rajasthan",
    date: "January 2026",
    blurb:
      "A fully funded state-level taekwondo championship for blind and low-vision girls — coaching camps, adaptive officiating, and a stage that belonged to the athletes.",
    description: [
      "Sport builds confidence like little else — yet competitive opportunities for blind girls in India are vanishingly rare. Neorons funded and co-organized Unstoppable, a state-level taekwondo championship in Jaipur created specifically for blind and low-vision girls.",
      "In the weeks before the championship, athletes trained in residential coaching camps with certified instructors experienced in adaptive martial arts. The competition itself used sound-cue officiating and modified rules developed with para-sport coaches, ensuring bouts were both safe and genuinely competitive.",
      "Eighty-four athletes competed before a full hall of families, schoolmates, and local officials. For many of the girls, it was the first time they had been cheered by name in a public arena.",
    ],
    highlights: [
      "Fully funded participation — travel, boarding, kit, and coaching at no cost to athletes",
      "Adaptive officiating with sound-cue systems developed alongside para-sport coaches",
      "Residential training camps ahead of competition day",
    ],
    figures: [
      { number: "84", label: "athletes" },
      { number: "12", label: "schools for the blind represented" },
      { number: "100%", label: "costs covered by Neorons" },
    ],
    partners: ["Rajasthan State Sports Council", "National Association for the Blind, Jaipur"],
    outcomes: ["6 athletes selected for national para-taekwondo training camp", "[N] of 84 athletes still training [N] months on"],
    reflection: "[Specific thing that worked] worked better than we expected. [Transport plan for outlying schools / what the sound-cue system got wrong in a real bout] didn\u2019t \u2014 [consequence]. Next time we\u2019re [concrete change].",
    gallery: [],
    status: "past",
  },
  {
    id: "classroom-2030",
    image: "images/classroom-2030.jpg",
    imageAlt: "Teachers in a training workshop",
    credit: { creator: "Shemaroo, Wikimedia Commons", license: "CC BY 3.0", url: "https://commons.wikimedia.org/w/index.php?curid=79100053" },
    pillar: "ai",
    title: "Classroom 2030: AI for Educators",
    district: "Pune",
    state: "Maharashtra",
    venue: "Pune, Maharashtra",
    date: "November 2025",
    blurb:
      "A hands-on training summit helping teachers use AI to plan lessons, personalise practice, and save hours of administrative work — responsibly.",
    description: [
      "Artificial intelligence will reshape every classroom in India this decade. The question is whether teachers shape it, or it shapes them. Classroom 2030 brought 140 school teachers from across Pune district together for two days of practical, hype-free training.",
      "Sessions covered lesson planning with AI assistants, generating differentiated practice material for mixed-ability classrooms, and — just as importantly — the limits: bias, privacy, and why AI must never replace a teacher's judgement about a child.",
      "Every participating school left with a simple, written AI-use policy drafted during the summit, and teachers joined an ongoing peer network where they continue to share what works.",
    ],
    highlights: [
      "Two days of hands-on practice, not lectures — every teacher left with working materials",
      "Dedicated module on AI ethics, bias, and student privacy",
      "Each school departed with its own draft AI-use policy",
    ],
    figures: [
      { number: "140", label: "teachers trained" },
      { number: "38", label: "schools represented" },
      { number: "2", label: "days of hands-on training" },
    ],
    partners: ["Pune District Education Office", "Maharashtra State Council of Educational Research and Training"],
    outcomes: ["38 schools now have written AI-use policies in place", "[N] of 140 teachers active in the peer network after [N] months"],
    reflection: "[Specific thing that worked] worked better than we expected. [Which session did teachers rate lowest, and why?] didn\u2019t \u2014 [consequence]. Next time we\u2019re [concrete change].",
    gallery: [],
    status: "past",
  },
  {
    id: "project-jigyasa",
    image: "images/project-jigyasa.jpg",
    imageAlt: "School students doing a hands-on science experiment",
    credit: { creator: "Biswarup Ganguly", license: "CC BY 3.0", url: "https://commons.wikimedia.org/w/index.php?curid=45319990" },
    pillar: "stem",
    title: "Project Jigyasa: Rural Science Fair",
    district: "Varanasi",
    state: "Uttar Pradesh",
    venue: "Varanasi district, Uttar Pradesh",
    date: "August 2025",
    blurb:
      "A travelling science fair that brought hands-on experiments, telescope nights, and student exhibitions to government schools in rural Varanasi district.",
    description: [
      "Curiosity — jigyasa — does not check whether a school has a laboratory. Project Jigyasa took a travelling science fair to government schools across rural blocks of Varanasi district, reaching students who had never handled laboratory equipment before.",
      "Over three weeks, students rotated through hands-on stations in physics, biology, and electronics, built take-home experiments from low-cost materials, and stayed late for telescope evenings that, for most, were their first look at Saturn's rings.",
      "The fair culminated in a student exhibition where local children presented their own working models to their families and teachers — turning visitors into exhibitors.",
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
    partners: ["District Education Office, Varanasi", "Akhil Bharat Shiksha Sansthan"],
    outcomes: ["[N] schools started a science club after the fair"],
    reflection: "[Specific thing that worked] worked better than we expected. [Which station broke / which school visit was hardest logistically?] didn\u2019t \u2014 [consequence]. Next time we\u2019re [concrete change].",
    gallery: [],
    status: "past",
  },
  {
    id: "roboshakti",
    image: "images/roboshakti.jpg",
    imageAlt: "Students building a small robot",
    credit: { creator: "U.S. Embassy Jerusalem", license: "CC BY 2.0", url: "https://www.flickr.com/photos/46886434@N04/33181647196" },
    pillar: "stem",
    title: "RoboShakti: Girls' Robotics Bootcamp",
    district: "Hyderabad",
    state: "Telangana",
    venue: "Hyderabad, Telangana",
    date: "June 2025",
    blurb:
      "A week-long residential robotics bootcamp for girls from government schools — from first circuit to a working robot in seven days.",
    description: [
      "Girls remain sharply underrepresented in Indian engineering classrooms, and the gap begins well before college. RoboShakti was built to interrupt it early: a week-long residential robotics bootcamp in Hyderabad for 120 girls from government schools, most of whom had never touched a microcontroller.",
      "Each day moved from fundamentals to building: circuits on day one, sensors and motors by mid-week, and by day seven every team had designed, built, and programmed a working robot of their own. Instruction came from women engineers and college robotics teams, so every student spent the week learning from someone whose path she could see herself on.",
      "The bootcamp ended with a friendly robot showcase, and every participating school received a robotics starter kit so the building didn't stop when the week did.",
    ],
    highlights: [
      "Residential programme — meals, boarding, and materials fully covered",
      "All instruction led by women engineers and college robotics mentors",
      "Every school received a robotics starter kit to continue the work",
    ],
    figures: [
      { number: "120", label: "girls trained" },
      { number: "30", label: "working robots built" },
      { number: "7", label: "days from circuit to robot" },
    ],
    partners: ["Telangana State Innovation Cell"],
    outcomes: ["Robotics clubs active in 8 of 12 participating schools four months later", "[N] starter kits in active use, reaching [N] more students"],
    reflection: "[Specific thing that worked] worked better than we expected. [Day-by-day, where did teams get stuck? What would you cut from day 1?] didn\u2019t \u2014 [consequence]. Next time we\u2019re [concrete change].",
    gallery: [],
    status: "past",
  },
  {
    id: "safe-minds",
    image: "images/safe-minds.jpg",
    imageAlt: "Students in a group discussion at school",
    credit: { creator: "U.S. Department of Education", license: "CC BY 2.0", url: "https://www.flickr.com/photos/48445211@N06/14489447353" },
    pillar: "stem",
    title: "Safe Minds: Peer-Support Training",
    district: "New Delhi",
    state: "Delhi",
    venue: "New Delhi",
    date: "October 2025",
    blurb:
      "Training senior students as peer supporters who know how to listen and refer — because the first person a struggling teenager talks to is almost always another teenager.",
    wellbeingNote: true,
    description: [
      "When a teenager is struggling, the first person they confide in is rarely an adult — it is a classmate. Safe Minds works with that reality instead of against it, training senior students in Delhi schools as peer supporters.",
      "In workshops led by clinical psychologists, students learned to recognise warning signs, listen without judgement, and — most critically — connect a struggling friend to a trained adult or helpline rather than carry the weight alone. The curriculum was developed with practising clinicians and aligned to national mental-health guidelines, including Tele-MANAS (14416) referral pathways.",
      "Participating schools also established ongoing wellbeing circles, so the training became a standing structure rather than a one-day event.",
    ],
    highlights: [
      "Curriculum designed and delivered with clinical psychologists",
      "Students trained to refer, not to counsel — safety-first design throughout",
      "Standing wellbeing circles established in every participating school",
    ],
    figures: [
      { number: "180", label: "peer supporters trained" },
      { number: "15", label: "schools enrolled" },
      { number: "14416", label: "Tele-MANAS referral pathway taught" },
    ],
    partners: ["Directorate of Education, Delhi", "NIMHANS outreach wing"],
    outcomes: ["12 of 15 schools still running weekly wellbeing circles six months later", "[N] of 15 wellbeing circles still meeting after [N] months"],
    reflection: "[Specific thing that worked] worked better than we expected. [Did any student find the referral pathway confusing in practice?] didn\u2019t \u2014 [consequence]. Next time we\u2019re [concrete change].",
    gallery: [],
    status: "past",
  },
  {
    id: "makeathon-for-all",
    image: "images/makeathon.jpg",
    imageAlt: "A student reading braille",
    credit: { creator: "Ben Clare / AusAID", license: "CC BY 2.0", url: "https://commons.wikimedia.org/w/index.php?curid=32167999" },
    pillar: "inclusion",
    title: "Makeathon for All: Assistive Technology",
    district: "Mysuru",
    state: "Karnataka",
    venue: "Mysuru, Karnataka",
    date: "March 2026",
    blurb:
      "Blind, low-vision, and sighted students building assistive devices together — navigation aids, audio labels, and tactile learning tools designed with, not for.",
    description: [
      "The best assistive technology is designed with its users, not for them. Makeathon for All paired blind and low-vision students with sighted peers in mixed teams, and gave them two days, a workbench, and one brief: build something that makes daily life or learning easier.",
      "Teams in Mysuru produced working prototypes of ultrasonic navigation aids, audio-label systems for household items, and tactile mathematics learning tools. Blind and low-vision students were designers and decision-makers on every team — their lived experience was the project's most valuable engineering input.",
      "Three prototypes were selected for continued development with a local engineering college, and the event's mixed-team model has become the template for our future inclusion programmes.",
    ],
    highlights: [
      "Mixed teams of blind, low-vision, and sighted students — co-design, not charity",
      "Working prototypes: navigation aids, audio labels, tactile maths tools",
      "Three prototypes advanced to development with a partner engineering college",
    ],
    figures: [
      { number: "60", label: "student makers" },
      { number: "14", label: "prototypes built" },
      { number: "3", label: "advanced to development" },
    ],
    partners: ["JSS Science and Technology University, Mysuru"],
    outcomes: ["3 prototypes in active development at [college name]"],
    reflection: "[Specific thing that worked] worked better than we expected. [What did mixed teams struggle with in the first hours?] didn\u2019t \u2014 [consequence]. Next time we\u2019re [concrete change].",
    gallery: [],
    status: "past",
  },
  {
    id: "digital-disha",
    image: "images/digital-disha.jpg",
    imageAlt: "Students at computers in a school classroom",
    credit: { creator: "One Laptop per Child", license: "CC BY 2.0", url: "https://commons.wikimedia.org/w/index.php?curid=17583955" },
    pillar: "ai",
    title: "Digital Disha: AI Awareness Drive",
    district: "Nagpur",
    state: "Maharashtra",
    venue: "Nagpur district, Maharashtra",
    date: "February 2026",
    blurb:
      "A district-wide drive bringing practical AI literacy — what it is, what it isn't, and how to use it safely — to secondary students and their families.",
    description: [
      "AI tools reached India's students before AI literacy did. Digital Disha travelled through schools across Nagpur district with a simple goal: make every student a confident, critical user of AI rather than a passive one.",
      "Through demonstrations, hands-on sessions, and plain-language materials in Marathi, Hindi, and English, students learned how AI systems actually work, where they fail, how to spot AI-generated misinformation, and how to use AI tools to study better rather than shortcut learning.",
      "Evening sessions brought parents into the same conversation — because a student's digital safety is a family matter — and every school received a resource library for continued teaching.",
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
    partners: ["District Education Office, Nagpur", "Maharashtra Knowledge Corporation"],
    outcomes: ["[N] of 11 schools teaching from the resource library"],
    reflection: "[Specific thing that worked] worked better than we expected. [Which language\u2019s materials landed worst? Attendance at evening sessions vs. expectation?] didn\u2019t \u2014 [consequence]. Next time we\u2019re [concrete change].",
    gallery: [],
    status: "past",
  },
  {
    id: "upcoming-2026-27",
    image: null,
    imageAlt: "",
    credit: null,
    pillar: "stem",
    title: "2026\u201327 Programme Announcements",
    district: "Multiple districts",
    state: "Coming soon",
    venue: "Across India",
    date: "2026\u201327",
    blurb:
      "Our next cycle of programmes is in planning. New districts, new partnerships, and new ways to bring science and inclusion to more students.",
    description: [
      "We are currently planning our 2026\u201327 programme cycle. Details will be announced here as partnerships are confirmed. If you would like to bring a Neorons programme to your district, write to us.",
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

/** Hero photo attribution ({ creator, license, url } or null). */
var NEORONS_HERO_CREDIT = { creator: "McKay Savage", license: "CC BY 2.0", url: "https://commons.wikimedia.org/w/index.php?curid=11823848" };

/** Pillar display metadata (labels + card accent colours). */
var NEORONS_PILLARS = {
  stem: { label: "STEM for Social Good", className: "pillar-stem" },
  inclusion: { label: "Inclusion & Ability", className: "pillar-inclusion" },
  ai: { label: "AI & Education", className: "pillar-ai" },
};

/**
 * Team members — [BRACKET] convention: every invented detail is wrapped in
 * [BRACKETS]. Find-and-replace "[" before launch — if any bracket survives
 * to production, it's visible, which is the point.
 *
 * Six slots defined. Delete the ones you don't fill with real people.
 * A team of 3 real people beats 6 half-filled cards.
 */
var NEORONS_TEAM = [
  /* Slot 1 — Founder */
  {
    name: "[FULL NAME]",
    role: "Founder & [Executive Director / President]",
    bio: "[Name] founded Neorons in [year] after [one concrete origin moment]. [He/She/They] [is a student at / studies X at / works in Y] and leads programme design and partnerships.",
    image: null, /* [headshot-founder.jpg — 800x800px, plain background, natural light] */
    linkedin: "[url]",
  },
  /* Slot 2 — Co-founder / Programmes */
  {
    name: "[FULL NAME]",
    role: "Co-founder, Programmes",
    bio: "[Name] runs Neorons' events on the ground — [he/she/they] led [specific event from the site] and manages our relationships with [number] partner schools.",
    image: null,
    linkedin: null,
  },
  /* Slot 3 — Inclusion lead */
  {
    name: "[FULL NAME]",
    role: "Inclusion & Accessibility Lead",
    bio: "[Name] designs the adaptive elements of our programmes — [sound-cue officiating / mixed-team formats / tactile materials] — working directly with [partner school for the blind / para-sport coaches].",
    image: null,
    linkedin: null,
  },
  /* Slot 4 — Clinical / wellbeing advisor (highest-trust card — ask your clinician first) */
  {
    name: "[FULL NAME, credentials — e.g., M.Phil Clinical Psychology]",
    role: "Wellbeing Advisor",
    bio: "[Name] is a [clinical psychologist / counsellor] at [institution] who reviews every Neorons mental-health programme for clinical safety and shaped the Safe Minds curriculum.",
    image: null,
    linkedin: null,
  },
  /* Slot 5 — Mentor network */
  {
    name: "[FULL NAME]",
    role: "Volunteer & Mentor Coordinator",
    bio: "[Name] coordinates the [number]+ engineers, coaches, and college robotics teams who mentor at Neorons events.",
    image: null,
    linkedin: null,
  },
  /* Slot 6 — Advisor (adult, institutional) */
  {
    name: "[FULL NAME]",
    role: "Advisor",
    bio: "[Name] is [title] at [school/university/company] and advises Neorons on [governance / education policy / fundraising].",
    image: null,
    linkedin: null,
  },
];

/**
 * Testimonials — [BRACKET] convention: sentence FRAMES, not quotes.
 * Read each one to the real person, ask them the prompt, and write down
 * what they actually say — their words will be rougher and better.
 *
 * Consent line (copy-paste into WhatsApp):
 * "We'd love to feature your words on the Neorons website with your
 * [first name / full name] and [role]. You can review the exact quote
 * before it goes live, and we'll remove it any time you ask. OK?"
 */
var NEORONS_TESTIMONIALS = [
  /* 1. Student (STEM event) — prompt: "What surprised you most about the week?" */
  {
    quote: "I thought [robotics/coding] was for [other kind of person]. By day [number] I had built [specific thing]. Now I want to [aspiration].",
    name: "[First name]",
    context: "[age], [event name]",
    event: "RoboShakti",
    role: "student",
  },
  /* 2. Athlete (Unstoppable) — prompt: "What do you remember from competition day?" */
  {
    quote: "When they called my name, [what happened / how it felt]. It was the first time [specific first].",
    name: "[First name]",
    context: "athlete, [school name]",
    event: "Unstoppable",
    role: "student",
  },
  /* 3. Teacher (Classroom 2030) — prompt: "What changed in your classroom afterward?" */
  {
    quote: "Before the training I [old habit / fear about AI]. Now I [specific new practice] and it saves me [amount of time] every week.",
    name: "[Name]",
    context: "[subject] teacher, [school], Pune",
    event: "Classroom 2030",
    role: "teacher",
  },
  /* 4. Parent (Digital Disha) — prompt: "Why did you come, and what did you take home?" */
  {
    quote: "My [son/daughter] uses these tools every day and I understood none of it. After the session I [specific understanding / rule we made at home].",
    name: "[Name]",
    context: "parent, Nagpur",
    event: "Digital Disha",
    role: "parent",
  },
  /* 5. Peer supporter (Safe Minds) — prompt: "Has the training been used yet?" — KEEP ANONYMOUS */
  {
    quote: "A [classmate/friend] came to me [timeframe] after the workshop. I knew what to say and \u2014 more importantly \u2014 who to bring in. Before, I would have [carried it alone / not known].",
    name: "[First name only]",
    context: "peer supporter, Delhi",
    event: "Safe Minds",
    role: "student",
  },
  /* 6. Partner official — prompt: "Why did you say yes to working with a youth-led org?" */
  {
    quote: "We get many proposals. Neorons came with [data / a pilot / a concrete plan], delivered on schedule, and [what happened after].",
    name: "[Name]",
    context: "[title], [District Education Office / school]",
    event: null,
    role: "partner",
  },
];
