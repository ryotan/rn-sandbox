// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
module.exports = {
  prompt: ({prompter, args}) => {
    console.dir(args);
    return prompter.prompt([
      args.feature ?? {
        type: 'input',
        name: 'feature',
        message: 'Feature name',
      },
      args.name ?? {
        type: 'input',
        name: 'name',
        message: 'Error class name',
      },
      args.runtime ?? {
        type: 'input',
        name: 'runtime',
        result: false,
        skip: true,
      },
    ]);
  },
};
