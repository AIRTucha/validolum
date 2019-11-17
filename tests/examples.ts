import { expect } from 'chai'
import { Success, Failure, Result } from 'amonad'
import { maybeVerify, num, str, bool, verify, float, int, obj } from '../src/index'
import { stringify } from 'querystring'

const equal = <T>(v1: T, v2: T) => expect(v1).eql(v2)

// It is not part of test suits.
// It is just a collection of examples used in documentation.
// Examples are written in a form of tests to be verify their correctness.

describe("examples", () => {
  it("Simple validation", () => {
    const verificationResult = verify<{ value: number }>(
      {
        value: num
      },
      {
        value: 2
      }
    )

    equal(
      verificationResult,
      { value: 2 }
    )
  })

  it("Simple parsing", () => {
    const verificationResult = verify<{ value: number }, { value: string }>(
      {
        value: float
      },
      {
        value: "3.1415"
      }
    )

    equal(
      verificationResult,
      { value: 3.1415 }
    )
  })

  it("Monadic API", () => {
    const verificationResult = maybeVerify(
      {
        value: num
      },
      {
        value: 2
      }
    )

    equal(
      verificationResult,
      Success({ value: 2 })
    )
  })

  it("Curred Monadic API", () => {
    const verificationResult = maybeVerify<{ value: number }>(
      {
        value: num
      })({
        value: 2
      })

    equal(
      verificationResult,
      Success({ value: 2 })
    )
  })

  it("Nested parsing", () => {
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

    equal(
      verificationResult,
      {
        valueNested: {
          value: true
        }
      }
    )

  })

  it("Multiple properties parsing", () => {
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

    equal(
      verificationResult,
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
  })

})
