module.exports = packageName => {
  try {
    return Promise.resolve(require(`./mocks/${packageName}`));
  } catch (error) {
    return Promise.reject(new Error(`Package \`${packageName}\` doesn\'t exist`));
  }
};
