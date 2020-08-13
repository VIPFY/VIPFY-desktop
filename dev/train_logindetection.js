const { BSON } = require("@ferrisk/bsonfy");
const fs = require("fs");
const brain = require("brain.js");

function countIdentOccurrences(arr) {
  let counts = {};
  for (var i = 0; i < arr.length; i++) {
    var num = arr[i];
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }
  return counts;
}

// a list of substrings of html attribute values that distuingish logged in pages from logged out pages
// values with score -1 or -2 are manual, the rest is generated by magic (i.e. python script)
// the numbers are a leftover from a previous algorithm desig, this algo only uses the keys.
const scores = {
  load: -2,
  spin: -2,
  puls: -2,
  captcha: -1,
  recaptcha: -1,
  passwor: -0.9441452864560343,
  auth: -0.9379998759997521,
  pas: -0.9353274535560143,
  ssw: -0.9335369966276533,
  rname: -0.8948137326515705,
  "-login": -0.8359183673469387,
  ".com/l": -0.8212890625,
  ogin: -0.8104082146842109,
  userna: -0.7980444444444444,
  signup: -0.765625,
  in_: -0.7575445816186557,
  "sign-": -0.6982548320510414,
  goog: -0.6655124653739611,
  valid: -0.6523668639053255,
  word: -0.6309831417978998,
  goo: -0.6275931860347443,
  ass: -0.5955046808865537,
  "-form": -0.5831404958677686,
  submit: -0.5625,
  rna: -0.5585595567867035,
  "-for": -0.5529257067718607,
  bmi: -0.5377777777777779,
  ern: -0.5316840277777779,
  mit: -0.5252924837976601,
  gin: -0.52129515063878,
  sw: -0.521027782090874,
  sign: -0.51152585331113,
  aut: -0.507762917279214,
  subm: -0.46814404432132967,
  wor: -0.4485884261763115,
  "input-": -0.4479508959017917,
  gi: -0.4268444444444444,
  wo: -0.41733886756989585,
  "-input": -0.4096,
  "d ng-": -0.4049586776859504,
  ema: -0.3802777777777778,
  "/lo": -0.37345679012345684,
  npu: -0.37198669593305783,
  put: -0.36447200682456454,
  mail: -0.33951267902535814,
  inp: -0.33770155150059605,
  "/l": -0.33309387755102043,
  log: -0.3109354852857331,
  fie: -0.28392562203633653,
  np: -0.27822726723825625,
  iel: -0.2765980795610425,
  footer: -0.2732438016528925,
  ign: -0.2688614540466393,
  eld: -0.2612345679012345,
  val: -0.2537735315732942,
  lid: -0.25,
  ord: -0.23285083632346554,
  for: -0.2322543184787342,
  rn: -0.23008791063520387,
  bm: -0.2287334593572779,
  "-lo": -0.227984741498255,
  "d n": -0.2177777777777778,
  orm: -0.20891898730088662,
  gn: -0.2001960772592225,
  ert: 0.20057209529903278,
  ort: 0.2009512485136742,
  vg: 0.20128560993425865,
  e_: 0.20230354112240426,
  "2": 0.202975783463953,
  edi: 0.20395421436004166,
  "/d": 0.20417009602194797,
  at: 0.20504038530012553,
  "le-": 0.20505517977928078,
  vi: 0.20520125648330773,
  "5": 0.2071512019352315,
  "e-b": 0.20821943632764636,
  out: 0.2098231009365244,
  ep: 0.21265000402695383,
  "nt ": 0.21633315305570572,
  sa: 0.21777777777777768,
  mal: 0.21892096624863236,
  " te": 0.21910366681756452,
  ry: 0.2197265625,
  fe: 0.21998590335969934,
  de: 0.2202464595403963,
  "3": 0.22100631327301049,
  "/m": 0.22209010437310078,
  ly: 0.2232822122932014,
  "-le": 0.2232822122932014,
  ey: 0.2232822122932014,
  ist: 0.22437673130193897,
  ver: 0.2251595540176856,
  " h": 0.22733180223966953,
  eb: 0.22735844919082496,
  "9": 0.22738768861454048,
  ov: 0.22836557287179896,
  unt: 0.2321487603305786,
  ns: 0.23289027499319315,
  tk: 0.2341311134235172,
  gg: 0.2345239507930856,
  ele: 0.2353690814626017,
  no: 0.23547211580619434,
  pan: 0.2391080750645268,
  "ll-": 0.24120303910927496,
  _p: 0.24280613316530136,
  "-h": 0.24319759804841432,
  ive: 0.24581597344820283,
  do: 0.24696666104365775,
  dd: 0.24715102040816322,
  ad: 0.24803537107074214,
  _c: 0.24860918211373284,
  na: 0.24902629109051594,
  ge: 0.2494609165988813,
  sma: 0.25,
  left: 0.25,
  lec: 0.25,
  "-d": 0.25121211943553623,
  ct: 0.25322230832366605,
  "t-s": 0.253278653509334,
  cs: 0.2542917671122799,
  en: 0.25535016693944024,
  sel: 0.255916955017301,
  "1": 0.2561917159763314,
  me: 0.25636917160711425,
  ea: 0.25675294288048167,
  ag: 0.25754358376637937,
  din: 0.257915079082262,
  es: 0.25892787219046126,
  " w": 0.25906271289755806,
  lect: 0.2595229619081525,
  "on-": 0.26063711911357346,
  ca: 0.26070960532519555,
  age: 0.26189222684747665,
  ta: 0.26201653965781724,
  ted: 0.2636961285609935,
  pen: 0.26421521530264647,
  ti: 0.26530864928591047,
  dr: 0.2666874582312318,
  rk: 0.2669444444444444,
  "-md": 0.26753864447086795,
  ls: 0.2685811710799722,
  rv: 0.26975542335196206,
  "r-": 0.27071886789683053,
  "der-": 0.2726764435229298,
  io: 0.2731870973621705,
  "k-": 0.27437641723356,
  acc: 0.27437641723356,
  wid: 0.2756249999999999,
  ion: 0.2759751111111112,
  select: 0.27629848783694927,
  "v-": 0.2795613687409169,
  ga: 0.2815493544356517,
  ty: 0.28257617728531864,
  ay: 0.28476341772406444,
  "-se": 0.2851352625129607,
  main: 0.28541940326515286,
  tion: 0.28653979238754335,
  ic: 0.2870148884708411,
  "-de": 0.28729600000000005,
  _3: 0.2881994459833794,
  pla: 0.28881484566615756,
  "le ": 0.2889062500000001,
  ggle: 0.28994082840236696,
  ba: 0.29096192579290925,
  tu: 0.2912572436381961,
  rea: 0.2918483287092085,
  "#": 0.292400548696845,
  ove: 0.29248229904206585,
  lt: 0.29298880565608965,
  "el-": 0.29518259036518063,
  nd: 0.29592037363537027,
  ue: 0.2965395549455936,
  "r-b": 0.299072265625,
  "10": 0.2993948024207904,
  "t-i": 0.2998866213151928,
  tiv: 0.30011342155009446,
  not: 0.30011342155009446,
  "ex-": 0.3007284079084287,
  hel: 0.3007284079084287,
  xs: 0.30116002379535994,
  ite: 0.30126067047317545,
  ale: 0.30200470741011276,
  e__: 0.30439952437574314,
  "/e": 0.30624941087755675,
  toggle: 0.308641975308642,
  pi: 0.308641975308642,
  vb: 0.308641975308642,
  tl: 0.3094364202189804,
  cl: 0.30985949671188345,
  ab: 0.3102685441674362,
  _n: 0.31124653739612185,
  nse: 0.3118569741946366,
  itl: 0.31205707491082046,
  "-fl": 0.3128411376041368,
  ar: 0.31308680703735237,
  " d": 0.3139863258026159,
  "-he": 0.31589322819542875,
  " no": 0.3169973871901702,
  " _": 0.3169973871901702,
  "-ic": 0.31787619575691356,
  ven: 0.3194706994328923,
  ten: 0.31974457057285394,
  onte: 0.31974457057285394,
  rc: 0.32007219743942245,
  nten: 0.32143407926883716,
  vat: 0.32213294375456536,
  ice: 0.3228305785123966,
  tent: 0.3237217598097502,
  lp: 0.32653061224489793,
  conte: 0.3269906764530846,
  "r-s": 0.32811763596945986,
  "v ": 0.3283676303497034,
  cco: 0.3302946228035407,
  "r-in": 0.33062499999999995,
  "n-t": 0.33087947372542875,
  bi: 0.3332011368894176,
  "-tr": 0.33518005540166207,
  on_: 0.3358053911900065,
  ing: 0.3362940722670503,
  oun: 0.3362940722670503,
  cou: 0.3365281890052196,
  cat: 0.3402777777777777,
  tle: 0.34154157530780915,
  bs: 0.3436385255648039,
  dro: 0.3454926869063574,
  "8": 0.3458837368885404,
  ico: 0.3463270420549768,
  "-me": 0.3469694126477762,
  _a: 0.34725765306122436,
  cal: 0.3502707205331112,
  icon: 0.3525802505786516,
  _t: 0.353318010660668,
  act: 0.3536495182172382,
  "-hea": 0.3540741752612527,
  ount: 0.3574647966182358,
  " fa": 0.35803547433485633,
  "-ca": 0.3600000000000001,
  sec: 0.3600000000000001,
  pb: 0.3600000000000001,
  "icon ": 0.361806772570524,
  yl: 0.3626568175574615,
  style: 0.36273243801652894,
  ick: 0.36414982164090365,
  ting: 0.3647681599843154,
  tem: 0.36573696145124723,
  "em ": 0.36902786269543186,
  est: 0.36902786269543186,
  pd: 0.3709917355371901,
  "on i": 0.37111903818205844,
  our: 0.37111903818205844,
  "me-": 0.3718024985127901,
  cti: 0.37265079750170677,
  dow: 0.37533784311581186,
  scr: 0.3756503642039541,
  "a f": 0.3761777777777777,
  yp: 0.3814878892733564,
  item: 0.3855759603485054,
  ip: 0.3861369371200189,
  _d: 0.38878892733564013,
  "l-md": 0.38878892733564013,
  ear: 0.39208664512184466,
  "-icon ": 0.39354191582114884,
  acti: 0.3972177106136572,
  "item ": 0.3982467716090111,
  tit: 0.3982467716090111,
  min: 0.39889196675900274,
  get: 0.40024989587671805,
  ane: 0.40024989587671805,
  ide: 0.4041326530612244,
  "on--": 0.4060938100730488,
  "button--": 0.4067828135656271,
  tat: 0.4076331360946745,
  "e/": 0.40913886859832793,
  "ion-": 0.41153435386258463,
  ke: 0.4121322969059594,
  "-n": 0.4140331003018289,
  lis: 0.4150822540580232,
  sta: 0.41548120191609816,
  ins: 0.4167601345938152,
  ind: 0.41868512110726636,
  "md-": 0.41868512110726636,
  list: 0.42117451062057476,
  sh: 0.4217699785380633,
  oa: 0.42601025493922323,
  "s-c": 0.42751479289940814,
  add: 0.42879229044809203,
  av: 0.42945583373182983,
  wn: 0.4299919376511691,
  "fa ": 0.4323512854194032,
  section: 0.4325135946757568,
  "7": 0.43632690850938477,
  _1: 0.43640036730945825,
  ions: 0.4365433673469389,
  oll: 0.4400548965787667,
  pop: 0.44444444444444453,
  ho: 0.448719979664089,
  activ: 0.449038154958019,
  own: 0.45008812690273997,
  "icon i": 0.45562500000000006,
  nel: 0.4565376186997808,
  anel: 0.4570521721880579,
  tions: 0.457233560090703,
  "-ti": 0.457233560090703,
  avi: 0.4580144883175185,
  "ar-": 0.45908743550676157,
  "per-": 0.46105776558451445,
  "panel-": 0.4623999999999999,
  bb: 0.4648760330578513,
  "ar-i": 0.4663890541344437,
  "nt-": 0.46717455134963565,
  "ent-": 0.4702040816326531,
  ill: 0.4737729802664866,
  ka: 0.4762943860345169,
  pro: 0.4792899408284023,
  "u-": 0.4863227146814405,
  _item: 0.4873620505517979,
  bar: 0.48861484168218794,
  "-it": 0.48999999999999994,
  stat: 0.4926960059171597,
  "t-t": 0.4929832503395202,
  ana: 0.4993777777777779,
  rdi: 0.5002974419988102,
  "a-": 0.5014170927684443,
  "-sec": 0.5048476454293629,
  rop: 0.510204081632653,
  "own-": 0.510204081632653,
  ard: 0.5122068435217223,
  men: 0.5139384082900689,
  "-item": 0.5148265185610775,
  "-list": 0.5184,
  "bar-": 0.5195226851071006,
  ble: 0.5220688963881184,
  "-sta": 0.5243757431629011,
  dg: 0.5252924837976602,
  tar: 0.5303638941398864,
  da: 0.5316276620278739,
  "-title": 0.5377777777777779,
  "-do": 0.5377777777777779,
  enu: 0.5409365244536942,
  hu: 0.5538128718226067,
  wd: 0.5658234787375677,
  " ac": 0.5676487145805966,
  "item-": 0.5695977216091136,
  "tar-": 0.5726807888970051,
  ile: 0.5798333473613334,
  "-star": 0.5824099722991689,
  sea: 0.5835262345679012,
  erv: 0.6049382716049381,
  ata: 0.6078713013501866,
  tri: 0.6096828673297054,
  "ntent-": 0.6143170197224251,
  ctl: 0.6143170197224251,
  inc: 0.6290130796670631,
  "ng-st": 0.6306228373702423,
  nt_: 0.6318211702827088,
  _2: 0.6359557763178978,
  "--f": 0.6410635644198188,
  gs: 0.6452566514377855,
  rte: 0.6489197530864198,
  end: 0.6511679909363306,
  hb: 0.655328798185941,
  sid: 0.6571548615244563,
  rch: 0.658685150178534,
  " icon": 0.6592884798013003,
  dge: 0.6633010946965671,
  eh: 0.6655124653739614,
  les: 0.6694214876033057,
  ___: 0.6694214876033057,
  old: 0.6824196597353496,
  " icon-": 0.6865306122448979,
  "r-n": 0.6944444444444443,
  "-flex": 0.7019722425127832,
  "-na": 0.7040560179680274,
  oar: 0.7056000000000001,
  arc: 0.710408163265306,
  v_: 0.7137336504161713,
  abl: 0.7179651535458306,
  icon_: 0.7192757570902101,
  __item: 0.731148918294476,
  nco: 0.7346938775510206,
  das: 0.7439062500000001,
  ent_: 0.7532929868280528,
  ngs: 0.7561436672967865,
  ome: 0.7596161939230707,
  content_: 0.765625,
  fil: 0.7686245074122724,
  "k-icon": 0.7689940828402366,
  ash: 0.7709696609161212,
  "-header-": 0.7735520394832343,
  ncont: 0.7735520394832343,
  s_: 0.7785467128027681,
  "-pro": 0.7815584961142615,
  ava: 0.7901234567901234,
  _cl: 0.7901234567901234,
  "r-na": 0.7980444444444444,
  tab: 0.80420395421436,
  incont: 0.8053911900065744,
  eba: 0.8137806249694362,
  lte: 0.8185941043083899,
  hbo: 0.8239053254437871,
  s1: 0.8264462809917357,
  je: 0.8418535444786908,
  "k-a": 0.8423719271908424,
  ebar: 0.8463999999999998,
  nda: 0.8511550468262228,
  "on--f": 0.8520710059171599,
  __cls1: 0.884717184589746,
  "board-": 0.8889795918367347,
  "button--f": 0.8889795918367347,
  deb: 0.8975069252077563,
  ject: 0.9025,
  oj: 0.9111570247933886,
  "-ta": 0.9140200458881776,
  styles: 0.9158284194704591,
  gen: 0.9194970913867518,
  "menu-": 0.9216,
  home: 0.9268546738165965,
  s__: 0.9285950413223141,
  "sidebar-": 0.9411895745154821,
  t_c: 0.9420415224913496,
  stic: 0.9428691451375764,
  ncontent: 0.9466764061358657,
  oje: 0.9506250000000002,
  fk: 0.9749226283473814,
  tis: 1.0,
  avatar: 1.0,
  hot: 1.0,
  roje: 1.0,
  "-nav_": 1.0,
  maincont: 1.0,
  incontent: 1.0,
  es_: 1.0,
  nav__: 1.0,
  agen: 1.0,
  enda: 1.0,
  "--fk": 1.0,
  "fk-": 1.0,
  gend: 1.0
};

