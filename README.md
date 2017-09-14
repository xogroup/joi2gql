# vodou
Easily convert [Joi](https://github.com/hapijs/joi/) schemas into GraphQL data types.

## Installation 
```Text
npm install --save xo-joiql
```

## Usage
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

const config = {
    name: 'Data Type',
    args: {
        id: Joi.string().guid()
    },
    resolve: (root, args) => {
        /* Some resolver logic */
    }
};

const GraphQLDataType = Vodou.transmuteType(joiSchema, config);
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
