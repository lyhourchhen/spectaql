#!/usr/bin/env node

var program = require('commander'),
  package = require('../package.json'),
  spectaql = require('../app')

//
//= Process CLI input

program.version(package.version)
  .usage('[options] <config.yml>')
  .description(package.description)
  .option('-C, --disable-css', 'omit CSS generation (default: false)')
  .option('-c, --css-build-mode <mode>', 'full: build with very opinionated css; basic: build with minimal layout-focused css (default: full)', String)
  .option('-J, --disable-js', 'omit JavaScript generation (default: false)')

  // This option lets you build a minimal version of the documentation without the HTML `<body>` tags, so you can embed
  // SpectaQL into your own website template.
  .option('-e, --embeddable', 'omit the HTML <body/> and generate the documentation content only (default: false)')

  .option('-1, --one-file', 'Embed all resources (CSS and JS) into the same file (default: false)')
  .option('-d, --development-mode', 'start HTTP server with the file watcher (default: false)')
  .option('-D, --development-mode-live', 'start HTTP server with the file watcher and live reload (default: false)')
  .option('-s, --start-server', 'start the HTTP server without any development features')
  .option('-p, --port <port>', 'the port number for the HTTP server to listen on (default: 4400)', Number)
  .option('-P, --port-live <port>', 'the port number for the live reload to listen on (default: 4401)', Number)
  .option('-t, --target-dir <dir>', 'the target build directory (default: public)', String)

  // This option specifies where the generated documentation HTML files will be output.
  .option('-f, --target-file <file>', 'the target build HTML file (default: index.html)', String)

  // This option overrides the default directory which contains all the Handlebars templates, SCSS, and JavaScript
  // source files. This option is useful if you've copied the contents of `app` to a remote location or a separate
  // repo and customized it. Probably not something you need to use if you have cloned/forked the repo and customized
  // it
  .option('-a, --app-dir <dir>', 'the application source directory (default: app)', String)

  .option('--logo-file <file>', 'specify a custom logo file (default: null)', String)
  .option('--no-logo-file', 'do not use a custom logo file, overriding what may be in the config')

  .option('--favicon-file <file>', 'specify a custom favicon file (default: null)', String)
  .option('--no-favicon-file', 'do not use a custom favicon file, overriding what may be in the config')

  .option('--schema-file <file>', 'specify a txt file that contains a GraphQL Schema Definition written in SDL to be used instead of an Introspection Query call (default: none)', String)
  .option('--introspection-url <url>', 'specify a URL for an Introspection Query(default: none)', String)
  .option('--introspection-file <file>', 'specify a file that contains an Introspection Query response (default: none)', String)
  .option('--introspection-metadata-file <file>', 'specify a file that contains metadata to be added to the Introspection Query response (default: none)', String)
  .option('--dynamic-examples-processing-module <file>', 'specify a JS module that will dynamically generate schema examples (default: /customizations/examples', String)

  .option('-g, --grunt-config-file <file>', 'specify a custom Grunt configuration file (default: app/lib/gruntConfig.js)', String)
  .option('-H, --header <header>', 'specify a custom auth token for the header (default: none)')
  .option('-q, --quiet', 'Silence the output from the generator (default: false)')
  // .option('-f, --spec-file <file>', 'the input OpenAPI/Swagger spec file (default: test/fixtures/petstore.json)', String, 'test/fixtures/petstore.json')
  .parse(process.argv)

// Show help if no specfile or options are specified
if (program.args.length < 1) { // && program.rawArgs.length < 1
  program.help()
}

program.specFile = program.args[0]; // || path.resolve(root, 'test/fixtures/cheese.json')

// Run the main app with parsed options
spectaql(program)