// count each attribute/identifier at most this often
const attrLimit = 12;
const identLimit = 12;

const substrings = Object.keys(scores);
let attributes = {};
const values = fs
  .readFileSync("identsUniq3.json", { encoding: "utf-8" })
  .split("\n")
  .filter(v => v.length > 0)
  .map(v => JSON.parse(v));
for (const value of values) {
  value.scores = Array.from(new Uint8Array(substrings.length));
  for (const ident of value.identList) {
    const matching = substrings.filter(s => ident.includes(s));
    if (matching.length == 0) continue;
    for (const m of matching) {
      const v = substrings.indexOf(m);
      if (value.scores[v] >= identLimit) continue;
      if (!value.scores[v]) value.scores[v] = 1;
      else value.scores[v] += 1;
    }
  }
  value.attributes.forEach(v => (attributes[v] = attributes[v] ? attributes[v] + 1 : 1));
}

// find 100 most common attributes
attributes = Object.keys(attributes)
  .sort((a, b) => attributes[b] - attributes[a])
  .slice(0, 100);
for (const value of values) {
  value.attributeScores = Array.from(new Uint8Array(attributes.length));
  for (const attribute of value.attributes) {
    const matching = attributes.filter(s => attribute == s);
    if (matching.length == 0) continue;
    for (const m of matching) {
      const v = attributes.indexOf(m);
      if (value.attributeScores[v] >= attrLimit) continue;
      if (!value.attributeScores[v]) value.attributeScores[v] = 1;
      else value.attributeScores[v] += 1;
    }
  }
  value.attrMax = Math.max(1, Math.max(...value.attributeScores));
  console.log("attrMax", value.attrMax);
}

