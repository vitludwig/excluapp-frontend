# ExclubApp

Web application for administration of simple cashless transactions among friends. Sortiment inventory, user statistics, payment calculation, multiple events etc. 

## Instalation

```bash
pnpm install
```

If you don't have pnpm installed, run this first
```bash
npm i pnpm -g
```

## Running in production

```bash
git pull
pnpm install
ng build
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Test generator

`ngentest ./<path-to-component.component.ts> --framework karma -c ./node_modules/ngentest/ngentest.config.js`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
