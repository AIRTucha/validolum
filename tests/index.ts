import { expect } from 'chai'
import { Success, Failure } from 'amonad'
import { maybeVerify, num, str, bool, verify, float, int } from '../src/index'

const equal = <T>(v1: T, v2: T) => expect(v1).eql(v2)

describe("maybeValidate", () => {
  describe("correct", () => {
    describe("validation", () => {
      it("single property", () => {
        equal(
          maybeVerify<{ value: number }>({
            value: num
          })({
            value: 2
          }),
          Success({ value: 2 })
        )
      })

      it("multiple property", () => {
        equal(
          maybeVerify<{ value1: number, value2: string }>({
            value1: num,
            value2: str
          })({
            value1: 12,
            value2: "ok"
          }),
          Success({ value1: 12, value2: "ok" })
        )
      })

      it("nested", () => {
        type Value = { value2: boolean }
        const custom = maybeVerify<Value>({ value2: bool })
        equal(
          maybeVerify<{ value1: Value }>({
            value1: custom
          })({
            value1: { value2: true }
          }),
          Success({
            value1: { value2: true }
          })
        )
      })
    })

    describe("parsing", () => {
      it("single property", () => {
        equal(
          maybeVerify<{ value: number }, { value: string }>({
            value: float
          })({
            value: "2.1"
          }),
          Success({ value: 2.1 })
        )
      })

      it("multiple property", () => {
        equal(
          maybeVerify<{ value1: number, value2: boolean }, { value1: string, value2: string }>({
            value1: int,
            value2: bool
          })({
            value1: "12",
            value2: "true"
          }),
          Success({ value1: 12, value2: true })
        )
      })

      it("nested", () => {
        type Value<T> = { value2: T }
        const custom = maybeVerify<Value<boolean>, Value<string>>({ value2: bool })
        equal(
          maybeVerify<{ value1: Value<boolean> }, { value1: Value<string> }>({
            value1: custom
          })({
            value1: { value2: "false" }
          }),
          Success({
            value1: { value2: false }
          })
        )
      })
    })
  })

  describe("incorrect", () => {
    it("no value", () => {
      equal(
        maybeVerify<{ value: number }, any>({
          value: int
        })(),
        Failure("Object is undefined")
      )
    })

    it("single property", () => {
      equal(
        maybeVerify<{ value: number }, any>({
          value: int
        })({
          value: "ok"
        }),
        Failure("Key value is not validated due to: Value is not integer")
      )
    })

    it("multiple property", () => {
      equal(
        maybeVerify<{ value1: number, value2: string }, any>({
          value1: num,
          value2: str
        })({
          value1: 12,
          value2: true
        }),
        Failure("Key value2 is not validated due to: Value is not string")
      )
    })

    it("nested", () => {
      type Custom = { value2: boolean }
      const custom = maybeVerify<Custom>({ value2: bool })
      equal(
        maybeVerify<{ value1: Custom }, any>({
          value1: custom
        })({
          value1: { value2: "10" }
        }),
        Failure("Key value1 is not validated due to: Key value2 is not validated due to: Value is not boolean")
      )
    })
  })
})

describe("tryToValidate", () => {
  it("parse value", () => {
    equal(
      verify<{ value: number }, any>(
        {
          value: num
        },
        {
          value: 2
        }
      ),
      { value: 2 }
    )
  })

  it("throws correct error", () => {
    expect(
      () => verify<{ value: string }, any>(
        {
          value: str
        },
        {
          value: 2
        }
      )
    ).throw(Error, "Key value is not validated due to: Value is not string")
  })
})