console.log(attributes);
console.log(values[0]);

const input = values.map(value => ({
  output: [value.loggedIn],
  input: value.scores.map(v => v / identLimit).concat(value.attributeScores.map(v => v / attrLimit))
}));

console.log(input[0]);

const config = {
  hiddenLayers: [32, 64, 16, 4], // hidden layers allow the net to detect page types like "empty", "dashboard", "loginpage", etc.
  // experimentally, four hidden layers perform better than one. Layer sizes are a compromise to keep output file size acceptable
  activation: "tanh" // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
};

const trainingOptions = {
  iterations: 500,
  log: details => console.log(details),
  errorThresh: 0.001,
  learningRate: 0.01
};

// [32, 8, 4] 500 0.01
// {
//   total: 5065,
//   truePos: 791,
//   trueNeg: 4182,
//   falsePos: 57,
//   falseNeg: 35,
//   precision: 0.9327830188679245,
//   recall: 0.9576271186440678,
//   accuracy: 0.9818361303060217,
//   testSize: 1013,
//   trainSize: 4052
// } 270

// [32, 32, 16, 8] 500 0.01
// {
//   total: 5065,
//   truePos: 782,
//   trueNeg: 4194,
//   falsePos: 45,
//   falseNeg: 44,
//   precision: 0.9455864570737605,
//   recall: 0.9467312348668281,
//   accuracy: 0.9824284304047384,
//   testSize: 1013,
//   trainSize: 4052
// } 291

