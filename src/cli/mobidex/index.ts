import * as commander from 'commander';

commander
  .command('ethereum <subcommand>', 'Interact with the ethereum blockchain')
  .command('0x <subcommand>', 'Interact with the 0x contracts')
  .command('kyber <subcommand>', 'Interact with the kyber contracts');

commander.parse(process.argv);
