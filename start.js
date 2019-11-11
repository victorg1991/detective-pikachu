const browserSync = require('browser-sync');
const enquirer = require('enquirer');
const glob = require('glob');

new enquirer.Select({
  name: 'project',
  message: 'Select a project',
  choices: glob
    .sync('*/index.html')
    .map((pathName) => pathName.replace('/index.html', '')),
})
  .run()
  .then((project) => {
    const bs = browserSync.create();
    bs.init({
      files: [`${project}/**/*`],
      server: `./${project}`,
    });
  });
