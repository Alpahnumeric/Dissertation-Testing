var bayesjs = require("bayesjs");
//import { infer, inferences } from 'bayesjs';

var network3 = {
  "CLOUDY": {
    id: "CLOUDY",
    states: ["T","F"],
    parents: [],
    cpt: {T: 0.5, F: 0.5},
  },
  "RAIN": {
      id: 'RAIN',
      states: ['T', 'F'],
      parents: ["CLOUDY"],
      cpt: [
        { when: { CLOUDY: 'T' }, then: { T: 0.8, F: 0.2}},
        { when: { CLOUDY: 'F' }, then: { T: 0.2, F: 0.8}},
    ],
  },
  "SPRINKLER": {
      id: 'SPRINKLER',
      states: ['T', 'F'],
      parents: ['CLOUDY'],
      cpt: [
          { when: { CLOUDY: 'T' }, then: { T: 0.1, F: 0.9 } },
          { when: { CLOUDY: 'F' }, then: { T: 0.5, F: 0.5 } },
      ],
  }, 
  "GRASS_WET": {
      id: 'GRASS_WET',
      states: ['T', 'F'],
      parents: ['RAIN', 'SPRINKLER'],
      cpt: [
          { when: { RAIN: 'T', SPRINKLER: 'T' }, then: { T: 0.99, F: 0.01 } },
          { when: { RAIN: 'T', SPRINKLER: 'F' }, then: { T: 0.9, F: 0.1 } },
          { when: { RAIN: 'F', SPRINKLER: 'T' }, then: { T: 0.9, F: 0.1 } },
          { when: { RAIN: 'F', SPRINKLER: 'F' }, then: { T: 0.0, F: 1.0 } },
      ],
  }
}

var network2 = {
  "RAIN": {
      id: 'RAIN',
      states: ['T', 'F'],
      parents: [],
      cpt: { T: 0.2, F: 0.8 },
  },
  "SPRINKLER": {
      id: 'SPRINKLER',
      states: ['T', 'F'],
      parents: ['RAIN'],
      cpt: [
          { when: { RAIN: 'T' }, then: { T: 0.01, F: 0.99 } },
          { when: { RAIN: 'F' }, then: { T: 0.4, F: 0.6 } },
      ],
  }, 
  "GRASS_WET": {
      id: 'GRASS_WET',
      states: ['T', 'F'],
      parents: ['RAIN', 'SPRINKLER'],
      cpt: [
          { when: { RAIN: 'T', SPRINKLER: 'T' }, then: { T: 0.99, F: 0.01 } },
          { when: { RAIN: 'T', SPRINKLER: 'F' }, then: { T: 0.8, F: 0.2 } },
          { when: { RAIN: 'F', SPRINKLER: 'T' }, then: { T: 0.9, F: 0.1 } },
          { when: { RAIN: 'F', SPRINKLER: 'F' }, then: { T: 0, F: 1 } },
      ],
  }
}

const network = {
    'Node 1': {
      id: 'Node 1',
      states: ['True', 'False'],
      parents: [],
      cpt: { True: 0.5, False: 0.5 },
    },
    'Node 2': {
      id: 'Node 2',
      states: ['True', 'False'],
      parents: [],
      cpt: { True: 0.5, False: 0.5 },
    },
    'Node 3': {
      id: 'Node 3',
      states: ['True', 'False'],
      parents: ['Node 2', 'Node 1'],
      cpt: [
        {
          when: { 'Node 2': 'True', 'Node 1': 'True' },
          then: { True: 0.5, False: 0.5 },
        },
        {
          when: { 'Node 2': 'False', 'Node 1': 'True' },
          then: { True: 0.5, False: 0.5 },
        },
        {
          when: { 'Node 2': 'True', 'Node 1': 'False' },
          then: { True: 0.5, False: 0.5 },
        },
        {
          when: { 'Node 2': 'False', 'Node 1': 'False' },
          then: { True: 0.5, False: 0.5 },
        },
      ],
    },
  };
  
  const given = { 'Node 1': 'True' }
  const given2 = {}

  
 // var hello = bayesjs.inferAll(network, given, { force: true });
  // {
  //   'Node 1': { True: 1, False: 0 },
  //   'Node 2': { True: 0.5, False: 0.5 },
  //   'Node 3': { True: 0.725, False: 0.275 }
  // }
 // console.log(hello);

 // var hello2 = bayesjs.inferAll(network2, given2, { force: true });
 // console.log(hello2);

  var hello3 = bayesjs.inferAll(network3, given2, { force: true });
  console.log(hello3)