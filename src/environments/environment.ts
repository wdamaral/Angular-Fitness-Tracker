// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyBAqYx2f3XRBFX9oAEd8VmSAFeXR6yhk4Q',
    authDomain: 'angular5-fitness-tracker.firebaseapp.com',
    databaseURL: 'https://angular5-fitness-tracker.firebaseio.com',
    projectId: 'angular5-fitness-tracker',
    storageBucket: 'angular5-fitness-tracker.appspot.com',
    messagingSenderId: '173823083445'
  }
};
