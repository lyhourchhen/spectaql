const url = require('url')

const {
  loadSchemaFromSDLFile,
  introspectionResponseFromSchema,
  loadIntrospectionResponseFromFile,
  loadIntrospectionResponseFromUrl,
  jsonSchemaFromIntrospectionResponse,
  graphQLSchemaFromIntrospectionResponse,
} = require('./graphql-loaders')

const {
  addMetadataFromFile
} = require('./metadata-loaders')

const {
  augmentData,
} = require('./augmenters')

const composePaths = require('./compose-paths')

function errorThingDone ({ trying, done }) {
  const msg = `Cannot try to ${trying} while also having ${done}`
  throw new Error(msg)
}


module.exports = function(opts) {
  const {
    specData: spec,
    authHeader,
  } = opts

  const {
    introspection: introspectionOptions,
    introspection: {
      url: introspectionUrl,
      schemaFile,
      introspectionFile,
      metadataFile,
    },
    domains = [],
    servers = [],
    info,
    externalDocs,
    securityDefinitions,
  } = spec

  let done = false
  let introspectionResponse

  if (schemaFile) {
    const schema = loadSchemaFromSDLFile({ pathToFile: schemaFile })
    introspectionResponse = introspectionResponseFromSchema({ schema })
    done = 'loaded GraphQL SDL from file'
  }

  if (introspectionFile) {
    if (done) {
      errorThingDone({ trying: 'load Introspection from file', done })
    }
    introspectionResponse = loadIntrospectionResponseFromFile({ pathToFile: introspectionFile })
    done = 'loaded Introspection from file'
  }

  if (introspectionUrl) {
    if (done) {
      errorThingDone({ trying: 'load Introspection from URL', done })
    }

    introspectionResponse = loadIntrospectionResponseFromUrl({ authHeader, url: introspectionUrl })
    done = 'loaded via Introspection URL'
  }

  if (!done) {
    throw new Error('Must provide some way to get your schema')
  }

  if (!introspectionResponse) {
    throw new Error('No Introspection Query response')
  }

  if (metadataFile) {
    addMetadataFromFile({
      ...introspectionOptions,
      pathToFile: metadataFile,
      introspectionQueryResponse: introspectionResponse,
    })
  }

  const jsonSchema = jsonSchemaFromIntrospectionResponse(introspectionResponse)
  const graphQLSchema = graphQLSchemaFromIntrospectionResponse(introspectionResponse)

  augmentData({
    introspectionResponse,
    jsonSchema,
    graphQLSchema,
    introspectionOptions,
  })

  // Find the 1 marked Production. Or take the first one if there are any. Or use
  // the URL provided
  const urlToParse = (servers.find((server) => server.production === true) || servers[0] || {}).url ||
    introspectionUrl

  if (!urlToParse) {
    throw new Error('Must provide Introspection URL')
  }

  const {
    protocol,
    host,
    pathname,
  } = url.parse(urlToParse)

  const paths = composePaths({ domains, graphQLSchema, jsonSchema })

  // generate specification
  const swaggerSpec = {
    openapi: '3.0.0',
    info,
    servers,
    host,
    schemes: [ protocol.slice(0, -1) ],
    basePath: pathname,
    externalDocs,
    tags: domains.map((domain) => ({
      name: domain.name,
      description: domain.description,
      externalDocs: domain.externalDocs,
    })),
    paths,
    securityDefinitions,
    definitions: jsonSchema.definitions,
  }

  return swaggerSpec
}