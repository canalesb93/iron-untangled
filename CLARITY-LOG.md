# Clarity log

What was tried to make the map easier to understand, and why. One entry per iteration; each tries something new.

## 1. Situation briefing and route playback (2026-11-20)

**Problem.** A reader landing on a chapter saw a recap and an abstract spiral, but no plain answer to the questions they actually have: where are they, what are they trying to do, and why is that hard?

**Tried.**
- A four-row briefing at the top of the Chapter tab: *Where they are*, *What they're trying to do* (a new per-chapter `goal`, written as of the end of that chapter with no hindsight), *Way out* (computed: the nearest stairwell number below the party's station and how many stations back it is, "the way the trains don't go"), and *Time* (latest stated countdown).
- Changing chapter now frames that chapter's journey and walks the party marker along it, drawing the route in red as it goes, so moving through chapters moves the party around the map.

**Spoiler safety.** Goals ship only in bundles for chapters already read (same gate as titles and beats; the lint now also checks `goal`). The way-out line uses only stations already in the bundle.

## 2. The number line (2026-11-20)

**Problem.** The core puzzle of the floor is one-dimensional: every coloured line counts the same stations from 11 to 435, trains only go up, and the stairs are all at low numbers behind the party. The spiral map buries that under geometry, so it is hard to see why getting out is hard.

**Tried.** A straight strip above the chapter controls that draws the floor as one number line: stairs as gold squares with their numbers, the end of the line, every station number the reader knows (filled once the party has been there), the party as a red dot with its station number, a dashed gold gap from the party back to the nearest stairs, and "trains only run this way →". When the party leaves the numbered lines (the Abyss, a trainyard) it says so in words. Tapping a station opens its codex entry. It appears from chapter 2, when the book states the 11-to-435 rule, so the scale itself gives nothing away in chapter 1.

**Spoiler safety.** Built only from stations already in the reader's bundle; spacing is a fixed square-root scale that does not encode which numbers matter.

## 3. A map key that changes with the chapter (2026-11-20)

**Problem.** The map uses a lot of visual vocabulary (solid vs dotted track, rings, diamonds, gold squares, black-and-white named-train lines, a glowing disc) and none of it was explained anywhere except one paragraph in About.

**Tried.** A "Map key" card (toggle in the top bar; open by default on desktop, closed on phones) with a small drawing of each mark next to a plain sentence. It lists only what the current chapter's map actually draws, so it starts with five entries in chapter 1 and grows as the map does. Wording also changes with what the reader knows: transfer stations only mention saferooms once the book has said so.

**Spoiler safety.** The key's entries and wording are built at build time inside each chapter's bundle, so the app code downloaded by everyone doesn't name later symbols, and the spoiler lint checks the wording like any other text (it caught "the way down", an embargoed phrase, on the first try).

## 4. Spotlight on this chapter (2026-11-20)

**Problem.** By the middle of the book the map carries a dozen lines, rings and thirty-odd stations at equal weight, so the chapter you just read is lost in everything you read before it.

**Tried.** A "This chapter / All" toggle (spotlight on by default). In spotlight, anything the current chapter touched stays at full strength with larger labels: where the party went, the lines they rode, and every place or line that is new or updated this chapter. Everything else fades back, and faded stations lose their labels until hovered or selected. "All" restores the even view. On phones the toggle reads "Now / All".

**Spoiler safety.** Purely a rendering change over the existing bundle; it decides relevance only from stamps at or before the current chapter.

## 5. Typography and hierarchy pass (2026-11-20, at the user's request)

**Problem.** The user disliked the fonts. Three faces (a condensed all-caps display face, a serif, and a letter-spaced monospace for labels) made the interface feel busy and hard to scan, and shouting capitals flattened the hierarchy.

**Tried.** One family, Inter, everywhere: map labels, headings, body and controls. Sentence case throughout, no letter-spaced caps, weight and size carry the hierarchy instead. The chapter panel now reads top to bottom as: chapter number, title, the situation card, then "What happened"; the duplicated location line and clock under the title were removed because the situation card already says both.

## 6. Glossary of the book's jargon (2026-11-20)

**Problem.** Much of what's confusing isn't the map at all but the book's vocabulary: saferoom, personal space, borough boss, fan box, Desperado Club, player-killer skull, engineer's key, sponsor. The recaps used those words without explaining them.

