const DEBUG = process.argv.indexOf('--release') === -1;

export const hostName = DEBUG ? 'localhost' : 'home.hoomanlogic.com';
export const port = DEBUG ? 8081 : 80;
export const socketPort = DEBUG ? 8080 : 8181;
