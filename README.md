# vodou
Easily convert [Joi](https://github.com/hapijs/joi/) schemas into GraphQL data types.

## Installation 
```Text
npm install --save xo-joiql
```

## Example
```js
const Joi   = require('joi');
const Vodou = require('vodou');

const joiSchema = object().keys({
    key1: Joi.string(),
    key2: Joi.number().integer(),
    key3: Joi.array().items(Joi.string()),
    key4: Joi.object().keys({
        subKey1: Joi.string(),
        subKey2: Joi.number()
    })
});

const GraphQLDataType = Vodou.transmuteType(joiSchema);
```

## Usage
```js
const {
    Server
} = require('hapi');
const {
    graphqlHapi 
} = require('apollo-server-hapi');
const Joi   = require('joi');
const Vodou = require('vodou');

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

const Song = Vodou.transmuteType(songSchema, config);
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
            schema: Vodou.transmuteSchema( rootGQLSchema )
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
See the detailed [API](https://github.com/Samueljoli/xo-joiql/blob/master/API.md) reference.

## Contributing

We love community and contributions! Please check out our [guidelines](http://github.com/xogroup) before making any PRs.

## Setting up for development

Getting yourself setup and bootstrapped is easy.  Use the following commands after you clone down.

```
npm install && npm test
```

## GraphQL types not yet supported.

- `GraphQLInterfaceType`
- `GraphQLUnionType`
