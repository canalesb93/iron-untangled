import type { Chapter } from './types.ts';

/**
 * One entry per chapter of the book: 34 numbered chapters and an epilogue.
 * The book's chapters are untitled; the titles here are ours and are only
 * ever shown for chapters the reader has finished. All text is paraphrase.
 */
export const chapters: Chapter[] = [
  {
    n: 1, label: 'Chapter 1', aboard: 'red', title: 'Last Car on the Red Line', goal: 'Survive the ride and get off at the transfer station.', clock: '10 days to collapse',
    where: 'Aboard a Red Line train, approaching station 83', focus: 's82',
    beats: [
      'The fourth floor begins mid-ride: Carl, Donut, Katia and Mongo arrive in the rear car of a twenty-car subway train.',
      'The floor is named the Iron Tangle, and the clock starts at ten days.',
      'Katia’s Pathfinder maps the train. Car 15 is a Janitor’s Lair, and the party kills the two Jikininki inside.',
      'Monsters board at each stop: Dreks at Sirin Station, Psycho Stickers at Mora Station.',
      'Carl’s traps and a Protective Shell held still while the train moves sweep the boarders away. The party falls back toward car 20, minutes short of station 83.',
      'Donut picks Football Hooligan as her temporary class for the floor.',
    ],
  },
  {
    n: 2, label: 'Chapter 2', title: 'How to Read a Transit Map', goal: 'Work out how to get back to the stairs. They are behind the party, and the trains only go forward.',
    where: 'Transfer station 83', focus: 's83',
    beats: [
      'The party gets off at station 83, a transfer station with a saferoom upstairs.',
      'Carl’s Escape Plan skill and the posted map give the first real rules: coloured lines run one way, from station 11 up to 435.',
      'Saferooms sit at transfer stations. Stairwells sit at 12, 24, 36, 48 and 72 on every coloured line, all of them behind the party.',
      'Mordecai turns up in a new form for this floor, and the loot from the last floor’s chaos is opened.',
      'Three personal spaces are merged into one shared base with a crafting studio and training room.',
    ],
  },
  {
    n: 3, label: 'Chapter 3', title: 'A Message Left Behind', goal: 'Rest, regroup, and start looking for Brandon’s brother Chris.',
    where: 'Personal space, station 83', focus: 's83',
    beats: [
      'A quiet chapter at base. The recap show ranks Carl sixth and Donut seventh.',
      'An announcement changes the stakes: the stairwells stay locked until six hours before the floor collapses.',
      'Other crawlers report that the same station number can turn up on different sets of lines.',
      'Carl receives a message Brandon recorded before he died on the third floor, asking him to find his brother Chris.',
    ],
  },
  {
    n: 4, label: 'Chapter 4', aboard: 'yellow', title: 'The Yellow Line', goal: 'Learn how the trains work, starting with a ride on the Yellow Line.',
    where: 'Station 83, boarding the Yellow Line', focus: 's83',
    beats: [
      'Carl crafts, trades books with the shopkeeper, and studies a map of a named train called the Nightmare Express.',
      'That train runs a five-stop loop that touches a station numbered 436, one past the supposed end of the line.',
      'A stopped train’s monsters cannot reach crawlers on the platform.',
      'Through Katia, Hekla reports that monsters seem to get off at every fifth station. Bautista’s group checks in from station 199.',
      'The party boards a Yellow Line train beside its sealed engine car, which wants a key. Cave Mudge Bonkers attack from the next car, and four more are charging in as the chapter ends.',
    ],
  },
  {
    n: 5, label: 'Chapter 5', title: 'The Conductor Who Could Not Remember', goal: 'Get off a train full of fire ants alive.',
    where: 'Yellow Line, station 83 to Banshee Station 116', focus: 's116',
    beats: [
      'Riding the Yellow Line, the party finds a staff break room and a Reward Room of numbered suitcases.',
      'Vernon the conductor explains what he can: the run from 11 to 435 takes about three days, and after 435 his memory blurs until he is back at a yard.',
      'A monster that once stayed aboard past the last stop came back as bones.',
      'Donut’s suitcase is trapped. The fire ants inside kill Vernon and the party abandons the train at Banshee Station.',
    ],
  },
  {
    n: 6, label: 'Chapter 6', title: 'The Room Behind the Platform', goal: 'Find out what the monsters collect at every fifth station, and move on to transfer station 131.',
    where: 'Banshee Station 116', focus: 's116',
    beats: [
      'In the caves behind the platform the party fights Red Cornets.',
      'A sealed concrete room holds two dormant dwarven automatons behind a sigil only Carl can see. Hekla’s group has found a room like it.',
      'Carl guesses the monsters travel to every fifth stop to collect something.',
      'Bautista passes on a pattern: transfer stations ending in 1 have a Desperado Club, those ending in 9 a Club Vanquisher.',
      'Zev warns that the audience finds Katia dull.',
    ],
  },
  {
    n: 7, label: 'Chapter 7', title: 'The Prize Carousel', goal: 'Reach station 131 and open the fan boxes.',
    where: 'Yellow Line to transfer station 131', focus: 's131',
    beats: [
      'The party rides on to transfer station 131, collecting the Yellow Line’s station list on the way.',
      'Mongo hits level 15 and reaches full size.',
      'Carl’s fan box is a Prize Carousel hosted by Chaco. Mordecai attacks him on sight and is removed from the game for seven days.',
      'Carl’s pick from the carousel is a unique book: the Dungeon Anarchist’s Cookbook.',
    ],
  },
  {
    n: 8, label: 'Chapter 8', title: 'Twenty-Fourth Edition', goal: 'Meet up with Imani and Elle, and find out what the Cookbook is.',
    where: 'Station 131 and the Desperado Club', focus: 's131',
    beats: [
      'The Cookbook is a hidden manual passed between crawlers across seasons. Only its holder can read it, and revealing it destroys it.',
      'In the Desperado Club, Carl and Donut finally meet Imani and Elle in person. Both have chosen new forms. Katia has no pass and stays behind.',
      'Chris is alive, changed, and has left their group.',
      'The chapter ends with a crawler dead on the dance floor and a player-killer skull over Donut’s head.',
    ],
  },
  {
    n: 9, label: 'Chapter 9', title: 'Prime Numbers', goal: 'Two plans: Imani and Elle scout an every-fifth station, and Carl derails a train to make its engineer talk.',
    where: 'The Desperado Club', focus: 's131',
    beats: [
      'The dead crawler, Ji-Hoon, had stabbed Donut in the back while a spellcaster stunned her guards. Donut killed him in self-defence, and Elle killed the spellcaster.',
      'Elle spots the pattern in the map: every known transfer station has a prime number.',
      'A guard hints that the club’s lower levels are tied to the armies of the ninth floor.',
      'Carl bets his 100,000-gold comp chip on the Wheel of Fortune and wins a Scroll of Upgrade, raising his toe ring to +10 Strength.',
      'Two plans form. Imani and Elle will investigate one of the every-fifth stations. Carl will derail a train to force its engineer out.',
    ],
  },
  {
    n: 10, label: 'Chapter 10', title: 'Mining the Ochre Line', goal: 'Set the trap on the Ochre Line and wait for a train.',
    where: 'Base, then an Ochre Line platform at station 149', focus: 's149',
    beats: [
      'Carl builds landmines and the party trains. Katia works on holding a new shape.',
      'Elle reports back from an every-fifth station: several neighbourhood bosses and a borough boss, something called a Krakaren.',
      'On an Ochre Line platform Carl proves the third rail is live, marks the departing train with an X to warn other crawlers, lays Jelly Bomb mines meant to spare the engineer, and waits.',
    ],
  },
  {
    n: 11, label: 'Chapter 11', title: 'Derailment', goal: 'Use what the engineer gave up to find a way back toward the low numbers.',
    where: 'Ochre Line, station 149', focus: 's149',
    beats: [
      'The train derails and the engineer, a boss named Gore-Gore, comes out to fight.',
      'Before he dies on the third rail he explains the end of the line: at 435 the staff leave through a portal that wipes their memories.',
      'The engineer then drives the engine alone through a gate just past 435, back to a depot. Anyone left in the passenger cars does not survive the cleaning.',
      'Carl’s gauntlet nearly summons something called Grull.',
      'Carl gains a sponsor, the Valtay Corporation.',
    ],
  },
  {
    n: 12, label: 'Chapter 12', aboard: 'dismemberment', title: 'The Dismemberment Limited', goal: 'Keep the maglev’s operator alive and see where the train goes.',
    where: 'Station 149, then aboard a named train', focus: 's149',
    beats: [
      'The dead engineer’s map shows the whole Ochre Line. The gaps between later stations grow enormous.',
      'Imani and Elle confirm the every-fifth mystery: a Pooka boss hands out addictive vitamin shots made by a Krakaren, and monsters mutate if they miss a dose.',
      'The party boards the Dismemberment Limited, a maglev run by Levi the Seventh, and a quest begins: keep Levi from being eaten by the Fleshers in the rear cars.',
      'Carl and Katia brace a plate across the connecting door. Donut opens a Hole through it, and Carl pulls the war mage Dismember’s head through as she closes it.',
      'Donut and Katia gain sponsors of their own.',
    ],
  },
  {
    n: 13, label: 'Chapter 13', title: 'Extra Mass', goal: 'Regroup at station 281, then catch the Nightmare Express, a train that loops back.',
    where: 'Mauve Line station 281', focus: 's281',
    beats: [
      'A base chapter at station 281. Carl builds Katia a backpack of raw metal so her shape-changing has more to work with.',
      'Carl’s sponsor box is an implant that lets him analyse portals.',
      'The recap shows the whole floor in disorder: war mages on named trains, wrecked trains blocking routes, and Lucia Mar already near the stairwells.',
      'Zev books Carl and Donut on a show called Planet Beautiful.',
    ],
  },
  {
    n: 14, label: 'Chapter 14', aboard: 'nightmare', title: 'The Nightmare Express', goal: 'Carl: see what is at station 436, then get back to Donut and Katia.',
    where: 'Station 283, then the Nightmare Express', focus: 's283',
    beats: [
      'At station 283 the Nightmare Express pulls in: a steam train hauling open livestock cars full of giant monsters, boarded only from the caboose. Carl will not cross the roofs, so he plans an ambush.',
      'Down the tunnel Carl drops a stationary Protective Shell, and the train’s crew and monsters die against it. Donut makes the platform, but the front of the runaway train scoops Carl onto the locomotive, where the stoker, Fire Brandy, teaches him to drive.',
      'The shell kills three neighbourhood bosses at once. Carl reaches level 32 and finds the Steam Engineer’s Key, good on every steam train.',
      'Carl rides on alone toward station 436. Donut and Katia stay behind at 283.',
    ],
  },
  {
    n: 15, label: 'Chapter 15', title: 'The Abyss', goal: 'Find a working route back to the stairs, and tell everyone else.',
    where: 'Station 436 and the Abyss, then back to 283', focus: 'abyss',
    beats: [
      'Past a switching cavern, Carl reaches Abyss Station and climbs for an hour to the thing itself: a vast burning pit ringed with one-way portals.',
      'Passenger cars are dumped here without their engines. The trains are rebuilt for every run.',
      'The portals open for the right vehicle and the right key, and the souvenir conductor hat every crawler was given counts as a key.',
      'Through one portal Carl sees a fenced trainyard full of what look like zombies.',
      'He broadcasts four possible routes back to the stairwells.',
    ],
  },
  {
    n: 16, label: 'Chapter 16', aboard: 'nightmare', title: 'Withdrawal', goal: 'Clear the overrun station, then try the Station Repair gate.',
    where: 'Station 283, then the switching cavern', focus: 'cavern',
    beats: [
      'Word from Elle and Imani: the sealed robot rooms have woken up and a passage has opened onto a long descending tunnel.',
      'With trains wrecked across the floor, monsters are missing their doses. The party fights its way through a transfer station overrun by Babababoons in second-stage withdrawal.',
      'Transfer stations are no longer safe, and second-stage outbreaks are reported across the network.',
      'The party takes the Nightmare Express back to the switching cavern and stops at the gate marked Station Repair.',
    ],
  },
  {
    n: 17, label: 'Chapter 17', aboard: 'employee', title: 'Trainyard E', goal: 'Get out of the trainyard and head for the low-numbered stations.',
    where: 'Through Station Repair to Trainyard E', focus: 'yard-e',
    beats: [
      'The gate leads to a repair hub, Trainyard E. Its technician Widget explains the zombies before dying.',
      'They are Festering Ghouls: living things made when a monster dies in first-stage withdrawal. The system that should dispose of them is broken.',
      'When the outer wall gives way and Widget is killed, Donut works the turntable and gate from the control tower, and Carl drives the engine out alone.',
      'A named train, Escape Velocity, was the intended way back to the stairwell stations.',
      'A station called Terminus, 433, is not a station at all but a hungry Station Mimic. Carl warns Bautista not to get off there.',
      'An HR worker named Madison comes along as the party leaves on the employee line.',
    ],
  },
  {
    n: 18, label: 'Chapter 18', title: 'The Employee Line', goal: 'Scout the stairwell stations and find somewhere safe to wait.',
    where: 'Employee line: stations 24, 36, 48 and 60', focus: 's60',
    beats: [
      'The employee line gives the first look at stairwell stations: station 24 has five closed stairwells and ten platforms. 36 and 48 match.',
      'Station 60, supposedly where the staff live, is an empty interchange. Madison is left there.',
      'Terminus has swallowed part of Bautista’s group.',
      'The memory-wiping portal at 435 is bound to the life of a single creature, a Kravyad.',
      'Katia shows Carl a coupon Donut threw away: a reward for whoever kills him, one of a set Donut won with her player-killer skull. Carl means to ask Donut about it.',
    ],
  },
  {
    n: 19, label: 'Chapter 19', title: 'Divine Suffering', goal: 'Wait for the stairs to open, and keep an eye on the crawlers stuck at the end of the line.',
    where: 'Near station 41, and the Desperado Club', clock: '4 days, 20 hours to collapse', focus: 's41',
    beats: [
      'With under five days left, the Nightmare Express is parked near station 41.',
      'Imani’s group has ridden the ghoul conveyor to a breached trainyard, Yard D.',
      'Bautista is at station 435, where the Kravyad is threatening to kill itself. Many crawlers have lost their hats.',
      'In the club, Frank gives Carl a ring that marks its wearer’s targets for death.',
    ],
  },
  {
    n: 20, label: 'Chapter 20', title: 'Planet Beautiful', goal: 'Record the show, then deal with uninvited guests at home.',
    where: 'A production trailer, then home', focus: 's41',
    beats: [
      'Carl and Donut record their Planet Beautiful segments in an underwater production trailer. Carl throws out the script he is handed.',
      'Chris kills Frank in the Desperado Club and is banned from it.',
      'The Kravyad at 435 dies by accident and its portal closes, stranding more than 150 hatless crawlers at the end of the line.',
      'The chapter ends with Hekla and about thirty of her people waiting inside the party’s personal space.',
    ],
  },
  {
    n: 21, label: 'Chapter 21', title: 'Brynhild’s Daughters', goal: 'Rescue more than a thousand crawlers trapped at station 101.',
    where: 'Personal space, then station 60', focus: 's60',
    beats: [
      'Hekla and the Daughters of Brynhild propose a joint mission. Among them is Eva, who wears thirteen player-killer skulls.',
      'More than a thousand crawlers are trapped at station 101 on the Vermillion Line.',
      'Station 60 turns out to hold a selector joining twelve Homeward Bound platforms, one per trainyard.',
      'The plan: take a captured Vermillion train with an engine at each end and plough through, with Katia as the cowcatcher. She insists the idea is hers, and Carl tells her she is not expendable; she stays in his party for the rescue.',
      'On the Nightmare Express to station 60 the party meets Tizquick, a conductor grieving a daughter who never existed. Hekla urges speed: the main horde is closing on 101.',
    ],
  },
  {
    n: 22, label: 'Chapter 22', aboard: 'vermillion', title: 'Cowcatcher', goal: 'Punch through to station 101 and get the trapped crawlers out.',
    where: 'Vermillion Line, past station 72 to station 101', focus: 's101',
    beats: [
      'The run up the Vermillion Line passes station 72, where a soul-crystal generator makes one Blister Ghoul for every living monster that dies on the floor.',
      'Every stairwell station has its own horror waiting: Jikininki at 12, Wrath Ghouls at 36, a merging mass of Festering Ghouls at 48.',
      'At station 101 the rescue begins, and the alliance breaks: Donut opens fire on Hekla.',
    ],
  },
  {
    n: 23, label: 'Chapter 23', aboard: 'vermillion', title: 'Rush', goal: 'Survive the fight in the engine cab.',
    where: 'Station 101, in the engine cab', focus: 's101',
    beats: [
      'Eva admits Katia was bait, meant to provoke Carl.',
      'Katia charges Eva, misses, and kills Hekla, the second-ranked crawler on the floor.',
      'The bounty and the experience go to Katia, who jumps more than ten levels.',
    ],
  },
  {
    n: 24, label: 'Chapter 24', aboard: 'vermillion', title: 'Reverse', goal: 'Get the rescued crawlers away from 101, back toward station 75.',
    where: 'Backing down the Vermillion Line toward station 75', focus: 's75',
    beats: [
      'Eva is thrown from the train, alive.',
      'The train reverses away from 101 with the rescued crawlers aboard.',
      'Katia takes Hekla’s key and her crossbow. Silfa says the Daughters are splintering.',
      'Li Jun joins the party in the cab.',
    ],
  },
  {
    n: 25, label: 'Chapter 25', title: 'The Downward Dog', goal: 'Get the rescued crawlers to safety, and find a way to reach the people stranded at the far end.',
    where: 'Station 75', focus: 's75',
    beats: [
      'Station 75 is a repair complex with a bar, the Downward Dog, that is not a saferoom.',
      'Carl uncouples an engine at station 75. Li Jun drives the rest of the train and most of the rescued crawlers on toward station 36.',
      'Crawlers across the floor donate hundreds of hats and a stack of keys for the people stranded at the Abyss.',
      'The leaderboard now reads Carl third, Donut fourth, Katia eighth. Zev warns about someone named Loita.',
    ],
  },
  {
    n: 26, label: 'Chapter 26', title: 'Rapid Response', goal: 'Get the rapid-response carts running for three rescue runs.',
    where: 'Station 75, the cart yard', focus: 's75',
    beats: [
      'The bartender, Growler Gary, is a gnoll who keeps coming back.',
      'The yard holds interdiction carts that can choose any line. Ten rapid-response carts run five times faster than a train and carry a portal on the front.',
      'Each cart needs two gnoll left hands to start. Katia’s gnoll disguise fails, so Mongo kills Gary again and again until they have fourteen; once Carl explains the rescue, Gary agrees to it.',
      'Carl and Bautista plan two carts for each of three stranded groups: the first portals debris and monsters into the Abyss, the second follows about fifteen minutes later and portals the waiting crawlers to a trainyard.',
    ],
  },
  {
    n: 27, label: 'Chapter 27', title: 'Three Lines Out', goal: 'Run three rescues at once.',
    where: 'Station 75', focus: 's75',
    beats: [
      'Carts go out along the Sinopia, Grullo and Mindaro lines.',
      'The Vermillion engine is packed with explosives and sent toward station 36 to thin the horde.',
      'A huge explosion at station 72 kills a group trying to disable the Blister Ghoul generator. Carl suspects they set off its soul crystal.',
      'Third-stage withdrawal has arrived. One dying monster bursts into thousands of tiny Krakaren.',
    ],
  },
  {
    n: 28, label: 'Chapter 28', title: 'Hats', goal: 'Bring the stranded crawlers home.',
    where: 'Down the Mindaro Line to the Abyss, then through a portal to Yard H', focus: 'yard-h',
    beats: [
      'The Mindaro rescue fails: the second cart probably caught the first and portalled it to a trainyard, so the party goes down the line itself.',
      'Carl, Donut, Katia and Mongo ride a rapid-response cart the length of the Mindaro Line, past 432 and 433, to the end.',
      'The mimic posing as station 433 is accidentally teleported into Trainyard E.',
      'Bautista’s six hundred walk through an Abyss portal wearing donated hats and come out in Yard H.',
      'Just over fourteen hundred crawlers are moved across the three lines to where they have a chance at the stairwells. The rescued return their hats to Donut.',
    ],
  },
  {
    n: 29, label: 'Chapter 29', title: 'Seven Days Later', goal: 'Get back to the low stations and dig in near the stairs.',
    where: 'Back past station 24 to the saferoom at station 59', focus: 's59',
    beats: [
      'On the way back the party passes a station 24 crawling with thousands of young Krakaren.',
      'Bautista shares gear: his stuffed figures summon the real thing.',
      'Katia’s fan box gives her a riot shield and baton. A benefactor box holds a bolt that can briefly break a god’s invulnerability.',
      'The recap reveals a hidden stairwell at station 433.',
      'The last regular announcement locks parties for the next floor, opens crawler chats to paying viewers and bans loose liquids from inventories.',
      'Mordecai’s seven days are up and he returns. The liquid ban forces out the blood Katia stored as the cowcatcher, soaking the personal space but not her.',
    ],
  },
  {
    n: 30, label: 'Chapter 30', title: 'Half a Map', goal: 'Get ready for the stairs to open, and work out what this floor really is.',
    where: 'Personal space, station 59', focus: 's59',
    beats: [
      'Mordecai admits attacking Chaco was a mistake, then confronts Carl over the Ring of Divine Suffering, which could get him hunted. Carl takes it off, and Mordecai fits out the workshop with new benches.',
      'Mordecai studies Katia’s expanded map. Seen from above, the named trains’ loops draw the Syndicate’s logo; the Abyss stands for the galactic centre and the lines for old worm paths.',
      'The drug story is Borant propaganda.',
      'Katia works out that every line has a twin on the far side: the map everyone has been using is half the structure.',
      'Carl suspects the stairwell stations hide one last trap.',
    ],
  },
  {
    n: 31, label: 'Chapter 31', title: 'Self-Destruct', goal: 'Hold station 36 until the stairs open.', clock: '1 day to collapse',
    where: 'A station 36', focus: 's36',
    beats: [
      'Carl warns crawlers off the stairwell stations. At station 36 Zhang shrinks a rapid-response cart with a wand, and the party hangs it from a crane, portal down, over the central circle.',
      'With one day left the floor announces a self-destruct sequence. Stairwells will open in eighteen hours, for six.',
      'At station 36, sections of floor drop away and Krakaren pour up from the mirrored chamber beneath.',
      'The hanging cart’s portal catches thousands of them and sends them to the Abyss.',
      'Two nearby soul-crystal generators explode when too many monsters die at once. Madison is reported killed by awakened dwarves and gremlins.',
    ],
  },
  {
    n: 32, label: 'Chapter 32', title: 'The Noodle', goal: 'Stop what is coming up under the stairwell stations.',
    where: 'Station 36, then past station 24 to the employee-line entrance at Trainyard E', focus: 'yard-e',
    beats: [
      'A gravity-bending tunnel the crawlers call the noodle connects each stairwell chamber to its upside-down twin.',
      'Carl meets Prepotente and Miriam Dom in person. Li Na, Li Jun and Zhang join the mission.',
      'The huge boss beneath station 36 is sent to the Abyss.',
      'At the trainyard a mantaur drags Carl through a portal.',
    ],
  },
  {
    n: 33, label: 'Chapter 33', title: 'Death Challenge', goal: 'Survive the Death Challenge.',
    where: 'Trainyard E', focus: 'yard-e',
    beats: [
      'In Trainyard E a Death Challenge traps Carl with the displaced mimic and the incoming war god Grull. Grull’s sponsor is Prince Maestro, alive after all.',
      'Grull kills the mimic with one blow and turns on Carl, who survives on potions. Elle distracts him with ice, and Katia, disguised as Carl, draws him off.',
      'The others bring the second mantaur in through the portal cart. It is thrown through the portal, and the new summoning pulls Grull into the Abyss.',
      'The challenge ends, the Nightmare Express arrives, and Carl collapses.',
    ],
  },
  {
    n: 34, label: 'Chapter 34', title: 'Last Train', goal: 'Get everyone down the stairs.',
    where: 'Trainyard E, then the stairwell at station 36', focus: 's36',
    beats: [
      'The party sets the rapid-response cart on the employee track with its portal onto the Abyss. Carl loads the Nightmare Express with explosives; Fire Brandy and Tizquick refuse to leave it, drive it through, and it explodes in the Abyss.',
      'The blast overloads the remaining generators, and Bautista’s group can now reach the stairs.',
      'Back at station 36 the stairwell is already open and the others are waiting. The party descends.',
      'Loita announces herself.',
      'Carl writes his own entry in the Cookbook.',
    ],
  },
  {
    n: 35, label: 'Epilogue', title: 'The Next Door', goal: 'Face the fifth floor.',
    where: 'Odette’s trailer, then a staging room',
    beats: [
      'Loita has taken over PR from Zev, who has been sent away for re-education.',
      'Odette admits she was Hekla’s sponsor.',
      'The audience voted on the fifth floor’s theme. Donut spins the wheel for their starting quadrant.',
      'The book closes at a doorway onto a desert.',
    ],
  },
];
