const shapes = {
  // t shape
  't': {
    0: {
      matrix: [
        [1, 1, 1],
        [0, 1, 0]
      ],
      center: [0, 1]
    },
    1: {
      matrix: [
        [0, 1],
        [1, 1],
        [0, 1]
      ],
      center: [1, 1]
    },
    2: {
      matrix: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      center: [1, 1]
    },
    3: {
      matrix: [
        [1, 0],
        [1, 1],
        [1, 0]
      ],
      center: [1, 0]
    }
  },
  // L shape
  'l': {
    0: {
      matrix: [
        [1, 1, 1],
        [0, 0, 1]
      ],
      center: [0, 1]
    },
    1: {
      matrix: [
        [0, 1],
        [0, 1],
        [1, 1]
      ],
      center: [1, 1]
    },
    2: {
      matrix: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      center: [1, 1]
    },
    3: {
      matrix: [
        [1, 1],
        [1, 0],
        [1, 0]
      ],
      center: [1, 0]
    }
  },
  // i shape
  'i': {
    0: {
      matrix: [
        [1, 1, 1, 1]
      ],
      center: [0, 1]
    },
    1: {
      matrix: [
        [1],
        [1],
        [1],
        [1]
      ],
      center: [1, 0]
    }
  },
  // o shape
  'o': {
    0: {
      matrix: [
        [1, 1],
        [1, 1]
      ],
      center: [0, 0]
    }
  },
  // j shape
  'j': {
    0: {
      matrix: [
        [1, 1, 1],
        [1, 0, 0]
      ],
      center: [0, 1]
    },
    1: {
      matrix: [
        [1, 1],
        [0, 1],
        [0, 1]
      ],
      center: [1, 1]
    },
    2: {
      matrix: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      center: [1, 1]
    },
    3: {
      matrix: [
        [1, 0],
        [1, 0],
        [1, 1]
      ],
      center: [1, 0]
    }
  },
  // z shape
  'z': {
    0: {
      matrix: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      center: [0, 1]
    },
    1: {
      matrix: [
        [0, 1],
        [1, 1],
        [1, 0]
      ],
      center: [1, 1]
    },
    2: {
      matrix: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      center: [1, 1]
    },
    3: {
      matrix: [
        [0, 1],
        [1, 1],
        [1, 0]
      ],
      center: [1, 0]
    }
  },
  // s left shape
  's': {
    0: {
      matrix: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      center: [0, 1]
    },
    1: {
      matrix: [
        [1, 0],
        [1, 1],
        [0, 1]
      ],
      center: [1, 1]
    },
    2: {
      matrix: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      center: [1, 1]
    },
    3: {
      matrix: [
        [1, 0],
        [1, 1],
        [0, 1]
      ],
      center: [1, 0]
    }
  }
}

export default shapes