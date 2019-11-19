# JavaScript object parsing and validation
[![Build Status](https://travis-ci.org/AIRTucha/path2ct.svg?branch=master)](https://travis-ci.org/AIRTucha/validolum)[![Coverage Status](https://coveralls.io/repos/github/AIRTucha/path2ct/badge.svg?branch=master)](https://coveralls.io/github/AIRTucha/validolum?branch=master)
## Get started 

The package is available via npm. It has to be installed as a local dependency:

    npm install validolum

It's a DSL for parsing and validation of JavaScript objects. It some sense, it is an attempt to create a typesafe replacement for JSONSchema.

### Usage
The most straightforward approach for verification is presented in the following listening. *verify* function is called with two arguments:

 * A first argument is an object replicates the structure of expected data, but instead of real values, properties contain function responsible for parsing of the values. There are several predefined validation and parsing functions, but it is also possible to define a custom one. It should satisfy following signature *(value: I) => Result<O, string>*, where *I* is input type, *O* is output type and *Result* is a container for monadic error handling from a package called *[amonad](npmjs.com/package/amonad)*. 
 * A second argument is an object which has to follow provided parsing schema. 

 The function is also provided with an optional type argument, which describes a type of expected output. It is optional since, in most cases, it can be inferred automatically.

 A presented example will be successfully verified and will return *{ value: 2 }* as a result.

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

In the following case, the value provided for verification does not satisfy expectations. Therefore the function will throw an exception with a detailed description of the detected issue.

```typescript
const verificationResult = verify<{ value: number }>(
  {
    value: num
  },
  {
  }
)
// Should throw an Error with an explanation of problem like:
// "Key value is not validated due to: Value is not number"
```

The function is also capable of parsing, so it can attempt to transform data according to our expectations. *float* is capable of turning a string into a floating number. Since the output type of parsing does not match the type of input anymore, it might be required to provide a second type of argument. It describes a type of input value.

The execution will be successful with *{ value: 3.1415 }* as a result.

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

The API also contains a special version of verification function, which is capable of handling errors in monadic style. It is possible to learn more about the approach to deal with mistakes in documentation to *[amonad](npmjs.com/package/amonad)*. Briefly, it returns output wrapped inside *Result* object, which in some sense similar to *Promise*. Correctly, validated value is going to be wrapped by *Success*, while an error is going to return *Failure*. This technique allows the library to avoid throwing exceptions.

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

*maybeVerify* has another remarkable ability, it can be partially applied. In this case, it caches provided schema inside of new function, which can be passed around and used for verification of multiple objects.

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

The function produced as a result of *maybeVerify*'s partial application can also be used as a part of the schema. It allows parsing of nested objects.

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

The last example presents the most real-life scenario, which utilizes all of the previously explained techniques. Firstly, it is a sizeable multi-property schema with a nested object. It was already mentioned that it is possible to create a custom function compatible with the schema. There is a custom type for the representation of *City*, verification of the type is done by the creation of *city* function, which can recognize if provided string might be considered as valid *City*. The function is used as part of *address* schema, which is after that is used as the nested value inside of the main schema.

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

The package consists of two parts: verification functions and functions, which can be used as part of the schema.

### verify()

Basic verify function expects two arguments: 

  * The first argument is an object which describes the structure of expected values. The object has similar properties, but actual values are replaced with functions responsible for their validation or even parsing.
  * The second value is an object which expects to be verified or parsed.

It also accepts two type arguments, the first one represents an output type, while input is meant for input type. By default, an input type is defined based on an output type as an object with the properties of the same kind by with the possibility to be nullable. Input and output types are also reflected in types of parsing functions accepted by the schema. Schema, as well as the output value, contain only properties that appear to be in both of the provided type arguments.

The expected result of the execution is a parsed, and correctly types object. Otherwise, the function will throw an exception with a detailed explanation of the mistake.

```typescript
export function verify<O extends Value, I extends Value = Possible<O>>(
  parser: Schema<I, O>, 
  value: I
): Intersection<O, I>
```

### maybeVerify()

It is a special version of *verify* function modified for handling errors in a monadic way. The function is similar in all other ways.

```typescript
export function maybeVerify<O extends Value, I extends Value = Possible<O>>(
  parser: Schema<I, O>,
  value: I
): Result<Intersection<O, I>, string>
```

Curred version of *maybeVerify* can be used for cached of the schema or the creation of custom parsing function for a schema with nested objects.

```typescript
export function maybeVerify<O extends Value, I extends Value = Possible<O>>(
  parser: Schema<I, O>
): (value?: I) => Result<Intersection<O, I>, string>
```

### Parsing and verification functions

The following function can be used as part of the parsing schema.

#### numeric

There are three functions for the parsing of numeric values. *num* function is mainly used for verification of values, which expected to be numeric. It is meant for verification that numeric property is defined and that it is indeed number.

```typescript
export const num = (value?: number): Result<number, string>
```

*float* function is more targeted on the extraction of floating numbers out of strings.

```typescript
export const float = (value: string): Result<number, string>
```

*int* does the same thing, but only for integer.

```typescript
export const int = (value: string): Result<number, string> 
```

#### strings

Strings are the most common type of raw data. *str* function can verify that the value is really string and that it is defined.

```typescript
export const str = (value?: string): Result<string, string> 
```

#### boolean

There is no build-in way to parse boolean. Therefore function is capable of validating if the provided value is boolean or string with correspondent value. Strings are going to be converted accordingly.

```typescript
export const bool = (value?: boolean | string): Result<boolean, string>
```

#### object

An object can be detected by *obj* function. Unfortunately, the function can not provide any other additional information except the fact that the value is an object of unknown shape.

```typescript
export const obj = (value?: object): Result<object, string>
```

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