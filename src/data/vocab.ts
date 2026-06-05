export type Difficulty = "easy" | "medium" | "hard";
export type ExamType = "sat" | "act" | "both";

export interface VocabWord {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  difficulty: Difficulty;
  frequency: number; // 1-5
  exam: ExamType;
  definition: string;
  studentDefinition: string;
  satContext: string;
  prefix?: string;
  root: string;
  suffix?: string;
  rootMeaning: string;
  mnemonic: string;
  example: string;
}

export const VOCAB: VocabWord[] = [
  // --- shared SAT/ACT core ---
  { id: "benevolent", word: "Benevolent", pronunciation: "/bəˈnevələnt/", partOfSpeech: "adjective", difficulty: "medium", frequency: 5, exam: "both",
    definition: "Well meaning and kindly.", studentDefinition: "Wanting to do good for other people.",
    satContext: "The benevolent philanthropist funded scholarships for low-income students.",
    prefix: "bene", root: "vol", suffix: "ent", rootMeaning: "bene = good · vol = wishing · ent = adjective form",
    mnemonic: "Kind grandparent — BEN — handing out cookies.", example: "She was known for her benevolent gestures." },
  { id: "loquacious", word: "Loquacious", pronunciation: "/loʊˈkweɪʃəs/", partOfSpeech: "adjective", difficulty: "hard", frequency: 4, exam: "sat",
    definition: "Tending to talk a great deal.", studentDefinition: "That friend who never stops talking.",
    satContext: "Though typically reserved, the senator became loquacious when discussing law.",
    root: "loqu", suffix: "acious", rootMeaning: "loqu = speak · acious = full of",
    mnemonic: "LOW-QUAY-SHUS — parrot named Quay who won't shut up.", example: "Her loquacious uncle dominated dinner." },
  { id: "ephemeral", word: "Ephemeral", pronunciation: "/əˈfemərəl/", partOfSpeech: "adjective", difficulty: "medium", frequency: 5, exam: "both",
    definition: "Lasting for a very short time.", studentDefinition: "Here today, gone tomorrow.",
    satContext: "Critics argued the trend's popularity would prove ephemeral.",
    prefix: "epi", root: "hemer", suffix: "al", rootMeaning: "epi = upon · hemer = day · al = relating to",
    mnemonic: "EPIC day vanishes by morning.", example: "The beauty of a sunset is ephemeral." },
  { id: "ubiquitous", word: "Ubiquitous", pronunciation: "/yo͞oˈbikwədəs/", partOfSpeech: "adjective", difficulty: "hard", frequency: 5, exam: "both",
    definition: "Present everywhere.", studentDefinition: "Literally everywhere you look.",
    satContext: "Smartphones have become ubiquitous in modern classrooms.",
    root: "ubique", suffix: "ous", rootMeaning: "ubique = everywhere", mnemonic: "UBER is UBIQUITOUS.",
    example: "Coffee shops are ubiquitous." },
  { id: "candid", word: "Candid", pronunciation: "/ˈkandəd/", partOfSpeech: "adjective", difficulty: "easy", frequency: 4, exam: "both",
    definition: "Truthful and straightforward.", studentDefinition: "Saying exactly what you mean.",
    satContext: "In a candid interview, the author admitted her draft was unreadable.",
    root: "cand", suffix: "id", rootMeaning: "cand = white, bright",
    mnemonic: "CANDID photo = unfiltered.", example: "He gave a candid review." },
  { id: "pragmatic", word: "Pragmatic", pronunciation: "/praɡˈmadik/", partOfSpeech: "adjective", difficulty: "medium", frequency: 5, exam: "both",
    definition: "Dealing with things sensibly and realistically.", studentDefinition: "Practical — what actually works.",
    satContext: "Her pragmatic approach to the budget impressed the board.",
    root: "pragma", suffix: "tic", rootMeaning: "pragma = deed, action",
    mnemonic: "A PRO is PRAGMATIC — cares about results.", example: "We need a pragmatic solution." },
  { id: "ambiguous", word: "Ambiguous", pronunciation: "/amˈbiɡyo͞oəs/", partOfSpeech: "adjective", difficulty: "medium", frequency: 5, exam: "both",
    definition: "Open to more than one interpretation.", studentDefinition: "Could mean two things.",
    satContext: "The poem's ambiguous ending invites multiple interpretations.",
    prefix: "ambi", root: "ag", suffix: "ous", rootMeaning: "ambi = both",
    mnemonic: "AMBI = both ways.", example: "His ambiguous response left everyone confused." },
  { id: "scrutinize", word: "Scrutinize", pronunciation: "/ˈskro͞otnˌīz/", partOfSpeech: "verb", difficulty: "medium", frequency: 4, exam: "both",
    definition: "Examine closely.", studentDefinition: "Look at something REALLY carefully.",
    satContext: "Editors scrutinize every sentence before publication.",
    root: "scrut", suffix: "inize", rootMeaning: "scrut = search carefully",
    mnemonic: "SCREW in a tiny lens to inspect.", example: "She scrutinized the contract." },
  { id: "tenacious", word: "Tenacious", pronunciation: "/təˈnāSHəs/", partOfSpeech: "adjective", difficulty: "medium", frequency: 4, exam: "both",
    definition: "Holding firmly; persistent.", studentDefinition: "Refuses to give up.",
    satContext: "Her tenacious pursuit of justice exposed the fraud.",
    root: "ten", suffix: "acious", rootMeaning: "ten = hold",
    mnemonic: "TENNIS player who never drops a point.", example: "He had a tenacious grip on the rope." },
  { id: "verbose", word: "Verbose", pronunciation: "/vərˈbōs/", partOfSpeech: "adjective", difficulty: "medium", frequency: 3, exam: "sat",
    definition: "Using more words than needed.", studentDefinition: "Uses 100 words when 10 would do.",
    satContext: "The professor's verbose lectures obscured his main points.",
    root: "verb", suffix: "ose", rootMeaning: "verb = word",
    mnemonic: "VERB + OSE = overflowing with words.", example: "His verbose emails are exhausting." },
  { id: "austere", word: "Austere", pronunciation: "/ôˈstir/", partOfSpeech: "adjective", difficulty: "hard", frequency: 4, exam: "sat",
    definition: "Severe or strict; plain.", studentDefinition: "Strict, plain, no frills.",
    satContext: "The monk lived an austere life in the monastery.",
    root: "auster", suffix: "e", rootMeaning: "auster = harsh",
    mnemonic: "AUSTERE sounds like 'OH STEER clear' of comfort.", example: "Her austere office had only a desk." },
  { id: "capricious", word: "Capricious", pronunciation: "/kəˈpriSHəs/", partOfSpeech: "adjective", difficulty: "hard", frequency: 4, exam: "sat",
    definition: "Given to sudden mood changes.", studentDefinition: "Mood swings — unpredictable.",
    satContext: "The capricious weather forced the cancellation.",
    root: "capric", suffix: "ious", rootMeaning: "capric = goat (jumps around)",
    mnemonic: "CAPRI goat JUMPS unpredictably.", example: "His capricious boss changed strategy weekly." },

  // --- ACT-favored vocabulary ---
  { id: "infer", word: "Infer", pronunciation: "/ɪnˈfɜr/", partOfSpeech: "verb", difficulty: "easy", frequency: 5, exam: "act",
    definition: "Deduce from evidence and reasoning.", studentDefinition: "Figure out from clues.",
    satContext: "From the data, scientists infer a warming climate trend.",
    prefix: "in", root: "fer", rootMeaning: "in = into · fer = carry",
    mnemonic: "INFER = carry meaning INTO your head.", example: "I infer she's tired from her tone." },
  { id: "hypothesis", word: "Hypothesis", pronunciation: "/haɪˈpɑːθəsɪs/", partOfSpeech: "noun", difficulty: "easy", frequency: 5, exam: "act",
    definition: "A proposed explanation to be tested.", studentDefinition: "A scientific guess to test.",
    satContext: "The researchers' hypothesis was supported by experimental data.",
    prefix: "hypo", root: "thesis", rootMeaning: "hypo = under · thesis = placing",
    mnemonic: "Place an idea UNDER testing.", example: "Her hypothesis predicted the outcome." },
  { id: "variable", word: "Variable", pronunciation: "/ˈvɛriəbl/", partOfSpeech: "noun", difficulty: "easy", frequency: 5, exam: "act",
    definition: "A factor that can change in an experiment.", studentDefinition: "Something that can change.",
    satContext: "Temperature was the independent variable in the study.",
    root: "var", suffix: "iable", rootMeaning: "var = change",
    mnemonic: "VARY-able = can vary.", example: "Identify the variable before testing." },
  { id: "concur", word: "Concur", pronunciation: "/kənˈkɜr/", partOfSpeech: "verb", difficulty: "medium", frequency: 4, exam: "act",
    definition: "Agree; happen at the same time.", studentDefinition: "Agree with someone.",
    satContext: "Two reviewers concur that the data is reliable.",
    prefix: "con", root: "cur", rootMeaning: "con = together · cur = run",
    mnemonic: "Two ideas RUN TOGETHER.", example: "I concur with the committee's findings." },
  { id: "synthesize", word: "Synthesize", pronunciation: "/ˈsɪnθəsaɪz/", partOfSpeech: "verb", difficulty: "medium", frequency: 4, exam: "both",
    definition: "Combine separate elements into a whole.", studentDefinition: "Mix ideas into one explanation.",
    satContext: "The essay synthesizes data from three studies.",
    prefix: "syn", root: "thes", suffix: "ize", rootMeaning: "syn = together · thes = place",
    mnemonic: "SYN = together, place pieces together.", example: "Synthesize the readings before writing." },
  { id: "concise", word: "Concise", pronunciation: "/kənˈsaɪs/", partOfSpeech: "adjective", difficulty: "easy", frequency: 5, exam: "act",
    definition: "Brief and to the point.", studentDefinition: "Short and clear.",
    satContext: "The ACT English section rewards concise writing.",
    prefix: "con", root: "cis", suffix: "e", rootMeaning: "cis = cut",
    mnemonic: "CUT the fluff — concise.", example: "Keep your answer concise." },
  { id: "redundant", word: "Redundant", pronunciation: "/rɪˈdʌndənt/", partOfSpeech: "adjective", difficulty: "medium", frequency: 5, exam: "act",
    definition: "Repetitive; unnecessary.", studentDefinition: "Says the same thing twice.",
    satContext: "Remove the redundant phrase to tighten the sentence.",
    prefix: "re", root: "und", suffix: "ant", rootMeaning: "re = again · und = overflow",
    mnemonic: "RE-said again = redundant.", example: "'PIN number' is redundant." },
  { id: "elaborate", word: "Elaborate", pronunciation: "/ɪˈlæbərət/", partOfSpeech: "verb/adj", difficulty: "medium", frequency: 4, exam: "both",
    definition: "Develop in detail; intricate.", studentDefinition: "Add more detail.",
    satContext: "Please elaborate on your reasoning.",
    prefix: "e", root: "labor", suffix: "ate", rootMeaning: "e = out · labor = work",
    mnemonic: "WORK something OUT in detail.", example: "She elaborated on her plan." },
  { id: "coincide", word: "Coincide", pronunciation: "/ˌkoʊɪnˈsaɪd/", partOfSpeech: "verb", difficulty: "medium", frequency: 3, exam: "act",
    definition: "Happen at the same time; correspond.", studentDefinition: "Happen together.",
    satContext: "The peaks of the two graphs coincide.",
    prefix: "co", root: "incid", rootMeaning: "co = together · incid = fall upon",
    mnemonic: "Two events FALL UPON the same moment.", example: "Our trips coincide nicely." },
];
