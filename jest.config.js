module.exports = {
  "roots": [
    "./src"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "collectCoverageFrom": [
    "./**/*.{ts,tsx}"
  ],
  "coverageDirectory": "./coverage",
  "setupFiles": [
    "./config/setupJest.ts"
  ]
};
