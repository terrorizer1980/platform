const execDependencyGraph = require("../src/tools/execDependencyGraph");

main();

function main() {
  const options = parseArgs();
  const printVerboseResults = options.mode === "FULL";
  const runOptions = {printVerboseResults};
  const tasks = makeTasks(options.mode);
  execDependencyGraph(tasks, runOptions).then(({success}) => {
    process.exitCode = success ? 0 : 1;
  });
}

function parseArgs() {
  const options = {mode: "BASIC"};
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg === "--full") {
      options.mode = "FULL";
    } else {
      throw new Error("unknown argument: " + JSON.stringify(arg));
    }
  }
  return options;
}

function makeTasks(mode) {
  const basicTasks = [
    {
      id: "unit tests",
      cmd: ["yarn", "run", "unit"],
      deps: [],
    },
    {
      id: "lint",
      cmd: ["yarn", "run", "lint"],
      deps: [],
    },
    {
      id: "prettier",
      cmd: ["yarn", "run", "check-prettier"],
      deps: [],
    }
  ];
  const extraTasks = [
  ];
  switch (mode) {
    case "BASIC":
      return basicTasks;
    case "FULL":
      return [].concat(basicTasks, extraTasks);
    default:
      throw new Error(mode);
  }
}
