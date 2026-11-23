/**
 * Spoiler lint. Fails the build if any chapter bundle contains knowledge
 * from a later chapter. Three independent checks:
 *
 *  1. Structural: nothing in bundle N is stamped with a chapter > N.
 *  2. Secret terms: every entity's name (and declared aliases) is absent
 *     from the full serialized text of every bundle before its reveal.
 *     This catches leaks through *other* entries' prose.
 *  3. Embargoes: free-standing forbidden terms (plot turns, twists).
 *
 * Also checks referential integrity so the map never points at something
 * the reader cannot see yet.
 */
import type { Content } from '../content/types.ts';
import { slice } from './slice.ts';

export interface Problem { ch: number; kind: string; detail: string }

const norm = (s: string) => s.toLowerCase().replace(/[’‘ʼ]/g, "'").replace(/[\u00ad\u2011]/g, '-').replace(/\\n/g, ' ').replace(/\s+/g, ' ');

/** whole-word-ish match so "Red" does not fire inside "covered" */
function has(hay: string, term: string): boolean {
  const t = norm(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${t}(s|es|'s)?([^a-z0-9]|$)`).test(hay);
}

/** Every term a reader who has finished chapter `ch` must not be shown. */
export function forbidden(c: Content, ch: number): string[] {
  const ents = [...c.lines, ...c.stations, ...c.people, ...c.creatures, ...c.rules.map((r) => ({ ...r, name: r.title })), ...c.glossary.map((t) => ({ ...t, name: t.term }))];
  return [
    ...ents.filter((e) => e.revealAt > ch).flatMap((e) => e.secret ?? [e.name]),
    ...c.embargoes.filter((e) => e.until > ch).flatMap((e) => e.terms),
  ].filter(Boolean);
}

export const mentions = (text: string, term: string) => has(norm(text), term);

export function lint(c: Content): Problem[] {
  const out: Problem[] = [];
  const total = c.chapters.length;
  const ents = [
    ...c.lines.map((e) => ({ ...e, type: 'line' })),
    ...c.stations.map((e) => ({ ...e, type: 'station' })),
    ...c.people.map((e) => ({ ...e, type: 'person' })),
    ...c.creatures.map((e) => ({ ...e, type: 'creature' })),
    ...c.rules.map((e) => ({ ...e, name: e.title, type: 'rule' })),
    ...c.glossary.map((e) => ({ ...e, name: e.term, stages: [{ at: e.revealAt, text: e.def }], type: 'term' })),
    ...c.questions.map((e) => ({ ...e, name: e.title, secret: e.secret ?? [], type: 'question' })),
    ...c.diagrams.map((e) => ({ ...e, name: e.title, secret: [] as string[], stages: [{ at: e.revealAt, text: e.title }, ...e.parts.flatMap((p) => p.stages)], type: 'diagram' })),
    ...c.goofs.map((e) => ({ ...e, name: e.title, secret: [] as string[], stages: [{ at: e.revealAt, text: e.text }], type: 'goof' })),
  ];
  // directory facts never predate their station
  for (const st of c.stations) for (const f of st.facts ?? []) if (f.at < st.revealAt) out.push({ ch: f.at, kind: 'stage-before-reveal', detail: `station ${st.id}: fact at ${f.at} < revealAt ${st.revealAt}` });
  // a numbering pattern may only act from the chapter where a lore rule states it
  for (const p of c.patterns) {
    const r = c.rules.find((x) => x.id === p.rule);
    if (!r || r.revealAt > p.at || !r.stages.some((s) => s.at === p.at)) out.push({ ch: p.at, kind: 'pattern-without-rule', detail: `pattern ${p.id}: no stage of rule ${p.rule} at ${p.at}` });
  }
  if (c.credit.revealAt !== total) out.push({ ch: c.credit.revealAt, kind: 'credit-early', detail: 'the credit block must wait for the last position' });
  for (const q of c.questions) {
    if (q.closedAt != null && !q.stages.some((s) => s.at === q.closedAt)) out.push({ ch: q.closedAt, kind: 'question-no-answer', detail: q.id });
    for (const s of q.stages) if (/^Answered/.test(s.text) && s.at !== q.closedAt) out.push({ ch: s.at, kind: 'question-early-answer', detail: q.id });
  }

  // static sanity: no stage earlier than its entity's reveal
  for (const e of ents) {
    for (const s of e.stages) {
      if (s.at < e.revealAt)
        out.push({ ch: s.at, kind: 'stage-before-reveal', detail: `${e.type} ${e.id}: stage at ${s.at} < revealAt ${e.revealAt}` });
    }
    if (!e.stages.some((s) => s.at === e.revealAt))
      out.push({ ch: e.revealAt, kind: 'empty-on-reveal', detail: `${e.type} ${e.id} has no note at its reveal chapter` });
  }
  for (const p of c.people) {
    if (!p.whereabouts?.length) out.push({ ch: p.revealAt, kind: 'no-whereabouts', detail: `person ${p.id}` });
    for (const w of p.whereabouts ?? []) if (w.stn && !c.stations.some((x) => x.id === w.stn && x.revealAt <= w.at)) out.push({ ch: w.at, kind: 'dangling-whereabouts', detail: `person ${p.id}: station ${w.stn} unknown at ${w.at}` });
    for (const w of p.whereabouts ?? []) if (w.at < p.revealAt) out.push({ ch: w.at, kind: 'stage-before-reveal', detail: `person ${p.id}: whereabouts at ${w.at} < revealAt ${p.revealAt}` });
  }
  const ids = new Set(ents.map((e) => e.id));
  if (ids.size !== ents.length) out.push({ ch: 0, kind: 'duplicate-id', detail: 'entity ids are not unique' });

  for (let ch = 0; ch <= total; ch++) {
    const b = slice(c, ch);
    const json = JSON.stringify(b);
    const hay = norm(json);

    // 1. structural
    const stamps = [...json.matchAll(/"(?:at|since)":(\d+)/g)].map((m) => +m[1]);
    for (const s of stamps) if (s > ch) out.push({ ch, kind: 'future-stamp', detail: `stamp ${s} in bundle ${ch}` });
    for (const k of b.chapters)
      if (k.n > ch && (k.title || k.goal || k.beats || k.where || k.clock || k.focus || k.aboard))
        out.push({ ch, kind: 'future-chapter-text', detail: `chapter ${k.n} text in bundle ${ch}` });

    // 2. secret terms
    for (const e of ents) {
      if (e.revealAt <= ch) continue;
      const terms = e.secret ?? [e.name];
      for (const t of terms)
        if (t && has(hay, t)) out.push({ ch, kind: 'secret-term', detail: `"${t}" (${e.type} ${e.id}, reveals ch ${e.revealAt})` });
    }

    // 3. embargoes
    for (const em of c.embargoes) {
      if (em.until <= ch) continue;
      for (const t of em.terms)
        if (has(hay, t)) out.push({ ch, kind: 'embargo', detail: `"${t}" embargoed until ch ${em.until} (${em.why})` });
    }

    // integrity: hops, legs and focus only reference things the reader can see on the map
    const vis = new Set([...b.lines.map((x) => x.id), ...b.stations.filter((x) => x.xy).map((x) => x.id)]);
    for (const l of c.lines)
      for (const g of l.legs ?? [])
        if (g.at <= ch && (g.until == null || ch < g.until) && l.revealAt <= ch)
          for (const id of g.stops) if (!vis.has(id)) out.push({ ch, kind: 'dangling-leg', detail: `${l.id} leg@${g.at} stop ${id} not visible` });
    for (const l of c.lines)
      for (const sp of l.spans ?? []) if (sp.at < l.revealAt) out.push({ ch, kind: 'span-before-reveal', detail: `${l.id} span@${sp.at}` });
    for (const h of b.hops) {
      for (const ref of [h.from, h.to]) if (!vis.has(ref)) out.push({ ch, kind: 'dangling-hop', detail: `hop@${h.at} references hidden/unknown ${ref}` });
      if (!['foot', 'unknown', 'jump'].includes(h.via) && !vis.has(h.via)) out.push({ ch, kind: 'dangling-hop', detail: `hop@${h.at} via hidden/unknown ${h.via}` });
    }
    for (const k of b.chapters) if (k.aboard && k.aboard !== 'unknown' && !vis.has(k.aboard)) out.push({ ch, kind: 'dangling-aboard', detail: `chapter ${k.n} aboard ${k.aboard} not visible` });
    for (const h of b.hops) for (const w of h.who ?? []) if (!b.people.some((p) => p.id === w)) out.push({ ch, kind: 'dangling-hop', detail: `hop@${h.at} traveller ${w} not known` });
    for (const k of b.chapters) if (k.focus && !vis.has(k.focus)) out.push({ ch, kind: 'dangling-focus', detail: `chapter ${k.n} focus ${k.focus} not visible` });
  }
  return out;
}
