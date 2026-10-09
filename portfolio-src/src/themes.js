// Colour themes. The page background, accent and dot colours all switch to the
// theme of whichever section is on screen.
//
//   ground  page background (a deep shade of the brand colour)
//   accent  headings, rules and buttons in that section
//   onAccent text colour on top of the accent (buttons)
//   dotA / dotB  the two colours the particles mix between
//   hi      highlight for pulses and blinking dots
//
// Brand sources:
//   J&J red #D71500 (2023 identity)      Fresenius blues #003D7B, #0591C8
//   LTTS yellow #FFCC29 (ltts.com)       ANSR: orange mark on teal (2023 "Future Beam" logo)
//   Apollo Hospitals: teal-blue wordmark with an orange emblem
//   Personal: navy and gold, from the suit in Karthik's own portraits
export const THEMES = {
  me: {
    ground: '#0b1226', accent: '#e8c07a', onAccent: '#0b1226',
    dotA: '#e8c07a', dotB: '#7fa8ff', hi: '#fff4dc',
  },
  ansr: {
    ground: '#05373a', accent: '#ff6b2c', onAccent: '#05373a',
    dotA: '#ff6b2c', dotB: '#35c4c0', hi: '#ffe1cf',
  },
  jnj: {
    ground: '#1f0605', accent: '#ff3b24', onAccent: '#ffffff',
    dotA: '#eb1700', dotB: '#ff8b6e', hi: '#ffffff',
  },
  ltts: {
    ground: '#14130c', accent: '#ffcc29', onAccent: '#14130c',
    dotA: '#ffcc29', dotB: '#3d7be0', hi: '#fff6d6',
  },
  fresenius: {
    ground: '#00284f', accent: '#3db6ec', onAccent: '#00284f',
    dotA: '#0591c8', dotB: '#a6ddf6', hi: '#ffffff',
  },
  apollo: {
    ground: '#0c1e3a', accent: '#2ec4c9', onAccent: '#0c1e3a',
    dotA: '#2ec4c9', dotB: '#f7a21b', hi: '#fff1d6',
  },
};
