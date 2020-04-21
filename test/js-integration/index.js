const assert = require('assert')

describe("Javascript integration", function () {

  it("should work with default require statement", function () {
    const JsonToTS = require('../../dist/src/index')

    const expected = `
export class Cat {
  @Expose({name: 'name'})
  name: string;

}
export class RootObject {
  @Expose({name: 'cats'})
  @Type(serializeType(Cat))
  cats: Cat[];

  @Expose({name: 'favoriteNumber'})
  favoriteNumber: number;

  @Expose({name: 'favoriteWord'})
  favoriteWord: string;

  @Expose({name: 'myStringList'})
  myStringList: string[];

  @Expose({name: 'myAnyList1'})
  myAnyList1: (null | string)[];

  @Expose({name: 'myAnyList2'})
  myAnyList2: any[];

}`

    const json = {
      cats: [
        {name: 'Kittin'},
        {name: 'Mittin'},
      ],
      favoriteNumber: 42,
      favoriteWord: 'Hello',
      myStringList: ['Hello', 'World'],
      myAnyList1: [null, 'World'],
      myAnyList2: [],
      myStringList: ['Hello', 'World'],
    }

    const output = JsonToTS(json)
      .reduce((type1, type2) => {
        return `${type1}\n${type2}`
      })
      .trim()
      console.log('>>>>>>');
      console.log(output);
      console.log('>>>>>>');
    assert.strictEqual(output, expected.trim())
  })

})
