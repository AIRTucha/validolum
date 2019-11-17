# JavaScript object parsing and validation
[![Build Status](https://travis-ci.org/AIRTucha/path2ct.svg?branch=master)](https://travis-ci.org/AIRTucha/validolum)[![Coverage Status](https://coveralls.io/repos/github/AIRTucha/path2ct/badge.svg?branch=master)](https://coveralls.io/github/AIRTucha/validolum?branch=master)
## Get started 

The package is available via npm. It has to be installed as a local dependency:

    npm install validolum

A DSL for parsing and validation of JavaScript objects.

### Examples

WIP

```typescript
    const verificationResult = verify<{ value: number }>(
      {
        value: num
      },
      {
        value: 2
      }
    )
```

```typescript
    const verificationResult = verify<{ value: number }, { value: string }>(
      {
        value: float
      },
      {
        value: "3.1415"
      }
    )
```

```typescript
    const verificationResult = maybeVerify(
      {
        value: num
      },
      {
        value: 2
      }
    )
```

```typescript
    const verificationResult = maybeVerify<{ value: number }>(
      {
        value: num
      })({
        value: 2
      })
```

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
```

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