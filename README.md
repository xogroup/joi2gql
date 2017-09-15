![alt text](http://i65.tinypic.com/28jwexe.png)

Easily convert [Joi](https://github.com/hapijs/joi/) schemas into GraphQL data types.

[![Build Status](https://travis-ci.org/xogroup/joi2ql.svg?branch=master)](https://travis-ci.org/xogroup/joi2ql)

Lead Mainter: [Samuel Joli](https://github.com/Samueljoli)

## Installation 
```Text
npm install --save joi2ql
```

## Example
```js
const Joi    = require('joi');
const Joi2QL = require('joi2ql');

const joiSchema = object().keys({
    key1: Joi.string(),
    key2: Joi.number().integer(),
    key3: Joi.array().items(Joi.string()),
    key4: Joi.object().keys({
        subKey1: Joi.string(),
        subKey2: Joi.number()
    })
});

const GraphQLDataType = Joi2QL.transmuteType(joiSchema);
```

## Usage
```js
const {
    Server
} = require('hapi');
const {
    graphqlHapi 
} = require('apollo-server-hapi');
const Joi    = require('joi');
const Joi2QL = require('joi2ql');

const port   = '3000';
const host   = 'localhost';
const server = new Server();

server.connection({ port, host });

const songSchema = Joi.object().keys({
    artist: Joi.string(),
    title : Joi.string(),
    length: Joi.number().integer(),
    lyrics: Joi.string()
});

const config = {
    name: 'Song',
    args: {
        id: Joi.number().integer()
    },
};

const Song = Joi2QL.transmuteType(songSchema, config);
const rootGQLSchema = {
    query: {
        song: Song
    }
};

server.register({
    register: graphqlHapi,
    options : {
        path          : '/graphql',
        graphqlOptions: {
            schema: Joi2QL.transmuteSchema( rootGQLSchema )
        }
    }
});

server.start(() => {
    if (err) {
        throw new Error(err);
    }
    
    console.log(`Entering the matrix on port: ${server.info.port}`
});
```

## API
See the detailed [API](https://github.com/xogroup/joi2ql/blob/master/API.md) reference.

## Contributing

We love community and contributions! Please check out our [guidelines](http://github.com/xogroup/joi2ql/blob/master/.github/CONTRIBUTING.md) before making any PRs.

## Setting up for development

Install dependencies and run test.

```
npm install && npm test
```

## GraphQL types not yet supported.

- `GraphQLInterfaceType`
- `GraphQLUnionType`
