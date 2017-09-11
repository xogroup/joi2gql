# vodou
Easily convert [Joi](https://github.com/hapijs/joi/) schemas into GraphQL data types.

## Installation 
```Text
npm install --save xo-joiql
```

## Usage
```js
const {
 object(),
 string(),
 number().
 array(),
} = require('joi');
const Vodou = require('vodou');

const joiSchema = object().keys({
 key1: string(),
 key2: number().integer(),
 key3: array().items(string());
 key4: object().keys({
  subKey1: string(),
  subKey2: number()
 })
});

const config = {
 name: 'Data Type',
 args: { id: string().guid() },
 resolve: (root, args) => {
  /* Some resolver logic */
 }
};

const GraphQLDataType = Vodou.transmuteType(joiSchema, config);
```

## API
See the detailed [API](https://github.com/Samueljoli/xo-joiql/blob/master/API.md) reference.

# Development Usage

## Install Dependencies
Install the dependencies based on package.json
```Text
npm i
```

## Test Project
Run tests
```Text
npm t
```
