# JavaScript object parsing and validation
[![Build Status](https://travis-ci.org/AIRTucha/path2ct.svg?branch=master)](https://travis-ci.org/AIRTucha/validolum)[![Coverage Status](https://coveralls.io/repos/github/AIRTucha/path2ct/badge.svg?branch=master)](https://coveralls.io/github/AIRTucha/validolum?branch=master)
## Get started 

The package is available via npm. It has to be installed as a local dependency:

    npm install validolum

A DSL for parsing and validation of JavaScript objects. It some sense it is an attempt to create a typesafe replacement for JSONSchema.

### Usage

The simplest approach for verification is presented on following listening. *verify* function is called with two arguments:

 * the first argument is an object replicates structure of expected data, but instead of real values, properties contain function responsible for parsing of the values. There are several predefined validation and parsing function, but it is also possible to define a custom one. It should satisfy following signature *(value: I) => Result<O, string>*, where *I* is input type, *O* is output type and *Result* is a container for monadic error handling from a package called *[amonad](npmjs.com/package/amonad)*. 
 * The second argument is the object which has to follow provided parsing schema. 

 The function is also provided with optional type argument, which describes type of expected output. It is optional, since in most cases it can be inferred automatically.

 Presented example will be successfully verified and will return *{ value: 2 }* as result.

```typescript
    const verificationResult = verify<{ value: number }>(
      {
        value: num
      },
      {
        value: 2
      }
    )
    // verificationResult is { value: 2 }
```

In following case the value provided for verification does not satisfy expectation. Therefore the function will throw an exception with detailed description of detected issue.

```typescript
const verificationResult = verify<{ value: number }>(
  {
    value: num
  },
  {
  }
)
// Should throw an Error with explanation of problem like:
// "Key value is not validated due to: Value is not number"
```

The function is also capable of parsing, so it can attempt to transform data according to our expectations. *float* is capable of turning string into floating number. Since, output type of parsing does not match the type of input anymore, it might be required to provide a second type argument. It describes a type of input value.

The execution will be successfully with *{ value: 3.1415 }* as result.

```typescript
const verificationResult = verify<{ value: number }, { value: string }>(
  {
    value: float
  },
  {
    value: "3.1415"
  }
)
// verificationResult is { value: 3.1415 }
```

The API also contains a special version of verification function which is capable to handle error in monadic style. It is possible to learn more about the approach to deal with errors in documentation to *[amonad](npmjs.com/package/amonad)*. Briefly, it returns output wrapped inside *Result* object, which in some sense similar to *Promise*. Correctly, validated value is going to be wrapped by *Success*, while an error is going to return *Failure*. This technique allows library to avoid throwing of exceptions.

```typescript
const verificationResult = maybeVerify(
  {
    value: num
  },
  {
    value: 2
  }
)
// verificationResult Success({ value: 2 })
```

*maybeVerify* has another remarkable ability, it can be partially applied. In this case it caches provided schema inside of new function which can be passed around and used for verification of multiple objects.

```typescript
const myVerify = maybeVerify<{ value: number }>(
  {
    value: num
  })
const verificationResult = myVerify({
  value: 2
})
// verificationResult is Success({ value: 2 })
```

The function produced as result of *maybeVerify*'s partial application can also be used as a part of schema. It allows parsing of nested objects.

```typescript
type NestedValue = {
  value: boolean
}
const nestedObject = maybeVerify<NestedValue>({
  value: bool
})
const verificationResult = verify<{ valueNested: NestedValue }>(
  {
    valueNested: nestedObject
  },
  {
    valueNested: { value: true }
  }
)
// verificationResult is { valueNested: { value: true } }
```

The last example presents the most real life scenario, which utilizes all of previously explained techniques. Firstly, it is a large multi-property schema with a nested object. It was previously mentioned, that it is possible to create a custom function compatible with schema. There is a custom type for representation of *City*, verification of the type is done by creation of *city* function, which can recognize if provided string might be considered as valid *City*. The function is used as part of *address* schema, which is after that is used as nested value inside of the main schema.

```typescript
type City = "London" | "Manchester" | "Liverpool" | "Glasgow" | "Belfast"

type Address = {
  street: string,
  houseNumber: number,
  city: City
}
type RawAddress = {
  street?: string,
  houseNumber?: number,
  city?: string
}

function city(value?: string): Result<City, string> {
  switch (value) {
    case "London": return Success(value)
    case "Manchester": return Success(value)
    case "Liverpool": return Success(value)
    case "Glasgow": return Success(value)
    case "Belfast": return Success(value)
    default: return Failure("City is not recognized")
  }
}

const address = maybeVerify<Address, RawAddress>({
  street: str,
  houseNumber: num,
  city: city
})
const verificationResult = verify(
  {
    name: str,
    address: address,
    customField: obj,
  },
  {
    name: "Sherlock",
    address: {
      street: "Baker",
      houseNumber: 221,
      city: "London"
    },
    customField: {},
  }
)
// verificationResult is {
//   name: "Sherlock",
//   address: {
//     street: "Baker",
//     houseNumber: 221,
//     city: "London"
//   },
//   customField: {},
// }

```

## API

WIP

## Contribution guidelines

The project is based on *npm* eco-system. Therefore, development process is organized via *npm* scripts.

For installation of dependencies run

    npm install

To build application once

    npm run build

To build an application and watch for changes of files

    npm run build:w

To run tslint one time for CI

    npm run lint

To unit tests in a watching mode are performed by 

    npm run test
    
To execute a test suit single time

    npm run test:once

To execute a test suit single time with coverage report

    npm run test:c

To execute a test suit single time with coverage report submitted to *coveralls*

    npm run test:ci

Everybody is welcome to contribute and submit pull requests. Please communicate your ideas and suggestions via *issues*.