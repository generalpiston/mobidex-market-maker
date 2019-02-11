import * as nconf from 'nconf';
import * as path from 'path';

import DEFAULTS from './default';

nconf
  .argv()
  .env({ separator: '__' })
  .file(
    process.env.CONFIG_FILE || path.join(__dirname, '..', '..', 'config.json')
  )
  .defaults(DEFAULTS);

export default nconf;
