(() => {
  const globalScope = typeof window !== "undefined" ? window : globalThis;
  const hasDocument = typeof document !== "undefined";
  const STYLE_ID = "wc-fallout-calculator-styles";
  const STORAGE_KEY = "wasteland-calculator-v1";
  const SHARE_PARAM = "wc";
  const CATEGORIES = ["combat", "stealth", "diplomacy", "scavenging", "luck"];

  const DEFAULT_CONFIG = {
    accentColor: "#ff9000",
    title: "Wasteland Survival Calculator",
    defaultScenario: "fallout4",
    showMathPanel: true,
    shareBaseUrl: "",
    onComplete: null,
  };

  const SPECIAL_STATS = [
    { id: "strength", label: "Strength", description: "How much hurt you can dish out when subtlety dies in a hallway.", baseValue: 5, min: 1, max: 10, weight: 0.95 },
    { id: "perception", label: "Perception", description: "How quickly you notice mines, ambushes, and bad lies.", baseValue: 5, min: 1, max: 10, weight: 1.1 },
    { id: "endurance", label: "Endurance", description: "More HP, more grit, more resistance to radiation and attrition.", baseValue: 5, min: 1, max: 10, weight: 1.5 },
    { id: "charisma", label: "Charisma", description: "Talk people down, talk your way in, or talk yourself into trouble.", baseValue: 5, min: 1, max: 10, weight: 0.95 },
    { id: "intelligence", label: "Intelligence", description: "Helps you read the room, the map, and the old-world machine you just woke up.", baseValue: 5, min: 1, max: 10, weight: 1 },
    { id: "agility", label: "Agility", description: "Keeps you quick on your feet when bullets start making decisions.", baseValue: 5, min: 1, max: 10, weight: 1.15 },
    { id: "luck", label: "Luck", description: "Crits, escapes, fortunate finds, and the occasional miracle.", baseValue: 5, min: 1, max: 10, weight: 1.35 },
  ];

  const SCENARIOS = [
    { id: "fallout1", label: "Fallout 1", difficultyMultiplier: 0.92, tone: "grim", questionSetId: "fallout1", allowedCompanionIds: [] },
    { id: "fallout2", label: "Fallout 2", difficultyMultiplier: 0.98, tone: "wild", questionSetId: "fallout2", allowedCompanionIds: [] },
    { id: "tactics", label: "Fallout: Tactics", difficultyMultiplier: 0.94, tone: "military", questionSetId: "tactics", allowedCompanionIds: [] },
    { id: "fallout3", label: "Fallout 3", difficultyMultiplier: 1.0, tone: "bleak", questionSetId: "fallout3", allowedCompanionIds: [] },
    { id: "newvegas", label: "Fallout: New Vegas", difficultyMultiplier: 1.15, tone: "swagger", questionSetId: "newvegas", allowedCompanionIds: [] },
    { id: "fallout4", label: "Fallout 4", difficultyMultiplier: 1.05, tone: "rebuild", questionSetId: "fallout4", allowedCompanionIds: [] },
    { id: "fallout76", label: "Fallout 76", difficultyMultiplier: 0.97, tone: "frontier", questionSetId: "fallout76", allowedCompanionIds: [] },
    { id: "tvshow", label: "Fallout TV Show", difficultyMultiplier: 0.75, tone: "brutal", questionSetId: "tvshow", allowedCompanionIds: [] },
  ];

  const COMPANIONS = [
    { id: "ian", label: "Ian", originScenario: "fallout1", tags: ["guns", "drifter"], baseEffects: { scoreDelta: 4, bucketDeltas: { combat: 8, diplomacy: 1 } }, specialRules: { note: "Ian adds early firepower but can turn a corridor into a ricochet lesson." } },
    { id: "tycho", label: "Tycho", originScenario: "fallout1", tags: ["scout", "ranger"], baseEffects: { scoreDelta: 5, bucketDeltas: { stealth: 6, scavenging: 4 } }, specialRules: { note: "Tycho steadies shaky routes and improves your odds on long roads." } },
    { id: "katja", label: "Katja", originScenario: "fallout1", tags: ["stealth", "survival"], baseEffects: { scoreDelta: 4, bucketDeltas: { stealth: 7, scavenging: 3 } }, specialRules: { note: "Katja rewards careful play and punishes loud optimism." } },
    { id: "dogmeat-fo1", label: "Dogmeat (Original Wasteland)", originScenario: "fallout1", tags: ["dogmeat", "scout"], baseEffects: { scoreDelta: 5, bucketDeltas: { stealth: 6, luck: 4 } }, specialRules: { dogmeat: true, note: "Dogmeat smells danger before you do and turns panic into warning." } },
    { id: "sulik", label: "Sulik", originScenario: "fallout2", tags: ["tribal", "loyal"], baseEffects: { scoreDelta: 6, bucketDeltas: { combat: 8, diplomacy: 2 } }, specialRules: { note: "Sulik is one of the safest bets if you need both muscle and heart." } },
    { id: "cassidy", label: "Cassidy", originScenario: "fallout2", tags: ["guns", "pragmatic"], baseEffects: { scoreDelta: 6, bucketDeltas: { combat: 7, scavenging: 2 } }, specialRules: { note: "Cassidy adds seasoned caution and strips some rookie shine off your choices." } },
    { id: "vic", label: "Vic", originScenario: "fallout2", tags: ["repair", "utility"], baseEffects: { scoreDelta: 4, bucketDeltas: { scavenging: 8, diplomacy: 2 } }, specialRules: { note: "Vic shines when your plan involves keeping busted old-world tech alive." } },
    { id: "marcus", label: "Marcus", originScenario: "fallout2", tags: ["supermutant", "heavy"], baseEffects: { scoreDelta: 7, bucketDeltas: { combat: 10, diplomacy: 2 } }, specialRules: { note: "Marcus lowers your odds of being overrun and raises the stakes when things escalate." } },
    { id: "goris", label: "Goris", originScenario: "fallout2", tags: ["deathclaw", "scholar"], baseEffects: { scoreDelta: 6, bucketDeltas: { combat: 9, diplomacy: 2 } }, specialRules: { note: "Goris makes the weird end of the wasteland feel briefly survivable." } },
    { id: "lenny", label: "Lenny", originScenario: "fallout2", tags: ["ghoul", "medical"], baseEffects: { scoreDelta: 5, bucketDeltas: { scavenging: 5, diplomacy: 4 } }, specialRules: { note: "Lenny softens attrition and buys you recovery time after mistakes." } },
    { id: "skynet", label: "Skynet", originScenario: "fallout2", tags: ["robot", "analysis"], baseEffects: { scoreDelta: 5, bucketDeltas: { scavenging: 6, luck: 2, combat: 3 } }, specialRules: { note: "Skynet helps if your idea of safety includes hardware and paranoia." } },
    { id: "stitch", label: "Stitch", originScenario: "tactics", tags: ["medic", "brotherhood"], baseEffects: { scoreDelta: 5, bucketDeltas: { scavenging: 5, diplomacy: 3 } }, specialRules: { note: "Stitch keeps sloppy tactical decisions from ending your run outright." } },
    { id: "farsight", label: "Farsight", originScenario: "tactics", tags: ["sniper", "scout"], baseEffects: { scoreDelta: 6, bucketDeltas: { stealth: 7, combat: 5 } }, specialRules: { note: "Farsight improves your odds whenever distance and patience are available." } },
    { id: "reilly-tactics", label: "Reilly", originScenario: "tactics", tags: ["squad", "support"], baseEffects: { scoreDelta: 4, bucketDeltas: { diplomacy: 3, scavenging: 4, combat: 3 } }, specialRules: { note: "Reilly rewards team-minded builds more than lone hero fantasies." } },
    { id: "jaelyn", label: "Jaelyn", originScenario: "tactics", tags: ["technical", "brotherhood"], baseEffects: { scoreDelta: 4, bucketDeltas: { scavenging: 6, stealth: 2 } }, specialRules: { note: "Jaelyn gives structure to chaotic supply problems." } },
    { id: "dogmeat-fo3", label: "Dogmeat (Capital Wasteland)", originScenario: "fallout3", tags: ["dogmeat", "scout"], baseEffects: { scoreDelta: 6, bucketDeltas: { stealth: 7, luck: 4 } }, specialRules: { dogmeat: true, note: "This Dogmeat is a scouting upgrade disguised as a very good boy." } },
    { id: "fawkes", label: "Fawkes", originScenario: "fallout3", tags: ["supermutant", "tank"], baseEffects: { scoreDelta: 8, bucketDeltas: { combat: 12, diplomacy: 2 } }, specialRules: { note: "Fawkes makes straight-line danger survivable if your conscience can keep up." } },
    { id: "charon", label: "Charon", originScenario: "fallout3", tags: ["ghoul", "mercenary"], baseEffects: { scoreDelta: 6, bucketDeltas: { combat: 9, stealth: 2 } }, specialRules: { note: "Charon is dependable in a firefight and unnerving in the quiet after it." } },
    { id: "clover", label: "Clover", originScenario: "fallout3", tags: ["chaos", "melee"], baseEffects: { scoreDelta: 3, bucketDeltas: { combat: 5, diplomacy: -2, luck: 2 } }, specialRules: { note: "Clover boosts chaos tolerance more than careful planning." } },
    { id: "butch", label: "Butch DeLoria", originScenario: "fallout3", tags: ["vault", "social"], baseEffects: { scoreDelta: 2, bucketDeltas: { diplomacy: 4, scavenging: 1 } }, specialRules: { note: "Butch helps if you survive by talking first and improvising second." } },
    { id: "star-paladin-cross", label: "Star Paladin Cross", originScenario: "fallout3", tags: ["brotherhood", "discipline"], baseEffects: { scoreDelta: 6, bucketDeltas: { combat: 8, diplomacy: 3 } }, specialRules: { note: "Cross rewards conviction and punishes moral dithering under pressure." } },
    { id: "boone", label: "Craig Boone", originScenario: "newvegas", tags: ["sniper", "vengeful"], baseEffects: { scoreDelta: 8, bucketDeltas: { combat: 10, stealth: 5 } }, specialRules: { note: "Boone is a huge combat spike, but he likes clarity and hates nonsense." } },
    { id: "ede", label: "ED-E", originScenario: "newvegas", tags: ["robot", "scout"], baseEffects: { scoreDelta: 7, bucketDeltas: { stealth: 8, scavenging: 5, luck: 2 } }, specialRules: { note: "ED-E raises your information ceiling and lowers your ambush rate." } },
    { id: "veronica", label: "Veronica", originScenario: "newvegas", tags: ["brotherhood", "social"], baseEffects: { scoreDelta: 7, bucketDeltas: { combat: 7, diplomacy: 5 } }, specialRules: { note: "Veronica smooths rough edges until the world gives her a reason not to." } },
    { id: "arcade", label: "Arcade Gannon", originScenario: "newvegas", tags: ["followers", "medical"], baseEffects: { scoreDelta: 6, bucketDeltas: { scavenging: 6, diplomacy: 5 } }, specialRules: { note: "Arcade makes brains and conscience more survivable than they look." } },
    { id: "cass", label: "Rose of Sharon Cassidy", originScenario: "newvegas", tags: ["caravan", "guns"], baseEffects: { scoreDelta: 6, bucketDeltas: { combat: 8, scavenging: 3 } }, specialRules: { note: "Cass helps when your run is half firefight, half supply chain." } },
    { id: "lily", label: "Lily Bowen", originScenario: "newvegas", tags: ["stealth", "nightkin"], baseEffects: { scoreDelta: 6, bucketDeltas: { stealth: 8, combat: 5 } }, specialRules: { note: "Lily rewards careful routes and heavily punishes getting sentimental at the wrong moment." } },
    { id: "raul", label: "Raul Tejada", originScenario: "newvegas", tags: ["repair", "ghoul"], baseEffects: { scoreDelta: 6, bucketDeltas: { scavenging: 8, diplomacy: 3 } }, specialRules: { note: "Raul steadies long-haul survival and makes gear failure less fatal." } },
    { id: "rex", label: "Rex", originScenario: "newvegas", tags: ["hound", "scout"], baseEffects: { scoreDelta: 5, bucketDeltas: { stealth: 6, combat: 4 } }, specialRules: { note: "Rex gives you one more second before something sharp reaches your throat." } },
    { id: "dogmeat-fo4", label: "Dogmeat (Commonwealth)", originScenario: "fallout4", tags: ["dogmeat", "scout"], baseEffects: { scoreDelta: 6, bucketDeltas: { stealth: 7, luck: 5, scavenging: 2 } }, specialRules: { dogmeat: true, note: "Dogmeat is the cleanest scouting bonus in the whole calculator." } },
    { id: "piper", label: "Piper", originScenario: "fallout4", tags: ["journalist", "social"], baseEffects: { scoreDelta: 6, bucketDeltas: { diplomacy: 8, scavenging: 3 } }, specialRules: { note: "Piper is best when your run depends on reading motives fast." } },
    { id: "nick", label: "Nick Valentine", originScenario: "fallout4", tags: ["detective", "synth"], baseEffects: { scoreDelta: 8, bucketDeltas: { diplomacy: 7, scavenging: 6, stealth: 3 } }, specialRules: { note: "Nick is excellent at turning mysteries into advantages before they become gunfights." } },
    { id: "curie", label: "Curie", originScenario: "fallout4", tags: ["medical", "science"], baseEffects: { scoreDelta: 7, bucketDeltas: { scavenging: 8, diplomacy: 4 } }, specialRules: { note: "Curie quietly raises your margin for error over long survival windows." } },
    { id: "deacon", label: "Deacon", originScenario: "fallout4", tags: ["railroad", "stealth"], baseEffects: { scoreDelta: 7, bucketDeltas: { stealth: 9, diplomacy: 3 } }, specialRules: { note: "Deacon thrives when you prefer lies, routes, and exits over heroics." } },
    { id: "preston", label: "Preston Garvey", originScenario: "fallout4", tags: ["minutemen", "leadership"], baseEffects: { scoreDelta: 5, bucketDeltas: { diplomacy: 6, combat: 4 } }, specialRules: { note: "Preston improves community survival more than lone-wolf runs." } },
    { id: "codsworth", label: "Codsworth", originScenario: "fallout4", tags: ["robot", "utility"], baseEffects: { scoreDelta: 5, bucketDeltas: { scavenging: 6, diplomacy: 2 } }, specialRules: { note: "Codsworth adds order to chaos and keeps domestic collapse from snowballing." } },
    { id: "maccready", label: "MacCready", originScenario: "fallout4", tags: ["mercenary", "sniper"], baseEffects: { scoreDelta: 6, bucketDeltas: { combat: 8, stealth: 3 } }, specialRules: { note: "MacCready helps builds that prefer competent cynicism to noble speeches." } },
    { id: "cait", label: "Cait", originScenario: "fallout4", tags: ["brawler", "volatile"], baseEffects: { scoreDelta: 4, bucketDeltas: { combat: 7, luck: 2, diplomacy: -2 } }, specialRules: { note: "Cait makes desperate plans slightly more survivable and stable plans less stable." } },
    { id: "danse", label: "Paladin Danse", originScenario: "fallout4", tags: ["brotherhood", "armor"], baseEffects: { scoreDelta: 7, bucketDeltas: { combat: 10, diplomacy: 2 } }, specialRules: { note: "Danse is a raw survivability gain if your route can absorb Brotherhood baggage." } },
    { id: "hancock", label: "John Hancock", originScenario: "fallout4", tags: ["ghoul", "charisma"], baseEffects: { scoreDelta: 6, bucketDeltas: { diplomacy: 6, luck: 4 } }, specialRules: { note: "Hancock is strong in dirty gray zones where charm and nerve beat purity." } },
    { id: "strong", label: "Strong", originScenario: "fallout4", tags: ["supermutant", "power"], baseEffects: { scoreDelta: 6, bucketDeltas: { combat: 11, diplomacy: -3 } }, specialRules: { note: "Strong turns many fights in your favor and many negotiations into cautionary tales." } },
    { id: "ada", label: "Ada", originScenario: "fallout4", tags: ["robot", "modular"], baseEffects: { scoreDelta: 7, bucketDeltas: { combat: 6, scavenging: 7 } }, specialRules: { note: "Ada is one of the safest all-rounder picks in the Commonwealth." } },
    { id: "beckett", label: "Beckett", originScenario: "fallout76", tags: ["ally", "guns"], baseEffects: { scoreDelta: 5, bucketDeltas: { combat: 7, diplomacy: 2 } }, specialRules: { note: "Beckett adds practical toughness to a world that keeps respawning trouble." } },
    { id: "sofia", label: "Sofia Daguerre", originScenario: "fallout76", tags: ["science", "ally"], baseEffects: { scoreDelta: 6, bucketDeltas: { scavenging: 8, diplomacy: 2 } }, specialRules: { note: "Sofia is strongest when your survival depends on curiosity not killing you." } },
    { id: "raider-punk", label: "Raider Punk", originScenario: "fallout76", tags: ["weird", "signals"], baseEffects: { scoreDelta: 4, bucketDeltas: { luck: 6, scavenging: 3 } }, specialRules: { note: "Raider Punk leans into chaos, rumors, and the right sort of bad instincts." } },
    { id: "yasmin", label: "Yasmin Chowdhury", originScenario: "fallout76", tags: ["support", "food"], baseEffects: { scoreDelta: 5, bucketDeltas: { scavenging: 7, diplomacy: 3 } }, specialRules: { note: "Yasmin is a quiet boost to the boring needs that keep you alive." } },
    { id: "the-ghoul", label: "The Ghoul", originScenario: "tvshow", tags: ["tv", "gunslinger", "ghoul"], baseEffects: { scoreDelta: 8, bucketDeltas: { combat: 10, luck: 4, diplomacy: 1 } }, specialRules: { note: "The Ghoul raises survival hard, but only if you can stomach his version of realism." } },
    { id: "lucy", label: "Lucy MacLean", originScenario: "tvshow", tags: ["tv", "vault"], baseEffects: { scoreDelta: 4, bucketDeltas: { diplomacy: 7, luck: 2, combat: 1 } }, specialRules: { note: "Lucy improves the odds of hopeful choices working once, maybe twice." } },
    { id: "maximus", label: "Maximus", originScenario: "tvshow", tags: ["tv", "brotherhood"], baseEffects: { scoreDelta: 5, bucketDeltas: { combat: 8, luck: 1, diplomacy: -1 } }, specialRules: { note: "Maximus is useful when your plan can survive ego and armor at the same time." } },
    { id: "cx404", label: "CX404", originScenario: "tvshow", tags: ["tv", "hound"], baseEffects: { scoreDelta: 5, bucketDeltas: { stealth: 6, luck: 4 } }, specialRules: { note: "CX404 gives you the kind of warning system people keep underestimating." } },
  ];

  const q = (id, prompt, choices) => ({ id, prompt, choices });
  const c = (label, effects, flavorFlags = []) => ({ label, effects, flavorFlags });

  const QUESTION_SETS = {
    fallout1: [
      q("fo1-water-chip", "The next lead on a replacement water chip runs through a gang-owned block. You...", [
        c("Bribe a lookout and map the exits before you move.", { diplomacy: 8, stealth: 6, luck: 2 }),
        c("Sneak through the back alleys and loot what you can on the way.", { stealth: 10, scavenging: 6, combat: -2 }),
        c("Kick in the front door before they can organize.", { combat: 11, luck: -2, diplomacy: -4 }),
        c("Walk away and look for a safer lead, even if it costs time.", { scavenging: 5, combat: -3, luck: -1 }),
      ]),
      q("fo1-junktown", "Junktown offers shelter, gossip, and the kind of smile that usually hides a knife. You...", [
        c("Buy information, not loyalty, and keep moving.", { diplomacy: 7, scavenging: 5, luck: 1 }),
        c("Blend into the town and listen for the loudest lie.", { stealth: 8, diplomacy: 4, luck: 2 }),
        c("Try to make yourself useful to the local muscle.", { combat: 8, diplomacy: -2, scavenging: 2 }),
        c("Publicly challenge the crooks to prove you are not prey.", { combat: 9, diplomacy: -5, luck: -2 }),
      ]),
      q("fo1-rad-zone", "A shortcut cuts across an irradiated industrial ruin. You...", [
        c("Mask up, move fast, and mark every clean cache you see.", { scavenging: 9, stealth: 3, luck: 1 }),
        c("Probe the edge first and back out if your gear looks weak.", { scavenging: 6, diplomacy: 1, combat: -2 }),
        c("Sprint straight through before the dose can stack.", { luck: 5, combat: 2, scavenging: -4 }),
        c("Send your companion ahead while you cover from range.", { combat: 4, diplomacy: -3, stealth: 2 }),
      ]),
      q("fo1-caravan", "A battered caravan offers a place in their column if you pull your weight. You...", [
        c("Take watch duty and keep your gun ready.", { combat: 7, scavenging: 3, diplomacy: 2 }),
        c("Trade repair help for supplies and route details.", { scavenging: 9, diplomacy: 5 }),
        c("Use the caravan as cover while you scout for ambushers.", { stealth: 8, combat: 3, luck: 1 }),
        c("Decline and travel solo so nobody slows you down.", { stealth: 3, scavenging: 2, diplomacy: -5 }),
      ]),
      q("fo1-masters-army", "Rumors say a patrol from the Master's Army has been seen nearby. You...", [
        c("Hide, observe, and learn their route before acting.", { stealth: 10, combat: -1 }),
        c("Look for someone local desperate enough to trade intel.", { diplomacy: 8, luck: 3 }),
        c("Set an ambush with whatever terrain you can use.", { combat: 9, scavenging: 3, luck: -1 }),
        c("Keep moving and hope they are hunting somebody else.", { luck: 2, stealth: 2, scavenging: -2 }),
      ]),
      q("fo1-vault-door", "You find an intact vault door half-buried in sand. You...", [
        c("Check for signs of life and traps before touching anything.", { scavenging: 8, stealth: 4 }),
        c("Call out and try diplomacy first. Somebody may still be inside.", { diplomacy: 8, luck: 1 }),
        c("Force the mechanism and accept whatever noise that makes.", { combat: 5, scavenging: 4, stealth: -4 }),
        c("Mark the location and come back when you have backup.", { scavenging: 4, diplomacy: 2, combat: -2 }),
      ]),
      q("fo1-desert-nights", "Night falls in open desert and you spot fires in the distance. You...", [
        c("Circle wide and count sentries before deciding anything.", { stealth: 9, luck: 2 }),
        c("Approach openly with a trade story prepared.", { diplomacy: 7, luck: 3, combat: -1 }),
        c("Shadow them and rob the camp only if the odds are perfect.", { stealth: 8, scavenging: 5, combat: -2 }),
        c("Hit first while darkness is still on your side.", { combat: 10, stealth: 1, diplomacy: -4 }),
      ]),
      q("fo1-last-call", "A stranger offers you directions in exchange for your spare ammo. You...", [
        c("Negotiate for information and keep half your rounds.", { diplomacy: 7, scavenging: 4, luck: 2 }),
        c("Ask your companion to read the stranger while you listen.", { diplomacy: 5, luck: 3, stealth: 2 }),
        c("Pretend to agree, then tail the stranger from a safe distance.", { stealth: 9, luck: 1 }),
        c("Refuse and keep moving, convinced the whole thing is bait.", { scavenging: 2, diplomacy: -2, luck: -1 }),
      ]),
    ],
    fallout2: [
      q("fo2-tribal-road", "On the road out of Arroyo, a trader offers miracle supplies at a suspicious discount. You...", [
        c("Question them gently until the lie cracks.", { diplomacy: 9, luck: 2 }),
        c("Inspect every crate and tool before you hand over caps.", { scavenging: 9, stealth: 2 }),
        c("Buy a little, keep them friendly, and leave fast.", { diplomacy: 5, luck: 4, scavenging: 2 }),
        c("Threaten them into a better price.", { combat: 7, diplomacy: -4, luck: -1 }),
      ]),
      q("fo2-den", "You need something from the Den, which means vice, debt, and opportunists. You...", [
        c("Work the room and find the hungriest person for information.", { diplomacy: 8, scavenging: 4, luck: 2 }),
        c("Stay unseen, lift the essentials, and vanish.", { stealth: 11, scavenging: 5, diplomacy: -2 }),
        c("Pay for protection while you handle business.", { diplomacy: 5, combat: 4, luck: 1 }),
        c("Start a fight so nobody mistakes you for soft.", { combat: 10, diplomacy: -6 }),
      ]),
      q("fo2-gecko", "A reactor-town contact promises gear if you help with a hazardous repair. You...", [
        c("Take the job and overprepare for the rad exposure.", { scavenging: 9, diplomacy: 4 }),
        c("Bring a technical companion and make it a clean operation.", { scavenging: 8, diplomacy: 3, luck: 2 }),
        c("Bluff your competence and improvise under pressure.", { luck: 8, scavenging: -3, diplomacy: 3 }),
        c("Refuse and search for a lower-risk score elsewhere.", { scavenging: 4, combat: -2 }),
      ]),
      q("fo2-new-reno", "New Reno offers a fast alliance with people you absolutely should not trust. You...", [
        c("Play the families against each other and stay mobile.", { diplomacy: 9, stealth: 4, luck: 2 }),
        c("Take the shortest profitable job and disappear.", { scavenging: 8, stealth: 3, diplomacy: 1 }),
        c("Attach yourself to the toughest faction and ride the wave.", { combat: 9, diplomacy: -3 }),
        c("Reject all of them and insult the city on the way out.", { luck: -2, combat: 2, diplomacy: -5 }),
      ]),
      q("fo2-vault-city", "Vault City security is sizing you up before you even reach the gate. You...", [
        c("Clean up, talk precise, and make yourself sound useful.", { diplomacy: 10, scavenging: 2 }),
        c("Learn the entry rules first so you do not trip them by accident.", { scavenging: 7, stealth: 3, diplomacy: 2 }),
        c("Bribe whoever looks underpaid and underappreciated.", { diplomacy: 6, luck: 4 }),
        c("Sneer at the arrogance and test your odds anyway.", { combat: 4, diplomacy: -6, luck: -1 }),
      ]),
      q("fo2-sierra-army-depot", "An old military site might have enough loot to change your whole run. You...", [
        c("Treat the place like every hallway wants you dead, because it does.", { scavenging: 9, stealth: 5 }),
        c("Let a technical companion lead while you secure the perimeter.", { scavenging: 8, combat: 4, diplomacy: 2 }),
        c("Grab whatever you can reach first and worry later.", { luck: 5, scavenging: -3, combat: 3 }),
        c("Walk in armed and loud to flush anything lurking out.", { combat: 10, stealth: -5 }),
      ]),
      q("fo2-enclave-rumor", "You hear a rumor about Enclave movement near a civilian route. You...", [
        c("Warn people quietly and stay out of the spotlight.", { diplomacy: 8, stealth: 5 }),
        c("Verify the rumor yourself before making anyone panic.", { scavenging: 7, stealth: 4, luck: 1 }),
        c("Set a hidden fallback route for the locals and move on.", { scavenging: 8, diplomacy: 3 }),
        c("Go hunting for proof in person with minimal backup.", { combat: 8, luck: -2, stealth: -1 }),
      ]),
      q("fo2-last-stop", "A thirsty settlement asks for medicine you could also use later. You...", [
        c("Trade some now for water, maps, and long-term goodwill.", { diplomacy: 9, scavenging: 4 }),
        c("Give it freely and trust karma to settle the account.", { diplomacy: 6, luck: 5 }),
        c("Keep it, but point them toward another option.", { scavenging: 5, diplomacy: 1 }),
        c("Use the leverage to extract everything you can.", { combat: 2, scavenging: 6, diplomacy: -5 }),
      ]),
    ],
    tactics: [
      q("tac-patrol", "Your squad spots raiders shadowing a convoy over broken overpasses. You...", [
        c("Set a disciplined crossfire and wait for the clean shot.", { combat: 10, stealth: 3 }),
        c("Scout every angle before you commit anyone.", { stealth: 9, combat: 4, scavenging: 2 }),
        c("Make radio contact with the convoy and coordinate a fallback lane.", { diplomacy: 7, combat: 4, scavenging: 2 }),
        c("Rush to break the raider momentum before they settle in.", { combat: 11, luck: -2, stealth: -2 }),
      ]),
      q("tac-bunker", "A Brotherhood bunker has power but not enough food for everyone nearby. You...", [
        c("Inventory first, emotions later, then ration like you mean it.", { scavenging: 10, diplomacy: 3 }),
        c("Negotiate access with the locals before panic sets in.", { diplomacy: 9, scavenging: 3 }),
        c("Send small teams to hunt for hidden reserves.", { stealth: 6, scavenging: 6, combat: 2 }),
        c("Lock it down and let authority solve the problem.", { combat: 5, diplomacy: -4, scavenging: 2 }),
      ]),
      q("tac-super-mutant", "A super mutant force is digging into a defensible ruin. You...", [
        c("Probe weak points and avoid their strongest line entirely.", { stealth: 9, combat: 4 }),
        c("Bring heavy support and hit one flank hard.", { combat: 10, scavenging: 2 }),
        c("Feed them false information and divide the patrols.", { diplomacy: 5, stealth: 6, luck: 2 }),
        c("Charge before they can fortify further.", { combat: 11, luck: -3, diplomacy: -2 }),
      ]),
      q("tac-town-briefing", "A frightened town needs clear orders more than inspiration. You...", [
        c("Give blunt instructions, assign roles, and repeat nothing twice.", { diplomacy: 8, scavenging: 4 }),
        c("Listen first so you do not issue orders that reality will mock.", { diplomacy: 9, luck: 2, scavenging: 2 }),
        c("Use your companion to keep morale up while you secure exits.", { diplomacy: 6, combat: 3, scavenging: 3 }),
        c("Keep the civilians out of it and handle the threat alone.", { combat: 5, diplomacy: -4, stealth: 1 }),
      ]),
      q("tac-train-yard", "A rail yard full of salvage may also be full of mines. You...", [
        c("Sweep methodically and claim only what you can carry safely.", { scavenging: 10, stealth: 3 }),
        c("Use an expendable route test before committing the whole team.", { scavenging: 7, combat: 1, luck: 2 }),
        c("Hit the obvious loot first and trust momentum.", { scavenging: 4, luck: 5, stealth: -3 }),
        c("Ignore the salvage and preserve readiness for bigger targets.", { combat: 3, scavenging: 2 }),
      ]),
      q("tac-ambassador", "A settlement leader offers a truce if the Brotherhood leaves one cache behind. You...", [
        c("Take the deal if it secures the road and preserves lives.", { diplomacy: 9, scavenging: 2 }),
        c("Counter with a joint defense pact and shared supply logs.", { diplomacy: 10, scavenging: 3 }),
        c("Smile, agree, and quietly relocate the best gear first.", { stealth: 7, scavenging: 6, diplomacy: -1 }),
        c("Reject the demand outright and prepare to hold by force.", { combat: 8, diplomacy: -5 }),
      ]),
      q("tac-rad-storm", "A rad storm is moving in faster than your maps suggested. You...", [
        c("Fall back to hardened cover and seal everything.", { scavenging: 8, combat: 1, diplomacy: 2 }),
        c("Use the storm as concealment for a risky movement window.", { stealth: 8, luck: 3, scavenging: -2 }),
        c("Push the objective anyway so the trip is worth the dose.", { combat: 6, scavenging: 2, luck: -1 }),
        c("Split the team to increase the chance that someone makes it.", { luck: 2, diplomacy: -4, stealth: 2 }),
      ]),
      q("tac-final-order", "Your companion disagrees with a clean but ruthless tactical choice. You...", [
        c("Pause and rework the plan so you keep both trust and the mission.", { diplomacy: 8, combat: 3 }),
        c("Hear them out, then keep the original plan if facts still support it.", { diplomacy: 6, scavenging: 2, combat: 4 }),
        c("Delegate the ugly part and spare both of you the argument.", { diplomacy: 3, stealth: 4, luck: 1 }),
        c("Shut it down. Orders are orders.", { combat: 5, diplomacy: -5 }),
      ]),
    ],
    fallout3: [
      q("fo3-super-duper", "You enter an old supermarket and hear raiders two aisles over. You...", [
        c("Shadow them, count them, and take only what they miss.", { stealth: 10, scavenging: 5 }),
        c("Create a distraction and leave with the best supplies.", { stealth: 8, luck: 3, scavenging: 4 }),
        c("Engage fast before they can surround you.", { combat: 10, diplomacy: -2 }),
        c("Withdraw and mark the place for a stronger return later.", { scavenging: 4, combat: -2, luck: 1 }),
      ]),
      q("fo3-megaton", "A town built around risk asks what kind of person you are. You...", [
        c("Make yourself useful before you make yourself famous.", { diplomacy: 8, scavenging: 4 }),
        c("Ask questions, learn alliances, and stay out of local feuds.", { diplomacy: 7, stealth: 3, luck: 2 }),
        c("Accept dangerous work for quick credibility.", { combat: 8, luck: 2 }),
        c("Tell everyone exactly what is wrong with the place.", { diplomacy: -5, combat: 1, luck: -1 }),
      ]),
      q("fo3-metro", "The metro tunnels are dark, wet, and full of reasons to keep moving. You...", [
        c("Move slow, lightless, and only where your hearing agrees.", { stealth: 10, luck: 1 }),
        c("Mark routes and salvage as you go so the trip pays twice.", { scavenging: 9, stealth: 2 }),
        c("Keep a steady pace and fight through whatever finds you.", { combat: 9, scavenging: 1 }),
        c("Rush to daylight and accept that mistakes may happen.", { luck: 4, stealth: -4 }),
      ]),
      q("fo3-project-purity", "A faction representative offers 'protection' in exchange for obedience. You...", [
        c("Ask what they cannot provide and price the gap honestly.", { diplomacy: 9, luck: 2 }),
        c("Pretend to cooperate while you find a safer back exit.", { stealth: 8, diplomacy: 4 }),
        c("Take the deal if it gets you near critical infrastructure.", { scavenging: 6, diplomacy: 3, combat: 1 }),
        c("Refuse loudly so nobody doubts where you stand.", { combat: 5, diplomacy: -6 }),
      ]),
      q("fo3-rivet-city", "Rivet City has answers, but every deck has eyes on newcomers. You...", [
        c("Play polite and let your curiosity look smaller than it is.", { diplomacy: 9, stealth: 2 }),
        c("Trade useful information before asking for any back.", { diplomacy: 8, luck: 2, scavenging: 2 }),
        c("Follow maintenance routes and look for what people hide.", { stealth: 8, scavenging: 5 }),
        c("Lean on intimidation if bureaucrats start stalling.", { combat: 5, diplomacy: -4 }),
      ]),
      q("fo3-potomac", "You need to cross contaminated water with limited RadAway. You...", [
        c("Search longer for higher ground and a cleaner route.", { scavenging: 8, stealth: 2 }),
        c("Use every anti-rad trick you have and move with purpose.", { scavenging: 7, luck: 2, combat: 1 }),
        c("Trust your body to take it and deal with the bill later.", { combat: 3, luck: 3, scavenging: -5 }),
        c("Send your companion into the worst of it first.", { combat: 2, diplomacy: -5, luck: 1 }),
      ]),
      q("fo3-ghoul-tunnels", "A ghoul settlement knows a safer route, but they do not trust smoothskin motives. You...", [
        c("Lead with respect and let them set the pace of the deal.", { diplomacy: 10, luck: 2 }),
        c("Offer medical or repair help before asking for anything.", { diplomacy: 8, scavenging: 4 }),
        c("Sneak around and take the route map without permission.", { stealth: 9, luck: -1, diplomacy: -3 }),
        c("Threaten your way through and keep your weapon visible.", { combat: 7, diplomacy: -6 }),
      ]),
      q("fo3-late-hope", "A kid asks if the wasteland ever gets better. You...", [
        c("Tell the truth, but give them something practical to hold onto.", { diplomacy: 8, scavenging: 3 }),
        c("Offer help instead of a speech and move the conversation forward.", { diplomacy: 7, combat: 1, scavenging: 2 }),
        c("Promise more than you know you can deliver.", { luck: 3, diplomacy: -2 }),
        c("Say hope gets people killed when they stop paying attention.", { combat: 1, diplomacy: -4, stealth: 1 }),
      ]),
    ],
    newvegas: [
      q("nv-legion-road", "You spot a Legion patrol before they spot you. You...", [
        c("Detour and stay invisible. Pride is not a build path.", { stealth: 11, luck: 2 }),
        c("Talk like you belong nearby and leave before the lie ages.", { diplomacy: 9, luck: 3 }),
        c("Set a trap from distance and keep your exit open.", { combat: 9, stealth: 4 }),
        c("Open fire immediately and trust superior nerve.", { combat: 10, diplomacy: -4, luck: -1 }),
      ]),
      q("nv-strip", "On the Strip, everyone wants something and most of them want it in caps. You...", [
        c("Use charm, patience, and a good read on ego.", { diplomacy: 10, luck: 4 }),
        c("Play the tables only if the odds and your nerves agree.", { luck: 9, diplomacy: 2 }),
        c("Work the service corridors where the real secrets travel.", { stealth: 9, scavenging: 4 }),
        c("Flash your weapon just enough to cut the line.", { combat: 4, diplomacy: -5 }),
      ]),
      q("nv-freeside", "Freeside asks whether you are generous, dangerous, or both. You...", [
        c("Trade help for information and stay on good terms with locals.", { diplomacy: 9, scavenging: 4 }),
        c("Blend into the crowds and watch who controls what.", { stealth: 8, diplomacy: 3, luck: 2 }),
        c("Hire temporary muscle and force clean passage.", { combat: 8, luck: 1 }),
        c("Keep your supplies tight and trust nobody with a sob story.", { scavenging: 5, diplomacy: -2 }),
      ]),
      q("nv-vault", "An old vault promises loot, trauma, and maybe a working terminal. You...", [
        c("Enter like every room is a puzzle trying to kill you.", { scavenging: 10, stealth: 4 }),
        c("Bring the right companion and let expertise lead.", { scavenging: 8, diplomacy: 3, combat: 2 }),
        c("Go fast so you do not overthink the horrors.", { luck: 5, combat: 3, scavenging: -4 }),
        c("Skip it. The Mojave has plenty of ways to die without volunteering.", { combat: -1, scavenging: 2, luck: 1 }),
      ]),
      q("nv-ncr", "An NCR officer assumes you want to help because everyone eventually does. You...", [
        c("Take the job if it buys future leverage and access.", { diplomacy: 8, scavenging: 3, luck: 2 }),
        c("Ask who benefits, who pays, and who gets buried first.", { diplomacy: 9, luck: 2 }),
        c("Agree publicly and keep your private options open.", { stealth: 7, diplomacy: 4, luck: 2 }),
        c("Reject the chain of command on principle.", { combat: 3, diplomacy: -5, luck: -1 }),
      ]),
      q("nv-desert-night", "You can see lights from a camp that may be friendly, rich, or dead by morning. You...", [
        c("Observe the pattern first. Camp discipline tells the truth fast.", { stealth: 10, scavenging: 2 }),
        c("Approach with a trade angle and a believable story.", { diplomacy: 8, luck: 3 }),
        c("Skim the perimeter for unattended supplies only.", { stealth: 8, scavenging: 5, diplomacy: -2 }),
        c("Take the initiative and decide the encounter on your terms.", { combat: 9, luck: -1, diplomacy: -4 }),
      ]),
      q("nv-silver-rush", "A high-value energy cache is on the line and somebody else is already circling. You...", [
        c("Negotiate partial access while they still think you are reasonable.", { diplomacy: 9, scavenging: 3 }),
        c("Slip around back and steal the best piece, not the whole pile.", { stealth: 10, scavenging: 4 }),
        c("Set up overwatch and turn it into a clean contest of aim.", { combat: 10, stealth: 2 }),
        c("Walk away. Greed writes too many Vegas obituaries.", { scavenging: 3, luck: 1 }),
      ]),
      q("nv-hoover", "A major battle is building and everyone wants your loyalty today. You...", [
        c("Commit only where your principles and odds briefly align.", { diplomacy: 8, combat: 3, luck: 2 }),
        c("Use the chaos to protect the people who cannot leave.", { diplomacy: 7, scavenging: 4, combat: 2 }),
        c("Back the side that lets you keep the most freedom after the smoke clears.", { luck: 7, diplomacy: 4 }),
        c("Chase personal glory. History remembers names, not hesitation.", { combat: 8, diplomacy: -4, luck: -1 }),
      ]),
    ],
    fallout4: [
      q("fo4-settlement", "You find an abandoned settlement with a working recruitment beacon. You...", [
        c("Claim it, fortify it, and build a safe fallback point.", { scavenging: 10, diplomacy: 5, combat: 2 }),
        c("Strip the essentials and leave before it becomes your problem.", { scavenging: 7, stealth: 2, diplomacy: -1 }),
        c("Ignore it. Empty places in the Commonwealth rarely stay empty.", { stealth: 3, luck: 1 }),
        c("Turn it into a trap for whoever comes investigating.", { combat: 8, stealth: 5, diplomacy: -4 }),
      ]),
      q("fo4-corvega", "A raider nest controls nearby supply lines. You...", [
        c("Scout the exits, then dismantle them piece by piece.", { stealth: 10, combat: 4 }),
        c("Rally local help so the cleanup actually sticks.", { diplomacy: 8, combat: 4, scavenging: 2 }),
        c("Hit the leader hard and trust the rest to scatter.", { combat: 10, luck: 1 }),
        c("Avoid the whole mess and route around the danger.", { scavenging: 4, stealth: 2, diplomacy: -1 }),
      ]),
      q("fo4-institute-rumor", "Someone claims to know how to spot synth replacements. You...", [
        c("Ask for proof before you let paranoia write policy.", { diplomacy: 9, scavenging: 3 }),
        c("Collect quiet patterns and test the rumor against evidence.", { scavenging: 8, stealth: 4, luck: 1 }),
        c("Use the rumor to smoke out who benefits from panic.", { diplomacy: 8, stealth: 3, luck: 2 }),
        c("Assume the worst and act before anyone can disappear.", { combat: 5, diplomacy: -5, luck: -1 }),
      ]),
      q("fo4-glowing-sea", "A necessary route pushes you toward the Glowing Sea. You...", [
        c("Overprepare, overpack, and leave only when the numbers make sense.", { scavenging: 10, combat: 1 }),
        c("Take the fastest route with a rad-hardened companion.", { combat: 4, luck: 3, scavenging: 4 }),
        c("Detour through worse human territory to avoid the rads.", { stealth: 6, diplomacy: 2, scavenging: 2 }),
        c("Trust grit and adrenaline more than planning.", { combat: 4, luck: 4, scavenging: -5 }),
      ]),
      q("fo4-diamond-city", "Diamond City offers commerce, gossip, and politics in equal measure. You...", [
        c("Work the market first. Traders know the pulse before officials do.", { diplomacy: 8, scavenging: 5 }),
        c("Charm your way into guarded conversations.", { diplomacy: 10, luck: 2 }),
        c("Use back routes and maintenance talk to learn what is hidden.", { stealth: 8, scavenging: 5 }),
        c("Push for answers publicly and dare them to stop you.", { combat: 4, diplomacy: -5 }),
      ]),
      q("fo4-faction-choice", "Two factions both offer safety, but each expects loyalty later. You...", [
        c("Delay commitment until one proves it can actually protect people.", { diplomacy: 9, luck: 2 }),
        c("Join the side that best fits your companion and build style.", { diplomacy: 6, combat: 3, scavenging: 2 }),
        c("Play both angles while keeping your own exit route open.", { stealth: 8, diplomacy: 3, luck: 3 }),
        c("Take the strongest armor and stop worrying about nuance.", { combat: 8, diplomacy: -4 }),
      ]),
      q("fo4-commonwealth-night", "You hear distant gunfire while carrying valuable salvage home. You...", [
        c("Cache the gear, scout the fight, then decide if it is worth it.", { scavenging: 9, stealth: 4 }),
        c("Keep moving. Surviving the night matters more than curiosity.", { stealth: 7, luck: 2 }),
        c("Move in carefully. The winner may also be weak and loaded.", { combat: 7, stealth: 4, luck: 1 }),
        c("Charge in. Anybody alive enough to shoot is a threat.", { combat: 9, diplomacy: -3, luck: -1 }),
      ]),
      q("fo4-trust-test", "A settler insists their missing relative was taken by synths. You...", [
        c("Investigate patiently so grief does not become a firing squad.", { diplomacy: 10, scavenging: 3 }),
        c("Offer protection first and answers second.", { diplomacy: 7, combat: 3, scavenging: 1 }),
        c("Use the rumor to quietly watch suspicious actors nearby.", { stealth: 8, diplomacy: 2, luck: 2 }),
        c("Arm the settler and prepare for the worst immediately.", { combat: 7, diplomacy: -5 }),
      ]),
    ],
    fallout76: [
      q("fo76-camp", "You find a good CAMP site with water, cover, and suspiciously recent footprints. You...", [
        c("Set up light, defensible infrastructure and keep escape options.", { scavenging: 10, stealth: 3, combat: 2 }),
        c("Use the spot temporarily, then move before anyone claims it.", { stealth: 8, scavenging: 4, luck: 2 }),
        c("Broadcast friendly intent and hope cooperation beats conflict.", { diplomacy: 8, luck: 3 }),
        c("Trap the perimeter and dare trouble to test it.", { combat: 8, stealth: 4, diplomacy: -3 }),
      ]),
      q("fo76-scorched", "A scorched cluster blocks access to a rare material vein. You...", [
        c("Cull from range and keep the fight clean.", { combat: 9, stealth: 3 }),
        c("Lure them away from the site before you harvest anything.", { stealth: 9, scavenging: 4 }),
        c("Call in help and split the reward fairly.", { diplomacy: 7, combat: 4, scavenging: 2 }),
        c("Dash in fast, mine what you can, and trust your legs.", { luck: 6, scavenging: 3, combat: -1 }),
      ]),
      q("fo76-responder", "An old Responder cache may still hold medical gear. You...", [
        c("Preserve the site carefully and log what you take.", { scavenging: 10, diplomacy: 2 }),
        c("Take only what you need and leave guidance for others.", { diplomacy: 8, scavenging: 4 }),
        c("Grab every useful thing before someone else does.", { scavenging: 7, luck: 3, diplomacy: -2 }),
        c("Ignore it. Nostalgia is heavy and bullets are faster.", { combat: 1, scavenging: -1 }),
      ]),
      q("fo76-rad-forest", "A rad-heavy forest path is faster, but the air tastes like regret. You...", [
        c("Prep consumables and move with a strict timer.", { scavenging: 9, combat: 1, luck: 2 }),
        c("Find elevation and avoid the densest pockets entirely.", { stealth: 7, scavenging: 5 }),
        c("Push through fast with your companion watching for trouble.", { combat: 3, scavenging: 4, luck: 3 }),
        c("Save resources and trust your body to absorb the hit.", { luck: 2, scavenging: -5, combat: 1 }),
      ]),
      q("fo76-player-encounter", "A stranger in power armor emotes peace and drops supplies at your feet. You...", [
        c("Accept the gift, but stay alert and keep distance.", { diplomacy: 8, luck: 3, stealth: 2 }),
        c("Offer a fair trade back. Reciprocity keeps weirdness manageable.", { diplomacy: 9, scavenging: 3 }),
        c("Track them discreetly to learn what they are really doing.", { stealth: 8, luck: 2, diplomacy: -1 }),
        c("Assume bait and shoot first.", { combat: 7, diplomacy: -6 }),
      ]),
      q("fo76-mine-shaft", "A collapsed mine might hold fuel cores and definitely holds problems. You...", [
        c("Map the structural risks before chasing the prize.", { scavenging: 10, stealth: 2 }),
        c("Bring the right tools and make it a slow salvage run.", { scavenging: 9, combat: 1, diplomacy: 1 }),
        c("Follow any fresh tracks. If someone got in, maybe you can too.", { stealth: 6, luck: 4, scavenging: 1 }),
        c("Force the collapse wider and loot whatever survives.", { combat: 5, scavenging: -3, luck: -1 }),
      ]),
      q("fo76-faction", "A faction wants your help restoring order, but your CAMP would be exposed while you are gone. You...", [
        c("Help if they offer a meaningful security exchange.", { diplomacy: 8, scavenging: 3, combat: 2 }),
        c("Strengthen home first. Dead heroes own nice ruins.", { scavenging: 8, combat: 2 }),
        c("Use the job to build future trade routes, not just goodwill.", { diplomacy: 7, scavenging: 5 }),
        c("Take the biggest reward now and ignore the longer term.", { luck: 5, diplomacy: -2, scavenging: -1 }),
      ]),
      q("fo76-final-light", "A campfire conversation turns toward what comes after survival. You...", [
        c("Talk about rebuilding through habits, not speeches.", { diplomacy: 8, scavenging: 4 }),
        c("Listen more than you talk. Useful people reveal themselves in quiet.", { diplomacy: 6, luck: 3, stealth: 2 }),
        c("Keep morale high with optimism and forward momentum.", { diplomacy: 7, luck: 4 }),
        c("Cut the sentiment and focus only on tomorrow's threats.", { combat: 2, diplomacy: -3, scavenging: 1 }),
      ]),
    ],
    tvshow: [
      q("tv-water-deal", "Surface raiders offer you water in exchange for your Vault suit. You...", [
        c("Negotiate for water, time, and a less terrible deal.", { diplomacy: 9, luck: 3 }),
        c("Pretend to agree while you look for a cleaner exit.", { stealth: 9, diplomacy: 3, luck: 2 }),
        c("Fight if you must, but only after positioning yourself.", { combat: 8, stealth: 2 }),
        c("Run first. Pride does not hydrate you.", { stealth: 6, luck: 2, combat: -1 }),
      ]),
      q("tv-vault-illusion", "A cheerful stranger speaks like a vault commercial and asks where you're from. You...", [
        c("Answer nothing useful and let them keep underestimating you.", { diplomacy: 8, stealth: 4 }),
        c("Smile, redirect, and gather more than you give.", { diplomacy: 9, luck: 2 }),
        c("Invent a new story on the spot and commit hard.", { luck: 8, diplomacy: 4, scavenging: -1 }),
        c("Tell the truth and hope decency still exists up here.", { diplomacy: 3, luck: -3 }),
      ]),
      q("tv-filthy-crossing", "You need to cross a zone littered with bodies, rumors, and radiation. You...", [
        c("Gear up properly and move with clinical focus.", { scavenging: 10, combat: 1 }),
        c("Shadow someone else's route and learn from their mistakes.", { stealth: 9, scavenging: 3, luck: 2 }),
        c("Follow your companion's instincts if they know the surface better.", { diplomacy: 5, luck: 3, combat: 2 }),
        c("Push through on adrenaline before fear roots you in place.", { combat: 4, luck: 4, scavenging: -5 }),
      ]),
      q("tv-brotherhood", "A Brotherhood figure offers safety wrapped in obedience. You...", [
        c("Take the protection only if you can keep personal leverage.", { diplomacy: 8, luck: 2, combat: 2 }),
        c("Play compliant while you test how expendable you really are.", { stealth: 8, diplomacy: 4 }),
        c("Decline, but leave the conversation friendly enough to survive it.", { diplomacy: 9, combat: -1 }),
        c("Mock the pageantry and dare them to react.", { combat: 5, diplomacy: -6 }),
      ]),
      q("tv-bounty", "A bounty target may also be the only person who can guide you forward. You...", [
        c("Hear them out before you decide what they are worth.", { diplomacy: 9, luck: 2 }),
        c("Keep them alive, restrained, and useful until the road says otherwise.", { combat: 5, diplomacy: 4, stealth: 2 }),
        c("Use them as bait to see who else emerges.", { stealth: 8, combat: 3, diplomacy: -2 }),
        c("Collect the reward cleanly and move on.", { combat: 7, scavenging: 2, diplomacy: -4 }),
      ]),
      q("tv-market", "A ramshackle market offers meds, ammo, and smiles with too many teeth. You...", [
        c("Compare stories, compare prices, and spot the pressure points.", { diplomacy: 9, scavenging: 4 }),
        c("Send your companion to browse while you watch reactions.", { diplomacy: 5, stealth: 5, luck: 2 }),
        c("Buy only the essentials and leave before attention hardens.", { scavenging: 6, stealth: 3 }),
        c("Try to out-intimidate a market built on intimidation.", { combat: 6, diplomacy: -5 }),
      ]),
      q("tv-hound", "Your companion warns you that a 'safe' camp smells wrong. You...", [
        c("Trust the warning and relocate even if it costs comfort.", { luck: 5, stealth: 7, scavenging: 2 }),
        c("Observe from a distance until the camp reveals itself.", { stealth: 10, luck: 2 }),
        c("Enter cautiously but leave one clean exit open.", { combat: 4, stealth: 4, diplomacy: 2 }),
        c("Ignore the nerves. You need rest more than theories.", { scavenging: 2, luck: -3, stealth: -2 }),
      ]),
      q("tv-final-mercy", "A wounded stranger begs for help in a place where mercy gets audited. You...", [
        c("Help carefully, but keep control of the encounter.", { diplomacy: 9, combat: 2, scavenging: 1 }),
        c("Offer supplies from a distance and do not linger.", { diplomacy: 7, stealth: 3, scavenging: 2 }),
        c("Use the moment to learn who else is nearby before committing.", { stealth: 8, diplomacy: 3, luck: 2 }),
        c("Walk away. The surface eats the kindest people first.", { scavenging: 2, diplomacy: -4, luck: 1 }),
      ]),
    ],
  };

  const DEATH_CAUSE_RULES = [
    { id: "raiders", label: "Raiders / Faction Violence", color: "#ff9000" },
    { id: "radiation", label: "Radiation / Disease", color: "#ffbf69" },
    { id: "starvation", label: "Starvation / Exposure", color: "#ffd9a3" },
    { id: "betrayal", label: "Companion Betrayal / Infighting", color: "#c96f00" },
    { id: "random", label: "Random Encounter Gone Wrong", color: "#7c4700" },
  ];

  const VERDICT_TEMPLATES = {
    scoreBands: [
      { max: 24, intro: "You are not built for a long romance with the wasteland." },
      { max: 44, intro: "You have just enough to be dangerous, and just enough blind spots to make that expensive." },
      { max: 64, intro: "You are built like someone who could survive, provided you stop the wasteland from choosing the terms." },
      { max: 84, intro: "You look genuinely hard to kill if you stay honest about what kind of survivor you are." },
      { max: 99, intro: "You are operating in the rare band where the wasteland has to work for the kill." },
    ],
    tones: {
      grim: "The old world is gone and the new one does not care about your intentions.",
      wild: "This is a wasteland where absurdity and brutality keep sharing a canteen.",
      military: "Structure helps, but it also turns hesitation into a tactical liability.",
      bleak: "The Capital Wasteland punishes carelessness and rewards stubborn, ugly persistence.",
      swagger: "The Mojave loves nerve, but it loves consequences just as much.",
      rebuild: "The Commonwealth gives survivors a rare shot at building something, then tests whether they deserve it.",
      frontier: "Appalachia rewards people who can make community and caution coexist.",
      brutal: "This version of the surface strips optimism for parts if you do not harden it first.",
    },
    archetypes: {
      combat: "You solve danger decisively, which works right up until patience would have paid more.",
      stealth: "Your best instinct is to avoid becoming the loudest thing in the room.",
      diplomacy: "You survive by reading motives before you read weapons.",
      scavenging: "You understand that food, medicine, and spare parts win more weeks than speeches ever will.",
      luck: "Your whole run carries a gambler's energy that can feel brilliant or terminal.",
    },
    recommendations: {
      raiders: "Stock extra ammo, keep two exits in mind, and never let a proud entrance become your obituary.",
      radiation: "Carry anti-rad supplies like they are religion and do not let urgency bully your route planning.",
      starvation: "Build reserves before you need them and treat every safe bed like a strategic asset.",
      betrayal: "Choose your allies slower, communicate clearer, and do not outsource your judgment to charisma.",
      random: "Scout first, trust your weird feelings, and assume coincidence is just ambush wearing a different hat.",
    },
  };

  const SCENARIO_GROUP_LABELS = Object.fromEntries(SCENARIOS.map((scenario) => [scenario.id, scenario.label]));

  const SEX_OPTIONS = [
    { id: "male", label: "Male", scoreMultiplier: 1.0, description: "Built for blunt strength and endurance." },
    { id: "female", label: "Female", scoreMultiplier: 1.08, description: "Built for better instinct, adaptation, and long-term survival." },
  ];

  const TRAITS = [
    { id: "fast-metabolism", label: "Fast Metabolism", description: "You recover faster, but hunger hits harder.", effects: { scoreDelta: 4, bucketDeltas: { scavenging: 2 }, vulnerabilities: { starvation: 10 } } },
    { id: "heavy-hitter", label: "Heavy Hitter", description: "Your blows land harder, but you move less gracefully.", effects: { scoreDelta: 5, bucketDeltas: { combat: 3 }, vulnerabilities: { random: 5 } } },
    { id: "scholar", label: "Scholar", description: "Knowledge serves you well, but it does not stop bullets.", effects: { scoreDelta: 3, bucketDeltas: { diplomacy: 3, scavenging: 1 }, vulnerabilities: { raiders: 6 } } },
    { id: "cold-blooded", label: "Cold-Blooded", description: "You make hard choices without emotion, but relationships suffer.", effects: { scoreDelta: 4, bucketDeltas: { combat: 2, luck: 1 }, vulnerabilities: { betrayal: 8 } } },
    { id: "survivalist", label: "Survivalist", description: "You adapt to the wild, but you are less flashy in social encounters.", effects: { scoreDelta: 4, bucketDeltas: { scavenging: 4, endurance: 0 }, vulnerabilities: { diplomacy: 6 } } },
    { id: "charmer", label: "Charmer", description: "People want to help you, but you take more social risks.", effects: { scoreDelta: 4, bucketDeltas: { diplomacy: 4, luck: 1 }, vulnerabilities: { raiders: 5 } } },
  ];

  const INVENTORY_ITEMS = [
    { id: "med-kit", label: "Med Kit", description: "Stabilizes injuries quickly, but it is heavy and rare.", effects: { scoreDelta: 5, bucketDeltas: { endurance: 1 }, vulnerabilities: { starvation: 4 } } },
    { id: "lockpick-set", label: "Lockpick Set", description: "More routes open up, but you lose time in fights.", effects: { scoreDelta: 3, bucketDeltas: { stealth: 2, scavenging: 2 }, vulnerabilities: { raiders: 3 } } },
    { id: "homemade-rations", label: "Homemade Rations", description: "Food lasts longer, but it weighs you down.", effects: { scoreDelta: 4, bucketDeltas: { scavenging: 3 }, vulnerabilities: { agility: 2 } } },
    { id: "compact-firearm", label: "Compact Firearm", description: "Reliable when it counts, but ammunition is scarce.", effects: { scoreDelta: 5, bucketDeltas: { combat: 3 }, vulnerabilities: { starvation: 5 } } },
    { id: "rad-resistance-serum", label: "Rad Resistance Serum", description: "Reduces radiation risk, but it is volatile.", effects: { scoreDelta: 4, bucketDeltas: { luck: 2 }, vulnerabilities: { random: 4 } } },
    { id: "old-world-map", label: "Old World Map", description: "You can avoid bad ground, but enemies may still ambush you.", effects: { scoreDelta: 3, bucketDeltas: { diplomacy: 2, scavenging: 2 }, vulnerabilities: { raiders: 5 } } },
    { id: "rebreather", label: "Rebreather", description: "Breathing gear keeps you safe in toxins, but it is fragile.", effects: { scoreDelta: 5, bucketDeltas: { endurance: 2 }, vulnerabilities: { radiation: 8 } } },
    { id: "adrenaline-shot", label: "Adrenaline Shot", description: "A surge of energy in danger, but it wears off quickly.", effects: { scoreDelta: 4, bucketDeltas: { combat: 2, agility: 2 }, vulnerabilities: { random: 6 } } },
    { id: "radio-beacon", label: "Radio Beacon", description: "You can call allies, but it draws attention.", effects: { scoreDelta: 3, bucketDeltas: { diplomacy: 3 }, vulnerabilities: { raiders: 6 } } },
    { id: "steel-dog-tag", label: "Steel Dog Tag", description: "A small morale boost, but it adds no real protection.", effects: { scoreDelta: 2, bucketDeltas: { luck: 2 }, vulnerabilities: { random: 2 } } },
  ];

  const SHARED_QUESTIONS = [
    q("shared-water", "You find a leaking water container near an old camp. You...", [
      c("Seal the leak and ration it while you scout for cleaner sources.", { scavenging: 8, luck: 2 }),
      c("Drink what you can now and move fast before it empties.", { endurance: 6, luck: 1, combat: -2 }),
      c("Booby-trap the container and leave it to slow anybody who follows.", { stealth: 6, diplomacy: -3, luck: 1 }),
      c("Ignore it to avoid the risk of contamination.", { scavenging: -2, diplomacy: 2, luck: 1 }),
    ]),
    q("shared-raid-spot", "A convoy crosses a narrow pass ahead. You...", [
      c("Lay in wait and ambush them with your best cover.", { combat: 9, stealth: 3, diplomacy: -4 }),
      c("Use a diversion and take only what you need.", { stealth: 7, scavenging: 5, luck: 1 }),
      c("Signal them and try to trade for safe passage.", { diplomacy: 8, luck: 2, combat: -3 }),
      c("Avoid them entirely and take the longer route.", { scavenging: 3, endurance: 2, luck: -1 }),
    ]),
    q("shared-rad-zone", "Radiation haze bleeds across the road. You...", [
      c("Suit up and sprint through it at maximum speed.", { agility: 7, endurance: 2, diplomacy: -2 }),
      c("Go around using the long safe route.", { scavenging: 4, diplomacy: 2, luck: -1 }),
      c("Wait for the storm to pass, even if it costs time.", { endurance: 6, luck: 1, combat: -2 }),
      c("Use a risky shortcut and hope the gear holds.", { luck: 6, scavenging: 2, endurance: -3 }),
    ]),
    q("shared-settlement", "A small settlement offers shelter for a price. You...", [
      c("Pay the price and build a short-term alliance.", { diplomacy: 8, luck: 2, combat: -2 }),
      c("Sneak in under cover of night.", { stealth: 9, scavenging: 3, diplomacy: -4 }),
      c("Barter supplies for shelter and information.", { diplomacy: 7, scavenging: 4, endurance: 1 }),
      c("Keep moving; settling attracts trouble.", { luck: 3, endurance: 4, diplomacy: -2 }),
    ]),
    q("shared-bridge", "The only bridge across a river is half collapsed. You...", [
      c("Rebuild enough of it to cross slowly.", { scavenging: 7, diplomacy: 2, endurance: 2 }),
      c("Find a ford and wade through.", { endurance: 8, luck: 1, combat: -2 }),
      c("Use explosives to clear a safe path.", { combat: 6, luck: 2, diplomacy: -3 }),
      c("Turn back and take a safer detour.", { scavenging: 5, luck: -1, diplomacy: 1 }),
    ]),
  ];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function slugify(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function sumValues(object) {
    return Object.values(object).reduce((total, value) => total + value, 0);
  }

  function normalizeBuckets(buckets) {
    const normalized = {};
    for (const category of CATEGORIES) {
      normalized[category] = clamp(Math.round(buckets[category] || 0), 0, 100);
    }
    return normalized;
  }

  function buildDefaultState(config = {}) {
    const stats = Object.fromEntries(SPECIAL_STATS.map((stat) => [stat.id, stat.baseValue]));
    return {
      currentStep: 1,
      character: { name: "", age: 25, sex: "male" },
      stats,
      scenarioId: config.defaultScenario && getScenarioById(config.defaultScenario) ? config.defaultScenario : DEFAULT_CONFIG.defaultScenario,
      traits: [],
      companionId: "",
      inventory: [],
      answers: {},
      companionFilter: "",
      showMath: false,
      flash: "",
    };
  }

  function isPristineState(state) {
    if (!state) return false;
    if (state.traits && state.traits.length > 0) return false;
    if (state.companionId) return false;
    if (state.inventory && state.inventory.length > 0) return false;
    if (state.character?.name) return false;
    if (state.character?.age && Number(state.character.age) !== 25) return false;
    if (state.character?.sex !== "male") return false;
    // Treat an answers object that only contains zeros as still pristine
    const ansKeys = Object.keys(state.answers || {});
    if (ansKeys.length > 0) {
      const anyNonZero = ansKeys.some((k) => Number(state.answers[k]) !== 0);
      if (anyNonZero) return false;
    }
    if (state.currentStep !== 1) return false;
    for (const stat of SPECIAL_STATS) {
      if (state.stats[stat.id] !== stat.baseValue) return false;
    }
    return true;
  }

  function getScenarioById(id) {
    return SCENARIOS.find((scenario) => scenario.id === id) || null;
  }

  function getCompanionById(id) {
    return COMPANIONS.find((companion) => companion.id === id) || null;
  }

  function getTraitById(id) {
    return TRAITS.find((trait) => trait.id === id) || null;
  }

  function getItemById(id) {
    return INVENTORY_ITEMS.find((item) => item.id === id) || null;
  }

  function getQuestionSet(scenarioId) {
    return QUESTION_SETS[scenarioId] || [];
  }

  function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function pickStableIndexes(seed, count, max) {
    const indexes = [];
    let value = hashString(seed);
    while (indexes.length < count && indexes.length < max) {
      const next = value % max;
      if (!indexes.includes(next)) indexes.push(next);
      value = hashString(`${value}-${seed}`);
    }
    return indexes;
  }

  function getActiveQuestionSet(state) {
    const scenarioQuestions = getQuestionSet(state.scenarioId);
    const scenarioCount = Math.min(4, scenarioQuestions.length);
    const scenarioIndexes = pickStableIndexes(`${state.scenarioId}:${state.character.sex}:scenario`, scenarioCount, scenarioQuestions.length);
    const sharedIndexes = pickStableIndexes(`${state.scenarioId}:${state.character.sex}:shared`, 2, SHARED_QUESTIONS.length);
    return [
      ...scenarioIndexes.map((index) => scenarioQuestions[index]),
      ...sharedIndexes.map((index) => SHARED_QUESTIONS[index]),
    ].filter(Boolean);
  }

  function getRemainingSpecialPoints(stats) {
    return 45 - sumValues(stats);
  }

  function getQuestionAnswerCount(state) {
    return getActiveQuestionSet(state).filter((question) => typeof state.answers[question.id] === "number").length;
  }

  function isStepOneValid(state) {
    const nameValid = String(state.character?.name || "").trim().length > 0;
    const age = Number(state.character?.age) || 0;
    const ageValid = age >= 18 && age <= 75;
    const sexValid = state.character?.sex === "male" || state.character?.sex === "female";
    const scenarioValid = Boolean(getScenarioById(state.scenarioId));
    const statsValid = getRemainingSpecialPoints(state.stats) === 0;
    const traitsValid = Array.isArray(state.traits) && state.traits.length === 2;
    return nameValid && ageValid && sexValid && scenarioValid && statsValid && traitsValid;
  }

  function isStepTwoValid(state) {
    const companionValid = Boolean(getCompanionById(state.companionId));
    const inventoryValid = Array.isArray(state.inventory) && state.inventory.length === 2;
    const questionsValid = getQuestionAnswerCount(state) === getActiveQuestionSet(state).length;
    return companionValid && inventoryValid && questionsValid;
  }

  function isStepThreeValid(state) {
    return true;
  }

  function getHighestStat(state) {
    return SPECIAL_STATS.slice().sort((a, b) => state.stats[b.id] - state.stats[a.id])[0];
  }

  function getLowestStat(state) {
    return SPECIAL_STATS.slice().sort((a, b) => state.stats[a.id] - state.stats[b.id])[0];
  }

  function getScoreBand(score) {
    return VERDICT_TEMPLATES.scoreBands.find((band) => score <= band.max) || VERDICT_TEMPLATES.scoreBands[VERDICT_TEMPLATES.scoreBands.length - 1];
  }

  function pickBestCategory(buckets) {
    return CATEGORIES.slice().sort((a, b) => buckets[b] - buckets[a])[0];
  }

  function pickWorstCategory(buckets) {
    return CATEGORIES.slice().sort((a, b) => buckets[a] - buckets[b])[0];
  }

  function mergeBucketDeltas(target, source, scale = 1) {
    if (!source) {
      return target;
    }
    for (const category of CATEGORIES) {
      if (typeof source[category] === "number") {
        target[category] += source[category] * scale;
      }
    }
    return target;
  }

  function calculateBaseStatScore(stats) {
    const totalWeight = SPECIAL_STATS.reduce((sum, stat) => sum + stat.weight, 0);
    const weightedTotal = SPECIAL_STATS.reduce((sum, stat) => sum + stats[stat.id] * stat.weight, 0);
    // Map average SPECIAL so that the default build (~5 average) centers on a more punishing 45%.
    // Using divisor 9 makes average 5 => ~44.4, while still mapping 1->0 and 10->~100 (clamped).
    return clamp((((weightedTotal / totalWeight) - 1) / 9) * 100, 0, 100);
  }

  function calculateBuildBuckets(stats) {
    const raw = {
      combat: stats.strength * 2.2 + stats.endurance * 2.1 + stats.agility * 1.2 + stats.perception * 0.8,
      stealth: stats.agility * 2.3 + stats.perception * 1.9 + stats.luck * 1.2 + stats.intelligence * 0.7,
      diplomacy: stats.charisma * 2.5 + stats.intelligence * 1.4 + stats.perception * 0.8 + stats.luck * 0.7,
      scavenging: stats.intelligence * 2.2 + stats.perception * 1.6 + stats.endurance * 1.1 + stats.agility * 0.8,
      luck: stats.luck * 2.8 + stats.perception * 0.8 + stats.charisma * 0.7,
    };
    const max = {
      combat: 63,
      stealth: 61,
      diplomacy: 54,
      scavenging: 57,
      luck: 43,
    };
    const normalized = {};
    for (const category of CATEGORIES) {
      normalized[category] = clamp(Math.round((raw[category] / max[category]) * 100), 0, 100);
    }
    return normalized;
  }


  function calculateCompanionEffects(state) {
    const companion = getCompanionById(state.companionId);
    const scenario = getScenarioById(state.scenarioId);
    const bucketDeltas = { combat: 0, stealth: 0, diplomacy: 0, scavenging: 0, luck: 0 };
    if (!companion || !scenario) {
      return { scoreDelta: 0, bucketDeltas, trustModifier: 1, synergyNote: "No companion selected yet.", specialFlavor: "", sameWorld: false };
    }
    mergeBucketDeltas(bucketDeltas, companion.baseEffects.bucketDeltas);
    let scoreDelta = companion.baseEffects.scoreDelta || 0;
    const sameWorld = companion.originScenario === state.scenarioId || companion.tags.includes("dogmeat");
    let trustModifier = sameWorld ? 1.08 : 0.85;
    if (sameWorld) {
      scoreDelta += 6;
    } else {
      scoreDelta -= 3;
      bucketDeltas.diplomacy -= 8;
    }
    let specialFlavor = sameWorld ? `${companion.label} feels native to this run, which boosts trust and follow-through.` : `${companion.label} comes from another wasteland, so trust starts at a deficit.`;
    if (companion.specialRules?.dogmeat) {
      bucketDeltas.stealth += 5;
      bucketDeltas.scavenging += 3;
      bucketDeltas.luck += 4;
      scoreDelta += 4;
      specialFlavor = `${companion.label} gives you an excellent scouting edge and a real instinct boost.`;
    }
    if (state.scenarioId === "tvshow" && companion.originScenario === "tvshow") {
      scoreDelta += 3;
      bucketDeltas.luck += 2;
      specialFlavor += " In the TV wasteland, shared surface instincts matter immediately.";
    }
    return { scoreDelta, bucketDeltas, trustModifier, synergyNote: companion.specialRules?.note || "", specialFlavor, sameWorld };
  }

  function calculateTraitEffects(state) {
    const scoreDelta = (state.traits || []).reduce((sum, traitId) => {
      const trait = getTraitById(traitId);
      return sum + (trait?.effects?.scoreDelta || 0);
    }, 0);
    const bucketDeltas = { combat: 0, stealth: 0, diplomacy: 0, scavenging: 0, luck: 0 };
    const deathMods = { raiders: 0, radiation: 0, starvation: 0, betrayal: 0, random: 0 };
    for (const traitId of state.traits || []) {
      const trait = getTraitById(traitId);
      if (!trait) continue;
      mergeBucketDeltas(bucketDeltas, trait.effects.bucketDeltas);
      if (trait.effects.vulnerabilities) {
        for (const cause of Object.keys(deathMods)) {
          deathMods[cause] += trait.effects.vulnerabilities[cause] || 0;
        }
      }
    }
    return { scoreDelta, bucketDeltas, deathMods };
  }

  function calculateInventoryEffects(state) {
    const scoreDelta = (state.inventory || []).reduce((sum, itemId) => {
      const item = getItemById(itemId);
      return sum + (item?.effects?.scoreDelta || 0);
    }, 0);
    const bucketDeltas = { combat: 0, stealth: 0, diplomacy: 0, scavenging: 0, luck: 0 };
    const deathMods = { raiders: 0, radiation: 0, starvation: 0, betrayal: 0, random: 0 };
    for (const itemId of state.inventory || []) {
      const item = getItemById(itemId);
      if (!item) continue;
      mergeBucketDeltas(bucketDeltas, item.effects.bucketDeltas);
      if (item.effects.vulnerabilities) {
        for (const cause of Object.keys(deathMods)) {
          deathMods[cause] += item.effects.vulnerabilities[cause] || 0;
        }
      }
    }
    return { scoreDelta, bucketDeltas, deathMods };
  }

  function calculateQuestionEffects(state) {
    const answerProfile = calculateAnswerProfile(state);
    const buildBuckets = calculateBuildBuckets(state.stats);
    const alignment = CATEGORIES.reduce((sum, category) => sum + (100 - Math.abs(buildBuckets[category] - answerProfile.buckets[category])), 0) / CATEGORIES.length;
    const scoreDelta = Math.round(answerProfile.answerQuality * 2.5 + (alignment - 50) * 0.4);
    const riskPenalty = Math.max(0, 30 - answerProfile.answerQuality * 3);
    return { scoreDelta, bucketDeltas: answerProfile.buckets, alignment, answerQuality: answerProfile.answerQuality, riskPenalty };
  }

  function calculateResult(state) {
    const scenario = getScenarioById(state.scenarioId);
    const companion = getCompanionById(state.companionId);
    const highestStat = getHighestStat(state);
    const lowestStat = getLowestStat(state);
    const baseScore = calculateBaseStatScore(state.stats);
    const baseBuckets = calculateBuildBuckets(state.stats);
    const companionEffects = calculateCompanionEffects(state);
    const traitEffects = calculateTraitEffects(state);
    const inventoryEffects = calculateInventoryEffects(state);
    const questionEffects = calculateQuestionEffects(state);
    const finalBuildBuckets = normalizeBuckets({
      combat: baseBuckets.combat + companionEffects.bucketDeltas.combat + traitEffects.bucketDeltas.combat + inventoryEffects.bucketDeltas.combat,
      stealth: baseBuckets.stealth + companionEffects.bucketDeltas.stealth + traitEffects.bucketDeltas.stealth + inventoryEffects.bucketDeltas.stealth,
      diplomacy: baseBuckets.diplomacy + companionEffects.bucketDeltas.diplomacy + traitEffects.bucketDeltas.diplomacy + inventoryEffects.bucketDeltas.diplomacy,
      scavenging: baseBuckets.scavenging + companionEffects.bucketDeltas.scavenging + traitEffects.bucketDeltas.scavenging + inventoryEffects.bucketDeltas.scavenging,
      luck: baseBuckets.luck + companionEffects.bucketDeltas.luck + traitEffects.bucketDeltas.luck + inventoryEffects.bucketDeltas.luck,
    });
    const age = clamp(Number(state.character.age) || 25, 18, 75);
    const ageMultiplier = clamp(1.02 - Math.abs(age - 30) / 120, 0.85, 1.08);
    const sexMultiplier = SEX_OPTIONS.find((option) => option.id === state.character.sex)?.scoreMultiplier || 1;
    const scenarioMultiplier = scenario ? scenario.difficultyMultiplier : 1;
    const rawBuild = 32 + (baseScore - 50) * 0.38 + companionEffects.scoreDelta * 0.7 + traitEffects.scoreDelta * 0.8 + inventoryEffects.scoreDelta * 0.7 + questionEffects.scoreDelta * 0.65;
    const baseChance = clamp(Math.round(rawBuild * ageMultiplier * sexMultiplier * scenarioMultiplier * 0.88), 5, 98);
    const riskBuffer = Math.max(0, 34 - questionEffects.answerQuality * 2.5 - (finalBuildBuckets.luck / 1.8));
    const firstMonth = clamp(Math.round(baseChance + 1 - riskBuffer * 0.45), 5, 99);
    const thirdMonth = clamp(Math.round(baseChance - 6 - riskBuffer * 0.3), 3, 98);
    const oneYear = clamp(Math.round(baseChance - 16 - riskBuffer * 0.2), 1, 95);
    const finalChance = Math.round((firstMonth + thirdMonth + oneYear) / 3);
    const answerProfile = calculateAnswerProfile(state);
    const strongestCategory = pickBestCategory(finalBuildBuckets);
    const weakestCategory = pickWorstCategory(finalBuildBuckets);
    const causeResult = computeDeathCauseBreakdown({ state, scenario, lowestStat, finalBuckets: finalBuildBuckets, companionEffects, traitEffects, inventoryEffects });
    const topCause = causeResult[0];
    const lifespan = calculateProjectedLifespan(firstMonth, state, finalBuildBuckets, scenario);
    return {
      state,
      scenario,
      companion,
      highestStat,
      lowestStat,
      baseScore: roundToOne(baseScore),
      companionEffects,
      traitEffects,
      inventoryEffects,
      answerEffects: questionEffects,
      finalBuildBuckets,
      firstMonth,
      thirdMonth,
      oneYear,
      strongestCategory,
      weakestCategory,
      causeResult,
      topCause,
      tier: getSurvivalTier(Math.round((firstMonth + thirdMonth + oneYear) / 3)),
      lifespan,
      finalChance,
      verdict: generateVerdict({ state, scenario, companion, highestStat, lowestStat, strongestCategory, weakestCategory, topCause, firstMonth, thirdMonth, oneYear, companionEffects, answerProfile, lifespan }),
    };
  }

  function calculateAnswerProfile(state) {
    const scenarioQuestions = getActiveQuestionSet(state);
    const totals = { combat: 0, stealth: 0, diplomacy: 0, scavenging: 0, luck: 0 };
    let totalScore = 0;
    const chosenLabels = [];
    for (const question of scenarioQuestions) {
      const answerIndex = state.answers[question.id];
      const choice = question.choices[answerIndex];
      if (!choice) continue;
      chosenLabels.push(choice.label);
      for (const category of CATEGORIES) {
        const amount = choice.effects[category] || 0;
        totals[category] += amount;
        totalScore += amount;
      }
    }
    const buckets = {};
    for (const category of CATEGORIES) {
      buckets[category] = clamp(Math.round(50 + totals[category] * 0.42), 0, 100);
    }
    return { totals, buckets, answerQuality: scenarioQuestions.length ? totalScore / scenarioQuestions.length : 0, chosenLabels };
  }

  function computeDeathCauseBreakdown(result) {
    const { finalBuckets, scenario, lowestStat, companionEffects, traitEffects, inventoryEffects } = result;
    let weights = { raiders: 24, radiation: 20, starvation: 18, betrayal: 12, random: 20 };
    if (scenario.id === "tvshow") {
      weights.raiders += 8;
      weights.radiation += 5;
      weights.starvation += 3;
    }
    if (scenario.id === "newvegas") {
      weights.random += 5;
      weights.betrayal += 2;
    }
    if (scenario.id === "fallout4") {
      weights.raiders += 4;
      weights.starvation -= 2;
    }
    weights.raiders += Math.max(0, 60 - finalBuckets.combat) * 0.35;
    weights.radiation += Math.max(0, 62 - ((result.state.stats.endurance * 10 + finalBuckets.scavenging) / 2)) * 0.38;
    weights.starvation += Math.max(0, 64 - finalBuckets.scavenging) * 0.34;
    weights.betrayal += Math.max(0, 58 - finalBuckets.diplomacy) * 0.28;
    weights.random += Math.max(0, 64 - ((finalBuckets.stealth + finalBuckets.luck) / 2)) * 0.36;
    if (!companionEffects.sameWorld) weights.betrayal += 11;
    if (lowestStat.id === "charisma") weights.betrayal += 4;
    if (lowestStat.id === "endurance") {
      weights.radiation += 5;
      weights.starvation += 3;
    }
    if (lowestStat.id === "luck") weights.random += 5;
    for (const cause of Object.keys(weights)) {
      weights[cause] += traitEffects.deathMods[cause] || 0;
      weights[cause] += inventoryEffects.deathMods[cause] || 0;
      weights[cause] = Math.max(4, weights[cause]);
    }
    const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
    let runningTotal = 0;
    return DEATH_CAUSE_RULES.map((rule, index) => {
      let percentage = Math.round((weights[rule.id] / total) * 100);
      if (index === DEATH_CAUSE_RULES.length - 1) {
        percentage = 100 - runningTotal;
      }
      runningTotal += percentage;
      return { id: rule.id, label: rule.label, color: rule.color, percentage };
    }).sort((a, b) => b.percentage - a.percentage);
  }

  function formatDuration(days) {
    if (days < 45) return `${days} days`;
    if (days < 730) return `${Math.round(days / 30)} months`;
    return `${(days / 365).toFixed(days >= 1095 ? 1 : 0)} years`;
  }

  function calculateProjectedLifespan(finalChance, state, finalBuckets, scenario) {
    const baseDays = finalChance * 4 + state.stats.endurance * 11 + state.stats.luck * 8 + finalBuckets.scavenging * 0.9;
    const scenarioAdjustedDays = Math.round(baseDays * scenario.difficultyMultiplier);
    const clampedDays = clamp(scenarioAdjustedDays, 4, 3650);
    const bestCaseDays = clamp(Math.round(clampedDays * (1.7 + finalBuckets.luck / 180)), clampedDays + 2, 4380);
    return { days: clampedDays, bestCaseDays, text: formatDuration(clampedDays), bestCaseText: formatDuration(bestCaseDays) };
  }

  function getSurvivalTier(score) {
    if (score < 25) return "Vault Softie";
    if (score < 45) return "Scrapper";
    if (score < 65) return "Wasteland-Proven";
    if (score < 85) return "Hardcase Legend";
    return "Near-Legend";
  }

  function describePlaystyle(answerBuckets) {
    const best = pickBestCategory(answerBuckets);
    return {
      combat: "hot-blooded survivor",
      stealth: "careful shadow-runner",
      diplomacy: "silver-tongued operator",
      scavenging: "methodical scavenger",
      luck: "reckless gambler",
    }[best];
  }

  function roundToOne(value) {
    return Math.round(value * 10) / 10;
  }

  function generateVerdict(context) {
    const { state, scenario, companion, highestStat, lowestStat, strongestCategory, weakestCategory, topCause, firstMonth, thirdMonth, oneYear, companionEffects, answerProfile, lifespan } = context;
    const finalChance = Math.round((firstMonth + thirdMonth + oneYear) / 3);
    const scoreBand = getScoreBand(finalChance);
    const toneLine = VERDICT_TEMPLATES.tones[scenario.tone];
    const style = describePlaystyle(answerProfile.buckets);
    const traitLabels = state.traits.map((traitId) => getTraitById(traitId)?.label).filter(Boolean).join(" and ") || "Your chosen traits";
    const itemLabels = state.inventory.map((itemId) => getItemById(itemId)?.label).filter(Boolean).join(" and ") || "your equipment";
    const recommendation = VERDICT_TEMPLATES.recommendations[topCause.id];
    const companionLine = companion ? `${companion.label} gives you ${companionEffects.sameWorld ? "native-world chemistry" : "a risky cross-world partnership"}.` : "Without a reliable companion, every mistake lands harder.";
    const charName = state.character.name ? state.character.name : "Vault Dweller";
    const ageContext = state.character.age < 25 ? "young and less tested" : state.character.age > 35 ? "seasoned but slowing" : "at your peak";
    return [
      `${charName}, ${scoreBand.intro.toLowerCase()}`,
      `At ${ageContext}, you rely heavily on your ${highestStat.label} (${state.stats[highestStat.id]}), but your ${lowestStat.label} (${state.stats[lowestStat.id]}) is where the wasteland will exploit you. You play like a ${style}, so lean into ${strongestCategory} and avoid ${weakestCategory}.`,
      `${companionLine} ${toneLine}`,
      `With ${traitLabels} and ${itemLabels}, combined with your survival decisions, you have a ${firstMonth}% shot in month one, ${thirdMonth}% by month three, and ${oneYear}% at one year.`,
      `The biggest threat is ${topCause.label.toLowerCase()}. Your build feels fragile there. Expect to survive around ${lifespan.text}, possibly ${lifespan.bestCaseText} if discipline holds. Recommendation: ${recommendation}`,
    ].join(" ");
  }

  function encodeShareState(state) {
    const payload = {
      s: state.stats,
      ch: { name: state.character.name, age: state.character.age, sex: state.character.sex },
      sc: state.scenarioId,
      c: state.companionId,
      t: state.traits,
      i: state.inventory,
      a: state.answers,
    };
    const json = JSON.stringify(payload);
    if (typeof btoa === "function") {
      return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }
    return Buffer.from(json, "utf8").toString("base64url");
  }

  function decodeShareState(encoded) {
    try {
      let json;
      if (typeof atob === "function") {
        const padded = encoded.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((encoded.length + 3) % 4);
        json = decodeURIComponent(escape(atob(padded)));
      } else {
        json = Buffer.from(encoded, "base64url").toString("utf8");
      }
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  function sanitizeIncomingState(raw, config) {
    const next = buildDefaultState(config);
    if (!raw || typeof raw !== "object") return next;
    if (raw.s && typeof raw.s === "object") {
      for (const stat of SPECIAL_STATS) {
        const value = Number(raw.s[stat.id]);
        if (Number.isFinite(value)) next.stats[stat.id] = clamp(Math.round(value), stat.min, stat.max);
      }
    }
    if (raw.ch && typeof raw.ch === "object") {
      if (typeof raw.ch.name === "string") next.character.name = String(raw.ch.name).slice(0, 60);
      const ageValue = Number(raw.ch.age);
      if (Number.isFinite(ageValue)) next.character.age = clamp(Math.round(ageValue), 18, 75);
      if (raw.ch.sex === "male" || raw.ch.sex === "female") next.character.sex = raw.ch.sex;
    }
    // Ensure total SPECIAL points do not exceed the allowed total (45).
    const currentTotal = sumValues(next.stats);
    if (currentTotal > 45) {
      let excess = currentTotal - 45;
      while (excess > 0) {
        let candidate = null;
        let candidateVal = -Infinity;
        for (const stat of SPECIAL_STATS) {
          const val = next.stats[stat.id];
          if (val > stat.min && val > candidateVal) {
            candidate = stat.id;
            candidateVal = val;
          }
        }
        if (!candidate) break;
        next.stats[candidate] = Math.max(SPECIAL_STATS.find((s) => s.id === candidate).min, next.stats[candidate] - 1);
        excess--;
      }
    }
    if (Array.isArray(raw.t)) next.traits = raw.t.filter((id) => getTraitById(id)).slice(0, 2);
    if (Array.isArray(raw.i)) next.inventory = raw.i.filter((id) => getItemById(id)).slice(0, 2);
    if (typeof raw.sc === "string" && getScenarioById(raw.sc)) next.scenarioId = raw.sc;
    if (typeof raw.c === "string" && getCompanionById(raw.c)) next.companionId = raw.c;
    if (raw.a && typeof raw.a === "object") {
      const allowedQuestionIds = new Set(getActiveQuestionSet(next).map((question) => question.id));
      for (const [questionId, rawAnswer] of Object.entries(raw.a)) {
        const answerIndex = Number(rawAnswer);
        if (allowedQuestionIds.has(questionId) && Number.isInteger(answerIndex)) {
          next.answers[questionId] = clamp(answerIndex, 0, 3);
        }
      }
    }
    // If the incoming answers object only contains zeros, treat it as absent
    if (Object.keys(next.answers).length > 0) {
      const anyNonZero = Object.values(next.answers).some((v) => Number(v) !== 0);
      if (!anyNonZero) next.answers = {};
    }
    const rawStep = raw.currentStep ? clamp(Number(raw.currentStep) || 1, 1, 3) : 1;
    next.showMath = typeof raw.showMath === "boolean" ? raw.showMath : next.showMath;
    // If the incoming state is effectively pristine (no meaningful choices made),
    // do not advance the wizard based on a stale currentStep value from the payload.
    next.currentStep = isPristineState(next) ? 1 : rawStep;
    return next;
  }

  function readStoredState(config) {
    if (!hasDocument || !globalScope.localStorage) return buildDefaultState(config);
    const fromQuery = new URLSearchParams(globalScope.location.search).get(SHARE_PARAM);
    if (fromQuery) {
      const shared = sanitizeIncomingState(decodeShareState(fromQuery), config);
      shared.flash = "Shared build loaded from URL.";
      return shared;
    }
    try {
      const saved = globalScope.localStorage.getItem(STORAGE_KEY);
      if (!saved) return buildDefaultState(config);
      return sanitizeIncomingState(JSON.parse(saved), config);
    } catch (error) {
      return buildDefaultState(config);
    }
  }

  function saveState(state) {
    if (!hasDocument || !globalScope.localStorage) return;
    try {
      globalScope.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Ignore quota issues.
    }
  }

  function injectStyles() {
    if (!hasDocument || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .wc-shell{--wc-accent:#ff9000;--wc-bg:#110a03;--wc-panel:rgba(28,17,7,.94);--wc-panel-2:rgba(12,8,4,.78);--wc-border:rgba(255,144,0,.22);--wc-text:#ffd59f;--wc-dim:#d0a56a;position:relative;overflow:hidden;border:1px solid var(--wc-border);border-radius:22px;background:radial-gradient(circle at top,rgba(255,144,0,.14),transparent 38%),linear-gradient(135deg,#100902 0%,#1a1006 45%,#090603 100%);box-shadow:0 0 28px rgba(255,144,0,.08),inset 0 0 0 1px rgba(255,144,0,.08);color:var(--wc-text);font-family:"IBM Plex Mono","Cascadia Code","Courier New",monospace}
      .wc-shell *,.wc-shell *::before,.wc-shell *::after{box-sizing:border-box}
      .wc-shell::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(to bottom,rgba(255,193,111,.025),rgba(255,193,111,.025) 1px,transparent 1px,transparent 4px);pointer-events:none}
      .wc-root{position:relative;z-index:1;padding:24px}
      .wc-topbar,.wc-step-head,.wc-progress-row,.wc-footer-row,.wc-button-row,.wc-chart-wrap,.wc-sidebar-list-item,.wc-legend-item,.wc-stat-head,.wc-choice-head,.wc-meter-row{display:flex;gap:12px}
      .wc-topbar,.wc-step-head,.wc-progress-row,.wc-footer-row{justify-content:space-between;align-items:flex-start}
      .wc-button-row,.wc-meter-row{align-items:center;flex-wrap:wrap}
      .wc-title{margin:0;font-size:clamp(2rem,5vw,3.2rem);line-height:.96;text-transform:uppercase;letter-spacing:.03em;text-shadow:0 0 16px rgba(255,144,0,.15)}
      .wc-kicker,.wc-step-tag,.wc-field label,.wc-filter-label,.wc-status small,.wc-summary-card small,.wc-question-count{display:inline-flex;gap:8px;letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:var(--wc-dim)}
      .wc-kicker{padding:6px 10px;border-radius:999px;background:rgba(255,144,0,.08);border:1px solid rgba(255,144,0,.18);margin-bottom:12px}
      .wc-subtitle,.wc-step-copy,.wc-choice-card p,.wc-stat-card p,.wc-disclaimer,.wc-callout,.wc-verdict,.wc-result-card p{color:var(--wc-dim);line-height:1.6}
      .wc-status,.wc-progress,.wc-main-panel,.wc-sidebar,.wc-stat-card,.wc-choice-card,.wc-result-card,.wc-question-card,.wc-summary-card,.wc-math{background:var(--wc-panel);border:1px solid var(--wc-border);border-radius:18px}
      .wc-status,.wc-progress,.wc-main-panel,.wc-sidebar{padding:18px}
      .wc-status{min-width:220px}
      .wc-status strong,.wc-meter strong,.wc-summary-card strong{display:block;color:var(--wc-accent)}
      .wc-status strong{font-size:1.35rem}
      .wc-progress{margin:18px 0}
      .wc-progress-track{height:12px;border-radius:999px;overflow:hidden;background:rgba(255,144,0,.08);border:1px solid rgba(255,144,0,.12)}
      .wc-progress-fill{height:100%;background:linear-gradient(90deg,rgba(255,144,0,.7),rgba(255,191,105,.95),rgba(255,144,0,.7));box-shadow:0 0 16px rgba(255,144,0,.35);transition:width .28s ease}
      .wc-footer-row{margin-top:26px}
      .wc-button-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-end}
      .wc-layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(290px,.92fr);gap:20px;align-items:start}
      .wc-sidebar{position:sticky;top:16px}
      .wc-grid-2,.wc-perks,.wc-results-grid,.wc-questions,.wc-summary-grid,.wc-sidebar-list,.wc-legend{display:grid;gap:14px}
      .wc-grid-2,.wc-perks,.wc-results-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .wc-perks{margin-top:16px}
      .wc-stat-card,.wc-choice-card,.wc-result-card,.wc-question-card,.wc-summary-card,.wc-math{padding:16px;background:rgba(255,144,0,.05)}
      .wc-step-title{margin:0;font-size:clamp(1.35rem,3vw,2rem)}
      .wc-meter-row{margin:0 0 18px;padding:14px 16px;border-radius:16px;background:var(--wc-panel-2);border:1px solid var(--wc-border)}
      .wc-meter{min-width:130px}
      .wc-meter strong{font-size:1.3rem}
      .wc-stat-head strong,.wc-choice-head strong{font-size:1rem}
      .wc-stat-value,.wc-survival-number{color:var(--wc-accent);text-shadow:0 0 14px rgba(255,144,0,.18)}
      .wc-stat-value{font-size:1.35rem}
      .wc-range{width:100%;accent-color:var(--wc-accent);margin-top:12px}
      .wc-perk{position:relative;display:block}
      .wc-answer{position:relative;display:block}
      .wc-perk input,.wc-answer input{position:absolute;opacity:0;inset:0}
      .wc-perk-card,.wc-answer-option{display:block;width:100%;padding:14px 16px;border-radius:14px;border:1px solid var(--wc-border);background:rgba(255,144,0,.04);color:var(--wc-text);transition:transform .18s ease,border-color .18s ease,background .18s ease;cursor:pointer}
      .wc-perk input:checked + .wc-perk-card,.wc-answer input:checked + .wc-answer-option,.wc-answer-option:hover,.wc-button:hover:not(:disabled){transform:translateY(-1px);border-color:rgba(255,144,0,.42);background:rgba(255,144,0,.12)}
      .wc-pill-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
      .wc-pill{padding:5px 9px;border-radius:999px;background:rgba(255,144,0,.1);font-size:11px;color:var(--wc-dim);text-transform:uppercase;letter-spacing:.12em}
      .wc-field{margin-bottom:14px}
      .wc-input,.wc-select,.wc-button{font:inherit}
      .wc-input,.wc-select{width:100%;padding:14px;border-radius:14px;border:1px solid var(--wc-border);background:rgba(8,5,2,.85);color:var(--wc-text)}
      .wc-select{min-height:48px}
      .wc-callout{padding:14px 16px;border-radius:15px;background:rgba(255,144,0,.08);border:1px solid rgba(255,144,0,.18);margin-top:14px}
      .wc-answer-list{display:grid;gap:10px;margin-top:14px}
      .wc-button{display:inline-flex;justify-content:center;align-items:center;padding:12px 16px;border-radius:14px;border:1px solid rgba(255,144,0,.24);background:rgba(255,144,0,.12);color:var(--wc-text);cursor:pointer}
      .wc-button-primary{background:linear-gradient(135deg,rgba(255,144,0,.22),rgba(255,191,105,.18))}
      .wc-button:disabled{opacity:.45;cursor:not-allowed}
      .wc-summary-card strong{font-size:1.45rem}
      .wc-sidebar-list-item,.wc-legend-item{justify-content:space-between;align-items:center;padding:10px 12px;border-radius:12px;background:rgba(255,144,0,.04)}
      .wc-mini-bar{height:8px;border-radius:999px;overflow:hidden;background:rgba(255,144,0,.08);margin-top:8px}
      .wc-mini-bar span{display:block;height:100%;background:linear-gradient(90deg,rgba(255,144,0,.65),rgba(255,191,105,1))}
      .wc-result-primary{grid-column:1/-1}
      .wc-survival-number{font-size:clamp(3rem,10vw,5.4rem);line-height:.9;margin:8px 0 10px}
      .wc-chart-wrap{display:grid;grid-template-columns:180px minmax(0,1fr);gap:18px;align-items:center}
      .wc-chart{width:180px;height:180px;border-radius:50%;border:1px solid var(--wc-border);box-shadow:inset 0 0 0 24px rgba(17,10,3,.96),0 0 24px rgba(255,144,0,.08)}
      .wc-legend-label{display:flex;align-items:center;gap:10px}
      .wc-legend-swatch{width:12px;height:12px;border-radius:999px;flex:0 0 auto}
      .wc-verdict{margin-top:16px;padding:18px;border-radius:18px;border:1px solid rgba(255,144,0,.18);background:rgba(255,144,0,.07)}
      .wc-math{margin-top:16px;background:rgba(0,0,0,.18)}
      .wc-math table{width:100%;border-collapse:collapse}
      .wc-math td{padding:10px 0;border-bottom:1px solid rgba(255,144,0,.1);color:var(--wc-dim)}
      .wc-math td:last-child{text-align:right;color:var(--wc-text)}
      .wc-flash{min-height:1.3em;color:var(--wc-accent)}
      .wc-disclaimer{margin-top:18px;font-size:13px}
      .wc-shell :focus-visible{outline:2px solid rgba(255,191,105,.95);outline-offset:2px}
      @media (max-width:1040px){.wc-layout{grid-template-columns:1fr}.wc-sidebar{position:static}}
      @media (max-width:760px){.wc-root{padding:18px}.wc-topbar,.wc-grid-2,.wc-perks,.wc-results-grid,.wc-chart-wrap{display:grid;grid-template-columns:1fr}.wc-chart{margin:0 auto}}
      @media (prefers-reduced-motion:reduce){.wc-progress-fill,.wc-perk-card,.wc-answer-option,.wc-button{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fillMissingAnswers(state) {
    const answers = { ...state.answers };
    for (const question of getActiveQuestionSet(state)) {
      if (typeof answers[question.id] !== "number") answers[question.id] = 0;
    }
    return answers;
  }

  function renderBreakdownRow(label, value) {
    return `<div class="wc-sidebar-list-item"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function signed(value) {
    return value > 0 ? `+${value}` : `${value}`;
  }

  function capitalize(value) {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }

  function conicGradientForBreakdown(slices) {
    let start = 0;
    const stops = slices.map((slice) => {
      const end = start + slice.percentage;
      const stop = `${slice.color} ${start}% ${end}%`;
      start = end;
      return stop;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, x, currentY);
  }

  function validateData() {
    const traitIds = new Set();
    for (const trait of TRAITS) {
      if (traitIds.has(trait.id)) throw new Error(`Duplicate trait id: ${trait.id}`);
      traitIds.add(trait.id);
    }
    const itemIds = new Set();
    for (const item of INVENTORY_ITEMS) {
      if (itemIds.has(item.id)) throw new Error(`Duplicate inventory item id: ${item.id}`);
      itemIds.add(item.id);
    }
    const scenarioIds = new Set();
    for (const scenario of SCENARIOS) {
      if (scenarioIds.has(scenario.id)) throw new Error(`Duplicate scenario id: ${scenario.id}`);
      scenarioIds.add(scenario.id);
      if (!QUESTION_SETS[scenario.questionSetId]) throw new Error(`Missing question set for scenario ${scenario.id}`);
    }
    const companionIds = new Set();
    for (const companion of COMPANIONS) {
      if (companionIds.has(companion.id)) throw new Error(`Duplicate companion id: ${companion.id}`);
      companionIds.add(companion.id);
      if (!SCENARIO_GROUP_LABELS[companion.originScenario]) throw new Error(`Unknown origin scenario for companion ${companion.id}`);
    }
    for (const scenario of SCENARIOS) {
      scenario.allowedCompanionIds = COMPANIONS.map((companion) => companion.id);
    }
    for (const [scenarioId, questions] of Object.entries(QUESTION_SETS)) {
      if (questions.length !== 8) throw new Error(`Scenario ${scenarioId} must have exactly 8 questions.`);
      for (const question of questions) {
        if (question.choices.length !== 4) throw new Error(`Question ${question.id} must have exactly 4 choices.`);
      }
    }
  }

  class CalculatorApp {
    constructor(container, config = {}) {
      this.container = container;
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.state = readStoredState(this.config);
      this.lastCompletionKey = "";
      this.root = null;
      this.handleClick = this.handleClick.bind(this);
      this.handleInput = this.handleInput.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }

    mount() {
      injectStyles();
      this.root = document.createElement("section");
      this.root.className = "wc-shell";
      this.root.style.setProperty("--wc-accent", this.config.accentColor || DEFAULT_CONFIG.accentColor);
      this.root.innerHTML = `<div class="wc-root"></div>`;
      this.container.innerHTML = "";
      this.container.appendChild(this.root);
      this.root.addEventListener("click", this.handleClick);
      this.root.addEventListener("input", this.handleInput);
      this.root.addEventListener("change", this.handleChange);
      this.render();
      return this;
    }

    destroy() {
      if (!this.root) return;
      this.root.removeEventListener("click", this.handleClick);
      this.root.removeEventListener("input", this.handleInput);
      this.root.removeEventListener("change", this.handleChange);
      this.container.innerHTML = "";
      this.root = null;
    }

    patchState(patch) {
      this.state = { ...this.state, ...patch };
      saveState(this.state);
      this.render();
    }

    handleInput(event) {
      const target = event.target;
      if (target.matches("[data-stat-id]")) {
        const statId = target.getAttribute("data-stat-id");
        const stat = SPECIAL_STATS.find((item) => item.id === statId);
        if (!stat) return;
        const desired = Number(target.value);
        const currentSum = sumValues(this.state.stats);
        const currentValue = Number(this.state.stats[statId] || 0);
        const otherSum = currentSum - currentValue;
        const maxAllowedForThis = Math.min(stat.max, 45 - otherSum);
        const allowedMax = Math.max(stat.min, maxAllowedForThis);
        const finalValue = clamp(Math.round(desired), stat.min, allowedMax);
        const nextStats = { ...this.state.stats, [statId]: finalValue };
        this.patchState({ stats: nextStats, flash: "" });
        return;
      }
      if (target.matches("[data-companion-filter]")) {
        this.patchState({ companionFilter: target.value });
      }
    }

    handleChange(event) {
      const target = event.target;
      if (target.matches("[data-character]")) {
        const key = target.getAttribute("data-character");
        const nextCharacter = { ...this.state.character, [key]: key === "age" ? Number(target.value) : target.value };
        let nextState = { ...this.state, character: nextCharacter, flash: "" };
        if (key === "sex") {
          const allowedIds = new Set(getActiveQuestionSet(nextState).map((question) => question.id));
          const nextAnswers = {};
          for (const [questionId, answerIndex] of Object.entries(this.state.answers)) {
            if (allowedIds.has(questionId)) nextAnswers[questionId] = answerIndex;
          }
          nextState.answers = nextAnswers;
        }
        this.patchState(nextState);
        return;
      }
      if (target.matches("[data-trait-id]")) {
        const traitId = target.getAttribute("data-trait-id");
        let nextTraits = this.state.traits.slice();
        if (target.checked) {
          if (nextTraits.length >= 2) {
            target.checked = false;
            this.patchState({ flash: "You can only choose two traits." });
            return;
          }
          nextTraits.push(traitId);
        } else {
          nextTraits = nextTraits.filter((id) => id !== traitId);
        }
        this.patchState({ traits: nextTraits, flash: "" });
        return;
      }
      if (target.matches("[data-item-id]")) {
        const itemId = target.getAttribute("data-item-id");
        let nextInventory = this.state.inventory.slice();
        if (target.checked) {
          if (nextInventory.length >= 2) {
            target.checked = false;
            this.patchState({ flash: "You can only equip two items." });
            return;
          }
          nextInventory.push(itemId);
        } else {
          nextInventory = nextInventory.filter((id) => id !== itemId);
        }
        this.patchState({ inventory: nextInventory, flash: "" });
        return;
      }
      if (target.matches("[data-scenario-select]")) {
        const scenarioId = target.value;
        const nextState = { ...this.state, scenarioId, flash: "" };
        const allowedQuestionIds = new Set(getActiveQuestionSet(nextState).map((question) => question.id));
        const nextAnswers = {};
        for (const [questionId, answerIndex] of Object.entries(this.state.answers)) {
          if (allowedQuestionIds.has(questionId)) nextAnswers[questionId] = answerIndex;
        }
        this.patchState({ scenarioId, answers: nextAnswers, flash: "" });
        return;
      }
      if (target.matches("[data-companion-select]")) {
        this.patchState({ companionId: target.value, flash: "" });
        return;
      }
      if (target.matches("[data-question-id]")) {
        const questionId = target.getAttribute("data-question-id");
        this.patchState({ answers: { ...this.state.answers, [questionId]: Number(target.value) }, flash: "" });
      }
    }

    async shareResult() {
      const url = this.getShareUrl();
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          this.patchState({ flash: "Share link copied to clipboard." });
          return;
        }
      } catch (error) {
        // Fall through.
      }
      if (hasDocument) globalScope.prompt("Copy this share URL:", url);
      this.patchState({ flash: "Share link ready." });
    }

    getShareUrl() {
      const encoded = encodeShareState(this.state);
      if (this.config.shareBaseUrl) {
        const url = new URL(this.config.shareBaseUrl, hasDocument ? globalScope.location.href : "https://example.com");
        url.searchParams.set(SHARE_PARAM, encoded);
        return url.toString();
      }
      const url = new URL(globalScope.location.href);
      url.searchParams.set(SHARE_PARAM, encoded);
      return url.toString();
    }

    downloadCard() {
      if (!hasDocument) return;
      const result = calculateResult(this.state);
      const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Wasteland Survival Calculator PDF</title>
<style>
  body { margin: 0; font-family: Arial, sans-serif; background: #100902; color: #ffd59f; font-size: 13px; }
  .page { width: 210mm; max-width: 100%; padding: 18px; box-sizing: border-box; }
  .card { max-width: 100%; margin: auto; padding: 18px; border-radius: 20px; background: #120b03; border: 1px solid rgba(255,144,0,.25); }
  .header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  .header h1 { margin: 0; font-size: 1.8rem; letter-spacing: .08em; }
  .metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 18px 0; }
  .metric { padding: 12px; border-radius: 16px; background: rgba(255,144,0,.08); border: 1px solid rgba(255,144,0,.18); }
  .metric strong { display: block; font-size: 1.35rem; margin-top: 6px; color: #ffb56b; }
  .section { margin-top: 18px; }
  .section h2 { margin: 0 0 10px; font-size: 1.05rem; color: #ffb56b; }
  .section p, .section li { line-height: 1.5; }
  .table-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
  .table-card { padding: 16px; border-radius: 16px; background: rgba(255,144,0,.05); border: 1px solid rgba(255,144,0,.12); }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 10px 8px; border-bottom: 1px solid rgba(255,144,0,.12); text-align: left; vertical-align: top; }
  th { color: #ffb56b; font-weight: 700; font-size: 0.95rem; }
  td { color: #fff; font-size: 0.92rem; }
  .cause-label { display: block; }
  .cause-value { color: #ffb56b; font-weight: 700; }
  .list { display: none; }
  @media print {
    @page { size: A4 portrait; margin: 10mm; }
    html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; }
    body { background: white; color: black; font-size: 12px; }
    .page { padding: 6px; }
    .card { background: white; border-color: #ccc; box-shadow: none; padding: 12px; }
    .header { gap: 10px; }
    .header h1 { font-size: 1.4rem; }
    .metrics { gap: 8px; margin: 12px 0; }
    .section { page-break-inside: avoid; margin-top: 12px; }
    .metric, .section, .list li { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="card">
    <div class="header">
      <div>
        <h1>Wasteland Survival Verdict</h1>
        <p><strong>${escapeHtml(result.state.character.name || "Unnamed Survivor")}</strong> · ${result.state.character.sex === "female" ? "F" : "M"}, Age ${result.state.character.age}</p>
        <p>${escapeHtml(result.scenario.label)} · ${escapeHtml(result.companion ? result.companion.label : "No companion")}</p>
      </div>
      <div style="text-align:right;">
        <div style="font-size:4rem;font-weight:700;color:#ffb56b;">${result.finalChance}%</div>
        <div style="margin-top:8px;font-size:1rem;">${escapeHtml(result.tier)}</div>
      </div>
    </div>
    <div class="metrics">
      <div class="metric"><strong>${escapeHtml(result.highestStat.label)} ${this.state.stats[result.highestStat.id]}</strong><div>Strongest trait</div></div>
      <div class="metric"><strong>${escapeHtml(result.lowestStat.label)} ${this.state.stats[result.lowestStat.id]}</strong><div>Biggest weakness</div></div>
      <div class="metric"><strong>${escapeHtml(result.lifespan.text)}</strong><div>Projected lifespan</div></div>
    </div>
    <div class="section">
      <h2>Summary</h2>
      <p style="font-size:1.1rem;line-height:1.7;">${escapeHtml(result.verdict)}</p>
    </div>
    <div class="table-grid">
      <div class="table-card">
        <h2>Key stats</h2>
        <table>
          <tbody>
            ${SPECIAL_STATS.map((stat) => `<tr><th>${escapeHtml(stat.label)}</th><td>${this.state.stats[stat.id]}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="table-card">
        <h2>Cause of failure</h2>
        <table>
          <tbody>
            ${((result.deathBreakdown || result.causeResult || [])).map((slice) => `<tr><th class="cause-label">${escapeHtml(slice.label)}</th><td class="cause-value">${slice.percentage}%</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="section">
      <h2>Recommendations</h2>
      <p>${escapeHtml(result.verdict.split("Recommendation:").pop().trim())}</p>
    </div>
  </div>
</div>
<script>window.onload = () => { window.print(); };</script>
</body>
</html>`;
      const popup = globalScope.open("", "_blank");
      if (!popup) {
        this.patchState({ flash: "Popup blocked. Allow popups to save the PDF." });
        return;
      }
      popup.document.write(printHtml);
      popup.document.close();
      popup.focus();
      this.patchState({ flash: "Print dialog opened. Choose Save as PDF." });
    }

    handleClick(event) {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const action = button.getAttribute("data-action");
      if (action === "back") {
        this.patchState({ currentStep: clamp(this.state.currentStep - 1, 1, 4), flash: "" });
      } else if (action === "next") {
        this.goToNextStep();
      } else if (action === "reset") {
        this.state = buildDefaultState(this.config);
        saveState(this.state);
        // Remove any shared-build query param so a reload doesn't re-import a shared state
        if (hasDocument && globalScope.history && globalScope.location) {
          try {
            const url = new URL(globalScope.location.href);
            if (url.searchParams.has(SHARE_PARAM)) {
              url.searchParams.delete(SHARE_PARAM);
              globalScope.history.replaceState(null, "", url.toString());
            }
          } catch (e) {
            // ignore URL manipulation failures
          }
        }
        this.render();
      } else if (action === "download-card") {
        this.downloadCard();
      } else if (action === "jump-math") {
        this.patchState({ showMath: true });
        setTimeout(() => this.root?.querySelector("[data-math-panel]")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
      }
    }

    goToNextStep() {
      if (this.state.currentStep === 1 && !isStepOneValid(this.state)) {
        const remaining = getRemainingSpecialPoints(this.state.stats);
        this.patchState({ flash: remaining !== 0 ? `You need to land exactly on 45 total SPECIAL points. Remaining: ${remaining}.` : "Pick exactly two traits before continuing." });
        return;
      }
      if (this.state.currentStep === 2 && !isStepTwoValid(this.state)) {
        this.patchState({ flash: "Choose a companion, two items, and answer all survival challenges before continuing." });
        return;
      }
      if (this.state.currentStep === 3 && !isStepThreeValid(this.state)) {
        this.patchState({ flash: "Complete the final verdict step before downloading your build." });
        return;
      }
      const nextStep = clamp(this.state.currentStep + 1, 1, 3);
      this.patchState({ currentStep: nextStep, flash: "" });
      if (nextStep > 1 && this.root) {
        setTimeout(() => {
          this.root.querySelector(".wc-topbar")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 40);
      }
    }

    getStepLabel() {
      return ["Build Your Survivor", "Choose Gear & Scenarios", "Final Verdict"][this.state.currentStep - 1];
    }

    getFilteredCompanions() {
      const filter = this.state.companionFilter.trim().toLowerCase();
      const grouped = new Map();
      for (const companion of COMPANIONS) {
        const haystack = `${companion.label} ${companion.tags.join(" ")} ${SCENARIO_GROUP_LABELS[companion.originScenario] || ""}`.toLowerCase();
        if (filter && !haystack.includes(filter)) continue;
        const group = SCENARIO_GROUP_LABELS[companion.originScenario] || "Other";
        if (!grouped.has(group)) grouped.set(group, []);
        grouped.get(group).push(companion);
      }
      return Array.from(grouped.entries()).map(([group, companions]) => `
        <optgroup label="${escapeHtml(group)}">
          ${companions.map((companion) => `<option value="${companion.id}" ${this.state.companionId === companion.id ? "selected" : ""}>${escapeHtml(companion.label)}</option>`).join("")}
        </optgroup>
      `).join("");
    }

    renderFooter({ canGoBack, canGoNext, nextLabel, stepFour = false }) {
      return `
        <div class="wc-footer-row">
          <div class="wc-flash" aria-live="polite">${escapeHtml(this.state.flash || "")}</div>
          <div class="wc-button-row">
            ${canGoBack ? `<button class="wc-button" data-action="back">Back</button>` : ""}
            ${stepFour ? `
              <button class="wc-button" data-action="reset">Try Another Build</button>
              <button class="wc-button wc-button-primary" data-action="download-card">Download PDF</button>
            ` : `<button class="wc-button wc-button-primary" data-action="next">${escapeHtml(nextLabel)}</button>`}
          </div>
        </div>
      `;
    }

    renderSidebar(previewResult) {
      const filtered = normalizeBuckets(calculateBuildBuckets(this.state.stats));
      return `
        ${this.state.currentStep === 2 ? "" : "<h3>Current Character Build</h3>"}
        <div class="wc-summary-grid">
          <div class="wc-summary-card"><small>Name</small><strong>${escapeHtml(this.state.character.name || "Unnamed")}</strong><div>${escapeHtml(getScenarioById(this.state.scenarioId)?.label || "Not chosen")}</div></div>
          <div class="wc-summary-card"><small>Companion</small><div>${escapeHtml(getCompanionById(this.state.companionId)?.label || "None")}</div><div>${escapeHtml(this.state.character.sex === "female" ? "Female" : "Male")}, Age ${escapeHtml(String(this.state.character.age))}</div></div>
          <div class="wc-summary-card"><small>Traits + Gear</small><div>${escapeHtml((this.state.traits || []).map((id) => getTraitById(id)?.label).filter(Boolean).join(", ") || "Pick 2 traits")}</div><div>${escapeHtml((this.state.inventory || []).map((id) => getItemById(id)?.label).filter(Boolean).join(", ") || "Pick 2 items")}</div></div>
        </div>
        <h3 style="margin-top:20px;">Survival Buckets</h3>
        <div class="wc-sidebar-list">
          ${CATEGORIES.map((category) => `
            <div class="wc-sidebar-list-item">
              <div style="flex:1;">
                <div>${escapeHtml(capitalize(category))}</div>
                <div class="wc-mini-bar"><span style="width:${filtered[category]}%"></span></div>
              </div>
              <strong>${filtered[category]}</strong>
            </div>
          `).join("")}
        </div>
        <h3 style="margin-top:20px;">Current SPECIAL</h3>
        <div class="wc-sidebar-list">
          ${SPECIAL_STATS.map((stat) => renderBreakdownRow(stat.label, this.state.stats[stat.id])).join("")}
        </div>
      `;
    }

    renderStepOne(previewResult) {
      const remaining = getRemainingSpecialPoints(this.state.stats);
      return `
        <div class="wc-step-head"><div><div class="wc-step-tag">01 • Build Your Survivor</div><h3 class="wc-step-title">Create your character and allocate SPECIAL.</h3><p class="wc-step-copy">Choose a name, age, sex, favorite wasteland, and distribute exactly 45 SPECIAL points. Then lock in two survival traits.</p></div></div>
        <div class="wc-grid-2">
          <div class="wc-choice-card">
            <div class="wc-field"><label for="wc-character-name">Name</label><input id="wc-character-name" class="wc-input" type="text" value="${escapeHtml(this.state.character.name)}" data-character="name" placeholder="Enter name" /></div>
            <div class="wc-field"><label for="wc-character-age">Age</label><input id="wc-character-age" class="wc-input" type="number" min="18" max="75" value="${escapeHtml(String(this.state.character.age))}" data-character="age" /></div>
            <div class="wc-field"><label for="wc-character-sex">Sex</label><select id="wc-character-sex" class="wc-select" data-character="sex">${SEX_OPTIONS.map((option) => `<option value="${option.id}" ${this.state.character.sex === option.id ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select></div>
            <div class="wc-field"><label for="wc-scenario-select">Favorite Fallout Game / Show</label><select id="wc-scenario-select" class="wc-select" data-scenario-select>${SCENARIOS.map((item) => `<option value="${item.id}" ${item.id === this.state.scenarioId ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></div>
          </div>
          <div class="wc-choice-card">
            <div class="wc-meter-row" style="margin-bottom:16px;">
              <div class="wc-meter"><span>Points Remaining</span><strong>${remaining}</strong></div>
              <div class="wc-meter"><span>Traits Selected</span><strong>${(this.state.traits || []).length}/2</strong></div>
            </div>
            <div class="wc-grid-2">
              ${SPECIAL_STATS.map((stat) => `
                <div class="wc-stat-card">
                  <div class="wc-stat-head"><strong>${stat.label}</strong><span class="wc-stat-value">${this.state.stats[stat.id]}</span></div>
                  <p>${escapeHtml(stat.description)}</p>
                  <input class="wc-range" type="range" min="${stat.min}" max="${stat.max}" step="1" value="${this.state.stats[stat.id]}" data-stat-id="${stat.id}" aria-label="${stat.label}" />
                </div>
              `).join("")}
            </div>
          </div>
        </div>
        <div class="wc-step-head" style="margin-top:22px;"><div><div class="wc-step-tag">Traits</div><h3 class="wc-step-title">Choose two traits.</h3><p class="wc-step-copy">Each trait gives you a useful advantage and a calculated drawback.</p></div></div>
        <div class="wc-perks">
          ${TRAITS.map((trait) => `
            <label class="wc-perk">
              <input type="checkbox" data-trait-id="${trait.id}" ${this.state.traits.includes(trait.id) ? "checked" : ""} />
              <div class="wc-perk-card">
                <div class="wc-choice-head"><strong>${escapeHtml(trait.label)}</strong><span>${this.state.traits.includes(trait.id) ? "Selected" : "Available"}</span></div>
                <p>${escapeHtml(trait.description)}</p>
              </div>
            </label>
          `).join("")}
        </div>
      `;
    }

    renderStepTwo(previewResult) {
      const scenario = getScenarioById(this.state.scenarioId);
      const companionEffects = calculateCompanionEffects(this.state);
      const questions = getActiveQuestionSet(this.state);
      const answeredCount = getQuestionAnswerCount(this.state);
      return `
        <div class="wc-step-head"><div><div class="wc-step-tag">02 • Gear, Companion, & Scenarios</div><h3 class="wc-step-title">Choose a companion, two items, and answer six survival challenges.</h3><p class="wc-step-copy">Your chosen wasteland determines the story questions. Companion and gear change your survival profile in combat, scavenging, diplomacy, stealth, and luck.</p></div></div>
        <div class="wc-grid-2">
          <div class="wc-choice-card">
            <div class="wc-field"><label for="wc-scenario-select">Favorite Fallout Game / Show</label><select id="wc-scenario-select" class="wc-select" data-scenario-select>${SCENARIOS.map((item) => `<option value="${item.id}" ${item.id === this.state.scenarioId ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></div>
            <p>${escapeHtml(scenario.label)} baseline difficulty: x${scenario.difficultyMultiplier.toFixed(2)}. Tone: ${escapeHtml(VERDICT_TEMPLATES.tones[scenario.tone])}</p>
          </div>
          <div class="wc-choice-card">
            <label class="wc-filter-label" for="wc-companion-filter">Search companions</label>
            <input id="wc-companion-filter" class="wc-input" data-companion-filter value="${escapeHtml(this.state.companionFilter)}" placeholder="Type Dogmeat, Boone, Nick, The Ghoul..." />
            <div class="wc-field" style="margin-top:12px;"><label for="wc-companion-select">Choose one companion</label><select id="wc-companion-select" class="wc-select" data-companion-select size="10">${this.getFilteredCompanions()}</select></div>
          </div>
        </div>
        <div class="wc-step-head" style="margin-top:22px;"><div><div class="wc-step-tag">Inventory</div><h3 class="wc-step-title">Pick two items for your build.</h3><p class="wc-step-copy">Equipment changes your survival strengths and the likely ways the wasteland will test you.</p></div></div>
        <div class="wc-perks">
          ${INVENTORY_ITEMS.map((item) => `
            <label class="wc-perk">
              <input type="checkbox" data-item-id="${item.id}" ${this.state.inventory.includes(item.id) ? "checked" : ""} />
              <div class="wc-perk-card">
                <div class="wc-choice-head"><strong>${escapeHtml(item.label)}</strong><span>${this.state.inventory.includes(item.id) ? "Equipped" : "Available"}</span></div>
                <p>${escapeHtml(item.description)}</p>
              </div>
            </label>
          `).join("")}
        </div>
        <div class="wc-step-head" style="margin-top:22px;"><div><div class="wc-step-tag">Challenges</div><h3 class="wc-step-title">Answer the survival challenges.</h3><p class="wc-step-copy">These questions determine the most dangerous aspects of your build for the chosen wasteland.</p></div></div>
        <div class="wc-questions">
          ${questions.map((question, index) => `
            <article class="wc-question-card">
              <div class="wc-question-count">Challenge ${index + 1}</div>
              <p><strong>${escapeHtml(question.prompt)}</strong></p>
              <div class="wc-answer-list" role="radiogroup" aria-label="${escapeHtml(question.prompt)}">
                ${question.choices.map((choice, choiceIndex) => `
                  <label class="wc-answer" for="wc-${slugify(question.id)}-${choiceIndex}">
                    <input id="wc-${slugify(question.id)}-${choiceIndex}" type="radio" name="wc-${slugify(question.id)}" value="${choiceIndex}" data-question-id="${question.id}" ${this.state.answers[question.id] === choiceIndex ? "checked" : ""} />
                    <span class="wc-answer-option">${escapeHtml(choice.label)}</span>
                  </label>
                `).join("")}
              </div>
            </article>
          `).join("")}
        </div>
        <div class="wc-meter-row" style="margin-top:22px;">
          <div class="wc-meter"><span>Answered</span><strong>${answeredCount}/${questions.length}</strong></div>
          <div class="wc-meter"><span>Companion</span><strong>${escapeHtml(getCompanionById(this.state.companionId)?.label || "None chosen")}</strong></div>
          <div class="wc-meter"><span>Inventory</span><strong>${this.state.inventory.length}/2</strong></div>
        </div>
        <div class="wc-callout"><strong>Hint:</strong> Four questions come from your selected wasteland pack, and two are shared challenges across all builds.</div>
      `;
    }

    renderStepThree(result) {
      const questions = getActiveQuestionSet(this.state);
      return `
        <div class="wc-step-head"><div><div class="wc-step-tag">03 • Final Verdict</div><h3 class="wc-step-title">Your survival odds in the wasteland.</h3><p class="wc-step-copy">Your final build is summarized here. Use download to save a printable result page for your vault notes.</p></div></div>
        <section class="wc-results-grid">
          <div class="wc-result-card wc-result-primary">
            <small>1-month survival chance</small>
            <div class="wc-survival-number">${result.firstMonth}%</div>
            <p>${escapeHtml(result.verdict)}</p>
          </div>
          <div class="wc-result-card">
            <h3>3-month survival chance</h3>
            <div class="wc-survival-number">${result.thirdMonth}%</div>
            <p>Mid-term prospects are shaped by ${escapeHtml(result.strongestCategory)} strength and ${escapeHtml(result.weakestCategory)} weakness.</p>
          </div>
          <div class="wc-result-card">
            <h3>1-year survival chance</h3>
            <div class="wc-survival-number">${result.oneYear}%</div>
            <p>Long-term endurance depends on scavenging, luck, and avoiding ${escapeHtml(result.topCause.label.toLowerCase())}.</p>
          </div>
        </section>
        <section class="wc-result-card">
          <h3>Cause of death breakdown</h3>
          <div class="wc-chart-wrap">
            <div class="wc-chart" role="img" aria-label="Cause of death chart" style="background:${conicGradientForBreakdown(result.causeResult)}"></div>
            <div class="wc-legend">
              ${result.causeResult.map((slice) => `<div class="wc-legend-item"><div class="wc-legend-label"><span class="wc-legend-swatch" style="background:${slice.color}"></span><span>${escapeHtml(slice.label)}</span></div><strong>${slice.percentage}%</strong></div>`).join("")}
            </div>
          </div>
        </section>
        <section class="wc-result-card">
          <h3>Final build summary</h3>
          <div class="wc-sidebar-list">
            ${renderBreakdownRow("Strongest stat", `${result.highestStat.label} ${this.state.stats[result.highestStat.id]}`)}
            ${renderBreakdownRow("Weakest stat", `${result.lowestStat.label} ${this.state.stats[result.lowestStat.id]}`)}
            ${renderBreakdownRow("Top survival lane", capitalize(result.strongestCategory))}
            ${renderBreakdownRow("Most likely failure", result.topCause.label)}
            ${renderBreakdownRow("Companion synergy", result.companionEffects.sameWorld ? "Native-world bonus" : "Cross-world trust penalty")}
          </div>
        </section>
      `;
    }

    render() {
      if (!hasDocument) return;
      if (!this.root) {
        this.mount();
        return;
      }
      const root = this.root.querySelector(".wc-root");
      if (!root) return;
      // Use actual state for preview (do not auto-fill answers). If the UI is untouched,
      // show a neutral 50% baseline so users see a clear starting point.
      const previewResult = calculateResult(this.state);
      if (isPristineState(this.state)) {
        previewResult.finalChance = 50;
        previewResult.tier = getSurvivalTier(previewResult.finalChance);
        previewResult.finalBuckets = { combat: 50, stealth: 50, diplomacy: 50, scavenging: 50, luck: 50 };
        previewResult.answerProfile = {
          totals: { combat: 0, stealth: 0, diplomacy: 0, scavenging: 0, luck: 0 },
          buckets: { combat: 50, stealth: 50, diplomacy: 50, scavenging: 50, luck: 50 },
          answerQuality: 0,
          chosenLabels: [],
        };
        previewResult.lifespan = calculateProjectedLifespan(previewResult.finalChance, this.state, previewResult.finalBuckets, getScenarioById(this.state.scenarioId));
      }
      const result = this.state.currentStep === 3 ? calculateResult(this.state) : previewResult;
      const completionKey = `${result.firstMonth}:${result.thirdMonth}:${result.oneYear}:${this.state.scenarioId}:${this.state.companionId}:${JSON.stringify(this.state.answers)}`;
      if (this.state.currentStep === 3 && this.lastCompletionKey !== completionKey && typeof this.config.onComplete === "function") {
        this.config.onComplete(result);
        this.lastCompletionKey = completionKey;
      }
      root.innerHTML = `
        <header class="wc-topbar">
          <div>
            <div class="wc-kicker"><span>Vault-Tec survival audit</span><span>Deterministic</span></div>
            <h2 class="wc-title">${escapeHtml(this.config.title)}</h2>
            <p class="wc-subtitle">Build your own vault-born survivor, throw them into a real Fallout scenario, and get a brutally personal survival verdict powered by transparent math instead of randomness.</p>
          </div>
          ${this.state.currentStep === 3 ? `<aside class="wc-status" aria-label="Current run status"><small>Projected survival</small><strong>${result.finalChance}%</strong><div>${escapeHtml(result.tier)} in ${escapeHtml(result.scenario?.label || "Unknown")}</div></aside>` : ''}
        </header>
        <section class="wc-progress" aria-label="Wizard progress"><div class="wc-progress-row"><span>Step ${this.state.currentStep}/3</span><span>${escapeHtml(this.getStepLabel())}</span></div><div class="wc-progress-track"><div class="wc-progress-fill" style="width:${(this.state.currentStep / 3) * 100}%"></div></div></section>
        <div class="wc-layout">
          <main class="wc-main-panel">${this.state.currentStep === 1 ? this.renderStepOne(previewResult) : this.state.currentStep === 2 ? this.renderStepTwo(previewResult) : this.renderStepThree(result)}</main>
          ${this.state.currentStep === 2 ? "" : `<aside class="wc-sidebar">${this.renderSidebar(previewResult)}</aside>`}
        </div>
        ${this.renderFooter(this.state.currentStep === 1 ? { canGoBack: false, canGoNext: isStepOneValid(this.state), nextLabel: "NEXT STEP" } : this.state.currentStep === 2 ? { canGoBack: true, canGoNext: isStepTwoValid(this.state), nextLabel: "Reveal Verdict" } : { canGoBack: true, canGoNext: false, nextLabel: "", stepFour: true })}
        <div class="wc-disclaimer">Unofficial fan-made calculator. This widget is not affiliated with Bethesda, Fallout, Prime Video, or Amazon. It uses original styling and deterministic fan-tool logic for entertainment and blog engagement.</div>
      `;
    }
  }

  validateData();

  const api = {
    init(container, config = {}) {
      if (!hasDocument) throw new Error("WastelandCalculator requires a browser environment.");
      const resolvedContainer = typeof container === "string" ? document.querySelector(container) : container;
      if (!resolvedContainer) throw new Error("WastelandCalculator could not find the target container.");
      return new CalculatorApp(resolvedContainer, config).mount();
    },
  };

  globalScope.WastelandCalculator = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      WastelandCalculator: api,
      DATA: { SPECIAL_STATS, TRAITS, INVENTORY_ITEMS, SCENARIOS, COMPANIONS, QUESTION_SETS, DEATH_CAUSE_RULES, VERDICT_TEMPLATES },
      calculateResult,
      validateData,
      buildDefaultState,
      sanitizeIncomingState,
      fillMissingAnswers,
      // Expose slugify and a small renderer for testing question HTML in Node
      slugify,
      renderQuestionsHtmlForState(state) {
        const questions = getActiveQuestionSet(state);
        return questions.map((question, index) => `\n          <article class="wc-question-card">\n            <div class="wc-question-count">Question ${index + 1}</div>\n            <p><strong>${escapeHtml(question.prompt)}</strong></p>\n            <div class="wc-answer-list" role="radiogroup" aria-label="${escapeHtml(question.prompt)}">\n              ${question.choices.map((choice, choiceIndex) => `\n                <label class="wc-answer" for="wc-${slugify(question.id)}-${choiceIndex}">\n                  <input id="wc-${slugify(question.id)}-${choiceIndex}" type="radio" name="wc-${slugify(question.id)}" value="${choiceIndex}" data-question-id="${question.id}" ${state.answers[question.id] === choiceIndex ? "checked" : ""} />\n                  <span class="wc-answer-option">${escapeHtml(choice.label)}</span>\n                </label>\n              `).join("")}\n            </div>\n          </article>\n        `).join("");
      },
    };
  }

  if (hasDocument) {
    const boot = () => {
      document.querySelectorAll("[data-wasteland-calculator]").forEach((node) => {
        if (!node.__wastelandCalculatorMounted) {
          node.__wastelandCalculatorMounted = true;
          api.init(node, {
            title: node.getAttribute("data-title") || DEFAULT_CONFIG.title,
            defaultScenario: node.getAttribute("data-default-scenario") || DEFAULT_CONFIG.defaultScenario,
            showMathPanel: node.getAttribute("data-show-math") !== "false",
            accentColor: node.getAttribute("data-accent-color") || DEFAULT_CONFIG.accentColor,
          });
        }
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
      boot();
    }
  }
})();
