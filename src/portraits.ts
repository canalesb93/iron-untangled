/**
 * Portraits. Original drawings, made for this site: no official or fan art is
 * used. Only people a reader already knows from the earlier books get a drawn
 * face, in the look they had when last seen there; everyone else gets a
 * monogram, so nothing here can give away what a later character looks like.
 *
 * The style is a screen-printed transit poster: one saturated backdrop per
 * person, chunky ink outlines, flat colour with one hard shadow and one
 * highlight. No gradients, no defs, no ids, so any number can share a page.
 *
 * Every portrait is drawn in a 64-unit box centred on 0,0 and is meant to be
 * clipped to a circle of radius 30 by whoever places it.
 */

const INK = '#1c1a17';
const NS = ' stroke="none"';

/** a filled shape carrying the ink outline */
const o = (d: string, fill: string, x = '') => `<path d="${d}" fill="${fill}"${x}/>`;
/** a flat patch with no outline: shadows, highlights, markings */
const f = (d: string, fill: string) => o(d, fill, NS);
/** an ink line */
const l = (d: string, w = 1.8, c = '') => `<path d="${d}" fill="none" stroke-width="${w}"${c && ` stroke="${c}"`}/>`;
const dot = (cx: number, cy: number, r: number, fill = INK, x = NS) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${x}/>`;
const eye = (cx: number, cy: number, rx: number, ry: number, fill: string, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${x}/>`;

/** one heart of a print, for a backdrop */
const heart = (x: number, y: number, r: number, s: number) =>
  `<path d="M0 2.6C-4.2-.6-2.4-4.2 0-2 2.4-4.2 4.2-.6 0 2.6Z" transform="translate(${x} ${y}) rotate(${r}) scale(${s})" fill="#f6888a" stroke="none"/>`;