**Tried.** A chapter-stamped glossary (`content/glossary.ts`, 22 terms). In the recap, the situation card and every codex note, the first mention of a known term gets a dotted underline; tapping it opens a small card with a plain definition and a link to all terms. A new "Terms" section in the Codex lists every term met so far, with a "New" badge in the chapter that introduces it.

**Spoiler safety.** Terms are entities with their own reveal chapter, so the lint checks both their names and definitions. Writing them turned up a small existing leak: the Red Line was tagged "Coloured line" in chapter 1, a chapter before the book introduces coloured lines. It now says "Train line" until then. The rendered-page test now also opens every card in the Terms section.

## 7. Who's where (2026-11-20)

**Problem.** Book 3 scatters a large cast across the floor: friends from earlier books turn up, split off, get stranded, join for a rescue, or die. The codex described each person but never answered the reader's most common question, "wait, where is so-and-so right now?"

**Tried.** A "Who's where" tab next to Chapter. Every known character is sorted into *With the party*, *Elsewhere on the floor*, *Off the floor* (the show and sponsors), *Whereabouts unknown* and *Dead*, each with a one-line location ("Stuck at station 435", "Left at station 60"). A summary line gives the counts, and anyone whose situation changed in this chapter is pulled to the top. Tapping a person opens their codex entry.

**Spoiler safety.** Whereabouts are a new chapter-stamped field on each person (`content/people.ts`); the bundle carries only the latest entry at or before the reader's chapter, and the lint now requires every person to have one and none to predate their reveal. The rendered-page test opens this tab at every chapter. I left out one status I could not confirm from the sources rather than guess.

## 8. A guided tour of the interface (2026-11-20)

