const micromatch = require('micromatch');


module.exports = {

  // Target TYPESCRIPT files
  '!(*spec|*mock).ts': files => {
    const fileList = removeDirectories(files);

    return [
      // `yarn run lint:tslint:fix ${fileList}`,
      `eslint --config .eslintrc.js --fix ${fileList}`,
      `git add ${fileList}`,
    ];
  },

  // Target SCSS files
  '!(*.spec).scss': files => {
    const fileList = removeDirectories(files);

    return [
      `yarn run lint:scss ${fileList}`,
      `git add ${fileList}`,
    ];
  },

};


/**
 * Function to remove any testing or demo files and return a string containing all file names
 *
 * @param files
 * @returns fileNames
 */
function removeDirectories(files) {
  const match = micromatch.not(files, [
    '**/testing/**',
    '**/demo/**',
  ]);
  return match.join(' ');
}
