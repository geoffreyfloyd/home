# Gnodes
Git + Node.js + Neural Networks = Evolving, Version-Controlled Data

## Build NodeGit dependency on Raspberry Pi
```
cd node_modules
cd nodegit
sudo npm install
sudo npm run rebuild
```

## Set up Config
When initializing a database connection via Gnodes.open(), a config object with the following shape needs to be passed:
```
{
    name: 'Joe Schmoe',
    email: 'joe.schmoe@gmail.com',
    // starts in /node_modules/gnodes/src when 
    // referenced in another project (ie. operator)
    repoPath: '../../../../tdb', 
    remoteUrl: 'https://github.com/myusername/mygitdb.git',
    uid: 'myusername',
    pwd: 'randomPassword',
};
```

## Set up Git Hook to auto-sync when committing manual changes
.git/hooks/post-commit
```
#!/bin/sh
git pull --rebase origin master
git push origin master
```
NOTE: Gnodes API syncs when commitChanges() is called.