**Problem.** The site has grown a lot of parts (situation card, number line, spotlight, key, glossary, who's where), and a first-time visitor has no way to know they exist or what to look at first.

**Tried.** A seven-step tour that runs once, right after the welcome screen, and can be replayed from About ("Show me around"). Each step dims the screen except the part it's describing (the fog, the party dot, the situation card or the chapter button on phones, the number line, the tabs, the chapter controls, the top bar) with a short plain explanation. Steps whose element isn't on screen are skipped, so a reader who starts before chapter 2 never hears about the number line. On phones it opens and closes the notes sheet as it goes.

**Spoiler safety.** The tour text describes controls only, never the story.

## 9. Labels that don't collide (2026-11-20)

**Problem.** Station names were always drawn to the right of their marker, so neighbouring stations printed on top of each other (72 over 60, 281 over 283, the far-end cluster near the centre), and a reader couldn't tell which name belonged to which dot.

**Tried.** A small label-placement pass that runs whenever the map is drawn or the zoom changes noticeably. Stations are placed in order of importance (the party's station, then anything this chapter touched, then transfers, stairwells and yards, then the rest), and each label tries eight positions around its marker, avoiding other labels and other markers. A minor label with nowhere to go is hidden until hovered or selected; important ones are always shown.

**Spoiler safety.** Rendering only; works from the stations already in the bundle.

## 10. "Walk me through it" story mode (2026-11-20)

**Problem.** The recap and the map sat side by side but didn't talk to each other: a reader had to work out for themselves which dot a sentence like "the party abandons the train at Banshee Station" referred to.

**Tried.** Two links between text and map. (1) A "Walk me through it" button above each chapter's recap starts a step-by-step mode: one event at a time in a caption card over the map, with Back/Next (or arrow keys), progress dots, and the map moving to and highlighting the place that event mentions; if it names a line instead, the line is highlighted; if it names nothing, the map frames the chapter's journey. On phones the notes sheet closes so the map is visible. (2) In the normal recap, any event that names a mapped place is clickable and jumps the map there.

**Spoiler safety.** Uses only the current chapter's beats and places already in the bundle. Changing chapter ends story mode.

## 11. Journey: how they got here (2026-11-20)

**Problem.** The party zig-zags across the floor by train, maglev, steam train, staff track, on foot and through gates. The map shows where they've been but not the order or the means, so "how did they end up here?" had no direct answer.

**Tried.** A "Journey" tab that prints the party's route like a trip planner, newest chapter first: a card per chapter with stops as dots joined by a bar in the colour of the line they rode (dotted for on foot or an undescribed route, dashed purple for a gate), with notes like "Carl alone; Donut and Katia stay at 283". Consecutive legs on the same line collapse into one bar with calling points. The current chapter's card is outlined; tapping a card's title jumps to that chapter. The tab bar now scrolls sideways on narrow screens.

**Spoiler safety.** Built from the hops already in the bundle; the rendered-page test now opens this tab at every chapter.

## 12. Open questions (2026-11-20)

**Problem.** A lot of the book's pull, and a lot of its confusion, is unresolved mysteries: why the monsters get off every fifth stop, what 436 is, what the robots are for. Readers lose track of which ones the book has already answered and which are still hanging.

**Tried.** Twelve chapter-stamped questions (`content/questions.ts`), each raised in the chapter that raises it, with notes as later chapters add clues, and an answer in the chapter that settles it. The Chapter tab now ends with *Answered this chapter* (green ticks) and *Still unanswered* with a count, each showing the latest clue. A "Questions" section in the Codex lists them all.

**Spoiler safety.** Questions are linted like other entities, plus two new checks: a question marked closed must carry its answer in that chapter, and no note may say "Answered" before the closing chapter. The rendered-page test opens every question card at every chapter. While building it, a layout bug turned up (tappable glossary words nested inside the question buttons); fixed by not underlining terms there.

## 13. Cutaway diagrams (2026-11-20)

**Problem.** The book describes its building blocks in passing: a twenty-car train with special cars at 1, 5, 10 and 15; a station with a saferoom upstairs, club doors, caves behind the platform and a cavern at every fifth stop; a stairwell chamber with five stairs and ten exits. Readers have to hold all of that in their heads, and the transit map can't show it.

**Tried.** A "Diagrams" tab with three labelled cutaways: the train (twenty numbered cars, the meaningful ones filled and called out), a transfer station in cross-section, and a stairwell station seen from above. Each part is drawn only once the book has explained it, and its label updates as the reader learns more (the engine car goes from "sealed, needs a key" to "the engineer only comes out if the train is wrecked"). The book's own track diagram, previously its own tab, now sits at the bottom of this one. Tabs were tightened to fit five across.

**Spoiler safety.** The drawings are generic shapes; every label and which parts are drawn come from the bundle, and diagrams are linted like other entities. The rendered-page test opens the tab at every chapter.

## 14. Character profiles (2026-11-20, at the user's request)

**Problem.** "Who's where" said where people were, but not who they are, and the codex entries were a flat list of notes. The user asked for proper profiles, and for them to be careful about location information.

**Tried.** Tapping anyone in "Who's where" (or any person chip) opens a profile in place: initials avatar with a status dot, their race and class as currently known, whether they're from the earlier books or which chapter introduces them, a "Right now" card, their story so far as dated notes, a "Where they've been" timeline (each entry jumps to its chapter), and the chapters whose notes mention them. "← Everyone" returns to the list.

**Spoiler safety (the "be smart" part).** Location shows only the latest whereabouts stamped at or before the reader's chapter, and the card says how fresh it is: "Updated this chapter", "As far as you know from the earlier books", or "Nothing new on this since chapter 8, 12 chapters ago", so a reader never mistakes old information for current. "Show this place on the map" only appears when that place is already on the reader's map: at chapter 19 Bautista is "Stuck at station 435", but 435 has no spot on the map yet, so there's no button. The history timeline is cut at the reader's chapter in the bundle itself.

## 15. Smooth transitions, tapering lines, a key that follows the selection (2026-11-20, at the user's request; final iteration)

**Problem.** The user saw the fog "jarringly flashing" during animations, asked for incomplete lines to fade out rather than stop dead, and for the map key to highlight whatever is selected. Separately they spotted station 75 drawn as a trainyard.

**Found and fixed (transitions).**
- A newly ridden line flashed in at triple thickness before shrinking. It now fades in gently.
- On a chapter change the party marker appeared at its destination, then jumped back to the start of the route before travelling. It now starts at the start, and fades in when you skip several chapters at once.
- When zoomed out, the cloud texture was scaled differently from how it moved, so it slid across the map during camera moves. It is now fixed to the map at every zoom.
- When the notes sheet opened or the number line appeared, the map re-centred in a single frame. It now glides.
- Clicking through chapters quickly reset an in-progress fog fade. The fade now continues from what was on screen.
- Camera and fog animations started timing before the heavy redraw finished, so their first frame jumped. They now start on the first frame actually drawn.

Measured after the fixes by sampling every frame through 26 chapter changes on desktop and phone: the fog never changes more than about 4% of the screen per frame, and stepping chapter by chapter the party never moves more than about 36 px per frame.

**Also.** Dotted "known but not seen" lines taper away at any end that isn't the real end of the line (11 or 435). Selecting a place or line highlights its entry in the map key. Station 75 is now drawn as an unusual station (diamond) rather than a trainyard square.

## 16. Less on screen (2026-11-21, at the user's request)

**Problem.** Fifteen rounds of additions left the side panel overloaded: five tabs, a four-row situation card, the full recap, questions, chips and a chapter log all open at once, plus a number line under the map.

**Changed.**
- Three tabs instead of five: Chapter, People, Reference. Journey and Diagrams moved into Reference alongside places, lines, bestiary, rules, questions and terms.
- The Chapter tab is now a title, a two-line card (Where, Goal) with one small line for stairs distance and the clock, and three collapsed sections (What happened, New this chapter, Questions) that show only a count until opened. The "story so far" list is gone; the chapter dots already do that job.
- The number line is no longer on the main screen. It lives in Reference → Diagrams, from chapter 2 (where the book states the 11-to-435 rule).
- The map key starts closed. On desktop the panel is only as tall as its content.
- The welcome screen's dropdown is replaced with a grid of chapter buttons, and its text is cut to two sentences.

**Spoiler safety.** The rendered-page test now opens every collapsed section before reading the page, so folded content is still checked.

## 17. Faces on the map, and getting on and off

**Problem.** The party was a red dot, and nothing said whether they were on a train or standing on a platform. Profiles were initials in a circle.

**Tried.**
- Portraits. No official or fan art is free to reuse (checked the author, publisher, wiki, Commons and the adaptations), so the five travellers known from the earlier books have original drawings in `src/portraits.ts`. Everyone else gets a monogram, so no later character's looks are given away.
- The party marker is now a row of faces. Riding: the row sits in a car in the line's colour with a "Riding · line" caption. Off the train: a plain white card.
- Changing chapter plays the trip leg by leg: gets on, rides, gets off, with up/down badges left on the map where it happened.
- A Travel row on the chapter tab lists the same events in words, and says how the chapter ends (riding or off the trains). The Journey list uses the same wording.
- People last heard of at a known station show as small faces there, for four chapters after the last news of them.
- Profile pages: big portrait, tag chips, one merged timeline by chapter, previous/next.

**Data.** `Chapter.aboard` records what they are riding when a chapter ends; `Hop.who`, `Hop.board`, `Hop.off` cover the exceptions. The slicer derives on/off for each leg using only chapters already read. Checked against the chapter summaries; legs the summaries don't describe stay "a ride the book doesn't name".

## 18. Chapter changes that don't pop

**Problem.** Changing chapter felt jarring. Filming it frame by frame (`node scripts/frames.ts <from> <to> <out.png>`) showed why: the drawing was swapped in one frame while the fog took two seconds, so going back left an empty hole in the fog, and going forward the party flashed at its destination before the trip replayed.

**Tried.**
- First attempt: fade the whole new drawing in over a frozen copy of the old one. Rejected. Anything that shifted a little (labels, the party) showed double, and in a real browser the CSS fade let large layers go blank in rectangular patches.
- What shipped: the new drawing is compared piece by piece with the old. Pieces in both stay exactly as they are. New pieces fade in. Pieces that are gone fade out on a layer of their own, driven from the frame loop. Spotlight dimming eases over the same way.
- The fog is a true blend between the old and new masks in both directions.
- The trip replay sets its opening pose before the first frame is drawn. The same faces keep their elements, so the car and wheels ease in and out around them.
- Labels keep the spot they had if it is still free, and fade if they lose it. New-place pops don't replay when stepping back.
- Flat, the drawing surface is now the size of the window (it was a square about 2.4 times the area, needed only when tilted), so each frame is cheaper.
- Black flashes while the camera moved: the small looping animations in the map (pulse rings, fades, pops) ran on the browser's compositor, which split the drawing into dozens of layers and let the browser leave parts blank. They now animate through properties the compositor can't take over (`node scripts/layers.ts` measures this: zero compositor animations in the map, at rest and mid-change).