const crossValidate = new brain.CrossValidate(brain.NeuralNetwork, config);

const stats = crossValidate.train(input, trainingOptions, 5);
console.log(stats);
const networkDef = crossValidate.toNeuralNetwork().toJSON();

const places = 6;

console.log("json", JSON.stringify(networkDef).length / 1024);
console.log(
  "json trunc 8",
  JSON.stringify(networkDef, function (key, value) {
    // limit precision of floats
    if (typeof value === "number") {
      return parseFloat(value.toFixed(8));
    }
    return value;
  }).length / 1024
);
console.log(
  "json trunc 6",
  JSON.stringify(networkDef, function (key, value) {
    // limit precision of floats
    if (typeof value === "number") {
      return parseFloat(value.toFixed(6));
    }
    return value;
  }).length / 1024
);
console.log("bson", BSON.serialize(networkDef).byteLength / 1024);
console.log(
  "bson base64",
  Buffer.from(BSON.serialize(networkDef)).toString("base64").length / 1024
);
console.log("bson hex", Buffer.from(BSON.serialize(networkDef)).toString("hex").length / 1024);

console.log(
  "equal",
  JSON.stringify(BSON.deserialize(BSON.serialize(networkDef))) == JSON.stringify(networkDef)
);

console.log(stats.stats);

// json8:        90kb
// json6:        77kb 270kb
// bson base64:  86kb
// bson base64:  81kb

fs.writeFileSync(
  "src/react/components/loginDetectionNet.ts",
  `
// this file is autogenerated
// @ts-nocheck
/* eslint-disable */

export const substrings = ${JSON.stringify(substrings)};
export const attributes = ${JSON.stringify(attributes)};
export const networkDef = ${JSON.stringify(networkDef, function (key, value) {
    // limit precision of floats
    if (typeof value === "number") {
      return parseFloat(value.toFixed(6));
    }
    return value;
  })};
`
);
