const truthy = v => {
  return !!v && (typeof v !== 'string' || v.toLowerCase() !== 'false');
};

module.exports = {
  templates: './__hygen__',
  helpers: {
    truthy,
  },
};