/** backdrop disc with its hard-edged lower shade, then the inked figure */
const poster = (bg: string, lo: string, body: string) =>
  `<rect x="-32" y="-32" width="64" height="64" fill="${bg}"/><path d="M-32 14 32-18V32H-32Z" fill="${lo}"/><g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;

// shared outlines, each drawn twice (fill, then ink on top of the shading)
const JAW = 'M-13-20C-14.5-8-15 2-12 9L-5 16C0 17.5 7 17.5 12 16L17 9C19 2 18.5-8 17-20Z';
const STICK = 'M4.5 5.5 25-3 27.5 2.5 7 11Z';
const CAT = 'M-10-13C-17-12-22-7-22-1L-27 2-22.5 5-26 10-20.5 12C-16 19-8 23 0 23 8 23 16 19 20.5 12L26 10 22.5 5 27 2 22-1C22-7 17-12 10-13Z';
const RAPTOR = 'M-20 36-16 26-21.5 23-15.5 17-20.5 13.5-14.5 8.5-19 5-13.5 1-17-3-12.5-6C-10-14-4-20 4-18.5L24-10C28-8.5 28-3.5 24.5-2L6 2 3.5 6 20 11C23.5 12.5 22.5 16.5 18.5 16L3 13.5C-1 21-1 28 0 36Z';
const BOB = 'M-14-4C-17-22-7-27 2-27 12-27 18-21 16-6 17 2 17 8 15 13H-13C-16 8-15 2-14-4Z';
const FLASK = 'M-5-21V-8C-14-4-19 4-19 11-19 21-11 27 0 27S19 21 19 11C19 4 14-4 5-8V-21Z';

const DRAWN: Record<string, string> = {
  // the narrator: a big, tired, square-jawed man with a lit stick clamped in his teeth,
  // on the heart print of the boxers he has worn since the first floor
  carl: poster('#e5484d', '#b5303a',
    heart(-23, -13, -15, 1.25) + heart(-25, 4, 12, 1) + heart(-16, -24, 8, .9) + heart(25, 14, 18, 1.1) + heart(14, -27, -10, .8)
    + `<g transform="translate(0 1.5)">`
    + o('M-34 36C-33 22-25 17-13 14L1 23 15 14C26 17 33 22 34 36Z', '#262a35')
    + f('M-30 28C-27 21-21 18-14 16.5l1.5 3C-19 21-24 24-27 30Z', '#4a5163')
    + o('M-13 14 1 27 15 14 11 9H-9Z', '#c98f68')
    + o('M-13 14-18 19-5 28 1 23Z', '#3b4050') + o('M15 14 20 19 7 28 1 23Z', '#3b4050')
    + o('M-10 6H14V15L2 21-10 15Z', '#c98f68')
    + o('M-13.5-8C-19-10-19 1-13.5 1Z', '#e9b78e') + o('M17.5-8C21.5-9.5 21.5 0 17.5 1Z', '#c98f68')
    + o(JAW, '#e9b78e')
    + f('M17-20C18.5-8 19 2 17 9H14.5C16.5 2 16-8 14.5-20Z', '#c98f68')
    + f('M-14.6-2C-11 3-7 3.5-4 5-1 3.5 5 3.5 8 5 12 3.5 15 3 18.6-2 18.8 3 18 7 17 9L12 16C7 17.5 0 17.5-5 16L-12 9C-14 6-14.7 2-14.6-2Z', '#a56d4c')
    + l(JAW, 2.4)
    + o('M-14.5-7C-18-20-13-26.5-7-28L-5-31-2-28.5 1.5-31.5 4.5-28.5 8-30.5 10-27.5C17.5-26 21.5-20 18.5-7 17.5-12 16.5-15 14.5-17.5L10.5-15 6.5-18.5 2-15-2.5-18.5-7-15-11-17.5C-13-15-14-11-14.5-7Z', '#3a281c')
    + f('M-9-23C-5-26.5 3-27.5 9-25.5 3-26-4-24.5-7-21Z', '#6b4a33')
    + l('M-11.5-9Q-6.5-14-1-10.5', 3.2) + l('M5.5-9.5 15-11', 3.2)
    + l('M-9.5-7.4h7.5M6.5-8h8', 1.6) + dot(-5.5, -5.2, 1.8) + dot(10.5, -5.7, 1.8)
    + l('M-9-1.8Q-5.5-.4-2.5-1.8M7-2.2Q10.5-.8 13.5-2.2', 1.1)
    + l('M4-6 6 .5Q6 3.2 2 3', 1.7)
    + l('M-8 9.2Q-6 10-3.5 9.8', 2.1)
    + o('M-3.5 8 7.5 6 8.2 9.8-2.8 11.6Z', '#fff', ' stroke-width="1.5"') + l('M.3 7.5.8 10.9M3.8 6.9 4.3 10.3', 1)
    + o(STICK, '#ff5a36') + f('M21.5-1.5 25-3 27.5 2.5 24 4Z', '#f6e7c8') + f('M12 2.4 14.5 1.4 17 6.9 14.5 7.9Z', '#f6e7c8') + l(STICK, 2.2)
    + l('M26.2-.2Q29-4 24-7', 1.8)
    + o('M22.7-16.6 23.1-12.6 27-13.3 24.1-10.6 27.1-7.9 23.2-8.5 23-4.5 21-8 17.8-5.6 19.2-9.3 15.3-10.3 19.1-11.6 17.5-15.3 20.9-13Z', '#ffd84a', ' stroke-width="1.3"') + dot(21.5, -10.5, 1.4, '#fff')
    + `</g>`),

  // a tortoiseshell show cat who never takes the crown off
  donut: poster('#7a5cc7', '#56409a',
    o('M-24 36C-22 25-13 19 0 19s22 6 24 17Z', '#2b2522')
    + f('M-13 20Q-10 30-5 26-2 32 2 26.5 7 31 12 20L10 36H-10Z', '#f4ead8')
    + `<g transform="rotate(-5)">`
    + o('M-20-6-19.5-24-7-14Z', '#2b2522') + f('M-17.5-9.5-17.3-19.5-11-14.5Z', '#e79aa5')
    + o('M20-6 19.5-24 7-14Z', '#e8862e') + f('M17.5-9.5 17.3-19.5 11-14.5Z', '#e79aa5')
    + o(CAT, '#2b2522')
    + f('M2-13H10C17-12 22-7 22-1L27 2 22.5 5 26 10 20.5 12C16 19 8 23 1 23 8 15-4 8 3-1 6-6 0-9 2-13Z', '#e8862e')
    + f('M-21.5 3C-17-1-12 1-11 5-14 9-19 9-21 7Z', '#e8862e')
    + f('M10 14C14 12 18 8 19 4 21 7 20 11 16.5 15 13 18.5 8 21 3 21.5 6 20 9 17 10 14Z', '#b85f17')
    + eye(0, 11.5, 8.5, 6.5, '#f4ead8', NS)
    + l(CAT, 2.4)
    + eye(-9, 2.5, 5, 4.6, '#ffd23f', ' stroke-width="1.6"') + eye(9, 2.5, 5, 4.6, '#ffd23f', ' stroke-width="1.6"')
    + eye(-8.5, 3.5, 1.4, 2.8, INK, NS) + eye(9.5, 3.5, 1.4, 2.8, INK, NS)
    + o('M-15 2C-13.5-4.5-4.5-4.5-3 2Z', '#2b2522', ' stroke-width="1.6"') + o('M3 2C4.5-4.5 13.5-4.5 15 2Z', '#b85f17', ' stroke-width="1.6"')
    + o('M-2.3 7h4.6L0 9.8Z', '#e79aa5', ' stroke-width="1.2"')
    + l('M0 9.8v1.8M-4.5 14.5Q-2.5 11 0 11.6 2.5 11 4.5 14.5', 1.4)
    + l('M-9 11-21 9M-9 13.5-20 16M9 11 21 9M9 13.5 20 16', 1, '#f4ead8')
    + o('M-11-12-13.5-25.5-6.5-19 0-30 6.5-19 13.5-25.5 11-12Z', '#ffcf3d')
    + f('M-11-12-11.8-16H11.8L11-12Z', '#c98f12')
    + l('M-11-12H11', 2.4)
    + dot(0, -19.5, 2.3, '#ff4d6a', ' stroke-width="1.2"') + dot(-7.5, -16.5, 1.5, '#6fe3f2', ' stroke-width="1"') + dot(7.5, -16.5, 1.5, '#6fe3f2', ' stroke-width="1"')
    + `</g>`),

  // a feathered raptor, mid-screech
  mongo: poster('#0f9d8c', '#0a7568',
    o('M-11-6C-18-5-25-8-29-13-22-16-15-13-10-10Z', '#4d8dff')
    + o('M-9-12C-17-13-25-18-28-26-20-26-12-22-7-16Z', '#ff5fa2')
    + o('M-6-15C-12-20-15-27-13-33-7-30-3-24-2-18Z', '#4d8dff')
    + o('M-1-18C-3-24-1-30 3-33 6-28 6-22 4-18Z', '#ff5fa2')
    + l('M-11-9-23-12M-9-14-22-22M-5-18-10-28M1-19 2-28', 1.5)
    + f('M5 3 20 .5 18 10.5 4 6Z', '#6e1626') + f('M7 5.5C11 4 15 5.5 17 9L5 6.5Z', '#ff8fa0')
    + o(RAPTOR, '#d9573c')
    + f('M-20 36-16 26-21.5 23-15.5 17-20.5 13.5-14.5 8.5-19 5-13.5 1-17-3-12.5-6C-11-10-9-14-6-16.5-9-8-9 4-8 16-7.5 24-7 30-6.5 36Z', '#a83a28')
    + f('M3 13.5C-1 21-1 28 0 36H-6C-7 27-5 18-1 12.5Z', '#f6dcae')
    + f('M0-17C2-18.5 3-18.6 4-18.5L22-11C15-12.5 7-15 0-17Z', '#f58a63')
    + l(RAPTOR, 2.4)
    + f('M9 1.4l1.6 4 2-4.8ZM14 .3l1.6 4 2-4.8ZM19-.8l1.6 4 2-4.8Z', '#fff')
    + f('M8 7.4l2.2-3.6 1 4.6ZM12.5 8.7l2.2-3.6 1 4.6ZM16.5 9.9l1.8-3.2 1 4Z', '#fff')
    + dot(4, -10, 3.9, '#ffd84a', ' stroke-width="1.6"') + eye(4.6, -10, 1, 3, INK, NS)
    + l('M-2.5-16.5 10-12.5', 3)
    + dot(23.5, -7, 1.1)),

  // the newest member: a plain, watchful face, and a second outline that is not quite hers
  katia: poster('#3d9bff', '#2271cf',
    `<path d="${BOB}" transform="translate(-8 2)" fill="#9fd0ff" stroke="#e9f5ff" stroke-width="1.6"/>`
    + o('M-30 36C-28 21-17 16-3 16H5C19 16 28 21 30 36Z', '#5b6472')
    + f('M-25 27C-22 21.5-16 19-9 18l1 2.5C-14 21.5-19 24-22 29Z', '#8a94a4')
    + o('M13 17.5 18 19-2 36H-9Z', '#8a5a34')
    + o(BOB, '#b0562a')
    + f('M9-25C15-22 17.5-15 16-6 17 2 17 8 15 13H10C12.5 6 13-4 12.5-12 12-18 11-22 9-25Z', '#7f3a1c')
    + l(BOB, 2.4)
    + o('M-3 5H7V14L2 18-3 14Z', '#d9ab93')
    + o('M-8.5-20C-9.5-4-8.5 4-5.5 8L1.5 13C5.5 14 9.5 12 11.5 9 13.5 4 14-3 13-20Z', '#f2d0bb')
    + f('M11.5 9C13.5 4 14-3 13-18L10.5-18C11.5-4 11 4 8.5 8.5 6.5 11 4 12.5 1.5 13 5.5 14 9.5 12 11.5 9Z', '#d9ab93')
    + f('M-10.5-5C-13-18-6-23.5 2-23.5 10-23.5 15.5-18 14-7 11-13 6-17 0-16.5-5-16-9-11-10.5-5Z', '#b0562a') + l('M14-7C11-13 6-17 0-16.5-5-16-9-11-10.5-5', 2.4) + l('M0-16.5C-1-20-1-24 1-27', 1.4)
    + f('M-7-18C-4-21.5 2-22.5 7-21 2-20.5-2-19-5-16Z', '#e08a4f')
    + l('M-6.5-8.5H-.5M6-8.5h5.5', 1.7)
    + eye(-3, -5, 2.6, 1.9, '#fff', ' stroke-width="1.2"') + eye(8.5, -5, 2.4, 1.9, '#fff', ' stroke-width="1.2"')
    + dot(-1.8, -5, 1.3) + dot(9.6, -5, 1.3)
    + l('M5-4 6.5 1 4 1.8', 1.4)
    + l('M1.5 6.8Q5 6 8 7', 1.7)),

  // the manager changes shape every floor, so he is drawn as his trade
  mordecai: poster('#f2c230', '#cf9a12',
    `<g transform="rotate(-10)">`
    + dot(7, -27, 2.8, '#2fd3a3', ' stroke-width="1.6"') + dot(-2, -31, 1.7, '#2fd3a3', ' stroke-width="1.4"')
    + o(FLASK, '#fff8e6')
    + f('M-17.8 5C-12 1.5-6 7.5 0 5.5 6 3.5 12 8 17.8 5 18.5 7 19 9 19 11 19 21 11 27 0 27S-19 21-19 11C-19 9-18.5 7-17.8 5Z', '#1fbf93')
    + f('M19 11C19 21 11 27 0 27-5.5 27-10 25.5-13.5 23 0 26.5 13 20 15.5 5.8L17.8 5C18.5 7 19 9 19 11Z', '#0f8a69')
    + dot(-6, 14, 2.6, '#a9f2d9') + dot(3, 19, 1.6, '#a9f2d9') + dot(6, 10.5, 1.2, '#a9f2d9') + dot(0, -3, 1.7, '#1fbf93') + dot(1.5, -12, 1.2, '#1fbf93')
    + f('M-14 6C-13.5 1-11-3-7-5.5L-5.5-3C-8.5-1-10.5 2.5-11 6.5Z', '#fff')
    + l(FLASK, 2.4)
    + o('M-8-25H8V-20.5H-8Z', '#fff8e6')
    + `</g>`
    + o('M8-21.5 14.5-26 17-21.5 10.5-17Z', '#b9763d') + l('M3-20.5 5.5-18.5M3-15.5 6.5-15', 1.6)),
};

/**
 * More faces from the earlier books, as last seen there. They are filed under
 * a hash of their id so this file names nobody beyond the travelling party.
 */
const KNOWN: Record<string, string> = {
  // the publicist: a fish in a bowl helmet, eager and a little frightened
  '37644s': poster('#d9ee6e', '#a9c43a',
    o('M-27 36C-26 27-19 22-9 21H9C19 22 26 27 27 36Z', '#3b3f52')
    + o('M-4 21 0 27 4 21Z', '#fff')
    + dot(0, -4, 22, '#bfeef4', '')
    + f('M-20-13C-13-16-7-11.5 0-13.5 7-15.5 13-11.5 20-13 16.5-21 9-26 0-26S-16.5-21-20-13Z', '#effcff')
    + o('M-3-11-1-21 3-15 7-21.5 9.5-10Z', '#e0452f')
    + o('M-10 0-18-3.5-15.5 2.5-19 8-10.5 7Z', '#e0452f') + o('M13.5 0 20-3.5 18 2.5 21 8 13.5 7Z', '#e0452f')
    + o('M-9 17.5C-12 8-13-2-9-8-5-14 6-15 11-9 15-3 14.5 8 12 17.5Z', '#ff7a4d')
    + f('M12 17.5C14.5 8 15-3 11-9 9.5-11 7.5-12.5 5.5-13 9-8 10.5 2 8 17.5Z', '#d9552b')
    + f('M-5 17.5C-6 14 0 11 3 11S9 14 8 17.5Z', '#ffd0a8')
    + dot(-3, -3, 4.8, '#fff', ' stroke-width="1.6"') + dot(8.5, -3, 4.2, '#fff', ' stroke-width="1.6"')
    + dot(-1.5, -2.5, 2.1) + dot(9.8, -2.5, 1.9)
    + l('M-4 6.5Q3 10.5 10 5.5', 1.7)
    + dot(-14, -13, 1.9, '#fff', ' stroke-width="1"') + dot(15, -15.5, 1.3, '#fff', ' stroke-width="1"')
    + l('M-16.5-9A18 18 0 0 1-7-20.5', 2.2, '#fff')
    + o('M-14 16H14V22H-14Z', '#c9ced9')),

  // the shield-maiden who leads the other big party
  '2y0eem': poster('#5d6b7a', '#3f4a57',
    o('M17 36 20.5-12 24-11.5 22 36Z', '#8a5a34') + l('M11-6Q21-19 31-8', 3.4) + l('M11-6 21.5-1 31-8', 1.1)
    + o('M-30 36C-28 22-18 16-7 14L2 20 10 14C20 16 28 22 30 36Z', '#9a7b55')
    + f('M-26 28C-23 22-17 19-10 17.5L-9 20C-15 22-20 25-23 30Z', '#c4a57a')
    + l('M-20 21-18 25M-13 18-12 22.5M16 19 15 23M22 23 20 27', 1.6)
    + o('M-4 4H7V13L2 19-4 13Z', '#d6a98c')
    + o('M-10-12C-18-10-17-1-14 3-17 6-17 11-14 14-17 17-17 22-14 25-17 28-17 33-13 36H-8C-5 33-6 28-9 25-6 22-6 17-9 14-6 11-6 6-9 3Z', '#f2d477')
    + l('M-14 3-9 3M-14 14-9 14M-14 25-9 25', 1.6)
    + o('M-9-20C-10-4-9 4-6 9L1 15C5 16 9 13.5 11 10 13 4 13.5-4 12.5-20Z', '#f0cdb2')
    + f('M11 10C13 4 13.5-4 12.5-18H10C11-4 10.5 4 8 9 6 12 3.5 14 1 15 5 16 9 13.5 11 10Z', '#d6a98c')
    + o('M-11-4C-15-22-6-28 3-28 12-28 17-22 15-7 13-14 9-19.5 4-20.5-1-19-8-15-11-4Z', '#f2d477')
    + f('M-8-20C-4-25 3-26 9-24 3-24-2-22-6-17Z', '#fff0b0')
    + l('M4-20.5C6-23 6-26 4-28', 1.4)
    + l('M-7-10-.5-7.5M5.5-7.5 12-10', 2.4)
    + dot(-3, -5, 1.6) + dot(8.5, -5, 1.6)
    + l('M5-4 6.5 2 4 2.8', 1.4)
    + l('M1 8.5Q4.5 7 8 8.5', 1.8)
    + dot(-24, 30, 12, '#c8452f', '') + dot(-24, 30, 4, '#d9dde4', ' stroke-width="1.6"')),

  // the nurse: tall, steady, still in her scrubs
  '2ygt47': poster('#ffb347', '#e0862a',
    o('M-30 36C-28 22-18 17-7 15L2 24 11 15C21 17 28 22 30 36Z', '#1f9aa0')
    + f('M-26 29C-23 23-17 20-10 18.5L-9 21C-15 23-20 26-23 31Z', '#5fd0d2')
    + o('M-7 15 2 26 11 15 7 11H-3Z', '#5c3520')
    + o('M-3 3H7V13L2 18-3 13Z', '#5c3520')
    + o('M-9-7C-13-9-13.5 0-9 0Z', '#7d4b2d')
    + o('M-8.5-20C-9.5-4-8.5 4-5.5 9L1.5 15C5.5 16 9.5 13.5 11.5 10 13.5 4 14-4 13-20Z', '#7d4b2d')
    + f('M11.5 10C13.5 4 14-4 13-18H10.5C11.5-4 11 4 8.5 9 6.5 12 4 14 1.5 15 5.5 16 9.5 13.5 11.5 10Z', '#5c3520')
    + f('M-5-1C-6 3-4 6-2 7.5-5 6-7 3-7-1Z', '#a36a44')
    + o('M-10-7C-13-9-14-13-12-16-14-19.5-12-23-8-23.5-7-27-2-28.5 1-26.5 4-29 9-28 10.5-25 14-25 17-21 15.5-17.5 17.5-14 16.5-10.5 14.5-9 13-14 10-18 4-18.5-2-18.5-7-15-10-7Z', '#231c1a')
    + l('M-8-19Q-6-22-3-21M1-23.5Q4-25 6-22.5M10-20Q13-19 13-16', 1.4, '#6a5850')
    + l('M-6.5-9.5Q-3-11.5 0-9.5M6-9.5Q9-11.5 12-9.5', 2)
    + dot(-3, -5.5, 1.6) + dot(8.5, -5.5, 1.6)
    + l('M5-4.5 6.5 1.5 3.8 2.3', 1.4)
    + l('M1 8Q4.5 9.5 8.5 7.5', 1.8)
    + l('M-9 17C-9 29 10 31 13 19', 4) + l('M-9 17C-9 29 10 31 13 19', 1.6, '#e6ebf2')
    + dot(13, 18, 2.6, '#e6ebf2', ' stroke-width="1.6"')),

  // the eldest of the residents: white bun, sharp tongue
  yispph: poster('#b98bb0', '#93618a',
    l('M18 36V11.5h9', 5) + l('M18 30V11.5h3', 1.6, '#aeb4be')
    + o('M-28 36C-26 23-17 18-7 16L2 22 10 16C19 18 26 23 28 36Z', '#2f8f83')
    + f('M-24 30C-21 24-16 21-10 19.5L-9 22C-14 24-18 27-21 32Z', '#6fcdbf')
    + o('M-3 5H6V14L1.5 19-3 14Z', '#d3a48e')
    + dot(4, -25, 6.5, '#f4f1ea', '') + l('M1-27Q4-29 7-26.5', 1.3)
    + o('M-8-19C-9.5-4-8.5 3-6 7.5L0 13.5C4 15 8.5 12.5 10.5 9 12.5 4 13-4 12-19Z', '#f1cdb8')
    + f('M10.5 9C12.5 4 13-4 12-17H9.5C10.5-4 10 3.5 7.5 8 5.5 11 3 13 0 13.5 4 15 8.5 12.5 10.5 9Z', '#d3a48e')
    + o('M-10-4C-13-17-7-23 2-23 10-23 15-18 13.5-7 11-12 8-16 3-17-2-17-7-13-10-4Z', '#f4f1ea')
    + f('M-9-8C-10-15-6-20-1-21.5-5-18-7-13-7.5-8Z', '#c9c4ba')
    + l('M-6.5-9Q-3-12.5 .5-10M5.5-8 11.5-8.5', 1.8)
    + dot(-3, -5, 1.5) + dot(8, -5, 1.5)
    + l('M-6-2.5Q-4-1.5-2-2.5M6.5-2.5Q8.5-1.5 10.5-2.5', 1) + l('M-3 5.5Q-4.5 8-3.5 10', 1)
    + l('M4.5-4 6 1 3.5 1.8', 1.3)
    + l('M0 7Q4 9 8.5 5.5', 1.7)),
};

/** backdrop and shade per group, then ink for the letters */
const TINT: Record<string, [string, string, string]> = {
  party: ['#e5484d', '#b5303a', '#fff'],
  crawler: ['#e9dfc8', '#cdbf9f', INK],
  npc: ['#c9a468', '#a88244', INK],
  show: ['#8fa3c7', '#6c82ab', INK],
  dungeon: ['#3a3d47', '#272a33', '#f1ead9'],
};

export const initials = (n: string) =>
  n.replace(/^(The|Prince|Princess) /, '').split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const key = (id: string) => { let h = 5381; for (const c of id) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h.toString(36); };

/** SVG content for one face, to sit inside a 64-unit box. */
export function face(p: { id: string; name: string; group: string }): string {
  const art = DRAWN[p.id] ?? KNOWN[key(p.id)];
  if (art) return art;
  const [bg, lo, fg] = TINT[p.group] ?? TINT.crawler;
  const t = `text-anchor="middle" font-size="25" font-weight="800" font-family="Inter, system-ui, sans-serif" letter-spacing="-.5">${esc(initials(p.name))}</text>`;
  return `<rect x="-32" y="-32" width="64" height="64" fill="${bg}"/><path d="M-32 14 32-18V32H-32Z" fill="${lo}"/><circle r="25.5" fill="none" stroke="${fg}" stroke-width="1.6" opacity=".35"/><text x="1.6" y="10.6" fill="${lo}" ${t}<text y="9" fill="${fg}" ${t}`;
}

/** A stand-alone round portrait for use in HTML. */
export function avatar(p: { id: string; name: string; group: string }, cls = ''): string {
  return `<span class="av ${cls}"><svg viewBox="-30 -30 60 60" aria-hidden="true">${face(p)}</svg></span>`;
}
