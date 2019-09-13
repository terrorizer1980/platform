const replace = require('replace-in-file');
const options = {
  files: './dist/index.html',
  from: [/href="(.*?)"/g, /src="(.*?)"/g],
  to: (match) => `${match.replace(/.$/,"")}?q=${Date.now()}"`,
};
replace.sync(options);
