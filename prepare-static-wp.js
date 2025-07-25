const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')
const fsExtra = require('fs-extra')

const root_folder = './out'
const _extenstions = ['*.html','*.js','*.css']

console.log('Prepare engine')
const dev_prefix = '' //'/wallet'

fsExtra.move(root_folder + '/_next/', root_folder + '/engine/', err => {
  if(err) return console.error(err);
  console.log('Make engine success!');

  console.log('>>> Fix paths')
  _extenstions.forEach((ext) => {
    glob(root_folder + '/**/' + ext, (err, files) => {
      if (err) {
        console.log('Error', err)
      } else {
        files.forEach((file) => {
          const content = readFileSync(file, 'utf8');

          let newContent = content.replaceAll('/_NEXT_GEN_APP', '');
          newContent = newContent.replaceAll('/_next/',`${dev_prefix}/wp-content/plugins/Web3CrashGame/vendor/engine/`);
          newContent = newContent.replaceAll('"./assets/', `"${dev_prefix}/wp-content/plugins/Web3CrashGame/vendor/assets/`);
          newContent = newContent.replaceAll('"/assets/', `"${dev_prefix}/wp-content/plugins/Web3CrashGame/vendor/assets/`);

          console.log(file);
          writeFileSync(file, newContent);
        })
      }
    })
  })
})


