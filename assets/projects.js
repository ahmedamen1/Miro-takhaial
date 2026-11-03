/* Takhail Board — the single source of truth for every project.
   Used by projects.html (the list), project.html (one project), and
   scoring.html (the score table and matrix). Add a project here and it
   appears everywhere, with its own page and its own row in the scorer. */

const PROJECTS = [
  /* ---------- Agents for business ---------- */
  { id:"sales-agent", name:"Sales Agent", group:"Agents for business",
    desc:"Researches potential customers, analyses their needs, and automates personalised sales preparation and deal support.",
    value:"Cuts sales research and prep time, improves personalisation, and raises conversion potential." },
  { id:"marketing-agent", name:"Marketing Agent", group:"Agents for business",
    desc:"Analyses market trends and audiences, plans campaigns, creates content and ads, and supports execution and optimisation.",
    value:"Reduces marketing workload, improves targeting, and optimises ad spend and performance." },
  { id:"byoi", name:"Bring Your Own Idea / Problem", group:"Agents for business",
    desc:"Turn a customer's idea or problem into a tailored solution using AI, automation, or whatever technology fits their need.",
    value:"Customised solutions for problems no off-the-shelf product covers.",
    note:"This is the project the seven questions were written against." },
  { id:"analytics", name:"Analytics (text-to-SQL)", group:"Agents for business",
    desc:"Natural-language querying of databases (text-to-SQL) and automatic report generation." },

  /* ---------- Vision: the six CCTV products ---------- */
  { id:"visionops", name:"VisionOps", group:"Vision & CCTV",
    tagline:"Smart Mall & School Monitoring",
    desc:"Uses CCTV cameras to count people, monitor occupancy, detect overcrowding, identify restricted-area access, and monitor queues.",
    features:["People counting","Occupancy monitoring","Overcrowding detection","Restricted-area access","Queue monitoring"],
    sectors:["Malls","Schools"] },
  { id:"safesite", name:"SafeSite AI", group:"Vision & CCTV",
    tagline:"Workplace Safety Monitoring",
    desc:"Detects workers without helmets or safety vests, identifies dangerous-zone entry, monitors falls, and alerts managers about safety violations.",
    features:["Helmet & vest detection (PPE)","Dangerous-zone entry","Fall detection","Automatic alerts to managers"],
    sectors:["Construction","Factories","Industrial sites"] },
  { id:"retailvision", name:"RetailVision", group:"Vision & CCTV",
    tagline:"Smart Store Intelligence",
    desc:"Monitors supermarket shelves to detect missing products, empty shelves, misplaced items, customer traffic, and checkout queues.",
    features:["Missing-product detection","Empty-shelf alerts","Misplaced-item detection","Customer traffic","Checkout queue monitoring"],
    sectors:["Supermarkets","Retail chains"] },
  { id:"parksense", name:"ParkSense", group:"Vision & CCTV",
    tagline:"Intelligent Parking Management",
    desc:"Detects available and occupied parking spaces, monitors vehicle entry and exit, identifies illegal parking, and recognizes license plates.",
    features:["Free vs occupied space detection","Entry & exit monitoring","Illegal-parking detection","Licence plate recognition (ANPR)"],
    sectors:["Malls","Compounds","Offices","Public parking"] },
  { id:"classvision", name:"ClassVision", group:"Vision & CCTV",
    tagline:"Smart Classroom Analytics",
    desc:"Monitors classroom occupancy, counts students, detects empty seats, tracks classroom utilization, and measures room usage.",
    features:["Classroom occupancy","Student counting","Empty-seat detection","Utilisation tracking","Room-usage reporting"],
    sectors:["Schools","Universities","Training centres"] },
  { id:"safezone", name:"SafeZone AI", group:"Vision & CCTV",
    tagline:"Intelligent Restricted-Area Monitoring",
    desc:"Converts CCTV footage into a real-time security system that detects people entering restricted zones, monitors crowd density, tracks movement, and generates automatic security alerts.",
    features:["Restricted-zone intrusion","Crowd-density monitoring","Movement tracking","Automatic security alerts"],
    sectors:["Any site with CCTV"] },

  /* ---------- Other vision work already on the board ---------- */
  { id:"handicapped-camera", name:"Handicapped protection camera", group:"Vision & CCTV",
    desc:"A camera project to protect people with disabilities. On the board as a single note — the scope still needs writing up." },
  { id:"sign-language", name:"Sign language interpretation", group:"Vision & CCTV",
    desc:"Interpreting sign language from video." },
  { id:"nursery-vision", name:"Nursery & schools vision", group:"Vision & CCTV",
    desc:"Written in marker in the Notes frame. Overlaps with VisionOps and ClassVision — worth deciding whether it is a separate product or a sector for those two.",
    note:"From the handwritten Notes frame, not a sticky note." },

  /* ---------- E-commerce and messaging ---------- */
  { id:"order-tracking", name:"Order tracking for e-commerce", group:"E-commerce & messaging",
    desc:"Automate order tracking on e-commerce." },
  { id:"whatsapp-shopify", name:"WhatsApp + Shopify ordering", group:"E-commerce & messaging",
    desc:"A full e-commerce AI flow where the user orders a product entirely on WhatsApp, connected to the Shopify database." },
  { id:"whatsapp-feature", name:"WhatsApp new feature", group:"E-commerce & messaging",
    desc:"A new feature built on WhatsApp. Scope not written on the board." },
  { id:"booking", name:"AI booking agent", group:"E-commerce & messaging",
    desc:"An agent that handles bookings." },
  { id:"web-assistant", name:"AI assistant in websites", group:"E-commerce & messaging",
    desc:"An AI assistant embedded in customer websites." },
  { id:"agentic-chatbots", name:"Agentic chatbots", group:"E-commerce & messaging",
    desc:"Chatbots that take actions, not just answer questions." },

  /* ---------- Sports ---------- */
  { id:"sports", name:"Sports analysis", group:"Sports analysis",
    desc:"Video analysis for sport. On the board it branches into three types.",
    features:["Solo sports, like karate","Dual sports, like tennis","Team sports, like football"] },

  /* ---------- Other industries ---------- */
  { id:"restaurants", name:"Tracking restaurants", group:"Other industries",
    desc:"Tracking for restaurants." },
  { id:"maintenance", name:"Machines maintenance", group:"Other industries",
    desc:"Predictive or assisted maintenance for machines." },
  { id:"education", name:"AI in education", group:"Other industries",
    desc:"Grading exams, sending notifications to parents, and dashboards." },
  { id:"revit", name:"Agents for design tools (Revit)", group:"Other industries",
    desc:"Agents connected to design tools like Revit." },
  { id:"film", name:"Film making using AI", group:"Other industries",
    desc:"Film making using AI." },

  /* ---------- Internal and platform ---------- */
  { id:"local-model", name:"Build our own local model", group:"Internal & platform",
    desc:"Build our own local model. Also appears in the targets frame as “make our own AI model”." },
  { id:"claude-based", name:"Claude based", group:"Internal & platform",
    desc:"Building on Claude." },
  { id:"tickets", name:"Local Model · Tickets", group:"Internal & platform",
    desc:"From the handwritten Notes frame.", note:"Handwritten note, scope not defined." }
];

const PROJECT_BY_ID = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
const PROJECT_GROUPS = [...new Set(PROJECTS.map(p => p.group))];
function projectsIn(group) { return PROJECTS.filter(p => p.group === group); }
function projectHref(id)   { return "project.html?p=" + encodeURIComponent(id); }
